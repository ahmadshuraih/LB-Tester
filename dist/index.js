"use strict";
//This file is to show an example of how to use this LBTester and to test it during implementing it
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurator_1 = __importDefault(require("./configurations/configurator"));
const RequestParameter_1 = require("./model/RequestParameter");
const TestObject_1 = require("./model/TestObject");
const tester_1 = __importDefault(require("./tester/tester"));
configurator_1.default.setBaseUrl('http://127.0.0.1:3000/data/98765/inbox');
const requestParamaters = [new RequestParameter_1.RequestParameter('token', 'MasterToken')];
let testObject = new TestObject_1.TestObject('test1', 'Abo-ward', '3000', '00000', requestParamaters, null, {});
let testObject2 = new TestObject_1.TestObject('test2', 'Abo-ward', '3000', '00000', requestParamaters);
let testObject3 = new TestObject_1.TestObject('test3', 'Abo-ward', '3000', '00000', requestParamaters);
tester_1.default.addTestObject(testObject);
tester_1.default.addTestObject(testObject2);
tester_1.default.addTestObject(testObject3);
tester_1.default.startTest();
