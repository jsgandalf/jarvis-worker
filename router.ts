import rootAction from './actions/root';
import healthAction from './actions/health';
import historyAction from './actions/history';
import signalAction from './actions/signal';
import profitAction from './actions/profit';
import updateBot from './actions/updateBot';
import login from './actions/login';
import createBot from './actions/createBot';

export default app => {
    app.get('/history', historyAction);
    app.get('/health', healthAction);
    app.get('/profit', profitAction);
    app.get('/', rootAction);
    app.post('/', signalAction);
    // Comment back in when you want to modify bots
    app.put('/bot', updateBot);
    app.post('/login', login);
    //app.post('/bot', createBot);
}