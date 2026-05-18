import os
import resend
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Configure APIs
resend.api_key = os.getenv("RESEND_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize the Distributed Queue
celery_app = Celery(
    "signal_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Configuration for fault tolerance
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_acks_late=True, # SDE-2 Signal: Only acknowledge task completion AFTER email actually sends
    worker_prefetch_multiplier=1 # SDE-2 Signal: Fair distribution across multiple workers
)

@celery_app.task(bind=True, max_retries=3)
def send_daily_digest(self, user_email, user_bio, articles):
    """
    Background worker task to format and send the personalized email.
    If the Resend API fails, it automatically retries up to 3 times.
    """
    try:
        print(f"👷 Worker processing digest for: {user_email}")
        
        # Build the HTML Email content
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f172a;">⚡ Your Engineering Signals</h2>
            <p style="color: #64748b; font-size: 14px;">Optimized for your interest: <em>"{user_bio}"</em></p>
            <hr style="border: 1px solid #e2e8f0; margin: 20px 0;" />
        """
        
        for idx, article in enumerate(articles):
            html_content += f"""
            <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0;">
                    <a href="{article['url']}" style="color: #2563eb; text-decoration: none;">
                        {idx + 1}. {article['title']}
                    </a>
                </h3>
                <span style="font-size: 12px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">Score: {article['score']}/10</span>
                <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-top: 12px;">
                    {article['summary'][0] if isinstance(article['summary'], list) else article['summary']}
                </p>
            </div>
            """
            
        html_content += "</div>"

        # Fire the email via Resend
        resend.Emails.send({
            "from": "Signal Intelligence <onboarding@resend.dev>", # Replace with your verified domain later
            "to": [user_email],
            "subject": "⚡ Your Top 5 Engineering Signals",
            "html": html_content
        })
        
        return f"Success: Sent to {user_email}"

    except Exception as exc:
        print(f"⚠️ Task failed for {user_email}. Retrying...")
        # Exponential backoff retry (Wait 1 min, then 2 mins, then 4 mins)
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))