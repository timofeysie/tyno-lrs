import {Router, Request, Response, NextFunction} from 'express';
const Heroes = require('../data');
export class HeroRouter {
    router: Router
    constructor() {
        this.router = Router();
        this.init();
    }

    /** GET one hero by id */
    public login(req: Request, res: Response, next: NextFunction) {
        console.log('req',req);
        if (req) {
            res.status(200)
            .send({
                message: 'Success',
                status: res.status,
            });
        }
        else {
            res.status(404)
            .send({
                message: 'No hero found with the given id.',
                status: res.status
            });
        }
    }

    /**  GET all Heroes. */
    public getAll(req: Request, res: Response, next: NextFunction) {
        res.send(Heroes);
    }

    /** GET one hero by id */
    public getOne(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);
        let hero = Heroes.find(hero => hero.id === query);
        if (hero) {
            res.status(200)
            .send({
                message: 'Success',
                status: res.status,
                hero
            });
        }
        else {
            res.status(404)
            .send({
                message: 'No hero found with the given id.',
                status: res.status
            });
        }
    }

    /** Take each handler, and attach to one of the Express.Router's endpoints. */
    init() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne);
        this.router.post('/login', this.login);
    }
}

// Create the HeroRouter, and export its configured Express.Router
const heroRoutes = new HeroRouter();
heroRoutes.init();

export default heroRoutes.router;
