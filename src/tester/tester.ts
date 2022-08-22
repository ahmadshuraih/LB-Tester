/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import configurator from '../configurations/configurator';
import testchecker from '../checker/testchecker';
import logger from '../logger/logger';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { AddressBook, TestCallResponse, TestCheckObject, TesterOptions, TestObject, TestObjectList } from '../types';
import testObjectListFunctions from '../functions/testObjectListFunctions';
import testObjectFunctions from '../functions/testObjectFunctions';

let finalTestObjects: TestObjectList;
let warmUpRounds = 0;
let warmUpObject: TestObject;

/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 * 
 * This function calls the api on itself.
 */
async function callApi(options: TesterOptions): Promise<TestCallResponse> {
    try {
        const response = await axios({
            method: configurator.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        return {succeed: true, response};
    } catch (error: any) {
        return {succeed: false, error, response: error.response};
    }
}

/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 * 
 * This function calls the api of the loadbalancer on itself.
 */
 async function getAddressBook(): Promise<AddressBook | any> {
    try {
        const response = await axios({
            method: 'Get',
            url: configurator.getAddressBookUrl(),
            data: {},
            headers: {}
        });
        return response.data;
    } catch (error: any) {
        return null;
    }
}

/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 * 
 * This function calls getAddressBook function and assigns the expected server name and port for all TestObjects including the warmUpTestObject.
 */
async function setTestObjectsAddresses(): Promise<boolean> {
    const addressBook = await getAddressBook();

    if (addressBook === null) {
        console.log(chalk.red("\nError: Something went wrong while trying to get the address book from the load balancer.\nPlease check if the load balancer is running!!!\n"));
        return false;
    } else {
        //Set expected server name and port for warm up object
        warmUpObject.expectedServerName = addressBook[warmUpObject.tenantId].serverName;
        warmUpObject.expectedServerPort = `${addressBook[warmUpObject.tenantId].serverPort}`;

        //Set expected server name and port for test objects in finalTestObjects list
        for (let i = 0; i < finalTestObjects.testObjects.length; i++) {
            if (addressBook[finalTestObjects.testObjects[i].tenantId]) {
                finalTestObjects.testObjects[i].expectedServerName = addressBook[finalTestObjects.testObjects[i].tenantId].serverName;
                finalTestObjects.testObjects[i].expectedServerPort = `${addressBook[finalTestObjects.testObjects[i].tenantId].serverPort}`;
            } else {
                console.log(chalk.red(`Tenant with id: ${finalTestObjects.testObjects[i].tenantId} is not found in addressbook!!!`));
                return false;
            }
        }

        return true;
    }
}

/**
 * Returns `void`.
 * 
 * This function sets a test objects list into the tester
 */
function setTestObjectList(testObjectList: TestObjectList): void {
    finalTestObjects = testObjectList;
}

/**
 * Returns `void`.
 * 
 * This function adds a test object into the test objects list
 */
function addTestObject(testObject: TestObject): void {
    testObjectListFunctions.addTestObjectToList(finalTestObjects, testObject);
}

/**
 * Returns `void`.
 * 
 * This function adds a test object list into the current test objects list
 */
 function addTestObjectList(testObjectList: TestObjectList): void {
    if (finalTestObjects === undefined) {
        setTestObjectList(testObjectList);
    } else {
        for (const testObject of testObjectList.testObjects) {
            testObjectListFunctions.addTestObjectToList(finalTestObjects, testObject);
        }
    }
}

/**
 * Returns `TestObject[]`.
 * 
 * This function gets the test objects from tester
 */
function getTestObjectList(): TestObjectList {
    return finalTestObjects;
}

/**
 * Returns `void`.
 * 
 * This function configures the warm up before start the tests
 */
 function setWarmUp(testObject: TestObject, rounds: number): void {
    warmUpObject = testObject;
    warmUpRounds = rounds;
}

/**
 * Returns `Promise<void>`.
 * 
 * This function starts the tests
 */
async function startTest(): Promise<void> {
    const testChechList: TestCheckObject[] = [];

    if (await setTestObjectsAddresses()) {
        if (warmUpObject !== null && warmUpRounds > 0) {
            console.log("LBTester warming up fase has been started...\n");
            const testerOptions = testObjectFunctions.toTesterOptions(warmUpObject);
            for (let i = 0; i < warmUpRounds; i++) {
                await callApi(testerOptions);
            }
            console.log("LBTester warming up fase has been finished\n")
        }

        console.log("LBTester test fase has been started...\n");

        for (const testObject of finalTestObjects.testObjects) {
            const testerOptions = testObjectFunctions.toTesterOptions(testObject);
            const startTime = performance.now();
            await callApi(testerOptions).then((testCallResponse) => { 
                testCallResponse.timeSpent = performance.now() - startTime;
                testChechList.push({testObject, testerOptions, testCallResponse});
            });
        }

        console.log("LBTester test fase has been finished\n");

        console.log("LBTester logging fase has been started...\n");

        await testchecker.check(testChechList);

        logger.log();
    }
}

export default {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    setWarmUp,
    startTest
}