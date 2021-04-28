import rootAction from './actions/root';
import healthAction from './actions/health';
import historyAction from './actions/history';
import signalAction from './actions/signal';

export default app => {
    app.get('/history', historyAction);
    app.get('/health', healthAction);
    app.get('/', rootAction);
    app.post('/', signalAction);
}