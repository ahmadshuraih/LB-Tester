import configurator from '../../configurations/configurator';
import testObjectFunctions from '../../functions/testObjectFunctions';
import testObjectListFunctions from '../../functions/testObjectListFunctions';
import tester from '../../tester/tester';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('https://lbtest.latestcollection.fashion/loadbalancer/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Randomize test objects in list
configurator.setRandomizeTestLists(true);

//Enable RAM usage repport and configure it
configurator.setCheckRAMUsage(true);
configurator.setRAMCheckRequestMethod('Post');
configurator.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken');
configurator.setRAMCheckRequestBody({ "command": "inspect" });
configurator.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' });
configurator.setMultiRAMCheck(true);

//Enable multi time usage check log
configurator.setMultiTimeUsageCheck(true);

//Configure the test to be parallel
configurator.setParallelTest(true);
configurator.setParallelTestConcurrency(10);

//Configure alert sound
configurator.setTestFinishSoundAlert(true);

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'sid', value: 'MasterTestToken' } ];

//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };

//create test object
const testObject1 = testObjectFunctions.createNewTestObject('Test of tenant id: 443', '443', requestParamaters, null, requestHeaders, '/transaction/2020');
//create test object list
const testObjectList1 = testObjectListFunctions.createNewTestObjectList(testObject1, '443', 20, true, 1);

//add the test object list to the tester
tester.addTestObjectList(testObjectList1);
//Add warm up test object and the total warm up rounds
tester.addWarmUpTestObject(testObject1, 5);

//create test object
const testObject2 = testObjectFunctions.createNewTestObject('Test of tenant id: 91936', '91936', requestParamaters, null, requestHeaders, '/transaction/2021');
//create test object list
const testObjectList2 = testObjectListFunctions.createNewTestObjectList(testObject2, '91936', 20, true, 1);

//add the test object list to the tester
tester.addTestObjectList(testObjectList2);
//Add warm up test object and the total warm up rounds
tester.addWarmUpTestObject(testObject2, 5);


//Start the tests
tester.startTest();