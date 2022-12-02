"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const configurator_1 = __importDefault(require("../configurations/configurator"));
const testchecker_1 = __importDefault(require("../checker/testchecker"));
const logger_1 = __importDefault(require("../logger/logger"));
const chalk_1 = __importDefault(require("chalk"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const perf_hooks_1 = require("perf_hooks");
const testObjectListFunctions_1 = __importDefault(require("../functions/testObjectListFunctions"));
const testObjectFunctions_1 = __importDefault(require("../functions/testObjectFunctions"));
let finalTestObjects;
const warmUpTestObjects = [];
let totalWarmUpRounds = 0;
let parallelCounter = 0;
/**
 * Returns `Promise<TestCallResponse>`.
 *
 * This function calls the api on itself.
 */
async function callApi(options) {
    const responseTimeHeader = configurator_1.default.getResponseTimeHeader();
    try {
        const mainResponse = await (0, axios_1.default)({
            method: configurator_1.default.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        const response = { status: mainResponse.status, headers: { 'x-server-name': mainResponse.headers['x-server-name'], 'x-server-port': mainResponse.headers['x-server-port'] } };
        response.headers[responseTimeHeader] = mainResponse.headers[responseTimeHeader.toLowerCase()];
        return { succeed: true, response };
    }
    catch (error) {
        if (error.response === undefined) {
            const headers = {};
            headers[responseTimeHeader] = '0ms';
            const response = { headers };
            error['response'] = response;
        }
        else if (error.response.headers === undefined) {
            const headers = {};
            headers[responseTimeHeader] = '0ms';
            error.response['headers'] = headers;
        }
        else if (error.response.headers[responseTimeHeader.toLowerCase()] === undefined)
            error.response.headers[responseTimeHeader] = '0ms';
        else
            error.response.headers[responseTimeHeader] = error.response.headers[responseTimeHeader.toLowerCase()];
        return { succeed: false, error, response: error.response };
    }
}
/**
 * Returns `Promise<TestRAMUsage>`.
 *
 * This function calls the RAM usage api on itself.
 */
async function callRAMUsageApi(body) {
    try {
        const response = await (0, axios_1.default)({
            method: configurator_1.default.getRAMCheckRequestMethod(),
            url: configurator_1.default.getRAMCheckRequestUrl(),
            data: getRAMBody(body),
            headers: configurator_1.default.getRAMCheckRequestHeaders()
        });
        return { totalRAM: response.data['MAX_BYTES_IN_MEMORY'], usedRAM: response.data['usedBytesInMemory'] };
    }
    catch (error) {
        return { totalRAM: 0, usedRAM: 0 };
    }
}
/**
 * Returns `object`.
 *
 * This function decides whether the RAM usage will use the body in configurations or the body has been sent with the tenantId from the tests.
 */
function getRAMBody(body) {
    return (configurator_1.default.isMultiRAMCheck()) ? body : configurator_1.default.getRAMCheckRequestBody();
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
    if (configurator_1.default.isExpectationsUsingAddressBook()) {
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
            if (configurator_1.default.isRandomizeTestLists())
                await randomSortTestObjectsList(finalTestObjects.testObjects);
            return true;
        }
    }
    return true;
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
 * Returns `void`.
 *
 * Play beep sound
 */
async function beep() {
    if (configurator_1.default.isTestFinishSoundAlert()) {
        if (process.platform === "win32") {
            await Promise.resolve().then(() => __importStar(require("child_process"))).then(child_process => {
                child_process.exec("powershell.exe [console]::beep(1000,700)");
                setTimeout(function () { child_process.exec("powershell.exe [console]::beep(1000,700)"); }, 1200);
                setTimeout(function () { child_process.exec("powershell.exe [console]::beep(1000,2000)"); }, 2500);
            });
        }
        else if (process.platform === "darwin") {
            Promise.resolve().then(() => __importStar(require("child_process"))).then(child_process => { child_process.exec("afplay /System/Library/Sounds/Glass.aiff"); });
        }
    }
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the warming up
 */
async function doWarmUp(multibar) {
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: warming up phase has been started...\n`);
    const warmUpBar = multibar.create(totalWarmUpRounds, 0);
    for (const warmUpTestObject of warmUpTestObjects) {
        if (warmUpTestObject.testObject !== null && warmUpTestObject.rounds > 0) {
            const testerOptions = testObjectFunctions_1.default.toTesterOptions(warmUpTestObject.testObject);
            for (let i = 0; i < warmUpTestObject.rounds; i++) {
                await callApi(testerOptions);
                if (configurator_1.default.isCheckRAMUsage()) {
                    const body = { command: "inspect", tenantId: warmUpTestObject.testObject.tenantId };
                    logger_1.default.addWarmpUpRAMUsage((await callRAMUsageApi(body)).usedRAM);
                }
                warmUpBar.increment();
            }
        }
    }
    multibar.stop();
    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: processed warm ups ${totalWarmUpRounds}/${totalWarmUpRounds}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: warming up phase has been finished\n`);
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the tests sequentially
 */
async function doSequentialTests(testCheckList, multibar) {
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: sequential test phase has been started...\n`);
    const sequentialBar = multibar.create(finalTestObjects.testObjects.length, 0);
    const testStartTime = perf_hooks_1.performance.now();
    for (const testObject of finalTestObjects.testObjects) {
        const testerOptions = testObjectFunctions_1.default.toTesterOptions(testObject);
        await callApi(testerOptions).then(async (testCallResponse) => {
            if (configurator_1.default.isCheckRAMUsage()) {
                const body = { command: "inspect", tenantId: testObject.tenantId };
                testCallResponse.testRAMUsage = (await callRAMUsageApi(body)).usedRAM;
            }
            testCheckList.push({ testObject, testerOptions, testCallResponse });
        });
        sequentialBar.increment();
    }
    logger_1.default.setTestProcessDuration(perf_hooks_1.performance.now() - testStartTime);
    multibar.stop();
    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: processed tests ${finalTestObjects.testObjects.length}/${finalTestObjects.testObjects.length}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: sequential test phase has been finished\n`);
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs one of the parallel tests
 */
async function doOneParallelTest(testObject, testCheckList) {
    const testerOptions = testObjectFunctions_1.default.toTesterOptions(testObject);
    await callApi(testerOptions).then(async (testCallResponse) => {
        if (configurator_1.default.isCheckRAMUsage()) {
            const body = { command: "inspect", tenantId: testObject.tenantId };
            testCallResponse.testRAMUsage = (await callRAMUsageApi(body)).usedRAM;
        }
        testCheckList.push({ testObject, testerOptions, testCallResponse });
    });
    parallelCounter++;
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs a batch of parallel tests. It plays the rule of a user.
 */
async function doBatchParallelTests(testObjectsBatch, testCheckList, multibar) {
    const concurrentBar = multibar.create(testObjectsBatch.length, 0);
    for (const testObject of testObjectsBatch) {
        await doOneParallelTest(testObject, testCheckList);
        concurrentBar.increment();
    }
}
/**
 * Returns `TestObject[][]`.
 *
 * This function splits the testObjectsList into batches depending on concurrency number.
 */
function splitListIntoBatches(testObjects, batchCount) {
    const batches = [];
    while (testObjects.length) {
        const batchSize = Math.ceil(testObjects.length / batchCount--);
        const batch = testObjects.slice(0, batchSize);
        batches.push(batch);
        testObjects = testObjects.slice(batchSize);
    }
    return batches;
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the tests parallel.
 */
async function doParallelTests(testCheckList, multibar) {
    const concurrency = configurator_1.default.getParallelTestConcurrency();
    const testBatchesList = splitListIntoBatches(finalTestObjects.testObjects, concurrency);
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: parallel test phase has been started...\n`);
    const promises = testBatchesList.map((testObjectsBatch) => doBatchParallelTests(testObjectsBatch, testCheckList, multibar));
    const testStartTime = perf_hooks_1.performance.now();
    await Promise.all(promises);
    multibar.stop();
    logger_1.default.setTestProcessDuration(perf_hooks_1.performance.now() - testStartTime);
    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: processed tests ${parallelCounter}/${finalTestObjects.testObjects.length}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: parallel test phase has been finished\n`);
    parallelCounter = 0;
}
/**
 * Returns `Promise<void>`.
 *
 * This function runs the warmup and tests functions
 */
async function startTest() {
    // create multibar container
    const multibar = new cli_progress_1.default.MultiBar({ clearOnComplete: false, hideCursor: true, forceRedraw: true }, cli_progress_1.default.Presets.shades_grey);
    const testCheckList = [];
    if (await setTestObjectsAddresses()) {
        const warmUpStartTime = perf_hooks_1.performance.now();
        if (warmUpTestObjects.length > 0) {
            await doWarmUp(multibar);
            logger_1.default.setWarmUpProcessDuration(perf_hooks_1.performance.now() - warmUpStartTime);
        }
        else {
            console.log(chalk_1.default.red("There are no warm up test objects added. The testing phase will continue without warming up!!!\n"));
        }
        if (finalTestObjects.testObjects.length > 0) {
            //Get current RAM details before starting testing and after warming up
            const usedRAMBeforeTesting = await callRAMUsageApi({ command: "inspect" });
            //Add the startup RAM usage as the first value in plotting list at index 0 and set the total RAM capacity
            logger_1.default.addRAMUsageAndCapacity(usedRAMBeforeTesting);
            if (configurator_1.default.isParallelTest()) {
                await doParallelTests(testCheckList, multibar);
            }
            else {
                await doSequentialTests(testCheckList, multibar);
            }
            console.log(`[${new Date().toLocaleTimeString()}] LBTester: logging phase has been started...\n`);
            await testchecker_1.default.check(testCheckList);
            logger_1.default.log();
        }
        else {
            console.log(chalk_1.default.red(`[${new Date().toLocaleTimeString()}] LBTester:There are no test objects added for testing!!!\nLBTester has been finished without testing.\n`));
        }
    }
    await beep();
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
