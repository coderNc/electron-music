# Local Music Player

一个基于 Electron + React + TypeScript 的本地音乐播放器。

## 技术栈

- **框架**: Electron + Vite + React 18 + TypeScript
- **UI 库**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **音频引擎**: Howler.js
- **元数据解析**: music-metadata
- **列表虚拟化**: react-virtuoso
- **数据持久化**: electron-store
- **测试框架**: Vitest + fast-check
- **打包工具**: electron-builder

## 项目结构

```
local-music-player/
├── src/
│   ├── main/              # 主进程代码
│   │   ├── services/      # 主进程服务（文件系统、元数据解析、持久化）
│   │   └── index.ts       # 主进程入口
│   ├── preload/           # 预加载脚本
│   │   └── index.ts       # IPC 通信桥接
│   ├── renderer/          # 渲染进程代码
│   │   └── src/
│   │       ├── assets/    # 静态资源
│   │       ├── components/# React 组件
│   │       ├── services/  # 渲染进程服务（音频播放、IPC）
│   │       ├── stores/    # Zustand 状态管理
│   │       ├── hooks/     # 自定义 React Hooks
│   │       ├── test/      # 测试配置和工具
│   │       ├── App.tsx    # 应用根组件
│   │       └── main.tsx   # 渲染进程入口
│   └── shared/            # 共享代码
│       └── types/         # TypeScript 类型定义
├── build/                 # 构建资源（图标等）
├── resources/             # 应用资源
└── out/                   # 构建输出目录
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 测试监听模式
npm run test:watch

# 测试 UI
npm run test:ui

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 代码检查
npm run lint

# 构建应用
npm run build

# 构建并打包（Windows）
npm run build:win

# 构建并打包（macOS）
npm run build:mac

# 构建并打包（Linux）
npm run build:linux
```

## 功能特性

- ✅ 本地文件夹扫描和音乐库管理
- ✅ 音频文件元数据解析
- ✅ 音频播放控制（播放、暂停、上一曲、下一曲、进度控制、音量控制）
- ✅ 播放列表管理
- ✅ 播放队列管理
- ✅ 多种播放模式（顺序、随机、单曲循环、列表循环）
- ✅ 搜索和筛选功能
- ✅ 虚拟化长列表优化性能
- ✅ 数据持久化
- ✅ 键盘快捷键支持
- ✅ 亮色/暗色主题切换

## 开发指南

### 添加新功能

1. 在 `src/shared/types/` 中定义类型
2. 在 `src/main/services/` 中实现主进程服务
3. 在 `src/renderer/src/services/` 中实现渲染进程服务
4. 在 `src/renderer/src/stores/` 中添加状态管理
5. 在 `src/renderer/src/components/` 中创建 UI 组件
6. 编写测试（单元测试和属性测试）

### 测试策略

本项目采用双重测试策略：

- **单元测试**: 验证特定示例、边缘情况和错误条件
- **属性测试**: 使用 fast-check 验证通用属性在所有输入下都成立

每个属性测试至少运行 100 次迭代，并使用标签格式：

```typescript
// Feature: local-music-player, Property {number}: {property_text}
```

## 许可证

MIT
