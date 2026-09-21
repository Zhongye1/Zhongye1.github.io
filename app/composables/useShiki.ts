import type { Element } from 'hast'
import type { BundledLanguage, CodeToHastOptions, HighlighterCore, ShikiTransformer } from 'shiki'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRenderIndentGuides,
  transformerRenderWhitespace,
} from '@shikijs/transformers'

type TransformerOptions = Array<
  'ignoreColorizedBrackets' | 'ignoreRenderWhitespace' | 'ignoreRenderIndentGuides'
>
type ShikiOptions = CodeToHastOptions

interface ShikiCodeOptions {
  language: string
  transformerOptions?: TransformerOptions
  shikiOptions?: Pick<ShikiOptions, 'meta' | 'structure'>
}

type ShikiHtmlOptions = ShikiCodeOptions & {
  embeddedLanguages?: boolean
}

/** 这些语言的 token 没有语法含义，跳过空白与缩进渲染 */
const plainTextLanguages = new Set(['ansi', 'log', 'text'])

/** 明暗两套主题只在这里声明，颜色通过 CSS 变量切换，切配色时无需重新高亮 */
// 注意：ShikiOptions 里的主题配置是个联合类型，Pick/Omit 取不到 themes，
// 所以这里用 as const 收窄 defaultColor，交给 buildOptions 整体断言。
const baseOptions = {
  themes: { light: 'catppuccin-latte', dark: 'one-dark-pro' },
  defaultColor: false as const,
}

let highlighterPromise: Promise<HighlighterCore> | undefined
const loadedLanguages = new Set<string>()

function loadHighlighter() {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, light, dark] =
      await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
        import('shiki/themes/catppuccin-latte.mjs'),
        import('shiki/themes/one-dark-pro.mjs'),
      ])

    return createHighlighterCore({
      themes: [light.default, dark.default],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    })
  })()

  return highlighterPromise
}

/** 按需加载语法；未收录的语言直接跳过，由 buildOptions 回退成纯文本 */
async function loadLanguage(language: string) {
  if (!language || loadedLanguages.has(language)) return
  loadedLanguages.add(language)

  const { bundledLanguages } = await import('shiki/langs')
  const bundled = bundledLanguages[language as BundledLanguage]
  if (!bundled) return

  const highlighter = await loadHighlighter()
  await highlighter.loadLanguage(bundled)
}

/** Markdown 代码块里的围栏语言需要一并加载，否则内层代码会退化成纯文本 */
function getEmbeddedMarkdownLanguages(code: string, language: string) {
  if (language !== 'markdown' && !language.startsWith('md')) return []

  // 加载 TeX 语言有概率导致 LaTeX 高亮异常
  const mdLangRegex = /^\s*`{3,}(\S+)/gm
  return [
    ...new Set(Array.from(code.matchAll(mdLangRegex), (match) => match[1] ?? '').filter(Boolean)),
  ]
}

function transformerUnwrap(): ShikiTransformer {
  return {
    // shiki 的结构固定为 <pre><code>…，这里剥掉外层只留行数组，并给每行补上行号
    root: (hast) => {
      const code = (hast.children[0] as Element).children[0] as Element
      return { type: 'root', children: code.children }
    },
    line(node, line) {
      node.properties['data-line'] = line
    },
  }
}

function getTransformers(options: ShikiCodeOptions): ShikiTransformer[] {
  const ignored = new Set(options.transformerOptions)
  const inline = options.shikiOptions?.structure === 'inline'
  const ignoreInvisibleChars = inline || plainTextLanguages.has(options.language)

  return [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
    transformerNotationFocus(),
    transformerNotationErrorLevel(),
    ignored.has('ignoreRenderIndentGuides') || ignoreInvisibleChars
      ? {}
      : transformerRenderIndentGuides(),
    ignored.has('ignoreRenderWhitespace') || ignoreInvisibleChars
      ? {}
      : transformerRenderWhitespace(),
    ignored.has('ignoreColorizedBrackets') ? {} : transformerColorizedBrackets(),
    inline ? {} : transformerUnwrap(),
  ]
}

function buildOptions(highlighter: HighlighterCore, options: ShikiCodeOptions): ShikiOptions {
  // Shiki 未收录的语言会抛错，回退为纯文本；ansi 是内置特殊语言，不在已加载语法列表里
  const loaded = highlighter.getLoadedLanguages()
  const language =
    options.language === 'ansi' || loaded.includes(options.language) ? options.language : 'text'

  return {
    ...baseOptions,
    lang: language,
    transformers: getTransformers({ ...options, language }),
    ...options.shikiOptions,
  }
}

export default function useShiki() {
  async function codeToHtml(code: string, language: string): Promise<string>
  async function codeToHtml(code: string, options: ShikiHtmlOptions): Promise<string>
  async function codeToHtml(
    code: string,
    languageOrOptions: string | ShikiHtmlOptions,
  ): Promise<string> {
    const options =
      typeof languageOrOptions === 'string' ? { language: languageOrOptions } : languageOrOptions

    const highlighter = await loadHighlighter()
    await loadLanguage(options.language)

    if (typeof languageOrOptions !== 'string' && languageOrOptions.embeddedLanguages) {
      await Promise.all(
        getEmbeddedMarkdownLanguages(code, options.language).map((lang) => loadLanguage(lang)),
      )
    }

    return highlighter.codeToHtml(code, buildOptions(highlighter, options))
  }

  /** 行内代码：把高亮结果内联进目标元素，不使用 <pre> 结构 */
  async function mountInline(target: HTMLElement, code: string, options: ShikiCodeOptions) {
    target.classList.add('shiki')
    target.insertAdjacentHTML(
      'afterbegin',
      await codeToHtml(code, {
        ...options,
        shikiOptions: { ...options.shikiOptions, structure: 'inline' },
      }),
    )
  }

  return { codeToHtml, mountInline }
}
