# Typescript with Node & Firends using TDD

Follow along with your friends and family with [the tut](http://mherman.org/blog/2016/11/05/developing-a-restful-api-with-node-and-typescript/#.WC7TEqJ96Rt).


## Step 1

$ touch tsconfig.json
$ mkdir src
$ npm init -y
()
$ npm install typescript@2.0.6 --save-dev
$ node_modules/.bin/tsc


## Step 2

$ npm install gulp@3.9.1 gulp-typescript@3.1.1 --save-dev
$ touch gulpfile.json

# Step 3

$ npm install express@4.14.0 debug@2.2.0 --save
$ npm install @types/node@6.0.46 @types/express@4.0.33 @types/debug@0.0.29 --save-dev
$ touch src/index.tsc
$ touch src/App.ts
$ npm install express@4.14.0 body-parser@1.15.2 morgan@1.7.0 --save
$ npm install @types/body-parser@0.0.33 @types/morgan@1.7.32 --save-dev
$ gulp scripts
$ npm start


