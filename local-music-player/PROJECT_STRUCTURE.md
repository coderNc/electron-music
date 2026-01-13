# Project Structure

## Directory Layout

```
local-music-player/
├── .vscode/                    # VS Code 配置
├── build/                      # 构建资源（应用图标）
├── node_modules/               # 依赖包
├── out/                        # 构建输出
├── resources/                  # 应用资源
├── src/                        # 源代码
│   ├── main/                   # 主进程（Node.js 环境）
│   │   ├── services/           # 主进程服务
│   │   │   ├── FileService.ts          # 文件系统操作
│   │   │   ├── MetadataService.ts      # 元数据解析
│   │   │   └── PersistenceService.ts   # 数据持久化
│   │   └── index.ts            # 主进程入口
│   │
│   ├── preload/                # 预加载脚本（桥接主进程和渲染进程）
│   │   ├── index.d.ts          # 类型定义
│   │   └── index.ts            # IPC 通信桥接
│   │
│   ├── renderer/               # 渲染进程（浏览器环境）
│   │   ├── src/
│   │   │   ├── assets/         # 静态资源
│   │   │   │   └── main.css    # 全局样式（Tailwind）
│   │   │   │
│   │   │   ├── components/     # React 组件
│   │   │   │   ├── layout/     # 布局组件
│   │   │   │   ├── library/    # 音乐库组件
│   │   │   │   ├── player/     # 播放器组件
│   │   │   │   ├── playlist/   # 播放列表组件
│   │   │   │   └── queue/      # 播放队列组件
│   │   │   │
│   │   │   ├── services/       # 渲染进程服务
│   │   │   │   ├── AudioService.ts     # 音频播放（Howler.js）
│   │   │   │   └── IPCService.ts       # IPC 通信封装
│   │   │   │
│   │   │   ├── stores/         # Zustand 状态管理
│   │   │   │   ├── playerStore.ts      # 播放器状态
│   │   │   │   ├── libraryStore.ts     # 音乐库状态
│   │   │   │   ├── playlistStore.ts    # 播放列表状态
│   │   │   │   └── uiStore.ts          # UI 状态
│   │   │   │
│   │   │   ├── hooks/          # 自定义 React Hooks
│   │   │   │   ├── usePlayer.ts
│   │   │   │   ├── useLibrary.ts
│   │   │   │   └── useKeyboard.ts
│   │   │   │
│   │   │   ├── test/           # 测试配置
│   │   │   │   └── setup.ts    # Vitest 设置
│   │   │   │
│   │   │   ├── App.tsx         # 应用根组件
│   │   │   ├── main.tsx        # 渲染进程入口
│   │   │   └── env.d.ts        # 环境类型定义
│   │   │
│   │   └── index.html          # HTML 模板
│   │
│   └── shared/                 # 共享代码（主进程和渲染进程都可用）
│       └── types/              # TypeScript 类型定义
│           ├── index.ts        # 核心类型
│           └── index.test.ts   # 类型测试
│
├── .editorconfig               # 编辑器配置
├── .eslintcache                # ESLint 缓存
├── .gitignore                  # Git 忽略文件
├── .prettierignore             # Prettier 忽略文件
├── .prettierrc.yaml            # Prettier 配置
├── electron-builder.yml        # Electron Builder 配置
├── electron.vite.config.ts     # Electron Vite 配置
├── eslint.config.mjs           # ESLint 配置
├── package.json                # 项目配置和依赖
├── postcss.config.js           # PostCSS 配置
├── README.md                   # 项目说明
├── tailwind.config.js          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 根配置
├── tsconfig.node.json          # Node 环境 TypeScript 配置
├── tsconfig.web.json           # Web 环境 TypeScript 配置
└── vitest.config.ts            # Vitest 测试配置
```

## 模块说明

### 主进程 (Main Process)

主进程运行在 Node.js 环境中，负责：

- 文件系统操作（扫描文件夹、读取文件）
- 音频文件元数据解析
- 数据持久化（electron-store）
- 窗口管理
- IPC 通信处理

### 预加载脚本 (Preload)

预加载脚本在渲染进程启动前运行，负责：

- 暴露安全的 IPC 通信接口给渲染进程
- 桥接主进程和渲染进程
- 确保上下文隔离（Context Isolation）

### 渲染进程 (Renderer Process)

渲染进程运行在浏览器环境中，负责：

- UI 渲染（React 组件）
- 音频播放（Howler.js）
- 状态管理（Zustand）
- 用户交互处理

### 共享代码 (Shared)

共享代码包含主进程和渲染进程都需要的：

- TypeScript 类型定义
- 常量定义
- 工具函数

## 技术栈

### 核心框架

- **Electron**: 跨平台桌面应用框架
- **Vite**: 快速的构建工具
- **React 18**: UI 框架
- **TypeScript**: 类型安全

### UI 和样式

- **Tailwind CSS**: 实用优先的 CSS 框架
- **shadcn/ui**: 高质量的 React 组件库

### 状态管理

- **Zustand**: 轻量级状态管理

### 音频和媒体

- **Howler.js**: 音频播放引擎
- **music-metadata**: 音频文件元数据解析

### 性能优化

- **react-virtuoso**: 虚拟化长列表

### 数据持久化

- **electron-store**: 简单的数据持久化

### 测试

- **Vitest**: 快速的单元测试框架
- **fast-check**: 属性测试库
- **@testing-library/react**: React 组件测试
- **happy-dom**: 轻量级 DOM 实现

### 代码质量

- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

## 开发工作流

1. **开发模式**: `npm run dev`
   - 启动 Electron 应用
   - 热重载支持
   - 开发者工具

2. **测试**: `npm test`
   - 运行所有测试
   - 单元测试和属性测试

3. **类型检查**: `npm run typecheck`
   - 检查 TypeScript 类型错误

4. **代码检查**: `npm run lint`
   - 运行 ESLint

5. **代码格式化**: `npm run format`
   - 使用 Prettier 格式化代码

6. **构建**: `npm run build`
   - 构建生产版本

7. **打包**: `npm run build:win` / `build:mac` / `build:linux`
   - 打包成可分发的安装包

## 路径别名

项目配置了以下路径别名：

- `@renderer/*` → `src/renderer/src/*`
- `@main/*` → `src/main/*`
- `@shared/*` → `src/shared/*`

使用示例：

```typescript
import { TrackMetadata } from '@shared/types'
import { AudioService } from '@renderer/services/AudioService'
import { FileService } from '@main/services/FileService'
```

## 下一步

参考 `.kiro/specs/local-music-player/tasks.md` 中的任务列表，按顺序实现各个功能模块。
