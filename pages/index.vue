<template>
	<main id="main" class="portfolio-home">
		<header class="portfolio-intro">
			<p class="portfolio-intro__eyebrow font-accent text-muted">Selected work</p>
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
	margin: 0 auto clamp($spacing4, 6vw, $spacing7);
	max-width: 72rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
}

.portfolio-intro__eyebrow {
	margin: 0 0 $spacing1;
	font-size: $font-size8;
	letter-spacing: 0.14em;
	text-transform: uppercase;
}

h1 {
	margin: 0;
	font-size: clamp(2.8rem, 8vw, 7rem);
	font-weight: 400;
	line-height: 0.9;
}

:deep(.portfolio-gallery) {
	margin: 0 auto;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
}
</style>
