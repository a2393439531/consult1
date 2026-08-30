from scripts.clean import clean_text


def test_clean_text_removes_ads_but_preserves_math_and_page_breaks():
    text = """联系方式：加微信 123456
    投资额 = 1,200 万元，IRR=8.5%

    \f
    【问题】说明现金流量。
    """
    result = clean_text(text)
    assert "联系方式" not in result
    assert "1,200 万元" in result
    assert "IRR=8.5%" in result
    assert "\f" in result


def test_clean_text_normalizes_table_split_markers():
    result = clean_text("| 【 问 | 题 】 |\n题\n1. 说明。\n| 【 参 | 考 答 | 案 】 |\n答案内容")
    assert result.count("【问题】") == 1
    assert result.count("【参考答案】") == 1
    assert "【问题】\n1. 说明" in result
