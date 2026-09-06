<template>
	<div class="portfolio-gallery">
		<button
			v-for="(image, index) in galleryImages"
			:key="`${image.src}-${index}`"
			class="portfolio-gallery__item"
			type="button"
			@click="selectedImage = image"
		>
			<img
				:src="imageUrl(image.src, 'f_auto,w_1100,q_auto')"
				:alt="image.alt"
				loading="lazy"
			>
		</button>
	</div>

	<div v-if="selectedImage" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-labelledby="portfolio-lightbox-title" @click="handleLightboxClick">
		<div
			ref="lightboxContent"
			class="portfolio-lightbox__content"
			@wheel.prevent.stop="zoomAtPoint"
			@pointerdown="startPan"
			@pointermove="movePan"
			@pointerup="endPan"
			@pointercancel="endPan"
			@dblclick.prevent.stop="toggleZoom"
		>
			<h2 id="portfolio-lightbox-title" class="sr-only">Image preview</h2>
			<button class="portfolio-lightbox__close" type="button" aria-label="Close image preview" @click="close">×</button>
			<img
				:src="imageUrl(selectedImage.src, 'f_auto,w_2200,q_auto')"
				:alt="selectedImage.alt"
				:style="previewImageStyle"
				@click.stop
			>
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
	zoom.value = 1
	pan.x = 0
	pan.y = 0
	pinch.distance = 0
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
const handleLightboxClick = () => {
	if (didPan.value) {
		didPan.value = false
		return
	}
	close()
}

const onKeydown = (event) => {
	if (event.key === 'Escape') close()
}

watch(selectedImage, (image) => {
	document.body.classList.toggle('lightbox-open', Boolean(image))
	if (image) nextTick(resetZoom)
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown)
	document.body.classList.remove('lightbox-open')
	if (wheelFrame) cancelAnimationFrame(wheelFrame)
	cancelPanSettle()
})
</script>

<style lang="scss" scoped>
.portfolio-gallery {
	display: grid;
	grid-template-columns: 1fr;
	gap: $spacing2;
	width: 100%;

	@include media(xsm) {
		grid-template-columns: 1fr;
	}

	@include media(sm) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@include media(md) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@include media(lg, xlg) {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}

.portfolio-gallery__item {
	display: block;
	width: 100%;
	height: fit-content;
	align-self: start;
	padding: 0;
	border: 0;
	background: $light-grey;
	cursor: zoom-in;

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
