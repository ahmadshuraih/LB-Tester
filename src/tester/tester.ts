import axios from 'axios';
import configurator from '../configurations/configurator';
import { performance } from 'perf_hooks';
import testchecker from '../checker/testchecker';
import logger from '../logger/logger';
import { TestObject } from '../model/TestObject';
import { TestCallResponse, TestCheckObject, TesterOptions } from '../types';

let finalTestObjects: TestObject[] = [];

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
        return {succeed: false, error};
    }
}

/**
 * Returns `void`.
 * 
 * This function sets a test objects list into the tester
 */
function setTestObjects(testObjects: TestObject[]): void {
    finalTestObjects = testObjects;
}

/**
 * Returns `void`.
 * 
 * This function adds a test object into the test objects list
 */
function addTestObject(testObject: TestObject): void {
    finalTestObjects.push(testObject);
}

/**
 * Returns `TestObject[]`.
 * 
 * This function gets the test objects from tester
 */
function getTestObjects(): TestObject[] {
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

    for (const testObject of finalTestObjects) {
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
    setTestObjects,
    addTestObject,
    getTestObjects,
    startTest
}