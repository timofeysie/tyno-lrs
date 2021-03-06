import { Router, Request, Response, NextFunction } from 'express';
import { Wikidata } from '../wikidata/wikidata';
const wdk = require('wikidata-sdk');
const url = wdk.searchEntities('Ingmar Bergman');
import * as http from 'http';
var curator = require('art-curator');

var https = require('https');
export class WikiRouter {
    router: Router
    constructor() {
        this.router = Router();
        this.init();
    }

    public getWDKEntities() {
        const ids = 'Q1127759' // could also be several ids as an array: ['Q1', 'Q5', 'Q571']
        const languages = ['en', 'kr'] // returns all languages if not specified
        const props = ['info', 'claims'] // returns all data if not specified
        const format = 'json' // defaults to json
        const url = wdk.getEntities(ids, languages, props, format)
        console.log('url2',url);
    }

    public test(req: Request, res: Response, next: NextFunction) {
        console.log('req',req);

        const authorQid = 'Q1127759'
        const sparql = `
        SELECT ?cognitive_bias ?cognitive_biasLabel WHERE {
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". 
            }
            ?cognitive_bias wdt:P31 wd:Q1127759.
        }
        LIMIT 100
        `
        const url = wdk.sparqlQuery(sparql);

        // let url = wdk.searchEntities({
        //     search: 'List of cognitive biases',
        //     format: 'json',
        //     language: 'en'});
        // console.log('url',url);

        console.log('url:',url);

        if (req) {
            res.status(200)
            .send({
                message: 'Success~!',
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

    public getAll(req: Request, response: Response, next: NextFunction) {
        const wikiUrl = curator.createWikiDataUrl();
        console.log('bias',wikiUrl);
        https.get(wikiUrl, (res: any) => {
            const statusCode = res.statusCode;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                return;
            }
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                console.log('raw',rawData);
                let result = JSON.parse(rawData)['results']['bindings'];
                response.send(result);
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
        
    }

    public getOne(req: Request, response: Response, next: NextFunction) {
        let pageName = req.params.id;
        let singlePageUrl = curator.createSingleWikiMediaPageUrl(pageName);
        let newUrl = singlePageUrl.replace('http','https');
        https.get(newUrl, (res: any) => {
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                console.log('raw data',rawData);
                let result = JSON.parse(rawData)['parse']['text']['*'];
                let preamblesRemoved = curator.removeWikiDataPreambles(result);
                response.send(preamblesRemoved);
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    }

    /** Take each handler, and attach to one of the Express.Router's endpoints. */
    init() {
        console.log('init');
        this.router.get('/test', this.getAll);
        this.router.get('/:id', this.getOne);
    }
    
}

// Create the HeroRouter, and export its configured Express.Router
const wikiRoutes = new WikiRouter();
wikiRoutes.init();

export default wikiRoutes.router;
