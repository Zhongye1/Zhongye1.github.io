/** 代码块文件名图标，后缀匹配优先于语言匹配 */
const fileIcons: Record<string, string> = {
  '.babelrc': 'catppuccin:babel',
  '.babelrc.js': 'catppuccin:babel',
  '.crt': 'catppuccin:certificate',
  '.editorconfig': 'catppuccin:editorconfig',
  '.env': 'catppuccin:env',
  '.gitattributes': 'catppuccin:git',
  '.gitconfig': 'catppuccin:git',
  '.gitignore': 'catppuccin:git',
  '.gitkeep': 'catppuccin:git',
  '.gitlab-ci.yml': 'catppuccin:gitlab',
  '.gitmodules': 'catppuccin:git',
  '.key': 'catppuccin:key',
  '.npmrc': 'catppuccin:npm',
  '.patch': 'catppuccin:git',
  '.prettierrc': 'catppuccin:prettier',
  'CHANGELOG.md': 'catppuccin:changelog',
  'CODE_OF_CONDUCT.md': 'catppuccin:code-of-conduct',
  CODEOWNERS: 'catppuccin:codeowners',
  'CONTRIBUTING.md': 'catppuccin:contributing',
  LICENSE: 'catppuccin:license',
  'README.md': 'catppuccin:readme',
  'SECURITY.md': 'catppuccin:security',
  'docker-compose.yml': 'catppuccin:docker-compose',
  'eslint.config.js': 'catppuccin:eslint',
  'eslint.config.mjs': 'catppuccin:eslint',
  'netlify.toml': 'catppuccin:netlify',
  'nuxt.config.ts': 'catppuccin:nuxt',
  'package.json': 'catppuccin:package-json',
  'pnpm-workspace.yaml': 'catppuccin:pnpm',
  'postcss.config.js': 'catppuccin:postcss',
  'prettier.config.js': 'catppuccin:prettier',
  'pyproject.toml': 'catppuccin:python-config',
  'requirements.txt': 'catppuccin:python-config',
  'robots.txt': 'catppuccin:robots',
  'stylelint.config.js': 'catppuccin:stylelint',
  'stylelint.config.mjs': 'catppuccin:stylelint',
  'tailwind.config.js': 'catppuccin:tailwind',
  'tsconfig.json': 'catppuccin:typescript-config',
  'vite.config.js': 'catppuccin:vite',
  'vite.config.ts': 'catppuccin:vite',
  'webpack.config.js': 'catppuccin:webpack',
  'yarn.lock': 'catppuccin:yarn',
}

/** 代码块语言（含常见简写）图标 */
const langIcons: Record<string, string> = {
  bat: 'catppuccin:batch',
  c: 'catppuccin:c',
  'c++': 'catppuccin:cpp',
  cpp: 'catppuccin:cpp',
  css: 'catppuccin:css',
  diff: 'catppuccin:diff',
  dockerfile: 'catppuccin:docker',
  gql: 'catppuccin:graphql',
  hs: 'catppuccin:haskell',
  html: 'catppuccin:html',
  ini: 'catppuccin:properties',
  java: 'catppuccin:java',
  js: 'catppuccin:javascript',
  json: 'catppuccin:json',
  jsonc: 'catppuccin:json',
  jsx: 'catppuccin:javascript-react',
  log: 'catppuccin:log',
  make: 'catppuccin:makefile',
  makefile: 'catppuccin:makefile',
  matlab: 'catppuccin:matlab',
  md: 'catppuccin:markdown',
  mdc: 'catppuccin:markdown',
  mdx: 'catppuccin:markdown',
  mermaid: 'catppuccin:mermaid',
  mmd: 'catppuccin:mermaid',
  powershell: 'catppuccin:powershell',
  ps: 'catppuccin:powershell',
  ps1: 'catppuccin:powershell',
  py: 'catppuccin:python',
  python: 'catppuccin:python',
  rs: 'catppuccin:rust',
  scss: 'catppuccin:sass',
  sh: 'catppuccin:bash',
  shell: 'catppuccin:bash',
  shellscript: 'catppuccin:bash',
  sql: 'catppuccin:database',
  ssh: 'catppuccin:properties',
  'ssh-config': 'catppuccin:properties',
  toml: 'catppuccin:toml',
  ts: 'catppuccin:typescript',
  tsx: 'catppuccin:typescript-react',
  vb: 'catppuccin:visual-studio',
  vue: 'catppuccin:vue',
  xml: 'catppuccin:xml',
  yaml: 'catppuccin:yaml',
  yml: 'catppuccin:yaml',
  zsh: 'catppuccin:bash',
}

const fallbackIcon = 'catppuccin:file'

export function getFileIcon(filename?: string) {
  if (!filename) return undefined
  const extension = Object.keys(fileIcons).find((ext) => filename.endsWith(ext))
  return extension ? fileIcons[extension] : undefined
}

export function getLangIcon(language = 'file') {
  return langIcons[language] ?? fallbackIcon
}

/**
 * 图标名是运行时拼出来的，UnoCSS 扫描源码时提取不到，
 * 这里把可能用到的名字导出，供 uno.config.ts 生成 safelist。
 */
export const codeBlockIconNames = [
  ...new Set([...Object.values(fileIcons), ...Object.values(langIcons), fallbackIcon]),
]
