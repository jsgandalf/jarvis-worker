const fs = require('fs');
const path = require('path');
import threeCommasAPI from "../commas";

const getAccountStats = async query => {
    const reqToken = query.token;
    const reqAccount = query.accountId;
    const reqKey = query.key;
    const reqSecret = query.secret;
    // check for a passed token
    if (!reqToken) throw new Error('provide a token');

    // validate token
    if (process.env.APPLE_WATCH_TOKEN !== reqToken) throw new Error('unauthorized');
    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    if (reqKey) {
        creds.apiKey = process.env[reqKey];
        creds.apiSecret = process.env[reqSecret];
    }

    const api = new threeCommasAPI(creds);
    const stats = await api.getAccount(reqAccount);


    return {
        day_profit_usd: stats.day_profit_usd,
        day_profit_usd_percentage: stats.day_profit_usd_percentage,
        usd_amount: stats.usd_amount,
    };
}


export default async (req, res) => {
    
    // check if there is a payload
    if(!req.query) return res.status(400).send('provide a query string params');
    try {
        const data = await getAccountStats(req.query)
        //@ts-ignore
        return res.status(200).send({profit: data});
    } catch (e) {
        if (e === 'unauthorized') return res.status(403);
        console.log(e);
        return res.status(400).send(e.message);
    }
}