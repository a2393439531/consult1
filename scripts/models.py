from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SourceDocument(BaseModel):
    id: str
    relative_path: str
    sha256: str
    pages: int = Field(ge=1)
    size_bytes: int = Field(ge=0)
    status: Literal["pending", "processed", "failed"] = "pending"
    error: str | None = None


class ExtractionResult(BaseModel):
    source_id: str
    raw_path: str
    extractor: Literal["markitdown", "pdftotext"]
    pages: int = Field(ge=1)
    characters: int = Field(ge=0)
    warnings: list[str] = Field(default_factory=list)
    extracted_at: datetime


class SourceRef(BaseModel):
    source_id: str
    file_name: str
    pages: list[int] = Field(default_factory=list)


class Answer(BaseModel):
    reference: str
    analysis: str = ""
    scoring_points: list[str] = Field(default_factory=list)
    pitfalls: list[str] = Field(default_factory=list)


class SubQuestion(BaseModel):
    id: str
    prompt: str
    answer: Answer


class CaseQuestion(BaseModel):
    id: str
    title: str
    chapter_id: str
    topics: list[str] = Field(default_factory=list)
    question_type: str = "案例题"
    difficulty: str = "中"
    background: str
    subquestions: list[SubQuestion] = Field(min_length=1)
    sources: list[SourceRef] = Field(min_length=1)
    exam_ids: list[str] = Field(default_factory=list)
    needs_review: bool = False
    review_notes: list[str] = Field(default_factory=list)


class ExamShard(BaseModel):
    id: str
    title: str
    duration_minutes: int = Field(gt=0)
    question_ids: list[str] = Field(min_length=1)
    source: SourceRef
