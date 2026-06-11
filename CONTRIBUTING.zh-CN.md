# 贡献指南

**[English](CONTRIBUTING.md)** | **[中文](CONTRIBUTING.zh-CN.md)**

感谢你有兴趣参与贡献！

## 贡献方式

### 1. 更新定价数据

价格变化频繁。如果你发现过时的价格：

1. 查阅 Provider 的官方定价页
2. 更新 `model-map.json` 中的对应值
3. 提交 PR，在描述中附上数据来源链接

### 2. 添加新 Provider

添加新 Provider（如 Groq、Together、Fireworks）：

1. 在 `model-map.json` 的 `providers` 部分添加条目：

```json
"groq": {
  "role": "inference-provider",
  "all_models": [
    {"id": "llama-3.3-70b", "cost": {"input": 0.59, "output": 0.79}, "context": 131072, "reasoning": true}
  ],
  "recommended": ["llama-3.3-70b"],
  "free": [],
  "flagship": "llama-3.3-70b",
  "economy_downgrade": "llama-3.3-8b",
  "mcp": []
}
```

2. 附上数据来源（API 端点或定价页 URL）

### 3. 添加 MCP 资源

如果 Provider 提供 MCP 服务器：

```json
"mcp": [
  {
    "name": "tool-name",
    "url": "https://...",
    "type": "remote",
    "auth": "header:Authorization=${ENV_VAR}",
    "capabilities": ["capability1", "capability2"],
    "note": "Brief description"
  }
]
```

### 4. 改进任务类型路由

`task_types` 部分将任务类别映射到推荐模型。如果你有证据（基准测试、实际使用经验）表明其他模型更适合：

1. 描述任务类型
2. 分享你的测试方法
3. 提出修改建议

## Pull Request 流程

1. Fork 本仓库
2. 创建分支：`git checkout -b add-groq-provider`
3. 做出修改
4. 验证 JSON 有效性：`cat model-map.json | jq .`
5. 提交 PR，描述修改内容和数据来源

## 数据质量规范

- **标注来源**：附上官方定价页或 API 响应的链接
- **统一单位**：定价使用 $/MTok（美元/百万 token）
- **标记不确定性**：如果价格是估算的，添加 `note` 字段
- **保持简洁**：不需要追踪每个模型变体，聚焦常用模型

## 有问题？

开一个 Issue 讨论。
