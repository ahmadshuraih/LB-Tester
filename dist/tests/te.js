"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurator_1 = __importDefault(require("../configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("../functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("../functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("../tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('http://localhost:3000/data/#{tenantId}/layout');
//Set addressbook url and the load balancer authentication token
configurator_1.default.setAddressBookUrl('http://localhost:3100/loadbalancer/addressbook');
configurator_1.default.setLBAuthenticationToken('MasterTestToken');
configurator_1.default.setResponseTimeHeader('X-Response-Time');
//Randomize test objects in list
configurator_1.default.setRandomizeTestLists(true);
//Enable RAM usage repport and configure it
configurator_1.default.setCheckRAMUsage(true);
configurator_1.default.setRAMCheckRequestMethod('Post');
configurator_1.default.setRAMCheckRequestUrl('http://localhost:3000/data?token=MasterToken');
configurator_1.default.setRAMCheckRequestBody({ "command": "inspect" });
configurator_1.default.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip' });
configurator_1.default.setMultiRAMCheck(false);
//Enable multi time usage check log
configurator_1.default.setMultiTimeUsageCheck(false);
//Configure the test to be parallel
configurator_1.default.setParallelTest(true);
configurator_1.default.setParallelTestConcurrency(5);
//Configure alert sound
configurator_1.default.setTestFinishSoundAlert(false);
//Set a request parameter to be added to the base url
const requestParamaters = [{ name: 'token', value: 'SampleToken' }];
//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };
//create test object
const testObject1 = testObjectFunctions_1.default.createNewTestObject('Test of tenant id: 00000', '00000', requestParamaters, null, requestHeaders, '/transaction/2020');
//create test object list
const testObjectList1 = testObjectListFunctions_1.default.createNewTestObjectList(testObject1, '00000', 20, true, 1);
//add the test object list to the tester
tester_1.default.addTestObjectList(testObjectList1);
//Add warm up test object and the total warm up rounds
tester_1.default.addWarmUpTestObject(testObject1, 5);
//Start the tests
tester_1.default.startTest();
