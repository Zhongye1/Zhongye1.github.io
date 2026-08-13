/**
 * 更新主网格列数和侧边栏列定位
 * 在 page:view 时调用
 */

// 检查当前页面是否为文章详情页
function isCurrentPagePost(): boolean {
	return (
		window.location.pathname.includes("/posts/") ||
		window.location.pathname.includes("/post/")
	);
}

type SidebarLayout = "both" | "left" | "right" | "none";

/**
 * 计算当前页面等效的侧边栏布局
 * 文章页启用 hideLeftSidebarOnPostPage 时，左侧栏整体隐藏，等效为仅右侧栏（或单列）
 */
function getEffectiveLayout(
	sidebarPosition: string,
	showBothSidebarsOnPostPage: boolean,
	hideLeftSidebarOnPostPage: boolean,
	isPostPage: boolean,
): SidebarLayout {
	if (isPostPage && hideLeftSidebarOnPostPage) {
		if (sidebarPosition === "both") return "right";
		if (sidebarPosition === "left") {
			return showBothSidebarsOnPostPage ? "right" : "none";
		}
		return "right";
	}
	if (sidebarPosition === "both") return "both";
	if (isPostPage && showBothSidebarsOnPostPage) return "both";
	return sidebarPosition === "left" ? "left" : "right";
}

/** 主内容容器（静态元素）的网格定位类 */
function getMainContentClasses(
	layout: SidebarLayout,
	tabletSidebar: string,
): string[] {
	switch (layout) {
		case "both":
			return tabletSidebar === "right"
				? [
						"md:col-span-1",
						"md:col-start-1",
						"lg:col-span-1",
						"lg:col-start-2",
						"lg:col-end-3",
					]
				: [
						"md:col-span-1",
						"md:col-start-2",
						"lg:col-span-1",
						"lg:col-start-2",
						"lg:col-end-3",
					];
		case "left":
			return ["md:col-span-1", "md:col-start-2"];
		case "right":
			return ["md:col-span-1", "md:col-start-1"];
		default:
			return [];
	}
}

/** 页脚（静态元素）的网格定位类 */
function getFooterClasses(
	layout: SidebarLayout,
	tabletSidebar: string,
): string[] {
	switch (layout) {
		case "both":
			return tabletSidebar === "right"
				? ["md:col-span-1", "md:col-start-1", "xl:col-span-1", "xl:col-start-2"]
				: [
						"md:col-span-1",
						"md:col-start-2",
						"xl:col-span-1",
						"xl:col-start-2",
					];
		case "left":
			return [
				"md:col-span-1",
				"md:col-start-2",
				"xl:col-span-1",
				"xl:col-start-2",
			];
		default:
			return [
				"md:col-span-1",
				"md:col-start-1",
				"xl:col-span-1",
				"xl:col-start-1",
			];
	}
}

/** 静态渲染的右侧栏的定位类 */
function getRightSidebarClasses(
	layout: SidebarLayout,
	tabletSidebar: string,
): string[] {
	const base = ["mb-4", "hidden", "onload-animation"];
	switch (layout) {
		case "both":
			return tabletSidebar === "right"
				? [
						...base,
						"md:block",
						"md:row-start-1",
						"md:row-end-3",
						"md:col-span-1",
						"md:max-w-70",
						"md:col-start-2",
						"lg:col-start-3",
					]
				: [
						...base,
						"lg:block",
						"lg:row-start-1",
						"lg:row-end-3",
						"lg:col-span-1",
						"lg:max-w-70",
						"lg:col-start-3",
					];
		case "right":
			return [
				...base,
				"md:block",
				"md:row-start-1",
				"md:row-end-3",
				"md:col-span-1",
				"md:max-w-70",
				"md:col-start-2",
			];
		default:
			return base;
	}
}

const MAIN_CONTENT_TOKENS = [
	"md:col-span-1",
	"md:col-start-1",
	"md:col-start-2",
	"lg:col-span-1",
	"lg:col-start-2",
	"lg:col-end-3",
];

const FOOTER_TOKENS = [
	"md:col-span-1",
	"md:col-start-1",
	"md:col-start-2",
	"xl:col-span-1",
	"xl:col-start-1",
	"xl:col-start-2",
];

const RIGHT_SIDEBAR_TOKENS = [
	"md:block",
	"md:row-start-1",
	"md:row-end-3",
	"md:col-span-1",
	"md:max-w-70",
	"md:col-start-2",
	"lg:block",
	"lg:row-start-1",
	"lg:row-end-3",
	"lg:col-span-1",
	"lg:max-w-70",
	"lg:col-start-3",
];

/** 将元素的布局 token 替换为目标集合（移除旧 token，添加新 token） */
function setTokens(
	element: HTMLElement | null,
	tokens: string[],
	target: string[],
) {
	if (!element) return;
	tokens.forEach((token) => {
		element.classList.remove(token);
	});
	target.forEach((token) => {
		element.classList.add(token);
	});
}

export function updateMainGridCols() {
	const mainGrid = document.getElementById("main-grid");
	if (!mainGrid) return;

	const isPostPage = isCurrentPagePost();
	const sidebarPosition =
		mainGrid.getAttribute("data-sidebar-position") || "left";
	const tabletSidebar = mainGrid.getAttribute("data-tablet-sidebar") || "left";
	const showBothSidebarsOnPostPage =
		mainGrid.getAttribute("data-show-both-sidebars-on-post") === "true";
	const hideLeftSidebarOnPostPage =
		mainGrid.getAttribute("data-hide-left-sidebar-on-post") === "true";

	// 页面类型标记：用于 CSS 在文章页隐藏左侧栏容器
	mainGrid.setAttribute("data-is-post", isPostPage ? "true" : "false");

	const effectiveLayout = getEffectiveLayout(
		sidebarPosition,
		showBothSidebarsOnPostPage,
		hideLeftSidebarOnPostPage,
		isPostPage,
	);

	// position 为 right 且文章页临时扩展为双侧栏时，平板端仍显示右侧栏
	const effectiveTabletSidebar =
		sidebarPosition === "right" && effectiveLayout === "both"
			? "right"
			: tabletSidebar;

	let newGridClasses: string;
	if (effectiveLayout === "both") {
		// 双侧栏（含文章页临时双侧栏）
		newGridClasses =
			effectiveTabletSidebar === "right"
				? "grid-cols-1 md:grid-cols-[1fr_17.5rem] lg:grid-cols-[17.5rem_1fr_17.5rem]"
				: "grid-cols-1 md:grid-cols-[17.5rem_1fr] lg:grid-cols-[17.5rem_1fr_17.5rem]";
	} else if (effectiveLayout === "left") {
		// 仅左侧栏
		newGridClasses = "grid-cols-1 md:grid-cols-[17.5rem_1fr]";
	} else if (effectiveLayout === "right") {
		// 仅右侧栏
		newGridClasses = "grid-cols-1 md:grid-cols-[1fr_17.5rem]";
	} else {
		// 无侧边栏
		newGridClasses = "grid-cols-1";
	}

	// 移除旧类并添加新类
	[
		"grid-cols-1",
		"md:grid-cols-[17.5rem_1fr]",
		"md:grid-cols-[1fr_17.5rem]",
		"xl:grid-cols-[17.5rem_1fr_17.5rem]",
	].forEach((cls) => {
		mainGrid.classList.remove(cls);
	});

	newGridClasses.split(" ").forEach((cls) => {
		if (cls) {
			mainGrid.classList.add(cls);
		}
	});

	// swup 导航不会替换静态元素（主内容容器、页脚、静态渲染的右侧栏），
	// 需要在 JS 中同步这些元素的网格定位类；布局未变化时为 no-op
	const mainContentWrapper = document.getElementById("main-content-wrapper");
	const footer = mainGrid.querySelector(".footer") as HTMLElement | null;
	const rightSidebarStatic = document.getElementById("right-sidebar-static");
	const rightSidebar =
		rightSidebarStatic?.querySelector<HTMLElement>("#right-sidebar") ?? null;

	setTokens(
		mainContentWrapper,
		MAIN_CONTENT_TOKENS,
		getMainContentClasses(effectiveLayout, effectiveTabletSidebar),
	);
	setTokens(
		footer,
		FOOTER_TOKENS,
		getFooterClasses(effectiveLayout, effectiveTabletSidebar),
	);
	if (rightSidebarStatic && rightSidebar) {
		setTokens(
			rightSidebar,
			RIGHT_SIDEBAR_TOKENS,
			getRightSidebarClasses(effectiveLayout, effectiveTabletSidebar),
		);
	}
}

export function registerMainGridLayout() {
	window.swup.hooks.on("page:view", () => {
		updateMainGridCols();
	});
}
