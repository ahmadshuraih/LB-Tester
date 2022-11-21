/* eslint-disable @typescript-eslint/no-non-null-assertion */
import configurator from "../configurations/configurator";
import logger from '../logger/logger';
import { TestResultObject, TestCheckObject } from "../types";

const errorTenants: string[] = [];

/**
 * Returns `TestResultObject`.
 *
 * This function extracts the useful informations from the TestCheckObject to make a TestResultObject 
 * wich will be written in testresults.json file.
 */
function convertTestCheckObjectToResultObject(testCheckObject: TestCheckObject, testNumber: number): TestResultObject {
    const responseTimeHeader = configurator.getResponseTimeHeader();
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
    if (configurator.isCheckRAMUsage()) testResultObject.testCallResponse.testRAMUsage = testCheckObject.testCallResponse.testRAMUsage!;

    return testResultObject;
}

/**
 * Returns `Promise<void>`.
 * 
 * This function compares the requests results with the expected results and adds the check results to testlog file 
 */
async function check(testCheckList: TestCheckObject[]): Promise<void> {
    const responseTimeHeader = configurator.getResponseTimeHeader();
    const expectedResponseCode = configurator.getExpectedResponseCode();
    const testResultObjects: TestResultObject[] = [];
    let counter = 0;

    for (const checkObject of testCheckList) {
        const responseCode = checkObject.testCallResponse.response?.status;
        const server = `${checkObject.testCallResponse.response?.headers['x-server-name']}:${checkObject.testCallResponse.response?.headers['x-server-port']}`;
        counter += 1;

        if (checkObject.testCallResponse.succeed) {
            const faults: string[] = [];
            const expectedServerName = checkObject.testObject.expectedServerName.toLowerCase();
            const expectedServerPort = checkObject.testObject.expectedServerPort;
            const reponseServerName = checkObject.testCallResponse.response?.headers['x-server-name'].toLowerCase();
            const reponseServerPort = checkObject.testCallResponse.response?.headers['x-server-port'];
            
            
            if (expectedServerName !== reponseServerName) faults.push(`Expected server name to be ${expectedServerName}, but got ${reponseServerName}.`);
            
            if (expectedServerPort !== reponseServerPort) faults.push(`Expected server port to be ${expectedServerPort}, but got ${reponseServerPort}.`);
            
            if (expectedResponseCode !== responseCode) faults.push(`Expected reponse code ${expectedResponseCode}, but got ${responseCode}.`);

            if (faults.length > 0) {
                const faultsString = checkObject.testObject.testName + '\n' + faults.join("\n");
                logger.addFailedTest(faultsString, Number(checkObject.testCallResponse.response?.headers[responseTimeHeader].replace('ms', '')) ?? 0);
            } else {
                logger.addPassedTest(Number(checkObject.testCallResponse.response?.headers[responseTimeHeader].replace('ms', '')) ?? 0, server);
            }
        } else {
            const errorString = checkObject.testObject.testName + '\n' + checkObject.testCallResponse.error;
            logger.addError(errorString, Number(checkObject.testCallResponse.response?.headers[responseTimeHeader.toLowerCase()].replace('ms', '')) ?? 0);

            if (!errorTenants.includes(checkObject.testObject.testName)) errorTenants.push(checkObject.testObject.testName);

            if (responseCode === 429) logger.serverIsBroken();
        }

        const ramUsage = checkObject.testCallResponse.testRAMUsage ?? 0;
        if (configurator.isCheckRAMUsage()) logger.addRAMUsage(ramUsage, server);

        testResultObjects.push(convertTestCheckObjectToResultObject(checkObject, counter));
    }


    await logger.prepair();
    await logger.writeJsonTestResults(testResultObjects);
    if (errorTenants.length > 0) {
        console.log(`Errors with ${errorTenants.length} tests. Tests names are:`);
        console.log(errorTenants);
    }
}

export default {
    check
}