const fs = require('fs');
const path = require('path');
import threeCommasAPI from "../commas";

const getProfit = async query => {
    const reqToken = query.token;
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
    const stats = await Promise.all([
        api.getBotsStats({ account_id: 29518185, bot_id: 4427236}),
        api.getBotsStats({ account_id: 29518185, bot_id: 5023500})
    ]);
    // check for errors
    if (stats.length > 1 && stats[0].error && stats[0].error !== ''){
        //@ts-ignore
        throw new Error(data.error);
    }
    return stats
        .map(e => e.profits_in_usd.today_usd_profit)
        .reduce((prev, curr) => {
            return prev + curr;
        }, 0);
}


export default async (req, res) => {
    
    // check if there is a payload
    if(!req.query) return res.status(400).send('provide a query string params');
    try {
        const data = await getProfit(req.query)
        //@ts-ignore
        return res.status(200).send({profit: data});
    } catch (e) {
        if (e === 'unauthorized') return res.status(403);
        console.log(e);
        return res.status(400).send(e.message);
    }
}