"""Celery application — background jobs for ingestion, embeddings, sync."""

from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "4chgm",
    broker=settings.celery_broker,
    backend=settings.celery_result_backend or settings.celery_broker,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.workers.tasks.process_document": {"queue": "ingestion"},
        "app.workers.tasks.generate_embeddings": {"queue": "embeddings"},
    },
)
