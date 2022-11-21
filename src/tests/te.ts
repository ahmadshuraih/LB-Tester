import configurator from '../configurations/configurator';
import testObjectFunctions from '../functions/testObjectFunctions';
import testObjectListFunctions from '../functions/testObjectListFunctions';
import tester from '../tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('http://localhost:3100/data/#{tenantId}/layout');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('http://localhost:3100/loadbalancer/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Set response time header
configurator.setResponseTimeHeader('X-LB-Response-Time');

//Randomize test objects in list
configurator.setRandomizeTestLists(true);

//Enable RAM usage repport and configure it
configurator.setCheckRAMUsage(true);
configurator.setRAMCheckRequestMethod('Post');
configurator.setRAMCheckRequestUrl('http://localhost:3100/loadbalancer/data?token=MasterToken');
configurator.setRAMCheckRequestBody({ "command": "inspect" });
configurator.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' });
configurator.setMultiRAMCheck(true);

//Enable multi time usage check log
configurator.setMultiTimeUsageCheck(true);

//Configure the test to be parallel
configurator.setParallelTest(true);
configurator.setParallelTestConcurrency(5);

//Configure alert sound
configurator.setTestFinishSoundAlert(false);

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'token', value: 'SampleToken' } ];

//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };

//create test object
const testObject1 = testObjectFunctions.createNewTestObject('Test of tenant id: 00000', '00000', requestParamaters, null, requestHeaders, '/transaction/2020');
//create test object list
const testObjectList1 = testObjectListFunctions.createNewTestObjectList(testObject1, '00000', 500, true, 1);

//add the test object list to the tester
tester.addTestObjectList(testObjectList1);
//Add warm up test object and the total warm up rounds
tester.addWarmUpTestObject(testObject1, 100);


//Start the tests
tester.startTest();