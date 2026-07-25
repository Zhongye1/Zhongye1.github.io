import { siteConfig } from "@/config";
import { pathsEqual } from "@/utils/url-utils";

const stickyNavbar = siteConfig.navbar.stickyNavbar ?? false;

export function registerLinkClickGuard() {
	window.swup.hooks.on(
		"link:click",
		(_visit: any, { el }: { el: HTMLAnchorElement }) => {
			document.documentElement.style.setProperty("--content-delay", "0ms");

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
				document.documentElement.classList.add("is-page-transitioning");
			}

			const navbar = document.getElementById("navbar-wrapper");
			if (navbar && stickyNavbar) {
				navbar.classList.remove("navbar-hidden");
			}
		},
	);
}
