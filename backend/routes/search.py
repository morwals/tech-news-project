from fastapi import APIRouter, Query
from config import supabase
from services.embedding import generate_search_vector

router = APIRouter()

@router.get("/api/search")
def semantic_search(q: str = Query(..., description="Search query")):
    """Perform a vector-based semantic search."""
    try:
        query_embedding = generate_search_vector(q)
        
        if not query_embedding:
            return {"articles": []}

        # Call the Supabase RPC function
        response = supabase.rpc(
            'match_articles',
            {
                'query_embedding': query_embedding, 
                'match_threshold': 0.3, 
                'match_count': 10
            }
        ).execute()
        
        return {"articles": response.data}
    except Exception as e:
        print(f"Search failed: {e}")
        return {"articles": []}