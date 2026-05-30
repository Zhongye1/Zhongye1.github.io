export function setClickOutsideToClose(panel: string, ignores: string[]) {
	document.addEventListener("click", (event) => {
		const panelDom = document.getElementById(panel);
		if (!panelDom) return;
		const tDom = event.target;
		if (!(tDom instanceof Node)) return; // Ensure the event target is an HTML Node
		for (const ig of ignores) {
			const ie = document.getElementById(ig);
			if (ie === tDom || ie?.contains(tDom)) {
				return;
			}
		}
		panelDom.classList.add("float-panel-closed");
	});
}

export function initOutsideClickPanels() {
	setClickOutsideToClose("display-setting", [
		"display-setting",
		"display-settings-switch",
	]);
	setClickOutsideToClose("nav-menu-panel", [
		"nav-menu-panel",
		"nav-menu-switch",
	]);
	setClickOutsideToClose("search-panel", [
		"search-panel",
		"search-bar",
		"search-switch",
	]);
	setClickOutsideToClose("wallpaper-mode-panel", [
		"wallpaper-mode-panel",
		"wallpaper-mode-switch",
	]);
	setClickOutsideToClose("theme-mode-panel", [
		"theme-mode-panel",
		"scheme-switch",
	]);
}
