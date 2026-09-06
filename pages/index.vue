<template>
	<main id="main" class="portfolio-home">
		<header class="portfolio-intro">
			<h1>
			<span class="portfolio-intro__first-name">{{ nameParts[0] }}</span>
				<span v-if="nameParts.length > 1" class="portfolio-intro__last-name">
					{{ nameParts.slice(1).join(' ') }}
				</span>
			</h1>
			<p class="portfolio-intro__subtitle">Portfolio</p>
		</header>

		<MiscPortfolioGallery :images="portfolio?.images || []" />
	</main>
</template>

<script setup>
const { data: portfolio } = await useAsyncData('portfolio', () =>
	queryContent('/pages/portfolio').findOne()
)

const nameParts = computed(() => (portfolio.value?.title || 'Portfolio').trim().split(/\s+/))

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
	margin: clamp($spacing3, 6vw, $spacing7) auto 0;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);
	padding-bottom: $spacing2;

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
	align-self: flex-end;
	margin: 0;
	padding-bottom: 0.12em;
	color: var(--muted-text-color);
	font-size: $font-size8;
	line-height: 1;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

h1 {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	margin: 0;
	color: var(--text-color);
	font-family: $font-main;
	font-size: clamp(2.75rem, 8vw, 6rem);
	font-weight: 400;
	line-height: 1;
	text-align: left;

	&::before {
		display: none;
	}
}

.portfolio-intro__last-name {
	margin-top: -0.08em;
}

.portfolio-intro__first-name {
	font-size: 0.78em;
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
	margin: $spacing4 auto 0;
	max-width: 90rem;
	padding-inline: clamp($spacing2, 4vw, $spacing4);

	@include media(sm, md, lg, xlg) {
		margin-top: $spacing7;
	}
}
</style>
