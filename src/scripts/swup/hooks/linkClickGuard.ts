import { siteConfig } from "@/config";
import { BANNER_HEIGHT_HOME } from "@/constants/constants";
import { pathsEqual } from "@/utils/url-utils";

const stickyNavbar = siteConfig.navbar.stickyNavbar ?? false;

/**
 * link:click 钩子：处理导航栏可见性、过渡保护、同页链接检测
 */
export function registerLinkClickGuard() {
	window.swup.hooks.on(
		"link:click",
		(_visit: any, { el }: { el: HTMLAnchorElement }) => {
			const bannerEnabled = !!document.getElementById("wallpaper-wrapper");

			// Remove the delay for the first time page load
			document.documentElement.style.setProperty("--content-delay", "0ms");

			// 同页链接点击不需要过渡保护
			const targetHref = el.getAttribute("href") || "";
			const targetPathname = (() => {
				try {
					return new URL(targetHref, window.location.href).pathname;
				} catch {
					return targetHref;
				}
			})();
			const isSamePage = pathsEqual(targetPathname, window.location.pathname);
			if (isSamePage) {
				document.documentElement.classList.remove("is-page-transitioning");
			}
			if (!isSamePage) {
				// 添加页面切换保护，防止导航栏闪烁
				document.documentElement.classList.add("is-page-transitioning");
			}

			const navbar = document.getElementById("navbar-wrapper");
			if (navbar && stickyNavbar) {
				navbar.classList.remove("navbar-hidden");
			} else if (bannerEnabled && navbar) {
				const threshold = window.innerHeight * (BANNER_HEIGHT_HOME / 100) - 88;
				if (document.documentElement.scrollTop >= threshold) {
					navbar.classList.add("navbar-hidden");
				}
			}
		},
	);
}
