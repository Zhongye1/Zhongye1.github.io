---
uuid: 1fa522e0-c7a6-11f0-beab-eb8961f00b4e
title: '2025-11-22- 关于前端包管理器npm,pnpm,yarn和bun以及我为何选择后者'
category: Github项目
mathjax: true
abbrlink: 15722
published: 2025-11-22 21:21:15
---
**因为快。**

2025 年，Bun 作为一个「全能型」运行时 + 包管理器，在实际项目中对传统包管理器（npm/yarn/pnpm）确实有相当大的优势，很多人已经开始抛弃 npm/yarn/pnpm，转用 Bun 作为前端项目的包管理器

### 初识 Bun 管理器

Bun 是 JavaScript 和 TypeScript 应用程序的一站式工具包。它作为一个名为`bun`的单个可执行文件提供。

其核心是 Bun 运行时，这是一个快速的 JavaScript 运行时，设计为 Node.js 的即插即用替代品。它是用 Zig 编写的，在底层由 JavaScriptCore 驱动，大大减少了启动时间和内存使用。

### 对比其他包管理器

#### 1. npm（Node Package Manager）

**核心实现**：

- **依赖存储与解析**：使用扁平化依赖树（flattened dependency tree，自 v3+ 引入），但仍依赖传统的 node_modules 目录结构。每个包及其子依赖都会下载 tarball（压缩包），然后解压到本地 node_modules 中。如果有版本冲突，会创建嵌套的 node_modules 子目录（hoisting 机制试图扁平化，但不总是完美）。
- **锁文件**：package-lock.json，记录精确的依赖树和哈希值，确保可重现安装。
- **缓存机制**：全局缓存在 ~/.npm（或 Windows 的 %AppData%\npm-cache），存储 tarball 和元数据。安装时先检查缓存，命中则直接解压。
- **下载与并行**：自 v7+ 支持并行下载（自 v5+），使用 HTTP/1.1 或 HTTP/2，但解析依赖树时仍依赖 JavaScript 引擎（Node.js），导致启动开销大。
- **monorepo 支持**：基本支持（通过 workspaces），但需手动配置，效率一般。

**技术栈**：纯 Node.js 实现，CLI 基于 npm-cli。

#### 2. pnpm（Performant NPM）

**核心实现**：

- **依赖存储与解析**：引入**内容寻址存储（content-addressable store）**，所有包统一存储在全局 .pnpm/store（硬链接 + 符号链接）。项目中只生成一个扁平的 node_modules/.pnpm 目录，通过符号链接（symlinks）指向全局包，避免重复下载。严格的 peer dependency 隔离，防止“幽灵依赖”（phantom dependencies）。
- **锁文件**：pnpm-lock.yaml，YAML 格式，记录依赖图和完整哈希链。
- **缓存机制**：全局 store + 硬链接，安装时直接链接现有包（无解压开销）。支持范围补丁（patching），允许动态修改依赖。
- **下载与并行**：并行下载 + 增量更新，自 v8+ 优化为“聪明缓存”，只下载变化部分。monorepo 原生支持（workspace 协议），通过过滤命令（如 pnpm -r）高效处理多包。
- **monorepo 支持**：最佳，原生高效，节省 70-80% 磁盘。

**技术栈**：Node.js 实现，但使用 Rust-like 的高效链接系统（实际是 JS + 文件系统优化）。

#### 3. Yarn Berry（Yarn v2+）

**核心实现**：

- **依赖存储与解析**：革命性 **Plug'n'Play (PnP)** 模式，默认**完全消除 node_modules**。依赖通过 .pnp.cjs（或 .pnp.js）文件映射（类似虚拟文件系统），运行时动态解析路径，而非物理目录。备选 nodeLinker: node-modules 模式回退到传统结构。
- **锁文件**：yarn.lock（v2+ 格式），包含完整依赖树、校验和和 ZIP 存档引用。
- **缓存机制**：项目级 .yarn/cache，存储 ZIP 压缩的包（可提交到 Git，实现“零安装”——clone 后直接运行）。支持“零安装”（zero-installs），CI/CD 无需重新下载。
- **下载与并行**：并行下载 + 增量缓存，自 v3+ 引入 Constraints（依赖规则检查）。monorepo 通过 Workspaces + Plug'n'Play 实现高效共享。
- **monorepo 支持**：优秀，支持 Constraints 和 Patch 协议，适合大型团队。

**技术栈**：Node.js 实现，但 PnP 使用自定义加载器（loader）拦截模块解析。

#### 4. Bun

**核心实现**：

- **依赖存储与解析**：**无 node_modules**，所有包存储在全局单例缓存（~/.bun/install/cache），项目只生成极小的 .bun 文件夹（二进制锁文件）。使用**极致压缩 + 硬链接**，运行时直接从缓存加载（跳过解压）。兼容 npm 注册表，但内置 JSR（JavaScript Registry）支持。
- **锁文件**：bun.lockb，二进制格式（超小、超快解析）。
- **缓存机制**：全局缓存 + 内容哈希，安装时并行下载并验证哈希。支持“热缓存”（hot cache），CI 复用率近 100%。
- **下载与并行**：使用 Zig 语言编写的超快解析器（非 JS），HTTP/3 支持 + 原生并行。monorepo 自动识别，无需额外配置。
- **monorepo 支持**：优秀，极速安装，但生态仍在完善（2025 年已稳定）。

**技术栈**：Zig + JavaScriptCore（WebKit 引擎），非 Node.js 依赖，实现全栈（包管理 + bundler + 测试运行器）。

基于 pnpm 官方基准（2025-11-16 更新）、Bun 团队报告和社区测试，四个包管理器中**Bun 整体最快，pnpm/Yarn Berry 在磁盘效率上领先，npm 最稳但最慢**。

### 安装

Bun 支持 Linux（x64 和 arm64）和 macOS（x64 和 Apple Silicon）。

```sh
# 使用npm
npm install -g bun
```

### 升级

```text
bun upgrade
```

### 使用

`bun`命令行工具实现了测试运行器、脚本运行器和与 Node.js 兼容的包管理器。Bun 的内置工具明显比现有选项快，并且在现有 Node.js 项目中几乎不需要进行任何更改。


```bash
bun test                      # 运行测试
bun run start                 # 运行`package.json`中的`start`脚本
bun install <pkg>             # 安装包
bunx cowsay 'Hello, world!'   # 执行包
bun run index.tsx             # 默认支持TS和JSX
```


