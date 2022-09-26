"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configurator_1 = __importDefault(require("../configurations/configurator"));
/**
 * Returns `TestObject`.
 *
 * This function creates a new TestObject based on the info that has been given
 */
function createNewTestObject(testName, tenantId, requestParameters, requestBody, requestHeaders, urlAddition) {
    return {
        testName,
        expectedServerName: "",
        expectedServerPort: "",
        tenantId,
        requestParameters: requestParameters != undefined ? requestParameters : [],
        requestBody,
        requestHeaders: requestHeaders != undefined ? requestHeaders : {},
        urlAddition: urlAddition != undefined ? urlAddition : ''
    };
}
/**
 * Returns `string`.
 *
 * This function turns the request parameters list from the given TestObject into string and returns it
 */
function getRequestParametersAsString(testObject) {
    const requestParameters = [];
    if (testObject.requestParameters)
        for (const requestParamater of testObject.requestParameters)
            requestParameters.push(`${requestParamater.name}=${requestParamater.value}`);
    if (testObject.requestParameters !== undefined && testObject.requestParameters.length > 0)
        return `?${requestParameters.join("&")}`;
    else
        return '';
}
/**
 * Returns `TesterOptions`.
 *
 * This function converts the given TestObject into TesterOptions and returns it
 */
function toTesterOptions(testObject) {
    return { url: `${configurator_1.default.getBaseUrl().replace('#{tenantId}', testObject.tenantId)}${testObject.urlAddition}${getRequestParametersAsString(testObject)}`,
        data: testObject.requestBody,
        headers: testObject.requestHeaders };
}
exports.default = {
    createNewTestObject,
    toTesterOptions
};
