const Joi = require('joi');

exports.plugin = {
    name: 'index',
    version: '0.0.1',
    register: async (server,options) => {
        server.route({
            method: 'GET',
            path: '/',
            config: {
                async handler(req) {
                },
                description: 'Проверка',
                tags: ['api']
            }
        });
    }
}