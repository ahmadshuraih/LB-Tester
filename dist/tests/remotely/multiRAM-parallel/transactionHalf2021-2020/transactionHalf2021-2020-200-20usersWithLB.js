"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
//This file is to test the requests to the server without using the Load Balancer
const axios_1 = __importDefault(require("axios"));
const configurator_1 = __importDefault(require("../../../../configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("../../../../functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("../../../../functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("../../../../tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}');
//Set addressbook url and the load balancer authentication token
configurator_1.default.setAddressBookUrl('https://lbtest.latestcollection.fashion/loadbalancer/addressbook');
configurator_1.default.setLBAuthenticationToken('MasterTestToken');
//Randomize test objects in list
configurator_1.default.setRandomizeTestLists(true);
//Enable RAM usage repport and configure it
configurator_1.default.setCheckRAMUsage(true);
configurator_1.default.setRAMCheckRequestMethod('Post');
configurator_1.default.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken');
configurator_1.default.setRAMCheckRequestBody({ "command": "inspect" });
configurator_1.default.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' });
configurator_1.default.setMultiRAMCheck(true);
//Enable multi time usage check log
configurator_1.default.setMultiTimeSpentCheck(true);
//Configure the test to be parallel
configurator_1.default.setParallelTest(true);
configurator_1.default.setParallelTestConcurrency(20);
//Configure alert sound
configurator_1.default.setTestFinishSoundAlert(true);
//Set a request parameter to be added to the base url
const requestParamaters = [{ name: 'sid', value: 'MasterTestToken' }];
//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };
//Call the api of the collections and return the response.
async function callCollectionsApi() {
    try {
        const response = await (0, axios_1.default)({
            method: 'Get',
            url: 'https://lbtest.latestcollection.fashion/data?token=MasterTestToken',
            data: {},
            headers: { 'Accept-Encoding': 'gzip' }
        });
        return { succeed: true, response };
    }
    catch (error) {
        return { succeed: false, error, response: error.response };
    }
}
//Prepair the tester with TestObjects
async function prepairTesterWithTestObjects(totalTestObjectsToTest, roundPerTestObject) {
    const callResponse = await callCollectionsApi();
    if (callResponse.succeed) {
        const collections = callResponse.response.data.collections;
        const collectionNames = [];
        const maxTenantsPerServer = totalTestObjectsToTest / 10;
        const devideList = { 'LC01:3000': 0, 'LC01:3001': 0, 'LC01:3002': 0, 'LC01:3003': 0, 'LC01:3004': 0, 'LC01:3005': 0, 'LC01:3006': 0, 'LC01:3007': 0, 'LC01:3008': 0, 'LC01:3009': 0, 'LC01:30010': maxTenantsPerServer };
        for (const collection of collections) {
            if (collection.name.includes("transaction/2021") || collection.name.includes("transaction/2020")) { //If collection name contains "transaction/2021" or "transaction/2020" so the tests are only for 2021 and 2020
                const tenantId = collection.name.substring(0, collection.name.indexOf('/'));
                const devListKey = `LC01:300${tenantId.at(-1) ?? '10'}`;
                const urlAddition = collection.name.substring(collection.name.indexOf('/'), collection.name.length);
                if (!collectionNames.includes(collection.name) && tenantId.match("[0-9]+") && devideList[devListKey] < maxTenantsPerServer) { //Check if the collection name has been not already added using this list and is a number
                    //create test object
                    const testObject = testObjectFunctions_1.default.createNewTestObject(`Test of tenant id: ${tenantId}`, tenantId, requestParamaters, null, requestHeaders, urlAddition);
                    //create test object list
                    const testObjectList = testObjectListFunctions_1.default.createNewTestObjectList(testObject, tenantId, roundPerTestObject, true, 1);
                    //add the test object list to the tester
                    tester_1.default.addTestObjectList(testObjectList);
                    //Add warm up test object and the total warm up rounds
                    // tester.addWarmUpTestObject(testObject, 1);
                    collectionNames.push(collection.name);
                    devideList[devListKey]++;
                }
            }
            //Stop creating object lists when the limit equals the created lists
            if (totalTestObjectsToTest === collectionNames.length)
                break;
        }
        console.log(devideList);
        console.log(`Tester prepaired with ${collectionNames.length} requests and ${roundPerTestObject} rounds per tenant.\nTotal test requests: ${collectionNames.length * roundPerTestObject}`);
    }
    else {
        console.log("Failed to get the data from the given colleactionsUrl");
    }
}
//Prepair the tester with TestObjects
prepairTesterWithTestObjects(200, 10).then(() => {
    //Start the tests
    tester_1.default.startTest();
});
