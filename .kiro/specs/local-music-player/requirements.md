# Requirements Document

## Introduction

本文档定义了一个纯本地、无需登录、以文件夹为核心的音乐播放器的需求。该播放器使用 Electron + React + TypeScript 构建，提供类似 Spotify 和 Apple Music 的用户体验，但完全基于本地文件系统运行。

## Glossary

- **Music_Player**: 音乐播放器应用程序主系统
- **Audio_Engine**: 基于 Howler.js 的音频播放引擎
- **Metadata_Parser**: 基于 music-metadata 的音频文件元数据解析器
- **Library_Manager**: 管理音乐库和文件夹的组件
- **Playlist_Manager**: 管理播放列表的组件
- **Storage_Manager**: 基于 electron-store 的数据持久化管理器
- **UI_Component**: 基于 Tailwind CSS 和 shadcn/ui 的用户界面组件
- **Virtual_List**: 基于 react-virtuoso 的虚拟化列表组件
- **Audio_File**: 支持的音频文件格式（MP3, FLAC, WAV, AAC, OGG 等）
- **Folder**: 包含音频文件的本地文件系统目录
- **Track**: 单个音频文件及其元数据
- **Album**: 专辑，由多个 Track 组成
- **Artist**: 艺术家信息
- **Playback_State**: 播放状态（播放中、暂停、停止）

## Requirements

### Requirement 1: 文件夹导入与扫描

**User Story:** 作为用户，我希望能够添加本地文件夹到音乐库，以便播放器能够识别和管理我的音乐文件。

#### Acceptance Criteria

1. WHEN 用户选择一个文件夹 THEN THE Library_Manager SHALL 扫描该文件夹及其所有子文件夹中的音频文件
2. WHEN 扫描文件夹时 THEN THE Metadata_Parser SHALL 解析每个音频文件的元数据（标题、艺术家、专辑、时长、封面等）
3. WHEN 扫描完成后 THEN THE Storage_Manager SHALL 将文件夹路径和音频文件信息持久化到本地存储
4. WHEN 用户添加已存在的文件夹 THEN THE Music_Player SHALL 提示用户该文件夹已在库中
5. WHEN 扫描过程中遇到不支持的文件 THEN THE Library_Manager SHALL 跳过该文件并继续扫描
6. WHEN 扫描大量文件时 THEN THE Music_Player SHALL 显示扫描进度和已发现的文件数量

### Requirement 2: 音乐库管理

**User Story:** 作为用户，我希望能够查看和管理我的音乐库，以便快速找到想听的音乐。

#### Acceptance Criteria

1. WHEN 用户打开音乐库视图 THEN THE UI_Component SHALL 显示所有已添加的文件夹列表
2. WHEN 用户选择查看某个文件夹 THEN THE Music_Player SHALL 显示该文件夹中的所有音频文件
3. WHEN 用户删除某个文件夹 THEN THE Library_Manager SHALL 从库中移除该文件夹及其所有音频文件信息
4. WHEN 用户刷新某个文件夹 THEN THE Library_Manager SHALL 重新扫描该文件夹并更新音频文件信息
5. WHEN 显示大量音频文件时 THEN THE Virtual_List SHALL 使用虚拟化技术优化渲染性能
6. WHEN 文件夹中的文件被外部修改或删除 THEN THE Library_Manager SHALL 在下次刷新时更新库信息

### Requirement 3: 音频播放控制

**User Story:** 作为用户，我希望能够控制音乐播放，以便按照我的意愿播放、暂停、切换歌曲。

#### Acceptance Criteria

1. WHEN 用户点击播放按钮 THEN THE Audio_Engine SHALL 开始播放选中的音频文件
2. WHEN 用户点击暂停按钮 THEN THE Audio_Engine SHALL 暂停当前播放并保持播放位置
3. WHEN 用户点击下一曲按钮 THEN THE Audio_Engine SHALL 停止当前播放并开始播放下一首歌曲
4. WHEN 用户点击上一曲按钮 THEN THE Audio_Engine SHALL 停止当前播放并开始播放上一首歌曲
5. WHEN 用户拖动进度条 THEN THE Audio_Engine SHALL 跳转到指定的播放位置
6. WHEN 用户调整音量滑块 THEN THE Audio_Engine SHALL 调整播放音量到指定级别
7. WHEN 音频文件播放完成 THEN THE Audio_Engine SHALL 根据播放模式（顺序、随机、单曲循环）播放下一首或停止
8. WHEN 播放过程中发生错误 THEN THE Music_Player SHALL 显示错误信息并尝试播放下一首

### Requirement 4: 播放列表管理

**User Story:** 作为用户，我希望能够创建和管理播放列表，以便组织我喜欢的音乐。

#### Acceptance Criteria

1. WHEN 用户创建新播放列表 THEN THE Playlist_Manager SHALL 创建一个空的播放列表并提示用户输入名称
2. WHEN 用户添加歌曲到播放列表 THEN THE Playlist_Manager SHALL 将歌曲添加到指定播放列表的末尾
3. WHEN 用户从播放列表中移除歌曲 THEN THE Playlist_Manager SHALL 从播放列表中删除该歌曲但不删除原始文件
4. WHEN 用户重命名播放列表 THEN THE Playlist_Manager SHALL 更新播放列表名称
5. WHEN 用户删除播放列表 THEN THE Playlist_Manager SHALL 删除该播放列表但保留原始音频文件
6. WHEN 用户拖动歌曲调整顺序 THEN THE Playlist_Manager SHALL 更新播放列表中的歌曲顺序
7. WHEN 播放列表被修改 THEN THE Storage_Manager SHALL 立即持久化播放列表数据

### Requirement 5: 搜索与筛选

**User Story:** 作为用户，我希望能够搜索和筛选音乐，以便快速找到特定的歌曲、专辑或艺术家。

#### Acceptance Criteria

1. WHEN 用户在搜索框输入关键词 THEN THE Music_Player SHALL 实时显示匹配的歌曲、专辑和艺术家
2. WHEN 搜索结果包含多种类型 THEN THE UI_Component SHALL 按类型（歌曲、专辑、艺术家）分组显示结果
3. WHEN 用户清空搜索框 THEN THE Music_Player SHALL 恢复到搜索前的视图
4. WHEN 用户按艺术家筛选 THEN THE Music_Player SHALL 显示该艺术家的所有歌曲和专辑
5. WHEN 用户按专辑筛选 THEN THE Music_Player SHALL 显示该专辑的所有歌曲
6. WHEN 搜索关键词匹配歌曲标题、艺术家或专辑名称 THEN THE Music_Player SHALL 将该歌曲包含在搜索结果中

### Requirement 6: 播放队列管理

**User Story:** 作为用户，我希望能够查看和管理当前播放队列，以便控制接下来要播放的歌曲。

#### Acceptance Criteria

1. WHEN 用户播放某首歌曲 THEN THE Music_Player SHALL 将该歌曲添加到播放队列并开始播放
2. WHEN 用户查看播放队列 THEN THE UI_Component SHALL 显示当前正在播放的歌曲和接下来要播放的歌曲列表
3. WHEN 用户从播放队列中移除歌曲 THEN THE Music_Player SHALL 从队列中删除该歌曲
4. WHEN 用户拖动队列中的歌曲 THEN THE Music_Player SHALL 调整播放队列中的歌曲顺序
5. WHEN 用户清空播放队列 THEN THE Music_Player SHALL 停止播放并清空队列
6. WHEN 用户添加歌曲到队列末尾 THEN THE Music_Player SHALL 将歌曲添加到当前播放队列的最后
7. WHEN 用户选择"下一首播放" THEN THE Music_Player SHALL 将歌曲插入到当前播放歌曲之后

### Requirement 7: 播放模式控制

**User Story:** 作为用户，我希望能够切换不同的播放模式，以便按照我的喜好播放音乐。

#### Acceptance Criteria

1. WHEN 用户选择顺序播放模式 THEN THE Audio_Engine SHALL 按照队列顺序依次播放歌曲
2. WHEN 用户选择随机播放模式 THEN THE Audio_Engine SHALL 随机选择队列中的歌曲播放
3. WHEN 用户选择单曲循环模式 THEN THE Audio_Engine SHALL 重复播放当前歌曲
4. WHEN 用户选择列表循环模式 THEN THE Audio_Engine SHALL 播放完队列后从头开始循环
5. WHEN 用户切换播放模式 THEN THE Music_Player SHALL 显示当前播放模式的图标
6. WHEN 播放模式被更改 THEN THE Storage_Manager SHALL 保存用户的播放模式偏好

### Requirement 8: 用户界面与交互

**User Story:** 作为用户，我希望拥有美观且易用的界面，以便获得良好的使用体验。

#### Acceptance Criteria

1. WHEN 用户打开应用 THEN THE UI_Component SHALL 显示主界面，包括侧边栏、主内容区和播放控制栏
2. WHEN 用户调整窗口大小 THEN THE UI_Component SHALL 响应式调整布局以适应窗口尺寸
3. WHEN 用户悬停在可交互元素上 THEN THE UI_Component SHALL 提供视觉反馈（如高亮、阴影）
4. WHEN 显示专辑封面 THEN THE UI_Component SHALL 显示音频文件的嵌入封面或默认占位图
5. WHEN 用户双击歌曲 THEN THE Music_Player SHALL 立即播放该歌曲
6. WHEN 用户右键点击歌曲 THEN THE UI_Component SHALL 显示上下文菜单（添加到播放列表、查看详情等）
7. WHEN 应用加载时 THEN THE Music_Player SHALL 显示加载动画直到数据加载完成

### Requirement 9: 数据持久化

**User Story:** 作为用户，我希望应用能够记住我的设置和数据，以便下次打开时保持之前的状态。

#### Acceptance Criteria

1. WHEN 用户关闭应用 THEN THE Storage_Manager SHALL 保存当前播放状态（播放位置、音量、播放模式）
2. WHEN 用户重新打开应用 THEN THE Storage_Manager SHALL 恢复上次的播放状态和音乐库数据
3. WHEN 用户修改播放列表 THEN THE Storage_Manager SHALL 立即将更改持久化到本地存储
4. WHEN 用户添加或删除文件夹 THEN THE Storage_Manager SHALL 更新持久化的音乐库配置
5. WHEN 存储数据损坏或不可读 THEN THE Music_Player SHALL 使用默认配置并通知用户
6. WHEN 应用升级导致数据格式变化 THEN THE Storage_Manager SHALL 自动迁移旧数据到新格式

### Requirement 10: 性能优化

**User Story:** 作为用户，我希望应用运行流畅，即使处理大量音乐文件时也不卡顿。

#### Acceptance Criteria

1. WHEN 显示包含超过 1000 首歌曲的列表 THEN THE Virtual_List SHALL 使用虚拟化技术仅渲染可见项
2. WHEN 扫描大型文件夹时 THEN THE Library_Manager SHALL 在后台线程中执行扫描以避免阻塞 UI
3. WHEN 加载专辑封面时 THEN THE Music_Player SHALL 异步加载并缓存封面图片
4. WHEN 用户快速滚动列表时 THEN THE UI_Component SHALL 保持流畅的滚动体验
5. WHEN 应用启动时 THEN THE Music_Player SHALL 在 3 秒内显示主界面
6. WHEN 切换歌曲时 THEN THE Audio_Engine SHALL 在 500 毫秒内开始播放新歌曲

### Requirement 11: 错误处理

**User Story:** 作为用户，我希望应用能够妥善处理错误情况，以便在出现问题时获得清晰的提示。

#### Acceptance Criteria

1. WHEN 音频文件无法播放 THEN THE Music_Player SHALL 显示错误消息并尝试播放下一首
2. WHEN 文件夹路径不存在或无法访问 THEN THE Library_Manager SHALL 提示用户并提供移除该文件夹的选项
3. WHEN 音频文件元数据解析失败 THEN THE Metadata_Parser SHALL 使用文件名作为标题并继续处理
4. WHEN 存储空间不足 THEN THE Storage_Manager SHALL 通知用户并尝试清理缓存
5. WHEN 应用崩溃 THEN THE Music_Player SHALL 在重启时恢复到崩溃前的状态
6. WHEN 网络或外部依赖不可用 THEN THE Music_Player SHALL 继续提供本地功能而不中断

### Requirement 12: 键盘快捷键

**User Story:** 作为用户，我希望能够使用键盘快捷键控制播放器，以便提高操作效率。

#### Acceptance Criteria

1. WHEN 用户按下空格键 THEN THE Music_Player SHALL 切换播放/暂停状态
2. WHEN 用户按下左箭头键 THEN THE Audio_Engine SHALL 后退 5 秒
3. WHEN 用户按下右箭头键 THEN THE Audio_Engine SHALL 前进 5 秒
4. WHEN 用户按下上箭头键 THEN THE Audio_Engine SHALL 增加音量
5. WHEN 用户按下下箭头键 THEN THE Audio_Engine SHALL 降低音量
6. WHEN 用户按下 Ctrl+F（或 Cmd+F） THEN THE Music_Player SHALL 聚焦到搜索框
7. WHEN 用户按下 Ctrl+N（或 Cmd+N） THEN THE Music_Player SHALL 打开创建播放列表对话框
8. WHEN 用户按下 Ctrl+O（或 Cmd+O） THEN THE Music_Player SHALL 打开添加文件夹对话框
