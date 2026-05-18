from fastapi import APIRouter, Query, HTTPException
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

@router.get("/api/news/personalized")
def get_personalized_news(user_id: str = Query(..., description="The Supabase Auth User ID")):
    """Fetch the top 10 articles matching the user's specific interest vector."""
    try:
        # 1. Fetch the user's profile vector
        profile_res = supabase.table("profiles").select("interest_vector").eq("id", user_id).execute()
        
        if not profile_res.data or not profile_res.data[0].get("interest_vector"):
            return {"articles": [], "message": "No interest vector found."}

        interest_vector = profile_res.data[0]["interest_vector"]

        # 2. Perform the Vector Search
        response = supabase.rpc(
            'match_articles',
            {
                'query_embedding': interest_vector, 
                'match_threshold': 0.2, 
                'match_count': 10
            }
        ).execute()
        
        return {"articles": response.data}
    except Exception as e:
        print(f"Personalized fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))