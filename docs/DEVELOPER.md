# 开发者文档

本文档面向希望参与 OrangeMusic 开发的开发者，介绍项目架构、开发流程和贡献指南。

## 目录

- [开发环境设置](#开发环境设置)
- [项目架构](#项目架构)
- [核心模块](#核心模块)
- [状态管理](#状态管理)
- [IPC 通信](#ipc-通信)
- [测试策略](#测试策略)
- [代码规范](#代码规范)
- [构建与发布](#构建与发布)
- [贡献指南](#贡献指南)

---

## 开发环境设置

### 前置要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- Git

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-repo/orange-music.git
cd orange-music

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 常用命令

```bash
# 开发
npm run dev          # 启动开发模式（热重载）

# 测试
npm test             # 运行所有测试
npm run test:watch   # 监听模式运行测试
npm run test:ui      # 打开测试 UI

# 代码质量
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint 代码检查
npm run format       # Prettier 代码格式化

# 构建
npm run build        # 构建生产版本
npm run build:win    # 打包 Windows 版本
npm run build:mac    # 打包 macOS 版本
npm run build:linux  # 打包 Linux 版本
```

---

## 项目架构

### 目录结构

```
local-music-player/
├── src/
│   ├── main/                 # 主进程 (Node.js)
│   │   ├── services/         # 主进程服务
│   │   │   ├── file-service.ts
│   │   │   ├── metadata-service.ts
│   │   │   └── persistence-service.ts
│   │   ├── ipc/              # IPC 处理器
│   │   │   └── index.ts
│   │   └── index.ts          # 主进程入口
│   │
│   ├── preload/              # 预加载脚本
│   │   ├── index.ts          # IPC 桥接
│   │   └── index.d.ts        # 类型定义
│   │
│   ├── renderer/             # 渲染进程 (Browser)
│   │   └── src/
│   │       ├── components/   # React 组件
│   │       ├── services/     # 渲染进程服务
│   │       ├── stores/       # Zustand 状态管理
│   │       ├── hooks/        # 自定义 Hooks
│   │       ├── utils/        # 工具函数
│   │       ├── contexts/     # React Context
│   │       └── assets/       # 静态资源
│   │
│   └── shared/               # 共享代码
│       └── types/            # TypeScript 类型定义
│
├── docs/                     # 文档
├── resources/                # 应用资源
└── build/                    # 构建资源
```

### 进程架构

Electron 应用包含两个主要进程：

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ FileService │  │ Metadata    │  │ PersistenceService  │  │
│  │             │  │ Service     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ IPC Main  │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │ IPC
┌──────────────────────────┼──────────────────────────────────┐
│                    ┌─────┴─────┐                            │
│                    │ Preload   │                            │
│                    └─────┬─────┘                            │
│                          │                                   │
│                      Renderer Process                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ AudioService│  │ IPCService  │  │ Zustand Stores      │  │
│  │ (Howler.js) │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ React UI  │                            │
│                    └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### 路径别名

项目配置了以下路径别名：

```typescript
// 使用示例
import { TrackMetadata } from '@shared/types'
import { audioService } from '@renderer/services/audio-service'
import { fileService } from '@main/services/file-service'
```

| 别名          | 路径                 |
| ------------- | -------------------- |
| `@main/*`     | `src/main/*`         |
| `@renderer/*` | `src/renderer/src/*` |
| `@shared/*`   | `src/shared/*`       |

---

## 核心模块

### 主进程服务

#### FileService

负责文件系统操作：

```typescript
interface FileService {
  scanFolder(folderPath: string): Promise<string[]>
  pathExists(path: string): Promise<boolean>
  getAudioFiles(folderPath: string): Promise<string[]>
  readLyrics(audioFilePath: string): Promise<string | null>
}
```

#### MetadataService

负责音频元数据解析：

```typescript
interface MetadataService {
  parseFile(filePath: string): Promise<TrackMetadata>
  parseFiles(filePaths: string[]): Promise<TrackMetadata[]>
  extractCover(filePath: string): Promise<string | null>
}
```

#### PersistenceService

负责数据持久化：

```typescript
interface PersistenceService {
  saveLibraryConfig(config: LibraryConfig): Promise<void>
  loadLibraryConfig(): Promise<LibraryConfig>
  savePlaylists(playlists: Playlist[]): Promise<void>
  loadPlaylists(): Promise<Playlist[]>
  saveSettings(settings: AppSettings): Promise<void>
  loadSettings(): Promise<AppSettings>
  savePlaybackState(state: PlaybackState): Promise<void>
  loadPlaybackState(): Promise<PlaybackState>
}
```

### 渲染进程服务

#### AudioService

封装 Howler.js 的音频播放服务：

```typescript
interface AudioService {
  load(filePath: string): Promise<void>
  play(): void
  pause(): void
  stop(): void
  seek(position: number): void
  setVolume(volume: number): void
  getPosition(): number
  getDuration(): number
  onEnd(callback: () => void): void
  onError(callback: (error: Error) => void): void
}
```

#### IPCService

封装 IPC 通信：

```typescript
interface IPCService {
  selectFolder(): Promise<string | null>
  scanFolder(folderPath: string): Promise<string[]>
  parseFile(filePath: string): Promise<TrackMetadata>
  // ... 更多方法
}
```

---

## 状态管理

使用 Zustand 进行状态管理，分为以下 Store：

### PlayerStore

管理播放器状态：

```typescript
interface PlayerStore {
  // 状态
  currentTrack: TrackMetadata | null
  isPlaying: boolean
  position: number
  duration: number
  volume: number
  playbackMode: PlaybackMode
  queue: TrackMetadata[]
  queueIndex: number

  // 操作
  play: (track?: TrackMetadata) => void
  pause: () => void
  next: () => void
  previous: () => void
  seek: (position: number) => void
  setVolume: (volume: number) => void
  setPlaybackMode: (mode: PlaybackMode) => void
  // ...
}
```

### LibraryStore

管理音乐库状态：

```typescript
interface LibraryStore {
  folders: FolderInfo[]
  tracks: TrackMetadata[]
  isScanning: boolean
  searchQuery: string

  addFolder: (path: string) => Promise<void>
  removeFolder: (id: string) => void
  refreshFolder: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  // ...
}
```

### PlaylistStore

管理播放列表状态：

```typescript
interface PlaylistStore {
  playlists: Playlist[]

  createPlaylist: (name: string) => void
  deletePlaylist: (id: string) => void
  addTrackToPlaylist: (playlistId: string, track: TrackMetadata) => void
  removeTrackFromPlaylist: (playlistId: string, index: number) => void
  // ...
}
```

### UIStore

管理 UI 状态：

```typescript
interface UIStore {
  currentView: ViewType
  sidebarCollapsed: boolean
  queueVisible: boolean
  theme: Theme

  setCurrentView: (view: ViewType) => void
  toggleSidebar: () => void
  toggleQueue: () => void
  setTheme: (theme: Theme) => void
}
```

---

## IPC 通信

### 通信模式

使用 Electron 的 `contextBridge` 和 `ipcRenderer` 进行安全的进程间通信：

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanFolder: (path: string) => ipcRenderer.invoke('scan-folder', path)
  // ...
})

// main/ipc/index.ts
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result.filePaths[0] || null
})
```

### 类型安全

在 `preload/index.d.ts` 中定义类型：

```typescript
declare global {
  interface Window {
    api: {
      selectFolder: () => Promise<string | null>
      scanFolder: (path: string) => Promise<string[]>
      // ...
    }
  }
}
```

---

## 测试策略

### 双重测试策略

项目采用单元测试和属性测试相结合的策略：

- **单元测试**: 验证特定示例和边缘情况
- **属性测试**: 使用 fast-check 验证通用属性

### 测试文件命名

测试文件与源文件放在同一目录，使用 `.test.ts` 后缀：

```
services/
├── audio-service.ts
├── audio-service.test.ts
├── file-service.ts
└── file-service.test.ts
```

### 属性测试示例

```typescript
import { fc } from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('PlayerStore', () => {
  // Feature: local-music-player, Property 9: 音量控制范围
  it('should keep volume within valid range', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1 }), (volume) => {
        playerStore.setVolume(volume)
        expect(playerStore.volume).toBeGreaterThanOrEqual(0)
        expect(playerStore.volume).toBeLessThanOrEqual(1)
      }),
      { numRuns: 100 }
    )
  })
})
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 打开测试 UI
npm run test:ui
```

---

## 代码规范

### TypeScript

- 使用严格模式
- 所有函数和变量都应有明确的类型
- 避免使用 `any`

### 代码风格

项目使用 Prettier 进行代码格式化：

- 单引号
- 无分号
- 100 字符行宽
- 无尾随逗号

### ESLint 规则

遵循 `@electron-toolkit/eslint-config-ts` 配置。

### 提交规范

使用语义化提交信息：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加或修改测试
chore: 构建或辅助工具变动
```

---

## 构建与发布

### 构建流程

```bash
# 1. 类型检查
npm run typecheck

# 2. 运行测试
npm test

# 3. 构建应用
npm run build

# 4. 打包安装程序
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

### 构建配置

构建配置在 `electron-builder.yml` 中：

```yaml
appId: com.electron.orange-music
productName: OrangeMusic
directories:
  buildResources: build
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.*'
  # ...
```

### 发布流程

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 创建 Git 标签
4. 构建并上传安装包到 GitHub Releases

---

## 贡献指南

### 开发流程

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 编写代码和测试
4. 确保所有测试通过：`npm test`
5. 确保类型检查通过：`npm run typecheck`
6. 确保代码格式正确：`npm run format`
7. 提交更改：`git commit -m 'feat: add my feature'`
8. 推送分支：`git push origin feature/my-feature`
9. 创建 Pull Request

### 添加新功能

1. 在 `src/shared/types/` 中定义类型
2. 在相应的服务中实现功能
3. 在 Store 中添加状态管理
4. 创建 UI 组件
5. 编写测试（单元测试 + 属性测试）
6. 更新文档

### 报告问题

在 GitHub Issues 中报告问题时，请包含：

- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 系统信息（操作系统、版本等）
- 相关日志或截图

---

如有问题，欢迎在 [GitHub Issues](https://github.com/your-repo/orange-music/issues) 中讨论。
