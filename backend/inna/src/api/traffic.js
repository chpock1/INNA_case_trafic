const Joi = require('joi');
const request = require('./restAPI');
const fs = require('fs');

const allow_delay_time=5;// количество секунд задержки при котором не будет вызвана аномалия
const arr_program=[], arr_edit=[], arr_anomaly=[];
const arr_test_id=[2,99901,99902,99903,99904,99905,99906,99907,99908,99909,99910];

function save(name,type,index){
    const patch=(type===1?'edit':'anomaly')
    fs.writeFile(__dirname+'/'+patch+'/'+name+'.json',type===1?JSON.stringify(arr_edit[index]):JSON.stringify(arr_anomaly[index]), function(err){
        if (err) console.log(err)
    })
}
// async function awaitphase(i){
//     // const res= await request.requestApi('GET',arrLights[i]+'/full_info',[],{})
//     console.log('lol', data, new Date())
//     // if(!res.code&&res.status==='OK'){
//     // const data = require('../config/'+arrLights[i]+'')
//     //     arrDataLights[i]=res
//     //     console.log(arrDataLights)
//     //     console.log(i)
//     // }
// }
//
// setInterval(()=> {
//     func_load_now_phase()
// },10000)

for(i of arr_test_id){
    // const arr_edit_local = require('./edit/'+i);
    // const arr_anomaly_local = require('./anomaly/'+i);
    arr_edit.push([])
    arr_anomaly.push([])
}
load_programs()
async function load_programs(){
    for (const id in arr_test_id) {
        const res_program = await request.requestApi('GET',arr_test_id[id]+'/full_info',[],{})
        if(res_program&&res_program.id===arr_test_id[id]){
            arr_program[id]=res_program
        }
    }
    setInterval(()=>{
        func_load_now_phase()
    },1000)
}

async function func_load_now_phase() {
    for (let id in arr_test_id) {
        awaitphase(id)
    }
}
async function awaitphase(id){
    const data= await request.requestApi('GET',arr_test_id[id]+'/status',[],{})
    const now_date=new Date()
    if(!data.code&&data.status==='OK') {
        if(arr_edit[id]&&arr_edit[id].length===0){
            arr_edit[id].push(
                Object.assign(data,{time_update:now_date})
            )
            save(arr_test_id[id],1,id)
        }
        else {
            if(arr_edit[id][arr_edit[id].length-1].current_phase_id!=data.current_phase_id){
                const last_info=arr_edit[id][arr_edit[id].length-1]
                const ping = now_date-last_info.time_update
                const edit_data=Object.assign(data,{time_update:now_date, ping:ping})
                arr_edit[id].push(
                    edit_data
                )
                save(arr_test_id[id],1,id)
                for(i of arr_program[id].phases){//перебираем фазы и находим нужную по id
                    if(last_info.current_phase_id===i.id){
                        const time=i.t_osn+i.t_prom//вычисляем положенное время работы фазы
                        if((ping-time)>allow_delay_time) {//усли время смены фазы больше положенного на allow_delay_time
                            let estimated_time=last_info.time_update.setSeconds(last_info.time_update.getSeconds() + time)//вычисляем предположительное время переключения фазы складывая предыдущее время переключения и положенное время работы фазы
                            arr_anomaly[id].push(Object.assign(data,{time_update:now_date, ping:ping, estimated_time:estimated_time}))//пушим в массив аномалий полученные даннык
                            save(arr_test_id[id],0,id)
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


exports.plugin = {
    name: 'traffic',
    version: '0.0.1',
    register: async (server,options) => {
        server.route({
            method: 'GET',
            path: '/info/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const data1 = await request.requestApi('GET',id+'/full_info',[],{})
                    console.log(data1)
                    if(data1)return data1
                    if(!data1)return "err"
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

        server.route({
            method: 'POST',
            path: '/custom_phase_program/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const data1 = await request.requestApi('POST',id+'/custom_phase_program', {
                            start_phase_id: 1,
                            time_start_sync: 1634958780,
                            t_cycle: 40,
                            phases: [
                            {
                                id: 1,
                                t_osn: 6,
                                t_prom: 4,
                                t_min: 4,
                                is_hidden: false,
                                directions: null
                            },
                            {
                                id: 2,
                                t_osn: 6,
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
                    console.log(data1)
                    return data1
                },
                description: 'хуйня какаято ',
                tags: ['api'],
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
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
                    return arrNikitos.map (item => {
                        return {
                            current_phase_id : item.current_phase_id , prevPhaseID : item.rc_response.status_msg.prevPhaseID , nextPhaseID : item.rc_response.status_msg.nextPhaseID , rc_id : item.rc_response.status_msg.rc_id
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
                    return arr_program[arr_test_id.includes(id)]
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