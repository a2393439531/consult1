# Consulting Practice Study Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert 60 authorized consulting-practice PDFs into a chapter-organized interactive question bank and timed mock-exam site deployed to GitHub Pages.

**Architecture:** A Python content pipeline inventories, extracts, cleans, parses, classifies, de-duplicates, and validates source PDFs into chapter and exam JSON shards. A React/TypeScript/Vite static client lazy-loads those shards, stores personal study state in browser local storage, and uses hash routing so every route works under a GitHub Pages repository subpath.

**Tech Stack:** Python 3.11+, MarkItDown, Poppler, pypdf, rapidfuzz, React 19, TypeScript, Vite, React Router, Zustand, Fuse.js, KaTeX, Vitest, Testing Library, Playwright, GitHub Actions.

## Global Constraints

- Process exactly the 60 PDFs under the authorized source directory and ignore video files.
- Preserve source file and page provenance for every published case.
- Remove advertising, watermarks, contact details, repeated headers, and repeated footers.
- Organize the question bank into the textbook's 11 chapters and retain original mock-paper ordering.
- Answers are hidden by default in chapter study and unavailable before mock-exam submission.
- Drafts, bookmarks, mastery state, current position, and mock sessions remain browser-local.
- Subjective answers use self-assessment; the site must not invent automatic scores.
- The Git repository must not contain the original PDF files.
- Use `HashRouter` and Vite's repository-path base so GitHub Pages deep navigation works.

---

## Planned File Map

- `package.json`: front-end scripts and dependencies.
- `vite.config.ts`: Vite, Vitest, base-path, and React configuration.
- `src/domain/types.ts`: stable front-end question, chapter, source, and exam interfaces.
- `src/domain/search.ts`: searchable document projection and Fuse index creation.
- `src/domain/exam.ts`: pure mock-exam state transitions and timing helpers.
- `src/data/manifest.ts`: typed loader for generated content manifest and shards.
- `src/store/studyStore.ts`: persisted learner state and versioned migration.
- `src/components/*`: focused navigation, question, answer, filter, and exam components.
- `src/pages/*`: dashboard, chapter, search/review, mock list, and mock runner pages.
- `src/styles/*`: tokens, layout, reading surfaces, and responsive rules.
- `scripts/inventory.py`: authoritative PDF manifest, hashes, pages, and processing status.
- `scripts/extract.py`: MarkItDown-first extraction with layout-text fallback.
- `scripts/clean.py`: line normalization and removal of non-content material.
- `scripts/parse.py`: case/question/answer segmentation and provenance mapping.
- `scripts/classify.py`: 11-chapter and knowledge-topic assignment.
- `scripts/dedupe.py`: exact and fuzzy duplicate grouping with answer merging.
- `scripts/build_content.py`: orchestration, validation, shard output, and coverage report.
- `scripts/models.py`: Pydantic content models shared by pipeline stages.
- `content/overrides.json`: auditable manual corrections for formulas, tables, splits, and classification.
- `public/data/*`: generated manifest, chapter shards, exam shards, and coverage report.
- `tests/pipeline/*`: extraction, cleaning, parsing, classification, and de-duplication tests.
- `src/**/*.test.ts(x)`: domain, store, and component tests.
- `e2e/study-flow.spec.ts`: desktop/mobile critical-flow checks.
- `.github/workflows/pages.yml`: test, build, and GitHub Pages deployment.

---

### Task 1: Establish the Tested Static Application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Create: `.gitignore`

**Interfaces:**
- Produces: a Vite app mounted at `#root`, a `HashRouter`, and `npm run test`, `npm run build`, and `npm run dev` scripts.
- Consumes: no earlier task interfaces.

- [ ] **Step 1: Add the failing shell test**

Create `src/App.test.tsx` with a render assertion for the product title:

```tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders the study-site identity', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: '2026 咨询实务题库' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and confirm the missing application fails**

Run: `npm test -- --run`

Expected: FAIL because dependencies and `App` are absent.

- [ ] **Step 3: Create the minimal app and intentional theme**

Use React 19, `react-router-dom`, Vitest, jsdom, Testing Library, and `@vitejs/plugin-react`. Set `base` from `VITE_BASE_PATH` with `/` as the local default. `App.tsx` must render the heading inside `HashRouter`; `tokens.css` must define paper, ink, teal, warning, border, radius, spacing, and focus-ring tokens for light mode, plus a dark-mode media-query variant.

- [ ] **Step 4: Verify test and production build**

Run: `npm test -- --run`

Expected: one passing test.

Run: `npm run build`

Expected: exit code 0 and `dist/index.html` exists.

- [ ] **Step 5: Commit the application foundation**

Run: `git add package.json package-lock.json tsconfig*.json vite.config.ts index.html src .gitignore && git commit -m "feat: establish study site foundation"`

---

### Task 2: Inventory and Extract Every PDF

**Files:**
- Create: `requirements-content.txt`
- Create: `scripts/models.py`
- Create: `scripts/inventory.py`
- Create: `scripts/extract.py`
- Create: `tests/pipeline/test_inventory.py`
- Create: `tests/pipeline/test_extract.py`
- Create: `content/source-manifest.json`

**Interfaces:**
- Produces: `SourceDocument(id, relative_path, sha256, pages, size_bytes, status)` and `extract_document(source, raw_dir) -> ExtractionResult`.
- Consumes: source root passed only via `--source-root`; no absolute source path is committed.

- [ ] **Step 1: Write inventory and extraction contract tests**

The inventory test creates two `.pdf` fixtures plus one `.mp4`, injects a page-count reader, and asserts only two PDF records are sorted and hashed. The extraction test injects command runners and asserts MarkItDown runs first, `pdftotext -layout` runs only when extracted Chinese/alphanumeric text is below 30 characters per page, and failures contain the source ID and command error.

- [ ] **Step 2: Run focused tests**

Run: `python -m pytest tests/pipeline/test_inventory.py tests/pipeline/test_extract.py -q`

Expected: FAIL because the scripts do not exist.

- [ ] **Step 3: Implement inventory and MarkItDown-first extraction**

`inventory.py` must recursively enumerate case-insensitive `.pdf` files, use pypdf for page count, stream SHA-256 hashes, and write UTF-8 JSON. `extract.py` must call `markitdown <pdf> -o <raw.md>`, measure extraction density, and fall back to `pdftotext -layout` when the threshold fails. Each raw file begins with a machine-readable provenance header and explicit page separators when available.

- [ ] **Step 4: Verify tests and inventory the authorized directory**

Run: `python -m pytest tests/pipeline/test_inventory.py tests/pipeline/test_extract.py -q`

Expected: PASS.

Run: `python scripts/inventory.py --source-root "E:\BaiduNetdiskDownload\2026年咨询【实务】SVIP\2026年咨询【实务】SVIP\03-习题精析✿实战特训✿模考通关" --output content/source-manifest.json`

Expected: report `60 PDFs, 980 pages`; each record has a nonempty SHA-256 hash.

- [ ] **Step 5: Extract all documents and commit only the manifest and pipeline**

Run: `python scripts/extract.py --source-root "E:\BaiduNetdiskDownload\2026年咨询【实务】SVIP\2026年咨询【实务】SVIP\03-习题精析✿实战特训✿模考通关" --manifest content/source-manifest.json --raw-dir .work/raw`

Expected: 60 successful records or an explicit per-file failure report; `.work/` remains ignored.

Run: `git add requirements-content.txt scripts tests content/source-manifest.json .gitignore && git commit -m "feat: inventory and extract authorized pdf sources"`

---

### Task 3: Clean, Segment, Classify, and De-duplicate Content

**Files:**
- Create: `scripts/clean.py`
- Create: `scripts/parse.py`
- Create: `scripts/classify.py`
- Create: `scripts/dedupe.py`
- Create: `content/chapters.json`
- Create: `content/overrides.json`
- Create: `tests/pipeline/test_clean.py`
- Create: `tests/pipeline/test_parse.py`
- Create: `tests/pipeline/test_classify.py`
- Create: `tests/pipeline/test_dedupe.py`

**Interfaces:**
- Produces: `CaseQuestion`, `SubQuestion`, `Answer`, `SourceRef`, `ChapterAssignment`, and `DuplicateGroup` Pydantic models in `scripts/models.py`.
- Produces: `clean_text(text) -> str`, `parse_document(source, text) -> list[CaseQuestion]`, `classify_case(case, rules) -> ChapterAssignment`, and `merge_duplicates(cases, threshold=94) -> tuple[list[CaseQuestion], list[DuplicateGroup]]`.
- Consumes: extraction output and source manifest from Task 2.

- [ ] **Step 1: Write representative fixture tests**

Tests must include all observed markers: `【例题·案例题】`, `【问题】`, `【参考答案】`, `【答案】`, `【解析】`, and `『正确答案』`. Include a split-page calculation example, a Markdown table, repeated advertising/contact lines, and two near-duplicate cases with different answer detail.

- [ ] **Step 2: Run the pipeline tests and confirm failure**

Run: `python -m pytest tests/pipeline/test_clean.py tests/pipeline/test_parse.py tests/pipeline/test_classify.py tests/pipeline/test_dedupe.py -q`

Expected: FAIL because cleaning and parsing modules are absent.

- [ ] **Step 3: Implement deterministic cleaning and segmentation**

Normalize Unicode width and whitespace while preserving paragraphs, table rows, percentages, currency, signs, and numbered steps. Remove a line only when it matches reviewed advertising/contact patterns or repeats on at least 35% of pages in the same document. Segment cases at observed case-title markers, questions at numbered question markers, and answers at answer/analysis markers. Store unparsed spans in a review queue rather than dropping them.

- [ ] **Step 4: Implement chapter classification and auditable overrides**

Define exactly 11 chapter records in `content/chapters.json`. Give explicit chapter-numbered source files first priority, then reviewed knowledge-keyword scoring, then `content/overrides.json`. Any score tie or confidence below `0.65` enters `needs_review` and blocks final publication.

- [ ] **Step 5: Implement exact/fuzzy de-duplication**

Create a normalized fingerprint from background plus questions after removing source labels, whitespace, punctuation variance, and anonymized entity letters. Merge exact fingerprints automatically. Use RapidFuzz token-set ratio at 94 or higher only as a proposed group; require compatible numeric facts and question counts before auto-merge. Preserve every source reference and choose the most complete answer per subquestion by non-advertising content length.

- [ ] **Step 6: Verify all pipeline tests**

Run: `python -m pytest tests/pipeline -q`

Expected: PASS, including preservation of calculation symbols and source references.

- [ ] **Step 7: Commit the content-structuring pipeline**

Run: `git add scripts content/chapters.json content/overrides.json tests/pipeline && git commit -m "feat: structure and deduplicate study questions"`

---

### Task 4: Build Validated Content Shards and Coverage Reports

**Files:**
- Create: `scripts/build_content.py`
- Create: `content/schema/question-bank.schema.json`
- Create: `tests/pipeline/test_build_content.py`
- Generate: `public/data/manifest.json`
- Generate: `public/data/chapters/chapter-01.json` through `chapter-11.json`
- Generate: `public/data/exams/*.json`
- Generate: `public/data/coverage.json`
- Generate: `content/reports/review-queue.json`
- Generate: `content/reports/deduplication.json`

**Interfaces:**
- Produces: `public/data/manifest.json` with `{version, generatedAt, chapters, exams, totals}` and valid chapter/exam shards.
- Consumes: Task 3 models, source manifest, chapter catalog, overrides, and `.work/raw` extraction output.

- [ ] **Step 1: Write a failing end-to-end fixture test**

Use three miniature source documents: one chapter case, one duplicate with a longer answer, and one mock paper. Assert one merged chapter case, one exam mapping, two source references, a zero-item review queue, and a coverage record for every fixture PDF.

- [ ] **Step 2: Run the focused build test**

Run: `python -m pytest tests/pipeline/test_build_content.py -q`

Expected: FAIL because orchestration is absent.

- [ ] **Step 3: Implement orchestration and strict validation**

Run all stages, apply overrides, validate against the JSON Schema, split chapter/exam files, and fail with exit code 1 if any source is unprocessed, any case lacks answer/provenance/chapter, any mock mapping points to a missing case, or `needs_review` is nonempty. Coverage must count PDFs, pages, parsed cases, subquestions, merged duplicates, warnings, and per-chapter totals.

- [ ] **Step 4: Generate the full dataset and resolve review items**

Run: `python scripts/build_content.py --source-root "E:\BaiduNetdiskDownload\2026年咨询【实务】SVIP\2026年咨询【实务】SVIP\03-习题精析✿实战特训✿模考通关" --work-dir .work --output public/data`

Expected first run: either success or a finite review queue. Inspect every queued formula/table/split/classification against its source PDF and encode corrections in `content/overrides.json`; rerun until the review queue is empty and all 60 PDFs are covered.

- [ ] **Step 5: Run all pipeline tests and commit generated authorized content**

Run: `python -m pytest tests/pipeline -q`

Expected: PASS.

Run: `git add scripts content public/data tests/pipeline && git commit -m "content: publish validated chapter and exam data"`

---

### Task 5: Add Typed Data Loading, Search, and Persisted Study State

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/manifest.ts`
- Create: `src/domain/search.ts`
- Create: `src/store/studyStore.ts`
- Create: `src/data/manifest.test.ts`
- Create: `src/domain/search.test.ts`
- Create: `src/store/studyStore.test.ts`

**Interfaces:**
- Produces: `loadManifest(): Promise<ContentManifest>`, `loadChapter(id: string): Promise<ChapterShard>`, `loadExam(id: string): Promise<ExamShard>`, and `createSearchIndex(cases: CaseQuestion[]): Fuse<SearchDocument>`.
- Produces: `useStudyStore` actions `setDraft`, `toggleBookmark`, `setMastery`, `setLastLocation`, `startExam`, `submitExam`, `resetLocalData`.
- Consumes: JSON structures produced by Task 4.

- [ ] **Step 1: Write loader, search, persistence, and migration tests**

Mock fetch to assert repository-base URLs are honored. Assert search matches a background fact, answer keyword, knowledge topic, and source year. Seed version-1 local storage, initialize the store, and assert migration preserves bookmarks while creating empty exam sessions.

- [ ] **Step 2: Confirm the tests fail**

Run: `npm test -- --run src/data/manifest.test.ts src/domain/search.test.ts src/store/studyStore.test.ts`

Expected: FAIL because modules are absent.

- [ ] **Step 3: Implement typed loaders, search projection, and versioned storage**

Use `new URL('data/manifest.json', import.meta.env.BASE_URL)` for data URLs. Index title, background plain text, subquestion prompts, answer text, topics, sources, and year with weighted Fuse keys. Persist only learner state—not loaded question content—under `consult-practice-study-v2`.

- [ ] **Step 4: Verify state behavior and commit**

Run: `npm test -- --run src/data/manifest.test.ts src/domain/search.test.ts src/store/studyStore.test.ts`

Expected: PASS.

Run: `git add src/domain src/data src/store && git commit -m "feat: load question data and persist study progress"`

---

### Task 6: Build the Dashboard and Chapter Study Experience

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/components/ProgressRing.tsx`
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/QuestionCard.tsx`
- Create: `src/components/SourceNote.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/pages/DashboardPage.tsx`
- Create: `src/pages/ChapterPage.tsx`
- Create: `src/pages/ReviewPage.tsx`
- Create: `src/pages/SearchPage.tsx`
- Create: `src/components/QuestionCard.test.tsx`
- Create: `src/pages/ChapterPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: routes `#/`, `#/chapters/:chapterId`, `#/review`, and `#/search`.
- Consumes: typed loaders and study store from Task 5.

- [ ] **Step 1: Write answer-hiding and study-action tests**

Render a case with two subquestions. Assert answers and analysis are absent initially; draft typing calls `setDraft`; reveal shows both answers; bookmark and mastery buttons expose pressed state; and the source note contains document name and page range.

- [ ] **Step 2: Run component tests and confirm failure**

Run: `npm test -- --run src/components/QuestionCard.test.tsx src/pages/ChapterPage.test.tsx`

Expected: FAIL because pages/components are absent.

- [ ] **Step 3: Implement the first meaningful dashboard slice**

Build the app shell, title, 11 chapter progress cards, continue-study card, review counts, and mock-exam entry using real manifest data. Apply paper/ink/teal tokens, readable line length, focus styles, responsive chapter grid, and reduced-motion handling.

- [ ] **Step 4: Start the dev server and hand off the first working preview**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints one Local URL and compiles without error. Make one lightweight request to that exact URL, then open it in the existing Codex window. Make no broad visual changes before this handoff except blocking fixes.

- [ ] **Step 5: Implement chapter, review, and search routes**

Add responsive chapter/topic navigation, filter chips for source/year/type/difficulty/status, question pagination, drafts, answer reveal, mastery, bookmarks, previous/next navigation, provenance, fuzzy search, and empty states. Keep answer DOM unmounted before reveal, not merely visually hidden.

- [ ] **Step 6: Verify component tests and commit**

Run: `npm test -- --run src/components/QuestionCard.test.tsx src/pages/ChapterPage.test.tsx`

Expected: PASS.

Run: `git add src && git commit -m "feat: add chapter-focused study experience"`

---

### Task 7: Build the Timed Self-Assessed Mock Exam

**Files:**
- Create: `src/domain/exam.ts`
- Create: `src/domain/exam.test.ts`
- Create: `src/components/ExamTimer.tsx`
- Create: `src/components/ExamNavigator.tsx`
- Create: `src/pages/ExamListPage.tsx`
- Create: `src/pages/ExamRunnerPage.tsx`
- Create: `src/pages/ExamRunnerPage.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `createExamSession(exam, now)`, `elapsedSeconds(session, now)`, `answerExamQuestion(session, caseId, text)`, and `submitExam(session, now)` pure functions.
- Produces: routes `#/exams` and `#/exams/:examId`.
- Consumes: exam shards and persisted store interfaces from Task 5.

- [ ] **Step 1: Write exam state-machine and page tests**

Assert elapsed time survives a simulated reload, drafts are keyed by case and subquestion, answers are unavailable while status is `active`, submission freezes elapsed time, and post-submission self-assessment updates `mastery` without calculating a numeric grade.

- [ ] **Step 2: Confirm focused tests fail**

Run: `npm test -- --run src/domain/exam.test.ts src/pages/ExamRunnerPage.test.tsx`

Expected: FAIL because exam modules are absent.

- [ ] **Step 3: Implement pure exam transitions and routes**

Provide start confirmation, suggested duration, monotonic elapsed display based on stored timestamps, question navigator, autosaved drafts, answered-state labels, submit confirmation, frozen post-submit summary, answer reveal, and per-subquestion self-assessment. Resume an active session automatically after refresh.

- [ ] **Step 4: Verify tests and commit**

Run: `npm test -- --run src/domain/exam.test.ts src/pages/ExamRunnerPage.test.tsx`

Expected: PASS.

Run: `git add src && git commit -m "feat: add timed mock exam workflow"`

---

### Task 8: Validate Accessibility, Content Coverage, and GitHub Pages Deployment

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/study-flow.spec.ts`
- Create: `scripts/verify_coverage.py`
- Create: `.github/workflows/pages.yml`
- Create: `README.md`
- Modify: `package.json`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: `npm run check`, `npm run test:e2e`, and a Pages workflow triggered on `main`.
- Consumes: the complete app and generated content from Tasks 1–7.

- [ ] **Step 1: Write critical-flow browser tests**

At desktop and mobile widths, test dashboard load, chapter navigation, hidden answer, draft persistence after reload, answer reveal, mastery, bookmark appearance in review, search, exam start, draft, submit, and post-submit answer visibility. Include keyboard-only activation and assert no page-level horizontal overflow.

- [ ] **Step 2: Add strict content verification**

`verify_coverage.py` must fail unless source count is 60, total source pages are 980, every source status is processed, every case has provenance and answer content, chapters 1–11 all contain cases, every exam reference resolves, and the review queue is empty.

- [ ] **Step 3: Configure GitHub Pages workflow**

The workflow uses `actions/checkout`, `actions/setup-node`, `npm ci`, `npm test -- --run`, `npm run build` with `VITE_BASE_PATH=/${{ github.event.repository.name }}/`, `actions/configure-pages`, `actions/upload-pages-artifact` with `dist`, and `actions/deploy-pages`. Grant only `contents: read`, `pages: write`, and `id-token: write`.

- [ ] **Step 4: Run final local validation**

Run: `python scripts/verify_coverage.py content/source-manifest.json public/data/coverage.json public/data`

Expected: `60 PDFs / 980 pages / 11 chapters / 0 review items` and exit code 0.

Run: `npm run check`

Expected: all unit/component tests and TypeScript checks pass.

Run: `npm run build`

Expected: production build succeeds.

Run: `npm run test:e2e`

Expected: desktop and mobile projects pass with no console errors.

- [ ] **Step 5: Commit deployment configuration**

Run: `git add .github README.md package.json package-lock.json vite.config.ts playwright.config.ts e2e scripts/verify_coverage.py && git commit -m "ci: validate and deploy study site to github pages"`

- [ ] **Step 6: Create the GitHub repository and publish**

Create a public repository named `consulting-practice-2026`, add it as `origin`, push `main`, enable Pages with GitHub Actions, and wait for the workflow to succeed. If GitHub authentication is absent, request the user's sign-in at this step only.

- [ ] **Step 7: Verify the deployed site and hand off**

Open the exact GitHub Pages URL, confirm the dashboard and one chapter data shard return successfully, and reuse the existing browser tab for the deployed site. Deliver the Pages URL, repository URL, content totals, and browser-local data note.
