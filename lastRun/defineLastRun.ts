import ConfigFile from "../config/ConfigFile";
import UserConfig from "../user/UserConfig";
import LastRun from "./LastRun";

const fs = require('fs');
const path = './lastRun/data/lastRun.json';
const fromBeginning = false ? Date.UTC(0, 0, 0, 0, 0, 0) : '';


export default (config:ConfigFile, database) => {
    const lastRun = database.get('lastRun');
    config.users.forEach((userConfig:UserConfig) => {
        lastRun[userConfig.commasApiKey] = new Date(fromBeginning);
    })
    const data = JSON.stringify(lastRun);
    fs.writeFileSync(path, data);
}