const fs = require('fs');
const path = require('path');
import threeCommasAPI from '3commas-api-node';

const startNewDeal = (botId, reqPair, api) => {
    const payload = {
        bot_id: botId,
    }
    if (reqPair) {
        //@ts-ignore
        payload.pair = reqPair;
    }
    return api.botStartNewDeal(payload)
}


export default (req, res) => {
    
    // check if there is a payload
    if(!req.body) return res.status(400).send('provide a body');

    const reqToken = req.body.token;
    const reqBotId = req.body.botId;
    const reqPair = req.body.pair;

    // check for a passed token
    if(!reqToken) return res.status(400).send('provide a token');

    // validate token
    if (process.env.token !== reqToken) return res.status(403);
    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    const api = new threeCommasAPI(creds);
    const promises = Array.isArray(reqBotId) ? reqBotId.map(id => startNewDeal(id, reqPair, api)) : [startNewDeal(reqBotId, reqPair, api)];
    Promise.all(promises).then((data) => {
        //@ts-ignore
        if(data.error && data.error !== '') {
            //@ts-ignore
            throw data.error;
        }
        res.status(200).send(data);
    }).catch((error) => {
        console.error(error);
        return res.send(error);
    });
    return res.status(501);
}