import os
from dotenv import load_dotenv
from supabase import create_client, ClientOptions
import google.generativeai as genai

load_dotenv()

# Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
REDIS_URL = os.getenv("REDIS_URL")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

missing_vars = []
if not SUPABASE_URL: missing_vars.append("SUPABASE_URL")
if not SUPABASE_KEY: missing_vars.append("SUPABASE_KEY")
if not GEMINI_API_KEY: missing_vars.append("GEMINI_API_KEY")
if not REDIS_URL: missing_vars.append("REDIS_URL")
if not RESEND_API_KEY: missing_vars.append("RESEND_API_KEY")

if missing_vars:
    # This will explicitly print which key Render is failing to find!
    raise ValueError(f"CRITICAL: Render is missing these environment variables: {', '.join(missing_vars)}")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables in backend/.env")

# Initialize Supabase with custom timeout to prevent socket drops
opts = ClientOptions(postgrest_client_timeout=15)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY, options=opts)

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)