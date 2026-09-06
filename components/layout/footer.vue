<template>
	<footer>
		<p>© {{ new Date().getFullYear() }} Shara</p>
	</footer>
</template>

<style lang="scss" scoped>
	footer {
		position: relative;
		height: max-content;
		margin: clamp($spacing4, 5vw, $spacing7) clamp($spacing2, 4vw, $spacing4) $spacing2;
		color: var(--muted-text-color);
		font-size: $font-size8;
	}

</style>
