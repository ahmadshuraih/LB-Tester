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
const warmUpTestObjects = [];
let totalWarmUpRounds = 0;
/**
 * Returns `Promise<TestCallResponse>`.
 *
 * This function calls the api on itself.
 */
async function callApi(options) {
    try {
        const mainResponse = await (0, axios_1.default)({
            method: configurator_1.default.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        const response = { status: mainResponse.status, headers: { 'x-server-name': mainResponse.headers['x-server-name'], 'x-server-port': mainResponse.headers['x-server-port'] } };
        return { succeed: true, response };
    }
    catch (error) {
        return { succeed: false, error, response: error.response };
    }
}
/**
 * Returns `Promise<TestRAMUsage>`.
 *
 * This function calls the RAM usage api on itself.
 */
async function callRAMUsageApi() {
    try {
        const response = await (0, axios_1.default)({
            method: configurator_1.default.getRAMCheckRequestMethod(),
            url: configurator_1.default.getRAMCheckRequestUrl(),
            data: configurator_1.default.getRAMCheckRequestBody(),
            headers: { 'Accept-Encoding': 'gzip' }
        });
        return { totalRAM: response.data['MAX_BYTES_IN_MEMORY'], usedRAM: response.data['usedBytesInMemory'] };
    }
    catch (error) {
        return { totalRAM: 0, usedRAM: 0 };
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
        //Set expected server name and port for warm up objects
        for (const warmUpTestObject of warmUpTestObjects) {
            warmUpTestObject.testObject.expectedServerName = addressBook[warmUpTestObject.testObject.tenantId].serverName;
            warmUpTestObject.testObject.expectedServerPort = `${addressBook[warmUpTestObject.testObject.tenantId].serverPort}`;
        }
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
 * Add TestObject and rounds total per object to the warmup list
 */
function addWarmUpTestObject(testObject, rounds) {
    warmUpTestObjects.push({ testObject, rounds });
    totalWarmUpRounds += rounds;
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the warming up
 */
async function doWarmUp() {
    console.log("LBTester: warming up fase has been started...\n");
    let counter = 0;
    for (const warmUpTestObject of warmUpTestObjects) {
        if (warmUpTestObject.testObject !== null && warmUpTestObject.rounds > 0) {
            const testerOptions = testObjectFunctions_1.default.toTesterOptions(warmUpTestObject.testObject);
            for (let i = 0; i < warmUpTestObject.rounds; i++) {
                counter++;
                process.stdout.write(`LBTester: processing warm up ${counter}/${totalWarmUpRounds}\r`);
                await callApi(testerOptions);
            }
        }
    }
    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`LBTester: processed warm ups ${counter}/${totalWarmUpRounds}`);
    console.log("\nLBTester: warming up fase has been finished\n");
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the tests
 */
async function doTests(testCheckList) {
    console.log("LBTester: test fase has been started...\n");
    let counter = 0;
    for (const testObject of finalTestObjects.testObjects) {
        counter++;
        process.stdout.write(`LBTester: processing test ${counter}/${finalTestObjects.testObjects.length}\r`);
        const testerOptions = testObjectFunctions_1.default.toTesterOptions(testObject);
        const startTime = perf_hooks_1.performance.now();
        await callApi(testerOptions).then(async (testCallResponse) => {
            testCallResponse.timeSpent = perf_hooks_1.performance.now() - startTime;
            if (configurator_1.default.getCheckRAMUsage())
                testCallResponse.testRAMUsage = (await callRAMUsageApi()).usedRAM;
            testCheckList.push({ testObject, testerOptions, testCallResponse });
        });
    }
    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`LBTester: processed tests ${counter}/${finalTestObjects.testObjects.length}`);
    console.log("\nLBTester: test fase has been finished\n");
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the warmup and tests functions
 */
async function startTest() {
    const testChechList = [];
    if (await setTestObjectsAddresses()) {
        if (warmUpTestObjects.length > 0)
            await doWarmUp();
        else
            console.log(chalk_1.default.red("There are no warm up test objects added. The testing fase will continue without warming up!!!\n"));
        if (finalTestObjects.testObjects.length > 0) {
            //Get current RAM details before starting testing and after warming up
            const usedRAMBeforeTesting = await callRAMUsageApi();
            //Add the startup RAM usage as the first value in plotting list at index 0 and set the total RAM capacity
            logger_1.default.addRAMUsageAndCapacity(usedRAMBeforeTesting);
            await doTests(testChechList);
            console.log("LBTester: logging fase has been started...\n");
            await testchecker_1.default.check(testChechList);
            logger_1.default.log();
        }
        else {
            console.log(chalk_1.default.red("There are no test objects added for testing!!!\nLBTester has been finished without testing.\n"));
        }
    }
    configurator_1.default.resetToDefault();
}
exports.default = {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    addWarmUpTestObject,
    startTest
};
