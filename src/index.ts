//This file is to show an example of how to use this LBTester and to test it during implementing it
import configurator from './configurations/configurator';
import { RequestParameter } from './model/RequestParameter';
import { TestObject } from './model/TestObject';
import { TestObjectList } from './model/TestObjectList';
import tester from './tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('http://127.0.0.1:3000/data/#{tenantId}/inbox');

//Set a request parameter to be added to the base url
const requestParamaters = [new RequestParameter('token','MasterToken')];

//Create TestObject(s)
//TestObject(testName, expectedSrverName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
let testObject = new TestObject('test1', 'Abo-ward', '3000', '00000', requestParamaters, null, {});
let testObject2 = new TestObject('test2', 'Abo-ward', '3000', '00000', requestParamaters);
let testObject3 = new TestObject('test3', 'Abo-ward', '3000', '00000', requestParamaters);

//Generate TestObjects inside a TestObjectList based on a TestObject
//TestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
let testObjectList = new TestObjectList(testObject, '00000', 1000, false, 1);
let testObjectList2 = new TestObjectList(testObject2, '00011', 5, true, 1);
let testObjectList3 = new TestObjectList(testObject3, '00016', 100, false, 1);

//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester.setTestObjectList(testObjectList);

//Add TestObjectList into the tester (This will not replace the TestObjectList inside the tester, this will merge them)
tester.addTestObjectList(testObjectList2);
tester.addTestObjectList(testObjectList3);

//Add a TestObject to the TestObjectList inside the tester
tester.addTestObject(testObject);

//Start the tests
tester.startTest();