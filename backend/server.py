from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict
import requests
import time

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

class ProxyRequest(BaseModel):
    method: str
    url: str
    headers: Dict[str, str] = {}
    body: Optional[str] = None

@api_router.get("/")
async def root():
    return {"message": "API Proxy Online"}

@api_router.post("/proxy")
async def proxy_request(req: ProxyRequest):
    try:
        start_time = time.time()
        
        # Forward the request
        resp = requests.request(
            method=req.method,
            url=req.url,
            headers=req.headers,
            data=req.body,
            timeout=15
        )
        
        elapsed = (time.time() - start_time) * 1000
        
        # Attempt to parse JSON body
        try:
            resp_body = resp.json()
            is_json = True
        except:
            resp_body = resp.text
            is_json = False

        return {
            "status": resp.status_code,
            "headers": dict(resp.headers),
            "body": resp_body,
            "is_json": is_json,
            "time_ms": int(elapsed),
            "size_bytes": len(resp.content)
        }
    except requests.exceptions.RequestException as e:
        return {
             "status": 0,
             "headers": {},
             "body": {"error": str(e)},
             "is_json": True,
             "time_ms": 0,
             "size_bytes": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router
app.include_router(api_router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
