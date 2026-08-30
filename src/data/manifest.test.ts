import { beforeEach, expect, test, vi } from 'vitest'
import { clearDataCache, loadChapter, loadManifest } from './manifest'

beforeEach(() => {
  clearDataCache()
  vi.restoreAllMocks()
})

test('loads the manifest from the repository-aware data URL', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ version: 1 }), { status: 200 }))
  await loadManifest()
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('data/manifest.json'))
})

test('caches chapter requests by chapter id', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: '1', questions: [] }), { status: 200 }))
  await Promise.all([loadChapter('1'), loadChapter('1')])
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
