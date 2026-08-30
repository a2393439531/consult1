import { expect, test } from '@playwright/test'

test('learner can open a chapter and reveal a parsed answer', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '今天，从一个章节开始。' })).toBeVisible()
  await page.getByRole('link', { name: '打开题卡' }).click()
  await expect(page.getByRole('heading', { name: /第1章/ })).toBeVisible()
  const reveal = page.getByRole('button', { name: '展开答案与解析' }).first()
  await expect(reveal).toBeVisible()
  await reveal.click({ force: true })
  await expect(page.getByText('参考答案').first()).toBeVisible()
})

test('learner can start a mock and see the timer', async ({ page }) => {
  await page.goto('#/exams')
  const exam = page.locator('.exam-card').first()
  await expect(exam).toBeVisible()
  await exam.click()
  await page.getByRole('button', { name: '开始计时' }).click()
  await expect(page.getByLabel(/剩余时间/)).toBeVisible()
  await expect(page.getByRole('button', { name: '交卷并查看解析' })).toBeVisible()
})
