import configurator from "../configurations/configurator";
import logger from '../logger/logger';
import { TestResultObject, TestCheckObject } from "../types";

/**
 * Returns `TestResultObject`.
 *
 * This function extracts the useful informations from the TestCheckObject to make a TestResultObject 
 * wich will be written in testresults.json file.
 */
function convertTestCheckObjectToResultObject(testCheckObject: TestCheckObject): TestResultObject {
    return {testObject: testCheckObject.testObject,
        testerOptions: testCheckObject.testerOptions,
        testCallResponse: { status: testCheckObject.testCallResponse.response.status, 
            headers: { 
                "X-Server-Name": testCheckObject.testCallResponse.response.headers['x-server-name'], 
                "X-Server-Port": testCheckObject.testCallResponse.response.headers['x-server-port']
            },
            timeSpent: testCheckObject.testCallResponse.timeSpent ?? 0}};
}

/**
 * Returns `Promise<void>`.
 * 
 * This function compares the requests results with the expected results and adds the check results to testlog file 
 */
async function check(testCheckList: TestCheckObject[]): Promise<void> {
    const expectedResponseCode = configurator.getExpectedResponseCode();
    const testResultObjects: TestResultObject[] = [];

    for (const checkObject of testCheckList) {
        const responseCode = checkObject.testCallResponse.response.status;

        if (checkObject.testCallResponse.succeed) {
            const faults: string[] = [];
            const expectedServerName = checkObject.testObject.expectedServerName.toLowerCase();
            const expectedServerPort = checkObject.testObject.expectedServerPort;
            const reponseServerName = checkObject.testCallResponse.response.headers['x-server-name'].toLowerCase();
            const reponseServerPort = checkObject.testCallResponse.response.headers['x-server-port'];
            
            
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

            if (responseCode === 429) logger.serverIsBroken();
        }

        testResultObjects.push(convertTestCheckObjectToResultObject(checkObject));
    }


    await logger.prepair();
    await logger.writeJsonTestResults(testResultObjects);
}

export default {
    check
}