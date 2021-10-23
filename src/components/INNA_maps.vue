<template lang="pug">
	div(data-app)
		div(style="height='900px'; width='900px'")
			h1 катра
			yandex-map(
				style="width: 100%; height: 900px;"
				ref="map"
				:scrollZoom="true"
				:controls="['zoomControl']"
				:coords="setting.coords"
				:zoom="15")
				ymap-marker(
					:coords="setting.coords"
					marker-id="12"
					:icon="markerIcon" @click="modalTrafficLights=true")
				ymap-marker(
					:coords="setting.cordsTwo"
					marker-id="12"
					:icon="markerIcon" @click="modalTrafficLights=true")
				ymap-marker(
					:coords="setting.cordsThree"
					marker-id="12"
					:icon="markerIcon" @click="modalTrafficLights=true")
		v-dialog.modal(v-model="modalTrafficLights")
			v-card
				v-card-title test
				v-card-text test12
</template>

<script>
	import { yandexMap, ymapMarker } from 'vue-yandex-maps'
	export default {
		components: { yandexMap , ymapMarker},
		name : 'INNA_maps',
		data(){
			return{
				//
				markerIcon: {
					layout: 'default#imageWithContent',
					imageHref: 'https://cdn-icons.flaticon.com/png/512/276/premium/276706.png?token=exp=1634935255~hmac=ab31f6f1399ba98bdd15c29a88deb289',
					imageSize: [15, 15],
					imageOffset: [0, 0],
					content: '123 v12',
					contentOffset: [0, 15],
					contentLayout: '<div style="width: 50px;position: relative;left: -15px;">test</div>',
				},
				redTraffic:'https://cdn-icons.flaticon.com/png/512/276/premium/276337.png?token=exp=1634935255~hmac=7dcdbb0539230c830de15d6a725cd72c',
				greenTraffic:'https://cdn-icons.flaticon.com/png/512/276/premium/276706.png?token=exp=1634935255~hmac=ab31f6f1399ba98bdd15c29a88deb289',
				modalTrafficLights:false,
				setting:{
					coords: [55.710061, 37.769203],
					cordsTwo:[55.71000, 37.7687],
					cordsThree:[55.71098, 37.7726],
				},
				settings:{
					apiKey: '',
					lang: 'ru_RU',
					coordorder: 'latlong',
					enterprise: false,
					version: '2.1'
				}
			}
		},
		methods:{
			checkTraffic(){
				console.log('test')
			},
		},
		mounted() {
			setInterval(this.checkTraffic,5000)
		}
	};
</script>

<style scoped>
.modal{
	width: 50%;
}

</style>