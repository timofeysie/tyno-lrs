import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/App';
import * as xapi from '../src/xapi/Wrapper';


chai.use(chaiHttp);
const expect = chai.expect;
describe('xAPI tests', () => {

  describe('configuration', () => {
    it('should be instantiable', () => {
        let wrapper = new xapi.Wrapper();
        expect(wrapper).to.exist;
    });
    it('should return a configuration object', () => {
        let wrapper = new xapi.Wrapper();
        let config = wrapper.getConfig();
        expect(config).to.exist;
    });
    // this reiles on toBase64() used in the Wrapper.ts file for setting the conf['auth'] value
    // it('should return a created statement', () => {
    //     let wrapper = new xapi.Wrapper();
    //     let statement = wrapper.createStatement(
    //       'mailto:steve.vergenz.ctr@adlnet.gov',
    //       'http://adlnet.gov/expapi/verbs/launched',
    //       'http://vwf.adlnet.gov/xapi/virtual_world_sandbox');
    //     console.log('statement',statement);
    //     expect(statement).to.exist;
    // });
  });
});