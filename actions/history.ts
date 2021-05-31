import threeCommasAPI from "../commas";
import ConfigFile from "../config/ConfigFile";
import sendSlackMessage from "../slack";
import Connection from "../user/Connection";
import User from "../user/user";
import UserConfig from "../user/UserConfig";
import version from '../version';
import database from '../database';
import config from '../config.json';
import e from "express";

const getSafetyTrade = (message:string) => {
    const regex = /Safety trade (.*?) executed/gm;
    const m = regex.exec(message);
    let str;
    if (m === null){
        console.error('Could not find saftey trade message');
        return;
    }
    if (m.length > 1) {
        str = m[1];
    }
    return str;
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const round = (num) => {
    return Math.ceil(num * 100) / 100;
}

const getProfitStockpilingUsd = (message:string) => {
    const regex = /USD \((.*?) \$\)/gm;
    const m = regex.exec(message);
    let profit = '';
    if (m === null){
        console.error('Could not find profit number');
        return;
    }
    if (m.length > 1) {
        profit = m[1];
    }
    return profit;
}

const getProfitStockpiling = (message:string) => {
    const regex = /Profit: \+(.*?) ([^\s]+)/gm;
    const m = regex.exec(message);
    let profit = 0;
    if (m === null){
        console.error('Could not find profit number');
        return;
    }
    if (m.length > 1) {
        profit = Number.parseFloat(m[1]);
    }
    return `${profit} ${m[2]} ($${getProfitStockpilingUsd(message)} USD)`;
}

const getProfit = (message:string) => {
    const regex = /[\s\S]*\+(.*?) USD/gm;
    const m = regex.exec(message);
    let profit = 0;
    if (m === null){
        console.error('Could not find profit number');
        return;
    }
    if (m.length > 1) {
        profit = Number.parseFloat(m[1]);
        profit = round(profit);
    }
    return profit;
}

const getTime = (message:string) => {
    const regex = /#profit (.*)/gm;
    const m = regex.exec(message);
    let time = '';
    if (m === null){
        console.error('Could not find time');
        return;
    }
    if (m.length > 1) {
        time = m[1];
    }
    return time;
}

const updateLastRun = (key, value, database) => {
    database.lastRun.set(key, value);
}

const sendToSlackProfit = (message:string, channel:string, slackToken:string, isStockpiling) => {
    const profit = isStockpiling ? getProfitStockpiling(message) : '$' + getProfit(message);
    const time = getTime(message);
    return sendSlackMessage(`${profit} in ${time}`, channel, slackToken);
}

const sendToSlackHistory = (message:string, channel:string, slackToken:string) => {
    return sendSlackMessage(message, channel, slackToken);
}

const getSafetyTradeMessage = (events, i) => {
    let lastSafteyTrade = '(no saftey trades)';
    let safetyTrade = false;
    while(i < events.length) {
        if(events[i].message.search('#profit') !== -1) {
            safetyTrade = true;
        }
        if(events[i].message.search('Safety trade') !== -1 && safetyTrade) {
            return getSafetyTrade(events[i].message);
        }
        if(events[i].message.search('Starting new deal') !== -1) {
            return lastSafteyTrade;
        }
    }
    return lastSafteyTrade;
}

// To test 2 hours ago use the following and replace lastRunDate
const ONE_HOUR = 60 * 60 * 1000;

const history = async (config:ConfigFile) => {
    let userConfig: UserConfig;
    for (userConfig of config.users) {
        const user = new User(userConfig);
        const api = new threeCommasAPI({
            apiKey: user.commasApiKey,
            apiSecret: user.commasSecret,
        });
        console.log('calling show bot for bot ', user.botId);
        try {
            const data = await api.botShow({
                bot_id: user.botId,
                include_events: true
            });
            const lastEvent = data.bot_events[0];
            const key = String(user.botId);
            
            // To test 2 hours ago use the following and replace lastRunDate
            //let lastRunDate = new Date(new Date().getTime() - ONE_HOUR*.5);
            let lastRunDate = database.lastRun.get(key);
            
            if (!lastRunDate) {
                lastRunDate = new Date()
                updateLastRun(key, new Date(), database);
                continue;
            }
            console.log(`[runJob][v${version}] lastRunDate=${lastRunDate}`);
            const botEvents = data.bot_events
                .filter((e:any) => new Date(e.created_at).valueOf() > new Date(lastRunDate).valueOf())
                .filter((e:any) => e.message.search('Cancelling buy order') === -1 && e.message.search('Placing safety trade') === -1)
                .reverse();

            console.log('bot-events: ' + data.bot_events.length);
            let i = 0;
            for (let event of botEvents) {
                console.log(i)
         
                let updated = false;
                user.connections
                    .filter(x => x.connection === 'history' && x.source === '3commas' && x.destination === 'slack')
                    .every(async (connection: Connection) => {
                        await sendToSlackHistory(event.message, connection.channelName, user.slackToken);
                        updated = true;
                    });

                user.connections
                    .filter(x => x.connection === 'profit' && x.source === '3commas' && x.destination === 'slack' && event.message.search('#profit') !== -1)
                    .every(async (connection: Connection) => {
                        await sendToSlackProfit(event.message, connection.channelName, user.slackToken, connection?.isStockpiling);
                        updated = true;
                    });
                if (updated) {
                    updateLastRun(key, new Date(event.created_at), database);
                }
                i++;
            }
        } catch(e) {
            console.error(e);
        }
    }
}

/* TODO: write a test to make sure this runs */
const test = () => {
    const lastEvent = {
        created_at: new Date(Date.UTC(2021, 2, 7, 0, 50, 0))
    }
}

const historyAction = async (req, res) => {
    try {
        await history(config);
        return res.status(200).send('Done');
    } catch(e) {
        console.error(e);
        return res.status(500);
    }
}

export default historyAction;