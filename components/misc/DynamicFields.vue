<template>
	<section :id="sectionId" class="dynamic-fields" :class="sectionClasses">
		<div
			v-for="(field, index) in section.dynamicField || []"
			:key="`${field.type}-${index}`"
			class="dynamic-field"
			:class="`dynamic-field--${field.type}`"
		>
			<MDC v-if="field.type === 'text'" :value="field.dfText || ''" />
			<MediaRespImage v-else-if="field.type === 'image'" :url="field.image" />

			<div v-else-if="field.type === 'images'" class="image-gallery" :class="`image-gallery--${field.displayType || 'carousel'}`">
				<MediaRespImage v-for="(image, imageIndex) in field.images || []" :key="imageIndex" :url="image" :lightbox="field.displayType === 'lightbox'" />
			</div>

			<video v-else-if="field.type === 'video'" :src="field.video" :autoplay="field.autoplay" :muted="field.muted" :loop="field.loop" :controls="!field.autoplay" playsinline />
			<audio v-else-if="field.type === 'audio'" :src="field.audio" controls />
		</div>
	</section>
</template>

<script setup>
const props = defineProps({
	section: { type: Object, required: true },
	sectionId: { type: String, required: true },
})

const sectionClasses = computed(() => [
	`dynamic-fields--${props.section.dfSettings?.size || 'large'}`,
	`dynamic-fields--${props.section.dfSettings?.background || 'light'}`,
])
</script>

<style lang="scss" scoped>
.dynamic-fields {
	margin: $spacing4;
	padding: $spacing4;

	&--small { width: min(100% - 2 * $spacing4, 50rem); margin-inline: auto; }
	&--large { width: auto; }
	&--light { background: $light-grey; }
	&--dark { background: $dark-grey; color: $white; }
}

.dynamic-field + .dynamic-field { margin-top: $spacing4; }

.dynamic-field video,
.dynamic-field audio { display: block; width: 100%; }

.image-gallery {
	display: grid;
	gap: $spacing2;

	&--carousel { grid-auto-columns: minmax(18rem, 80%); grid-auto-flow: column; overflow-x: auto; scroll-snap-type: x mandatory; }
	&--carousel > * { scroll-snap-align: start; }
	&--lightbox { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
}
</style>
