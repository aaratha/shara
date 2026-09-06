<template>
	<div class="portfolio-gallery">
		<button
			v-for="(image, index) in galleryImages"
			:key="`${image}-${index}`"
			class="portfolio-gallery__item"
			type="button"
			@click="selectedImage = image"
		>
			<img :src="imageUrl(image, 'f_auto,c_fill,w_1100,h_1100,g_auto,q_auto')" :alt="`Open image ${index + 1}`" loading="lazy">
		</button>
	</div>

	<div v-if="selectedImage" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Image preview" @click.self="close">
		<button class="portfolio-lightbox__close" type="button" aria-label="Close image preview" @click="close">×</button>
		<img :src="imageUrl(selectedImage, 'f_auto,w_2200,q_auto')" alt="">
	</div>
</template>

<script setup>
import cldDelivery from '~/composables/cldDelivery'

const props = defineProps({
	images: { type: Array, default: () => [] },
})

const selectedImage = ref(null)
const galleryImages = computed(() => props.images
	.map((image) => typeof image === 'string' ? image : image?.image)
	.filter(Boolean))

const imageUrl = (url, transformation) => cldDelivery(url, transformation)
const close = () => { selectedImage.value = null }

const onKeydown = (event) => {
	if (event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style lang="scss" scoped>
.portfolio-gallery {
	display: grid;
	gap: $spacing2;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
}

.portfolio-gallery__item {
	padding: 0;
	border: 0;
	background: $light-grey;
	cursor: zoom-in;
	overflow: hidden;

	img {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
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
	padding: clamp(1rem, 5vw, 4rem);
	background: rgba($black, 0.94);
	cursor: zoom-out;

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		cursor: default;
	}
}

.portfolio-lightbox__close {
	position: fixed;
	top: 1rem;
	right: 1rem;
	width: 3rem;
	height: 3rem;
	border: 1px solid rgba($white, 0.7);
	border-radius: 50%;
	background: transparent;
	color: $white;
	font-size: 2rem;
	line-height: 1;
	cursor: pointer;
}
</style>
