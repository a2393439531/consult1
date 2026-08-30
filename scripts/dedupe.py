from __future__ import annotations

import re
from difflib import SequenceMatcher

from .models import CaseQuestion


def normalize_for_fingerprint(text: str) -> str:
    return re.sub(r"[^\u3400-\u9fffA-Za-z0-9]", "", text).lower()


def fingerprint(case: CaseQuestion) -> str:
    return normalize_for_fingerprint(case.background + "".join(item.prompt for item in case.subquestions))


def merge_case(primary: CaseQuestion, duplicate: CaseQuestion) -> CaseQuestion:
    known_sources = {(ref.source_id, ref.file_name, tuple(ref.pages)) for ref in primary.sources}
    primary.sources.extend(ref for ref in duplicate.sources if (ref.source_id, ref.file_name, tuple(ref.pages)) not in known_sources)
    for index, item in enumerate(primary.subquestions):
        if index >= len(duplicate.subquestions):
            continue
        candidate = duplicate.subquestions[index]
        if len(candidate.answer.reference) + len(candidate.answer.analysis) > len(item.answer.reference) + len(item.answer.analysis):
            item.answer = candidate.answer
    primary.exam_ids.extend(exam for exam in duplicate.exam_ids if exam not in primary.exam_ids)
    return primary


def merge_duplicates(cases: list[CaseQuestion], threshold: float = 94) -> tuple[list[CaseQuestion], list[dict[str, object]]]:
    kept: list[CaseQuestion] = []
    groups: list[dict[str, object]] = []
    for case in cases:
        match = next((existing for existing in kept if fingerprint(existing) == fingerprint(case)), None)
        if match is None:
            match = next((existing for existing in kept if SequenceMatcher(None, fingerprint(existing), fingerprint(case)).ratio() * 100 >= threshold), None)
        if match is None:
            kept.append(case)
            continue
        merge_case(match, case)
        groups.append({"primary": match.id, "merged": case.id, "similarity": round(SequenceMatcher(None, fingerprint(match), fingerprint(case)).ratio() * 100, 2)})
    return kept, groups
