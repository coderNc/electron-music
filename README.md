# OrangeMusic

<p align="center">
  <img src="resources/icon.png" alt="OrangeMusic" width="128" height="128">
</p>

<p align="center">
  一个基于 Electron + React + TypeScript 的跨平台本地音乐播放器。
  <br>
  无需登录，完全本地运行，保护您的隐私。
</p>

## ✨ 功能特性

- 🎵 **本地音乐库管理** - 添加文件夹，自动扫描音频文件
- 🎨 **元数据解析** - 自动读取歌曲标题、艺术家、专辑、封面等信息
- 🎧 **完整播放控制** - 播放、暂停、上一曲、下一曲、进度控制、音量调节
- 📝 **歌词显示** - 支持 LRC 格式歌词，自动同步滚动高亮当前歌词
- 📋 **播放列表** - 创建、编辑、删除自定义播放列表
- 📝 **播放队列** - 灵活管理即将播放的歌曲
- 🔀 **多种播放模式** - 顺序播放、随机播放、单曲循环、列表循环
- 🔍 **搜索与筛选** - 快速搜索歌曲、专辑、艺术家
- 🌓 **主题切换** - 支持亮色/暗色主题
- ⌨️ **键盘快捷键** - 高效操作
- 💾 **数据持久化** - 自动保存播放状态和设置
- 🚀 **高性能** - 虚拟化列表，流畅处理大型音乐库

## 📦 支持的音频格式

MP3, FLAC, WAV, AAC, OGG, M4A, WMA, AIFF, ALAC, OPUS

## 🖥️ 系统要求

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.15 (Catalina) 或更高版本
- **Linux**: Ubuntu 18.04 或其他主流发行版

## 📥 安装

### 从发布版本安装

1. 前往 [Releases](https://github.com/your-repo/orange-music/releases) 页面
2. 下载适合您操作系统的安装包：
   - Windows: `OrangeMusic-Setup-x.x.x.exe`
   - macOS: `OrangeMusic-x.x.x.dmg`
   - Linux: `OrangeMusic-x.x.x.AppImage`
3. 运行安装程序

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/your-repo/orange-music.git
cd orange-music

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包安装程序
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

## 🚀 快速开始

### 1. 添加音乐文件夹

1. 点击侧边栏的 **"添加文件夹"** 按钮，或使用快捷键 `Ctrl+O` (Windows/Linux) / `Cmd+O` (macOS)
2. 选择包含音乐文件的文件夹
3. 等待扫描完成，您的音乐将自动出现在库中

### 2. 播放音乐

- **双击** 歌曲立即播放
- **右键** 歌曲查看更多选项（添加到播放列表、添加到队列等）

### 3. 创建播放列表

1. 点击侧边栏的 **"新建播放列表"** 按钮，或使用快捷键 `Ctrl+N` / `Cmd+N`
2. 输入播放列表名称
3. 将歌曲拖拽到播放列表，或右键选择 **"添加到播放列表"**

## ⌨️ 键盘快捷键

| 快捷键         | 功能         |
| -------------- | ------------ |
| `Space`        | 播放/暂停    |
| `←`            | 后退 5 秒    |
| `→`            | 前进 5 秒    |
| `↑`            | 增加音量     |
| `↓`            | 降低音量     |
| `Ctrl/Cmd + F` | 聚焦搜索框   |
| `Ctrl/Cmd + N` | 新建播放列表 |
| `Ctrl/Cmd + O` | 添加文件夹   |

## 🎨 界面预览

应用采用现代化设计，包含：

- **侧边栏** - 导航菜单，包括音乐库、播放列表、专辑、艺术家视图
- **主内容区** - 显示歌曲列表、专辑网格或艺术家列表
- **播放控制栏** - 底部固定，显示当前播放信息和控制按钮
- **播放队列面板** - 可展开的侧边面板，管理播放队列
- **歌词面板** - 显示同步滚动的歌词，自动高亮当前播放行

## 🛠️ 技术栈

- **框架**: Electron + Vite + React 19 + TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui
- **状态管理**: Zustand
- **音频引擎**: Howler.js
- **元数据解析**: music-metadata
- **列表虚拟化**: react-virtuoso
- **数据持久化**: electron-store
- **测试**: Vitest + fast-check

## 📖 文档

- [用户使用指南](docs/USER_GUIDE.md)
- [开发者文档](docs/DEVELOPER.md)
- [项目结构](PROJECT_STRUCTURE.md)
- [更新日志](CHANGELOG.md)

## 🤝 贡献

欢迎贡献代码！请查看 [开发者文档](docs/DEVELOPER.md) 了解如何参与开发。

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Howler.js](https://howlerjs.com/)
- [music-metadata](https://github.com/borewit/music-metadata)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
