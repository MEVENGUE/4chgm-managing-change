"""Cloudflare R2 (S3-compatible) file storage with local fallback."""

from __future__ import annotations

import os
import uuid
from pathlib import Path

import boto3
from botocore.client import Config

from app.config import get_settings

settings = get_settings()
LOCAL_STORAGE = Path(__file__).resolve().parents[2] / "storage"


def _r2_client():
    endpoint = f"https://{settings.r2_account_id}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_file(
    file_bytes: bytes,
    file_name: str,
    bucket_type: str = "uploads",
    organization_id: str = "",
    workspace_id: str = "",
    user_id: str = "",
    content_type: str = "application/octet-stream",
) -> tuple[str, str]:
    """Returns (storage_key, public_url)."""
    ext = Path(file_name).suffix
    key = f"{organization_id}/{workspace_id}/{user_id}/{uuid.uuid4()}{ext}"

    bucket_map = {
        "uploads": settings.r2_bucket_uploads,
        "generated": settings.r2_bucket_generated,
        "diagrams": settings.r2_bucket_diagrams,
        "exports": settings.r2_bucket_exports,
    }
    bucket = bucket_map.get(bucket_type, settings.r2_bucket_uploads)

    if settings.r2_enabled:
        client = _r2_client()
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
            Metadata={
                "organization_id": organization_id,
                "workspace_id": workspace_id,
                "user_id": user_id,
            },
        )
        public_url = f"{settings.r2_public_base_url.rstrip('/')}/{key}" if settings.r2_public_base_url else f"r2://{bucket}/{key}"
        return key, public_url

    LOCAL_STORAGE.mkdir(parents=True, exist_ok=True)
    local_path = LOCAL_STORAGE / key.replace("/", "_")
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(file_bytes)
    return key, f"file://{local_path}"


def read_local_file(storage_key: str) -> bytes | None:
    local_path = LOCAL_STORAGE / storage_key.replace("/", "_")
    if local_path.exists():
        return local_path.read_bytes()
    return None
