#!/usr/bin/env bash

# 1. Start the Celery worker using the explicit python module command
echo "Starting Celery Worker..."
python -m celery -A worker.celery_app worker --loglevel=info &

# 2. Start the FastAPI application in the foreground
echo "Starting FastAPI Server..."
uvicorn main:app --host 0.0.0.0 --port $PORT