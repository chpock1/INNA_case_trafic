const Joi = require('joi');
const request = require('./restAPI');

const arrLights=['2','99901','99902','99903','99904','99905','99906','99907','99908','99909','99910']

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
                    return{err:false}
                },
                description: 'Запросить статус ',
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
        server.route({
            method: 'GET',
            path: '/status/{id}',
            config: {
                async handler(req) {
                    const {id}=req.params
                    const data1 = await request.requestApi('GET',id+'/status',[],{})
                    console.log(data1)
                    return{err:false}
                },
                description: 'Проверка',
                tags: ['api'],
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().min(1)
                    })
                },
                auth:false
            }
        });

    }
}