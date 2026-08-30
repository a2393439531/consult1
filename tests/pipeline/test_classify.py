from scripts.classify import classify_case
from scripts.models import Answer, CaseQuestion, SourceRef, SubQuestion


def make_case(file_name: str, background: str) -> CaseQuestion:
    return CaseQuestion(
        id="case-1",
        title="测试题",
        chapter_id="1",
        background=background,
        subquestions=[SubQuestion(id="q1", prompt="说明。", answer=Answer(reference="答案"))],
        sources=[SourceRef(source_id="s1", file_name=file_name, pages=[1])],
    )


def test_classify_uses_explicit_chapter_in_source_name():
    case = classify_case(make_case("精题必练第十章.pdf", "财务内部收益率如何计算"))
    assert case.chapter_id == "10"


def test_classify_uses_keywords_when_source_has_no_chapter_number():
    case = classify_case(make_case("模考.pdf", "项目建设投资估算和预备费"))
    assert case.chapter_id == "8"
