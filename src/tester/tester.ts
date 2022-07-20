import axios from 'axios';
import configurator from '../configurations/configurator';
import { performance } from 'perf_hooks';
import testchecker from '../checker/testchecker';
import logger from '../logger/logger';
import { TestObject } from '../model/TestObject';
import { TestCallResponse, TestCheckObject, TesterOptions } from '../types';
import { TestObjectList } from '../model/TestObjectList';

let finalTestObjects: TestObjectList;

/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 * 
 * This function calls the api on itself.
 */
async function callApi(options: TesterOptions): Promise<TestCallResponse> {
    try {
        let response = await axios({
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
    finalTestObjects.addTestObject(testObject);
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
            finalTestObjects.addTestObject(testObject);
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
 * Returns `Promise<void>`.
 * 
 * This function starts the tests
 */
async function startTest(): Promise<void> {
    let testChechList: TestCheckObject[] = [];
    console.log("LBTester has been started...\n");

    for (const testObject of finalTestObjects.testObjects) {
        const testerOptions = testObject.toTesterOptions();
        const startTime = performance.now();
        await callApi(testerOptions).then((testCallResponse) => { 
            testCallResponse.timeSpent = performance.now() - startTime;
            testChechList.push({testObject, testerOptions, testCallResponse});
        });
    }

    testchecker.check(testChechList).then(() => console.log("LBTester has been finished ;-)\n"));

    logger.log();
}

export default {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    startTest
}