"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const configurator_1 = __importDefault(require("../configurations/configurator"));
const perf_hooks_1 = require("perf_hooks");
const testchecker_1 = __importDefault(require("../checker/testchecker"));
const logger_1 = __importDefault(require("../logger/logger"));
let finalTestObjects = [];
/**
 * Returns `Promise<AxiosPromise<any> | any>`.
 *
 * This function calls the api on itself.
 */
async function callApi(options) {
    try {
        let response = await (0, axios_1.default)({
            method: configurator_1.default.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        return { succeed: true, response };
    }
    catch (error) {
        return { succeed: false, error };
    }
}
/**
 * Returns `void`.
 *
 * This function sets a test objects list into the tester
 */
function setTestObjects(testObjects) {
    finalTestObjects = testObjects;
}
/**
 * Returns `void`.
 *
 * This function adds a test object into the test objects list
 */
function addTestObject(testObject) {
    finalTestObjects.push(testObject);
}
/**
 * Returns `TestObject[]`.
 *
 * This function gets the test objects from tester
 */
function getTestObjects() {
    return finalTestObjects;
}
/**
 * Returns `Promise<void>`.
 *
 * This function starts the tests
 */
async function startTest() {
    let testChechList = [];
    console.log("LBTester has been started...\n");
    for (const testObject of finalTestObjects) {
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
    setTestObjects,
    addTestObject,
    getTestObjects,
    startTest
};
