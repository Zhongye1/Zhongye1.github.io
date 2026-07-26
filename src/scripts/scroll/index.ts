import { siteConfig } from "@/config";

const stickyNavbar = siteConfig.navbar.stickyNavbar ?? false;

const sidebarStickyState: Record<
	"left" | "right",
	{ topClass: "top-0" | "top-4"; hasVisibleTop: boolean }
> = {
	left: { topClass: "top-0", hasVisibleTop: false },
	right: { topClass: "top-0", hasVisibleTop: false },
};

export function updateSidebarStickySpacing() {
	const scrollTop = document.documentElement.scrollTop || window.scrollY || 0;
	const isScrolled = scrollTop > 2;

	(["left", "right"] as const).forEach((side) => {
		const sticky = document.getElementById(`${side}-sidebar-sticky`);
		if (!sticky) return;

		const topContainer = sticky.previousElementSibling as HTMLElement | null;
		const hasVisibleTop = !!topContainer && topContainer.offsetHeight > 1;

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

		const nextTopClass: "top-0" | "top-4" =
			hasVisibleTop || isScrolled ? "top-4" : "top-0";

		if (sidebarStickyState[side].topClass !== nextTopClass) {
			sticky.classList.remove(sidebarStickyState[side].topClass);
			sticky.classList.add(nextTopClass);
			sidebarStickyState[side].topClass = nextTopClass;
		}
	});
}

export function scrollFunction() {
	if (document.documentElement.classList.contains("is-page-transitioning")) {
		return;
	}

	const scrollTop = document.documentElement.scrollTop;
	const threshold = 200;
	const navbarElement = document.getElementById("navbar");
	const backToTopBtn = document.getElementById("back-to-top-btn");
	const toc = document.getElementById("toc-wrapper");
	const navbar = document.getElementById("navbar-wrapper");

	updateSidebarStickySpacing();

	const operations: (() => void)[] = [];

	if (backToTopBtn) {
		operations.push(() => {
			if (scrollTop > threshold) {
				backToTopBtn.classList.remove("hide");
			} else {
				backToTopBtn.classList.add("hide");
			}
		});
	}

	if (toc) {
		operations.push(() => {
			if (scrollTop > threshold) {
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

	scrollFunction();
}

export function initResizeHandler() {}
