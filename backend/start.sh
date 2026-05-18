#!/usr/bin/env bash

# 1. Start the Celery worker in the background (notice the & at the end)
echo "Starting Celery Worker..."
celery -A worker.celery_app worker --loglevel=info &

# 2. Start the FastAPI application in the foreground
echo "Starting FastAPI Server..."
uvicorn main:app --host 0.0.0.0 --port $PORT