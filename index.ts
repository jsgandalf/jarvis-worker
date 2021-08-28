import config from './config.json';
import express from 'express';
import version from './version';
import router from './router';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.set('views', __dirname + '/public/pages');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cors());
// TODO remove bodyParser it is deprecated
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))


if (config?.users?.length < 1){
    throw 'Must define a user in the config';
}

router(app);

app.listen(port, () => console.log(`Jarvis Worker v${version} listening on port ${port}!`));

