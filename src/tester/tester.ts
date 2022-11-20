/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import configurator from '../configurations/configurator';
import testchecker from '../checker/testchecker';
import logger from '../logger/logger';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { AddressBook, TestCallResponse, TestCheckObject, TesterOptions, TestObject, TestObjectList, TestRAMUsage, WarmUpTestObject } from '../types';
import testObjectListFunctions from '../functions/testObjectListFunctions';
import testObjectFunctions from '../functions/testObjectFunctions';

let finalTestObjects: TestObjectList;
const warmUpTestObjects: WarmUpTestObject[] = [];
let totalWarmUpRounds = 0;
let parallelCounter = 0;

/**
 * Returns `Promise<TestCallResponse>`.
 * 
 * This function calls the api on itself.
 */
async function callApi(options: TesterOptions): Promise<TestCallResponse> {
    try {
        const responseTimeHeader = configurator.getResponseTimeHeader();
        const mainResponse = await axios({
            method: configurator.getRequestMethod(),
            url: options.url,
            data: options.data,
            headers: options.headers
        });
        const response = { status: mainResponse.status, headers: { 'x-server-name': mainResponse.headers['x-server-name'], 'x-server-port': mainResponse.headers['x-server-port'] } };
        response.headers[responseTimeHeader] = mainResponse.headers[responseTimeHeader.toLocaleLowerCase()];
        return { succeed: true, response };
    } catch (error: any) {
        return { succeed: false, error, response: error.response };
    }
}

/**
 * Returns `Promise<TestRAMUsage>`.
 * 
 * This function calls the RAM usage api on itself.
 */
async function callRAMUsageApi(body: object): Promise<TestRAMUsage> {
    try {
        const response = await axios({
            method: configurator.getRAMCheckRequestMethod(),
            url: configurator.getRAMCheckRequestUrl(),
            data: getRAMBody(body),
            headers: configurator.getRAMCheckRequestHeaders()
        });
        return { totalRAM: response.data['MAX_BYTES_IN_MEMORY'], usedRAM: response.data['usedBytesInMemory'] };
    } catch (error: any) {
        return { totalRAM: 0, usedRAM: 0 };
    }
}

/**
 * Returns `object`.
 * 
 * This function decides whether the RAM usage will use the body in configurations or the body has been sent with the tenantId from the tests.
 */
function getRAMBody(body: object): object {
    return (configurator.isMultiRAMCheck()) ? body : configurator.getRAMCheckRequestBody();
}

/**
 * Returns `Promise<AddressBook | any>`.
 * 
 * This function calls the api of the loadbalancer on itself.
 */
 async function getAddressBook(): Promise<AddressBook | any> {
    try {
        const response = await axios({
            method: 'Get',
            url: configurator.getAddressBookUrl(),
            data: {},
            headers: { authenticationtoken: configurator.getLBAuthenticationToken() }
        });
        return response.data;
    } catch (error: any) {
        return null;
    }
}

/**
 * Returns `Promise<boolean>`.
 * 
 * This function calls getAddressBook function and assigns the expected server name and port for all TestObjects including the warmUpTestObject.
 */
async function setTestObjectsAddresses(): Promise<boolean> {
    const addressBook = await getAddressBook();

    if (addressBook === null) {
        console.log(chalk.red("\nError: Something went wrong while trying to get the address book from the load balancer.\nPlease check if the load balancer is running!!!\n"));
        return false;
    } else {
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
            } else {
                console.log(chalk.red(`Tenant with id: ${finalTestObjects.testObjects[i].tenantId} is not found in addressbook!!!`));
                return false;
            }
        }

        if (configurator.isRandomizeTestLists()) await randomSortTestObjectsList(finalTestObjects.testObjects);

        return true;
    }
}

/**
 * Returns `Promise<void>`.
 * 
 * This function resorts the testObjects list randomly.
 */
async function randomSortTestObjectsList(testObjects: TestObject[]): Promise<void> {
    const rand = (index: number) => Math.floor(Math.random() * index);

    function swap (firstIndex: number, secondIndex: number) { 
        const testObject = testObjects[firstIndex];
        testObjects[firstIndex] = testObjects[secondIndex];
        testObjects[secondIndex] = testObject;
        return testObjects;
    }

    function shuffle () { 
        let lastIndex = testObjects.length;
        let index: number;
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
 * Returns `TestObjectList`.
 * 
 * This function gets the test objects from tester
 */
function getTestObjectList(): TestObjectList {
    return finalTestObjects;
}

/**
 * Returns `void`.
 * 
 * Add TestObject and rounds total per object to the warmup list
 */
function addWarmUpTestObject(testObject: TestObject, rounds: number): void {
    warmUpTestObjects.push({ testObject, rounds });
    totalWarmUpRounds += rounds;
}

/**
 * Returns `void`.
 * 
 * Play beep sound
 */
async function beep(): Promise<void> {
    if (configurator.isTestFinishSoundAlert()) {
        if (process.platform === "win32") {
            await import("child_process").then(child_process => {
                child_process.exec("powershell.exe [console]::beep(1000,700)");
                setTimeout(function(){child_process.exec("powershell.exe [console]::beep(1000,700)")}, 1200);
                setTimeout(function(){child_process.exec("powershell.exe [console]::beep(1000,2000)")}, 2500);
            });
        } else if (process.platform === "darwin") {
            import("child_process").then(child_process => {child_process.exec("afplay /System/Library/Sounds/Glass.aiff")});
        }
    }
}

/**
 * Returns `Promise<void>`.
 * 
 * This function runs the warming up
 */
async function doWarmUp(): Promise<void> {
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: warming up phase has been started...\n`);
    let counter = 0;

    for (const warmUpTestObject of warmUpTestObjects) {
        if (warmUpTestObject.testObject !== null && warmUpTestObject.rounds > 0) {
            const testerOptions = testObjectFunctions.toTesterOptions(warmUpTestObject.testObject);
            for (let i = 0; i < warmUpTestObject.rounds; i++) {
                counter ++;
                process.stdout.write(`[${new Date().toLocaleTimeString()}] LBTester: processing warm up ${counter}/${totalWarmUpRounds}\r`);
                await callApi(testerOptions);
                if (configurator.isCheckRAMUsage()) {
                    const body = { command: "inspect", tenantId: warmUpTestObject.testObject.tenantId };
                    logger.addWarmpUpRAMUsage((await callRAMUsageApi(body)).usedRAM);
                }
            }
        }
    }

    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: processed warm ups ${counter}/${totalWarmUpRounds}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: warming up phase has been finished\n`)
}

/**
 * Returns `Promise<void>`.
 * 
 * This function runs the tests sequentially
 */
async function doSequentialTests(testCheckList: TestCheckObject[]): Promise<void> {
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: sequential test phase has been started...\n`);
    let counter = 0;
    const testStartTime = performance.now();

    for (const testObject of finalTestObjects.testObjects) {
        const testerOptions = testObjectFunctions.toTesterOptions(testObject);
        await callApi(testerOptions).then(async (testCallResponse) => { 
            if (configurator.isCheckRAMUsage()) {
                const body = { command: "inspect", tenantId: testObject.tenantId };
                testCallResponse.testRAMUsage = (await callRAMUsageApi(body)).usedRAM;
            }
            testCheckList.push({testObject, testerOptions, testCallResponse});
        });
        counter ++;
        process.stdout.write(`[${new Date().toLocaleTimeString()}] LBTester: processed tests ${counter}/${finalTestObjects.testObjects.length}\r`);
    }

    logger.setTestProcessDuration(performance.now() - testStartTime);

    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: processed tests ${counter}/${finalTestObjects.testObjects.length}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: sequential test phase has been finished\n`);
}

/**
 * Returns `Promise<void>`.
 * 
 * This function runs one of the parallel tests
 */
async function doOneParallelTest(testObject: TestObject, testCheckList: TestCheckObject[]): Promise<void> {
    const testerOptions = testObjectFunctions.toTesterOptions(testObject);
    await callApi(testerOptions).then(async (testCallResponse) => { 
        if (configurator.isCheckRAMUsage()) {
            const body = { command: "inspect", tenantId: testObject.tenantId };
            testCallResponse.testRAMUsage = (await callRAMUsageApi(body)).usedRAM;
        }
        testCheckList.push({testObject, testerOptions, testCallResponse});
    });
    parallelCounter ++;
    process.stdout.write(`[${new Date().toLocaleTimeString()}] LBTester: processed tests ${parallelCounter}/${finalTestObjects.testObjects.length}\r`);
}

/**
 * Returns `Promise<void>`.
 * 
 * This function runs a batch of parallel tests. It plays the rule of a user.
 */
async function doBatchParallelTests(testObjectsBatch: TestObject[], testCheckList: TestCheckObject[]): Promise<void> {
    for (const testObject of testObjectsBatch) {
        await doOneParallelTest(testObject, testCheckList);
    }
}

/**
 * Returns `TestObject[][]`.
 * 
 * This function splits the testObjectsList into batches depending on concurrency number.
 */
function splitListIntoBatches(testObjects: TestObject[], batchCount: number): TestObject[][] {
    const batches: TestObject[][] = [];
    while(testObjects.length) {
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
 async function doParallelTests(testCheckList: TestCheckObject[]): Promise<void> {
    const concurrency = configurator.getParallelTestConcurrency();
    const testBatchesList: TestObject[][] = splitListIntoBatches(finalTestObjects.testObjects, concurrency);

    console.log(`[${new Date().toLocaleTimeString()}] LBTester: parallel test phase has been started...\n`);

    const promises = testBatchesList.map((testObjectsBatch: TestObject[]) => doBatchParallelTests(testObjectsBatch, testCheckList));

    const testStartTime = performance.now();
    
    await Promise.all(promises);

    logger.setTestProcessDuration(performance.now() - testStartTime);

    //This sintence shouldn't be shorter than the above one. Otherwise it will display extra characters at the end
    console.log(`[${new Date().toLocaleTimeString()}] LBTester: processed tests ${parallelCounter}/${finalTestObjects.testObjects.length}`);
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: parallel test phase has been finished\n`);
    parallelCounter = 0;
}

/**
 * Returns `Promise<void>`.
 * 
 * This function runs the warmup and tests functions
 */
async function startTest(): Promise<void> {
    const testCheckList: TestCheckObject[] = [];

    if (await setTestObjectsAddresses()) {
        const warmUpStartTime = performance.now();
        if (warmUpTestObjects.length > 0) {
            await doWarmUp();
            logger.setWarmUpProcessDuration(performance.now() - warmUpStartTime);
        } else {
            console.log(chalk.red("There are no warm up test objects added. The testing phase will continue without warming up!!!\n"));
        }

        if (finalTestObjects.testObjects.length > 0) {
            //Get current RAM details before starting testing and after warming up
            const usedRAMBeforeTesting = await callRAMUsageApi({ command: "inspect" });
            //Add the startup RAM usage as the first value in plotting list at index 0 and set the total RAM capacity
            logger.addRAMUsageAndCapacity(usedRAMBeforeTesting);

            if (configurator.isParallelTest()) {
                await doParallelTests(testCheckList);
            } else {
                await doSequentialTests(testCheckList);
            }

            console.log(`[${new Date().toLocaleTimeString()}] LBTester: logging phase has been started...\n`);

            await testchecker.check(testCheckList);

            logger.log();
        } else {
            console.log(chalk.red(`[${new Date().toLocaleTimeString()}] LBTester:There are no test objects added for testing!!!\nLBTester has been finished without testing.\n`));
        }
    }

    await beep();
    configurator.resetToDefault();
}

export default {
    setTestObjectList,
    addTestObjectList,
    addTestObject,
    getTestObjectList,
    addWarmUpTestObject,
    startTest
}