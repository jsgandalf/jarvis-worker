const path = require('path');

export default (req, res) => {
    return res.sendFile('index.html', { root: __dirname });
}