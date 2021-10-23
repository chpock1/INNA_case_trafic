const Hapi = require('@hapi/hapi');
const ip = require("ip");

const init = async (configs) => {
    const host = ip.address() || configs.server.host;
    const port = process.env.PORT || configs.server.port;
    const server = new Hapi.Server({
        debug: { request: ['error'] },
        host:host,
        port: port,
        routes: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-with','x-custom-header']
            }
        }
    });
    for(const plugin of configs.server.plugins){
        await require('./plugin/'+plugin).register(server,configs);
    }
    for(const module of configs.server.modules){
        await server.register({plugin:require('./api/'+module),options:{configs:configs.modules,func:require('./function')}});
    }
    await server.register({plugin:require('./api/index'),options:{configs:configs.modules,func:require('./function/index')}});
    return server;
};
module.exports={init};