# AI Resource Config — 战略定位

## 使命

**成为个人/小团队 AI 开发者的模型选型权威参考。**

不是又一个 LLM 排行榜，而是**可直接消费的配置文件**——fetch 即用，覆盖价格、能力、路由策略。

## 定位

| 维度 | 定位 |
|------|------|
| **用户** | 个人开发者、小团队、独立 AI 应用 |
| **问题** | 多 provider 模型选型混乱、价格信息分散、缺乏统一消费入口 |
| **形态** | 静态配置文件（JSON），GitHub raw URL 直接 fetch |
| **不做** | 运行时服务、API gateway、用量追踪 |

## 与竞品的差异

| 项目 | 形态 | 我们的差异 |
|------|------|-----------|
| LiteLLM | 运行时 proxy | 我们是静态配置，零运行时依赖 |
| OpenRouter | 聚合服务 | 我们是开源数据，不绑定任何服务商 |
| models.dev | 模型目录 | 我们有 task_type 路由 + MCP 资源 |
| llm-prices | 价格展示 | 我们是机器可读配置，不只是人看 |

## 核心价值

1. **一个 URL 搞定**：`curl` 一下就有完整模型目录 + 价格
2. **可直接消费**：JSON 结构稳定，代码直接 parse
3. **决策辅助**：`task_types` 告诉你什么任务用什么模型
4. **社区维护**：价格变了？提 PR，一起修

## 路线图

### Phase 1：POS 内部消费（当前）
- [x] ZenMux 全量模型 + 价格
- [x] Z.AI 模型 + MCP 资源
- [x] OpenAI Plus 模型
- [x] task_types 路由策略
- [ ] AI-Gateway 消费验证

### Phase 2：扩展 Provider 覆盖
- [ ] OpenRouter（聚合平台，模型最全）
- [ ] Groq（推理速度快）
- [ ] Together AI
- [ ] Fireworks
- [ ] Anthropic Direct（非聚合）
- [ ] Google AI Studio

### Phase 3：工具链
- [ ] CLI：`npx ai-resource-config cheapest --provider zenmux`
- [ ] 自动更新脚本：从 provider API 拉取价格
- [ ] VS Code 扩展：模型选型提示

### Phase 4：社区生态
- [ ] 贡献者指南完善
- [ ] 自动化 CI（JSON schema 校验、价格变化检测）
- [ ] 定期发布（monthly release tag）
- [ ] 集成到其他项目（LangChain、LlamaIndex 等）

## 更新节奏

| 触发条件 | 动作 |
|----------|------|
| 每月 1 号 | 30 天 review：核对价格、补充新模型 |
| 旗舰发布 | 即时更新：如 Claude Fable 5、GPT-5.5 |
| 社区 PR | 按需合并：价格修正、新 provider |

## 质量标准

1. **准确**：价格误差 < 5%，来源可追溯
2. **完整**：主流 provider 覆盖率 > 80%
3. **及时**：旗舰模型发布 48h 内更新
4. **稳定**：JSON schema 向后兼容

## 成功指标

| 指标 | 目标（6 个月） |
|------|---------------|
| GitHub Stars | 100+ |
| 贡献者 | 5+ |
| Provider 覆盖 | 10+ |
| 被引用项目 | 3+ |

---

*这个项目的存在意义：让每个独立开发者都能像大厂一样，清楚知道该用什么模型、花多少钱。*
