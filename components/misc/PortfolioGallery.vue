<template>
	<div class="portfolio-gallery">
		<button
			v-for="(image, index) in galleryImages"
			:key="`${image}-${index}`"
			class="portfolio-gallery__item"
			type="button"
			@click="selectedImage = image"
		>
			<img
				:src="imageUrl(image, 'f_auto,w_1100,q_auto')"
				:alt="`Open image ${index + 1}`"
				loading="lazy"
			>
		</button>
	</div>

	<div v-if="selectedImage" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-labelledby="portfolio-lightbox-title" @click.self="close">
		<div class="portfolio-lightbox__content">
			<h2 id="portfolio-lightbox-title" class="sr-only">Image preview</h2>
			<button class="portfolio-lightbox__close text-on-dark" type="button" aria-label="Close image preview" @click="close">×</button>
			<img :src="imageUrl(selectedImage, 'f_auto,w_2200,q_auto')" alt="Expanded portfolio image">
		</div>
	</div>
</template>

<script setup>
import cldDelivery from '~/composables/cldDelivery'

const props = defineProps({
	images: { type: Array, default: () => [] },
})

const selectedImage = ref(null)
const imageSource = (image) => {
	if (typeof image === 'string') return image
	if (Array.isArray(image)) return image.flatMap(imageSource)
	if (!image || typeof image !== 'object') return null

	return imageSource(image.image ?? image.url ?? image.src ?? image.path)
}

const galleryImages = computed(() => props.images
	.flatMap(imageSource)
	.filter(Boolean))

const imageUrl = (url, transformation) => cldDelivery(url, transformation)
const close = () => { selectedImage.value = null }

const onKeydown = (event) => {
	if (event.key === 'Escape') close()
}

watch(selectedImage, (image) => {
	document.body.classList.toggle('lightbox-open', Boolean(image))
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown)
	document.body.classList.remove('lightbox-open')
})
</script>

<style lang="scss" scoped>
.portfolio-gallery {
	column-count: 1;
	column-gap: $spacing2;
	width: 100%;

	@include media(xsm) {
		column-count: 1;
	}

	@include media(sm) {
		column-count: 2;
	}

	@include media(md) {
		column-count: 3;
	}

	@include media(lg, xlg) {
		column-count: 4;
	}
}

.portfolio-gallery__item {
	position: relative;
	display: block;
	width: 100%;
	margin: 0 0 $spacing2;
	padding: 0;
	border: 0;
	background: $light-grey;
	cursor: zoom-in;
	break-inside: avoid;

	img {
		display: block;
		width: 100%;
		height: auto;
		transition: transform 300ms ease;
	}

	&:hover img,
	&:focus-visible img { transform: scale(1.04); }
	&:focus-visible { outline: 3px solid $base-color; outline-offset: 3px; }
}

.portfolio-lightbox {
	position: fixed;
	z-index: 1000;
	inset: 0;
	display: grid;
	place-items: center;
	padding: clamp(1rem, 4vw, 3rem);
	background: rgba($black, 0.58);
	backdrop-filter: blur(1rem);
	cursor: zoom-out;
	overflow: hidden;

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		cursor: default;
	}
}

.portfolio-lightbox__content {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	max-width: 90rem;
	min-width: 0;
	min-height: 0;
	margin: auto;

	img {
		display: block;
		flex: 0 1 auto;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		margin: auto;
		object-fit: contain;
		cursor: default;
	}
}

.portfolio-lightbox__close {
	position: absolute;
	z-index: 1;
	top: $spacing2;
	right: $spacing2;
	width: 3rem;
	height: 3rem;
	border: 1px solid rgba($white, 0.7);
	border-radius: 50%;
	background: transparent;
	font-size: 2rem;
	line-height: 1;
	cursor: pointer;
}

:global(body.lightbox-open) {
	overflow: hidden;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}
</style>
