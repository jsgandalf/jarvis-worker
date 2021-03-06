const slack = require('slack');

const sendSlackMessage = (message:string, channel:string, slackToken: any) => {
    return new Promise((resolve, reject) => {
        slack.chat.postMessage({token:slackToken, channel:channel, text: message}, (err: any, data: unknown) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

export default sendSlackMessage;