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
const chalk_1 = __importDefault(require("chalk"));
const perf_hooks_1 = require("perf_hooks");
const testObjectListFunctions_1 = __importDefault(require("../functions/testObjectListFunctions"));
const testObjectFunctions_1 = __importDefault(require("../functions/testObjectFunctions"));
let finalTestObjects;
let warmUpRounds = 0;
let warmUpObject;
/**
 * Returns `Promise<TestCallResponse>`.
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
 * Returns `Promise<AddressBook | any>`.
 *
 * This function calls the api of the loadbalancer on itself.
 */
async function getAddressBook() {
    try {
        const response = await (0, axios_1.default)({
            method: 'Get',
            url: configurator_1.default.getAddressBookUrl(),
            data: {},
            headers: { authenticationtoken: configurator_1.default.getLBAuthenticationToken() }
        });
        return response.data;
    }
    catch (error) {
        return null;
    }
}
/**
 * Returns `Promise<boolean>`.
 *
 * This function calls getAddressBook function and assigns the expected server name and port for all TestObjects including the warmUpTestObject.
 */
async function setTestObjectsAddresses() {
    const addressBook = await getAddressBook();
    if (addressBook === null) {
        console.log(chalk_1.default.red("\nError: Something went wrong while trying to get the address book from the load balancer.\nPlease check if the load balancer is running!!!\n"));
        return false;
    }
    else {
        console.log('Preparing test objects for testing...\n');
        //Set expected server name and port for warm up object
        warmUpObject.expectedServerName = addressBook[warmUpObject.tenantId].serverName;
        warmUpObject.expectedServerPort = `${addressBook[warmUpObject.tenantId].serverPort}`;
        //Set expected server name and port for test objects in finalTestObjects list
        for (let i = 0; i < finalTestObjects.testObjects.length; i++) {
            if (addressBook[finalTestObjects.testObjects[i].tenantId]) {
                finalTestObjects.testObjects[i].expectedServerName = addressBook[finalTestObjects.testObjects[i].tenantId].serverName;
                finalTestObjects.testObjects[i].expectedServerPort = `${addressBook[finalTestObjects.testObjects[i].tenantId].serverPort}`;
            }
            else {
                console.log(chalk_1.default.red(`Tenant with id: ${finalTestObjects.testObjects[i].tenantId} is not found in addressbook!!!`));
                return false;
            }
        }
        await randomSortTestObjectsList(finalTestObjects.testObjects);
        return true;
    }
}
/**
 * Returns `Promise<void>`.
 *
 * This function resorts the testObjects list randomly.
 */
async function randomSortTestObjectsList(testObjects) {
    const rand = (index) => Math.floor(Math.random() * index);
    function swap(firstIndex, secondIndex) {
        const testObject = testObjects[firstIndex];
        testObjects[firstIndex] = testObjects[secondIndex];
        testObjects[secondIndex] = testObject;
        return testObjects;
    }
    function shuffle() {
        let lastIndex = testObjects.length;
        let index;
        while (lastIndex > 0) {
            index = rand(lastIndex);
            swap(index, --lastIndex);
        }
    }
    shuffle();
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
    testObjectListFunctions_1.default.addTestObjectToList(finalTestObjects, testObject);
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
            testObjectListFunctions_1.default.addTestObjectToList(finalTestObjects, testObject);
        }
    }
}
/**
 * Returns `TestObjectList`.
 *
 * This function gets the test objects from tester
 */
function getTestObjectList() {
    return finalTestObjects;
}
/**
 * Returns `void`.
 *
 * This function configures the warm up before start the tests
 */
function setWarmUp(testObject, rounds) {
    warmUpObject = testObject;
    warmUpRounds = rounds;
}
/**
 * Returns `Promise<void>`.
 *
 * This function starts the tests
 */
async function startTest() {
    const testChechList = [];
    if (await setTestObjectsAddresses()) {
        if (warmUpObject !== null && warmUpRounds > 0) {
            console.log("LBTester warming up fase has been started...\n");
            const testerOptions = testObjectFunctions_1.default.toTesterOptions(warmUpObject);
            for (let i = 0; i < warmUpRounds; i++) {
                await callApi(testerOptions);
            }
            console.log("LBTester warming up fase has been finished\n");
        }
        console.log("LBTester test fase has been started...\n");
        for (const testObject of finalTestObjects.testObjects) {
            const testerOptions = testObjectFunctions_1.default.toTesterOptions(testObject);
            const startTime = perf_hooks_1.performance.now();
            await callApi(testerOptions).then((testCallResponse) => {
                testCallResponse.timeSpent = perf_hooks_1.performance.now() - startTime;
                testChechList.push({ testObject, testerOptions, testCallResponse });
            });
        }
        console.log("LBTester test fase has been finished\n");
        console.log("LBTester logging fase has been started...\n");
        await testchecker_1.default.check(testChechList);
        logger_1.default.log();
    }
}
exports.default = {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    setWarmUp,
    startTest
};
