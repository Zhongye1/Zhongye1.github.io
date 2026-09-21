import type { Parent, Root } from 'mdast'
import { visit } from 'unist-util-visit'

interface CodeComponentNode extends Parent {
  type: 'codeComponent'
}

declare module 'mdast' {
  interface RootContentMap {
    codeComponent: CodeComponentNode
  }
}

interface CodeComponent {
  /** 渲染该语言代码块的组件 */
  component: string
  /** 组件上接收代码内容的属性 */
  prop: string
}

/** 代码块语言到组件的映射 */
export type CodeComponents = Record<string, CodeComponent>

/**
 * 把指定语言的代码块替换为自定义组件，例如把 ```mermaid 交给 <Mermaid> 渲染。
 * 组件名与属性名都写在 `data` 上，由 @nuxtjs/mdc 生成 hast 时读取。
 */
export default function remarkCodeComponent(components: CodeComponents = {}) {
  return (tree: Root) => {
    visit(tree, 'code', (node, index, parent) => {
      const options = components[node.lang ?? '']
      if (!options || !parent || index === undefined) return

      parent.children.splice(index, 1, {
        type: 'codeComponent',
        children: [],
        data: {
          hName: options.component,
          hProperties: { [options.prop]: node.value },
        },
      })
    })
  }
}
