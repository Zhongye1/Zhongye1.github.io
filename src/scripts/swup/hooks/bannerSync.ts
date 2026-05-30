import { backgroundWallpaper } from "@/config";
import { pathsEqual, url } from "@/utils/url-utils";

/**
 * Banner/Wallpaper 可见性同步
 * 覆盖 visit:start / content:replace / page:view 三个事件
 */

function setIsHomePageOnBody(isHome: boolean) {
	const bodyElement = document.querySelector("body");
	if (!bodyElement) return;

	if (isHome) {
		bodyElement.classList.add("lg:is-home");
		bodyElement.classList.add("is-home");
	} else {
		bodyElement.classList.remove("lg:is-home");
		bodyElement.classList.remove("is-home");
	}
}

function syncWallpaperBodyClasses() {
	const bodyElement = document.querySelector("body");
	if (!bodyElement) return;

	const currentWallpaperMode = document.documentElement.getAttribute(
		"data-wallpaper-mode",
	);
	if (currentWallpaperMode !== "banner") {
		bodyElement.classList.remove("enable-banner");
		bodyElement.classList.add("no-banner-layout");
		if (currentWallpaperMode === "overlay") {
			bodyElement.classList.add("wallpaper-transparent");
		} else {
			bodyElement.classList.remove("wallpaper-transparent");
		}
	}
}

function handleNavbarTransparency(isHomePage: boolean) {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	navbar.setAttribute("data-is-home", isHomePage.toString());

	// 重新初始化semifull模式的滚动检测
	const transparentMode = navbar.getAttribute("data-transparent-mode");
	if (transparentMode === "semifull") {
		// 重新调用初始化函数来重新绑定滚动事件
		if (typeof (window as any).initSemifullScrollDetection === "function") {
			(window as any).initSemifullScrollDetection();
		}
	}
}

function reinitSemifullScroll() {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	const transparentMode = navbar.getAttribute("data-transparent-mode");
	if (transparentMode === "semifull") {
		if (typeof (window as any).initSemifullScrollDetection === "function") {
			(window as any).initSemifullScrollDetection();
		}
	}
}

/**
 * 移动端首页特殊处理：恢复壁纸显示，动画过渡
 */
function restoreMobileHomeBanner() {
	const isMobile = window.innerWidth < 1024;
	if (!isMobile) return;

	const isHome = pathsEqual(window.location.pathname, url("/"));
	if (!isHome) return;

	const wrapper = document.getElementById("wallpaper-wrapper");
	const mainEl = document.querySelector(
		".w-full.z-30.pointer-events-none",
	) as HTMLElement | null;

	if (wrapper && mainEl) {
		// 首页：禁用主内容区域的过渡动画，防止文章列表下移
		mainEl.style.setProperty("transition", "none", "important");

		// 移除隐藏类让壁纸出现
		wrapper.classList.remove("mobile-hide-banner");
		wrapper.style.display = "";
		setTimeout(() => {
			mainEl.classList.remove("mobile-main-no-banner");
			const visitCurrentMode = document.documentElement.getAttribute(
				"data-wallpaper-mode",
			);
			if (visitCurrentMode === "fullscreen") {
				mainEl.style.position = "relative";
				mainEl.style.zIndex = "30";
				mainEl.style.setProperty("top", "0", "important");
				mainEl.style.setProperty("margin-top", "1rem", "important");
			} else if (
				visitCurrentMode === "overlay" ||
				visitCurrentMode === "none"
			) {
				mainEl.style.setProperty("top", "5.5rem", "important");
				mainEl.style.position = "";
				mainEl.style.zIndex = "";
				mainEl.style.setProperty("margin-top", "0", "important");
			} else if (isMobile) {
				// 移动端横幅模式首页：清除 inline top，让 CSS 响应式规则生效
				mainEl.style.removeProperty("top");
				mainEl.style.position = "";
				mainEl.style.zIndex = "";
				mainEl.style.setProperty("margin-top", "0", "important");
			} else {
				mainEl.style.setProperty(
					"top",
					"calc(var(--banner-height) - 3.5rem)",
					"important",
				);
				mainEl.style.position = "";
				mainEl.style.zIndex = "";
				mainEl.style.setProperty("margin-top", "0", "important");
			}
			// 不在此处恢复过渡动画，由 page:view 统一管理
		}, 150);
	}
}

export function registerBannerSync() {
	// ── visit:start ──────────────────────────────────────────
	window.swup.hooks.on("visit:start", (visit: { to: { url: string } }) => {
		const isHomePage = pathsEqual(visit.to.url, url("/"));
		const isMobile = window.innerWidth < 1024;

		// change banner height immediately when a link is clicked
		setIsHomePageOnBody(isHomePage);

		// 禁用 #main-grid 的过渡动画，防止 lg:is-home 切换时 transform 产生 700ms 动画
		const mainGrid = document.getElementById("main-grid");
		if (mainGrid) {
			mainGrid.style.setProperty("transition", "none", "important");
		}

		// 强制回流，确保 transform 立即生效，然后恢复过渡动画
		if (mainGrid) {
			void mainGrid.offsetWidth;
			mainGrid.style.removeProperty("transition");
		}

		// 同步壁纸模式的 body 类
		syncWallpaperBodyClasses();

		// Control navbar transparency based on page
		handleNavbarTransparency(isHomePage);

		// Control mobile banner visibility
		const wrapper = document.getElementById("wallpaper-wrapper");
		const mainContentWrapper = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		// 在移动端禁用文章列表容器的过渡动画
		if (isMobile) {
			const postListContainer = document.getElementById("post-list-container");
			if (postListContainer) {
				postListContainer.style.transition = "none";
			}
		}

		if (isMobile && wrapper && mainContentWrapper) {
			if (isHomePage) {
				restoreMobileHomeBanner();
			} else {
				// 非首页：隐藏壁纸并移动内容
				wrapper.classList.add("mobile-hide-banner");
				mainContentWrapper.classList.add("mobile-main-no-banner");
				mainContentWrapper.style.setProperty("top", "5.5rem", "important");
				mainContentWrapper.style.position = "";
				mainContentWrapper.style.zIndex = "";
				mainContentWrapper.style.setProperty("margin-top", "0", "important");
			}
		} else if (!isMobile && wrapper) {
			// 桌面端：确保banner正常显示
			wrapper.style.display = "";
			wrapper.classList.remove("mobile-hide-banner");
			if (mainContentWrapper) {
				mainContentWrapper.classList.remove("mobile-main-no-banner");
				const visitDesktopMode = document.documentElement.getAttribute(
					"data-wallpaper-mode",
				);
				if (visitDesktopMode === "fullscreen") {
					mainContentWrapper.style.position = "relative";
					mainContentWrapper.style.zIndex = "30";
					mainContentWrapper.style.setProperty("top", "0", "important");
					mainContentWrapper.style.setProperty(
						"margin-top",
						"1rem",
						"important",
					);
				}
				if (visitDesktopMode === "banner") {
					mainContentWrapper.style.setProperty(
						"top",
						"calc(var(--banner-height) - 3rem)",
						"important",
					);
					mainContentWrapper.style.position = "";
					mainContentWrapper.style.zIndex = "";
					mainContentWrapper.style.setProperty("margin-top", "0", "important");
				}
			}
		}

		// increase the page height during page transition
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}

		// Hide the TOC while scrolling back to top
		const toc = document.getElementById("toc-wrapper");
		if (toc) {
			toc.classList.add("toc-not-ready");
		}

		// 确保页面滚动到顶部
		const shouldUseSmoothScroll = window.innerWidth >= 768;
		const isFullscreenNonHome =
			document.documentElement.getAttribute("data-wallpaper-mode") ===
				"fullscreen" && !isHomePage;
		if (shouldUseSmoothScroll && !isFullscreenNonHome) {
			window.scrollTo({
				top: 0,
				behavior: "auto",
			});
		}
	});

	// ── content:replace ──────────────────────────────────────
	window.swup.hooks.on("content:replace", () => {
		const isHome = pathsEqual(window.location.pathname, url("/"));
		const currentMode = document.documentElement.getAttribute(
			"data-wallpaper-mode",
		);
		const isMobileForBanner = window.innerWidth < 1024;
		const mainEl = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		// 移动端 banner/全屏模式非首页：隐藏壁纸并调整内容位置
		if (
			isMobileForBanner &&
			(currentMode === "banner" || currentMode === "fullscreen") &&
			!isHome
		) {
			const wrapper = document.getElementById("wallpaper-wrapper");
			if (wrapper) {
				wrapper.style.display = "none";
				wrapper.classList.add("mobile-hide-banner");
			}
			if (mainEl) {
				mainEl.classList.add("mobile-main-no-banner");
				mainEl.style.setProperty("top", "5.5rem", "important");
				mainEl.style.position = "";
				mainEl.style.zIndex = "";
				mainEl.style.setProperty("margin-top", "0", "important");
			}
		}

		// 桌面端全屏壁纸模式
		if (!isMobileForBanner && currentMode === "fullscreen" && mainEl) {
			mainEl.style.position = "relative";
			mainEl.style.zIndex = "30";
			mainEl.style.setProperty("top", "0", "important");
			mainEl.style.setProperty("margin-top", "1rem", "important");
		}

		// 桌面端横幅模式
		if (!isMobileForBanner && currentMode === "banner" && mainEl) {
			mainEl.style.setProperty(
				"top",
				"calc(var(--banner-height) - 3rem)",
				"important",
			);
			mainEl.style.position = "";
			mainEl.style.zIndex = "";
			mainEl.style.setProperty("margin-top", "0", "important");
		}

		// 重新初始化semifull模式的滚动检测
		reinitSemifullScroll();
	});

	// ── page:view ────────────────────────────────────────────
	window.swup.hooks.on("page:view", () => {
		const isHome = pathsEqual(window.location.pathname, url("/"));
		const currentMode = document.documentElement.getAttribute(
			"data-wallpaper-mode",
		);
		const isMobileForBanner = window.innerWidth < 1024;
		const wrapper = document.getElementById(
			"wallpaper-wrapper",
		) as HTMLElement | null;
		const mainEl = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		// hide the temp high element when the transition is done
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}

		// 移动端 banner/全屏模式：非首页隐藏壁纸，首页恢复
		if (
			isMobileForBanner &&
			(currentMode === "banner" || currentMode === "fullscreen")
		) {
			if (!isHome) {
				if (wrapper) {
					wrapper.style.display = "none";
					wrapper.classList.add("mobile-hide-banner");
				}
				if (mainEl) {
					mainEl.classList.add("mobile-main-no-banner");
					mainEl.style.setProperty("top", "5.5rem", "important");
					mainEl.style.position = "";
					mainEl.style.zIndex = "";
					mainEl.style.setProperty("margin-top", "0", "important");
				}
			} else {
				if (wrapper) {
					wrapper.style.display = "block";
					wrapper.classList.remove("mobile-hide-banner");
				}
				if (mainEl) {
					// visit:start 已禁用过渡并移除了类，此处确认最终状态
					setTimeout(() => {
						mainEl.style.removeProperty("transition");
					}, 50);
				}
			}
		}

		// 桌面端全屏壁纸模式
		if (!isMobileForBanner && currentMode === "fullscreen" && mainEl) {
			mainEl.style.position = "relative";
			mainEl.style.zIndex = "30";
			mainEl.style.setProperty("top", "0", "important");
			mainEl.style.setProperty("margin-top", "1rem", "important");
		}

		// 桌面端横幅模式
		if (!isMobileForBanner && currentMode === "banner" && mainEl) {
			mainEl.style.setProperty(
				"top",
				"calc(var(--banner-height) - 3rem)",
				"important",
			);
			mainEl.style.position = "";
			mainEl.style.zIndex = "";
			mainEl.style.setProperty("margin-top", "0", "important");
		}

		// 在移动端恢复文章列表容器的过渡动画
		const isMobile = window.innerWidth < 1024;
		if (isMobile) {
			setTimeout(() => {
				const postListContainer = document.getElementById(
					"post-list-container",
				);
				if (postListContainer) {
					postListContainer.style.transition = "";
				}
			}, 600); // 等待主内容区动画完成
		}
	});
}

/**
 * 初始页面加载时的 banner 显示动画
 * 非 swup 事件，在 DOMContentLoaded 时调用
 */
export function showBanner() {
	const isBannerMode = backgroundWallpaper.mode === "banner";
	if (!isBannerMode) return;

	// 使用requestAnimationFrame优化DOM操作
	requestAnimationFrame(() => {
		// Handle single image banner (desktop)
		const banner = document.getElementById("banner");
		if (banner) {
			banner.classList.remove("opacity-0", "scale-105");
		}

		// Handle mobile single image banner
		const mobileBanner = document.querySelector(
			'.block.lg\\:hidden[alt="Mobile banner image of the blog"]',
		);
		if (mobileBanner) {
			mobileBanner.classList.remove("opacity-0", "scale-105");
			mobileBanner.classList.add("opacity-100");
		}
	});
}
