# POS Config — AI 资源消费配置

开源的 AI 模型选型与 MCP 资源配置。

## 内容

- `ai-ops-orchestrator/model-map.json` — **POS AI 资源消费统一底座**
  - 多 provider 全量模型列表 + 价格
  - 免费模型层（free[]）
  - MCP 资源层（mcp[]）
  - 任务类型 → 模型推荐映射（task_types）

## 消费方式

```bash
# 直接 fetch（启动时拉取，本地缓存）
curl -s https://raw.githubusercontent.com/dingmanjiang/pos-config/main/ai-ops-orchestrator/model-map.json > model-map.snapshot.json

# 或 git submodule
git submodule add https://github.com/dingmanjiang/pos-config.git
```

## 维护节奏

- 30 天 review / 旗舰模型发布触发
- 人工核对 + 派生更新

## 贡献

欢迎 PR：
- 新增 provider / 模型
- 纠正价格或能力信息
- 改进 task_type 推荐

## License

MIT
