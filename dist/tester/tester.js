"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const configurator_1 = __importDefault(require("../configurations/configurator"));
const testchecker_1 = __importDefault(require("../checker/testchecker"));
const logger_1 = __importDefault(require("../logger/logger"));
const perf_hooks_1 = require("perf_hooks");
let finalTestObjects;
/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 *
 * This function calls the api on itself.
 */
async function callApi(options) {
    try {
        const response = await (0, axios_1.default)({
            method: configurator_1.default.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        return { succeed: true, response };
    }
    catch (error) {
        return { succeed: false, error, response: error.response };
    }
}
/**
 * Returns `void`.
 *
 * This function sets a test objects list into the tester
 */
function setTestObjectList(testObjectList) {
    finalTestObjects = testObjectList;
}
/**
 * Returns `void`.
 *
 * This function adds a test object into the test objects list
 */
function addTestObject(testObject) {
    finalTestObjects.addTestObject(testObject);
}
/**
 * Returns `void`.
 *
 * This function adds a test object list into the current test objects list
 */
function addTestObjectList(testObjectList) {
    if (finalTestObjects === undefined) {
        setTestObjectList(testObjectList);
    }
    else {
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
function getTestObjectList() {
    return finalTestObjects;
}
/**
 * Returns `Promise<void>`.
 *
 * This function starts the tests
 */
async function startTest() {
    const testChechList = [];
    console.log("LBTester has been started...\n");
    for (const testObject of finalTestObjects.testObjects) {
        const testerOptions = testObject.toTesterOptions();
        const startTime = perf_hooks_1.performance.now();
        await callApi(testerOptions).then((testCallResponse) => {
            testCallResponse.timeSpent = perf_hooks_1.performance.now() - startTime;
            testChechList.push({ testObject, testerOptions, testCallResponse });
        });
    }
    testchecker_1.default.check(testChechList).then(() => console.log("LBTester has been finished ;-)\n"));
    logger_1.default.log();
}
exports.default = {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    startTest
};
