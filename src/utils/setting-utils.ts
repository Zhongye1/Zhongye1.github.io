import {
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
	SYSTEM_MODE,
	WALLPAPER_OVERLAY,
} from "@constants/constants";
import type { LIGHT_DARK_MODE, WALLPAPER_MODE } from "@/types/config";
import {
	backgroundWallpaper,
	expressiveCodeConfig,
	sakuraConfig,
	siteConfig,
} from "../config";

export function getDefaultHue(): number {
	const fallback = "250";
	if (typeof document === "undefined") {
		return Number.parseInt(fallback, 10);
	}
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getDefaultTheme(): LIGHT_DARK_MODE {
	return siteConfig.themeColor.defaultMode ?? DEFAULT_THEME;
}

export function getSystemTheme(): LIGHT_DARK_MODE {
	if (typeof window === "undefined") {
		return LIGHT_MODE;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? DARK_MODE
		: LIGHT_MODE;
}

export function resolveTheme(theme: LIGHT_DARK_MODE): LIGHT_DARK_MODE {
	if (theme === SYSTEM_MODE) {
		return getSystemTheme();
	}
	return theme;
}

export function getHue(): number {
	if (typeof window === "undefined" || !window.localStorage) {
		return getDefaultHue();
	}
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	if (
		typeof window === "undefined" ||
		!window.localStorage ||
		typeof document === "undefined"
	) {
		return;
	}
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	if (typeof document === "undefined") {
		return;
	}

	const resolvedTheme = resolveTheme(theme);

	const currentIsDark = document.documentElement.classList.contains("dark");
	const currentTheme = document.documentElement.getAttribute("data-theme");

	let targetIsDark = false;
	switch (resolvedTheme) {
		case LIGHT_MODE:
			targetIsDark = false;
			break;
		case DARK_MODE:
			targetIsDark = true;
			break;
		default:
			targetIsDark = currentIsDark;
			break;
	}

	const needsThemeChange = currentIsDark !== targetIsDark;
	const expectedTheme = targetIsDark
		? expressiveCodeConfig.darkTheme
		: expressiveCodeConfig.lightTheme;
	const needsCodeThemeUpdate = currentTheme !== expectedTheme;

	if (!needsThemeChange && !needsCodeThemeUpdate) {
		return;
	}

	if (needsThemeChange) {
		if (targetIsDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}

	if (needsCodeThemeUpdate) {
		document.documentElement.setAttribute("data-theme", expectedTheme);
	}
}

let systemThemeListener:
	| ((e: MediaQueryListEvent | MediaQueryList) => void)
	| null = null;

export function setTheme(theme: LIGHT_DARK_MODE): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}

	applyThemeToDocument(theme);
	localStorage.setItem("theme", theme);

	if (theme === SYSTEM_MODE) {
		setupSystemThemeListener();
	} else {
		cleanupSystemThemeListener();
	}
}

export function setupSystemThemeListener() {
	cleanupSystemThemeListener();

	if (typeof window === "undefined") {
		return;
	}

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
		const isDark = e.matches;
		const currentIsDark = document.documentElement.classList.contains("dark");

		if (currentIsDark === isDark) {
			return;
		}

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		const expressiveTheme = isDark
			? expressiveCodeConfig.darkTheme
			: expressiveCodeConfig.lightTheme;
		document.documentElement.setAttribute("data-theme", expressiveTheme);

		window.dispatchEvent(new CustomEvent("theme-change"));
	};

	handleSystemThemeChange(mediaQuery);

	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener("change", handleSystemThemeChange);
	} else {
		mediaQuery.addListener(handleSystemThemeChange);
	}

	systemThemeListener = handleSystemThemeChange;
}

function cleanupSystemThemeListener() {
	if (typeof window === "undefined" || !systemThemeListener) {
		return;
	}

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	if (mediaQuery.removeEventListener) {
		mediaQuery.removeEventListener("change", systemThemeListener);
	} else {
		mediaQuery.removeListener(systemThemeListener);
	}

	systemThemeListener = null;
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultTheme();
	}
	return (
		(localStorage.getItem("theme") as LIGHT_DARK_MODE) || getDefaultTheme()
	);
}

export function initThemeListener() {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return;
	}

	const theme = getStoredTheme();

	if (theme === SYSTEM_MODE) {
		setupSystemThemeListener();
	}
}

// Wallpaper mode functions
export function applyWallpaperModeToDocument(
	mode: WALLPAPER_MODE,
	_animate = true,
) {
	const currentMode =
		(document.documentElement.getAttribute(
			"data-wallpaper-mode",
		) as WALLPAPER_MODE) || backgroundWallpaper.mode;

	if (currentMode === mode) {
		ensureWallpaperState(mode);
		return;
	}

	document.documentElement.classList.add("is-wallpaper-transitioning");
	document.documentElement.setAttribute("data-wallpaper-mode", mode);

	requestAnimationFrame(() => {
		const body = document.body;

		body.classList.remove("enable-banner", "wallpaper-transparent", "no-banner-layout");

		body.classList.add("wallpaper-transparent");
		body.classList.add("no-banner-layout");
		showOverlayMode();

		updateNavbarTransparency(mode);

		requestAnimationFrame(() => {
			document.documentElement.classList.remove("is-wallpaper-transitioning");
		});
	});
}

function ensureWallpaperState(mode: WALLPAPER_MODE) {
	const body = document.body;

	body.classList.remove("enable-banner", "wallpaper-transparent", "no-banner-layout");

	body.classList.add("wallpaper-transparent");
	body.classList.add("no-banner-layout");
	showOverlayMode();

	updateNavbarTransparency(mode);
}

function showOverlayMode() {
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		wallpaperWrapper.classList.remove("wallpaper-fullscreen");
		wallpaperWrapper.classList.add("wallpaper-overlay");
		wallpaperWrapper.style.display = "block";
		wallpaperWrapper.style.setProperty("display", "block", "important");
		wallpaperWrapper.style.top = "";
		requestAnimationFrame(() => {
			wallpaperWrapper.classList.remove("hidden");
			wallpaperWrapper.classList.remove("opacity-0");
			wallpaperWrapper.classList.add("opacity-100");
			wallpaperWrapper.classList.remove("mobile-hide-banner");
		});
	}

	const bannerTextOverlay = document.querySelector(".banner-home-text-overlay");
	if (bannerTextOverlay) {
		bannerTextOverlay.classList.add("hidden");
	}

	adjustMainContentTransparency(true);
	adjustMainContentPosition();
}

function updateNavbarTransparency(_mode: WALLPAPER_MODE) {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	navbar.setAttribute("data-transparent-mode", "none");
	navbar.setAttribute("data-enable-blur", "false");
	navbar.style.setProperty("--navbar-glass-blur", "0px");

	navbar.classList.remove(
		"navbar-transparent-semi",
		"navbar-transparent-full",
		"navbar-transparent-semifull",
	);
	navbar.classList.remove("scrolled");

	if (window.semifullScrollHandler) {
		window.removeEventListener("scroll", window.semifullScrollHandler);
		delete window.semifullScrollHandler;
	}
}

function adjustMainContentPosition() {
	const mainContent = document.querySelector(
		".w-full.z-30.pointer-events-none",
	) as HTMLElement;
	if (!mainContent) return;

	mainContent.classList.remove("mobile-main-no-banner", "no-banner-layout");

	mainContent.classList.add("no-banner-layout");
	mainContent.style.setProperty("top", "5.5rem", "important");
	mainContent.style.setProperty("margin-top", "0", "important");
	mainContent.style.position = "";
	mainContent.style.minHeight = "";
	mainContent.style.transition = "";

	mainContent.style.visibility = "visible";
	document.body.classList.add("wallpaper-initialized");
}

function adjustMainContentTransparency(enable: boolean) {
	const mainContent = document.querySelector(
		".w-full.z-30.pointer-events-none",
	);
	const body = document.body;

	if (enable) {
		if (mainContent) {
			mainContent.classList.add("wallpaper-transparent");
		}
		if (body) {
			body.classList.add("wallpaper-transparent");
		}
	} else {
		if (mainContent) {
			mainContent.classList.remove("wallpaper-transparent");
		}
		if (body) {
			body.classList.remove("wallpaper-transparent");
		}
	}
}

export function setWallpaperMode(_mode: WALLPAPER_MODE): void {
	if (typeof window === "undefined") return;
	applyWallpaperModeToDocument(WALLPAPER_OVERLAY);
	window.dispatchEvent(
		new CustomEvent("wallpaperModeChange", {
			detail: { mode: WALLPAPER_OVERLAY },
		}),
	);
}

export function initWallpaperMode(): void {
	applyStoredOverlaySettingsToDocument();
	const storedMode = getStoredWallpaperMode();
	applyWallpaperModeToDocument(storedMode, false);
}

export function getStoredWallpaperMode(): WALLPAPER_MODE {
	return WALLPAPER_OVERLAY;
}

// Overlay settings functions
function clampNumber(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function getDefaultOverlayOpacity(): number {
	return backgroundWallpaper.overlay?.opacity ?? 0.8;
}

export function getDefaultOverlayBlur(): number {
	return backgroundWallpaper.overlay?.blur ?? 0;
}

export function getDefaultOverlayCardOpacity(): number {
	return backgroundWallpaper.overlay?.cardOpacity ?? 0.6;
}

export function getStoredOverlayOpacity(): number {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayOpacity();
	}
	const stored = localStorage.getItem("overlayOpacity");
	if (stored === null) {
		return getDefaultOverlayOpacity();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayOpacity();
	}
	return clampNumber(parsed, 0, 1);
}

export function getStoredOverlayBlur(): number {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayBlur();
	}
	const stored = localStorage.getItem("overlayBlur");
	if (stored === null) {
		return getDefaultOverlayBlur();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayBlur();
	}
	return clampNumber(parsed, 0, 20);
}

export function getStoredOverlayCardOpacity(): number {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayCardOpacity();
	}
	const stored = localStorage.getItem("overlayCardOpacity");
	if (stored === null) {
		return getDefaultOverlayCardOpacity();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayCardOpacity();
	}
	return clampNumber(parsed, 0, 1);
}

export function applyOverlayOpacityToDocument(opacity: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeOpacity = clampNumber(opacity, 0, 1);
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		wallpaperWrapper.style.setProperty(
			"--overlay-opacity",
			String(safeOpacity),
		);
	}
}

export function applyOverlayBlurToDocument(blur: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeBlur = clampNumber(blur, 0, 20);
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		wallpaperWrapper.style.setProperty("--overlay-blur", `${safeBlur}px`);
	}
}

export function applyOverlayCardOpacityToDocument(cardOpacity: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeCardOpacity = clampNumber(cardOpacity, 0, 1);
	document.documentElement.style.setProperty(
		"--card-transparent-opacity",
		String(safeCardOpacity),
	);
}

export function setOverlayOpacity(opacity: number): void {
	const safeOpacity = clampNumber(opacity, 0, 1);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayOpacity", String(safeOpacity));
	}
	applyOverlayOpacityToDocument(safeOpacity);
}

export function setOverlayBlur(blur: number): void {
	const safeBlur = clampNumber(blur, 0, 20);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayBlur", String(safeBlur));
	}
	applyOverlayBlurToDocument(safeBlur);
}

export function setOverlayCardOpacity(cardOpacity: number): void {
	const safeCardOpacity = clampNumber(cardOpacity, 0, 1);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayCardOpacity", String(safeCardOpacity));
	}
	applyOverlayCardOpacityToDocument(safeCardOpacity);
}

export function applyStoredOverlaySettingsToDocument(): void {
	applyOverlayOpacityToDocument(getStoredOverlayOpacity());
	applyOverlayBlurToDocument(getStoredOverlayBlur());
	applyOverlayCardOpacityToDocument(getStoredOverlayCardOpacity());
}

// Sakura effect functions
export function getDefaultSakuraEnabled(): boolean {
	return sakuraConfig?.enable ?? false;
}

export function getStoredSakuraEnabled(): boolean {
	if (typeof localStorage === "undefined") {
		return getDefaultSakuraEnabled();
	}
	const stored = localStorage.getItem("sakuraEnabled");
	if (stored === null) {
		return getDefaultSakuraEnabled();
	}
	return stored === "true";
}

export function setSakuraEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("sakuraEnabled", String(enabled));
	document.documentElement.setAttribute("data-sakura-enabled", String(enabled));
	window.dispatchEvent(
		new CustomEvent("sakuraToggle", { detail: { enabled } }),
	);
}
