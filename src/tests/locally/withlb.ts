//This file is to test the requests to the server using the Load Balancer
import configurator from '../../configurations/configurator';
import testObjectFunctions from '../../functions/testObjectFunctions';
import testObjectListFunctions from '../../functions/testObjectListFunctions';
import tester from '../../tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('http://127.0.0.1:3100/data/#{tenantId}/layout');

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'token', value: 'SampleToken' } ];

//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = testObjectFunctions.createNewTestObject('test', '00000', requestParamaters);

//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, '00000', 500, true, 1);

//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester.setTestObjectList(testObjectList);

//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester.setWarmUp(testObject, 100);

//Start the tests
tester.startTest();