from fastapi import APIRouter
from config import supabase

router = APIRouter()

@router.get("/api/news")
def get_news():
    """Fetch the latest/highest scoring articles."""
    try:
        response = supabase.table("articles").select("*").order("published_at", desc=True).limit(20).execute()
        return {"articles": response.data}
    except Exception as e:
        print(f"Failed to fetch news from database: {e}")
        return {"articles": []}