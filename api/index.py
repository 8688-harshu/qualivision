import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app as fastapi_app

class VercelPathFixMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            matched_path = headers.get(b"x-matched-path", b"").decode("utf-8")
            
            # If Vercel sets x-matched-path (e.g. /api/v1/analyze, /api/v1/health)
            if matched_path:
                scope["path"] = matched_path
            # If Vercel sets scope path to /api/index.py or /api/index.py/something
            elif scope.get("path", "").startswith("/api/index.py"):
                sub_path = scope["path"][len("/api/index.py"):]
                scope["path"] = sub_path if sub_path.startswith("/") else ("/" + sub_path)

        await self.app(scope, receive, send)

app = VercelPathFixMiddleware(fastapi_app)
