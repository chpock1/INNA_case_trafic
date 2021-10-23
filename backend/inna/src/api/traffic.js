const Joi = require('joi');
const request = require('./restAPI');
const fs = require('fs');

const allow_delay_time=5;// количество секунд задержки при котором не будет вызвана аномалия
const arr_program=[];//текущие программы всех светофоров
let arr_edit=[];//все данные о кэшированных изменениях фаз
let arr_anomaly=[];//все данные о кэшированных аномалиях
const arr_test_id=[2,99901,99902,99903,99904,99905,99906,99907,99908,99909,99910];//Массив существующих id светофоров
let arr_for_frontend_last=[]

function save(name,type,index){//функция сохранения на жесткий диск
    const patch=(type===1?'edit':'anomaly')
    // Перевод в base64 если потребуется
    // let encoded = btoa(JSON.stringify(obj))
    // let actual = JSON.parse(atob(encoded))
    // if(name===99901&&type===1) {
    //     fs.writeFile(__dirname+'/coding/file.txt',btoa(JSON.stringify(arr_edit[index])), function(err){
    //         if (err) console.log(err)
    //     })
    // }
    fs.writeFile(__dirname+'/'+patch+'/'+name+'.json',type===1?JSON.stringify(arr_edit[index]):JSON.stringify(arr_anomaly[index]), function(err){
        if (err) console.log(err)
    })
}

for(i of arr_test_id){//Собираем данные с существующих локальных json файлов методом перебора если они уже существуют
    const arr_edit_local = require('./edit/'+i);
    const arr_anomaly_local = require('./anomaly/'+i);
    arr_for_frontend_last.push({})
    arr_edit.push(arr_edit_local?arr_edit_local:[])
    arr_anomaly.push(arr_anomaly_local?arr_anomaly_local:[])
}

async function load_programs(){
    for (const id in arr_test_id) {//Собираем данные текущих программ методом перебора
        const res_program = await request.requestApi('GET',arr_test_id[id]+'/full_info',[],{})
        if(res_program&&res_program.id===arr_test_id[id]){
            arr_program[id]=res_program
        }
    }
    setInterval(()=>{//Запрашиваем информацию о фазе каждую секунду
        func_load_now_phase()
    },3000)
}

async function func_load_now_phase() {
    for (let id in arr_test_id) {
        setTimeout(()=>{
            awaitphase(id)
        },2000)

    }
}

async function awaitphase(id){//id это индекс а не значение
    const data= await request.requestApi('GET',arr_test_id[id]+'/status',[],{})//API запрос на телефон
    console.log(data)
    const now_date=new Date()//Время запроса
    if(!data.code&&data.status==='OK') {// Проверка на наличие и правильность ответа
        if(arr_edit[id]&&arr_edit[id].length===0){//если массив ещё пуст
            arr_edit[id].push(
                Object.assign(data,{time_update:now_date})//пушим полученные данные о текущей фазе
            )
            save(arr_test_id[id],1,id)
            arr_for_frontend_last[id]={//пушим данные о текущей фазе для фронта
                current_phase_id: data.current_phase_id,
                rc_id: data.rc_response.status_msg.rc_id
            }
        }
        else {
            const last_info=arr_edit[id][arr_edit[id].length-1]//из кэша достаем последние данные
            const ping = now_date-last_info.time_update//вычисляем время за которое светофор переключился
            const time=i.t_osn+i.t_prom//вычисляем положенное время работы фазы
            arr_for_frontend_last[id]={//пушим данные о текущей фазе для фронта
                current_phase_id: data.current_phase_id,
                rc_id: data.rc_response.status_msg.rc_id,
                time_for_end:time-ping
            }
            for(i of arr_program[id].phases){//перебираем фазы и находим нужную по id
                if(last_info.current_phase_id===i.id){
                    if((ping-time)>allow_delay_time) {//если время смены фазы больше положенного на allow_delay_time

                        if(data.status_msg.nextPhaseID===last_info.current_phase_id){ //делаем запрос на экстренное переключение
                            async function switchin(i){
                                const emergency_switching= await request.requestApi('POST',arr_test_id[id]+'/forward_next_phase',[],{})//API запрос на телефон
                                if(!emergency_switching&&i<2) switchin(i)
                            }
                            switchin(0)
                        }

                        let estimated_time=last_info.time_update.setSeconds(last_info.time_update.getSeconds() + time)//вычисляем предположительное время переключения фазы складывая предыдущее время переключения и положенное время работы фазы
                        arr_anomaly[id].push(Object.assign(data,{time_update:now_date, ping:ping, estimated_time:estimated_time}))//пушим в массив аномалий полученные даннык
                        save(arr_test_id[id],0,id)//локальное сохранение аномалии
                    }
                }
            }
            if(arr_edit[id][arr_edit[id].length-1].current_phase_id!=data.current_phase_id){//Если изменилась фаза с полседнего локального сохранения, то сохраняем данные
                const edit_data=Object.assign(data,{time_update:now_date, ping:ping})
                arr_edit[id].push(
                    edit_data//пушим данные о новой фазе
                )
                save(arr_test_id[id],1,id)//локальное сохранение переключения
            }
            if(arr_edit[id][arr_edit[id].length-1].current_phase_id!=data.status_msg.nextPhaseID){
                for(i of arr_program[id].phases){//перебираем фазы и находим нужную по id
                    if(last_info.current_phase_id===i.id){
                        if((time-ping)>2){//значит переключению раньше чем должно, быть, нельзя так, вычисляем сколько ещё должно быть и плюсуем
                            const emergency_switching= await request.requestApi('POST',arr_test_id[id] + '/continue_current_phase?phase_id='+last_info.current_phase_id+'&timeout='+(time-ping),[],{})//API запрос на телефон
                        }
                        if((ping-time)>allow_delay_time) {//усли время смены фазы больше положенного на allow_delay_time
                            let estimated_time=last_info.time_update.setSeconds(last_info.time_update.getSeconds() + time)//вычисляем предположительное время переключения фазы складывая предыдущее время переключения и положенное время работы фазы
                            arr_anomaly[id].push(Object.assign(data,{time_update:now_date, ping:ping, estimated_time:estimated_time}))//пушим в массив аномалий полученные даннык
                            save(arr_test_id[id],0,id)//локальное сохранение аномалии
                        }
                    }
                }
            }
        }
    } else{
        arr_anomaly[id].push({text:"Ошибка подключения", time: new Date})
        save(arr_test_id[id],0,id)
    }
}

async function load_front() {//функция передачи текущих данных на фронт
    return arr_for_frontend_last
}
async function detected_traffic_jam(detector_info){//поступила информация с детектора
    const plan = require('./traffic_plan/DT'+detector_info.id);//require плана для данного детектора
    const speed_metr_in_second=detector_info.speed/3.6
    const light_count= (Object.keys(plan).length)/2
    const max_speed=60;//максимальная скорость потока, от нее мы будем отталкиваться
    const min_green_light=30;//предположим что для главной дороги(на которой мы отслеживаем затор) минимальная длина зеленого цвета 30 сек а
    const max_green_light=72;// максимальная 72 при программе длиной 100 сек
    const people_green=20;
    const result_green_time=min_green_light+((((100-detector_info.intensity)+(max_speed/100*detector_info.speed))/2)/100*(max_green_light-min_green_light))
    let now_date=new Date()
    now_date.setSeconds(now_date.getSeconds() + 60);//загружаем программу через минуту
    //Здесь мы вычисляем на сколько процентов скорость соответсвует максимальной и насколько процентов загружена дорога, находим среднее арифмитическое загруженности дороги,
    // так как мы добавляем к светофору от 0 до 42 секунд в нашем примере, то процент из формулы будет равен проценту, который мы возьмём от числа
    // 42(разница максимальной и минимальной длины зеленого света) и добавим к минимальной
    let delay =0
    for(let i=1;i++;i>light_count){//чем больше расстояние между светофорами, тем больше разница между включениями
        delay= delay+ plan['distance'+i]/speed_metr_in_second
        const data1 = await request.requestApi('POST',plan['id'+i]+'/custom_phase_program', {
            start_phase_id: 1,
            time_start_sync: now_date.getTime()+ delay-i,
            t_cycle: 100,
            phases: [
                {
                    id: 1,
                    t_osn: result_green_time-4,
                    t_prom: 4,
                    t_min: 4,
                    is_hidden: false,
                    directions: null
                },
                {
                    id: 2,
                    t_osn: 100-result_green_time-20-4,
                    t_prom: 4,
                    t_min: 4,
                    is_hidden: false,
                    directions: null
                },
                {
                    id: 3,
                    t_osn: 15,
                    t_prom: 5,
                    t_min: 15,
                    is_hidden: false,
                    directions: null
                }
            ]
        },{})
    }
}
//detected_traffic_jam({id:1,speed:0,intensity:0})
//load_programs()//запуск всех программ с интервалом запросов

exports.plugin = {
    name: 'traffic',
    version: '0.0.1',
    register: async (server,options) => {

        /*TODO Nikolas: Получение полной информации для выбранного дорожного контроллера по его идентификатору*/

        server.route({
            method: 'GET',
            path: '/info/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const data1 = await request.requestApi('GET',id+'/full_info',[],{})
                    return data1?data1:"err"
                },
                description: 'Запросить всю инфу',
                tags: ['api'],
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
                    })
                },
                auth:false
            }
        });

        /*TODO Nikolas: Получение статуса контроллера по его идентификатору*/

        server.route({
            method: 'GET',
            path: '/status/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const data1 = await request.requestApi('GET',id+'/status',[],{})
                    console.log(data1)
                    return data1
                },
                description: 'Запросить статус',
                tags: ['api'],
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
                    })
                },
                auth:false
            }
        });

        /*TODO Nikolas: Установка фазовой программы для выбранного дорожного контроллера по его идентификатору*/

        server.route({
            method: 'POST',
            path: '/custom_phase_program/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const {time, t_osn_one, t_osn_two, t_osn_three}=req.payload
                    const data1 = await request.requestApi('POST',id+'/custom_phase_program', {
                            start_phase_id: 1,
                            time_start_sync: time,
                            t_cycle: 13+t_osn_one+t_osn_two+t_osn_three,
                            phases: [
                            {
                                id: 1,
                                t_osn: t_osn_one,
                                t_prom: 4,
                                t_min: 4,
                                is_hidden: false,
                                directions: null
                            },
                            {
                                id: 2,
                                t_osn: t_osn_two,
                                t_prom: 4,
                                t_min: 4,
                                is_hidden: false,
                                directions: null
                            },
                            {
                                id: 3,
                                t_osn: t_osn_three,
                                t_prom: 5,
                                t_min: 15,
                                is_hidden: false,
                                directions: null
                            }
                        ]
                    },{})
                    return data1
                },
                description: 'Изменение программы',
                tags: ['api'],
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
                    }),
                    payload: Joi.object({
                        time: Joi.number().integer().required(),
                        t_osn_one: Joi.number().integer().min(4).required(),
                        t_osn_two: Joi.number().integer().min(4).required(),
                        t_osn_three: Joi.number().integer().min(15).required()
                    })
                },
                auth:false
            }
        });
        //TODO chpock
        server.route({
            method: 'GET',
            path: '/lights_info',
            config: {
                async handler() {
                    //Сбор данных на текущий момент всех светофоров
                    const last_update = await load_front();
                    console.log(last_update)
                    return {last_update}
                },
                description: 'получение информации о последнем состоянии светофоров',
                tags: ['api'],
                auth:false
            }
        });
        //TODO chpock
        server.route({
            method: 'GET',
            path: '/lights_programs/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    return arr_program[arr_test_id.indexOf(id)]//Ищем информацию о программе по id
                },
                description: 'получение информации о последнем состоянии светофоров',
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
                    })
                },
                tags: ['api'],
                auth:false
            }
        });
    }
}