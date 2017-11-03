import {Router, Request, Response, NextFunction} from 'express';

export class LoginRouter {
    router: Router
    constructor() {
        this.router = Router();
        this.init();
    }

    /** GET login */
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
                message: 'Failed',
                status: res.status
            });
        }
    }

    init() {
        console.log('login ready');
        this.router.post('/', this.login);
    }
}

const loginRoutes = new LoginRouter();
loginRoutes.init();

export default loginRoutes.router;
