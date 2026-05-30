import { siteConfig } from "@/config";
import {
	BANNER_HEIGHT,
	BANNER_HEIGHT_EXTEND,
	BANNER_HEIGHT_HOME,
} from "@/constants/constants";

const stickyNavbar = siteConfig.navbar.stickyNavbar ?? false;

const sidebarStickyState: Record<
	"left" | "right",
	{ topClass: "top-0" | "top-4"; hasVisibleTop: boolean }
> = {
	left: { topClass: "top-0", hasVisibleTop: false },
	right: { topClass: "top-0", hasVisibleTop: false },
};

// 根据当前页面实际可见的顶部组件与滚动位置，动态更新侧边栏 sticky 间距
export function updateSidebarStickySpacing() {
	const scrollTop = document.documentElement.scrollTop || window.scrollY || 0;
	const isScrolled = scrollTop > 2;

	(["left", "right"] as const).forEach((side) => {
		const sticky = document.getElementById(`${side}-sidebar-sticky`);
		if (!sticky) return;

		// 结构为：sidebar -> top 容器（可选） + sticky 容器
		const topContainer = sticky.previousElementSibling as HTMLElement | null;
		const hasVisibleTop = !!topContainer && topContainer.offsetHeight > 1;

		// swup 从非文章页切换到文章页时，top 容器可能残留 mb-4，需要按可见性动态修正
		if (topContainer) {
			if (hasVisibleTop !== sidebarStickyState[side].hasVisibleTop) {
				sidebarStickyState[side].hasVisibleTop = hasVisibleTop;
			}

			if (hasVisibleTop) {
				topContainer.classList.add("mb-4");
			} else {
				topContainer.classList.remove("mb-4");
			}
		}

		// 仅切换顶部偏移；组件间距由容器常驻 gap-4 保持
		const nextTopClass: "top-0" | "top-4" =
			hasVisibleTop || isScrolled ? "top-4" : "top-0";

		if (sidebarStickyState[side].topClass !== nextTopClass) {
			sticky.classList.remove(sidebarStickyState[side].topClass);
			sticky.classList.add(nextTopClass);
			sidebarStickyState[side].topClass = nextTopClass;
		}
	});
}

// 优化的滚动处理函数
export function scrollFunction() {
	if (document.documentElement.classList.contains("is-page-transitioning")) {
		return;
	}

	const scrollTop = document.documentElement.scrollTop;
	const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);
	const bannerEnabled = !!document.getElementById("wallpaper-wrapper");
	const navbarElement = document.getElementById("navbar");
	const backToTopBtn = document.getElementById("back-to-top-btn");
	const toc = document.getElementById("toc-wrapper");
	const navbar = document.getElementById("navbar-wrapper");

	// 根据滚动位置动态更新侧边栏 sticky 间距
	updateSidebarStickySpacing();

	// 使用批量DOM操作优化性能
	const operations: (() => void)[] = [];

	if (backToTopBtn) {
		operations.push(() => {
			if (scrollTop > bannerHeight) {
				backToTopBtn.classList.remove("hide");
			} else {
				backToTopBtn.classList.add("hide");
			}
		});
	}

	if (bannerEnabled && toc) {
		operations.push(() => {
			if (scrollTop > bannerHeight) {
				toc.classList.remove("toc-hide");
			} else {
				toc.classList.add("toc-hide");
			}
		});
	}

	if (stickyNavbar && navbar) {
		operations.push(() => {
			navbar.classList.remove("navbar-hidden");
		});
	} else if (bannerEnabled && navbar) {
		operations.push(() => {
			const threshold = window.innerHeight * (BANNER_HEIGHT_HOME / 100) - 88;

			if (scrollTop >= threshold) {
				navbar.classList.add("navbar-hidden");
			} else {
				navbar.classList.remove("navbar-hidden");
			}
		});
	}

	if (navbarElement) {
		operations.push(() => {
			if (scrollTop > 8) {
				navbarElement.classList.add("navbar-sticky-shadow");
			} else {
				navbarElement.classList.remove("navbar-sticky-shadow");
			}
		});
	}

	// 批量执行DOM操作
	if (operations.length > 0) {
		requestAnimationFrame(() => {
			operations.forEach((op) => {
				op();
			});
		});
	}
}

let scrollTimeout: number;

export function initScroll() {
	window.addEventListener(
		"scroll",
		() => {
			if (scrollTimeout) {
				cancelAnimationFrame(scrollTimeout);
			}
			scrollTimeout = requestAnimationFrame(scrollFunction);
		},
		{ passive: true },
	);

	// 初始化滚动状态（例如从历史位置恢复时）
	scrollFunction();
}

export function initResizeHandler() {
	window.onresize = () => {
		// calculate the --banner-height-extend, which needs to be a multiple of 4 to avoid blurry text
		let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
		offset = offset - (offset % 4);
		document.documentElement.style.setProperty(
			"--banner-height-extend",
			`${offset}px`,
		);
	};
}
