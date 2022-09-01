//This file is to test the requests to the server using the Load Balancer
import configurator from '../../configurations/configurator';
import testObjectFunctions from '../../functions/testObjectFunctions';
import testObjectListFunctions from '../../functions/testObjectListFunctions';
import tester from '../../tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}/system');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('https://lbtest.latestcollection.fashion/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'sid', value: 'MasterTestToken' } ];

//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };

//Create TestObject(s)
//createNewTestObject(testName, expectedServerName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)
const testObject = testObjectFunctions.createNewTestObject('test', '12345', requestParamaters, null, requestHeaders);
const testObject1 = testObjectFunctions.createNewTestObject('test', '00000', requestParamaters, null, requestHeaders);

//Generate TestObjects inside a TestObjectList based on a TestObject
//createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)
const testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, '12345', 50, true, 1);
const testObjectList1 = testObjectListFunctions.createNewTestObjectList(testObject1, '00000', 50, true, 1);

//Set a TestObjectList into the tester (This will replace the TestObjectList inside the tester)
tester.setTestObjectList(testObjectList);
tester.addTestObjectList(testObjectList1);

//Set warm up settings by adding the test object of the warm up and the total warm up rounds
tester.setWarmUp(testObject, 20);

//Start the tests
tester.startTest();