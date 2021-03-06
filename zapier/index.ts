/*
function integrateZapier(payload, zapierHook){
    return new Promise((resolve, reject) => {
        if(config.env === 'production') {
            request.post({json: payload, url: zapierHook}, function (error, response, body) {
                if (!error && error != null) {
                    console.error(error);
                    return reject(body);
                } else {
                    console.log(body);
                    return resolve(body);
                }
            });
        }else{ return resolve({}); }
    });
}*/