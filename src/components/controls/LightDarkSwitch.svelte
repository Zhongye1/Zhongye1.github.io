<script lang="ts">
	import { onMount } from "svelte";
	import Icon from "@/components/common/Icon.svelte";
	import { DARK_MODE, LIGHT_MODE, SYSTEM_MODE } from "@/constants/constants";
	import type { LIGHT_DARK_MODE } from "@/types/config.ts";
	import {
		applyThemeToDocument,
		getStoredTheme,
		setTheme,
	} from "@/utils/setting-utils";

	// Define Swup type for window object
	interface SwupHooks {
		on(event: string, callback: () => void): void;
	}

	interface SwupInstance {
		hooks?: SwupHooks;
	}

	type WindowWithSwup = Window & { swup?: SwupInstance };

	let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);
	let displayedMode: LIGHT_DARK_MODE = $state(LIGHT_MODE); // 显示的实际主题

	/** 直接切换亮/暗模式 */
	function toggleTheme() {
		if (mode === SYSTEM_MODE) {
			// system 模式时，切换到系统当前外观的反向
			const isSystemDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			mode = isSystemDark ? LIGHT_MODE : DARK_MODE;
		} else {
			mode = mode === DARK_MODE ? LIGHT_MODE : DARK_MODE;
		}
		setTheme(mode);
		updateDisplayedMode();
	}

	// 更新显示的主题（用于显示当前实际主题）
	function updateDisplayedMode() {
		if (mode === SYSTEM_MODE) {
			const isSystemDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			displayedMode = isSystemDark ? DARK_MODE : LIGHT_MODE;
		} else {
			displayedMode = mode;
		}
	}

	onMount(() => {
		const storedTheme = getStoredTheme();
		mode = storedTheme;
		updateDisplayedMode();

		// 确保DOM状态与存储的主题一致（只对非system模式检查）
		if (storedTheme !== SYSTEM_MODE) {
			const currentTheme = document.documentElement.classList.contains("dark")
				? DARK_MODE
				: LIGHT_MODE;
			if (storedTheme !== currentTheme) {
				applyThemeToDocument(storedTheme);
			}
		}

		// 如果是system模式，监听系统主题变化
		if (storedTheme === SYSTEM_MODE) {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleSystemChange = () => {
				updateDisplayedMode();
			};
			mediaQuery.addEventListener("change", handleSystemChange);
		}

		// 添加Swup监听
		const handleContentReplace = () => {
			const newTheme = getStoredTheme();
			mode = newTheme;
			updateDisplayedMode();
		};

		const win = window as WindowWithSwup;
		if (win.swup?.hooks) {
			win.swup.hooks.on("content:replace", handleContentReplace);
		} else {
			document.addEventListener("swup:enable", () => {
				const w = window as WindowWithSwup;
				if (w.swup?.hooks) {
					w.swup.hooks.on("content:replace", handleContentReplace);
				}
			});
		}

		// 监听主题变化事件
		const handleThemeChange = () => {
			if (mode !== SYSTEM_MODE) {
				const newTheme = getStoredTheme();
				mode = newTheme;
				updateDisplayedMode();
			} else {
				updateDisplayedMode();
			}
		};

		window.addEventListener("theme-change", handleThemeChange);

		return () => {
			window.removeEventListener("theme-change", handleThemeChange);
		};
	});
</script>

<button
	aria-label="切换亮色/暗色模式"
	class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
	id="scheme-switch"
	onclick={toggleTheme}
>
	<div class="absolute inset-0 flex items-center justify-center" class:opacity-0={displayedMode !== LIGHT_MODE}>
		<Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
	</div>
	<div class="absolute inset-0 flex items-center justify-center" class:opacity-0={displayedMode !== DARK_MODE}>
		<Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
	</div>
</button>
