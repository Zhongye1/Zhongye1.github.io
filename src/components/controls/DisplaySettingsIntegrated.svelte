<script lang="ts">
import {
	getDefaultHue,
	getDefaultOverlayBlur,
	getDefaultOverlayCardOpacity,
	getDefaultOverlayOpacity,
	getDefaultSakuraEnabled,
	getHue,
	getStoredOverlayBlur,
	getStoredOverlayCardOpacity,
	getStoredOverlayOpacity,
	getStoredSakuraEnabled,
	setHue,
	setOverlayBlur,
	setOverlayCardOpacity,
	setOverlayOpacity,
	setSakuraEnabled,
} from "@utils/setting-utils";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import { backgroundWallpaper, sakuraConfig, siteConfig } from "@/config";

type OverlaySliderItem = {
	key: "opacity" | "blur" | "cardOpacity";
	enabled: boolean;
	label: string;
	displayValue: string;
	ariaLabel: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onValueChange: (value: number) => void;
};

let hue = $state(getHue());
const defaultHue = getDefaultHue();
let currentLayout: "list" | "grid" = $state("list");
const defaultLayout = siteConfig.postListLayout.defaultMode;
const mobileDefaultLayout =
	siteConfig.postListLayout.mobileDefaultMode || defaultLayout;
let mounted = $state(false);
let isSmallScreen = $state(
	typeof window !== "undefined" ? window.innerWidth < 1200 : false,
);
let isMobileWidth = $state(
	typeof window !== "undefined" ? window.innerWidth < 780 : false,
);
let isSwitching = $state(false);
let sakuraEnabled = $state(true);
const defaultSakuraEnabled = getDefaultSakuraEnabled();
let overlayOpacity = $state(getDefaultOverlayOpacity());
const defaultOverlayOpacity = getDefaultOverlayOpacity();
let overlayBlur = $state(getDefaultOverlayBlur());
const defaultOverlayBlur = getDefaultOverlayBlur();
let overlayCardOpacity = $state(getDefaultOverlayCardOpacity());
const defaultOverlayCardOpacity = getDefaultOverlayCardOpacity();

const allowLayoutSwitch = siteConfig.postListLayout.allowSwitch;
let effectiveDefaultLayout = $derived(
	isMobileWidth ? mobileDefaultLayout : defaultLayout,
);
const showThemeColor = !siteConfig.themeColor.fixed;
const isSakuraSwitchable = sakuraConfig?.switchable ?? false;

const overlaySwitchableConfig =
	backgroundWallpaper.overlay?.switchable ?? false;
const isOverlaySettingsSwitchable =
	typeof overlaySwitchableConfig === "boolean" ? overlaySwitchableConfig : true;
const isOverlayOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.opacity ?? false);
const isOverlayBlurSwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.blur ?? false);
const isOverlayCardOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.cardOpacity ?? false);
const hasOverlaySettings =
	isOverlaySettingsSwitchable &&
	(isOverlayOpacitySwitchable ||
		isOverlayBlurSwitchable ||
		isOverlayCardOpacitySwitchable);
let overlaySettingsIsDefault = $derived(
	(!isOverlayOpacitySwitchable || overlayOpacity === defaultOverlayOpacity) &&
		(!isOverlayBlurSwitchable || overlayBlur === defaultOverlayBlur) &&
		(!isOverlayCardOpacitySwitchable ||
			overlayCardOpacity === defaultOverlayCardOpacity),
);
const hasAnyContent =
	showThemeColor || hasOverlaySettings || isSakuraSwitchable;

let overlaySliderItems = $derived<OverlaySliderItem[]>([
	{
		key: "opacity",
		enabled: isOverlayOpacitySwitchable,
		label: "壁纸透明度",
		displayValue: `${Math.round(overlayOpacity * 100)}%`,
		ariaLabel: "壁纸透明度",
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayOpacity * 100),
		onValueChange: (value) => {
			overlayOpacity = value / 100;
		},
	},
	{
		key: "blur",
		enabled: isOverlayBlurSwitchable,
		label: "背景模糊",
		displayValue: `${overlayBlur.toFixed(1)}px`,
		ariaLabel: "背景模糊",
		min: 0,
		max: 20,
		step: 0.5,
		value: overlayBlur,
		onValueChange: (value) => {
			overlayBlur = value;
		},
	},
	{
		key: "cardOpacity",
		enabled: isOverlayCardOpacitySwitchable,
		label: "卡片透明度",
		displayValue: `${Math.round(overlayCardOpacity * 100)}%`,
		ariaLabel: "卡片透明度",
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayCardOpacity * 100),
		onValueChange: (value) => {
			overlayCardOpacity = value / 100;
		},
	},
]);

function resetHue() {
	hue = getDefaultHue();
	requestAnimationFrame(refreshAllRangeProgress);
}

function resetLayout() {
	currentLayout = effectiveDefaultLayout;
	localStorage.removeItem("postListLayout");

	const event = new CustomEvent("layoutChange", {
		detail: { layout: effectiveDefaultLayout },
	});
	window.dispatchEvent(event);
}

function resetOverlaySettings() {
	if (isOverlayOpacitySwitchable && overlayOpacity !== defaultOverlayOpacity) {
		overlayOpacity = defaultOverlayOpacity;
		setOverlayOpacity(defaultOverlayOpacity);
	}
	if (isOverlayBlurSwitchable && overlayBlur !== defaultOverlayBlur) {
		overlayBlur = defaultOverlayBlur;
		setOverlayBlur(defaultOverlayBlur);
	}
	if (
		isOverlayCardOpacitySwitchable &&
		overlayCardOpacity !== defaultOverlayCardOpacity
	) {
		overlayCardOpacity = defaultOverlayCardOpacity;
		setOverlayCardOpacity(defaultOverlayCardOpacity);
	}

	requestAnimationFrame(refreshAllRangeProgress);
}

function toggleSakuraEnabled() {
	sakuraEnabled = !sakuraEnabled;
	setSakuraEnabled(sakuraEnabled);
}

function checkScreenSize() {
	isSmallScreen = window.innerWidth < 1200;
	isMobileWidth = window.innerWidth < 780;
	if (window.innerWidth < 380 && currentLayout === "list") {
		currentLayout = "grid";
		const event = new CustomEvent("layoutChange", {
			detail: { layout: "grid" },
		});
		window.dispatchEvent(event);
	}
}

function updateRangeProgress(input: HTMLInputElement) {
	const min = Number(input.min || 0);
	const max = Number(input.max || 100);
	const value = Number(input.value || 0);
	const progress = ((value - min) * 100) / (max - min || 1);
	input.style.setProperty(
		"--range-progress",
		`${Math.min(100, Math.max(0, progress))}%`,
	);
}

function refreshAllRangeProgress() {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const rangeInputs = Array.from(
		panel.querySelectorAll('input[type="range"]'),
	) as HTMLInputElement[];

	rangeInputs.forEach((input) => {
		updateRangeProgress(input);
	});
}

function switchLayout() {
	if (!mounted || isSwitching) return;

	isSwitching = true;
	currentLayout = currentLayout === "list" ? "grid" : "list";
	localStorage.setItem("postListLayout", currentLayout);

	const event = new CustomEvent("layoutChange", {
		detail: { layout: currentLayout },
	});
	window.dispatchEvent(event);

	setTimeout(() => {
		isSwitching = false;
	}, 500);
}

onMount(() => {
	mounted = true;
	checkScreenSize();

	sakuraEnabled = getStoredSakuraEnabled();

	overlayOpacity = getStoredOverlayOpacity();
	overlayBlur = getStoredOverlayBlur();
	overlayCardOpacity = getStoredOverlayCardOpacity();

	const savedLayout = localStorage.getItem("postListLayout");
	if (savedLayout && (savedLayout === "list" || savedLayout === "grid")) {
		currentLayout = savedLayout;
	} else {
		currentLayout =
			window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
	}

	window.addEventListener("resize", checkScreenSize);

	return () => {
		window.removeEventListener("resize", checkScreenSize);
	};
});

onMount(() => {
	const handleCustomEvent = (event: Event) => {
		const customEvent = event as CustomEvent<{
			layout: "list" | "grid";
		}>;
		currentLayout = customEvent.detail.layout;
	};

	window.addEventListener("layoutChange", handleCustomEvent);

	return () => {
		window.removeEventListener("layoutChange", handleCustomEvent);
	};
});

onMount(() => {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const handleRangeInput = (event: Event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement && target.type === "range") {
			updateRangeProgress(target);
		}
	};

	refreshAllRangeProgress();
	panel.addEventListener("input", handleRangeInput);

	return () => {
		panel.removeEventListener("input", handleRangeInput);
	};
});

$effect(() => {
	if (hue || hue === 0) {
		setHue(hue);
	}
});

$effect(() => {
	if (isOverlayOpacitySwitchable) {
		setOverlayOpacity(overlayOpacity);
	}
	if (isOverlayBlurSwitchable) {
		setOverlayBlur(overlayBlur);
	}
	if (isOverlayCardOpacitySwitchable) {
		setOverlayCardOpacity(overlayCardOpacity);
	}
});
</script>

{#if hasAnyContent}
    <div
        id="display-setting"
        class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-2"
    >
        <!-- Theme Color Section -->
        {#if showThemeColor}
            <div class="mt-2 mb-2">
                <div
                    class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
                >
                    主题色
                    <button
                        aria-label="Reset to Default"
                        class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={hue === defaultHue}
                        class:pointer-events-none={hue === defaultHue}
                        onclick={resetHue}
                    >
                        <div class="text-(--btn-content)">
                            <Icon
                                icon="fa7-solid:arrow-rotate-left"
                                class="text-[0.875rem]"
                            ></Icon>
                        </div>
                    </button>
                </div>
                <div class="flex gap-1">
                    <div
                        id="hueValue"
                        class="transition bg-(--btn-regular-bg) w-10 h-7 rounded-md flex justify-center
                font-bold text-sm items-center text-(--btn-content)"
                    >
                        {hue}
                    </div>
                </div>
            </div>
            <div
                class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none"
            >
                <input
                    aria-label="主题色"
                    type="range"
                    min="0"
                    max="360"
                    bind:value={hue}
                    class="slider"
                    id="colorSlider"
                    step="5"
                    style="width: 100%"
                />
            </div>
        {/if}

        <!-- Overlay Settings Section -->
        {#if hasOverlaySettings}
            <div class="mt-2 mb-2">
                <div
                    class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
                >
                    覆盖设置
                    <button
                        aria-label="Reset to Default"
                        class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={overlaySettingsIsDefault}
                        class:pointer-events-none={overlaySettingsIsDefault}
                        onclick={resetOverlaySettings}
                    >
                        <div class="text-(--btn-content)">
                            <Icon
                                icon="fa7-solid:arrow-rotate-left"
                                class="text-[0.875rem]"
                            ></Icon>
                        </div>
                    </button>
                </div>
                <div class="space-y-2">
                    {#each overlaySliderItems as item (item.key)}
                        {#if item.enabled}
                            <div class="rounded-md bg-(--btn-regular-bg) p-2">
                                <div
                                    class="flex items-center justify-between mb-1"
                                >
                                    <span
                                        class="text-sm font-medium text-(--btn-content) opacity-80"
                                        >{item.label}</span
                                    >
                                    <span class="text-xs text-(--btn-content)"
                                        >{item.displayValue}</span
                                    >
                                </div>
                                <input
                                    aria-label={item.ariaLabel}
                                    type="range"
                                    min={item.min}
                                    max={item.max}
                                    step={item.step}
                                    value={item.value}
                                    oninput={(e) =>
                                        item.onValueChange(
                                            Number(
                                                (
                                                    e.currentTarget as HTMLInputElement
                                                ).value,
                                            ),
                                        )}
                                    class="slider w-full overlay-slider"
                                />
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Effects Settings Section -->
        {#if isSakuraSwitchable}
            <div class="mt-2 mb-2">
                <div
                    class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
                >
                    特效设置
                    <button
                        aria-label="Reset to Default"
                        class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={sakuraEnabled === defaultSakuraEnabled}
                        class:pointer-events-none={sakuraEnabled ===
                            defaultSakuraEnabled}
                        onclick={() => {
                            sakuraEnabled = defaultSakuraEnabled;
                            setSakuraEnabled(defaultSakuraEnabled);
                        }}
                    >
                        <div class="text-(--btn-content)">
                            <Icon
                                icon="fa7-solid:arrow-rotate-left"
                                class="text-[0.875rem]"
                            ></Icon>
                        </div>
                    </button>
                </div>
                <div class="space-y-1">
                    <button
                        class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                        class:bg-(--btn-regular-bg-hover)={sakuraEnabled}
                        onclick={toggleSakuraEnabled}
                    >
                        <Icon
                            icon="mdi:flower-poppy"
                            class="text-[1.25rem] shrink-0"
                        ></Icon>
                        <span class="text-sm flex-1">粒子特效</span>
                        <div
                            class="w-10 h-5 rounded-full transition-all duration-200 relative"
                            class:bg-(--primary)={sakuraEnabled}
                            class:bg-(--btn-regular-bg-active)={!sakuraEnabled}
                        >
                            <div
                                class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                                class:left-0.5={!sakuraEnabled}
                                class:left-5={sakuraEnabled}
                            ></div>
                        </div>
                    </button>
                </div>
            </div>
        {/if}

        <!-- Layout Switch Section -->
        {#if allowLayoutSwitch}
            <div class="mt-2 mb-2">
                <div
                    class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
                >
                    文章列表布局
                    <button
                        aria-label="Reset to Default"
                        class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={currentLayout ===
                            effectiveDefaultLayout}
                        class:pointer-events-none={currentLayout ===
                            effectiveDefaultLayout}
                        onclick={resetLayout}
                    >
                        <div class="text-(--btn-content)">
                            <Icon
                                icon="fa7-solid:arrow-rotate-left"
                                class="text-[0.875rem]"
                            ></Icon>
                        </div>
                    </button>
                </div>
                <div class="flex gap-2">
                    <button
                        aria-label="列表模式"
                        class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                        class:opacity-60={currentLayout !== "list"}
                        class:bg-(--btn-regular-bg-hover)={currentLayout ===
                            "list"}
                        disabled={isSwitching}
                        onclick={switchLayout}
                        title="列表模式"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                        </svg>
                        <span class="text-xs font-medium">列表模式</span>
                    </button>
                    <button
                        aria-label="网格模式"
                        class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                        class:opacity-60={currentLayout !== "grid"}
                        class:bg-(--btn-regular-bg-hover)={currentLayout ===
                            "grid"}
                        disabled={isSwitching}
                        onclick={switchLayout}
                        title="网格模式"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"
                            />
                        </svg>
                        <span class="text-xs font-medium">网格模式</span>
                    </button>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style lang="stylus">
    #display-setting
        input[type="range"]
            -webkit-appearance none
            height 1.5rem
            border-radius 999px
            background-image unquote("linear-gradient(90deg, var(--primary) 0 var(--range-progress, 50%), hsla(var(--hue), 22%, 28%, 0.18) var(--range-progress, 50%) 100%)")
            transition background-image 0.15s ease-in-out

        input[type="range"].overlay-slider
            height 0.85rem

            &::-webkit-slider-thumb
                -webkit-appearance none
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

            &::-moz-range-thumb
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

            &::-ms-thumb
                -webkit-appearance none
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

        #colorSlider
            background-image var(--color-selection-bar)
            transition background-image 0.15s ease-in-out

            &::-webkit-slider-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

            &::-moz-range-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                border-width 0
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

            &::-ms-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

</style>
