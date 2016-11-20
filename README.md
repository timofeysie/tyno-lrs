# Typescript NodeJS Learning Record Store
tyno-lrs

This project provides a good example of how to use TypeScript with NodeJS & Firends (Express) 
in a TDD development cycle.

It contains a server app which demonstrates best practices for developing an API using TypeScript.
This means classes with imports and proper typed functions and members.

Of course [Express](http://expressjs.com/) is used for the server aspect right now, 
but in the future, who knows, it might be [Koa](http://koajs.com/).

For the testing we use the [Mocha](https://mochajs.org/) test framework with [Chai](http://chaijs.com/api/) for assertions.
We are using the BDD expect call to assert truthy or falsy conditions in the tests.
This can be configured using the chai object.
* The Expect / Should API covers the BDD assertion styles.
* The Assert API covers the TDD assertion style.

## Table of contents

1. [dev](#dev)
1. [toBase64](#toBase64)
2. [xAPI configuration](#xAPI-configuration)
2. [xAPI installation](#xAPI-installation)
2. [Project setup](#project-setup)


## <a name="generating-statements">Generating statements</a>

After settling on a way to import the library, we now want to create our first statement.
We created a config object (which didn't actually requre the lib) in xAPI.test.ts like this:
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

So how to get a handle on the ADL oject used in the examples?
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

This second error is becuase now, during testing, the lib is in its compiled location, and we need to do this:
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

Let's go thru the different styles.  We're looking at [this explainiation](https://www.exratione.com/2015/12/es6-use-of-import-property-from-module-is-not-a-great-plan/) 
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

