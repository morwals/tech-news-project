from fastapi import APIRouter, HTTPException
from config import supabase
from worker import send_daily_digest

router = APIRouter()

@router.post("/api/admin/trigger-digests")
def trigger_daily_digests():
    """
    The Producer: Finds all subscribed users, computes their personalized top 5 articles,
    and drops the delivery tasks into the Redis Message Queue.
    """
    try:
        # 1. Fetch all users who have an interest vector
        # 1. Fetch all users who have an interest vector
        users = supabase.table("profiles").select("email, bio, interest_vector").filter("interest_vector", "not.is", "null").execute()
        
        if not users.data:
            return {"status": "skipped", "message": "No users with configured vectors."}

        tasks_queued = 0

        for user in users.data:
            # 2. Perform the Vector Search for THIS specific user
            response = supabase.rpc(
                'match_articles',
                {
                    'query_embedding': user['interest_vector'], 
                    'match_threshold': 0.2, 
                    'match_count': 5
                }
            ).execute()
            
            top_articles = response.data
            
            if top_articles:
                # 3. Fire-and-forget: Push to Redis Queue
                # .delay() pushes the execution to the background worker instantly
                send_daily_digest.delay(user['email'], user['bio'], top_articles)
                tasks_queued += 1

        return {"status": "success", "tasks_queued": tasks_queued}

    except Exception as e:
        print(f"Failed to trigger digests: {e}")
        raise HTTPException(status_code=500, detail=str(e))