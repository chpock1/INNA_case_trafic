const Joi = require('joi');
const request = require('./restAPI');

const arrLights=['2','99901','99902','99903','99904','99905','99906','99907','99908','99909','99910']
const arrNikitos=[
    {
        "time": 1634950137,
        "uuid": "5a603147-e201-4d45-b632-423354538971",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 3,
        "rc_response": {
            "uuid": "5a603147-e201-4d45-b632-423354538971",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "5a603147-e201-4d45-b632-423354538971",
                "rc_id": 2,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 3,
                "nextPhaseID": 3
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634949991,
        "uuid": "0a1584d2-92e5-49b9-845a-69d476863fa9",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 3,
        "rc_response": {
            "uuid": "0a1584d2-92e5-49b9-845a-69d476863fa9",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "0a1584d2-92e5-49b9-845a-69d476863fa9",
                "rc_id": 99901,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 3,
                "nextPhaseID": 3
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950023,
        "uuid": "8e6515d3-aa5c-4ca3-9ae5-7c2bfac4a3fe",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 1,
        "rc_response": {
            "uuid": "8e6515d3-aa5c-4ca3-9ae5-7c2bfac4a3fe",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "8e6515d3-aa5c-4ca3-9ae5-7c2bfac4a3fe",
                "rc_id": 99902,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 1,
                "nextPhaseID": 1
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950039,
        "uuid": "dc8258b7-df34-4c73-9a0e-ba82af2e4c26",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 1,
        "rc_response": {
            "uuid": "dc8258b7-df34-4c73-9a0e-ba82af2e4c26",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "dc8258b7-df34-4c73-9a0e-ba82af2e4c26",
                "rc_id": 99903,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 1,
                "nextPhaseID": 1
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950056,
        "uuid": "c175c900-8c42-458d-b14b-3cc3e9e6d9e4",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 2,
        "rc_response": {
            "uuid": "c175c900-8c42-458d-b14b-3cc3e9e6d9e4",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "c175c900-8c42-458d-b14b-3cc3e9e6d9e4",
                "rc_id": 99904,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 2,
                "nextPhaseID": 2
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950075,
        "uuid": "1b65fd3e-d9a2-4705-b3c1-51cadf78680c",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 3,
        "rc_response": {
            "uuid": "1b65fd3e-d9a2-4705-b3c1-51cadf78680c",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "1b65fd3e-d9a2-4705-b3c1-51cadf78680c",
                "rc_id": 99905,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 3,
                "nextPhaseID": 3
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950094,
        "uuid": "e09707f9-7406-4434-81d6-556a01f32632",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 3,
        "rc_response": {
            "uuid": "e09707f9-7406-4434-81d6-556a01f32632",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "e09707f9-7406-4434-81d6-556a01f32632",
                "rc_id": 99906,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 3,
                "nextPhaseID": 3
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950109,
        "uuid": "9f186cf2-6b9d-4b8e-a9fd-64a1650bc28d",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 1,
        "rc_response": {
            "uuid": "9f186cf2-6b9d-4b8e-a9fd-64a1650bc28d",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "9f186cf2-6b9d-4b8e-a9fd-64a1650bc28d",
                "rc_id": 99907,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 1,
                "nextPhaseID": 1
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950124,
        "uuid": "55fd734a-3ad9-4b47-bb39-97a31cb41f1d",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 1,
        "rc_response": {
            "uuid": "55fd734a-3ad9-4b47-bb39-97a31cb41f1d",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "55fd734a-3ad9-4b47-bb39-97a31cb41f1d",
                "rc_id": 99908,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 1,
                "nextPhaseID": 1
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634950137,
        "uuid": "5a603147-e201-4d45-b632-423354538971",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 3,
        "rc_response": {
            "uuid": "5a603147-e201-4d45-b632-423354538971",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "5a603147-e201-4d45-b632-423354538971",
                "rc_id": 99909,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 3,
                "nextPhaseID": 3
            },
            "protocol": 1,
            "type": 2
        }
    },
    {
        "time": 1634951037,
        "uuid": "850f1241-870d-4045-a606-aa2fb1508e1f",
        "status": "OK",
        "status_rc": "OK_STATUS",
        "status_rc_desc": "OK_STATUS",
        "current_status": "STATUS_LOCAL",
        "current_phase_id": 1,
        "rc_response": {
            "uuid": "850f1241-870d-4045-a606-aa2fb1508e1f",
            "result": {
                "status": 1,
                "description": "OK_STATUS"
            },
            "status_msg": {
                "uuid": "850f1241-870d-4045-a606-aa2fb1508e1f",
                "rc_id": 99910,
                "prevStatus": 11,
                "nextStatus": 11,
                "source": 3,
                "mode": 13,
                "prevPhaseID": 1,
                "nextPhaseID": 1
            },
            "protocol": 1,
            "type": 2
        }
    }

]
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
                    return data1
                },
                description: 'Запросить все инфу',
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

                    const data1 = await request.requestApi('POST',id+'/forward_next_phase', {},{})
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
    }
}