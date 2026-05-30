/**
 * Content overflow enhancements: Katex scrollbar + table horizontal scroll
 */
export function initCustomScrollbar() {
	// 只处理katex元素的滚动条，使用浏览器原生滚动条
	const katexElements = document.querySelectorAll(
		".katex-display:not([data-scrollbar-initialized])",
	) as NodeListOf<HTMLElement>;
	katexElements.forEach((element) => {
		if (!element.parentNode) return;

		const container = document.createElement("div");
		container.className = "katex-display-container";
		element.parentNode.insertBefore(container, element);
		container.appendChild(element);

		// 使用浏览器原生滚动条，无自定义样式
		container.style.cssText = `
      overflow-x: auto;
    `;

		element.setAttribute("data-scrollbar-initialized", "true");
	});
}

export function initHorizontalOverflowContainers() {
	const markdownTables = document.querySelectorAll(
		".custom-md table:not([data-horizontal-scroll-ready])",
	) as NodeListOf<HTMLElement>;

	markdownTables.forEach((table) => {
		if (
			table.parentElement?.classList.contains("horizontal-scroll-container")
		) {
			table.dataset.horizontalScrollReady = "true";
			return;
		}

		const container = document.createElement("div");
		container.className = "horizontal-scroll-container";
		table.parentNode?.insertBefore(container, table);
		container.appendChild(table);
		table.dataset.horizontalScrollReady = "true";
	});
}

export function initContentOverflowEnhancements() {
	initCustomScrollbar();
	initHorizontalOverflowContainers();
}

export function scheduleContentOverflowEnhancements() {
	initContentOverflowEnhancements();
	requestAnimationFrame(() => {
		initContentOverflowEnhancements();
	});
	setTimeout(() => {
		initContentOverflowEnhancements();
	}, 100);
}
