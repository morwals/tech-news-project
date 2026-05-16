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

*   **Ingestion Engine:** Python, `BeautifulSoup`, Hacker News API
*   **AI Orchestration:** Google Gemini 1.5 Flash
*   **Database:** Supabase (PostgreSQL)
*   **Backend API:** FastAPI (Hosted on Render)
*   **Frontend UI:** React + Vite (Hosted on Vercel)
*   **Automation/Cron:** GitHub Actions

### Data Flow
```mermaid
graph TD
    A[GitHub Actions Cron] -->|Triggers Daily| B[Python Scraper]
    B -->|Fetch| C[Hacker News API]
    B -->|Extract Text| D[BeautifulSoup]
    D -->|Send Text| E[Gemini LLM]
    E -->|Returns JSON: Summary + Score| B
    B -->|Insert| F[(Supabase Postgres)]
    F -->|Query| G[FastAPI Backend]
    G -->|JSON API| H[React Frontend]