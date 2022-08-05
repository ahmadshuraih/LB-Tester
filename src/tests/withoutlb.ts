//This file is to test the requests to the server without using the Load Balancer
import configurator from '../configurations/configurator';
import tester from '../tester/tester';
import { RequestParameter } from '../model/RequestParameter';
import { TestObject } from '../model/TestObject';
import { TestObjectList } from '../model/TestObjectList';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('http://127.0.0.1:3000/data/#{tenantId}/layout');

//Set a request parameter to be added to the base url
const requestParamaters = [new RequestParameter('token','SampleToken')];

//Create TestObject(s)
//TestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = new TestObject('test2', 'Abo-ward', '3000', '00000', requestParamaters);

//Generate TestObjects inside a TestObjectList based on a TestObject
//TestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = new TestObjectList(testObject, '00000', 10000, true, 1);

//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester.setTestObjectList(testObjectList);

//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester.setWarmUp(testObject, 100);

//Start the tests
tester.startTest();