# Podcast Media Downloader

### Overview

This Chrome extension, named **Podcast Media Downloader**, is designed to automatically detect and download podcast media files (MP3 and M4A) when you visit web pages containing such media. The extension consists of background scripts to handle network requests, content scripts to capture user actions, and a popup interface to manage and initiate downloads.

### Features

1. **Automatic Detection:** Automatically detects MP3 and M4A files from web requests.
2. **Storage and Retrieval:** Stores detected media URLs and metadata (like file names and sizes) in Chrome's local storage.
3. **User Interaction:** Provides a popup interface for users to view and download detected media files.
4. **User Actions:** Monitors user actions (clicks and keypresses) to trigger media URL updates.
5. **Automatic Reset:** Resets the stored media URLs and metadata when the tab changes or the extension is restarted.

### Installation

1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

### Usage

1. Visit any webpage containing MP3 or M4A files.
2. The extension will automatically detect and list these files.
3. Open the extension popup by clicking on the extension icon in the Chrome toolbar.
4. View the detected files and click the "Download" button to download the desired media files.

### Files

#### `background.js`

- Manages media URL detection and storage.
- Listens to network requests and response headers to detect media files.
- Handles user actions to trigger URL updates.
- Provides functions to reset and initialize the stored data.

#### `content.js`

- Listens to user actions (clicks and keypresses) on the webpage.
- Sends messages to the background script to handle these actions.

#### `popup.html`

- Provides the user interface for the extension popup.
- Displays the list of detected media files and allows users to download them.

#### `popup.js`

- Manages the interaction within the popup.
- Loads and displays the parsed media file names and URLs.
- Handles the download process and updates the UI accordingly.

### Conclusion
The Podcast Media Downloader Chrome extension simplifies the process of detecting and downloading podcast media files. With automatic detection, user action monitoring, and a user-friendly interface, it provides a seamless experience for users looking to save their favorite podcasts.

For more details, you can refer to the source code and explore the functionalities in-depth. Contributions and improvements are welcome!

# 播客文件下载工具 Podcast Media Downloader

播客文件下载工具 Podcast Media Downloader 是一个 Chrome 插件，用于自动检测和下载网页中的播客媒体文件（MP3 和 M4A）。

## 功能

- 自动检测 MP3 和 M4A 文件
- 存储和显示媒体文件的 URL 和文件名
- 通过插件弹出界面下载媒体文件

## 安装

1. 从 [Releases](https://github.com/whisxixi/podcastMediaDownloder/releases) 页面下载最新版本的 `PodcastMediaDownloader.crx` 文件。
2. 打开 Chrome 浏览器，进入 `chrome://extensions/` 页面。
3. 打开“开发者模式”。
4. 将 `PodcastMediaDownloader.crx` 文件拖拽到扩展程序页面中进行安装。

## 使用

1. 访问包含目标podcast网站网页。
2. 点击 Chrome 工具栏中的 Podcast Media Downloader 图标。
3. 在弹出的界面中查看和下载检测到的媒体文件。
4. 如果没有检测到文件，尝试刷新页面。

## 贡献

欢迎提交问题和请求功能，也可以 fork 本仓库进行改进并提交 Pull Request。

## 许可证

本项目基于 MIT 许可证，详情请参见 `LICENSE` 文件。
