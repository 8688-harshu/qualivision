import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import engine, Base
from app.api.routes import router as api_router
from app.ml_engine.model import evaluator_instance

try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automated Image Quality & Visual Defect Evaluation REST API powered by Computer Vision & ML.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.requests import Request

@app.middleware("http")
async def vercel_path_rewrite_middleware(request: Request, call_next):
    matched_path = request.headers.get("x-matched-path")
    if matched_path:
        request.scope["path"] = matched_path
    elif request.scope.get("path", "").startswith("/api/index.py"):
        sub_path = request.scope["path"][len("/api/index.py"):]
        request.scope["path"] = sub_path if sub_path.startswith("/") else ("/" + sub_path)
    return await call_next(request)

for dir_path, mount_path, name in [
    (settings.UPLOAD_DIR, "/static/uploads", "uploads"),
    (settings.HEATMAP_DIR, "/static/heatmaps", "heatmaps"),
    (settings.SAMPLES_DIR, "/static/samples", "samples")
]:
    try:
        os.makedirs(dir_path, exist_ok=True)
        app.mount(mount_path, StaticFiles(directory=dir_path, check_dir=False), name=name)
    except Exception:
        pass

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/v1")
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/index.py")
app.include_router(api_router, prefix="/api/index.py/api/v1")
app.include_router(api_router, prefix="/api/index.py/v1")
app.include_router(api_router, prefix="")

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ml_model_loaded": (evaluator_instance.model is not None or evaluator_instance.np_trees is not None),
        "docs_url": f"{settings.API_V1_STR}/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

@app.get("/api")
def api_root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ml_model_loaded": (evaluator_instance.model is not None or evaluator_instance.np_trees is not None),
        "docs_url": f"{settings.API_V1_STR}/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
