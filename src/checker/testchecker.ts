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
    const testResultObject = {
        testNumber,
        testObject: testCheckObject.testObject,
        testerOptions: testCheckObject.testerOptions,
        testCallResponse: { 
            status: testCheckObject.testCallResponse.response!.status || 0, 
            headers: { 
                "X-Server-Name": testCheckObject.testCallResponse.response?.headers['x-server-name'], 
                "X-Server-Port": testCheckObject.testCallResponse.response?.headers['x-server-port']
            },
            timeSpent: testCheckObject.testCallResponse.timeSpent ?? 0,
            testRAMUsage: 0
        }
    };

    if (configurator.isCheckRAMUsage()) testResultObject.testCallResponse.testRAMUsage = testCheckObject.testCallResponse.testRAMUsage!;

    return testResultObject;
}

/**
 * Returns `Promise<void>`.
 * 
 * This function compares the requests results with the expected results and adds the check results to testlog file 
 */
async function check(testCheckList: TestCheckObject[]): Promise<void> {
    const expectedResponseCode = configurator.getExpectedResponseCode();
    const testResultObjects: TestResultObject[] = [];
    let counter = 0;

    for (const checkObject of testCheckList) {
        const responseCode = checkObject.testCallResponse.response?.status;
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
                logger.addFailedTest(faultsString, checkObject.testCallResponse.timeSpent ?? 0);
            } else {
                logger.addPassedTest(checkObject.testCallResponse.timeSpent ?? 0);
            }
        } else {
            const errorString = checkObject.testObject.testName + '\n' + checkObject.testCallResponse.error;
            logger.addError(errorString, checkObject.testCallResponse.timeSpent ?? 0);

            if (!errorTenants.includes(checkObject.testObject.testName)) errorTenants.push(checkObject.testObject.testName);

            if (responseCode === 429) logger.serverIsBroken();
        }

        if (configurator.isCheckRAMUsage()) logger.addRAMUsage(checkObject.testCallResponse.testRAMUsage!);

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