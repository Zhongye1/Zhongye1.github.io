---
uuid: 1fa522e0-c7a6-11f0-beab-eb8961f00b4e
title: '2025-11-22-简谈前端包管理器npm、pnpm、Yarn 与 Bun'
mathjax: true
abbrlink: 15722
published: 2025-11-22 21:21:15
category: 笔记
cover: 'https://pica.zhimg.com/70/v2-a6ca782e51cff8b16da130b1c43fe744_1440w.avis?source=172ae18b&biz_tag=Post'
tags:
  - 前端
---

前端关于 npm、pnpm、Yarn 与 Bun 的选型，主要得看它们在生产环境的差异。好的包管理器不该让幽灵依赖爆掉，不该因为 `workspace:` 协议悄悄往 registry 发一个坏掉的包，lockfile 也不该团队成员谁都看不懂。

下面先看机制，再看安装速度、lockfile、工作区、生产可靠性。

## 四款包管理器从哪来

**npm** 从一开始就捆绑在 Node.js 里。它算不上刻意设计，只是 Node 顺带带了个包管理器，registry 围着它长了起来。真正的大架构决策出现在 2015 年的 npm v3：把 `node_modules` 拍平成单一的提升（hoisted）目录，以应付 Windows 的路径长度限制，以及旧式的深层嵌套安装树。npm v3 之前，`node_modules` 是嵌套的——每个依赖有自己的 `node_modules` 装着自己声明过的依赖；这种结构可预测、干净，但树太深，Windows 路径会爆，同一份包也会被复制多份。扁平化解决了这两件事，但代价是一连串新的麻烦。

**Yarn** 2016 年 10 月发布，由 Facebook 与 Tilde、Exponent、Google 共同打造。当时的卖点很简单：确定性安装、并行网络 IO、离线缓存。它管用。但 pnpm 作者 Rico Sta. Cruz 当时正在给 pnpm 投入精力，Yarn 的发布让他失望——不是因为 Yarn 不好，而是因为 Yarn 用了和 npm v3 一样的扁平 `node_modules` 结构，等于在解决速度与确定性，却没碰结构本身。随后 2020 年 Yarn 2 登场，内部代号 "Berry"，带来 Plug'n'Play——一次激进得多的押注：干脆干掉 `node_modules`。Yarn 3、Yarn 4 在此基础上迭代。2017 年那个 Yarn（`yarn.lock`、快速安装、npm 的即插即用替代品）现在叫 **Yarn Classic**，已进入维护模式。今天正经人在用的 Yarn 是 Berry，它不是同一个工具。

**pnpm** 由 Rico Sta. Cruz 于 2017 年 6 月首发，围绕一个执拗的想法：磁盘上一份内容寻址存储，硬链接进每个项目的 `node_modules`。同一个包、同一个版本，全机只有一份，不管有多少项目在用，强制严格的依赖解析：代码只能 `import` 真正声明过的包。Rico 当初的判断是：扁平化的 `node_modules` 有一连串问题——模块可以访问未声明过的包、扁平化算法复杂、有些包仍要在项目内被复制多份——而 Yarn 不打算解决这些问题，所以他继续做 pnpm。

**Bun** 2023 年 9 月到 1.0。它是运行时、打包器、测试运行器、包管理器四合一，全部从零写起：最初用 Zig，2026 年正用 Rust 重写，作者是 Jarred Sumner。它的包管理器基本等于把 `npm install` 重写一遍，只为极限速度优化。还有一件事：2025 年 12 月，Bun 加入 Anthropic。它不再是小独立项目，背后是一家大量内部使用它的 AI 大厂，虽然我好奇 Anthropic 为什么会看上它。

历史遗留左右了各自的设计：npm 是顺势长成的默认项，Yarn 不停试图重新定义"安装图该长什么样"，pnpm 认准一个强观点并坚持到底，Bun 则激进重写，速度为王。

## 安装算法：决定一切的底层

安装算法决定了一款工具的速度、磁盘占用、幽灵依赖的表现，以及 monorepo 会不会在 18 个月后变成噩梦。

### npm：拍平且宽容

跑 `npm install` 时，npm 读 `package.json`、构建依赖树，然后把能提的都提到 `node_modules` 顶层。如果 `package-a` 依赖 `lodash@4`、`package-b` 也依赖 `lodash@4`，那 `node_modules/lodash` 就只有一份，两个包都通过 Node 标准的模块解析上溯找到它。版本冲突时，比如 `package-a` 要 `lodash@4`、`package-b` 要 `lodash@3`——npm 就会挑一个提升、把输家嵌套到需要它的包下面。

这个提升导致了幽灵依赖，比如代码可以不声明 lodash 就写 `require('lodash')`，它能跑，因为 lodash 恰好在顶层。直到某天 `package-a` 在小版本里去掉了 lodash 依赖，lodash 不再被提升，import 在生产环境返回 `undefined`

npm 近几年的速度已经追上来不少，兼容性也是最广的：每个 CI runner、每个 Docker 镜像、每套接手的老代码，都默认 `npm install` 能跑。它的 lockfile 是 `package-lock.json`，npm v7 起为 `lockfileVersion: 3`，携带的信息足以复现整棵树，而不必重读 `node_modules` 里每个 `package.json`。

### pnpm：硬链接加符号链接

pnpm 做的是真正不同的事。在机器上装过的每个包版本，都只存在一份，放在内容寻址存储里，通常在 `~/.local/share/pnpm/store`。存储里的每个文件用内容哈希标识，所以两个恰好带同一份 `README.md` 的不同包版本，用的是完全一样的磁盘字节。

往项目里装包时，pnpm 不复制文件。它从存储往项目内的 `node_modules/.pnpm/` 虚拟存储建硬链接，再用符号链接从这个虚拟存储搭出可见的 `node_modules` 布局。结果是两层间接：`require()` 到的文件是链向 `.pnpm/` 的符号链接，而它又是链向全局存储的硬链接。

pnpm 不扁平化依赖树这件事，得从 npm v3 之前的结构说起。npm v2 时代，`node_modules` 是嵌套的——foo 依赖 bar，foo 的目录里就有一个自己的 `node_modules` 装 bar。这种结构干净、可预测，但树太深会爆 Windows 路径，同一份包会被复制多份。npm v3 用扁平化解决了这两件事，但引出了幽灵依赖与算法复杂度。pnpm 选择了第三条路：保留"每个包有自己的依赖入口"这个干净属性，但用符号链接代替真实的子目录，避免树过深。

pnpm 的 `node_modules` 根目录下每个包都是一个符号链接，指向 `.pnpm/<包名>@<版本>/node_modules/<包名>`；在那个内部目录里，包的依赖又是符号链接，指向同级的 `.pnpm/<依赖名>@<版本>/node_modules/<依赖名>`。Node.js 在 `require()` 时会忽略符号链接、走真实路径（realpath），所以 `require('foo')` 最终执行的是虚拟存储里的 foo，而 foo 内部 `require('bar')` 时，Node 沿目录树上溯，能找到同级符号链接过去的 bar。结构看上去绕，但每个包只能看到自己声明过的依赖，幽灵依赖被默认阻断。Rico 当初正是靠这一点把 pnpm 的算法做得足够简单——简单到一个人能跟上 Yarn 几十个贡献者的节奏。

这套机制带来两笔收益：

**磁盘节省惊人。** 一台机器跑十个 Next.js 项目，在 pnpm 下可能只占几 GB 存储；同样的依赖用 npm 会是 30 多 GB 重复的 `node_modules`。

**幽灵依赖消失了。** 因为通过符号链接图，每个包只能看到自己声明过的依赖，代码无法意外 import 没声明过的东西。

代价就是这个符号链接层本身。有些老构建工具假定 `node_modules` 里都是真实目录里的真实文件，偶尔会撞上一个在符号链接下行为异常的。不过可以 `.npmrc` 里设 `node-linker=hoisted`，让 pnpm 产出拍平的 npm 式布局，用严格性换回兼容性。

### Yarn Berry：问题出在 node_modules

Yarn 2+ 的立场最激进：`node_modules` 是 Node 从未妥善解决的一个问题留下的 15 年 workaround，认为不该继续维护它。Plug'n'Play（PnP）彻底移除 `node_modules`，改成生成一个单独的 `.pnp.cjs` 文件（早先是 `.pnp.js`），它是一张大查找表，把（包名，版本）映射到磁盘位置，并打补丁让 Node 的模块解析器直接查这张表。

这机制不再沿文件树上溯找 `node_modules`，不再为每次 `require()` 做 IO，只剩一次哈希查找。包以 ZIP 留在全局 Yarn 缓存里，Node 通过虚拟文件系统读取。磁盘与启动时间的收益是实的。

麻烦在于整个生态都假定 `node_modules` 存在。那些直接扫 `node_modules` 的工具——某些打包器、某些 linter、某些老 Webpack 插件——在 PnP 下会坏。Yarn 提供了一个编辑器 SDK，教 VS Code 在 ZIP 里找类型。多数现代工具可用，但会在 npm、pnpm 用户永远不会遇到的边角上栽跟头。

Yarn Berry 也仍支持常规的 `node_modules` 安装，在 `.yarnrc.yml` 里写 `nodeLinker: node-modules`。拿到 Yarn 的 lockfile、工作区和插件，而不必押注 PnP。

### Bun：和 npm 同样的想法，只是由不耐烦的人重写

`bun install` 读 `package.json`、建树、下载缺失的部分、写出类似 npm 的拍平 `node_modules`。没有花哨的间接层、没有符号链接存储、没有虚拟文件系统。快的原因在于整套东西是个用 Zig 写的编译产物（现迁往 Rust 了），吃满每个 CPU 核，并完全省掉 Node 的启动开销。

Bun 的安装也有自己的全局缓存（`~/.bun/install/cache`），会从缓存硬链接或复制，而不是重新下载。但可见的 `node_modules` 就是构建工具期望的那种布局，所以兼容性问题很少。若只为了 `bun install` 而选 Bun，得到的只是一个形状相同、更快的 npm install；

## 安装速度

- npm：早期版本安装慢，npm v7+ 起经过优化显著提升，但仍落后于后起之秀。
- Yarn Classic (v1)：靠并行下载和高效缓存，安装速度通常快于同期 npm。
- pnpm：pnpm 的核心优势之一。利用全局内容寻址存储和硬链接，让每个包在全局只存一份实体文件。多个项目依赖同一个包时，只需向全局存储建硬链接，大幅减少文件复制和网络下载，安装极快。
- Bun：速度最快。Bun 从底层重写，靠 Zig 的执行效率，包安装速度通常是 npm 的几十倍，也明显快于 pnpm 和 Yarn。这种原生性能是其最大的卖点。

## 磁盘空间效率

随着项目增多，`node_modules` 可能占据大量磁盘空间。

- npm/Yarn Classic：都用扁平化 `node_modules` 结构，相同包的不同版本、甚至相同版本在不同项目里都可能被多次复制，造成磁盘冗余。
- pnpm：磁盘效率冠军。所有包的实体文件只在全局存储一份，项目里通过硬链接或符号链接引用。即使上百个项目依赖同一个包，也只占一份磁盘空间。
- Yarn Berry (v2+)：用 Plug'n'Play (PnP)，彻底废弃 `node_modules`。通过一个 `.pnp.cjs` 文件直接解析模块路径，避免文件复制，磁盘效率极高。
- Bun：类似 pnpm，用符号链接把依赖项链到全局缓存，磁盘效率也很高。

## Lockfile

每款包管理器都有 lockfile。目的一样：把每个传递依赖钉到具体版本与完整性哈希，使安装可复现。但它们在形态、可读性、处理合并冲突的方式上不同。表面无聊，实操痛苦。

**JSON：`package-lock.json`（npm，v3）**

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": { "name": "my-app", "dependencies": { "lodash": "^4.17.21" } },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

diff 噪声大但可读。合并冲突通常是机械性的：接受对方版本再重跑 `npm install`。自 npm v7 起一直是 `lockfileVersion: 3`，带的元数据足以重建整棵树，无需查 registry 或 `node_modules`。

**YAML：`pnpm-lock.yaml`（pnpm）**

```yaml
lockfileVersion: '9.0'

importers:
  .:
    dependencies:
      lodash:
        specifier: ^4.17.21
        version: 4.17.21

packages:
  lodash@4.17.21:
    resolution: { integrity: sha512-... }
```

YAML，比 npm 简洁得多，且 pnpm 花了真功夫让不同版本间的 diff 尽量小。一个含十几份工作区的 monorepo 里，它在代码评审中明显比 `package-lock.json` 好读。合并冲突依然烦，但冲突面更小。

**文本：`yarn.lock`（Yarn，classic 格式）**

```
"lodash@^4.17.21":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-...
```

Yarn 自创了一种格式，YAML 味但并非 YAML。这是刻意选择：为可读 diff 优化。Berry 用基本相同的形式，并加了 PnP 的额外元数据。这个格式老化得比预期好。

**Bun** 起初发的是二进制 lockfile `bun.lockb`。好处显而易见：文件更小、读取更快。痛处同样明显，开发者显然没法在 PR 里审一个二进制 lockfile，且合并冲突是灾难级的。Bun 后来出了基于文本的 `bun.lock`（JSONC）格式，并在 Bun v1.2 设为默认。已有项目可用 `bun install --save-text-lockfile` 迁移。

## 工作区与 monorepo

monorepo 是包管理器真正拉开差距的地方。下面从七个维度看四款工具的表现。

**workspace 的声明形态。** npm、Yarn、Bun 都用根 `package.json` 的 `workspaces` 字段声明本地包；pnpm 单独用 `pnpm-workspace.yaml`。pnpm 的分离让工作区配置可以独立版本化，9.0 之后还能把依赖覆盖、catalog 放进同一个 yaml，在大型 monorepo 里更清晰。

**`workspace:` 协议。** 这是 monorepo 里最关键的一条——它决定了"本地包引用能不能被误解析成 registry 上的某个版本"。npm 与 Yarn Classic 都不支持，只能写具体版本号，发布后引用关系不变。Yarn Berry、pnpm、Bun（1.x 起）都支持。pnpm 与 Yarn Berry 在发布时会把 `workspace:*` 改写为实际版本号，且**拒绝**解析为任何非本地副本。Bun 自 1.x 起追上了这一点，但仍是四者中最年轻的实现。

用 npm 时，如果在 `apps/web` 里写 `"@my-org/ui": "1.2.0"`，npm 会先看本地工作区有没有 `@my-org/ui@1.2.0`，有就用本地、没有就从 registry 拉。这个"有就用本地、没就上网"的回退路径是 npm monorepo 出事故的常见源头——一旦本地版本号对不上，npm 会悄悄去 registry 拉一个同名包，发布出去的 `apps/web` 可能引用了一个**别人发布的** `@my-org/ui`。

**跨工作区的幽灵依赖防护。** 幽灵依赖在 monorepo 里会变成"工作区 A 能跑，是因为它意外 import 了工作区 B 的 `node_modules` 里的包"。npm、Yarn Classic、Bun 把依赖提升到根，所有工作区共享同一棵提升树，跨工作区幽灵依赖横行。pnpm 给每个工作区自己严格隔离的 `node_modules`，跨工作区幽灵依赖被默认阻断。Yarn Berry PnP 通过 `.pnp.cjs` 查表阻断得更彻底；但用 `nodeLinker: node-modules` 模式时退回到 npm 行为。在 10+ 工作区的 monorepo 里，这条差异通常是"信得过"与"惊喜连连"的分水岭。

**跨工作区脚本执行。** monorepo 经常需要"在所有 `packages/*` 里跑 build"、"web 依赖 ui，先 build ui 再 build web"这种拓扑顺序执行。npm 的 `npm run build --workspaces` 能跑全部，但**没有拓扑排序**，并行也没内置支持。Yarn Classic 同样没有。Yarn Berry 通过插件（如 `@yarnpkg/plugin-workspace-tools`）支持拓扑排序与过滤，插件生态是它在 monorepo 场景的真正强项。pnpm 的 `pnpm -r run build` 自带拓扑排序，`--filter` 语法支持按依赖关系筛选——`--filter @my-org/ui...` 表示"ui 及其依赖的所有包"，`--filter ...@my-org/ui` 表示"ui 以及所有依赖 ui 的包"，是 monorepo 改一个包只测影响范围的关键能力，npm 与 Yarn Classic 都没有原生等价物。Bun 的 `bun run --filter '*' build` 已支持，拓扑排序与并行执行在 1.x 里逐步完善，但仍不如 pnpm 成熟。

**发布行为。** monorepo 发包时，本地工作区之间的版本引用要被改写成实际版本号，否则发布出去的包会带着 `workspace:` 字样，registry 不认。npm 与 Yarn Classic 不支持 `workspace:` 协议，没有改写问题，但代价是发布前要手动同步版本号，容易漏。Yarn Berry、pnpm、Bun 在发布时自动改写，且 `pnpm -r publish` 与 `yarn workspaces foreach` 还支持批量发布所有改动过的工作区。Bun 的发布流程仍比 pnpm 简陋，多数团队仍需配合 changesets 使用。

**插件与扩展能力。** monorepo 一旦上规模，常需要约束工作区之间的依赖方向、统一版本策略、与 TypeScript project references 同步。npm 插件生态几乎为零，全靠外部工具（Nx、Turbo、Lerna、changesets）。Yarn Classic 插件少，且已进入维护模式。**Yarn Berry 插件生态最强**：官方与社区插件覆盖依赖约束、版本策略、工作区工具、TS project references 同步等，还能写自定义插件拦截安装与发布生命周期。pnpm 核心能力内置（filter、拓扑排序、catalog、`overrides`、`patchedDependencies`），插件生态不如 Berry 但日常够用。Bun 插件系统仍在发展中，monorepo 能力主要靠内置。

**依赖版本统一。** monorepo 里多个工作区依赖同一个包的不同版本、希望强制统一时：npm 靠 `overrides`（8.3+）、Yarn 靠 `resolutions`、Bun 兼容 npm 的 `overrides`。pnpm 在 `pnpm.overrides` 之上，9.0 起加了 `catalogs`——在 `pnpm-workspace.yaml` 里定义一份版本目录，各工作区用 `catalog:default` 引用，改一处全 monorepo 生效。这是 pnpm 在版本治理上独有的一项。

一句话总结这一节：npm 的 workspace 是"能跑"级别，pnpm 是"默认就对"级别，Yarn Berry 是"配好之后最强"级别，Bun 是"快速追上中"级别。

## 生产可靠性

包管理器的"生产可靠性"大致是：同一份 `package.json` 与 lockfile 在 CI 里和在笔记本上是否产出同一份安装；以及防呆机制。下面几件事按咬人的频率排序。

**严格模式的依赖解析。** 幽灵依赖 import 了从未声明过的东西——是 JavaScript 里"我机器上能跑、CI/预发/生产挂了"类事故最常见的成因。npm 与 Bun 的拍平提升允许它；pnpm 默认阻止它；Yarn PnP 默认阻止它；Yarn 用 `nodeLinker: node-modules` 时允许它。严格依赖解析是下次起新项目就该顺手拿下的免费升级。

**确定性安装。** 给定同一份 lockfile，四款工具的安装都是确定性的。问题是没 lockfile 时会发生什么。npm 与 Yarn Classic 历史上允许未锁定的安装漂移；现代 Yarn 在 lockfile 不同步且未给显式标志时会拒绝安装；pnpm 有 `--frozen-lockfile`；Bun 有 `--frozen-lockfile`。CI 里会给用的工具加上 frozen-lockfile 标志，否则错位的 lockfile 会在 CI 里默默重写自己，导致未经评审的版本发布。

**Postinstall 脚本。** 原生模块（node-gyp 构建、sharp 的预编译二进制、Prisma 的引擎下载）都通过 postinstall 脚本运行。这类东西在四款工具上通常都没问题，但 pnpm 的严格布局与 Yarn PnP 各有边角——某个 postinstall 脚本假定了实际并不成立的 `node_modules` 形状。

## 选型

多数场景下我认为还是pnpm占优，目前pnpm在字节内部多个团队也都有实践，主要是eden的monorepo底层依赖管理工具支持yarn workspace和pnpm的切换，随着eden的支持，可以见到pnpm在字节内部的实践范围会越来越大。毕竟pnpm是真正的解决node_modules的依赖困境，主要通过软链接和硬链接的结合使用，最终达到节省磁盘空间，安装速度快，严格高效等优点。

## 参考

NPM 中的 phatom 与 doppelgangers 问题：https://zhuanlan.zhihu.com/p/353208988

node_modules困境：https://zhuanlan.zhihu.com/p/137535779

扁平的node_modules并不是唯一选项：https://pnpm.io/zh/blog/2020/10/17/node-modules-configuration-options-with-pnpm
