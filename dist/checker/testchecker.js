"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurator_1 = __importDefault(require("../configurations/configurator"));
const logger_1 = __importDefault(require("../logger/logger"));
/**
 * Returns `TestResultObject`.
 *
 * This function extracts the useful informations from the TestCheckObject to make a TestResultObject
 * wich will be written in testresults.json file.
 */
function convertTestCheckObjectToResultObject(testCheckObject) {
    return { testObject: testCheckObject.testObject,
        testerOptions: testCheckObject.testerOptions,
        testCallResponse: { status: testCheckObject.testCallResponse.response.status,
            headers: {
                "X-Server-Name": testCheckObject.testCallResponse.response.headers['x-server-name'],
                "X-Server-Port": testCheckObject.testCallResponse.response.headers['x-server-port']
            },
            timeSpent: testCheckObject.testCallResponse.timeSpent ?? 0 } };
}
/**
 * Returns `Promise<void>`.
 *
 * This function compares the requests results with the expected results and adds the check results to testlog file
 */
async function check(testCheckList) {
    const expectedResponseCode = configurator_1.default.getExpectedResponseCode();
    const testResultObjects = [];
    for (const checkObject of testCheckList) {
        const responseCode = checkObject.testCallResponse.response.status;
        if (checkObject.testCallResponse.succeed) {
            const faults = [];
            const expectedServerName = checkObject.testObject.expectedServerName.toLowerCase();
            const expectedServerPort = checkObject.testObject.expectedServerPort;
            const reponseServerName = checkObject.testCallResponse.response.headers['x-server-name'].toLowerCase();
            const reponseServerPort = checkObject.testCallResponse.response.headers['x-server-port'];
            if (expectedServerName !== reponseServerName)
                faults.push(`Expected server name to be ${expectedServerName}, but got ${reponseServerName}.`);
            if (expectedServerPort !== reponseServerPort)
                faults.push(`Expected server port to be ${expectedServerPort}, but got ${reponseServerPort}.`);
            if (expectedResponseCode !== responseCode)
                faults.push(`Expected reponse code ${expectedResponseCode}, but got ${responseCode}.`);
            if (faults.length > 0) {
                const faultsString = checkObject.testObject.testName + '\n' + faults.join("\n");
                logger_1.default.addFailedTest(faultsString, checkObject.testCallResponse.timeSpent ?? 0);
            }
            else {
                logger_1.default.addPassedTest(checkObject.testCallResponse.timeSpent ?? 0);
            }
        }
        else {
            const errorString = checkObject.testObject.testName + '\n' + checkObject.testCallResponse.error;
            logger_1.default.addError(errorString, checkObject.testCallResponse.timeSpent ?? 0);
            if (responseCode === 429)
                logger_1.default.serverIsBroken();
        }
        testResultObjects.push(convertTestCheckObjectToResultObject(checkObject));
    }
    logger_1.default.prepair();
    logger_1.default.writeJsonTestResults(testResultObjects);
}
exports.default = {
    check
};
