from fastapi import APIRouter, Depends, HTTPException
from config import supabase
from services.embedding import generate_search_vector
from pydantic import BaseModel

router = APIRouter()

class ProfileUpdate(BaseModel):
    bio: str
    user_id: str

@router.post("/api/profile/sync")
def sync_user_interests(data: ProfileUpdate):
    """
    Converts user bio into a vector and stores it.
    This vector is used for the 'Top 5 Engineering Signals' matching.
    """
    try:
        # 1. Generate Vector from Bio
        vector = generate_search_vector(data.bio)
        
        if not vector:
            raise HTTPException(status_code=500, detail="Failed to vectorize interests")

        # 2. Update Profile in Supabase
        response = supabase.table("profiles").update({
            "bio": data.bio,
            "interest_vector": vector
        }).eq("id", data.user_id).execute()

        return {"status": "success", "message": "Interests synchronized"}
    except Exception as e:
        print(f"Profile sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))