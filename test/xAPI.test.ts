import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/App';
import * as xapi from '../src/xapi/Wrapper';
//import * as CryptoJS from '../node_modules/crypto-js';
import CryptoJS = require('/Users/tim/node/typescript-api/node_modules/crypto-js/crypto-js');


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
        console.log('config',config);
        expect(config).to.exist;
    });
    it('should return a created statement', () => {
        let wrapper = new xapi.Wrapper();
        let statement = wrapper.createStatement(
          'mailto:steve.vergenz.ctr@adlnet.gov',
          'http://adlnet.gov/expapi/verbs/launched',
          'http://vwf.adlnet.gov/xapi/virtual_world_sandbox');
        console.log('statement',statement);
        expect(statement).to.exist;
    });
  });
});