from scripts.dedupe import fingerprint, merge_duplicates
from scripts.models import Answer, CaseQuestion, SourceRef, SubQuestion


def make_case(case_id: str, answer: str, source_id: str) -> CaseQuestion:
    return CaseQuestion(
        id=case_id,
        title="同一案例",
        chapter_id="9",
        background="甲公司拟采用银行贷款融资。",
        subquestions=[SubQuestion(id=f"{case_id}-q1", prompt="融资方式的优缺点？", answer=Answer(reference=answer))],
        sources=[SourceRef(source_id=source_id, file_name=f"{source_id}.pdf", pages=[1])],
    )


def test_merge_duplicates_keeps_longest_answer_and_all_sources():
    short = make_case("case-a", "债务融资需还本付息。", "source-a")
    long = make_case("case-b", "债务融资需按时还本付息，并关注资产负债率和财务风险。", "source-b")
    assert fingerprint(short) == fingerprint(long)
    cases, groups = merge_duplicates([short, long])
    assert len(cases) == 1
    assert len(cases[0].sources) == 2
    assert "资产负债率" in cases[0].subquestions[0].answer.reference
    assert groups[0]["primary"] == "case-a"
