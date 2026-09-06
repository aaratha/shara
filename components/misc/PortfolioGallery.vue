<template>
	<div ref="galleryRoot" class="portfolio-gallery">
		<div v-for="(column, columnIndex) in galleryColumns" :key="columnIndex" class="portfolio-gallery__column">
			<button
				v-for="(image, imageIndex) in column"
				:key="`${image.src}-${imageIndex}`"
				class="portfolio-gallery__item"
				:data-image-src="image.src"
				type="button"
				@click="selectedImage = image"
			>
				<img
					:src="requestedImages.has(image.src) ? imageUrl(image.src, 'f_auto,w_1100,q_auto') : undefined"
					:alt="image.alt"
					:class="{ 'is-loaded': loadedImages.has(image.src) }"
					@load="markImageLoaded(image.src)"
				>
			</button>
		</div>
	</div>

	<div v-if="selectedImage" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-labelledby="portfolio-lightbox-title" @click="handleBackdropClick">
		<div
			ref="lightboxContent"
			class="portfolio-lightbox__content"
			@wheel.prevent.stop="zoomAtPoint"
			@pointerdown="startPan"
			@pointermove="movePan"
			@pointerup="endPan"
			@pointercancel="endPan"
			@dblclick.prevent.stop="handleDoubleClick"
			@click.stop="handleBackdropClick"
		>
			<h2 id="portfolio-lightbox-title" class="sr-only">Image preview</h2>
			<button class="portfolio-lightbox__close" type="button" aria-label="Close image preview" @pointerdown.stop @pointerup.stop @click.stop.prevent="close">×</button>
			<button class="portfolio-lightbox__nav portfolio-lightbox__nav--previous" type="button" aria-label="Previous image" @pointerdown.stop @pointerup.stop @click.stop.prevent="showPrevious">‹</button>
			<button class="portfolio-lightbox__nav portfolio-lightbox__nav--next" type="button" aria-label="Next image" @pointerdown.stop @pointerup.stop @click.stop.prevent="showNext">›</button>
			<Transition name="portfolio-lightbox-image">
				<img
					:key="selectedImage.src"
					:src="imageUrl(selectedImage.src, 'f_auto,w_2200,q_auto')"
					:alt="selectedImage.alt"
					:style="previewImageStyle"
					class="portfolio-lightbox__image"
					@click.stop
				>
			</Transition>
			<p class="portfolio-lightbox__help">
				<span aria-label="Mouse controls: scroll to zoom and click-drag to move" title="Mouse: scroll to zoom, click-drag to move">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<rect x="7" y="3" width="10" height="18" rx="5" />
						<path d="M12 7v5m0-5-2 2m2-2 2 2m-2 5-2-2m2 2 2-2" />
					</svg>
				</span>
				<span aria-hidden="true" class="portfolio-lightbox__separator">/</span>
				<span aria-label="Touch controls: pinch to zoom and drag to move" title="Touch: pinch to zoom, drag to move">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5m0-6a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v5c0 4-2 6-6 6h-2c-3 0-5-2-5-5V9a1.5 1.5 0 0 1 3 0v3" />
					</svg>
				</span>
			</p>
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
	if (typeof image === 'string') return { src: image, alt: 'Portfolio image' }
	if (Array.isArray(image)) return image.flatMap(imageSource)
	if (!image || typeof image !== 'object') return null

	const src = image.image ?? image.url ?? image.src ?? image.path
	if (typeof src === 'string') {
		return { src, alt: image.alt || 'Portfolio image' }
	}

	return imageSource(src)
}

const galleryImages = computed(() => props.images
	.flatMap(imageSource)
	.filter((image) => image?.src))

const columnCount = ref(1)
const updateColumnCount = () => {
	const width = window.innerWidth
	columnCount.value = width >= 1440 ? 4 : width >= 1024 ? 3 : width >= 768 ? 2 : 1
}
const galleryColumns = computed(() => Array.from(
	{ length: columnCount.value },
	(_, columnIndex) => galleryImages.value.filter((_, imageIndex) => imageIndex % columnCount.value === columnIndex),
))

const loadedImages = ref(new Set())
const requestedImages = ref(new Set())
const imageLoadTimers = new Set()
const markImageLoaded = (src) => {
	loadedImages.value = new Set(loadedImages.value).add(src)
}
const galleryRoot = ref(null)
let galleryObserver = null
const requestImage = (src) => {
	if (requestedImages.value.has(src)) return
	const timer = window.setTimeout(() => {
		requestedImages.value = new Set(requestedImages.value).add(src)
		imageLoadTimers.delete(timer)
	}, 180)
	imageLoadTimers.add(timer)
}
const observeGalleryImages = () => {
	galleryObserver?.disconnect()
	galleryObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) requestImage(entry.target.dataset.imageSrc)
		})
	}, { rootMargin: '200px 0px' })
	galleryRoot.value?.querySelectorAll('.portfolio-gallery__item').forEach((item) => galleryObserver.observe(item))
}

const lightboxContent = ref(null)
const zoom = ref(1)
const pan = reactive({ x: 0, y: 0 })
const pointers = new Map()
const pinch = reactive({ distance: 0, zoom: 1 })
const didPan = ref(false)
let wheelFrame = null
let settleFrame = null
let wheelVelocity = 0
let wheelPoint = { x: 0, y: 0 }

const previewImageStyle = computed(() => ({
	transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom.value})`,
	cursor: zoom.value > 1 ? (pointers.size ? 'grabbing' : 'grab') : 'zoom-in',
}))

const clampZoom = (value) => Math.min(4, Math.max(1, value))
const cancelPanSettle = () => {
	if (settleFrame) cancelAnimationFrame(settleFrame)
	settleFrame = null
}

const settlePan = () => {
	cancelPanSettle()
	const startX = pan.x
	const startY = pan.y
	const startTime = performance.now()
	const duration = 220

	const animate = (time) => {
		const progress = Math.min(1, (time - startTime) / duration)
		const eased = 1 - (1 - progress) ** 3
		pan.x = startX * (1 - eased)
		pan.y = startY * (1 - eased)
		if (progress < 1) {
			settleFrame = requestAnimationFrame(animate)
		} else {
			settleFrame = null
			pan.x = 0
			pan.y = 0
		}
	}

	settleFrame = requestAnimationFrame(animate)
}

const resetZoom = () => {
	cancelPanSettle()
	if (wheelFrame) cancelAnimationFrame(wheelFrame)
	wheelFrame = null
	zoom.value = 1
	pan.x = 0
	pan.y = 0
	pinch.distance = 0
	pinch.zoom = 1
	wheelVelocity = 0
	didPan.value = false
	pointers.clear()
}

const applyZoomAtPoint = (pointX, pointY, factor) => {
	cancelPanSettle()
	const nextZoom = clampZoom(zoom.value * factor)
	const zoomFactor = nextZoom / zoom.value

	pan.x = pointX - (pointX - pan.x) * zoomFactor
	pan.y = pointY - (pointY - pan.y) * zoomFactor
	zoom.value = nextZoom
	if (nextZoom === 1) {
		settlePan()
	}
}

const animateWheelZoom = () => {
	wheelVelocity *= 0.82
	if (Math.abs(wheelVelocity) < 0.001) {
		wheelVelocity = 0
		wheelFrame = null
		return
	}

	applyZoomAtPoint(wheelPoint.x, wheelPoint.y, Math.exp(wheelVelocity))
	wheelFrame = requestAnimationFrame(animateWheelZoom)
}

const isTrackpadGesture = (event) => (
	event.deltaMode === 0 &&
	(Math.abs(event.deltaX) > 0 || Math.abs(event.deltaY) < 50 || !Number.isInteger(event.deltaY))
)

const zoomAtPoint = (event) => {
	const rect = lightboxContent.value?.getBoundingClientRect()
	if (!rect) return

	const pointX = event.clientX - (rect.left + rect.width / 2)
	const pointY = event.clientY - (rect.top + rect.height / 2)

	if (isTrackpadGesture(event)) {
		if (event.ctrlKey) {
			applyZoomAtPoint(pointX, pointY, Math.exp(-event.deltaY * 0.01))
		} else if (zoom.value > 1) {
			pan.x -= event.deltaX
			pan.y -= event.deltaY
		}
		return
	}

	wheelPoint = { x: pointX, y: pointY }
	wheelVelocity += event.deltaY < 0 ? 0.075 : -0.075
	if (!wheelFrame) wheelFrame = requestAnimationFrame(animateWheelZoom)
}

const toggleZoom = (event) => {
	if (zoom.value > 1) {
		resetZoom()
		return
	}

	const rect = lightboxContent.value?.getBoundingClientRect()
	if (!rect) return
	const pointX = event.clientX - (rect.left + rect.width / 2)
	const pointY = event.clientY - (rect.top + rect.height / 2)
	zoom.value = 2
	pan.x = -pointX
	pan.y = -pointY
}

const handleDoubleClick = (event) => {
	if (event.target.closest('button')) return
	toggleZoom(event)
}

const distanceBetween = (first, second) => Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)

const startPan = (event) => {
	event.preventDefault()
	didPan.value = false
	pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
	if (pointers.size === 2) {
		const [first, second] = [...pointers.values()]
		pinch.distance = distanceBetween(first, second)
		pinch.zoom = zoom.value
	}
	event.currentTarget?.setPointerCapture?.(event.pointerId)
}

const movePan = (event) => {
	if (!pointers.has(event.pointerId)) return
	const previous = pointers.get(event.pointerId)

	if (pointers.size === 2 && pinch.distance) {
		pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
		const [first, second] = [...pointers.values()]
		const nextZoom = clampZoom(pinch.zoom * (distanceBetween(first, second) / pinch.distance))
		const wasZoomed = zoom.value > 1
		zoom.value = nextZoom
		if (wasZoomed && nextZoom === 1) settlePan()
		return
	}

	if (zoom.value <= 1) return
	if (Math.abs(event.clientX - previous.clientX) > 1 || Math.abs(event.clientY - previous.clientY) > 1) {
		didPan.value = true
	}
	pan.x += event.clientX - previous.clientX
	pan.y += event.clientY - previous.clientY
	pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
}

const endPan = (event) => {
	pointers.delete(event.pointerId)
	event.currentTarget?.releasePointerCapture?.(event.pointerId)
}

const imageUrl = (url, transformation) => cldDelivery(url, transformation)
const close = () => { selectedImage.value = null }
const showImage = (offset) => {
	const currentIndex = galleryImages.value.findIndex((image) => image.src === selectedImage.value?.src)
	if (currentIndex === -1) return
	const nextImage = galleryImages.value[(currentIndex + offset + galleryImages.value.length) % galleryImages.value.length]
	resetZoom()
	selectedImage.value = nextImage
}
const showPrevious = () => showImage(-1)
const showNext = () => showImage(1)
const preloadAdjacentImages = () => {
	if (!import.meta.client || !selectedImage.value) return
	const currentIndex = galleryImages.value.findIndex((image) => image.src === selectedImage.value.src)
	if (currentIndex === -1) return

	;[-1, 1].forEach((offset) => {
		const image = galleryImages.value[(currentIndex + offset + galleryImages.value.length) % galleryImages.value.length]
		const preload = new Image()
		preload.src = imageUrl(image.src, 'f_auto,w_2200,q_auto')
	})
}
const handleBackdropClick = (event) => {
	if (didPan.value) {
		didPan.value = false
		return
	}

	if (event.target !== event.currentTarget) return
	close()
}

const onKeydown = (event) => {
	if (event.key === 'Escape') close()
	if (event.key === 'ArrowLeft') showPrevious()
	if (event.key === 'ArrowRight') showNext()
}

watch(selectedImage, (image) => {
	document.body.classList.toggle('lightbox-open', Boolean(image))
	resetZoom()
	if (image) nextTick(preloadAdjacentImages)
}, { flush: 'sync' })

onMounted(() => {
	updateColumnCount()
	nextTick(observeGalleryImages)
	window.addEventListener('resize', updateColumnCount)
	window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
	galleryObserver?.disconnect()
	imageLoadTimers.forEach((timer) => window.clearTimeout(timer))
	imageLoadTimers.clear()
	window.removeEventListener('resize', updateColumnCount)
	window.removeEventListener('keydown', onKeydown)
	document.body.classList.remove('lightbox-open')
	if (wheelFrame) cancelAnimationFrame(wheelFrame)
	cancelPanSettle()
})
</script>

<style lang="scss" scoped>
.portfolio-gallery {
	gap: $spacing2;
	display: flex;
	width: 100%;
	align-items: flex-start;
}

.portfolio-gallery__column {
	display: flex;
	flex: 1 1 0;
	flex-direction: column;
	gap: $spacing2;
	min-width: 0;
}

.portfolio-gallery__item {
	display: block;
	width: 100%;
	height: fit-content;
	min-height: 12rem;
	padding: 0;
	border: 0;
	background: $light-grey;
	cursor: zoom-in;
	transition: box-shadow 240ms ease, opacity 800ms ease, transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);

	img {
		display: block;
		width: 100%;
		height: auto;
		transition: transform 300ms ease;
	}

	&:not(:has(img.is-loaded)) {
		opacity: 0;
		transform: translateY(12rem);
	}

	&:has(img.is-loaded) {
		min-height: 0;
		opacity: 1;
		transform: translateY(0);
	}

	&:hover img,
	&:focus-visible img { transform: scale(1.04); }
	&:hover,
	&:focus-visible {
		box-shadow: 0 1.5rem 3.5rem rgba($black, 0.2), 0 0.35rem 0.9rem rgba($black, 0.12);
	}
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
	overflow: visible;
	touch-action: none;

	img {
		display: block;
		flex: 0 1 auto;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		margin: auto;
		object-fit: contain;
		user-select: none;
		-webkit-user-drag: none;
		will-change: transform;
	}
}

.portfolio-lightbox-image-enter-active,
.portfolio-lightbox-image-leave-active {
	transition: opacity 220ms ease;
}

.portfolio-lightbox-image-enter-active {
	position: absolute;
}

.portfolio-lightbox-image-enter-from,
.portfolio-lightbox-image-leave-to {
	opacity: 0;
}

.portfolio-lightbox__help {
	position: absolute;
	bottom: $spacing2;
	left: 50%;
	display: flex;
	gap: $spacing0;
	margin: 0;
	color: $white;
	text-align: center;
	transform: translateX(-50%);
	pointer-events: none;
	mix-blend-mode: difference;

	span {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
	}

	.portfolio-lightbox__separator {
		width: auto;
		color: currentColor;
		font-size: $font-size8;
	}

	svg {
		width: 1.25rem;
		height: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
	}
}

.portfolio-lightbox__close {
	position: absolute;
	z-index: 1;
	top: $spacing2;
	right: $spacing2;
	width: 3rem;
	height: 3rem;
	border: 0;
	border-radius: 50%;
	background: rgba($white, 0.85);
	color: $black;
	font-size: 2rem;
	line-height: 1;
	cursor: pointer;
	backdrop-filter: blur(1rem);
	mix-blend-mode: difference;
}

.portfolio-lightbox__nav {
	position: absolute;
	z-index: 1;
	top: 50%;
	width: 3rem;
	height: 3rem;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: $white;
	font-size: 2.5rem;
	line-height: 1;
	cursor: pointer;
	opacity: 0;
	transform: translateY(-50%);
	transition: opacity 180ms ease;
	mix-blend-mode: difference;

	&:focus-visible,
	&:hover {
		opacity: 1;
	}
}

.portfolio-lightbox:hover .portfolio-lightbox__nav,
.portfolio-lightbox:focus-within .portfolio-lightbox__nav {
	opacity: 0.75;
}

@include media(xsm) {
	.portfolio-lightbox__nav {
		top: auto;
		bottom: $spacing6;
		width: 2.5rem;
		height: 2.5rem;
		opacity: 0.75;
		transform: none;
	}

	.portfolio-lightbox__nav--previous {
		left: calc(50% - 3rem);
	}

	.portfolio-lightbox__nav--next {
		right: calc(50% - 3rem);
	}
}

.portfolio-lightbox__nav--previous {
	left: $spacing2;
}

.portfolio-lightbox__nav--next {
	right: $spacing2;
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
