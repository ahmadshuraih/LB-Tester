/* eslint-disable @typescript-eslint/no-explicit-any */
//This file is to test the requests to the server without using the Load Balancer
import axios from 'axios';
import configurator from '../../../../configurations/configurator';
import testObjectFunctions from '../../../../functions/testObjectFunctions';
import testObjectListFunctions from '../../../../functions/testObjectListFunctions';
import tester from '../../../../tester/tester';
import { CallResponse, Collection } from '../../../../types';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('https://lbtest.latestcollection.fashion/loadbalancer/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Enable RAM usage repport and configure it
configurator.setCheckRAMUsage(true);
configurator.setRAMCheckRequestMethod('Post');
configurator.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken');
configurator.setRAMCheckRequestBody({ "command": "inspect" });
configurator.setRAMCheckRequestHeaders({ 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' });
configurator.setMultiRAMCheck(true);

//Configure the test to be parallel
configurator.setParallelTest(true);
configurator.setParallelTestConcurrency(45);

//Configure alert sound
configurator.setTestFinishSoundAlert(true);

//Set a request parameter to be added to the base url
const requestParamaters = [ { name: 'sid', value: 'MasterTestToken' } ];

//Set a request headers
const requestHeaders = { 'Accept-Encoding': 'gzip' };


//Call the api of the collections and return the response.
async function callCollectionsApi(): Promise<CallResponse> {
    try {
        const response = await axios({
            method: 'Get',
            url: 'https://lbtest.latestcollection.fashion/data?token=MasterTestToken',
            data: {},
            headers: { 'Accept-Encoding': 'gzip' }
        });
        return {succeed: true, response};
    } catch (error: any) {
        return {succeed: false, error, response: error.response};
    }
}

//Prepair the tester with TestObjects
async function prepairTesterWithTestObjects(totalTestObjectsToTest: number, roundPerTestObject: number): Promise<void> {
    const callResponse = await callCollectionsApi();

    if (callResponse.succeed) {
        const collections: Collection[] = callResponse.response.data.collections;
        const collectionNames: string[] = [];

        for (const collection of collections) {
            if (collection.name.includes("transaction/2021") || collection.name.includes("transaction/2020")) { //If collection name contains "transaction/2021" or "transaction/2020" so the tests are only for 2021 and 2020
                const tenantId = collection.name.substring(0, collection.name.indexOf('/'));
                const urlAddition = collection.name.substring(collection.name.indexOf('/'), collection.name.length);

                if (!collectionNames.includes(collection.name) && tenantId.match("[0-9]+")) { //Check if the collection name has been not already added using this list and is a number
                    //create test object
                    const testObject = testObjectFunctions.createNewTestObject(`Test of tenant id: ${tenantId}`, tenantId, requestParamaters, null, requestHeaders, urlAddition);
                    //create test object list
                    const testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, tenantId, roundPerTestObject, true, 1);
                    //add the test object list to the tester
                    tester.addTestObjectList(testObjectList);
                    //Add warm up test object and the total warm up rounds
                    tester.addWarmUpTestObject(testObject, 1);

                    collectionNames.push(collection.name);
                }
            }

            //Stop creating object lists when the limit equals the created lists
            if (totalTestObjectsToTest === collectionNames.length) break;
        }

        console.log(`Tester prepaired with ${collectionNames.length} requests and ${roundPerTestObject} rounds per tenant.\nTotal test requests: ${collectionNames.length * roundPerTestObject}`);
    } else {
        console.log("Failed to get the data from the given colleactionsUrl");
    }
}

//Prepair the tester with TestObjects
prepairTesterWithTestObjects(5000, 4).then(() => {
    //Start the tests
    tester.startTest();
});