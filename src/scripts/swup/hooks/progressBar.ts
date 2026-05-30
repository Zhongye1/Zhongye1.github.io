import { scrollFunction } from "@/scripts/scroll";

/**
 * 进度条动画 + visit:end 清理工作
 */
export function registerProgressBar() {
	// visit:start - Start progress bar
	window.swup.hooks.on("visit:start", () => {
		const progressBar = document.getElementById("progress-bar");
		if (progressBar) {
			progressBar.classList.remove("finishing", "done");
			// Force reflow so the animation restarts cleanly
			void progressBar.offsetWidth;
			progressBar.classList.add("loading");
		}
	});

	// visit:end - Finish progress bar + cleanup
	window.swup.hooks.on("visit:end", (_visit: { to: { url: string } }) => {
		// Finish progress bar
		const progressBar = document.getElementById("progress-bar");
		if (progressBar) {
			progressBar.classList.remove("loading");
			progressBar.classList.add("finishing");
			setTimeout(() => {
				progressBar.classList.remove("finishing");
				progressBar.classList.add("done");
				setTimeout(() => {
					progressBar.classList.remove("done");
				}, 300);
			}, 200);
		}

		setTimeout(() => {
			const heightExtend = document.getElementById("page-height-extend");
			if (heightExtend) {
				heightExtend.classList.add("hidden");
			}

			// Just make the transition looks better
			const toc = document.getElementById("toc-wrapper");
			if (toc) {
				toc.classList.remove("toc-not-ready");
			}

			// 移除页面切换保护，恢复过渡动画
			document.documentElement.classList.remove("is-page-transitioning");
			scrollFunction();
		}, 200);
	});
}
