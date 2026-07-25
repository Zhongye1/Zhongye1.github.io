import { pathsEqual, url } from "@/utils/url-utils";

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

function handleNavbarTransparency(isHomePage: boolean) {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	navbar.setAttribute("data-is-home", isHomePage.toString());
}

export function registerBannerSync() {
	window.swup.hooks.on("visit:start", (visit: { to: { url: string } }) => {
		const isHomePage = pathsEqual(visit.to.url, url("/"));
		const isMobile = window.innerWidth < 1024;

		setIsHomePageOnBody(isHomePage);

		const mainGrid = document.getElementById("main-grid");
		if (mainGrid) {
			mainGrid.style.setProperty("transition", "none", "important");
		}

		if (mainGrid) {
			void mainGrid.offsetWidth;
			mainGrid.style.removeProperty("transition");
		}

		handleNavbarTransparency(isHomePage);

		const wrapper = document.getElementById("wallpaper-wrapper");
		const mainContentWrapper = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		if (isMobile) {
			const postListContainer = document.getElementById("post-list-container");
			if (postListContainer) {
				postListContainer.style.transition = "none";
			}
		}

		if (isMobile && wrapper && mainContentWrapper) {
			if (isHomePage) {
				wrapper.classList.remove("mobile-hide-banner");
				wrapper.style.display = "";
				mainContentWrapper.classList.remove("mobile-main-no-banner");
				mainContentWrapper.style.setProperty("top", "5.5rem", "important");
				mainContentWrapper.style.position = "";
				mainContentWrapper.style.zIndex = "";
				mainContentWrapper.style.setProperty("margin-top", "0", "important");
			} else {
				wrapper.classList.add("mobile-hide-banner");
				mainContentWrapper.classList.add("mobile-main-no-banner");
				mainContentWrapper.style.setProperty("top", "5.5rem", "important");
				mainContentWrapper.style.position = "";
				mainContentWrapper.style.zIndex = "";
				mainContentWrapper.style.setProperty("margin-top", "0", "important");
			}
		} else if (!isMobile && wrapper) {
			wrapper.style.display = "";
			wrapper.classList.remove("mobile-hide-banner");
			if (mainContentWrapper) {
				mainContentWrapper.classList.remove("mobile-main-no-banner");
				mainContentWrapper.style.setProperty("top", "5.5rem", "important");
				mainContentWrapper.style.position = "";
				mainContentWrapper.style.zIndex = "";
				mainContentWrapper.style.setProperty("margin-top", "0", "important");
			}
		}

		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}

		const toc = document.getElementById("toc-wrapper");
		if (toc) {
			toc.classList.add("toc-not-ready");
		}

		window.scrollTo({
			top: 0,
			behavior: "auto",
		});
	});

	window.swup.hooks.on("content:replace", () => {
		const isHome = pathsEqual(window.location.pathname, url("/"));
		const isMobileForBanner = window.innerWidth < 1024;
		const mainEl = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		if (isMobileForBanner && !isHome) {
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

		if (!isMobileForBanner && mainEl) {
			mainEl.style.setProperty("top", "5.5rem", "important");
			mainEl.style.position = "";
			mainEl.style.zIndex = "";
			mainEl.style.setProperty("margin-top", "0", "important");
		}
	});

	window.swup.hooks.on("page:view", () => {
		const isHome = pathsEqual(window.location.pathname, url("/"));
		const isMobileForBanner = window.innerWidth < 1024;
		const wrapper = document.getElementById(
			"wallpaper-wrapper",
		) as HTMLElement | null;
		const mainEl = document.querySelector(
			".w-full.z-30.pointer-events-none",
		) as HTMLElement | null;

		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}

		if (isMobileForBanner) {
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
					setTimeout(() => {
						mainEl.style.removeProperty("transition");
					}, 50);
				}
			}
		}

		if (!isMobileForBanner && mainEl) {
			mainEl.style.setProperty("top", "5.5rem", "important");
			mainEl.style.position = "";
			mainEl.style.zIndex = "";
			mainEl.style.setProperty("margin-top", "0", "important");
		}

		const isMobile = window.innerWidth < 1024;
		if (isMobile) {
			setTimeout(() => {
				const postListContainer = document.getElementById(
					"post-list-container",
				);
				if (postListContainer) {
					postListContainer.style.transition = "";
				}
			}, 600);
		}
	});
}
