const Joi = require('joi');
const request = require('./restAPI');
const fs = require('fs');

const allow_delay_time=5;// количество секунд задержки при котором не будет вызвана аномалия
const arr_program=[];//текущие программы всех светофоров
let arr_edit=[];//все данные о кэшированных изменениях фаз
let arr_anomaly=[];//все данные о кэшированных аномалиях
const arr_test_id=[2,99901,99902,99903,99904,99905,99906,99907,99908,99909,99910];//Массив существующих id светофоров

// var encoded = btoa(JSON.stringify(obj))
// var actual = JSON.parse(atob(encoded))

function save(name,type,index){//функция сохранения на жесткий диск
    const patch=(type===1?'edit':'anomaly')
    if(name===99901&&type===1) {
        fs.writeFile(__dirname+'/coding/file.txt',btoa(JSON.stringify(arr_edit[index])), function(err){
            if (err) console.log(err)
        })
    }
    fs.writeFile(__dirname+'/'+patch+'/'+name+'.json',type===1?JSON.stringify(arr_edit[index]):JSON.stringify(arr_anomaly[index]), function(err){
        if (err) console.log(err)
    })
}

for(i of arr_test_id){//Собираем данные с существующих локальных json файлов методом перебора
    const arr_edit_local = false//require('./edit/'+i);
    const arr_anomaly_local = false//require('./anomaly/'+i);
    arr_edit.push(arr_edit_local?atob(arr_edit_local):[])
    arr_anomaly.push(arr_anomaly_local?atob(arr_anomaly_local):[])
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
    },1000)
}

async function func_load_now_phase() {
    for (let id in arr_test_id) {
        awaitphase(id)
    }
}
async function awaitphase(id){
    const data= await request.requestApi('GET',arr_test_id[id]+'/status',[],{})//API запрос на телефон
    const now_date=new Date()//Время запроса
    if(!data.code&&data.status==='OK') {// Проверка на наличие и правильность ответа
        if(arr_edit[id]&&arr_edit[id].length===0){//если массив ещё пуст
            arr_edit[id].push(
                Object.assign(data,{time_update:now_date})//пушим полученнные данные о текущей фазе
            )
            save(arr_test_id[id],1,id)
        }
        else {
            if(arr_edit[id][arr_edit[id].length-1].current_phase_id!=data.current_phase_id){//Если изменилась фаза с полседнего локального// сохранения, то...
                const last_info=arr_edit[id][arr_edit[id].length-1]//из кэша достаем последние данные
                const ping = now_date-last_info.time_update//вычисляем время за которое светофор переключился
                const edit_data=Object.assign(data,{time_update:now_date, ping:ping})
                arr_edit[id].push(
                    edit_data//пушим данные о новой фазе
                )
                save(arr_test_id[id],1,id)//локальное сохранение переключения
                for(i of arr_program[id].phases){//перебираем фазы и находим нужную по id
                    if(last_info.current_phase_id===i.id){
                        const time=i.t_osn+i.t_prom//вычисляем положенное время работы фазы
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

load_programs()

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
                    return arrNikitos.map (item => {//из статуса светофора отдаём только id фазы, предыдущюю и след фазу и id светофора
                        return {
                            current_phase_id : item.current_phase_id ,
                            prevPhaseID : item.rc_response.status_msg.prevPhaseID ,
                            nextPhaseID : item.rc_response.status_msg.nextPhaseID ,
                            rc_id : item.rc_response.status_msg.rc_id
                        };
                    })
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