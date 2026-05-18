from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import news, search
from routes import digest
from routes import profile

app = FastAPI(title="Tech Intelligence API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://tech-news-project.vercel.app"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)
app.include_router(search.router)
app.include_router(digest.router)
app.include_router(profile.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)