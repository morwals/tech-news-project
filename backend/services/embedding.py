import google.generativeai as genai

def generate_search_vector(query: str) -> list[float] | None:
    """Converts a search query into a 768-dimensional semantic vector."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=query,
            task_type="retrieval_query" 
        )
        query_embedding = result.get('embedding')
        
        # Format safety checks
        if query_embedding and isinstance(query_embedding[0], list):
            query_embedding = query_embedding[0]
        if query_embedding and len(query_embedding) > 768:
            query_embedding = query_embedding[:768]
            
        return query_embedding
    except Exception as e:
        print(f"Embedding service failed: {e}")
        return None