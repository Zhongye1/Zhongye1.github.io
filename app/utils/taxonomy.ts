// 分类 / 标签的站内路径。名字里有中文和空格（`Harness Engineering`），一律编码；
// 页面侧是 catch-all 路由，会把 slug 再拆回「名字 + 可选页码」。
export function categoryPath(name: string) {
  return `/category/${encodeURIComponent(name)}`
}

export function tagPath(name: string) {
  return `/tag/${encodeURIComponent(name)}`
}
