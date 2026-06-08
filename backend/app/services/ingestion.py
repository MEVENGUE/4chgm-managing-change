"""Document parsing — Phase 1 text formats; Phase 2 full pipeline."""

from __future__ import annotations

import csv
import io
import json
from typing import Any


SUPPORTED_TEXT = {".txt", ".md", ".csv", ".json", ".log"}
SUPPORTED_BINARY = {".pdf", ".docx", ".pptx", ".xlsx", ".png", ".jpg", ".jpeg", ".webp"}


def detect_file_type(file_name: str) -> str:
    ext = ("." + file_name.rsplit(".", 1)[-1].lower()) if "." in file_name else ""
    if ext in SUPPORTED_TEXT:
        return ext.lstrip(".")
    if ext == ".pdf":
        return "pdf"
    if ext == ".docx":
        return "docx"
    if ext == ".pptx":
        return "pptx"
    if ext in {".xlsx", ".xls"}:
        return "xlsx"
    if ext in {".png", ".jpg", ".jpeg", ".webp"}:
        return "image"
    return "unknown"


def extract_text(file_bytes: bytes, file_name: str) -> tuple[str, dict[str, Any]]:
    """Parse document text. Returns (text, metadata)."""
    ext = ("." + file_name.rsplit(".", 1)[-1].lower()) if "." in file_name else ""
    meta: dict[str, Any] = {"file_name": file_name, "parser": "native"}

    if ext in {".txt", ".md", ".log"}:
        text = file_bytes.decode("utf-8", errors="replace")
        meta["word_count"] = len(text.split())
        return text, meta

    if ext == ".json":
        data = json.loads(file_bytes.decode("utf-8", errors="replace"))
        text = json.dumps(data, indent=2)[:50000]
        meta["word_count"] = len(text.split())
        return text, meta

    if ext == ".csv":
        reader = csv.reader(io.StringIO(file_bytes.decode("utf-8", errors="replace")))
        rows = list(reader)
        meta["rows"] = len(rows)
        text = "\n".join(", ".join(r) for r in rows[:500])
        return text, meta

    if ext == ".pdf":
        try:
            import fitz  # pymupdf

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages = [page.get_text() for page in doc]
            meta["pages"] = len(pages)
            return "\n\n".join(pages)[:50000], meta
        except Exception as e:
            return "", {"error": str(e), "parser": "pymupdf"}

    if ext == ".docx":
        try:
            from docx import Document as DocxDocument

            doc = DocxDocument(io.BytesIO(file_bytes))
            paras = [p.text for p in doc.paragraphs if p.text.strip()]
            meta["paragraphs"] = len(paras)
            return "\n\n".join(paras)[:50000], meta
        except Exception as e:
            return "", {"error": str(e), "parser": "python-docx"}

    if ext in {".xlsx", ".xls"}:
        try:
            import pandas as pd

            df = pd.read_excel(io.BytesIO(file_bytes))
            meta["rows"] = len(df)
            meta["columns"] = list(df.columns.astype(str))
            return df.head(200).to_csv(index=False)[:50000], meta
        except Exception as e:
            return "", {"error": str(e), "parser": "pandas"}

    if ext in {".png", ".jpg", ".jpeg", ".webp"}:
        try:
            from PIL import Image
            import pytesseract

            img = Image.open(io.BytesIO(file_bytes))
            meta["size"] = img.size
            text = pytesseract.image_to_string(img)
            return text[:50000], meta
        except Exception as e:
            return "", {"error": str(e), "parser": "ocr"}

    return file_bytes.decode("utf-8", errors="replace")[:50000], meta


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> list[dict[str, Any]]:
    """Overlap chunking with section awareness (paragraph breaks)."""
    if not text.strip():
        return []
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[dict[str, Any]] = []
    buffer = ""
    for para in paragraphs:
        if len(buffer) + len(para) < chunk_size:
            buffer = f"{buffer}\n\n{para}".strip()
        else:
            if buffer:
                chunks.append({"text": buffer, "section": len(chunks)})
            buffer = para
    if buffer:
        chunks.append({"text": buffer, "section": len(chunks)})

    if not chunks:
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append({"text": text[i : i + chunk_size], "section": i // chunk_size})
    return chunks
