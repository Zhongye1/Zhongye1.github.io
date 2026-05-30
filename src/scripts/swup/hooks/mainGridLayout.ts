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

export function updateMainGridCols() {
	const mainGrid = document.getElementById("main-grid");
	if (!mainGrid) return;

	const isPostPage = isCurrentPagePost();
	const sidebarPosition =
		mainGrid.getAttribute("data-sidebar-position") || "left";
	const tabletSidebar = mainGrid.getAttribute("data-tablet-sidebar") || "left";
	const showBothSidebarsOnPostPage =
		mainGrid.getAttribute("data-show-both-sidebars-on-post") === "true";

	const shouldBothSidebars =
		isPostPage && sidebarPosition !== "both" && showBothSidebarsOnPostPage;

	let newGridClasses: string;

	if (sidebarPosition === "both" || shouldBothSidebars) {
		// 双侧栏（含文章页临时双侧栏）
		// 从right临时扩展为both时，平板端保持显示右侧栏
		const effectiveTabletSidebar =
			shouldBothSidebars && sidebarPosition === "right"
				? "right"
				: tabletSidebar;
		if (effectiveTabletSidebar === "right") {
			newGridClasses =
				"grid-cols-1 md:grid-cols-[1fr_17.5rem] xl:grid-cols-[17.5rem_1fr_17.5rem]";
		} else {
			newGridClasses =
				"grid-cols-1 md:grid-cols-[17.5rem_1fr] xl:grid-cols-[17.5rem_1fr_17.5rem]";
		}
	} else if (sidebarPosition === "right") {
		// 仅右侧栏
		newGridClasses = "grid-cols-1 md:grid-cols-[1fr_17.5rem]";
	} else {
		// 仅左侧栏
		newGridClasses = "grid-cols-1 md:grid-cols-[17.5rem_1fr]";
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

	// position为right时，swup导航不会替换静态元素(右侧栏、主内容容器、页脚)的class
	// 需要在JS中手动更新这些元素的网格定位类，以匹配2列/3列布局的切换
	if (sidebarPosition === "right") {
		const rightSidebar = document.getElementById("right-sidebar");
		const swupContainer = document.getElementById("swup-container");
		const footer = mainGrid.querySelector(".footer");

		if (shouldBothSidebars) {
			// 文章页临时双侧栏：右侧栏移到第3列，主内容移到第2列，页脚居中
			rightSidebar?.classList.add("xl:col-start-3");
			swupContainer?.classList.add("xl:col-start-2", "xl:col-end-3");
			if (footer) {
				footer.classList.remove("md:col-start-1", "xl:col-start-1");
				footer.classList.add("xl:col-start-2");
			}
		} else {
			// 非文章页：恢复2列布局定位
			rightSidebar?.classList.remove("xl:col-start-3");
			swupContainer?.classList.remove("xl:col-start-2", "xl:col-end-3");
			if (footer) {
				footer.classList.add("md:col-start-1", "xl:col-start-1");
				footer.classList.remove("xl:col-start-2");
			}
		}
	}
}

export function registerMainGridLayout() {
	window.swup.hooks.on("page:view", () => {
		updateMainGridCols();
	});
}
