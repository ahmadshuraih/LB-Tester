//This file is to show an example of how to use this LBTester and to test it during implementing it
import configurator from './configurations/configurator';
import testObjectFunctions from './functions/testObjectFunctions';
import testObjectListFunctions from './functions/testObjectListFunctions';
import tester from './tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('http://127.0.0.1:3000/data/#{tenantId}/inbox');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('http://127.0.0.1:3000/loadbalancer/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Enable RAM usage repport and configure it
configurator.setCheckRAMUsage(true);

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'token', value: 'MasterToken' } ];

//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };

//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?, urlAddition?)
const testObject = testObjectFunctions.createNewTestObject('test1', '00000', requestParamaters, null, requestHeaders);
const testObject2 = testObjectFunctions.createNewTestObject('test2', '00000', requestParamaters, null);
const testObject3 = testObjectFunctions.createNewTestObject('test3', '00000', requestParamaters);

//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, '00000', 1000, false, 1);
const testObjectList2 = testObjectListFunctions.createNewTestObjectList(testObject2, '00011', 5, true, 1);
const testObjectList3 = testObjectListFunctions.createNewTestObjectList(testObject3, '00016', 100, false, 1);

//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester.setTestObjectList(testObjectList);

//Add TestObjectList into the tester (This will not replace the TestObjectList inside the tester, this will merge them)
tester.addTestObjectList(testObjectList2);
tester.addTestObjectList(testObjectList3);

//Add a TestObject to the TestObjectList inside the tester
tester.addTestObject(testObject);

//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester.addWarmUpTestObject(testObject, 100);

//Start the tests
tester.startTest();