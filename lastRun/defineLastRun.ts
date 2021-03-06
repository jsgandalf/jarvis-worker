import ConfigFile from "../config/ConfigFile";
import UserConfig from "../user/UserConfig";
import LastRun from "./LastRun";

const fs = require('fs');
const path = './lastRun/data/lastRun.json';

export default (config:ConfigFile) => {
    try {
        JSON.parse(fs.readFileSync(path));
    } catch(e) {
        const lastRun = {} as LastRun;
        config.users.forEach((userConfig:UserConfig) => {
            lastRun[userConfig.commasApiKey] = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
        })
        const data = JSON.stringify(lastRun);
        fs.writeFileSync(path, data);
    }
}