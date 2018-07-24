# Tyno-lrs

Tyno-lrs is a Typescript NodeJS Learning Record Store project.

General details about Learning Record Stores (LRS) can be found on [here](https://en.wikipedia.org/wiki/Learning_Record_Store).

Specifically, we use the [xAPI](https://experienceapi.com/overview/) as the messaging format for a distibuted learning system. 


## Table of contents


1. [About](#about)
1. [APIs](#apis)
1. [WikiData SDK](#wikidata-sdk)
1. [Travis vs Heroku](#travis-vs-heroku)
1. [Deploying to Heroku](#deploy)
1. [AllowJs is not set](#allowjs)
1. [dev](#dev)
1. [toBase64](#toBase64)
2. [xAPI configuration](#xAPI-configuration)
2. [xAPI installation](#xAPI-installation)
2. [Project setup](#project-setup)


## About

This project provides a good example of how to use TypeScript with NodeJS & Friends (Express) 
in a TDD development cycle.

It contains a server app which demonstrates best practices for developing an API using TypeScript.
This means classes with imports and proper typed functions and members.

[Express](http://expressjs.com/) is used for the server aspect right now, 
but in the future, who knows, it might be [Koa](http://koajs.com/).

For the testing we use the [Mocha](https://mochajs.org/) test framework with [Chai](http://chaijs.com/api/) for assertions.
We are using the BDD expect call to assert truthy or falsy conditions in the tests.
This can be configured using the chai object.
* The Expect / Should API covers the BDD assertion styles.
* The Assert API covers the TDD assertion style.

To use this server program, you will need gulp, node and npm installed.
Use these commands:
```
$ npm i  
$ gulp watch
$ npm test
$ npm start
```


## Using the Curator

To support the WikiData parsing clients, this project is going to be used to use the [art-curator](https://github.com/timofeysie/curator) library to parse WikiData and WikiMedia (Wikipedia) for lists and detail pages.

One thing that is duplicated in this process is the "wikidata-sdk": "^5.2.9" used here and the one used in art-curator 5.15.2.

The single page ulr WikiMedia calls are creating the correct url but getting this in the response:
```
  statusCode: 301,
  statusMessage: 'TLS Redirect',
```

The createSingleWikiMediaPageUrl(pageName) returns an http call.  If we replace this with an https call, we get the content we are looking for.  We did not have to do this in the Ionic or React Native apps.

To test this call, try something like:
```
http://localhost:3000/api/v1/wiki/magical_thinking
```

On Heroku that would be:
```
https://tyno-lrs.herokuapp.com/api/v1/wiki/magical_thinking
```

The problem on Heroku is that the dist doesn't get built by Gulp and so we get this error in the logs:
```
Error: Cannot find module '/app/dist/index.js'
```

The [answer here](https://stackoverflow.com/questions/24504476/how-to-deploy-node-that-uses-gulp-to-heroku) puts this in the package.json scripts:
```
"postinstall": "gulp default"
```


## APIs


The SSL test implementation also makes it's WikiData call using the https class.
```https://localhost:8443/api/v1/wiki/test```

The values of the returned cognitive_bias, for example ```https://www.wikidata.org/wiki/Q136783``` actually does not include any helpful data.

The data file in the dist directory would be shown via this call:
```
api/v1/heroes 
```
The basic get all heroes for the Angular 2+ tutorial example.

The current dev port set is 3000, so this should get the list on your local:
```
http://localhost:3000/api/v1/heroes
```

The current test api to test the WikiData SDK:
```
http://localhost:3000/api/v1/wiki/test
```

Currently trying to get a list of cognitive bias from WikiData.

The above url retrieves the following:
```
url https://www.wikidata.org/w/api.php?action=wbsearchentities&search=List%20of%20cognitive%20biases&language=en&limit=20&format=json&uselang=en
url: https://www.wikidata.org/w/api.php?action=wbsearchentities&search=List%20of%20cognitive%20biases&language=en&limit=20&format=json&uselang=en
GET /api/v1/wiki/test 200 42.250 ms - 23
```

Using the online query tool, this would retrieve what we need.
The filter shows: ```Instance of cognitive bias```
```
SELECT ?cognitive_bias ?cognitive_biasLabel WHERE {
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". 
    }
    ?cognitive_bias wdt:P31 wd:Q1127759.
}
LIMIT 100
```

Now, how to turn that into a API call with the WikiData SDK?
Instead of using the url API method, we should be using a (SPARQL queryt)[https://github.com/maxlath/wikidata-sdk/blob/master/docs/sparql_query.md]

Turns out all we have to do is put that query above in a string and call this function:
```
const url = wdk.sparqlQuery(sparql);
```

This will return a url like this:
```
https://query.wikidata.org/sparql?format=json&query=%0A%20%20%20%20%20%20%20%20SELECT%20%3Fcognitive_bias%20%3Fcognitive_biasLabel%20WHERE%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Fcognitive_bias%20wdt%3AP31%20wd%3AQ1127759.%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20LIMIT%20100%0A%20%20%20%20%20%20%20%20
```

In the browser this will return the expected result:
```
{
  "head" : {
    "vars" : [ "cognitive_bias", "cognitive_biasLabel" ]
  },
  "results" : {
    "bindings" : [ {
      "cognitive_bias" : {
        "type" : "uri",
        "value" : "http://www.wikidata.org/entity/Q18570"
      },
      "cognitive_biasLabel" : {
        "xml:lang" : "en",
        "type" : "literal",
        "value" : "Hawthorne effect"
      }
    }
    ...
```

However in the node app when we call this url we are getting the error:
```
Invalid content-type.
Expected application/json but received application/sparql-results+json
```

If we try this:
```
req.setHeader('content-type', 'application/sparql-results+json');
```
in the editor we get this error:
```
[ts] Property 'setHeader' does not exist on type 'Request'.
```

Do we have to do a full ssl implementation here?
So lets look at [the docs](https://expressjs.com/en/api.html#setHeaders).  
We are using "express": "^4.14.0".

The example shows setting headers in the options that are used in an app.user function.

TypeError: req.setHeader is not a function

Actually, that first error is our own custom check for content type.
We can ignore that now we know we are looking for something different.

But, since we are now making an https call, we will need to do some more work.  With the old code we would get: 
```
Error: Protocol "https:" not supported. Expected "http:"
```

Simply using the https version will result in this error:
```
TypeError: Converting circular structure to JSON
    at Object.stringify (native)
    at stringify (/Users/tim/repos/myra-client-server/tyno-lrs/node_modules/express/lib/response.js:1119:12)
```

There is no data in the response, and we are guessing because we have not implemented https with a certificate yet.  To do that for a development server is an easy one liner:
```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 20000
```
The Node setup is well shown [in this tut](https://aghassi.github.io/ssl-using-express-4/).

So that done, next we had an issue with overriting the request object.
Because we have a request to the API endpoint, which then makes a request to WikiDate, we had two objects being called req.  Differentiating those got us our JSON list of 100 cognitive bias.

Considering the goal of this project (to make an educational learning system using spaced repetition that uses WikiData as its learning source), the LRS portion of this is not actually essential.  If we just want a list of cognitive bias to memorize, that list can be managed on an app that uses device storage.  The actions taken on each learning item can also be stored.

Future releases could send out and receive xAPI statements that can be tracked by a server app like this, but maintaining a server is actually a barrier to growth.  Managing a single mobile or PWA client app is much easier, so that is what we will be doing for now.

There will be an Ionic 4 app and a React Native app with the goal of abstracting out the list keeping and spaced repetition LRS actions into pure web components to protect the project from framework churn.  For now this project will be dormant.  The Travis build might also get fixed...



## Using the WikiData SKD

This is trying out the [WikiData SKD](https://github.com/maxlath/wikidata-sdk/issues).

A sample JSON object returned for searchinfo contains four root level items:
```
searchinfo	{ contains the search string }
search	[ contains an array of objects shown below ]
search-continue	10
success	1
```


With search string "Cognitive Bias"
```
repository	""
id	"Q1127759"
concepturi	"http://www.wikidata.org/entity/Q1127759"
title	"Q1127759"
pageid	1074805
url	"//www.wikidata.org/wiki/Q1127759"
label	"cognitive bias"
description:	["systematic pattern of deviation from norm or rationality in judgment, whereby inferences about other people and situations may be drawn in an illogical fashion"]
match: {	
    type:	"label",
    language:	"en",
    text:	"cognitive bias"
}
```

But when we search for "List of cognitive biases", we get a single response object:
repository:	""
id:	"Q2607828"
concepturi:	"http://www.wikidata.org/entity/Q2607828"
title:	"Q2607828"
pageid:	2515555
url:	"//www.wikidata.org/wiki/Q2607828"
label:	"List of cognitive biases"
description:	"Wikimedia list article"
match: {	    
    type:	"label"
    language:	"en"
    text:	"List of cognitive biases" }
success:	1

Not really what was expected.  Where is the list?
Time to read the docs.

They say *Wikidata Query allows to extract all sorts of data from Wikidata by walking the graph of entities using SPARQL*
What is SPARQL?  Guess how that's pronounced.  Correct!
[SPARQL](https://en.wikipedia.org/wiki/SPARQL) is a RDF query language, that is, a semantic query language for databases, able to retrieve and manipulate data stored in Resource Description Framework (RDF) format.

Here is a sample of the List of W3C standards
```
SELECT DISTINCT ?standard ?standardLabel ?website
WHERE
{
        ?standard wdt:P1462 wd:Q37033 .
        OPTIONAL{ ?standard wdt:P856 ?website }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY ?standardLabel
```

That doesn't look much like how we create a query right now:
```
        const search = 'List of cognitive biases'
        const language = 'en' // will default to 'en'
        const limit = 10 // defaults to 20
        const format = 'json' // defaults to json
        const url = wdk.searchEntities(search, language, limit, format);
```

What are the other wdk calls?

No idea what's going on here:
```
P1424	
0	
mainsnak	
snaktype	"value"
property	"P1424"
hash	"90c74eeba1d427f16debce3d255ddc7dece82b90"
datavalue	
value	{…}
type	"wikibase-entityid"
datatype	"wikibase-item"
type	"statement"
id	"Q571$4e0a142f-4c09-f989-0c16-a74cd8a33692"
rank	"normal"
``` 

Tried this function:
```
 wdk.getWikidataIdsFromWikipediaTitles
```

Similar results to above.  By the way, what are mainsnak and snaktype?
Shouldn't it be snack or snake or something?


## Travis vs Heroku

Here is the [page](https://docs.travis-ci.com/user/deployment/heroku/) for the Tavis Heroku deployment.

To get started we need our HEROKU_API_KEY.  [This page](https://devcenter.heroku.com/articles/authentication) details that.
Here's how THAT went:
```
QuinquenniumF:tyno-lrs tim$ heroku login
Enter your Heroku credentials.
Email: timofeyc@hotmail.com
Password (typing will be hidden): 
 ▸    HTTP Error: https://api.heroku.com/login 400 Bad Request
 ▸    Invalid response from API.
 ▸    HTTP 400
 ▸    {timofeyc@hotmail.com he2@wWsSr}
 ▸    
 ▸    Are you behind a proxy?
 ▸    https://devcenter.heroku.com/articles/using-the-cli#using-an-http-proxy
QuinquenniumF:tyno-lrs tim$ heroku login
heroku-cli: Updating to 6.13.7-5971fd5... 12.9 MB/12.9 MB
 ▸    heroku-cli: This CLI is deprecated. Please reinstall from https://cli.heroku.com
 ▸    login: is not a heroku command.
 ▸    Perhaps you meant login
 ▸    Run heroku help for a list of available commands.
QuinquenniumF:tyno-lrs tim$ heroku --version
heroku-cli/6.13.7-5971fd5 (darwin-x64) node-v8.2.1
```

The commande ```heroku auth:token``` get's the API KEY.
It's encrypted so OK to store in the yamil file.

After that, pushing the commit of the yamil file kicked off the build on our [Travis account](https://travis-ci.org/timofeysie).
It might still be running to this day.  It's been close to ten minutes already.
Something must be happening.  There is an animated gif with two circles rotating each other.

By default it should be running out ```npm test``` command.
It takes about 12 seconds on this laptop.  After a full episode of Ali G Remixed Travis still says started and the balls are still rotating.  That's next level slow!
I guess someone here was lulled into a false sense of activity by the circling circles.  After refreshing the page, it says *Passed 39 minutes ago*.

[Travis docs for Node.js](https://docs.travis-ci.com/user/languages/javascript-with-nodejs/)

[Examnple Yaml file for Node with Heroku](https://github.com/juristr/southtyrol-weather-mobile/blob/master/.travis.yml).

[Travis docs for deploying to Heroku](https://docs.travis-ci.com/user/deployment/heroku/).

[Our Travis site](https://travis-ci.org/timofeysie).


deposit at least $2,000 per month

[This Stack Overflow answer](https://stackoverflow.com/questions/43317980/how-do-i-deploy-my-typescript-node-js-app-to-heroku) lays out a good approach:
*use a build server which has an integration with Heroku. After you do the build there, configure it to send the build results to Heroku. Travis has a straighforward setup like this. This way you don't need to include build outputs in your repository, which is considered an anti-pattern.*
*On a sidenode, try using a tsconfig.json to keep the tsc configuration. It will save you from having to write such long command lines all over the place.*


#### Dev dependencies
*we have to include devDepenedencies such as typescript and any build tools in the normal dependency list we have to hook up the postinstall npm script to build our app.*


#### Versions
*setting the node version and npm version that you are using, again in your package.json file:*
```
"engines": {
    "node": "6.9.1",
    "npm": "3.10.8"
}
```

The port we know about, and is the same as using Node.js written in straight JavaScript.
```
const port = normalizePort(process.env.PORT || 3000);
```
One last not on the Medium article: *the app will publicly be available on port 80 but that's not the port that the app runs under.*



## <a name="deploy">Deploying to Heroku</a>

A first try when deploying to Heroku showed that the build worked, but the site gave an error.  In the logs, there was this hint:
```
2017-08-05T02:06:13.314313+00:00 app[web.1]: npm ERR!     node dist/index.js
```

That's after using this link:
```
https://tyno-lrs.herokuapp.com/api/v1/heroes
```

The console in the browser shows:
```
tyno-lrs.herokuapp.com/:1 GET https://tyno-lrs.herokuapp.com/ 503 (Service Unavailable)
```

Deploying via the Heroku dashboard shows this in the log:
```
       
-----> Caching build
       Clearing previous node cache
       Saving 2 cacheDirectories (default):
       - node_modules
       - bower_components (nothing to cache)
-----> Build succeeded!
-----> Discovering process types
       Procfile declares types     -> (none)
       Default types for buildpack -> web
-----> Compressing...
       Done: 18M
-----> Launching...
       Released v4
       https://tyno-lrs.herokuapp.com/ deployed to Heroku
```

So, as I recall, we will need a proc file to tell Heroku which file to run.

The basic commands so far have been npm test and npm start.
But there is nothing in the dist directory, which is in the gitignore directory, meaning that it will not get to Heroku, which deploys from the master branch on GitHut currently.

So we will also need to learn about deploying a TypeScript Node.js on Heroku.

There is [another article on the basics of what Heroku and TypeScript](https://medium.com/@Roaders/deploying-a-node-and-browser-typescript-project-to-heroku-3e647ef74c82) work together:
*When your app is deployed on Heroku it runs npm install in a subshell where NODE_ENV is production. This means that dev dependencies are not resolved and that the prepublish npm script is not run. You can test this by running: ```npm install --production```*



## <a name="allowjs">allowJs is not set</a>

In the src/xapi/Wrapper.ts file, there are two VSCode editor problems.
The first is this import:
```
import * as CryptoJS from  '../../node_modules/crypto-js/crypto-js';
```
When hovering the mouse over the red squiggly under the path, it says:
*[ts] Module '../../node_modules/crypto-js/crypto-js' was resolved to '/Users/tim/repos/myra-client-server/tyno-lrs/node_modules/crypto-js/crypto-js.js', but '--allowJs' is not set.*

A note on an issue on GitHub of a project that had a similar problem said:
*... reference the file directly like this import printJS from 'node_modules/print.js/src/index.js'; but if you do this you also have to configure the flag allowJs for the typescript could accept it...*

To set '--allowJs' is done in the tsconfig file.
On this [TypeSript page](https://github.com/Microsoft/TypeScript/issues/14485)

So I add this to the config file:
```
{
  "compilerOptions": {
    "allowJs": true,
    "target": "es6",
    "module": "commonjs",
    "outDir": "dist"
  },
```

The red squiggly does not go away.  Since in my editor, I have three projects in one directory which depend on each other (so I don't have to keep closing one project to look at the code in another project), I'm not sure if this is a problem caused by that, or an actual path problem.  Unlike the issue mentioned above, there is no .js in the import path.  It says it resolves to .js, but that's not my doing

[This issue](https://github.com/Microsoft/TypeScript/issues/3949#issuecomment-123430443) indicates that the location of the tsconfig file is important.  I have only ever had this file in the root directory.  And since the discussion was from 2015, I'm not sure that is valid anymore.

The links for these issues have circular references, so back to the Google search,
the second choice is [this link](https://github.com/Microsoft/TypeScript/issues/15970).

It states the following:
*--allowJs combined with the import makes the compiler think the node_module is part of your sources, and it will compile it for you, so your output will have node_modules\foo\foo.js*

That sounds like what's happening here.

The issues ends with the TypeScript 2.4 milestone on May 23
```
Tyno-lrs uses "typescript": "^2.0.6"
Socius uses "typescript": "^2.0.3",
Heat-wave uses "typescript": "~2.2.1" (in dev dependencies, the other two are in dependencies)
```

I know at least that Ionic and Angular in the heat-wave clinet require a certain version of Typescript.  I'm not sure about Express and node in the other two.  What a minefield JS development is!

Worth a try using 2.4 in tyno-lrs.

On the typescript site it has a download page which says to do this:
```
npm install -g typescript
```

But with that caret (^) in front of the 2, doesn't that mean it should be using the latest major version?
Anyhow, set it to 2.4.0 and ran npm i.

Then, back in the Wrapper.ts file, that red-squiggly is gone.  That worked!

The only squiggly left then was on the toBase64 function (see below).

Added the import to it: CryptoJS.toBase64
And that squiggly is gone also.

Running npm test goes well except for one failure:
```
Exception in Config trying to encode auth: TypeError: CryptoJS.toBase64 is not a function
      ✓ should return a configuration object
      1) should return a created statement


  8 passing (172ms)
  1 failing

  1) xAPI tests configuration should return a created statement:
     TypeError: Expecting a function in instanceof check, but got undefined
      at new XAPIStatement (node_modules/xAPIWrapper/src/xapistatement.js:89:28)
      at Wrapper.createStatement (src/xapi/Wrapper.ts:30:21)
      at Context.<anonymous> (test/xAPI.test.ts:24:33)
```

So the Base64 issue is still an issue.
One more issue is that node_modules appears to be in the git repo.
Doing git status returns this:
```
	modified:   README.md
	modified:   node_modules/typescript/.mailmap
	modified:   node_modules/typescript/.npmignore
    ...
```

We do have this in the .gitignore file:
```
/node_modules
```

Not sure why this is happening but out of time for this morning.


## <a name="using-a-lib">Using a lib</a>

There is a [good example here](https://github.com/Microsoft/TypeScript/issues/247) with a section called "Example for node_modules"

And verbatim I will quote it:

If we had:
```
./node_modules/concator/index.ts
./myApp.ts
```
And in index.ts we had:
```
export function concat(param1: string, param2:string): string {
      return param1 + ' ' + param2;
}
```
in myApp.ts:
```
import concator = require('concator');  // loads the module from node_modules
var result = concator.concat('I like', 'this.');
var wontWork = concator.concat('this will fail');  // compile error, concat needs 2 params
```

However, we do not have index.ts, we have index.js, which has this:
```
    exports = module.exports = toExport;
    exports.ADL = toExport;
```

So how can we use this lib, TypeScipt-wise?
These, similar to what is used in the index.js file, but with the correct paths for the node modules seems to be working:
```
var xAPIWrapper = require('../../node_modules/xAPIWrapper/src/xapiwrapper');
var xAPIStatement = require('../../node_modules/xAPIWrapper/src/xapistatement');
var verbs = require('../../node_modules/xAPIWrapper/src/verbs');
var xAPILaunch = require('../../node_modules/xAPIWrapper/src/xapi-launch');
var xapiutil = require('../../node_modules/xAPIWrapper/src/xapi-util');
```

But now crypto is a problem.
The way we are using it has a red squiggly under the path section:
```
import * as CryptoJS from '../../node_modules/xAPIWrapper/lib/cryptojs_v3.1.2';
```

An answer of SO shows this:
```
import * as CryptoJS from '../../../node_modules/crypto-js';
```
or
```
import CryptoJS = require('crypto-js');
```

Copying the path to that file shows this: 
/Users/tim/node/typescript-api/node_modules/xAPIWrapper/lib/cryptojs_v3.1.2.js

This has no squiggly:
```
var crypto = require('../../node_modules/xAPIWrapper/lib/cryptojs_v3.1.2');
```
But the var the code is looking for is crypto-js, which is an illegal var name.
Actually it's a module name:
```
Error: Cannot find module 'crypto-js'
```

In case you are wondering, the version suggested [on SO](http://stackoverflow.com/questions/38479667/import-crypto-js-in-an-angular-2-project-created-with-angular-cli) 
above both have red squigglies on them.

The next answer on the page has an edit that suggests this:
```
const map: any = {
    'crypto-js': '../../node_modules/xAPIWrapper/lib/cryptojs_v3.1.2'
};
/** User packages configuration. */
const packages: any = {
    'crypto-js': {
        format: 'cjs',
        defaultExtension: 'js',
        main: 'crypto-js.js'
    }
};
```

This looks promising, but doesn't work.  Same error when running the tests tho there are no squigglies.

This version also fails:
```
const map: any = {
    'crypto-js': '../../node_modules/xAPIWrapper/lib/cryptojs_v3.1.2'
};
import CryptoJS from 'crypto-js';
```

What next?  [This page](https://www.snip2code.com/Snippet/28724/Using-crypto-js-in-node-js-with-Typescri) 
recommends adding code to the actual crypto d.ts file (not very maintainable!).

Install typings for crypto-js:
$ typings install --ambient crypto-js

This was all three years ago.  Typings have moved on since then.


Ditching the crypto from the xAPI lib, and trying this:
```
$ npm install crypto-js --save
```
And then:
```
import * as CryptoJS from '../../node_modules/crypto-js';
```

And anyhow, the error is from the test, so maybe this import needs to be in the test file?
Still doesn't help.

What gives?  It doesn't even look like the lib is being used anywhere.

Looking in more detail, its not either our code or the xAPI code that is causing this error:

/Users/tim/node/typescript-api/node_modules/ts-node/dist/index.js:160
                    throw new TSError(formatDiagnostics(diagnosticList, cwd, ts, lineOffset));
                    ^
TSError: ⨯ Unable to compile TypeScript
test/xAPI.test.ts (7,27): Cannot find module '/Users/tim/node/typescript-api/node_modules/crypto-js/crypto-js'. (2307)

Here is the section that is requiring the code:
```
function getCacheName(sourceCode, fileName) {
    return crypto.createHash('sha1')
        .update(path_1.extname(fileName), 'utf8')
        .update('\0', 'utf8')
        .update(sourceCode, 'utf8')
        .digest('hex');
}
function getCompilerDigest(opts) {
    return crypto.createHash('sha1').update(JSON.stringify(opts), 'utf8').digest('hex');
}
```

We installed ts-node in Step 4: TDD
```
$ npm install ts-node@1.6.1 --save-dev
```

This is the full description of why we need ts-node: 
If we write out tests in .ts files, we’ll need to make sure that Mocha can understand them. By itself, Mocha can only interpret JavaScript files, not TypeScript. There are a number of different ways to accomplish this. To keep it simple, we’ll leverage ts-node, so that we can provide TypeScript interpretation to the Mocha environment without having to transpile the tests into different files. ts-node will interpret and transpile our TypeScript in memory as the tests are run.

But still, why does this require crypto, and why is it breaking now?  
It ran from step 4 onwards, and during early testing of the xAPI code.

We took out the test that started causing all the trouble, and sure enough, the other tests pass again.
We put that test back in, and all of a sudden, the tests run and the problem test fails.

```
  1 failing

  1) xAPI tests configuration should return a created statement:
     TypeError: xAPIStatement.Agent is not a function
      at Wrapper.createStatement (src/xapi/Wrapper.ts:32:5)
      at Context.<anonymous> (test/xAPI.test.ts:25:33)
```

So do we also need to import Agent?  Again with the imports!






## <a name="generating-statements">Generating statements</a>

After settling on a way to import the library, we now want to create our first statement.
We created a config object (which didn't actually require the lib) in xAPI.test.ts like this:
```
import * as xapi from '../src/xapi/Wrapper';
...
let wrapper = new xapi.Wrapper();
```

In Wrapper.ts:
```
var xAPIWrapper = require('../../node_modules/xAPIWrapper/dist/xapiwrapper.min');
...
let statement = new xAPIWrapper.ADL.XAPIStatement(actor, verb, object);
```

The last line there breaks the test with this error:
```
TypeError: Cannot read property 'XAPIStatement' of undefined
```

So how to get a handle on the ADL object used in the examples?
That should be imported and available with the require statement, no?


## <a name="dev">Dev</a>

To watch the files for changes and re-load:
```
$ npm start
```

To run the unit tests:
```
$ npm test
```

## <a name="toBase64">toBase64</a>

In the [xAPIWrapper docs](https://github.com/adlnet/xAPIWrapper) in the COnfiguration section, 
this line is in a try catch block:
```
conf['auth'] = "Basic " + toBase64('tom:1234');
```

toBase64 is not liked by NodesJS or VSCode.  Where does that function come from?
The [MDN docs](https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding) 
show using btoa() to create a base-64 encoded ASCII string from a "string" of binary data.
toBase64 may be a crypto thing which xAPI states as a dependency in its docs.

When we test the getConfig function which uses btoa(), we get this error:
```
Exception in Config trying to encode auth: ReferenceError: btoa is not defined
```

If you look in the xAPIWrapper source, you will find this:
```
function toBase64(text) {
    // if (CryptoJS && CryptoJS.enc.Base64)
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(text));
    // else
    //     return Base64.encode(text);
}
```

After getting a few tests running, this log comment shows up:
```
Exception in Config trying to encode auth: ReferenceError: btoa is not defined
```

But isn't that a regular JavaScript function?
Maybe it's only a Mozilla thing and not supported in Node?
That would be weird.
[Can I use](http://caniuse.com/#feat=atob-btoa) shows full coverage.
What gives.


## <a name="xAPI-configuration">xAPI configuration</a>


Then we create a new xapi/Wrapper class to hold xAPI functions.
Trying to test a function on this class gives the following error in VSCode:
```
Property 'xApiConfig' does not exist on type 'typeof "/Users/tim/node/typescript-api/src/xapi/Wrapper"'.
```

Runing npm test give this error:
```
has no default export
```

Tha App.ts class has this at the end:
```
export default new App().express;
```

We are doing this:
```
export class Wrapper 
```

In Angular 2, that is enough to expose all the functions of the calls.

If we try this:
```
export default new Wrapper();
```

Then we get the same error we got during the xAPI installation section:
```
Error: Cannot find module '../node_modules/xAPIWrapper/dist/xapiwrapper.min'
```

This second error is because now, during testing, the lib is in its compiled location, and we need to do this:
```
var xAPIWrapper = require('../../node_modules/xAPIWrapper/dist/xapiwrapper.min');
```

Then, the tests run, and we get this result:
```
  6 passing (92ms)
  1 failing
  1) xAPI tests configuration should run:
     AssertionError: expected undefined to exist
      at Context.<anonymous> (test/xAPI.test.ts:14:31)
```

That is the red squiggle:
```
[ts] Property 'xApiConfig' does not exist on type 'typeof "/Users/tim/node/typescript-api/src/xapi/Wrapper"'.
(method) Wrapper.xApiConfig(): any
```
in the test we we do this:
```
let config = wrapper.xApiConfig();
```

Only, it seems to know the signature of the function: (method) Wrapper.xApiConfig(): any

Yet its called a property in one line and a method in the next.

We could try this in the xAPI.test.ts:
```
var xAPIWrapper = require('../src/xapi/Wrapper');
```

That makes the red squiggly go away, but the test fails with the message:
```
     TypeError: xAPIWrapper.xApiConfig is not a function
      at Context.<anonymous> (test/xAPI.test.ts:13:34)
```

If this is done:
```
        let wrap = new xAPIWrapper();
        let config = wrap.xApiConfig();
```

The error is:
```
 TypeError: xAPIWrapper is not a function
```

That's the actual wrapper object, so it still looks like the Wrapper class is not being imported properly.

If we try this double whammy in the test:
```
import * as xapi from '../src/xapi/Wrapper';
...
        let wrapper = new xapi.Wrapper();
        expect(wrapper).to.exist;
```

The test passes!

But actually trying to use the lib still does not work.

Let's go thru the different styles.  We're looking at [this explanation](https://www.exratione.com/2015/12/es6-use-of-import-property-from-module-is-not-a-great-plan/) 
of imports:

```
// Import the default export of a module.  
import xAPIWrapper from '../../node_modules/xAPIWrapper/src/xapiwrapper';

// Import all exports from a module as properties of an object.
import * as xapi from '../../node_modules/xAPIWrapper/src/xapiwrapper';

// These two formats are not discussed.
var xAPIWrapper = require('../../node_modules/xAPIWrapper/src/xapiwrapper');
import xAPIWrapper = require('../../node_modules/xAPIWrapper/src/xapiwrapper');
```

It also depends on how the library is exported.  
Since xapiwrapper.js is not in TypeScript, it doesn't have to play by typescript rules.

At the end of the file it does this:
```
module.exports = new XAPIWrapper(Config(), false);
```

The index.js file in the xAPIWrapper/src directory does this:
```
var xAPIWrapper = require('./xapiwrapper');
var xAPIStatement = require('./xapistatement');
var verbs = require('./verbs');
var xAPILaunch = require('./xapi-launch');
var xapiutil = require('./xapi-util');
var toExport = {
  XAPIWrapper: xAPIWrapper,
  XAPIStatement: xAPIStatement,
  verbs: verbs,
  launch: xAPILaunch,
  xapiutil: xapiutil
};
(function() {
  var root = this;
  if( typeof window === 'undefined' ) {
    exports = module.exports = toExport;
    exports.ADL = toExport;
  } else {
    root.ADL = toExport;    // this attaches to the window
    window.ADL = toExport;
  }
}).call(this);
```

So what does that mean for the way it should be imported into TypeScript?

[This issue]() recommends using this in the tsconfog.json file:
```
"moduleResolution": "classic"
```

But that will break previous imports:
```
TSError: ⨯ Unable to compile TypeScript
src/App.ts (2,26): Cannot find module 'express'. (2307)
src/App.ts (3,25): Cannot find module 'morgan'. (2307)
src/App.ts (4,29): Cannot find module 'body-parser'. (2307)
```

So the jury is still out on how to best use this lib.



## <a name="xAPI-installation">xAPI installation</a>

We want to use the [xAPI wrapper]() from [ADL](https://www.adlnet.gov/) (Advanced Distributed Learnining). 
Despite it's military slant, this is a great API for educational apps. 
They have experimental support for NodeJS modules [here](https://github.com/adlnet/xAPIWrapper/issues/67)

```
$ npm install https://github.com/zapur1/xAPIWrapper.git
```

But then how to import that our App.ts file?

import xAPIWrapper from './node_modules/xAPIWrapper/dist/xapiwrapper.min';
import xAPIWrapper = require('xAPIWrapper');
import * as xAPIWrapper from 'xAPIWrapper';

In the rainbow connection app, we use this method:
```
import { XapiComponent } from './xapi/xapi.component';
```
But we get this error:
```
(index):17 Error: (SystemJS) Can't resolve all parameters for XapiComponent: (?).(…)
```

In this app, the compiler complains:
```
TSError: ⨯ Unable to compile TypeScript
src/App.ts (6,25): Cannot find module 'xAPIWrapper'. (2307)
```

It would be nice however to just use non-relative module resolution.
[This guide](https://basarat.gitbooks.io/typescript/content/docs/quick/nodejs.html) 
has similar instructions fro the M. Herman blog.
[Here are the official docs](https://www.typescriptlang.org/docs/handbook/module-resolution.html) regarding 
the subject.  

We can get the app to compile using the old style:
```
var xAPIWrapper = require('./node_modules/xAPIWrapper/dist/xapiwrapper.min');
```

But this will never give us typings, which, for this lib, there probably are none anyhow.
What happened to introspection?  Oh, right, that's Java not Javascript.
And even though VSCode accepts that now, we still get the 'Cannot find module' error during npm test.

That's becuase the path should go up one level '../node_modules'.  Then the tests run.


## <a name="Project-setup">Project setup</a>

To set up a project like this, follow along with this friendly blog by Michael Herman:
[Developing a RESTful API With Node and TypeScript](http://mherman.org/blog/2016/11/05/developing-a-restful-api-with-node-and-typescript/#.WC7TEqJ96Rt).

These are the steps go setup a TypeScript NodeJS TDD API. 
When it says 'touch <filename>', that means create the file with the contents from the tutorial mentioned above. 
You can get the contents from this repo (although its contents will have changed from the bare basics), 
or from the GitHub [repo here]](https://github.com/mjhea0/typescript-node-api).
You could also get the files from Michael Herman's blog post, or the bare basics for TypeScript [here](https://basarat.gitbooks.io/typescript/content/docs/quick/nodejs.html) 

Now, on with the show!

### Step 1: TypeScript
```
$ touch tsconfig.json
$ mkdir src
$ npm init -y
$ npm install typescript@2.0.6 --save-dev
$ node_modules/.bin/tsc
```

### Step 2: Gulp
```
$ npm install gulp@3.9.1 gulp-typescript@3.1.1 --save-dev
$ touch gulpfile.json
```

### Step 3: Express
```
$ npm install express@4.14.0 debug@2.2.0 --save
$ npm install @types/node@6.0.46 @types/express@4.0.33 @types/debug@0.0.29 --save-dev
$ touch src/index.tsc
$ touch src/App.ts
$ npm install express@4.14.0 body-parser@1.15.2 morgan@1.7.0 --save
$ npm install @types/body-parser@0.0.33 @types/morgan@1.7.32 --save-dev
$ gulp scripts
$ npm start
```

### Step 4: TDD
```
$ npm install mocha@3.1.2 chai@3.5.0 chai-http@3.0.0 --save-dev
$ npm install @types/mocha@2.2.32 @types/chai@3.4.34 @types/chai-http@0.0.29 --save-dev
$ npm install ts-node@1.6.1 --save-dev
$ touch test/helloWorld.test.ts
$ npm test
```

### Step 5: Add Routes
```
// add some more tests.
$ touch src/data.json
$ touch src/routes/HeroRourter.ts
$ npm test
```

### Step 6: Second Endpoint

1. Create a method on HeroRouter that takes the arguments of your typical Express request handler: request, response, and next.
2. Implement the server’s response for the endpoint.
3. Inside of init, use HeroRouter’s instance of the Express Router to attach the handler to an endpoint of the API.



## Testing woes

```
$ npm test

> typescript-api@1.0.0 test /Users/timcurchod/repos/tyno-lrs
> mocha --reporter spec --compilers ts:ts-node/register test/**/*.test.ts


/Users/timcurchod/repos/tyno-lrs/node_modules/ts-node/src/index.ts:312
          throw new TSError(formatDiagnostics(diagnosticList, cwd, ts, lineOffset))
                ^
TSError: ⨯ Unable to compile TypeScript
src/xapi/Wrapper.ts (7,28): Cannot find module '../../node_modules/crypto-js/crypto-js'. (2307)
src/xapi/Wrapper.ts (18,35): Cannot find name 'toBase64'. (2304)
    at getOutput (/Users/timcurchod/repos/tyno-lrs/node_modules/ts-node/src/index.ts:312:17)
npm ERR! Test failed.  See above for more details.
mac-dog:tyno-lrs timcurchod$ 
```

Had to get rid of crypto and the toBase64 call in Wrapper as well as for the test in xAPI.test.ts.
It reiles on toBase64() used in the Wrapper.ts file for setting the conf['auth'] value.

Also, the data file was not copied over in the build process.
I need to be in the dist lib.


## Notes

Done: turn before the wharf.
TUTORIAL_SLIDE13_DESCRIPTION
Documents/grpahics/myra/app Images/myra 12 work b-nw-0.xcf
Documents/grpahics/myra draft 3/29-myra-15-turn-before-c.xfc 12/11/2014
Documents/grpahics/myra/app Images/myra 12 work b-nw-0.xcf

Next, headed off:
Documents/grpahics/myra/book 1 originals/myra4-19 b headed off 14/09/2014
Transition name: myara 16 - headed off-page-14 - m4-19 b headed off-full-contrast-repaired.png

Edited version, draft 3
Documents/grpahics/myra draft 3/33-myra4-20-lion-island-c.xfc 12/11/2014

