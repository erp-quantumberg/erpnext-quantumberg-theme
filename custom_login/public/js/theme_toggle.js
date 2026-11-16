(() => {
	const BUTTON_ID = "qg-theme-toggle";

	const MOON_ICON = `
		<svg class="qg-theme-icon qg-theme-icon-moon" viewBox="0 0 24 24"
			fill="none" stroke="currentColor" stroke-width="2"
			stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>`;

	const SUN_ICON = `
		<svg class="qg-theme-icon qg-theme-icon-sun" viewBox="0 0 24 24"
			fill="none" stroke="currentColor" stroke-width="2"
			stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="4"></circle>
			<path d="M12 2v2"></path>
			<path d="M12 20v2"></path>
			<path d="m4.93 4.93 1.41 1.41"></path>
			<path d="m17.66 17.66 1.41 1.41"></path>
			<path d="M2 12h2"></path>
			<path d="M20 12h2"></path>
			<path d="m6.34 17.66-1.41 1.41"></path>
			<path d="m19.07 4.93-1.41 1.41"></path>
		</svg>`;

	function themeRoot() {
		return document.documentElement;
	}

	function text(value) {
		return typeof window.__ === "function" ? window.__(value) : value;
	}

	function frappeReady() {
		return (
			window.frappe &&
			window.frappe.ui &&
			typeof window.frappe.ui.set_theme === "function"
		);
	}

	function isDark() {
		const root = themeRoot();
		const theme = root.getAttribute("data-theme");
		const mode = root.getAttribute("data-theme-mode");
		return theme === "dark" || (!theme && mode === "dark");
	}

	function syncButton() {
		const button = document.getElementById(BUTTON_ID);
		if (!button) return;

		const dark = isDark();
		const label = dark ? "Switch to light mode" : "Switch to dark mode";

		button.setAttribute("title", label);
		button.setAttribute("aria-label", label);
		button.setAttribute("aria-pressed", dark ? "true" : "false");
		button.dataset.theme = dark ? "dark" : "light";
	}

	function applyTheme(mode) {
		const root = themeRoot();
		root.setAttribute("data-theme-mode", mode);

		if (frappeReady()) {
			window.frappe.ui.set_theme(mode);
		} else {
			root.setAttribute("data-theme", mode);
		}

		syncButton();
	}

	function toggleTheme() {
		const next = isDark() ? "light" : "dark";

		applyTheme(next);

		if (window.frappe?.xcall) {
			window.frappe
				.xcall("frappe.core.doctype.user.user.switch_theme", {
					theme: next === "dark" ? "Dark" : "Light",
				})
				?.catch?.(() => {});
		}

		if (window.frappe?.show_alert) {
			window.frappe.show_alert({
				message:
					next === "dark"
						? text("Dark mode enabled")
						: text("Light mode enabled"),
				indicator: "blue",
			});
		}
	}

	function createButton() {
		if (!document.body || document.getElementById(BUTTON_ID)) {
			syncButton();
			return;
		}

		const button = document.createElement("button");
		button.id = BUTTON_ID;
		button.type = "button";
		button.className = "qg-theme-toggle";
		button.innerHTML = MOON_ICON + SUN_ICON;
		button.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			toggleTheme();
		});

		document.body.appendChild(button);
		syncButton();
	}

	function init() {
		createButton();

		if (frappeReady()) {
			window.frappe.ui.set_theme();
		}

		syncButton();

		window.setTimeout(createButton, 500);
		window.setTimeout(() => {
			createButton();
			syncButton();
		}, 1500);
	}

	function observe() {
		const themeObserver = new MutationObserver(syncButton);
		themeObserver.observe(themeRoot(), {
			attributes: true,
			attributeFilter: ["data-theme", "data-theme-mode"],
		});

		if (document.body) {
			const bodyObserver = new MutationObserver(createButton);
			bodyObserver.observe(document.body, { childList: true });
		}
	}

	function start() {
		init();
		observe();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start, { once: true });
	} else {
		start();
	}
})();
