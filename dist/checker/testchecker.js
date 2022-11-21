"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const configurator_1 = __importDefault(require("../configurations/configurator"));
const logger_1 = __importDefault(require("../logger/logger"));
const errorTenants = [];
/**
 * Returns `TestResultObject`.
 *
 * This function extracts the useful informations from the TestCheckObject to make a TestResultObject
 * wich will be written in testresults.json file.
 */
function convertTestCheckObjectToResultObject(testCheckObject, testNumber) {
    const responseTimeHeader = configurator_1.default.getResponseTimeHeader();
    const testResultObject = {
        testNumber,
        testObject: testCheckObject.testObject,
        testerOptions: testCheckObject.testerOptions,
        testCallResponse: {
            status: testCheckObject.testCallResponse.response?.status ?? 0,
            headers: {
                "X-Server-Name": testCheckObject.testCallResponse.response?.headers['x-server-name'],
                "X-Server-Port": testCheckObject.testCallResponse.response?.headers['x-server-port']
            },
            testRAMUsage: 0
        }
    };
    testResultObject.testCallResponse.headers[responseTimeHeader] = testCheckObject.testCallResponse.response?.headers[responseTimeHeader];
    if (configurator_1.default.isCheckRAMUsage())
        testResultObject.testCallResponse.testRAMUsage = testCheckObject.testCallResponse.testRAMUsage;
    return testResultObject;
}
/**
 * Returns `Promise<void>`.
 *
 * This function compares the requests results with the expected results and adds the check results to testlog file
 */
async function check(testCheckList) {
    const responseTimeHeader = configurator_1.default.getResponseTimeHeader();
    const expectedResponseCode = configurator_1.default.getExpectedResponseCode();
    const testResultObjects = [];
    let counter = 0;
    for (const checkObject of testCheckList) {
        const responseCode = checkObject.testCallResponse.response?.status;
        const server = `${checkObject.testCallResponse.response?.headers['x-server-name']}:${checkObject.testCallResponse.response?.headers['x-server-port']}`;
        counter += 1;
        if (checkObject.testCallResponse.succeed) {
            const faults = [];
            const expectedServerName = checkObject.testObject.expectedServerName.toLowerCase();
            const expectedServerPort = checkObject.testObject.expectedServerPort;
            const reponseServerName = checkObject.testCallResponse.response?.headers['x-server-name'].toLowerCase();
            const reponseServerPort = checkObject.testCallResponse.response?.headers['x-server-port'];
            if (expectedServerName !== reponseServerName)
                faults.push(`Expected server name to be ${expectedServerName}, but got ${reponseServerName}.`);
            if (expectedServerPort !== reponseServerPort)
                faults.push(`Expected server port to be ${expectedServerPort}, but got ${reponseServerPort}.`);
            if (expectedResponseCode !== responseCode)
                faults.push(`Expected reponse code ${expectedResponseCode}, but got ${responseCode}.`);
            if (faults.length > 0) {
                const faultsString = checkObject.testObject.testName + '\n' + faults.join("\n");
                logger_1.default.addFailedTest(faultsString, Number(checkObject.testCallResponse.response?.headers[responseTimeHeader].replace('ms', '')) ?? 0);
            }
            else {
                logger_1.default.addPassedTest(Number(checkObject.testCallResponse.response?.headers[responseTimeHeader].replace('ms', '')) ?? 0, server);
            }
        }
        else {
            const errorString = checkObject.testObject.testName + '\n' + checkObject.testCallResponse.error;
            logger_1.default.addError(errorString, Number(checkObject.testCallResponse.response?.headers[responseTimeHeader.toLowerCase()].replace('ms', '')) ?? 0);
            if (!errorTenants.includes(checkObject.testObject.testName))
                errorTenants.push(checkObject.testObject.testName);
            if (responseCode === 429)
                logger_1.default.serverIsBroken();
        }
        const ramUsage = checkObject.testCallResponse.testRAMUsage ?? 0;
        if (configurator_1.default.isCheckRAMUsage())
            logger_1.default.addRAMUsage(ramUsage, server);
        testResultObjects.push(convertTestCheckObjectToResultObject(checkObject, counter));
    }
    await logger_1.default.prepair();
    await logger_1.default.writeJsonTestResults(testResultObjects);
    if (errorTenants.length > 0) {
        console.log(`Errors with ${errorTenants.length} tests. Tests names are:`);
        console.log(errorTenants);
    }
}
exports.default = {
    check
};
