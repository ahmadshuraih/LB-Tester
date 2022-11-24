"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//This file is to show an example of how to use this LBTester and to test it during implementing it
const configurator_1 = __importDefault(require("./configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("./functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("./functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("./tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('http://127.0.0.1:3000/data/#{tenantId}/inbox');
//Set addressbook url and the load balancer authentication token
configurator_1.default.setAddressBookUrl('http://127.0.0.1:3000/loadbalancer/addressbook');
configurator_1.default.setLBAuthenticationToken('MasterTestToken');
//Set response time header
configurator_1.default.setResponseTimeHeader('X-Response-Time');
//Randomize test objects in list
configurator_1.default.setRandomizeTestLists(true);
//Enable RAM usage repport and configure it
configurator_1.default.setCheckRAMUsage(true);
configurator_1.default.setRAMCheckRequestMethod('Post');
configurator_1.default.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken');
configurator_1.default.setRAMCheckRequestBody({ "command": "inspect" });
configurator_1.default.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip', 'authenticationtoken': 'token' });
configurator_1.default.setMultiRAMCheck(true);
//Enable multi time usage check log
configurator_1.default.setMultiTimeUsageCheck(true);
//Configure the test to be parallel
configurator_1.default.setParallelTest(true);
configurator_1.default.setParallelTestConcurrency(15);
//Configure alert sound
configurator_1.default.setTestFinishSoundAlert(true);
//Set a request parameter to be added to the base url
const requestParamaters = [{ name: 'token', value: 'MasterToken' }];
//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };
//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?, urlAddition?)
const testObject = testObjectFunctions_1.default.createNewTestObject('test1', '00000', requestParamaters, null, requestHeaders);
const testObject2 = testObjectFunctions_1.default.createNewTestObject('test2', '00000', requestParamaters, null);
const testObject3 = testObjectFunctions_1.default.createNewTestObject('test3', '00000', requestParamaters);
//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions_1.default.createNewTestObjectList(testObject, '00000', 1000, false, 1);
const testObjectList2 = testObjectListFunctions_1.default.createNewTestObjectList(testObject2, '00011', 5, true, 1);
const testObjectList3 = testObjectListFunctions_1.default.createNewTestObjectList(testObject3, '00016', 100, false, 1);
//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester_1.default.setTestObjectList(testObjectList);
//Add TestObjectList into the tester (This will not replace the TestObjectList inside the tester, this will merge them)
tester_1.default.addTestObjectList(testObjectList2);
tester_1.default.addTestObjectList(testObjectList3);
//Add a TestObject to the TestObjectList inside the tester
tester_1.default.addTestObject(testObject);
//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester_1.default.addWarmUpTestObject(testObject, 100);
//Start the tests
tester_1.default.startTest();
