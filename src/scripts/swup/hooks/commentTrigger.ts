/**
 * page:view 时触发评论系统初始化事件
 */
export function registerCommentTrigger() {
	window.swup.hooks.on("page:view", () => {
		// 检查当前页面是否为文章页面，如果是则触发自定义事件用于初始化评论系统
		setTimeout(() => {
			if (document.getElementById("tcomment")) {
				// 触发自定义事件，通知评论系统页面已完全加载
				const pageLoadedEvent = new CustomEvent("firefly:page:loaded", {
					detail: {
						path: window.location.pathname,
						timestamp: Date.now(),
					},
				});
				document.dispatchEvent(pageLoadedEvent);
				console.log(
					"Layout: 触发 firefly:page:loaded 事件，路径:",
					window.location.pathname,
				);
			}
		}, 300);
	});
}
