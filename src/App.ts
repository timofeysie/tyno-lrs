import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import HeroRouter from './routes/HeroRouter';
import WikiRouter from './routes/WikiRouter';
// Creates and configures an ExpressJS web server.
class App {
  public express: express.Application;
  constructor() {
    this.express = express();
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
    this.express.use('/', router);
    this.express.use('/api/v1/heroes', HeroRouter);
    this.express.use('/api/v1/wiki', WikiRouter);
  }
}
export default new App().express;