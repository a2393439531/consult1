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
