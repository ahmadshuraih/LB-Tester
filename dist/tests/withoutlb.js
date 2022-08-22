"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//This file is to test the requests to the server without using the Load Balancer
const configurator_1 = __importDefault(require("../configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("../functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("../functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("../tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('http://127.0.0.1:3000/data/#{tenantId}/layout');
//Set a request parameter to be added to the base url
const requestParamaters = [{ name: 'token', value: 'SampleToken' }];
//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = testObjectFunctions_1.default.createNewTestObject('test', '00000', requestParamaters);
//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions_1.default.createNewTestObjectList(testObject, '00000', 500, true, 1);
//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester_1.default.setTestObjectList(testObjectList);
//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester_1.default.setWarmUp(testObject, 100);
//Start the tests
tester_1.default.startTest();
