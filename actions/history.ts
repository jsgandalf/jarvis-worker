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


const getProfit = (message:string) => {
    const regex = /\+(.*?)USD/gm;
    const m = regex.exec(message);
    let profit = 0;
    if (m === null){
        console.error('Could not find profit number');
        return;
    }
    if (m.length > 1) {
        profit = parseInt(m[1], 10);
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

const sendToSlackProfit = (message:string, safetyTrade:string, channel:string, slackToken:string) => {
    const profit = getProfit(message);
    const time = getTime(message);
    return sendSlackMessage(`$${profit} in ${time} executed ${safetyTrade}`, channel, slackToken);
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
                bot_id:user.botId,
                include_events: true
            });
            const lastEvent = data.bot_events[0];
            const key = user.commasApiKey + String(user.botId);
            let lastRunDate = database.lastRun.get(key);
            console.log(`[runJob][v${version}] lastRunDate=${lastRunDate}`);
            if (!lastRunDate) {
                lastRunDate = new Date(lastEvent.created_at)
                updateLastRun(key, new Date(lastEvent.created_at), database);
            }
            const botEvents = data.bot_events
                .filter((e:any) => new Date(e.created_at).valueOf() > new Date(lastRunDate).valueOf())
                .filter((e:any) => e.message.search('Cancelling buy order') === -1 && e.message.search('Placing safety trade') === -1)
                .reverse();

            const botEventsSafety = data.bot_events
                .filter((e:any) => e.message.search('Safety trade') !== -1)
                .map(({message}) => message);

        
            let i = 0;
            for (let event of botEvents) {
                let connection: Connection;
                for (connection of user.connections) {
                    let promises = [];
                    if(connection.connection === 'history'
                        && connection.source === '3commas'
                        && connection.destination === 'slack'
                        && connection.channelName === 'history') {
                            promises.push(sendToSlackHistory(event.message, connection.channelName, user.slackToken));
                            updateLastRun(key, new Date(event.created_at), database);
                    }
                    if(connection.connection === 'profit'
                        && connection.source === '3commas'
                        && connection.destination === 'slack'
                        && connection.channelName === 'profit'
                        && event.message.search('#profit') !== -1) {
                            const lastSafetyTrade = getSafetyTradeMessage(botEvents, i);
                            console.log(lastSafetyTrade);
                            promises.push(sendToSlackProfit(event.message, lastSafetyTrade, connection.channelName, user.slackToken));
                    }
                    await Promise.all(promises);
                }
                i+=1;
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