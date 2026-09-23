export default defineAppConfig({
  component: {
    codeblock: {
      /** 代码块触发折叠的行数 */
      triggerRows: 32,
      /** 代码块折叠后保留的行数 */
      collapsedRows: 16,
      /** 启用缩进导航时不再渲染空格 */
      enableIndentGuide: true,
      /** 缩进导航竖线匹配的空格数 */
      indent: 4,
      /** tab 渲染宽度 */
      tabSize: 3,
    },
  },
  pagination: {
    /** 文章列表每页条数，改它会同时改变 /blog/page/N 的页数 */
    perPage: 10,
  },
})
