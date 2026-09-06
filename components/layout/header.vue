<template>
	<header id="header">
		<nav class="header-nav" aria-label="Primary navigation">
			<button type="button" class="header-nav__button">About</button>
			<button type="button" class="header-nav__button">Contact</button>
			<button
				type="button"
				class="header-nav__button"
				:aria-pressed="darkMode"
				@click="toggleDarkMode"
			>
				{{ darkMode ? 'Light' : 'Dark' }}
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

	&:hover,
	&:focus-visible {
		background: var(--muted-surface-color);
	}
}

</style>
