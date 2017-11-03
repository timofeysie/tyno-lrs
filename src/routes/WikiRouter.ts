import { Router, Request, Response, NextFunction } from 'express';
import { Wikidata } from '../wikidata/wikidata';
const wdk = require('wikidata-sdk');
const url = wdk.searchEntities('Ingmar Bergman');
import * as http from 'http';
export class WikiRouter {
    router: Router
    constructor() {
        this.router = Router();
        this.init();
    }

    public getWDKEntities() {
        const ids = 'Q571' // could also be several ids as an array: ['Q1', 'Q5', 'Q571']
        const languages = ['en', 'kr'] // returns all languages if not specified
        const props = ['info', 'claims'] // returns all data if not specified
        const format = 'json' // defaults to json
        const url = wdk.getEntities(ids, languages, props, format)
        console.log('url2',url);
    }

    public test(req: Request, res: Response, next: NextFunction) {
        // const search = 'List of cognitive biases'
        // const language = 'en' // will default to 'en'
        // const limit = 10 // defaults to 20
        // const format = 'json' // defaults to json
        // const url = wdk.searchEntities(search, language, limit, format);

        // const url3 = wdk.getWikidataIdsFromSitelinks({
        //     titles: 'List of cognitive biases',
        //     sites: 'enwiki',
        //     languages: ['en'],
        //     props: ['info', 'claims'],
        //     format: 'json'
        // });
        // console.log('url3',url3);
        

        // //console.log('url',url);
        
        // //const ids = 'Q571' // could also be several ids as an array: ['Q1', 'Q5', 'Q571']
        // const search2 = 'List of cognitive biases';
        // const languages = ['en'] // returns all languages if not specified
        // const props = ['info'] // returns all data if not specified
        // const format2 = 'json' // defaults to json
        // const url2 = wdk.searchEntities(search2, languages, props, format)
        // console.log('url2',url2);
        let url = wdk.searchEntities({
            search: 'List of cognitive biases',
            format: 'json',
            language: 'en'});
        console.log('url',url);
        const url2 = wdk.getEntities({
            ids: ['Q1', 'Q5', 'Q571'],
            languages: ['en', 'fr', 'de'], // returns all languages if not specified
            props: ['info', 'claims'], // returns all data if not specified
            format: 'xml' // defaults to json
        });
        console.log('url2',url2);


        if (req) {
            res.status(200)
            .send({
                message: 'Success~',
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

    public getAll(req: Request, res: Response, next: NextFunction) {
        let wiki = new Wikidata();
        let biasUrl = wiki.getDataUrl('bias');
        console.log('bias',biasUrl);
        http.get(biasUrl, (res: any) => {
            console.log('res',res);
            const statusCode = res.statusCode;
            const contentType = res.headers['content-type'];
            console.log('res',res);
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                                `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    res.send(parsedData);
                    console.log('parsed',parsedData);
                } catch (e) {
                    res.send(rawData);
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    }

    public getOne(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);
        // let hero = Heroes.find(hero => hero.id === query);
        // if (hero) {
        //     res.status(200)
        //     .send({
        //         message: 'Success',
        //         status: res.status,
        //         hero
        //     });
        // } else {
        //     res.status(404)
        //     .send({
        //         message: 'No hero found with the given id.',
        //         status: res.status
        //     });
        // }
    }

    /** Take each handler, and attach to one of the Express.Router's endpoints. */
    init() {
        this.router.get('/test', this.test);
        this.router.get('/:id', this.getOne);
    }
    
}

// Create the HeroRouter, and export its configured Express.Router
const wikiRoutes = new WikiRouter();
wikiRoutes.init();

export default wikiRoutes.router;
