const fs = require('fs');
const path = './lastRun/data/lastRun.json';
export default class User {
    [x: string]: any;
    constructor(config: any) {
        // assign all the config keys as part of the class
        Object.assign(this, config);
    }

    setLastRun(){
        const lastRun = JSON.parse(fs.readFileSync(path));
        lastRun[this.commasApiKey] = new Date();
        fs.writeFileSync(path, JSON.stringify(lastRun));   
    }
    
    getLastDate(){
        const lastRun = JSON.parse(fs.readFileSync(path));
        return lastRun[this.commasApiKey]
    }


}