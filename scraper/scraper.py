import os
import json
import re
import time
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables in scrapper/.env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel('gemini-3-flash-preview')
model = genai.GenerativeModel('gemini-2.5-flash-lite')

def get_hn_top_stories(limit=5):
    print("Fetching Hacker News top stories...")
    response = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json")
    story_ids = response.json()[:limit]
    
    stories = []
    for story_id in story_ids:
        story_res = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json")
        story = story_res.json()
        if story and 'url' in story:
            stories.append(story)
    return stories

def get_cisa_vulnerabilities(limit=3):
    """Fetch the latest actively exploited vulnerabilities from CISA."""
    print("Fetching CISA Known Exploited Vulnerabilities...")
    url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        vulnerabilities = data.get("vulnerabilities", [])
        
        vulnerabilities.sort(key=lambda x: x.get("dateAdded", ""), reverse=True)
        
        stories = []
        for vuln in vulnerabilities[:limit]:
            cve_id = vuln.get("cveID")
            stories.append({
                "title": f"🚨 {cve_id}: {vuln.get('vulnerabilityName')}",
                "url": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
                "text": vuln.get('shortDescription'), 
                "source": "CISA KEV"
            })
        return stories
    except Exception as e:
        print(f"Failed to fetch CISA data: {e}")
        return []

def scrape_article_text(url):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = " ".join([p.text for p in paragraphs])
        return text[:3000] 
    except Exception:
        return ""

def process_with_ai(title, text):
    prompt = f"""
    You are an AI assistant for a Senior Software Engineer.
    Analyze this article. 
    Title: {title}
    Text: {text}
    
    Provide a JSON response with exactly three keys:
    1. "summary": A concise 3-bullet point summary of the technical value.
    2. "score": An integer from 1 to 10 rating how relevant this is for a software engineer.
    3. "tags": An array of up to 3 short string tags categorizing the tech (e.g., ["React", "Security", "AWS", "System Design", "Python"]).
    
    Format strictly as raw JSON without markdown code blocks.
    """
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
        data = json.loads(clean_json)
        
        if "tags" not in data:
            data["tags"] = ["Tech News"]
            
        return data
    except Exception as e:
        print(f"AI Processing failed: {e}")
        return {"summary": "Could not generate summary.", "score": 5, "tags": ["Error"]}

def generate_embedding(text):
    """Convert text into a 768-dimensional vector array."""
    try:
        result = genai.embed_content(
            # model="models/text-embedding-004",
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        embedding = result.get('embedding')
        
        # 2. Safety Check 1: If it's a nested list, grab the first one
        if embedding and isinstance(embedding[0], list):
            embedding = embedding[0]
            
        # 3. Safety Check 2: If the SDK stitched multiple chunks together (e.g., 3072 dimensions)
        # We strictly slice it to the first 768 floats so it perfectly matches Supabase.
        if embedding and len(embedding) > 768:
            embedding = embedding[:768]
            
        return embedding
    except Exception as e:
        # print(f"Embedding failed: {e}")
        return None

def main():
    # 1. Gather raw data from all our sources
    hn_stories = get_hn_top_stories(limit=5)
    cisa_vulns = get_cisa_vulnerabilities(limit=3)
    
    # Standardize Hacker News data to match our pipeline structure
    for story in hn_stories:
        story['text'] = None 
        story['source'] = "Hacker News"

    # Combine all items into one master list
    all_items = hn_stories + cisa_vulns
    
    for item in all_items:
        print(f"Processing: {item['title']}")
        
        # 2. Check Database to avoid duplicates
        existing = supabase.table("articles").select("*").eq("url", item['url']).execute()
        if len(existing.data) > 0:
            print("Already exists in DB. Skipping.")
            continue
            
        # 3. Get the text (Scrape if HN, use provided text if CISA)
        article_text = item.get('text')
        if not article_text:
            article_text = scrape_article_text(item['url'])
            if not article_text:
                print("Could not extract text. Skipping.")
                continue
            
        # 4. AI Processing (Summarize, Score, Tag)
        ai_data = process_with_ai(item['title'], article_text)

        # 4.5 Generate Vector Embedding from the summary
        summary_text = ai_data.get('summary', '')
        embedding = generate_embedding(summary_text) if summary_text else None
        
        # 5. Save to Database
        record = {
            "title": item['title'],
            "url": item['url'],
            "summary": ai_data.get('summary'),
            "score": ai_data.get('score'),
            "tags": ai_data.get('tags'),
            "source": item['source'],
            "embedding": embedding
        }
        
        try:
            supabase.table("articles").insert(record).execute()
            # print(f"Saved with score {record['score']} and tags {record['tags']}!\n")
        except Exception as e:
            print(f"Database insert failed: {e}")
        
        print("Sleeping 5 seconds to respect API rate limits...")
        time.sleep(5)

if __name__ == "__main__":
    main()
    os._exit(0)