<template>
	<main id="main" class="dynamic-fields-showcase">
		<h1>{{ dynamicFields?.title }}</h1>
		<MiscDynamicFields
			v-for="(section, index) in dynamicFields?.sections || []"
			:key="section.name || index"
			:section="section"
			:section-id="`section-${index}`"
		/>
	</main>
</template>

<script setup>
const { data: dynamicFields } = await useAsyncData('dynamic-fields', () =>
	queryContent('/pages/dynamic-fields').findOne()
)

if (dynamicFields.value?.SEOmetaData) {
	setSeoHead(dynamicFields.value.SEOmetaData)
}
</script>

<style lang="scss" scoped>
.dynamic-fields-showcase > h1 {
	margin: $spacing4;
	text-align: center;
}
</style>
