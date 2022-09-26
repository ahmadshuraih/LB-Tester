/* eslint-disable @typescript-eslint/no-explicit-any */
//This file is to test the requests to the server without using the Load Balancer
import axios from 'axios';
import configurator from '../../configurations/configurator';
import testObjectFunctions from '../../functions/testObjectFunctions';
import testObjectListFunctions from '../../functions/testObjectListFunctions';
import tester from '../../tester/tester';
import { CallResponse, Collection } from '../../types';

//Set the base url
//#{tenantId} will be replaced with the given tenantId
configurator.setBaseUrl('https://lbtest.latestcollection.fashion/data/#{tenantId}');

//Set addressbook url and the load balancer authentication token
configurator.setAddressBookUrl('https://lbtest.latestcollection.fashion/loadbalancer/addressbook');
configurator.setLBAuthenticationToken('MasterTestToken');

//Enable RAM usage repport and configure it
configurator.setCheckRAMUsage(true);
configurator.setRAMCheckRequestMethod('Post');
configurator.setRAMCheckRequestUrl('https://lbtest.latestcollection.fashion/data?token=MasterTestToken');
configurator.setRAMCheckRequestBody({ "command": "inspect" });

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
        const requests: string[] = [];

        for (const collection of collections) {
            if (collection.schema === 'transaction') { //If collection schema is transaction
                const tenantId = collection.name.substring(0, collection.name.indexOf('/'));
                const urlAddition = collection.name.substring(collection.name.indexOf('/'), collection.name.length);

                if (!requests.includes(collection.name) && tenantId.match("[0-9]+")) { //Check if the tenantId has been not already added using this list and is a number
                    //create test object
                    const testObject = testObjectFunctions.createNewTestObject(`Test of tenant id: ${tenantId}`, tenantId, requestParamaters, null, requestHeaders, urlAddition);
                    //create test object list
                    const testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, tenantId, roundPerTestObject, true, 1);
                    //add the test object list to the tester
                    tester.addTestObjectList(testObjectList);
                    //Add warm up test object and the total warm up rounds
                    tester.addWarmUpTestObject(testObject, 1);

                    requests.push(collection.name);
                }
            }

            //Stop creating object lists when the limit equals the created lists
            if (totalTestObjectsToTest === requests.length) break;
        }

        console.log(`Tester prepaired with ${requests.length} requests and ${roundPerTestObject} rounds per tenant.\nTotal test requests: ${requests.length * roundPerTestObject}`);
    } else {
        console.log("Failed to get the data from the given colleactionsUrl");
    }
}

//Prepair the tester with TestObjects
prepairTesterWithTestObjects(5000, 2).then(() => {
    //Start the tests
    tester.startTest();
});