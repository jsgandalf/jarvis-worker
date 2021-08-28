import rootAction from './actions/root';
import healthAction from './actions/health';
import historyAction from './actions/history';
import signalAction from './actions/signal';
import profitAction from './actions/profit';
import updateBot from './actions/updateBot';
import login from './actions/login';
import dashboard from './actions/dashboard';
import botStrategy from './actions/botStrategy';
import auth from './middleware/auth';

export default app => {
    app.get('/history', historyAction);
    app.get('/health', healthAction);
    app.get('/profit', profitAction);
    app.get('/', rootAction);
    app.post('/', signalAction);
    app.post('/login', login);
    app.get('/dashboard', dashboard);
    app.get('/bot/strategy', auth, botStrategy);
    app.put('/bot/strategy', auth, updateBot);
}