import time
import datetime
import requests
from bs4 import BeautifulSoup
from email.utils import parsedate_to_datetime

def scrape_article_data(url):
    """Scrapes both the article body text and the Open Graph hero image."""
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = " ".join([p.text for p in paragraphs])
        
        og_image = soup.find('meta', property='og:image')
        image_url = og_image['content'] if og_image else None
        
        return text[:3000], image_url
    except Exception:
        return "", None

def get_hn_top_stories(limit=10):
    print("Fetching Hacker News top stories...")
    try:
        response = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json", timeout=10)
        story_ids = response.json()[:limit * 3] 
        stories = []
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
        
        for story_id in story_ids:
            if len(stories) >= limit: break
            story_res = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json", timeout=5)
            story = story_res.json()
            if story and 'url' in story:
                pub_date = datetime.datetime.fromtimestamp(story.get('time', time.time()), datetime.timezone.utc)
                if pub_date < cutoff_date: continue 
                story['published_at'] = pub_date.isoformat()
                stories.append(story)
        return stories
    except Exception as e:
        print(f"HN fetch failed: {e}")
        return []

def get_rss_news(limit=5):
    print("Fetching Dev.to and InfoQ RSS feeds...")
    feeds = [{"url": "https://dev.to/feed/", "source": "Dev.to"}, {"url": "https://feed.infoq.com/", "source": "InfoQ"}]
    stories = []
    cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)

    for feed in feeds:
        try:
            res = requests.get(feed["url"], timeout=10)
            soup = BeautifulSoup(res.content, 'xml')
            items = soup.find_all('item')
            count = 0
            for item in items:
                if count >= limit: break
                title = item.title.text if item.title else "No Title"
                url = item.link.text if item.link else ""
                
                try: pub_date = parsedate_to_datetime(item.pubDate.text if item.pubDate else "")
                except: pub_date = datetime.datetime.now(datetime.timezone.utc)
                if pub_date < cutoff_date: continue

                desc_html = item.description.text if item.description else ""
                clean_text = BeautifulSoup(desc_html, 'html.parser').get_text(separator=' ').strip()
                
                stories.append({"title": title, "url": url, "text": clean_text[:3000], "source": feed["source"], "published_at": pub_date.isoformat()})
                count += 1
        except Exception as e: print(f"Failed to fetch RSS {feed['source']}: {e}")
    return stories

def get_osv_vulnerabilities():
    print("Checking OSV for watched package compromises...")
    watched_packages = [{"name": "react", "ecosystem": "npm"}, {"name": "next", "ecosystem": "npm"}, {"name": "fastapi", "ecosystem": "PyPI"}]
    stories = []
    cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)

    for pkg in watched_packages:
        try:
            res = requests.post("https://api.osv.dev/v1/query", json={"package": pkg}, timeout=10)
            if res.status_code == 200 and "vulns" in res.json():
                recent_vuln = res.json()["vulns"][0]
                vuln_id = recent_vuln.get('id')
                
                pub_time_str = recent_vuln.get('published', datetime.datetime.now(datetime.timezone.utc).isoformat()).replace("Z", "+00:00") 
                pub_time = datetime.datetime.fromisoformat(pub_time_str)
                
                if pub_time >= cutoff_date:
                    stories.append({
                        "title": f"🚨 COMPROMISE: {pkg['name']} ({pkg['ecosystem']}) - {vuln_id}",
                        "url": f"https://osv.dev/vulnerability/{vuln_id}",
                        "text": recent_vuln.get('details', 'No detailed description provided.'),
                        "source": "OSV Database", "bypass_llm": True, "pre_score": 10,
                        "pre_tags": ["Security", "Zero-Day", pkg['name']], "published_at": pub_time.isoformat()
                    })
        except Exception as e: print(f"OSV fetch failed for {pkg['name']}: {e}")
    return stories