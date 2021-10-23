const request=require('request');
const optionsRequest={
    url:'https://api.via-dolorosa.ru/rc/'
};

module.exports = {
    requestApi: async (method,url,formData,headers)=>{
        const options={
            method: method,
            url: optionsRequest.url + encodeURI(url),
            body:formData,
            headers:headers===undefined?{}:headers,
            json: true
        }
        return await new Promise((resolve)=>{
            request(options,function (err, resp, body){
                if(err) resolve(err);
                resolve(body);
            })
        })
    }
};
