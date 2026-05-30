/**
 * LQIP fade-in：图片加载完成后淡出占位渐变
 */
export function initImageLoadFadeIn() {
	const placeholders =
		document.querySelectorAll<HTMLElement>(".lqip-placeholder");
	placeholders.forEach((placeholder) => {
		const container = placeholder.parentElement;
		if (!container) return;
		const img = container.querySelector<HTMLImageElement>("img, picture img");
		if (!img) return;

		if (img.complete && img.naturalWidth > 0) {
			img.style.opacity = "1";
			placeholder.classList.add("loaded");
		} else {
			img.addEventListener(
				"load",
				() => {
					img.style.opacity = "1";
					placeholder.classList.add("loaded");
				},
				{ once: true },
			);
			img.addEventListener(
				"error",
				() => {
					placeholder.classList.add("loaded");
				},
				{ once: true },
			);
		}
	});
}
