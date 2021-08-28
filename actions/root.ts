const path = require('path');

export default (req, res) =>{
    return res.sendFile(path.join(__dirname+'/../pages/index.html'));
}