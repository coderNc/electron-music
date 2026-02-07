# Implementation Plan: Local Music Player

## Overview

本实现计划将本地音乐播放器的设计转化为可执行的开发任务。任务按照增量开发的方式组织，每个任务都建立在前面任务的基础上，确保每一步都能验证核心功能。

## Tasks

- [x] 1. 项目初始化和基础架构
  - 使用 electron-vite 脚手架创建项目
  - 配置 TypeScript、ESLint、Prettier
  - 设置 Tailwind CSS 和 shadcn/ui
  - 配置 Vitest 测试框架和 fast-check
  - 创建基本的项目目录结构（src/main, src/renderer, src/shared）
  - _Requirements: 所有需求的基础_

- [x] 2. 实现主进程核心服务
  - [x] 2.1 实现 File Service
    - 创建文件夹扫描功能，递归查找音频文件
    - 实现文件路径验证和权限检查
    - 添加文件监听功能（可选）
    - _Requirements: 1.1, 1.5_
  - [ ]\* 2.2 编写 File Service 属性测试
    - **Property 1: 文件夹扫描完整性**
    - **Property 3: 不支持文件跳过**
    - **Validates: Requirements 1.1, 1.5**
  - [x] 2.3 实现 Metadata Service
    - 使用 music-metadata 解析音频文件元数据
    - 实现封面图片提取功能
    - 添加批量解析支持
    - 实现元数据解析错误处理和降级
    - _Requirements: 1.2, 11.3_
  - [ ]\* 2.4 编写 Metadata Service 属性测试
    - **Property 27: 元数据解析降级**
    - **Validates: Requirements 11.3**
  - [x] 2.5 实现 Persistence Service
    - 使用 electron-store 实现数据持久化
    - 实现音乐库配置的保存和加载
    - 实现播放列表的保存和加载
    - 实现应用设置和播放状态的保存和加载
    - 添加数据版本管理和迁移逻辑
    - _Requirements: 1.3, 9.1, 9.2, 9.4, 9.6_
  - [ ]\* 2.6 编写 Persistence Service 属性测试
    - **Property 2: 数据持久化往返一致性**
    - **Property 28: 数据损坏恢复**
    - **Property 29: 数据迁移正确性**
    - **Validates: Requirements 1.3, 9.2, 9.5, 9.6**

- [x] 3. 实现 IPC 通信层
  - 定义 IPC 通道和消息类型
  - 实现主进程 IPC 处理器（文件操作、元数据解析、持久化）
  - 实现渲染进程 IPC 服务封装
  - 添加类型安全的 IPC 调用接口
  - 实现错误处理和超时机制
  - _Requirements: 所有需求的通信基础_

- [ ]\* 3.1 编写 IPC 通信集成测试
  - 测试主进程和渲染进程之间的通信
  - 测试错误处理和超时机制

- [-] 4. 实现音频播放引擎
  - [x] 4.1 实现 Audio Service
    - 使用 Howler.js 封装音频播放功能
    - 实现播放、暂停、停止、seek 功能
    - 实现音量控制
    - 实现播放进度跟踪
    - 添加播放结束和错误事件监听
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.8_
  - [ ]\* 4.2 编写 Audio Service 属性测试
    - **Property 6: 播放状态转换**
    - **Property 8: 播放位置控制**
    - **Property 9: 音量控制范围**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6**
  - [ ]\* 4.3 编写 Audio Service 单元测试
    - 测试播放错误处理
    - 测试边缘情况（无效位置、无效音量等）
    - _Requirements: 3.8_

- [x] 5. 实现 Zustand 状态管理
  - [x] 5.1 实现 Player Store
    - 创建播放器状态（当前歌曲、播放状态、位置、音量等）
    - 实现播放控制操作（play, pause, stop, next, previous）
    - 实现播放队列管理
    - 实现播放模式切换（顺序、随机、单曲循环、列表循环）
    - 集成 Audio Service
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4_
  - [ ]\* 5.2 编写 Player Store 属性测试
    - **Property 7: 队列导航正确性**
    - **Property 10: 播放模式行为**
    - **Property 18: 播放队列添加**
    - **Property 19: 下一首播放插入**
    - **Property 20: 队列清空操作**
    - **Validates: Requirements 3.3, 3.4, 3.7, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4**
  - [x] 5.3 实现 Library Store
    - 创建音乐库状态（文件夹列表、歌曲列表、扫描状态）
    - 实现文件夹管理操作（添加、删除、刷新）
    - 实现搜索和筛选功能
    - 实现专辑和艺术家视图的计算属性
    - 集成 IPC Service
    - _Requirements: 1.1, 1.4, 1.6, 2.1, 2.2, 2.3, 2.4, 2.6, 5.1, 5.3, 5.4, 5.5, 5.6_
  - [ ]\* 5.4 编写 Library Store 属性测试
    - **Property 4: 文件夹删除完整性**
    - **Property 5: 文件夹刷新同步性**
    - **Property 15: 搜索结果匹配性**
    - **Property 16: 筛选结果正确性**
    - **Property 17: 搜索清空恢复**
    - **Validates: Requirements 2.3, 2.4, 2.6, 5.1, 5.3, 5.4, 5.5, 5.6**
  - [x] 5.5 实现 Playlist Store
    - 创建播放列表状态
    - 实现播放列表管理操作（创建、删除、重命名）
    - 实现播放列表歌曲操作（添加、删除、重排序）
    - 实现播放列表持久化
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [ ]\* 5.6 编写 Playlist Store 属性测试
    - **Property 11: 播放列表添加操作**
    - **Property 12: 播放列表删除不影响原文件**
    - **Property 13: 播放列表重排序**
    - **Property 14: 播放列表修改持久化**
    - **Validates: Requirements 4.2, 4.3, 4.6, 4.7**
  - [x] 5.7 实现 UI Store
    - 创建 UI 状态（当前视图、侧边栏状态、主题等）
    - 实现视图切换和 UI 控制操作
    - _Requirements: 8.1, 8.2_

- [ ] 6. Checkpoint - 确保核心逻辑测试通过
  - 确保所有核心服务和状态管理的测试通过
  - 如有问题，请向用户询问

- [x] 7. 实现 UI 布局组件
  - [x] 7.1 实现 AppLayout 组件
    - 创建应用主布局（侧边栏 + 主内容区 + 播放控制栏）
    - 实现响应式布局
    - 集成 UI Store
    - _Requirements: 8.1, 8.2_
  - [x] 7.2 实现 Sidebar 组件
    - 创建导航菜单（音乐库、播放列表、专辑、艺术家、队列）
    - 实现侧边栏折叠/展开
    - 添加视觉反馈效果
    - _Requirements: 8.1, 8.3_
  - [x] 7.3 实现 PlayerBar 组件
    - 创建播放控制栏布局
    - 显示当前播放信息（封面、标题、艺术家）
    - 集成 Player Store
    - _Requirements: 8.1, 8.4_

- [x] 8. 实现播放控制组件
  - [x] 8.1 实现 PlaybackControls 组件
    - 创建播放/暂停、上一曲、下一曲按钮
    - 实现播放模式切换按钮
    - 连接 Player Store 操作
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 8.2 实现 ProgressBar 组件
    - 创建进度条显示和拖动功能
    - 实现时间显示（当前时间/总时长）
    - 连接 Player Store 的 seek 操作
    - _Requirements: 3.5_
  - [x] 8.3 实现 VolumeControl 组件
    - 创建音量滑块
    - 实现静音切换
    - 连接 Player Store 的音量控制
    - _Requirements: 3.6_

- [x] 9. 实现音乐库视图组件
  - [x] 9.1 实现 LibraryView 组件
    - 创建音乐库主视图布局
    - 实现文件夹列表显示
    - 添加"添加文件夹"按钮
    - _Requirements: 1.1, 2.1_
  - [x] 9.2 实现 TrackList 组件
    - 使用 react-virtuoso 创建虚拟化歌曲列表
    - 实现歌曲项显示（标题、艺术家、专辑、时长）
    - 实现双击播放功能
    - 实现右键菜单（添加到播放列表、添加到队列等）
    - _Requirements: 2.2, 2.5, 8.5, 8.6_
  - [x] 9.3 实现 SearchBar 组件
    - 创建搜索输入框
    - 实现实时搜索功能（防抖）
    - 连接 Library Store 的搜索功能
    - _Requirements: 5.1, 5.3_
  - [x] 9.4 实现 AlbumGrid 和 ArtistList 组件
    - 创建专辑网格视图
    - 创建艺术家列表视图
    - 实现筛选功能
    - _Requirements: 5.4, 5.5_

- [x] 10. 实现播放列表视图组件
  - [x] 10.1 实现 PlaylistView 组件
    - 创建播放列表主视图
    - 显示播放列表列表
    - 添加"创建播放列表"按钮
    - _Requirements: 4.1_
  - [x] 10.2 实现 PlaylistDetail 组件
    - 显示播放列表详情（名称、歌曲列表）
    - 实现歌曲拖拽重排序
    - 实现歌曲删除功能
    - _Requirements: 4.3, 4.6_
  - [x] 10.3 实现 CreatePlaylistDialog 组件
    - 创建播放列表对话框
    - 实现名称输入和验证
    - _Requirements: 4.1_

- [x] 11. 实现播放队列组件
  - [x] 11.1 实现 QueuePanel 组件
    - 创建播放队列侧边面板
    - 显示当前播放歌曲和队列列表
    - 实现队列项拖拽重排序
    - 实现队列项删除和清空队列功能
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 12. 实现键盘快捷键
  - 实现全局键盘事件监听
  - 实现播放/暂停快捷键（空格）
  - 实现进度控制快捷键（左右箭头）
  - 实现音量控制快捷键（上下箭头）
  - 实现搜索快捷键（Ctrl+F / Cmd+F）
  - 实现创建播放列表快捷键（Ctrl+N / Cmd+N）
  - 实现添加文件夹快捷键（Ctrl+O / Cmd+O）
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ]\* 12.1 编写键盘快捷键属性测试
  - **Property 31: 键盘快捷键响应**
  - **Property 32: 方向键控制**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8**

- [x] 13. 实现应用初始化和状态恢复
  - 实现应用启动时加载音乐库配置
  - 实现应用启动时恢复播放状态
  - 实现应用关闭时保存状态
  - 添加加载动画
  - _Requirements: 8.7, 9.1, 9.2_

- [ ]\* 13.1 编写状态持久化属性测试
  - **Property 21: 播放模式持久化**
  - **Property 23: 应用状态持久化往返**
  - **Validates: Requirements 7.6, 9.1, 9.2**

- [x] 14. 实现错误处理和用户反馈
  - 实现全局错误边界组件
  - 实现 Toast 通知组件
  - 添加各种错误场景的用户提示
  - 实现错误恢复机制
  - _Requirements: 1.4, 3.8, 11.1, 11.2, 11.3, 11.4, 11.6_

- [ ]\* 14.1 编写错误处理属性测试
  - **Property 25: 播放错误恢复**
  - **Property 26: 路径错误处理**
  - **Property 30: 离线功能可用性**
  - **Validates: Requirements 3.8, 11.1, 11.2, 11.6**

- [x] 15. 实现性能优化
  - 实现封面图片缓存
  - 优化搜索防抖
  - 优化列表滚动性能
  - 实现懒加载
  - _Requirements: 10.3_

- [ ]\* 15.1 编写性能相关属性测试
  - **Property 24: 封面缓存一致性**
  - **Validates: Requirements 10.3**

- [x] 16. 实现主题系统
  - 实现亮色/暗色主题切换
  - 实现系统主题跟随
  - 持久化主题设置
  - _Requirements: 9.2_

- [x] 17. Checkpoint - 完整功能测试
  - 确保所有功能正常工作
  - 运行所有测试（单元测试 + 属性测试）
  - 如有问题，请向用户询问

- [x] 18. 实现扫描进度显示
  - 实现扫描进度条组件
  - 显示已发现的文件数量
  - 实现后台扫描不阻塞 UI
  - _Requirements: 1.6, 10.2_

- [ ]\* 18.1 编写扫描进度属性测试
  - 测试扫描进度更新事件
  - 测试后台扫描不阻塞 UI

- [x] 19. 实现封面显示和降级
  - 实现封面图片显示
  - 实现默认占位图
  - 实现封面加载失败降级
  - _Requirements: 8.4_

- [ ]\* 19.1 编写封面显示属性测试
  - **Property 22: 封面显示降级**
  - **Validates: Requirements 8.4**

- [x] 20. 最终集成和打包
  - 运行完整的测试套件
  - 修复所有发现的问题
  - 使用 electron-builder 配置打包
  - 生成安装包（Windows, macOS, Linux）
  - 测试安装包

- [x] 21. 文档和部署
  - 编写 README 文档
  - 编写用户使用指南
  - 编写开发者文档
  - 准备发布说明

## Notes

- 标记为 `*` 的任务是可选的测试任务，可以跳过以加快 MVP 开发
- 每个任务都引用了相关的需求编号，便于追溯
- Checkpoint 任务确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证特定示例和边缘情况
- 建议按顺序执行任务，每个任务完成后进行验证
