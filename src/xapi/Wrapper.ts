var xAPIWrapper = require('../../node_modules/xAPIWrapper/dist/xapiwrapper.min');

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
}
export default new Wrapper();