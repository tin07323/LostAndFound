from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api import (
    users,
    schools,
    found_items,
    lost_reports,
    claims,
    return_information,
    notifications,
    admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API ระบบจัดการของหายและของที่พบสำหรับโรงเรียน (School Lost & Found Platform)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(schools.router, prefix=settings.API_PREFIX)
app.include_router(found_items.router, prefix=settings.API_PREFIX)
app.include_router(lost_reports.router, prefix=settings.API_PREFIX)
app.include_router(claims.router, prefix=settings.API_PREFIX)
app.include_router(return_information.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Lost & Found API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
