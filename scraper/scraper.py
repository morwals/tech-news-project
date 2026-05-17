import os
import json
import re
import time
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import datetime
from email.utils import parsedate_to_datetime 
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

def get_hn_top_stories(limit=10):
    print("Fetching Hacker News top stories...")
    try:
        response = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json", timeout=10)
        
        story_ids = response.json()[:limit * 3] 
        
        stories = []
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
        
        for story_id in story_ids:
            if len(stories) >= limit:
                break
                
            story_res = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json", timeout=5)
            story = story_res.json()
            
            if story and 'url' in story:
                hn_timestamp = story.get('time', time.time())
                pub_date = datetime.datetime.fromtimestamp(hn_timestamp, datetime.timezone.utc)
                
                if pub_date < cutoff_date:
                    print(f"Skipping old HN article: {story.get('title')} ({pub_date.strftime('%Y-%m-%d')})")
                    continue 
                    
                story['published_at'] = pub_date.isoformat()
                stories.append(story)
        return stories
    except Exception as e:
        print(f"HN fetch failed: {e}")
        return []

def get_rss_news(limit=5):
    """Fetch latest tech news from high-signal developer RSS feeds."""
    print("Fetching Dev.to and InfoQ RSS feeds...")
    feeds = [
        {"url": "https://dev.to/feed/", "source": "Dev.to"},
        {"url": "https://feed.infoq.com/", "source": "InfoQ"}
    ]
    
    stories = []
    cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)

    for feed in feeds:
        try:
            res = requests.get(feed["url"], timeout=10)
            soup = BeautifulSoup(res.content, 'xml') 
            items = soup.find_all('item')
            
            count = 0
            for item in items:
                if count >= limit:
                    break
                    
                title = item.title.text if item.title else "No Title"
                url = item.link.text if item.link else ""
                
                # Parse the published date safely
                pub_date_str = item.pubDate.text if item.pubDate else ""
                try:
                    pub_date = parsedate_to_datetime(pub_date_str)
                except:
                    pub_date = datetime.datetime.now(datetime.timezone.utc)
                
                # ⏩ THE FRESHNESS GATEWAY
                if pub_date < cutoff_date:
                    continue

                # Extract HTML description and clean it to pure text
                desc_html = item.description.text if item.description else ""
                clean_text = BeautifulSoup(desc_html, 'html.parser').get_text(separator=' ').strip()
                
                stories.append({
                    "title": title,
                    "url": url,
                    "text": clean_text[:3000], 
                    "source": feed["source"],
                    "published_at": pub_date.isoformat()
                })
                count += 1
        except Exception as e:
            print(f"Failed to fetch RSS {feed['source']}: {e}")
            
    return stories

# A dictionary of keywords mapped to standard tags we want to support in the UI
TECH_DICTIONARY = {
    "react": "React", "react.js": "React", "next.js": "React", "vite": "React", "frontend": "Web Development",
    "python": "Python", "fastapi": "Python", "django": "Python", "flask": "Python",
    "aws": "AWS", "lambda": "AWS", "sqs": "AWS", "s3": "AWS", "cloudwatch": "AWS", "serverless": "AWS",
    "postgres": "System Design", "postgresql": "System Design", "opensearch": "System Design", 
    "database": "System Design", "sharding": "System Design", "redis": "System Design", "architecture": "System Design",
    "vulnerability": "Security", "compromise": "Security", "zero-day": "Security", "exploit": "Security", 
    "cve": "Security", "malware": "Security", "hack": "Security", "injection": "Security"
}

def analyze_text_deterministically(title, text):
    """
    Analyzes raw text using pure Python logic to calculate tags, reading time,
    and a local priority score WITHOUT calling an LLM.
    """
    combined_content = (title + " " + text).lower()
    local_tags = set()
    
    # 1. Keyword Tag Extraction
    for keyword, tag_name in TECH_DICTIONARY.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', combined_content):
            local_tags.add(tag_name)
            
    # Convert set back to list, default to "Tech News" if no keywords hit
    final_tags = list(local_tags)[:3] if local_tags else ["Tech News"]
    
    # 2. Reading Time Calculation (Average human reads 200 words per minute)
    word_count = len(text.split())
    reading_time = max(1, round(word_count / 200))
    
    # 3. Mathematical Scoring Engine
    # Start with a base score of 5
    base_score = 5
    
    # Boost if high-priority indicators are present
    if "Security" in final_tags:
        base_score += 3 
    if any(word in title.lower() for word in ["compromise", "vulnerability", "breach", "critical"]):
        base_score += 2 
        
    # Cap score between 1 and 10
    final_score = min(10, max(1, base_score))
    
    return {
        "tags": final_tags,
        "score": final_score,
        "reading_time": reading_time,
        "is_relevant": len(local_tags) > 0 
    }

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

def process_with_ai(title, text, retries=3):
    prompt = f"""
    You are an AI assistant for a Senior Software Engineer.
    Analyze this article. 
    Title: {title}
    Text: {text}
    
    Provide a JSON response with exactly three keys:
    1. "summary": A concise 3-bullet point summary of the technical value.
    2. "score": An integer from 1 to 10 rating how relevant this is for a software engineer.
    3. "tags": An array of up to 3 short string tags categorizing the tech.
    
    Format strictly as raw JSON without markdown code blocks.
    """
    
    for attempt in range(retries):
        try:
            response = model.generate_content(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
            data = json.loads(clean_json)
            
            if "tags" not in data:
                data["tags"] = ["Tech News"]
                
            return data
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "Quota" in error_msg:
                wait_time = 15 * (attempt + 1) 
                print(f"⚠️ Rate limited by Gemini API. Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
            else:
                print(f"AI Processing failed: {e}")
                return {"summary": "Could not generate summary.", "score": 5, "tags": ["Error"]}
                
    return {"summary": "Failed after retries due to rate limits.", "score": 5, "tags": ["Error"]}

def generate_embedding(text, retries=3):
    """Convert text into a 768-dimensional vector array with auto-retry."""
    for attempt in range(retries):
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            
            embedding = result.get('embedding')
            
            if embedding and isinstance(embedding[0], list):
                embedding = embedding[0]
            if embedding and len(embedding) > 768:
                embedding = embedding[:768]
                
            return embedding
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "Quota" in error_msg:
                wait_time = 15 * (attempt + 1)
                print(f"⚠️ Vector embedding rate limited. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Embedding failed: {e}")
                return None
                
    return None

def get_osv_vulnerabilities():
    """Check the Open Source Vulnerability (OSV) database for watched packages."""
    print("Checking OSV for watched package compromises...")
    
    # Define the exact tech stack you want to monitor
    watched_packages = [
        {"name": "react", "ecosystem": "npm"},
        {"name": "next", "ecosystem": "npm"},
        {"name": "fastapi", "ecosystem": "PyPI"},
        {"name": "requests", "ecosystem": "PyPI"},
        {"name": "boto3", "ecosystem": "PyPI"} 
    ]
    
    stories = []
    for pkg in watched_packages:
        try:
            res = requests.post("https://api.osv.dev/v1/query", json={"package": pkg}, timeout=10)
            if res.status_code == 200 and "vulns" in res.json():
                vulns = res.json()["vulns"]
                
                recent_vuln = vulns[0] 
                vulns = res.json()["vulns"]
                recent_vuln = vulns[0] 
                vuln_id = recent_vuln.get('id')
                
                pub_time_str = recent_vuln.get('published', datetime.datetime.now(datetime.timezone.utc).isoformat())
                
                pub_time_str = pub_time_str.replace("Z", "+00:00") 
                pub_time = datetime.datetime.fromisoformat(pub_time_str)
                
                cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
                
                if pub_time >= cutoff_date:
                    title = f"🚨 COMPROMISE: {pkg['name']} ({pkg['ecosystem']}) - {vuln_id}"
                    stories.append({
                        "title": title,
                        "url": f"https://osv.dev/vulnerability/{vuln_id}",
                        "text": recent_vuln.get('details', 'No detailed description provided.'),
                        "source": "OSV Database",
                        "bypass_llm": True,
                        "pre_score": 10,
                        "pre_tags": ["Security", "Zero-Day", pkg['name'], pkg['ecosystem']],
                        "published_at": pub_time.isoformat()
                    })
        except Exception as e:
            print(f"OSV fetch failed for {pkg['name']}: {e}")
            
    return stories

def main():
    # 1. Gather raw data from all sources
    hn_stories = get_hn_top_stories(limit=10)
    cisa_vulns = get_cisa_vulnerabilities(limit=3)
    osv_vulns = get_osv_vulnerabilities() 
    rss_stories = get_rss_news(limit=5)
    
    for story in hn_stories:
        story['text'] = None 
        story['source'] = "Hacker News"

    all_items = hn_stories + cisa_vulns + osv_vulns + rss_stories
    
    for item in all_items:
        print(f"Processing: {item['title']}")
        
        # 2. Deduplication check
        existing = supabase.table("articles").select("*").eq("url", item['url']).execute()
        if len(existing.data) > 0:
            print("Already exists in DB. Skipping.")
            continue
            
        # 3. Fetch full body text if not present
        article_text = item.get('text')
        if not article_text:
            article_text = scrape_article_text(item['url'])
            if not article_text:
                print("Could not extract text. Skipping.")
                continue
                
        # 4. RUN DETERMINISTIC PRE-FILTERING ENGINE
        local_analysis = analyze_text_deterministically(item['title'], article_text)
        
        # If it's a regular story and has no relevance to our tech domain, drop it!
        if not item.get("bypass_llm") and not local_analysis["is_relevant"]:
            print(f"⏩ Discarding non-technical noise article: '{item['title']}'. Skipping.")
            continue

        # 5. Handle AI Summarization vs Fast-Track
        if item.get("bypass_llm"):
            print(f"Fast-tracking critical alert for {item['title']}...")
            summary_text = item['text'][:500] + "..." if len(item['text']) > 500 else item['text']
            ai_data = {
                "summary": summary_text,
                "score": item["un_score"] if "un_score" in item else local_analysis["score"],
                "tags": item["pre_tags"]
            }
        else:
            # We only touch the LLM for articles that passed our strict local tech filters!
            print(f"🔥 Passed pre-filtering (Score: {local_analysis['score']}). Requesting AI summary...")
            ai_data = process_with_ai(item['title'], article_text)
            
            # Use the mathematically calculated score and tags to complement or override the LLM if needed
            if ai_data["score"] == 5 and local_analysis["score"] > 5:
                ai_data["score"] = local_analysis["score"] 

        # 6. Generate Vector Embedding from the summary
        summary_text = ai_data.get('summary', '')
        embedding = generate_embedding(summary_text) if summary_text else None
        
        # 7. Save to Database
        record = {
            "title": item['title'],
            "url": item['url'],
            "summary": ai_data.get('summary'),
            "score": ai_data.get('score'),
            "tags": ai_data.get('tags') if not item.get("bypass_llm") else ai_data.get('tags'),
            "source": item['source'],
            "embedding": embedding,
            "reading_time": local_analysis["reading_time"],
            "published_at": item.get('published_at')
        }
        
        try:
            supabase.table("articles").insert(record).execute()
            print(f"✅ Successfully archived: {item['title']}\n")
        except Exception as e:
            print(f"Database insert failed: {e}")
        
        if not item.get("bypass_llm"):
            print("Sleeping 12 seconds to respect API rate limits...")
            time.sleep(12)

if __name__ == "__main__":
    main()
    os._exit(0)