const fs = require('fs');
const path = require('path');
import threeCommasAPI from '3commas-api-node';

const createBot = (api, reqAccountId, pairs) => {
    const orderType = 'percent';
    const base_order_volume = 1.9;
    const base_order_volume_type = orderType;
    const max_active_deals = 1;
    const take_profit = 0.4;
    const safety_order_volume = 0.37;
    const safety_order_volume_type = orderType;
    const max_safety_orders = 8;
    const active_safety_orders_count = 8;
    const trailing_enabled = false;
    const strategy = 'long';
    const safety_order_step_percentage = 0.21;
    const take_profit_type = 'total';
    const strategy_list = JSON.stringify([{ "strategy": "manual" }]);
    const profit_currency = 'quote_currency'; // can be 'base_currency'
    const start_order_type = 'limit';
    const martingale_step_coefficient = 1.6;
    const martingale_volume_coefficient = 2.0;
    return api.botCreate({
        name: 'Percent Composite ADA, BNB, ETH, BTC, LTC',
        account_id: reqAccountId,
        pairs,
        max_active_deals,
        base_order_volume,
        base_order_volume_type,
        take_profit,
        safety_order_volume,
        safety_order_volume_type,
        max_safety_orders,
        active_safety_orders_count,
        trailing_enabled,
        strategy,
        safety_order_step_percentage,
        take_profit_type,
        strategy_list,
        profit_currency,
        start_order_type,
        martingale_step_coefficient,
        martingale_volume_coefficient
    });
}

export default (req, res) => {
    
    // check if there is a payload
    if(!req.body) return res.status(400).send('provide a body');

    const reqToken = req.body.token;
    const reqAccountId = req.body.accountId;
    //const reqPair = req.body.pair;

    const pairs = 'USD_ADA, USD_BNB, USD_BTC, USD_ETH, USD_LTC';

    // check for a passed token
    if(!reqToken) return res.status(400).send('provide a token');

    // validate token
    if (process.env.token !== reqToken) return res.status(403);
    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    const api = new threeCommasAPI(creds);

    return createBot(api, reqAccountId, pairs).then((data) => {
        console.log(data);
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