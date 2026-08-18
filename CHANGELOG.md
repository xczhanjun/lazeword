# Changelog

按 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 惯例记录，版本遵循语义化。

## [0.3.0] — 2026-08

### 新增

- **🔤 LLM Tokenizer（GPT-2 BPE）**：背单词卡片显示真实分词（如 transformer → trans·former，2 词元）+ 教学词素拆解双行；词表构建时 gzip+base64 内联（+280KB），离线可用；「词元（token）= 与 AI 交流的最基本单位」写入 README 名字章节
- **🎓 AI 私教 tab**：一节课 = 备课（轨迹诊断挑词）→ 讲课（AI 讲解三级降级）→ 练习（确定性出题）→ 批改（AI 批造句、写回 FSRS）→ 下课（课堂记录进热力图）；英数双科，离线降级为纯确定性课堂
- **🎓 DSE 专题 tab**：HKEAA 大纲目录（数学必修 3 范畴 18 课题）→ `dsePrompt` 生成大纲+诊断 prompt → 交给 dsh 开发互动 UI 或本机沙箱运行
- **🧪 Prompt 测试 tab**：10 个 UI/前端生成 prompt（英文）+ 40 词条入词库；`/api/ai-gen` + 沙箱 iframe（allow-scripts + CSP 禁联网，产物隔离可审计）
- **📦 场景分享（laze.json）**：场景标准 v0.1（`validateLaze` 校验器 + runner 组合器）+ 48 份入门场景包 + 导入/导出/一键运行
- **🐳 dsh 互通**：header 直达链接（地址可配）+「交給 AI 老師」（今日词打包提示语复制并打开 dsh）
- **🛒 生態推薦**：精选 dsh 插件 / memvid 工具 / 官方 skills（6 个本地化适配版安装于 .agents/skills）
- **确定性部署**：Dockerfile（digest 固定多阶段）+ NixOS flake（package/devShell/systemd module）+ 零依赖 server（与 Cloudflare Worker 共用 handlers）
- **Playwright E2E**：5 条关键流（背单词轨迹 / 考试数学判分 / 字母游戏 / 私教闭环 / 场景分享）+ CI job
- **文档**：scenario-engine（词=实体、句=场景）、laze-json（场景标准）、scenario-farm（RL 调研）、benchmark-enjoy（对标）、deployment、roadmap、README 名字章节（laze 是舒适与信任；词元是词的工程化形态）

### 修复

- 考试引擎数学判分：答案值与选项索引混淆（此前数学选择题永远判错）
- worker 词典端点：`synonyms` 未声明导致 500（客户端直连兜底掩盖）
- URL 深链在清空存储后被 boot 的 syncUrl 覆写（BOOT_URL_PARAMS 启动快照）
- 场景运行被 `switchTab("quiz")` 的 resetQuizSetup 重置隐藏

### 数据

- ai pack 论文层 +「工程實踐」组（Andrew Ng Skills Map、Karpathy AI Engineering 讲座）
- prompts pack（40 词 + 10 prompt）；场景农场 48 份 starter 场景
- DSE 数学大纲目录（HKEAA 事实性重述，署名）

## [0.2.0] — 2026-08

- 首个发布版：14,968 词条（EDB 数学/科学/地理 + Oxford 5000 + 中华文化等）、FSRS-5、Anki 兼容、五游戏、躺平模式、繁简切换、AI 故事/对话、dsh 插件形态 + 独立单文件
