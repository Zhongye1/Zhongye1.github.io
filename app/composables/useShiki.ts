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

type ShikiOptions = CodeToHastOptions

interface ShikiCodeOptions {
  language: string
  transformerOptions?: Array<
    'ignoreColorizedBrackets' | 'ignoreRenderWhitespace' | 'ignoreRenderIndentGuides'
  >
  shikiOptions?: Pick<ShikiOptions, 'meta' | 'structure'>
}
interface ShikiHtmlOptions extends ShikiCodeOptions {
  embeddedLanguages?: boolean
}

const plainTextLanguages = new Set(['ansi', 'log', 'text'])
const noColorizedBrackets = new Set(['cpp', 'c++'])

const baseOptions = {
  themes: { light: 'catppuccin-latte', dark: 'one-dark-pro' },
  defaultColor: false as const,
}

let highlighterPromise: Promise<HighlighterCore> | undefined
const languageLoads = new Map<string, Promise<string>>()

function loadHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
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
    // 修复：失败清缓存，允许重试
    highlighterPromise.catch(() => (highlighterPromise = undefined))
  }
  return highlighterPromise
}

function loadLanguage(language: string): Promise<string> {
  const name = language.toLowerCase()
  const cached = languageLoads.get(name)
  if (cached) return cached

  const loading = (async () => {
    const { bundledLanguages } = await import('shiki/langs')
    const bundled = bundledLanguages[name as BundledLanguage]
    if (!bundled) return ''
    const highlighter = await loadHighlighter()
    await highlighter.loadLanguage(bundled)
    return name
  })()

  // 修复：失败允许重试
  loading.catch(() => languageLoads.delete(name))
  languageLoads.set(name, loading)
  return loading
}

function getEmbeddedMarkdownLanguages(code: string, language: string) {
  const name = language.toLowerCase()
  if (name !== 'markdown' && !name.startsWith('md')) return []
  const mdLangRegex = /^\s*`{3,}(\S+)/gm
  return [
    ...new Set(Array.from(code.matchAll(mdLangRegex), (match) => match[1] ?? '').filter(Boolean)),
  ]
}

function transformerUnwrap(): ShikiTransformer {
  return {
    // 修复：防御性判断，结构不符时原样返回，不让整页挂掉
    root(hast) {
      const pre = hast.children[0]
      if (pre?.type !== 'element' || pre.tagName !== 'pre') return hast
      const code = pre.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      )
      if (!code) return hast
      return { type: 'root', children: code.children }
    },
    line(node, line) {
      node.properties['data-line'] = line
    },
  }
}

function getTransformers(options: ShikiCodeOptions): ShikiTransformer[] {
  const ignored = new Set(options.transformerOptions)
  const language = options.language.toLowerCase() // 修复：判定统一小写
  const inline = options.shikiOptions?.structure === 'inline'
  const ignoreInvisibleChars = inline || plainTextLanguages.has(language)

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
    ignored.has('ignoreColorizedBrackets') || noColorizedBrackets.has(language)
      ? {}
      : transformerColorizedBrackets(),
    inline ? {} : transformerUnwrap(),
  ]
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
    // 修复：直接用 loadLanguage 解析好的规范名，'' = 未收录 → 纯文本
    const resolved = await loadLanguage(options.language)
    const lang = resolved || 'text'

    if (typeof languageOrOptions !== 'string' && options.embeddedLanguages) {
      await Promise.all(getEmbeddedMarkdownLanguages(code, options.language).map(loadLanguage))
    }

    return highlighter.codeToHtml(code, {
      ...baseOptions,
      lang,
      transformers: getTransformers({ ...options, language: lang }),
      ...options.shikiOptions,
    } as ShikiOptions)
  }

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
