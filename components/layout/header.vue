<template>
	<header id="header">
		<nav class="header-nav" aria-label="Primary navigation">
			<button type="button" class="header-nav__button">About</button>
			<button type="button" class="header-nav__button">Contact</button>
			<button
				type="button"
				class="header-nav__button"
				:aria-pressed="darkMode"
				:aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
				:title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
				@click="toggleDarkMode"
			>
				<svg v-if="darkMode" viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
				</svg>
				<svg v-else viewBox="0 0 24 24" aria-hidden="true">
					<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
				</svg>
			</button>
		</nav>
	</header>
</template>

<script setup>
const darkMode = ref(false)

const applyTheme = (enabled) => {
	darkMode.value = enabled
	document.documentElement.classList.toggle('dark-mode', enabled)
}

const toggleDarkMode = () => {
	const enabled = !darkMode.value
	applyTheme(enabled)
	localStorage.setItem('dark-mode', String(enabled))
}

onMounted(() => {
	applyTheme(localStorage.getItem('dark-mode') === 'true')
})
</script>

<style lang="scss" scoped>
#header {
	position: sticky;
	z-index: 20;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: $spacing4;
	width: 100%;
	box-sizing: border-box;
	padding: clamp($spacing1, 2vw, $spacing2);
	background: color-mix(in srgb, var(--surface-color) 78%, transparent);
	backdrop-filter: blur(1rem);
}

#header__logo {
	flex: 0 0 auto;
}

.header-nav {
	display: flex;
	justify-content: flex-end;
	gap: $spacing1;
	margin-left: auto;
	margin-right: max(
		0px,
		calc(
			(100vw - 90rem) / 2
			+ clamp($spacing2, 4vw, $spacing4)
			- clamp($spacing1, 2vw, $spacing2)
		)
	);
}

.header-nav__button {
	padding: $spacing1 $spacing2;
	white-space: nowrap;
	border: 0;
	background: transparent;
	color: var(--text-color);
	font-family: $font-main;
	font-size: $font-size7;
	cursor: pointer;

	svg {
		display: block;
		width: 1.25rem;
		height: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
	}

	&:hover,
	&:focus-visible {
		background: var(--muted-surface-color);
	}
}

</style>
