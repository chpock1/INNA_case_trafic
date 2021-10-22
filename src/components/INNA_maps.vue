<template lang="pug">
	div(style="height='900px'; width='900px'")
		h1 катра
		yandex-map(
			style="width: 900px; height: 900px;"
			ref="map"
			:scrollZoom="true"
			:controls="['zoomControl']"
			:coords="setting.coords"
			:zoom="15")
</template>

<script>
	import { yandexMap, ymapMarker } from 'vue-yandex-maps'
	export default {
		components: { yandexMap , ymapMarker},
		name : 'INNA_maps',
		data(){
			return{
				setting:{
					coords: [55.710061, 37.769203]
				},
				settings:{
					apiKey: '',
					lang: 'ru_RU',
					coordorder: 'latlong',
					enterprise: false,
					version: '2.1'
				}
			}
		}
	};
</script>

<style scoped>

</style>