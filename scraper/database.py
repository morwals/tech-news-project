from config import supabase

def article_exists(url):
    existing = supabase.table("articles").select("*").eq("url", url).execute()
    return len(existing.data) > 0

def save_article(record):
    try:
        supabase.table("articles").insert(record).execute()
        return True
    except Exception as e:
        print(f"Database insert failed: {e}")
        return False