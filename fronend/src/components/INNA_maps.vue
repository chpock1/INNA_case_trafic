<template lang="pug">
	v-app
		div(data-app)
			div(style="height='900px'; width='900px'")
				h1 Kарта
				yandex-map(
					style="width: 100%; height: 900px;"
					:scrollZoom="true"
					:controls="['zoomControl']"
					:coords="setting.coords"
					:zoom="15")
					div(v-for="(marker,index) in markers")
						ymap-marker(:coords="marker"
							:marker-id="listTraffic[index]"
							:icon="{layout: 'default#imageWithContent',imageHref: 'https://via-dolorosa.ru/static/images/t1p1.png',imageSize: [80,80],content: listTraffic[index].time_for_end?listTraffic[index].time_for_end:''}"
							@click="open_modal_info(listTraffic[index])"
							:ref="index")
					div(v-for="(dt,index) in Dt")
						ymap-marker(:coords="dt"
							:marker-id="index"
							:icon="{layout: 'default#imageWithContent',imageHref: 'https://cdn-icons-png.flaticon.com/512/61/61427.png',imageSize: [65,65],content: listTraffic[index].time_for_end?listTraffic[index].time_for_end:''}"
							@click="openModalTrafficIntensity(index)"
							:ref="index")
			v-dialog.modal(v-model="modalTrafficLights")
				v-card()
					v-card-title Текущая фаза светофора
					v-card-text {{text_info_modal}}
					v-btn.addPhase(@click="openModalAddPhase(infoTraffic)") Создать фазу
					.containrePhase(v-if="infoTraffic.program")
						.blockPhase(v-for="info in infoTraffic.program")
							div Фаза {{info.text}}
							div Время длительности фазы {{info.time}} секунд
					span(v-else) Светофор не доступен
					.blockAnomaly
						.err(v-for="last in infoTraffic.last_five" v-if="last.text")
							div Текст {{last.text}}
							div Время {{last.time}} секунд
					v-img(v-if="text_info_modal" :src="'https://via-dolorosa.ru/static/images/t1p'+text_info_modal.current_phase_id+'.png'")
			v-dialog.modal(v-model="modalAddPhase")
				v-card()
					v-card-title Создать фазу
					v-card-text
						v-text-field(v-model="dataPhase.t_osn_one" label="Первая фаза t_osn" type="number")
						v-text-field(v-model="dataPhase.t_osn_two" label="Вторая фаза t_osn" type="number")
						v-text-field(v-model="dataPhase.t_osn_three" label="Третья фаза t_osn" type="number")
						input.inpDate(type="datetime-local")
						.btnModal
							v-btn(@click="close") Отмена
							v-btn(@click="addPhase") Создать
			v-dialog.modal(v-model="modalCamera")
				v-card()
					v-card-title Камера({{trafficStreet}})
					v-card-text
						v-text-field(v-model="trafficData.speed" label="Скорость" type="number" :counter="60")
						v-text-field(v-model="trafficData.intensity" label="Интенсивность" type="number" :counter="100")
						.btnModal
							v-btn(@click="close") Отмена
							v-btn(@click="detectedTraffic") Создать
</template>

<script>
	import axios from 'axios'
	import { yandexMap, ymapMarker } from 'vue-yandex-maps'
	export default {
		components: { yandexMap , ymapMarker},
		name : 'INNA_maps',
		data(){
			return{
				trafficData:{
					speed:0,
					intensity:0,
				},
				trafficStreet:'',
				street:['От ул. Зеленодольская - к Жигулёвской ул.','От ул. Фёдора Полетаева - к Окскому пр-ду','От пр-та Волгоградский - к ул. Шумилова'],
				Dt:[
					[55.710475925472736, 37.763597551957965],
					[55.71176359645175, 37.77577758839369],
					[55.70828268212671, 37.768161678974764]
				],
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
				modalCamera:false,
				idCamera:0,
			}
		},
		computed:{
			//Информация о светофоре
			text_info_modal(){
				return this.markersInfo[this.open_modal_id]
			},
		},
		methods:{
			async detectedTraffic(){
				const res = await axios.get(this.server+'detected/traffic/'+this.trafficData.intensity+'/'+this.trafficData.speed+'/'+(this.idCamera+1))
				console.log(res)
				if(!res.err){
					alert('Нет ошибок')
				}
				else{
					alert('Ошибка')
				}
			},
			openModalTrafficIntensity(i){
				this.trafficStreet=this.street[i]
				this.modalCamera=true
				this.idCamera=i
			},
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
					console.log(this.infoTraffic)
					// this.open_modal_id=e
				}
			},

			//Отправка запроса на Back-End для получения информации о светофорах
			async checkTraffic(){
				const res = await axios.get(this.server+'lights_info')
				console.log(res)
				if(res){
					this.markersInfo=res.data
				}
			},
		},
		// Запуск функции при отрисовке компонента
		mounted() {
			//setInterval(() => this.checkTraffic(), 2000);
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
.inpDate{
	width: 100%;
	border-bottom: 1px solid #999999;
	color:#525252;
}
.blockAnomaly{
	width: fit-content;
	text-align: center;
}
.err{
	border: 1px solid black;
	border-radius: 3px;
	padding: 2px;
	margin-left: 10px;
	margin-top: 10px;
}
</style>