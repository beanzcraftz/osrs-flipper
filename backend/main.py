from contextlib import asynccontextmanager
import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from background import price_poller
from routes import router
from character_routes import router as character_router
from skiller_routes import router as skiller_router
from bored_routes import router as bored_router

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    task = asyncio.create_task(price_poller())
    yield
    task.cancel()

app = FastAPI(title='OSRS Suite API', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(router)
app.include_router(character_router)
app.include_router(skiller_router)
app.include_router(bored_router)

@app.get('/')
async def root():
    return {'status': 'ok', 'service': 'OSRS Account Management Suite'}
