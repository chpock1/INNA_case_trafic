<template lang="pug">
	v-app
		div(data-app)
			div(style="height='900px'; width='900px'")
				h1 Kарта
				yandex-map(
					style="width: 100%; height: 900px;"
					ref="map"
					:scrollZoom="true"
					:controls="['zoomControl']"
					:coords="setting.coords"
					:zoom="15")
					ymap-marker(v-for="(marker,index) in markers"
						:coords="marker"
						:marker-id="listTraffic[index]"
						:icon="markerIcon"
						@click="open_modal_info(listTraffic[index])"
						:ref="index")
			v-dialog.modal(v-model="modalTrafficLights")
				v-card()
					v-card-title Текущая фаза светофора
					v-card-text {{text_info_modal}}
					v-btn.addPhase(@click="openModalAddPhase(infoTraffic)") Создать фазу
					.blockInfo
						.dopInfo Статус:{{infoTraffic.is_enabled?'В работе':'Не работает'}}
						.dopInfo Пройдено циклов:{{infoTraffic.t_cycle}}
					.containrePhase
						.blockPhase(v-for="info in infoTraffic.phases")
							div Фаза {{info.id}}
							div Время длительности фазы {{info.t_min+info.t_osn}} секунд
					v-img(v-if="text_info_modal" :src="'https://via-dolorosa.ru/static/images/t1p'+text_info_modal.current_phase_id+'.png'")
			v-dialog.modal(v-model="modalAddPhase")
				v-card()
					v-card-title Создать фазу
					v-card-text
						v-text-field(v-model="dataPhase.t_osn_one" label="Первая фаза t_osn" type="number")
						v-text-field(v-model="dataPhase.t_osn_two" label="Вторая фаза t_osn" type="number")
						v-text-field(v-model="dataPhase.t_osn_three" label="Третья фаза t_osn" type="number")
						.datePicker
							v-time-picker.backGroundDate(v-model="dataPhase.time")
						.btnModal
							v-btn(@click="close") Отмена
							v-btn(@click="addPhase") Создать
</template>

<script>
	import axios from 'axios'
	import { yandexMap, ymapMarker } from 'vue-yandex-maps'
	export default {
		components: { yandexMap , ymapMarker},
		name : 'INNA_maps',
		data(){
			return{
				dataPhase:{
					t_osn_one:'',
					t_osn_two:'',
					t_osn_three:'',
					time:'',
				},
				infoTraffic:'',
				open_modal_id: 0,
				server: ' http://192.168.1.55:3002/',
				listTraffic:['99901','99902','99903','99904','99905','99906','99907','99908','99909','99910'],
				markers:[
					[55.710061, 37.769203],
					[55.71000, 37.7687],
					[55.71086, 37.772247],
					[55.71040, 37.76451],
					[55.71032, 37.76545],
					[55.71020, 37.7668],
					[55.71007, 37.7682],
					[55.71044, 37.7706],
					[55.712073701942586, 37.776888261295326],
					[55.71145, 37.77455],
				],
				markersInfo:[],
				markerIcon: {
					layout: 'default#imageWithContent',
					imageHref: 'https://via-dolorosa.ru/static/images/t1p1.png',
					imageSize: [80,80],
					imageOffset: [0, 0],
					content: '',
					contentOffset: [0, 0],
					contentLayout: '',
				},
				redTraffic:'https://cdn-icons.flaticon.com/png/512/276/premium/276337.png?token=exp=1634935255~hmac=7dcdbb0539230c830de15d6a725cd72c',
				greenTraffic:'https://cdn-icons.flaticon.com/png/512/276/premium/276706.png?token=exp=1634935255~hmac=ab31f6f1399ba98bdd15c29a88deb289',
				modalTrafficLights:false,
				setting:{
					coords: [55.710061, 37.769203],
				},
				settings:{
					apiKey: '',
					lang: 'ru_RU',
					coordorder: 'latlong',
					enterprise: false,
					version: '2.1'
				},
				idTraffic:'',
				modalAddPhase:false,
			}
		},
		computed:{
			//Информация о светофоре
			text_info_modal(){
				return this.markersInfo[this.open_modal_id]
			},
		},
		methods:{
			//Очистка данных и закрытие модального окна создания фазы
			close(){
				this.t_osn_one=0
				this.t_osn_two=0
				this.t_osn_three=0
				this.time=''
				this.modalAddPhase=false
			},
			//Запрос на добавление фазы
			async addPhase(){
				if((this.dataPhase.t_osn_one<99999&&this.dataPhase.t_osn_two<99999&&this.dataPhase.t_osn_three<9999999999999999&&this.dataPhase.time)||(this.dataPhase.t_osn_one>0&&this.dataPhase.t_osn_two>0&&this.dataPhase.t_osn_three>0&&!this.dataPhase.time)){
					const res = await axios.post(this.server+'custom_phase_program/'+this.idTraffic,this.dataPhase)
					if(!res.err){
						this.close()
						alert('status:OK')
					}
				}
				else{
					alert('Ошибка')
				}
			},
			//Открытие модалки добавления фазы
			openModalAddPhase(num){
				this.idTraffic=num.id
				this.modalTrafficLights=false
				this.modalAddPhase=true
			},
			//Получение информации о светофоре
			async open_modal_info(e){
				const res = await axios.get(this.server+'lights_programs/'+e)
				if(!res.err){
					this.modalTrafficLights=true
					this.infoTraffic=res.data
					// this.open_modal_id=e
				}
			},

			//Отправка запроса на Back-End для получения информации о светофорах
			async checkTraffic(){
				const res = await axios.get(this.server+'lights_info')
				if(res){
					this.markersInfo=res.data
				}
			},
		},
		// Запуск функции при отрисовке компонента
		mounted() {
			// this.checkTraffic()
		}
	};
</script>

<style scoped>
.modal{
	width: 50%;
}
.blockPhase{
	width: fit-content;
	padding: 6px;
	border-radius: 8px;
	background: #dbdbdb;
	margin: 10px auto;
	color: #424242;
}
.blockPhase div{
	text-align: center;
}
.containrePhase{
	display: flex;
}
.dopInfo{
	font-size: 18px;
}
.blockInfo{
	background: #dbdbdb;
	color: #424242;
	border-radius: 8px;
	width: fit-content;
	margin-left: 13px;
	padding: 5px;
}
.addPhase{
	margin: 12px;
}
.btnModal{
	display: flex;
	justify-content: space-around;
	margin-top: 10px;
}
</style>