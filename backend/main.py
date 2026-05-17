import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, ClientOptions
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables in backend/.env")

# --- FIX: Give Supabase a custom timeout to prevent Errno 35 socket drops ---
opts = ClientOptions(postgrest_client_timeout=15)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY, options=opts)

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174", 
        "http://localhost:3000", 
        "http://127.0.0.1:5174",
        "https://tech-news-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/news")
def get_news():
    """Fetch the latest/highest scoring articles."""
    # --- FIX: Wrap in try/except so the frontend never crashes ---
    try:
        response = supabase.table("articles").select("*").order("score", desc=True).limit(20).execute()
        return {"articles": response.data}
    except Exception as e:
        print(f"Failed to fetch news from database: {e}")
        # Return an empty array so React handles it gracefully
        return {"articles": []} 

@app.get("/api/search")
def semantic_search(q: str = Query(..., description="Search query")):
    """Perform a vector-based semantic search."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=q,
            task_type="retrieval_query" 
        )
        query_embedding = result.get('embedding')
        
        if query_embedding and isinstance(query_embedding[0], list):
            query_embedding = query_embedding[0]
        if query_embedding and len(query_embedding) > 768:
            query_embedding = query_embedding[:768]

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)