# 🚀 AI-Powered Tech Content Aggregator

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-blue?style=for-the-badge)](https://tech-news-project.vercel.app/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)]()

An automated, event-driven data pipeline that curates, summarizes, and scores daily tech news. Designed to solve the "noise" problem in software engineering news by using Large Language Models (LLMs) to act as an automated Editor-in-Chief.

**Live Application:** [https://tech-news-project.vercel.app/](https://tech-news-project.vercel.app/)

---

## 🧠 The Problem It Solves

Software engineers spend too much time sifting through Hacker News, Reddit, and RSS feeds trying to find high-signal, technically deep content. This system automates the curation process by scraping top articles, using AI to extract the core technical value (3-bullet summaries), and filtering out low-quality noise via an AI-generated relevance score.

## 🛠️ System Architecture & Tech Stack

This project is built using a decoupled, microservice-style architecture:

- **Ingestion Engine:** Python, `BeautifulSoup`, Hacker News API
- **AI Orchestration:** Google Gemini 1.5 Flash
- **Database:** Supabase (PostgreSQL)
- **Backend API:** FastAPI (Hosted on Render)
- **Frontend UI:** React + Vite (Hosted on Vercel)
- **Automation/Cron:** GitHub Actions

### Data Flow

````mermaid
graph TD
    A[GitHub Actions Cron] -->|Triggers Daily| B[Python Scraper]
    B -->|Fetch| C[Hacker News API]
    B -->|Extract Text| D[BeautifulSoup]
    D -->|Send Text| E[Gemini LLM]
    E -->|Returns JSON: Summary + Score| B
    B -->|Insert| F[(Supabase Postgres)]
    F -->|Query| G[FastAPI Backend]
    G -->|JSON API| H[React Frontend]

💻 Local Development Setup
To run this project locally, you will need to set up three separate environments: the scraper, the backend, and the frontend.

1. Clone the Repository

Bash
git clone [https://github.com/YOUR_USERNAME/tech-news-project.git](https://github.com/YOUR_USERNAME/tech-news-project.git)
cd tech-news-project
2. Configure Environment Variables

You will need API keys for Supabase and Google Gemini.

In the /scrapper directory, create a .env file:

Code snippet
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_key
In the /backend directory, create a .env file:

Code snippet
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

*   In the `/frontend` directory, create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:8000

3. Run the Backend (FastAPI)

Bash
cd backend
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
4. Run the Frontend (React)

Open a new terminal:

Bash
cd frontend
npm install
npm run dev
5. Manually Trigger the Scraper

Open a third terminal:

Bash
cd scrapper
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python scraper.py
🔭 Future Scope & Roadmap
This project is actively being developed. The following features are planned for upcoming sprints to scale the architecture into a Tier-1 production application:

[ ] Vector Database Integration: Implement Pinecone and generate text embeddings for article summaries to power semantic search and deduplication.

[ ] Expanded Data Sources: Add custom web scrapers for engineering blogs (Netflix, AWS, Cloudflare), Reddit (r/programming), and Dev.to RSS feeds.

[ ] AWS Cloud Migration: Transition the GitHub Actions cron job into an AWS EventBridge + Lambda + SQS pipeline for highly scalable, asynchronous ingestion.

[ ] UI/UX Polish: Migrate the frontend from inline styles to Tailwind CSS for a responsive, modern reading experience.

[ ] Personalization Engine: Add user authentication to allow saving topic preferences (e.g., Python, React, System Design) to re-weight the LLM scoring algorithm.
````
