# 贡献指南

**[English](CONTRIBUTING.md)** | **[中文](CONTRIBUTING.zh-CN.md)**

感谢你有兴趣参与！本项目分两层——请确保往正确的层贡献。

## 贡献哪一层？

| 层 | 文件 | 维护方式 | 如何贡献 |
|----|------|----------|----------|
| **客观层** | `models.json` | 从 [models.dev](https://models.dev) 自动同步 | **不要**手动编辑。请到 models.dev 上游修复，或在此开 Issue |
| **主观层** | `routing.json` | 人工维护 | 欢迎 PR——这才是核心价值 |

**不要手动编辑 `models.json` 或 `model-map.json`。** 它们是自动生成的。编辑后会被 `npm run sync` / `npm run build` 覆盖，且会导致 CI 失败。

## 最有价值的贡献：路由证据

最有用的 PR 是**用证据强化路由推荐**——把 `low`/`medium` 置信度的条目提升为 `high`，并附上可复现的数据。

请先阅读 [METHODOLOGY.md](METHODOLOGY.md)。然后：

1. 在 `routing.json` 中选取一个 `task_types` 条目。
2. 做最小规模的诚实测试（几个用例、一个可记录的指标——不是凭感觉）。
3. 更新其 `primary`/`fallback`/`downgrade` 和 `evidence` 块：
   ```json
   "evidence": {
     "confidence": "high",
     "source": "Terminal-Bench 2026-05 / 12 internal cases",
     "metric": "pass@1 0.82 vs GLM 0.51",
     "url": "https://..."
   }
   ```
4. `npm run validate` 必须通过。

诚实的 `low` 置信度 PR 暴露了差距，同样欢迎。毫无证据却充满自信的主张则不然。

## 其他贡献方式

### 向客观层添加 Provider
编辑 `tools/sync.config.json` 中的白名单，然后执行 `npm run sync`。使用 models.dev 的 provider id（可通过 models.dev API 查询）。不要手动添加模型。

### 添加 MCP 资源
在 `routing.json` 的 `mcp` 下添加：
```json
"mcp": {
  "provider-name": [
    { "name": "...", "url": "...", "type": "remote",
      "auth": "header:Authorization=${ENV_VAR}",
      "capabilities": ["..."], "note": "..." }
  ]
}
```

### 修正价格
价格来源于 models.dev。如果某个价格有误，请到上游 [models.dev](https://github.com/sst/models.dev) 修复，然后在此执行 `npm run sync`。

## PR 流程

1. Fork 并创建分支。
2. 修改 `routing.json`（或 `tools/sync.config.json`）。
3. `npm run ci`（validate + build）必须通过。
4. 连同你的改动一起提交重新生成的 `model-map.json`。
5. 开一个 PR，描述改动内容、测试方法和数据来源。

## 有问题？

开一个 Issue 讨论。
