// Import necessary config file. TODO: encrypt api information
import config from './config.json';
import ConfigFile from './config/ConfigFile';
import User from './user/user';
import UserConfig from './user/UserConfig';
import Connection from './user/Connection';
import defineLastRun from './lastRun/defineLastRun';
import sendSlackMessage from './slack';
import database from './database';

import threeCommasAPI from './commas';
import { stringify } from 'querystring';
const interval = 1000*30;
const version = 1.3;


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

const sendToSlackProfit = (message:string, channel:string, slackToken:string) => {
    const profit = getProfit(message);
    const time = getTime(message);
    return sendSlackMessage(`$${profit} in ${time}`, channel, slackToken);
}

const sendToSlackHistory = (message:string, channel:string, slackToken:string) => {
    return sendSlackMessage(message, channel, slackToken);
}

const updateLastRun = (event, key) => {
    database.lastRun.set(key, new Date(event.created_at));
}

const runMinuteJob = (config:ConfigFile) => () => {
    config.users.forEach((userConfig:UserConfig) => {
        const user = new User(userConfig);
        const api = new threeCommasAPI({
            apiKey: user.commasApiKey,
            apiSecret: user.commasSecret,
        });
        
        api.botShow({
            bot_id:user.botId,
            include_events: true
        }).then((data: any) => {
            const lastEvent = data.bot_events[0];
            const key = user.commasApiKey + String(user.botId);
            let lastRunDate = database.lastRun.get(key);
            console.log(`${version} lastRunDate=${lastRunDate}`);
            if (!lastRunDate) {
                lastRunDate = new Date(lastEvent.created_at)
                database.lastRun.set(key, new Date(lastEvent.created_at));
            }
            const botEvents = data.bot_events
                .filter((e:any) =>  new Date(e.created_at).valueOf() > new Date(lastRunDate).valueOf())
                .reverse();
                botEvents.forEach((event: any) => {
                    user.connections.forEach((connection: Connection) => {
                        if(connection.connection === 'history'
                            && connection.source === '3commas'
                            && connection.destination === 'slack'
                            && connection.channelName === 'history') {
                                sendToSlackHistory(event.message, connection.channelName, user.slackToken).then((data: any)=>{
                                    updateLastRun(event, key);
                                }).catch((e: any) => {
                                    console.error(e);
                                });
                        }
                        if(connection.connection === 'profit'
                            && connection.source === '3commas'
                            && connection.destination === 'slack'
                            && connection.channelName === 'profit'
                            && event.message.search('#profit') !== -1) {
                                sendToSlackProfit(event.message, connection.channelName, user.slackToken).then((data)=>{
                                    updateLastRun(event, key);
                                }).catch((e) => {
                                    console.error(e);
                                });
                        }
                    })
                })
        });
    });
}
/* TODO: write a test to make sure this runs */
const test = () => {
    const lastEvent = {
        created_at: new Date(Date.UTC(2021, 2, 7, -7, 0, 0))
    }
}

console.log(`deploying jarvis worker ${version}`);
setInterval(runMinuteJob(config), interval);
runMinuteJob(config)()

