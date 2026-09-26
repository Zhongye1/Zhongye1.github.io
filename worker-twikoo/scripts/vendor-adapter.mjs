#!/usr/bin/env node
/**
 * 重新 vendor 适配器产物。
 *
 * 背景：`@twikoojs/cloudflare` 目前 `private: true`、未发布到 npm，所以 Cloudflare 侧
 * 只能把它的**构建产物**整份搬进 `src/twikoo/`。搬进来的文件在文件头有一段说明，
 * 与上游的差异只有一处：`@twikoojs/common` 从 `workspace:*` 改成 npm 上的固定版本
 * （上游在 monorepo 里靠 workspace 链接解析，脱离那棵树就断）。
 *
 * 用法：
 *
 *   node scripts/vendor-adapter.mjs                  # 自动找 twikoo 仓库
 *   node scripts/vendor-adapter.mjs /path/to/twikoo  # 手动指定仓库根目录
 *   TWIKOO_REPO=/path/to/twikoo node scripts/vendor-adapter.mjs
 *
 * 前置：在 twikoo 仓库里先 `pnpm install && pnpm build`（@twikoojs/common 与
 * @twikoojs/shared 需要先产出 dist/）。
 *
 * 跑完记得 `pnpm typecheck && pnpm dev` 验一遍，再看一眼 package.json 里
 * `@twikoojs/common` 的版本是否与上游 packages/server-common/package.json 的 version 一致。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')

/** 判据：该仓库里已经有构建好的适配器产物 */
const distRel = join('packages', 'server-cloudflare', 'dist', 'index.js')
const hasDist = (root) => existsSync(join(root, distRel))

/**
 * 定位 twikoo 仓库根目录。
 *
 * 显式给的那条路径（命令行参数 / `TWIKOO_REPO`）**只认它**：找不到就直接报错，
 * 不再悄悄回退到自动发现 —— 否则打错一个字母会得到「命令成功但用的是另一个仓库」，
 * vendor 出来的东西还能骗过 typecheck。
 * @returns twikoo 仓库根目录
 */
function resolveTwikooRoot() {
  const explicit = [process.argv[2], process.env.TWIKOO_REPO].find(
    (entry) => typeof entry === 'string' && entry !== '',
  )
  if (explicit) {
    const root = resolve(explicit)
    if (!hasDist(root)) {
      throw new Error(
        `指定的 twikoo 仓库里没有 ${distRel}：${root}\n` +
          `先在那边跑 \`pnpm install && pnpm build\`，或换一个路径。`,
      )
    }
    return root
  }

  // 本机布局是 `~/Desktop/Zhongye1.github.io/worker-twikoo` 与 `~/Desktop/Blog/twikoo` 并排
  const candidates = [
    join(projectRoot, '..', 'Blog', 'twikoo'),
    join(projectRoot, '..', '..', 'Blog', 'twikoo'),
    join(projectRoot, '..', 'twikoo'),
  ]
  const found = candidates.find(hasDist)
  if (!found) {
    throw new Error(
      `没有自动找到 twikoo 仓库（判据是存在 ${distRel}）。试过这些路径：\n` +
        candidates.map((candidate) => `  · ${resolve(candidate)}`).join('\n') +
        `\n请显式传路径：node scripts/vendor-adapter.mjs /path/to/twikoo`,
    )
  }
  return found
}

const twikooRoot = resolveTwikooRoot()

const upstreamDist = join(twikooRoot, distRel)
const upstreamSchema = join(twikooRoot, 'packages', 'server-cloudflare', 'schema.sql')
const upstreamCommonPkg = join(twikooRoot, 'packages', 'server-common', 'package.json')

/** 与上游唯一的有意差异，见文件头 */
const COMMON_SPECIFIER = '@twikoojs/common'

const header = `// ============================================================================
// vendor 产物，请勿手改。重新生成：node scripts/vendor-adapter.mjs（见 ../README.md）
//
// 来源：twikoo 仓库 packages/server-cloudflare/dist/index.js
//       （构建命令：pnpm --filter @twikoojs/cloudflare build）
// 版本：@twikoojs/cloudflare 0.0.0（该包 private，尚未发布到 npm，所以只能整份搬进来）
//
// 与上游唯一的有意差异：import 语句里的 \`${COMMON_SPECIFIER}\` 用 npm 上已发布的版本解析
// （见 package.json 的 dependencies）。上游仓库里它是 workspace:*，脱离那棵仓库就解析不到。
// ============================================================================
`

const source = readFileSync(upstreamDist, 'utf8')
/** 上游 monorepo 里 server-common 的版本（本地开发时通常是 0.0.0，不能当发布版本看） */
const upstreamCommonVersion = JSON.parse(readFileSync(upstreamCommonPkg, 'utf8')).version
/** 本 Worker 实际依赖的公共层版本（npm 上已发布的那个，产物的 import 由它解析） */
const pinnedCommonVersion = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
  .dependencies?.[COMMON_SPECIFIER]
const marker = `from "${COMMON_SPECIFIER}"`

if (!source.includes(marker)) {
  throw new Error(
    `产物里没有找到 \`${marker}\`：上游 ${upstreamDist} 的形态变了（依赖被内联了？），` +
      `先人工核对再更新本脚本。`,
  )
}

mkdirSync(join(projectRoot, 'src', 'twikoo'), { recursive: true })
writeFileSync(join(projectRoot, 'src', 'twikoo', 'index.js'), header + source)
writeFileSync(join(projectRoot, 'schema.sql'), readFileSync(upstreamSchema, 'utf8'))

console.log(`✔ 已 vendor 适配器产物 → src/twikoo/index.js`)
console.log(`✔ 已同步表结构 → schema.sql`)
console.log(`\n公共层版本核对：`)
console.log(
  `  · 本 Worker 依赖（npm 已发布）：${COMMON_SPECIFIER}@${pinnedCommonVersion ?? '(未声明)'}`,
)
console.log(`  · 上游仓库 server-common：${upstreamCommonVersion}（本地开发常为 0.0.0，仅供参考）`)
console.log(`产物与公共层接口对不上时，先确认这两个版本是不是同一代。`)
