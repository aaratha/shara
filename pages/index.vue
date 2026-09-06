<template>
	<main id="main" class="portfolio-home">
		<header class="portfolio-intro">
			<h1>{{ portfolio?.title || 'Portfolio' }}</h1>
			<p class="portfolio-intro__subtitle">Portfolio</p>
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
	position: relative;
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: $spacing3;
	margin: clamp($spacing4, 8vw, $spacing8) auto 0;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
	padding-bottom: 0;

	&::after {
		position: absolute;
		right: clamp($spacing2, 4vw, $spacing4);
		bottom: 0;
		left: clamp($spacing2, 4vw, $spacing4);
		height: 1px;
		background: var(--muted-text-color);
		content: "";
	}
}

.portfolio-intro__subtitle {
	margin: 0;
	color: var(--muted-text-color);
	font-size: $font-size8;
	letter-spacing: 0.08em;
	text-transform: uppercase;
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

@include media(xsm) {
	.portfolio-intro {
		align-items: baseline;
	}

	.portfolio-intro__subtitle {
		text-align: right;
	}
}

:deep(.portfolio-gallery) {
	margin: $spacing7 auto 0;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
}
</style>
