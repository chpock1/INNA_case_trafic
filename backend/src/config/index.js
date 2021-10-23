const nconf =require("nconf");
const path =require("path");
const configs = new nconf.Provider({
    env: true,
    argv: true,
    store: {
        type: "file",
        file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
    }
});

const getModulesConfig=()=> {
    return configs.get("modules");
};
const getServerConfigs=()=> {
    return configs.get("server");
};
const getSwaggerConfigs=()=> {
    return configs.get("swagger");
};
module.exports= {getModulesConfig,getServerConfigs,getSwaggerConfigs};