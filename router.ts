import rootAction from './actions/root';
import healthAction from './actions/health';
import historyAction from './actions/history';

export default app => {
    app.get('/history', historyAction);
    app.get('/health', healthAction);
    app.get('/', rootAction);
}