import Connection from "./Connection";

export default interface UserConfig {
    commasApiKey: string;
    commasSecret: string;
    slackToken: string,
    botId: number,
    connections: Connection[];
}