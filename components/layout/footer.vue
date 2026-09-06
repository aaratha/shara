<template>
	<footer>
		<p>© {{ new Date().getFullYear() }} Shara</p>
	</footer>
</template>

<style lang="scss" scoped>
	footer {
		position: relative;
		height: max-content;
		margin: $spacing7 $spacing4 $spacing4;
		color: $grey;
		font-size: $font-size8;
		@include media(xsm) {
			display: block;
			height: auto;
			margin-top: $spacing2;
			margin-inline: 0;
		}
	}

</style>
