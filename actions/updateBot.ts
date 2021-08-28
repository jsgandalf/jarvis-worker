const fs = require('fs');
const path = require('path');
import threeCommasAPI from '3commas-api-node';

const getBot = (api, reqBotId) => {
    return api.botShow(reqBotId);
}

const updateBot = (api, bot, reqUseTradingView) => {
    
    const strategy_list = JSON.parse(reqUseTradingView) ? 
        JSON.stringify([{'options':{'time':'1m', 'type':'buy_or_strong_buy'}, 'strategy':'trading_view'}]) :
        JSON.stringify([{ "strategy": "manual" }]);

    
    const bot_id = bot.id;
    const name = bot.name;
    const pairs = JSON.stringify(bot.pairs);
    const base_order_volume = bot.base_order_volume;
    const base_order_volume_type = bot.base_order_volume_type;
    const max_active_deals = bot.max_active_deals;
    const take_profit = bot.take_profit;
    const safety_order_volume = bot.safety_order_volume;
    const safety_order_volume_type = bot.safety_order_volume_type;
    const max_safety_orders = bot.max_safety_orders;
    const active_safety_orders_count = bot.active_safety_orders_count;
    const trailing_enabled = bot.trailing_enabled;
    const strategy = bot.strategy;
    const safety_order_step_percentage = bot.safety_order_step_percentage;
    const take_profit_type = bot.take_profit_type;
    const profit_currency = bot.profit_currency;
    const start_order_type = bot.start_order_type;
    const martingale_step_coefficient = bot.martingale_step_coefficient;
    const martingale_volume_coefficient = bot.martingale_volume_coefficient;
    return api.botUpdate({
        bot_id,
        name,
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

    const reqBotId = req.body.botId;
    const reqUseTradingView = req.body.useTradingView;
    const reqKey = req.body.key;
    const reqSecret= req.body.secret;

    const creds = {
        apiKey: process.env.THREE_COMMAS_API_KEY,
        apiSecret: process.env.THREE_COMMAS_API_SECRET,
    };
    if (reqKey && reqSecret) {
        creds.apiKey = process.env[reqKey];
        creds.apiSecret = process.env[reqSecret];
    }
    const api = new threeCommasAPI(creds);
    return getBot(api, reqBotId).then((bot) => {
        return updateBot(api, bot, reqUseTradingView);
    }).then((data) => {
        //@ts-ignore
        if(data.error && data.error !== '') {
            //@ts-ignore
            console.error(data)
            throw data.error;
        }
        res.status(200).send(data);
    }).catch((error) => {
        console.error(error);
        return res.send(error);
    });
}