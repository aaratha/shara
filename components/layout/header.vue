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
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: $spacing4;
	padding: clamp($spacing1, 2vw, $spacing2);
	background: var(--surface-color);
}

#header__logo {
	flex: 0 0 auto;
}

.header-nav {
	display: flex;
	justify-content: flex-end;
	gap: $spacing1;
	margin-left: auto;
	margin-right: clamp($spacing1, 3vw, $spacing4);
}

.header-nav__button {
	padding: $spacing1 $spacing2;
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
