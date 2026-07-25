<script lang="ts">
import { WALLPAPER_OVERLAY } from "@constants/constants";
import { getStoredWallpaperMode, setWallpaperMode } from "@utils/setting-utils";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import { backgroundWallpaper } from "@/config";
import type { WALLPAPER_MODE } from "@/types/config";

let mode: WALLPAPER_MODE = $state(backgroundWallpaper.mode);

onMount(() => {
	mode = getStoredWallpaperMode();
});

function switchWallpaperMode(newMode: WALLPAPER_MODE) {
	mode = newMode;
	setWallpaperMode(newMode);
}
</script>

<div class="relative z-50">
	<button aria-label="Wallpaper Mode" aria-haspopup="menu" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="wallpaper-mode-switch">
		<div class="absolute inset-0 flex items-center justify-center">
			<Icon icon="material-symbols:full-coverage-outline-rounded" class="text-[1.25rem]"></Icon>
		</div>
	</button>
</div>
