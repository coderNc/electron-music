# 项目结构

## 目录布局

```
local-music-player/
├── src/
│   ├── main/                   # 主进程 (Node.js 环境)
│   │   ├── services/           # 主进程服务
│   │   │   ├── file-service.ts         # 文件系统操作
│   │   │   ├── metadata-service.ts     # 元数据解析
│   │   │   ├── persistence-service.ts  # 数据持久化
│   │   │   └── index.ts                # 服务导出
│   │   ├── ipc/                # IPC 处理器
│   │   │   └── index.ts        # IPC 通道定义和处理
│   │   └── index.ts            # 主进程入口
│   │
│   ├── preload/                # 预加载脚本
│   │   ├── index.ts            # IPC 通信桥接
│   │   └── index.d.ts          # 类型定义
│   │
│   ├── renderer/               # 渲染进程 (浏览器环境)
│   │   ├── index.html          # HTML 模板
│   │   └── src/
│   │       ├── assets/         # 静态资源
│   │       │   ├── base.css    # 基础样式
│   │       │   └── main.css    # 主样式 (Tailwind)
│   │       │
│   │       ├── components/     # React 组件
│   │       │   ├── common/     # 通用组件
│   │       │   │   ├── LazyImage.tsx
│   │       │   │   └── ThemeToggle.tsx
│   │       │   ├── feedback/   # 反馈组件
│   │       │   │   ├── ConfirmDialog.tsx
│   │       │   │   ├── ErrorBoundary.tsx
│   │       │   │   └── Toast.tsx
│   │       │   ├── layout/     # 布局组件
│   │       │   │   ├── AppLayout.tsx
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   └── PlayerBar.tsx
│   │       │   ├── library/    # 音乐库组件
│   │       │   │   ├── LibraryView.tsx
│   │       │   │   ├── TrackList.tsx
│   │       │   │   ├── AlbumGrid.tsx
│   │       │   │   ├── ArtistList.tsx
│   │       │   │   ├── SearchBar.tsx
│   │       │   │   └── ScanProgress.tsx
│   │       │   ├── player/     # 播放器组件
│   │       │   │   ├── PlaybackControls.tsx
│   │       │   │   ├── ProgressBar.tsx
│   │       │   │   └── VolumeControl.tsx
│   │       │   ├── playlist/   # 播放列表组件
│   │       │   │   ├── PlaylistView.tsx
│   │       │   │   ├── PlaylistDetail.tsx
│   │       │   │   └── CreatePlaylistDialog.tsx
│   │       │   ├── queue/      # 播放队列组件
│   │       │   │   └── QueuePanel.tsx
│   │       │   └── lyrics/     # 歌词组件
│   │       │       └── LyricsPanel.tsx
│   │       │
│   │       ├── contexts/       # React Context
│   │       │   └── SearchInputContext.tsx
│   │       │
│   │       ├── hooks/          # 自定义 Hooks
│   │       │   ├── useAppInitialization.ts
│   │       │   ├── useConfirmDialog.ts
│   │       │   ├── useErrorNotifications.ts
│   │       │   ├── useKeyboardShortcuts.ts
│   │       │   ├── useLyrics.ts
│   │       │   └── useTheme.ts
│   │       │
│   │       ├── services/       # 渲染进程服务
│   │       │   ├── audio-service.ts    # 音频播放 (Howler.js)
│   │       │   └── ipc-service.ts      # IPC 通信封装
│   │       │
│   │       ├── stores/         # Zustand 状态管理
│   │       │   ├── player-store.ts     # 播放器状态
│   │       │   ├── library-store.ts    # 音乐库状态
│   │       │   ├── playlist-store.ts   # 播放列表状态
│   │       │   ├── ui-store.ts         # UI 状态
│   │       │   └── toast-store.ts      # Toast 通知状态
│   │       │
│   │       ├── utils/          # 工具函数
│   │       │   ├── cover-cache.ts      # 封面缓存
│   │       │   ├── debounce.ts         # 防抖函数
│   │       │   └── format.ts           # 格式化函数
│   │       │
│   │       ├── test/           # 测试配置
│   │       │   └── setup.ts    # Vitest 设置
│   │       │
│   │       ├── App.tsx         # 应用根组件
│   │       ├── main.tsx        # 渲染进程入口
│   │       └── env.d.ts        # 环境类型定义
│   │
│   └── shared/                 # 共享代码
│       └── types/              # TypeScript 类型定义
│           └── index.ts        # 核心类型
│
├── docs/                       # 文档
│   ├── USER_GUIDE.md           # 用户使用指南
│   └── DEVELOPER.md            # 开发者文档
│
├── build/                      # 构建资源 (应用图标)
├── resources/                  # 应用资源
├── out/                        # 构建输出
│
├── .editorconfig               # 编辑器配置
├── .gitignore                  # Git 忽略文件
├── .prettierrc.yaml            # Prettier 配置
├── CHANGELOG.md                # 更新日志
├── LICENSE                     # 许可证
├── README.md                   # 项目说明
├── electron-builder.yml        # Electron Builder 配置
├── electron.vite.config.ts     # Electron Vite 配置
├── eslint.config.mjs           # ESLint 配置
├── package.json                # 项目配置
├── postcss.config.js           # PostCSS 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 根配置
├── tsconfig.node.json          # Node 环境配置
├── tsconfig.web.json           # Web 环境配置
└── vitest.config.ts            # Vitest 测试配置
```

## 路径别名

| 别名          | 路径                 |
| ------------- | -------------------- |
| `@main/*`     | `src/main/*`         |
| `@renderer/*` | `src/renderer/src/*` |
| `@shared/*`   | `src/shared/*`       |

## 架构说明

### 主进程 (Main Process)

运行在 Node.js 环境，负责：

- 文件系统操作（扫描文件夹、读取文件）
- 音频文件元数据解析
- 数据持久化（electron-store）
- 窗口管理
- IPC 通信处理

### 预加载脚本 (Preload)

在渲染进程启动前运行，负责：

- 暴露安全的 IPC 通信接口
- 桥接主进程和渲染进程
- 确保上下文隔离

### 渲染进程 (Renderer Process)

运行在浏览器环境，负责：

- UI 渲染（React 组件）
- 音频播放（Howler.js）
- 状态管理（Zustand）
- 用户交互处理

### 共享代码 (Shared)

包含主进程和渲染进程都需要的：

- TypeScript 类型定义
- 常量定义

## 技术栈

| 类别     | 技术                                    |
| -------- | --------------------------------------- |
| 框架     | Electron + Vite + React 19 + TypeScript |
| UI       | Tailwind CSS 4 + shadcn/ui              |
| 状态管理 | Zustand                                 |
| 音频     | Howler.js                               |
| 元数据   | music-metadata                          |
| 虚拟化   | react-virtuoso                          |
| 持久化   | electron-store                          |
| 测试     | Vitest + fast-check                     |
| 代码质量 | ESLint + Prettier                       |
