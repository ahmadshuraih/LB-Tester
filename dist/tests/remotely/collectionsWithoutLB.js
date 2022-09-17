"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
//This file is to test the requests to the server without using the Load Balancer
const axios_1 = __importDefault(require("axios"));
const configurator_1 = __importDefault(require("../../configurations/configurator"));
const testObjectFunctions_1 = __importDefault(require("../../functions/testObjectFunctions"));
const testObjectListFunctions_1 = __importDefault(require("../../functions/testObjectListFunctions"));
const tester_1 = __importDefault(require("../../tester/tester"));
//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator_1.default.setBaseUrl('https://lbtest.latestcollection.fashion/3000-data/#{tenantId}/sku');
//Set addressbook url and the load balancer authentication token
configurator_1.default.setAddressBookUrl('https://lbtest.latestcollection.fashion/loadbalancer/addressbook');
configurator_1.default.setLBAuthenticationToken('MasterTestToken');
//Enable RAM usage repport and configure it
configurator_1.default.setCheckRAMUsage(true);
configurator_1.default.setRAMCheckRequestMethod('Post');
configurator_1.default.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/data?token=MasterTestToken');
configurator_1.default.setRAMCheckRequestBody({ "command": "inspect" });
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
        const tenantIds = [];
        for (const collection of collections) {
            if (collection.schema === 'sku') { //If collection schema is sku
                const tenantId = collection.name.substring(0, collection.name.indexOf('/'));
                if (!tenantIds.includes(tenantId)) { //Check if the tenantId has been already added using this list
                    //create test object
                    const testObject = testObjectFunctions_1.default.createNewTestObject(`Test of tenant id: ${tenantId}`, tenantId, requestParamaters, null, requestHeaders);
                    //create test object list
                    const testObjectList = testObjectListFunctions_1.default.createNewTestObjectList(testObject, tenantId, roundPerTestObject, true, 1);
                    //add the test object list to the tester
                    tester_1.default.addTestObjectList(testObjectList);
                    //Add warm up test object and the total warm up rounds
                    tester_1.default.addWarmUpTestObject(testObject, 1);
                    tenantIds.push(tenantId);
                }
            }
            //Stop creating object lists when the limit equals the created lists
            if (totalTestObjectsToTest === tenantIds.length)
                break;
        }
        console.log(`Tester prepaired with ${tenantIds.length} tenants and ${roundPerTestObject} rounds per tenant.\nTotal test requests: ${tenantIds.length * roundPerTestObject}`);
    }
    else {
        console.log("Failed to get the data from the given colleactionsUrl");
    }
}
//Prepair the tester with TestObjects
prepairTesterWithTestObjects(50, 10).then(() => {
    //Start the tests
    tester_1.default.startTest();
});
