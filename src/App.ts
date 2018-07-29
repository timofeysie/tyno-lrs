import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import HeroRouter from './routes/HeroRouter';
import WikiRouter from './routes/WikiRouter';
import LoginRouter from './routes/LoginRouter';
var https = require('https');
var fs = require('fs');
const SSL_PORT = (process.env.PORT || 3000);

class App {
  public express: express.Application;
  constructor() {
    this.express = express();
    var sslOptions = {
      // key: fs.readFileSync('key.pem'),
      // cert: fs.readFileSync('cert.pem'),
      passphrase: 'four'
  };
  https.createServer(sslOptions, this.express).listen(SSL_PORT)
    this.middleware();
    this.routes();
  }
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }
  // Configure API endpoints.
  private routes(): void {
    /* API endpoints */
    let router = express.Router();
    // placeholder route handler
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Hello World!'
      });
    });
    console.log('deal with it');
    
    this.express.use('/', router);
    this.express.use('/api/v1/login', LoginRouter);
    this.express.use('/api/v1/heroes', HeroRouter);
    this.express.use('/api/v1/wiki', WikiRouter);
  }
}
export default new App().express;