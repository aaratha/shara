<template>
	<div
		id="site-wrapper"
	>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<script setup>
useHead({
	script: [
		{
			src: 'https://identity.netlify.com/v1/netlify-identity-widget.js',
			defer: true,
		},
		{
			src: '/netlify-identity-redirect.js',
			defer: true,
		},
	],
})
</script>

