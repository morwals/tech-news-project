import os
import time
import google.generativeai as genai
from config import GEMINI_API_KEY
from fetchers import get_hn_top_stories, get_rss_news, get_osv_vulnerabilities, scrape_article_data
from processors import analyze_text_deterministically, process_with_ai, generate_embedding
from database import article_exists, save_article

# Initialize AI model here to pass to processors
# model = genai.GenerativeModel('gemini-3-flash-preview')
model = genai.GenerativeModel('gemini-2.5-flash-lite')

def main():
    print("🚀 Starting Intelligence Ingestion Pipeline...")
    
    # 1. Extract
    hn_stories = get_hn_top_stories(limit=10)
    for story in hn_stories: story['text'] = None; story['source'] = "Hacker News"
    all_items = hn_stories + get_osv_vulnerabilities() + get_rss_news(limit=5)
    
    for item in all_items:
        print(f"Processing: {item['title']}")
        
        # 2. Check Database
        if article_exists(item['url']):
            print("Already exists in DB. Skipping.")
            continue
            
        # 3. Fetch Full Text & Image
        article_text = item.get('text')
        image_url = None
        if not article_text:
            article_text, image_url = scrape_article_data(item['url'])
            if not article_text: continue
                
        # 4. Transform (Deterministic Pre-Filter)
        local_analysis = analyze_text_deterministically(item['title'], article_text)
        if not item.get("bypass_llm") and not local_analysis["is_relevant"]:
            print(f"⏩ Discarding non-technical noise. Skipping.")
            continue

        # 5. Transform (AI Processing)
        if item.get("bypass_llm"):
            summary_text = [item['text'][:300] + "..."]
            ai_data = {"summary": summary_text, "score": item.get("pre_score", local_analysis["score"]), "tags": item["pre_tags"]}
        else:
            ai_data = process_with_ai(item['title'], article_text, model)
            if ai_data["score"] == 5 and local_analysis["score"] > 5: ai_data["score"] = local_analysis["score"]
            print("Sleeping 12 seconds for rate limits...")
            time.sleep(12)

        # 6. Transform (Vectorization)
        summary_str = " ".join(ai_data.get('summary', [])) if isinstance(ai_data.get('summary'), list) else str(ai_data.get('summary', ''))
        embedding = generate_embedding(summary_str) if summary_str else None
        
        # 7. Load (Save to DB)
        record = {
            "title": item['title'], "url": item['url'], "summary": ai_data.get('summary'),
            "score": ai_data.get('score'), "tags": ai_data.get('tags'), "source": item['source'],
            "embedding": embedding, "reading_time": local_analysis.get("reading_time", 1),
            "published_at": item.get('published_at'), "image_url": image_url
        }
        
        if save_article(record):
            print(f"✅ Successfully archived: {item['title']}\n")

if __name__ == "__main__":
    main()
    os._exit(0)