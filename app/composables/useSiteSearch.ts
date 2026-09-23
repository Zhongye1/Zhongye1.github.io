/**
 * 搜索面板的开关状态，供侧栏按钮、页面里的紧凑入口与 ⌘K 快捷键共用。
 *
 * `opened` 一旦为真就不再复位：面板挂载一次就把 FTS 索引建好，之后开关只是显示/隐藏。
 * 这样既避免了"每次打开都重建索引"，也不会在用户从不搜索时白白付出建索引的开销。
 */
export function useSiteSearch() {
  const open = useState('site-search-open', () => false)
  const opened = useState('site-search-opened', () => false)

  function showSearch() {
    open.value = true
    opened.value = true
  }

  function closeSearch() {
    open.value = false
  }

  function toggleSearch() {
    if (open.value) {
      closeSearch()
    } else {
      showSearch()
    }
  }

  return { open, opened, showSearch, closeSearch, toggleSearch }
}
