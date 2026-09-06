<template>
	<main id="main" class="portfolio-home">
		<header class="portfolio-intro">
			<h1>{{ portfolio?.title || 'Portfolio' }}</h1>
		</header>

		<MiscPortfolioGallery :images="portfolio?.images || []" />
	</main>
</template>

<script setup>
const { data: portfolio } = await useAsyncData('portfolio', () =>
	queryContent('/pages/portfolio').findOne()
)

if (portfolio.value?.SEOmetaData) {
	setSeoHead(portfolio.value.SEOmetaData)
}
</script>

<style lang="scss" scoped>
.portfolio-home {
	padding-block: clamp($spacing4, 6vw, $spacing7);
}

.portfolio-intro {
	margin: clamp($spacing4, 8vw, $spacing8) auto clamp($spacing4, 6vw, $spacing7);
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
}

h1 {
	margin: 0;
	color: var(--text-color);
	font-family: $font-main;
	font-size: clamp(3rem, 10vw, 7rem);
	font-weight: 400;
	line-height: 1;
	text-align: left;

	&::before {
		display: none;
	}
}

:deep(.portfolio-gallery) {
	margin: 0 auto;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
}
</style>
