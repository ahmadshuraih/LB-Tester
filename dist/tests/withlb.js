"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//This file is to test the requests to the server using the Load Balancer
const configurator_1 = __importDefault(require("../configurations/configurator"));
const tester_1 = __importDefault(require("../tester/tester"));
const RequestParameter_1 = require("../model/RequestParameter");
const TestObject_1 = require("../model/TestObject");
const TestObjectList_1 = require("../model/TestObjectList");
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('http://127.0.0.1:3100/data/#{tenantId}/layout');
//Set a request parameter to be added to the base url
const requestParamaters = [new RequestParameter_1.RequestParameter('token', 'SampleToken')];
//Create TestObject(s)
//TestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = new TestObject_1.TestObject('test2', 'Abo-ward', '3000', '00000', requestParamaters);
//Generate TestObjects inside a TestObjectList based on a TestObject
//TestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = new TestObjectList_1.TestObjectList(testObject, '00000', 1000, true, 1);
//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester_1.default.setTestObjectList(testObjectList);
//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester_1.default.setWarmUp(testObject, 100);
//Start the tests
tester_1.default.startTest();
