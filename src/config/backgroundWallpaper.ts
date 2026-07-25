import type { BackgroundWallpaperConfig } from "@/types/config";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	mode: "overlay",
	switchable: false,

	src: {
		desktop: [
			"https://pic3.zhimg.com/v2-983244d3ef88846217191a74b5439350_r.jpg",
		],
		mobile: [
			"https://pic3.zhimg.com/v2-983244d3ef88846217191a74b5439350_r.jpg",
		],
	},
	overlay: {
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
		zIndex: -1,
		opacity: 0.8,
		blur: 0,
		cardOpacity: 0.8,
	},
};
