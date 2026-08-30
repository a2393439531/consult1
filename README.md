# 2026 咨询实务题库

按章节复习《现代咨询方法与实务》的静态题库网站。题卡默认隐藏答案，支持草稿、自评、收藏、待复习、全文搜索和整卷计时模考。

## 内容覆盖

- 119 份授权 PDF，1803 页原始内容；视频文件未纳入（新增冲刺串讲、考点强化与小灶集训资料）。
- 11 个章节、109 个去重后的案例题组、752 个小问、18 套整卷试卷。
- 每道题保留来源文件与页码；重复题合并并保留全部来源。

## 本地开发

```powershell
npm install
npm run dev
```

内容管线需要 Python 3.11+、MarkItDown 和 Poppler。原始 PDF 路径只通过命令行参数传入，不写入仓库：

```powershell
python scripts/inventory.py --source-root "<授权 PDF 目录>" --output content/source-manifest.json
python scripts/extract.py --source-root "<授权 PDF 目录>" --manifest content/source-manifest.json --raw-dir .work/raw
python -m scripts.build_content --manifest content/source-manifest.json --raw-dir .work/raw --output public/data
python scripts/verify_coverage.py content/source-manifest.json public/data/coverage.json public/data
```

## 学习记录

草稿、收藏、掌握状态和未交卷模考只保存在当前浏览器的 `localStorage`，清理浏览器数据会删除它们；仓库和 GitHub Pages 不保存个人学习记录。

## 发布

推送 `main` 后，`.github/workflows/pages.yml` 会校验内容、测试、构建并部署到 GitHub Pages。仓库只包含结构化题库和网站源代码，不包含原始 PDF。
