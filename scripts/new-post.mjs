#!/usr/bin/env node
/**
 * `pnpm new` —— 在 content/posts 下新建一篇文章，并写好 Hexo 风格的 frontmatter。
 *
 *   pnpm new "从上下文工程到 Agent Harness" -c 项目 -t Agent,Harness -D 一句话描述
 *   pnpm new                      # 什么都不带时进入交互式提问
 *   pnpm new "标题" -d RFC_Agentic_project/RAG --cover "https://..." --dry-run
 *
 * 约定（跟仓库里已有文章保持一致）：
 *   - 文件名   content/posts/<年>/<YYYY-MM-DD>-<标题>.md
 *   - title    默认带日期前缀，跟 2026 年之后的文章一致（--no-date-prefix 可关）
 *   - abbrlink 用 CRC16/ARC 对 title 取十进制，和 hexo-abbrlink(crc16 + dec) 同源，
 *              撞车时向后探测一个没被占用的值
 *   - uuid     生成 RFC 4122 v1（时间戳型），跟仓库里绝大多数文章一样
 *
 * 只依赖 Node 标准库，不需要装任何包。
 */
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(ROOT, 'content', 'posts')

const USAGE = `
用法：pnpm new [标题] [选项]

选项：
  -c, --category <分类>    分类，默认「笔记」
  -t, --tags <a,b>         标签，逗号分隔（可重复传，中文逗号也认）
  -D, --description <描述>  摘要，默认取标题（去掉日期前缀）
  -C, --cover <url>        封面图 URL，默认留空字符串
  -d, --dir <目录>         相对 content/posts 的目录，默认按年份，如 2026
      --slug <名字>        自定义文件名（默认由标题生成）
      --date <时间>        发布时间，格式 "YYYY-MM-DD HH:mm:ss"，默认当前时间
      --abbrlink <值>      指定 abbrlink，默认按标题算 CRC16
      --uuid <值>          指定 uuid，默认生成 v1
      --no-date-prefix     标题不带日期前缀（文件名仍带）
      --no-mathjax         关掉 mathjax（默认开启）
  -e, --edit               建好后用 $EDITOR 打开
  -n, --dry-run            只打印结果，不落盘
  -h, --help               显示这份帮助

例子：
  pnpm new "记一次改博客" -c 杂记 -t 博客,踩坑
  pnpm new "OGAS 数据模型" -d RFC_Agentic_project -c 项目 -t Agent --cover "https://example.com/a.webp"
`.trim()

/** 短选项 -> 长选项；布尔项值为 true */
const ALIASES = {
  '-c': '--category',
  '-t': '--tags',
  '-D': '--description',
  '-C': '--cover',
  '-d': '--dir',
  '-e': '--edit',
  '-n': '--dry-run',
  '-h': '--help',
}

/** 需要跟一个值的选项 */
const VALUE_OPTIONS = new Set([
  '--category',
  '--tags',
  '--description',
  '--cover',
  '--dir',
  '--slug',
  '--date',
  '--abbrlink',
  '--uuid',
])

/** 布尔选项：--xxx 打开，--no-xxx 关闭 */
const BOOLEAN_OPTIONS = new Set(['--mathjax', '--edit', '--dry-run', '--help', '--date-prefix'])

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const options = {
    title: '',
    category: '笔记',
    tags: [],
    description: '',
    cover: '',
    dir: '',
    slug: '',
    date: '',
    abbrlink: '',
    uuid: '',
    mathjax: true,
    datePrefix: true,
    edit: false,
    dryRun: false,
    help: false,
    interactive: false,
  }
  const positionals = []
  let touched = false

  for (let index = 0; index < argv.length; index++) {
    let arg = argv[index]
    if (!arg.startsWith('-')) {
      positionals.push(arg)
      touched = true
      continue
    }

    // --key=value 拆成 --key value
    let inlineValue
    const eq = arg.indexOf('=')
    if (arg.startsWith('--') && eq !== -1) {
      inlineValue = arg.slice(eq + 1)
      arg = arg.slice(0, eq)
    }
    arg = ALIASES[arg] ?? arg
    touched = true

    // --no-xxx
    if (arg.startsWith('--no-')) {
      const positive = `--${arg.slice(5)}`
      if (!BOOLEAN_OPTIONS.has(positive)) fail(`未知选项：${arg}`)
      setBoolean(options, positive, false)
      continue
    }

    if (BOOLEAN_OPTIONS.has(arg)) {
      setBoolean(options, arg, true)
      continue
    }

    if (!VALUE_OPTIONS.has(arg)) fail(`未知选项：${arg}\n\n${USAGE}`)

    const value = inlineValue ?? argv[++index]
    if (value === undefined) fail(`选项 ${arg} 缺一个值`)
    setValue(options, arg, value)
  }

  options.title = positionals.join(' ').trim()
  options.interactive = !touched && options.title === ''
  return options
}

function setBoolean(options, name, value) {
  if (name === '--mathjax') options.mathjax = value
  else if (name === '--edit') options.edit = value
  else if (name === '--dry-run') options.dryRun = value
  else if (name === '--help') options.help = value
  else if (name === '--date-prefix') options.datePrefix = value
}

function setValue(options, name, value) {
  if (name === '--category') options.category = value.trim()
  else if (name === '--tags') options.tags.push(...splitTags(value))
  else if (name === '--description') options.description = value.trim()
  else if (name === '--cover') options.cover = value.trim()
  else if (name === '--dir') options.dir = value.trim()
  else if (name === '--slug') options.slug = value.trim()
  else if (name === '--date') options.date = value.trim()
  else if (name === '--abbrlink') options.abbrlink = value.trim()
  else if (name === '--uuid') options.uuid = value.trim()
}

function splitTags(value) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

/** 一次问齐所有字段。只在 `pnpm new` 光杆命令 + TTY 下走这条路。 */
async function ask(options) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const title = (await rl.question('标题：')).trim()
    if (!title) fail('标题不能为空')
    options.title = title

    options.category = (await rl.question(`分类 [${options.category}]：`)).trim() || options.category

    const tags = (await rl.question('标签（逗号分隔，可空）：')).trim()
    if (tags) options.tags = splitTags(tags)

    const description = (await rl.question('摘要（可空，默认用标题）：')).trim()
    if (description) options.description = description

    options.cover = (await rl.question('封面 URL（可空）：')).trim()
  } finally {
    rl.close()
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

/** 本地时间 `YYYY-MM-DD HH:mm:ss` */
function formatDate(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

function normalizeDate(input) {
  const matched = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (!matched) fail(`--date 格式应为 "YYYY-MM-DD HH:mm:ss"，收到：${input}`)
  const date = new Date(
    Number(matched[1]),
    Number(matched[2]) - 1,
    Number(matched[3]),
    Number(matched[4] ?? 0),
    Number(matched[5] ?? 0),
    Number(matched[6] ?? 0),
  )
  if (Number.isNaN(date.getTime())) fail(`--date 不是合法时间：${input}`)
  return formatDate(date)
}

/** 文件名用：干掉文件系统非法字符，空白转 `-` */
function slugify(value) {
  return value
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
}

/** CRC-16/ARC，hexo-abbrlink 默认算法（poly 0x8005 反射、init 0） */
function crc16(input) {
  let crc = 0
  for (const byte of Buffer.from(input, 'utf8')) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1
    }
  }
  return crc & 0xffff
}

/** RFC 4122 v1：60 位时间戳 + 随机 clock seq + 随机 node（带 multicast 位） */
function uuidV1() {
  // 1582-10-15 到 1970-01-01 之间的 100ns 数
  const GREGORIAN_OFFSET = 122192928000000000n
  const timestamp = BigInt(Date.now()) * 10000n + GREGORIAN_OFFSET
  const timeLow = (timestamp & 0xffffffffn).toString(16).padStart(8, '0')
  const timeMid = ((timestamp >> 32n) & 0xffffn).toString(16).padStart(4, '0')
  const timeHigh = (((timestamp >> 48n) & 0x0fffn) | 0x1000n).toString(16).padStart(4, '0')

  const random = randomBytes(8)
  const clockSeq = (((random[0] << 8) | random[1]) & 0x3fff) | 0x8000
  const node = [...random.subarray(2, 8)]
  node[0] |= 0x01

  return (
    `${timeLow}-${timeMid}-${timeHigh}-` +
    `${clockSeq.toString(16).padStart(4, '0')}-` +
    node.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  )
}

/**
 * YAML 标量：平时裸写，会被 YAML 误读的才加引号。引号风格跟仓库的 prettier
 * 配置（singleQuote）对齐，这样 `pnpm format` 不会把它改回去。
 */
function yamlScalar(value) {
  if (value === '') return "''"
  const looksSpecial =
    /^[\s&*!|>'"%@`{}[\]#-]|[:#]\s|:\/\/|\s$|[\n\t]/.test(value) ||
    /^(true|false|null|~|-?\d+(\.\d+)?)$/i.test(value)
  if (!looksSpecial) return value
  return value.includes("'") ? JSON.stringify(value) : `'${value}'`
}

/** 走一遍 content/posts，收已有的 abbrlink */
function collectAbbrlinks(dir = POSTS_DIR, found = new Set()) {
  if (!existsSync(dir)) return found
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) collectAbbrlinks(path, found)
    else if (entry.name.endsWith('.md')) {
      const matched = readFileSync(path, 'utf8').match(/^abbrlink:\s*(\S+)\s*$/m)
      if (matched) found.add(matched[1])
    }
  }
  return found
}

/** 撞车就换个种子往后找，保证 abbrlink 全局唯一 */
function uniqueAbbrlink(title, taken) {
  const base = crc16(title)
  if (!taken.has(String(base))) return String(base)
  for (let salt = 1; salt < 1000; salt++) {
    const next = crc16(`${title}#${salt}`)
    if (!taken.has(String(next))) return String(next)
  }
  // 兜底：正常文章量级下走不到这里
  for (let value = 10000; value < 65536; value++) {
    if (!taken.has(String(value))) return String(value)
  }
  return fail('abbrlink 已经被占满了，建议手动用 --abbrlink 指定')
}

function buildFrontmatter({ uuid, title, mathjax, abbrlink, published, category, description, cover, tags }) {
  const lines = [
    '---',
    `uuid: ${uuid}`,
    `title: ${yamlScalar(title)}`,
    `mathjax: ${mathjax}`,
    `abbrlink: ${abbrlink}`,
    `published: ${published}`,
    `category: ${yamlScalar(category)}`,
    `description: ${yamlScalar(description)}`,
    `cover: ${yamlScalar(cover)}`,
    'tags:',
    ...tags.map((tag) => `  - ${yamlScalar(tag)}`),
    '---',
    '',
  ]
  return lines.join('\n')
}

/** --dir 既认「相对 content/posts」，也认「相对仓库根」 */
function resolveTargetDir(input, year) {
  if (!input) return join(POSTS_DIR, year)
  const cleaned = input.replace(/^\.\//, '').replace(/\/+$/, '')
  if (cleaned.startsWith('content/posts')) return join(ROOT, cleaned)
  return join(POSTS_DIR, cleaned)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    console.log(USAGE)
    return
  }

  if (options.interactive) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      fail(`缺标题。\n\n${USAGE}`)
    }
    await ask(options)
  }

  if (!options.title) fail(`缺标题。\n\n${USAGE}`)

  const published = options.date ? normalizeDate(options.date) : formatDate(new Date())
  const date = published.slice(0, 10)
  const year = date.slice(0, 4)

  const hasDatePrefix = /^\d{4}-\d{2}-\d{2}/.test(options.title)
  const title = options.datePrefix && !hasDatePrefix ? `${date}-${options.title}` : options.title
  const cleanTitle = title.replace(/^\d{4}-\d{2}-\d{2}[- ]*/, '')

  const base = options.slug || title
  const fileBase = slugify(/^\d{4}-\d{2}-\d{2}/.test(base) ? base : `${date}-${base}`)
  if (!fileBase) fail('标题（或 --slug）里没有可用的文件名字符')

  const targetDir = resolveTargetDir(options.dir, year)
  const target = join(targetDir, `${fileBase}.md`)
  const pathInRepo = relative(ROOT, target)

  if (existsSync(target)) fail(`文件已存在，先处理它再新建：${pathInRepo}`)

  const description = options.description || cleanTitle
  const abbrlink = options.abbrlink || uniqueAbbrlink(title, collectAbbrlinks())
  const uuid = options.uuid || uuidV1()

  const content = buildFrontmatter({
    uuid,
    title,
    mathjax: options.mathjax,
    abbrlink,
    published,
    category: options.category,
    description,
    cover: options.cover,
    tags: options.tags,
  })

  if (options.dryRun) {
    console.log(`— ${pathInRepo}（dry-run，未写入）—\n`)
    console.log(content.trimEnd())
    return
  }

  mkdirSync(targetDir, { recursive: true })
  writeFileSync(target, content, 'utf8')

  const route = `/blog/${relative(POSTS_DIR, target).replace(/\.md$/, '')}/`
  console.log(`✓ 已创建 ${pathInRepo}`)
  console.log(`  访问路径 ${route}`)
  console.log(`  abbrlink ${abbrlink} · uuid ${uuid}`)
  console.log('  下一步：pnpm dev 起本地预览')

  if (options.edit) {
    const editor = process.env.VISUAL || process.env.EDITOR
    if (!editor) {
      console.warn('! 没设置 $VISUAL / $EDITOR，跳过打开编辑器')
      return
    }
    const [command, ...args] = editor.split(/\s+/)
    spawnSync(command, [...args, target], { stdio: 'inherit' })
  }
}

await main()
