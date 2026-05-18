import os
from dotenv import load_dotenv
from supabase import create_client, ClientOptions
import google.generativeai as genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables in scrapper/.env")

opts = ClientOptions(postgrest_client_timeout=15)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY, options=opts)
genai.configure(api_key=GEMINI_API_KEY)