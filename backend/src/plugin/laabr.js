const register = async (server)=> {
    try {
        return await server.register([{
            plugin: require('laabr'),
            options: {
                formats: {
                    onPostStart: ':time[utc] :start :level :message' ,
                    log:':time[utc] :level :message',
                    request:':time[utc] :level :message',
                    response:':time[utc] :method :remoteAddress :url :payload :status (:responseTime ms)',
                    'request-error':':time[utc] :level :error'
                },
                tokens: { start:  () => '[start]' },
                indent: 0
            }
        }
        ]);
    } catch (err) {
        console.log(`Ошибка при регистрации плагина laabr: ${err}`);
    }
};
module.exports={register};