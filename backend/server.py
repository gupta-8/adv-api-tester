from __future__ import annotations

import ipaddress
import logging
import os
import socket
import time
from typing import Dict, Optional
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("adv-api-tester")

# -----------------------------
# Configuration
# -----------------------------
DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000"
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", DEFAULT_ALLOWED_ORIGINS).strip()
ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

# A comma-separated list of hostnames you explicitly allow (recommended for public deployments).
# Example: "api.github.com, httpbin.org"
HOST_ALLOWLIST = [h.strip().lower() for h in os.environ.get("HOST_ALLOWLIST", "").split(",") if h.strip()]

MAX_RESPONSE_BYTES = int(os.environ.get("MAX_RESPONSE_BYTES", "1048576"))  # 1MB default
TIMEOUT_SECONDS = float(os.environ.get("PROXY_TIMEOUT_SECONDS", "15"))

# -----------------------------
# App + Router
# -----------------------------
app = FastAPI(title="adv-api-tester backend", version="0.2.0")
api_router = APIRouter(prefix="/api")


class ProxyRequest(BaseModel):
    method: str = Field(..., description="HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)")
    url: str = Field(..., description="Absolute URL to call (http/https)")
    headers: Dict[str, str] = Field(default_factory=dict)
    body: Optional[str] = None


@api_router.get("/")
async def root():
    return {"message": "API Proxy Online"}


@api_router.get("/health")
async def health():
    return {"ok": True}


# -----------------------------
# SSRF hardening helpers
# -----------------------------
_BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("224.0.0.0/4"),  # multicast
    ipaddress.ip_network("240.0.0.0/4"),  # reserved
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),     # unique local
    ipaddress.ip_network("fe80::/10"),    # link-local
]


def _is_blocked_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
        return any(addr in net for net in _BLOCKED_IP_NETWORKS)
    except ValueError:
        return True


def _resolve_host_to_ips(host: str) -> list[str]:
    # Resolve DNS and collect all A/AAAA answers.
    try:
        infos = socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise HTTPException(status_code=400, detail=f"DNS resolution failed for host: {host}") from e

    ips: list[str] = []
    for family, _, _, _, sockaddr in infos:
        if family == socket.AF_INET:
            ips.append(sockaddr[0])
        elif family == socket.AF_INET6:
            ips.append(sockaddr[0])
    return sorted(set(ips))


def _validate_target_url(raw_url: str) -> urlparse:
    parsed = urlparse(raw_url)

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http/https URLs are allowed.")

    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="URL must be absolute (include hostname).")

    host = (parsed.hostname or "").lower()
    if not host:
        raise HTTPException(status_code=400, detail="Invalid hostname.")

    if HOST_ALLOWLIST and host not in HOST_ALLOWLIST:
        raise HTTPException(status_code=403, detail="Host is not allowlisted on this deployment.")

    # Resolve and block private/internal IPs.
    ips = _resolve_host_to_ips(host)
    if not ips:
        raise HTTPException(status_code=400, detail="Could not resolve host to an IP address.")
    if any(_is_blocked_ip(ip) for ip in ips):
        raise HTTPException(status_code=403, detail="Target host resolves to a blocked/private IP range.")

    return parsed


_HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def _sanitize_outbound_headers(headers: Dict[str, str]) -> Dict[str, str]:
    clean: Dict[str, str] = {}
    for k, v in (headers or {}).items():
        if not k:
            continue
        lk = k.strip().lower()
        if lk in _HOP_BY_HOP_HEADERS:
            continue
        # Avoid header injection with newline characters
        if "\n" in str(v) or "\r" in str(v):
            continue
        clean[k.strip()] = str(v)
    return clean


def _allowed_method(method: str) -> str:
    m = (method or "").upper().strip()
    allowed = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
    if m not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported method: {m}")
    return m


async def _read_limited_response(resp: httpx.Response, max_bytes: int) -> bytes:
    received = 0
    chunks: list[bytes] = []
    async for chunk in resp.aiter_bytes():
        if not chunk:
            continue
        received += len(chunk)
        if received > max_bytes:
            raise HTTPException(status_code=413, detail=f"Response too large (>{max_bytes} bytes).")
        chunks.append(chunk)
    return b"".join(chunks)


@api_router.post("/proxy")
async def proxy_request(req: ProxyRequest):
    start_time = time.time()

    method = _allowed_method(req.method)
    _validate_target_url(req.url)  # raises if unsafe
    headers = _sanitize_outbound_headers(req.headers)

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(TIMEOUT_SECONDS),
            follow_redirects=False,
            verify=True,
        ) as client:
            resp = await client.request(
                method=method,
                url=req.url,
                headers=headers,
                content=(req.body.encode("utf-8") if isinstance(req.body, str) else None),
            )

            body_bytes = await _read_limited_response(resp, MAX_RESPONSE_BYTES)

    except HTTPException:
        raise
    except httpx.TimeoutException as e:
        raise HTTPException(status_code=504, detail="Upstream request timed out.") from e
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Upstream request failed: {str(e)}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    duration_ms = int((time.time() - start_time) * 1000)
    logger.info("proxy %s %s -> %s (%d ms)", method, req.url, resp.status_code, duration_ms)

    # Try decode as text
    text: str
    try:
        text = body_bytes.decode(resp.encoding or "utf-8", errors="replace")
    except Exception:
        text = body_bytes.decode("utf-8", errors="replace")

    # Try JSON parse
    is_json = False
    data = None
    try:
        data = resp.json()
        is_json = True
    except Exception:
        is_json = False

    # Filter inbound headers to avoid leaking hop-by-hop headers
    response_headers = {k: v for k, v in resp.headers.items() if k.lower() not in _HOP_BY_HOP_HEADERS}

    return {
        "status": resp.status_code,
        "duration_ms": duration_ms,
        "headers": response_headers,
        "is_json": is_json,
        "data": data if is_json else None,
        "text": None if is_json else text,
    }


# Include router
app.include_router(api_router)

# CORS configuration
# Note: credentials + wildcard origin is invalid in browsers.
allow_credentials = True
if len(ALLOWED_ORIGINS) == 1 and ALLOWED_ORIGINS[0] == "*":
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_credentials=allow_credentials,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
