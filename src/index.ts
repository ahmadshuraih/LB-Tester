//This file is to show an example of how to use this LBTester and to test it during implementing it

import configurator from './configurations/configurator';
import { RequestParameter } from './model/RequestParameter';
import { TestObject } from './model/TestObject';
import tester from './tester/tester';

configurator.setBaseUrl('http://127.0.0.1:3000/data/98765/inbox');

const requestParamaters = [new RequestParameter('token','MasterToken')];

let testObject = new TestObject('test1', 'Abo-ward', '3000', '00000', requestParamaters, null, {});
let testObject2 = new TestObject('test2', 'Abo-ward', '3000', '00000', requestParamaters);
let testObject3 = new TestObject('test3', 'Abo-ward', '3000', '00000', requestParamaters);

tester.addTestObject(testObject);
tester.addTestObject(testObject2);
tester.addTestObject(testObject3);
tester.startTest();