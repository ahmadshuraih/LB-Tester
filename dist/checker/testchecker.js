"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurator_1 = __importDefault(require("../configurations/configurator"));
const logger_1 = __importDefault(require("../logger/logger"));
/**
 * Returns `Promise<void>`.
 *
 * This function compares the requests results with the expected results and adds the check results to testlog file
 */
async function check(testChechList) {
    let expectedResponseCode = configurator_1.default.getExpectedResponseCode();
    for (const checkObject of testChechList) {
        if (checkObject.testCallResponse.succeed) {
            let faults = [];
            let expectedServerName = checkObject.testObject.expectedSrverName;
            let expectedServerPort = checkObject.testObject.expectedServerPort;
            let expectedTenantId = checkObject.testObject.expectedTenantId;
            let reponseServerName = checkObject.testCallResponse.response.headers['x-server-name'];
            let reponseServerPort = checkObject.testCallResponse.response.headers['x-server-port'];
            let reponseTenantId = checkObject.testCallResponse.response.data[0].sender;
            let responseCode = checkObject.testCallResponse.response.status;
            if (expectedServerName !== reponseServerName) {
                faults.push(`Expected server name to be ${expectedServerName}, but got ${reponseServerName}.`);
            }
            if (expectedServerPort !== reponseServerPort) {
                faults.push(`Expected server port to be ${expectedServerPort}, but got ${reponseServerPort}.`);
            }
            if (expectedResponseCode !== responseCode) {
                faults.push(`Expected reponse code ${expectedResponseCode}, but got ${responseCode}.`);
            }
            if (expectedTenantId !== reponseTenantId) {
                faults.push(`Expected tenant id ${expectedTenantId}, but got ${reponseTenantId}.`);
            }
            if (faults.length > 0) {
                let faultsString = checkObject.testObject.testName + '\n' + faults.join("\n");
                logger_1.default.addFailedTest(faultsString, checkObject.testCallResponse.timeSpent);
            }
            else {
                logger_1.default.addPassedTest(checkObject.testCallResponse.timeSpent);
            }
        }
        else {
            logger_1.default.addError(checkObject.testObject.testName + '\n' + checkObject.testCallResponse.error);
        }
        logger_1.default.prepair();
    }
}
exports.default = {
    check
};
