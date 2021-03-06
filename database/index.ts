class Database {
    lastRun: any;

    constructor() {
        this.lastRun = new Map() as any;
    }

    flush() {
        this.lastRun = new Map() as any;
    }
}

export default new Database();