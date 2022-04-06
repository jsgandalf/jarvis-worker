import threeCommasAPI from "../commas";
import ConfigFile from "../config/ConfigFile";
import sendSlackMessage from "../slack";
import Connection from "../user/Connection";
import User from "../user/user";
import UserConfig from "../user/UserConfig";
import version from '../version';
import database from '../database';

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

const sendToSlackProfit = (message:string, channel:string, slackToken:string) => {
    const profit = getProfit(message);
    const time = getTime(message);
    return sendSlackMessage(`$${profit} in ${time}`, channel, slackToken);
}

const sendToSlackHistory = (message:string, channel:string, slackToken:string) => {
    return sendSlackMessage(message, channel, slackToken);
}

const stats = async (config:ConfigFile) => {
    let userConfig: UserConfig;
    for (userConfig of config.users) {
        const user = new User(userConfig);
        const api = new threeCommasAPI({
            apiKey: user.commasApiKey,
            apiSecret: user.commasSecret,
        });
        console.log('calling stats bot for bot ', user.botId);
        try {
            const data = await api.getBotsStats({
                bot_id:user.botId,
            });
            console.log(data.profits_in_usd.overall_usd_profit);
            console.log(data.profits_in_usd.today_usd_profit);
            console.log(data.profits_in_usd.active_deals_usd_profit);
            throw 'not done  here';
            const lastEvent = data.bot_events[0];
            const key = user.commasApiKey + String(user.botId);
            let lastRunDate = database.lastRun.get(key);
            console.log(`[runJob][v${version}] lastRunDate=${lastRunDate}`);
            if (!lastRunDate) {
                lastRunDate = new Date(lastEvent.created_at)
                updateLastRun(key, new Date(lastEvent.created_at), database);
            }
            const botEvents = data.bot_events
                .filter((e:any) =>  new Date(e.created_at).valueOf() > new Date(lastRunDate).valueOf())
                .reverse();
            
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
                            promises.push(sendToSlackProfit(event.message, connection.channelName, user.slackToken));
                    }
                    await Promise.all(promises);
                }
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

export default stats;