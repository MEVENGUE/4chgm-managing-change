"""OpenAI embeddings for vector search — Phase 2."""

from __future__ import annotations

from app.config import get_settings

settings = get_settings()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if not settings.openai_enabled or not texts:
        return []
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model=settings.openai_embedding_model,
        input=texts,
        dimensions=settings.embedding_dimensions,
    )
    return [item.embedding for item in response.data]
