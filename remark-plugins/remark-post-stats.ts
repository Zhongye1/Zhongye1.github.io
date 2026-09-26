import type { Root } from 'mdast'
import type { VFile } from 'vfile'
import { visit } from 'unist-util-visit'

/**
 * 把正文的文字量写进 frontmatter 的 `words` / `readingMinutes`。
 * 这两个字段已在 content.config.ts 里声明，所以会落成真实列，
 * 之后可以直接 `queryCollection('posts').select('words')` 求和，不必把正文发到客户端。
 *
 * 没引 remark-reading-time：它底层是 reading-time，按空格切词，中文正文会被算成
 * 「一大坨 = 1 词」，与「字数」的直觉差得远。这里中日韩字符逐字计数、其余按空白切词。
 */
declare module 'vfile' {
  interface DataMap {
    words?: number
    readingMinutes?: number
  }
}

/** 中日韩统一表意文字 + 假名 + 谚文，按「字」计 */
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g

/** 中文阅读速度取 300 字/分，落在常见的 200-400 区间内 */
const WORDS_PER_MINUTE = 300

function countWords(text: string) {
  const cjk = text.match(CJK)?.length ?? 0
  // 摘掉 CJK 再按空白切，剩下的就是西文单词与数字
  const latin = text.replace(CJK, ' ').split(/\s+/).filter(Boolean).length
  return cjk + latin
}

export default function remarkPostStats() {
  return (tree: Root, file: VFile) => {
    let words = 0

    // 只统计 text 节点：代码块（code）与行内代码（inlineCode）的值挂在自身 value 上，
    // 不是 text 节点，所以天然不计入。
    visit(tree, 'text', (node) => {
      words += countWords(node.value)
    })

    file.data.words = words
    file.data.readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  }
}
