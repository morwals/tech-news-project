import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables in scrapper/.env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-3-flash-preview')

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
    
    Provide a JSON response with exactly two keys:
    1. "summary": A concise 3-bullet point summary of the technical value.
    2. "score": An integer from 1 to 10 rating how relevant and useful this is for a software engineer.
    
    Format strictly as raw JSON without markdown code blocks.
    """
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"AI Processing failed: {e}")
        return {"summary": "Could not generate summary.", "score": 5}

def main():
    stories = get_hn_top_stories(limit=5)
    
    for story in stories:
        print(f"Processing: {story['title']}")
        
        existing = supabase.table("articles").select("*").eq("url", story['url']).execute()
        if len(existing.data) > 0:
            print("Already exists in DB. Skipping.")
            continue
            
        article_text = scrape_article_text(story['url'])
        if not article_text:
            continue
            
        ai_data = process_with_ai(story['title'], article_text)
        
        record = {
            "title": story['title'],
            "url": story['url'],
            "summary": ai_data.get('summary'),
            "score": ai_data.get('score'),
            "source": "Hacker News"
        }
        supabase.table("articles").insert(record).execute()
        print(f"Saved with score {record['score']}!\n")

if __name__ == "__main__":
    main()
    os._exit(0)