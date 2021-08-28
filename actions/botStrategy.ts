const fs = require('fs');
const path = require('path');
import threeCommasAPI from '3commas-api-node';

const getBot = (api, reqBotId) => {
    return api.botShow(reqBotId);
}

export default (req, res) => {
    
    // check if there is a payload
    if(!req.body) return res.status(400).send('provide a body');

    const reqBotId = req.query.botId;
    const reqKey = req.query.key;
    const reqSecret = req.query.secret;

    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    if (reqKey && reqSecret) {
        creds.apiKey = process.env[reqKey];
        creds.apiSecret = process.env[reqSecret];
    }
    const api = new threeCommasAPI(creds);
    
    return getBot(api, reqBotId).then((data) => {
        //@ts-ignore
        if(data.error && data.error !== '') {
            //@ts-ignore
            throw data.error;
        }
        return res.json({strategy: data.strategy_list });
    }).catch((error) => {
        console.error(error);
        return res.send(error);
    });
}