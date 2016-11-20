var ADL = require('../../node_modules/xAPIWrapper/dist/xapiwrapper.min');
//import ADL from '../../node_modules/xAPIWrapper/src/xapiwrapper';
//import ADL = require('../../node_modules/xAPIWrapper/src/xapiwrapper');
//import * as ADL from '../../node_modules/xAPIWrapper/dist/xapiwrapper.min';

// var xAPIWrapper = require('../../node_modules/xAPIWrapper/src/xapiwrapper');
// var xAPIStatement = require('../../node_modules/xAPIWrapper/src/xapistatement');
// var verbs = require('../../node_modules/xAPIWrapper/src/verbs');
// var xAPILaunch = require('../../node_modules/xAPIWrapper/src/xapi-launch');
// var xapiutil = require('../../node_modules/xAPIWrapper/src/xapi-util');
var crypto = require('../../node_modules/xAPIWrapper/lib/cryptojs_v3.1.2.js');

export class Wrapper {
  constructor() { }

  public getConfig():any {
    let conf = {};
    conf['endpoint'] = "http://localhost:8000/xapi/";
    try {
        conf['auth'] = "Basic " + btoa('tom:1234');
    } catch (e) {
        console.log("Exception in Config trying to encode auth: " + e);
    }
    conf["actor"] = {"mbox":"default@example.com"};
    conf["grouping"] = {"id":"ctxact:default/grouping"};
    conf["activity_platform"] = "default platform";
    return conf
  }

  public createStatement(actor, verb, object) {
    //let statement = new ADL.XAPIStatement(actor, verb, object);
    var stmt = new ADL.XAPIStatement(
				new ADL.XAPIStatement.Agent(ADL.XAPIWrapper.hash('mailto:steve.vergenz.ctr@adlnet.gov'), 
				'Steven Vergenz'),
				ADL.verbs.launched,
				new ADL.XAPIStatement.Activity('act:wrapper_test', 'xAPIWrapper test page',
					'A website that exercises the functions of the xAPIWrapper')
			);
    return stmt;
  }
}

