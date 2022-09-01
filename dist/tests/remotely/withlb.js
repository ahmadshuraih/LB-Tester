"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//This file is to test the requests to the server using the Load Balancer
const configurator_1 = __importDefault(require("../../configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("../../functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("../../functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("../../tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}/system');
//Set addressbook url and the load balancer authentication token
configurator_1.default.setAddressBookUrl('https://lbtest.latestcollection.fashion/addressbook');
configurator_1.default.setLBAuthenticationToken('MasterTestToken');
//Set a request parameter to be added to the base url
const requestParamaters = [{ name: 'sid', value: 'MasterTestToken' }];
//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };
//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = testObjectFunctions_1.default.createNewTestObject('test', '12345', requestParamaters, null, requestHeaders);
const testObject1 = testObjectFunctions_1.default.createNewTestObject('test', '00000', requestParamaters, null, requestHeaders);
//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions_1.default.createNewTestObjectList(testObject, '12345', 50, true, 1);
const testObjectList1 = testObjectListFunctions_1.default.createNewTestObjectList(testObject1, '00000', 50, true, 1);
//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester_1.default.setTestObjectList(testObjectList);
tester_1.default.addTestObjectList(testObjectList1);
//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester_1.default.setWarmUp(testObject, 20);
//Start the tests
tester_1.default.startTest();
