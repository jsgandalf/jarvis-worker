const fs = require('fs');
const path = require('path');
import threeCommasAPI from '3commas-api-node';
import { CLIENT_RENEG_WINDOW } from 'node:tls';

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

const processDeal = body => {
    const reqToken = body.token;
    const reqBotId = body.botId;
    const reqPair = body.pair;
    const reqKey = body.key;
    const reqSecret = body.secret;
    // check for a passed token
    if (!reqToken) throw new Error('provide a token');

    // validate token
    if (process.env.token !== reqToken) throw new Error('unauthorized');
    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    if (reqKey) {
        creds.apiKey = process.env[reqKey];
        creds.apiSecret = process.env[reqSecret];
    }
    const api = new threeCommasAPI(creds);
    const promises = Array.isArray(reqBotId) ? reqBotId.map(id => startNewDeal(id, reqPair, api)) : [startNewDeal(reqBotId, reqPair, api)];
    return Promise.all(promises);
}


export default async (req, res) => {
    
    // check if there is a payload
    if(!req.body) return res.status(400).send('provide a body');
    try {
        let promises;
        if (Array.isArray(req.body) && req.body.length > 0) {
            promises = req.body.map((payload => processDeal(payload)));
        } else {
            promises.push(processDeal(req.body));
        }
        const data = await Promise.all(promises);
        console.log(data);
        //@ts-ignore
        if (data.error && data.error !== '') {
            //@ts-ignore
            throw new Error(data.error);
        }
        return res.status(200).send(data);
    } catch (e) {
        if (e === 'unauthorized') return res.status(403);
        return res.status(400).send(e.message);
    }
}