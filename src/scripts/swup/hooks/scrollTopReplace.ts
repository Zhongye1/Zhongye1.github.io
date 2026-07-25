export function registerScrollTopReplace() {
	window.swup.hooks.replace(
		"scroll:top",
		(
			_visit: { to: { url: string } },
			args: { options: ScrollIntoViewOptions },
		) => {
			window.scrollTo({ top: 0, left: 0, ...args.options });
			return true;
		},
	);
}
