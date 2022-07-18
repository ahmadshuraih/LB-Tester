import testconfig from './testconfig.json';
import fs from 'fs';
const configFileName = 'testconfig.json';

/**
 * Returns `void`.
 *
 * This function modifies the request method in testconfig.json file.
 * 
 * Default request method is "Get"
 */
function setRequestMethod(requestMethod: string): void {
    testconfig.requestMethod = requestMethod;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig));
}

/**
 * Returns `string`.
 *
 * This function gets the request method from testconfig.json file.
 * 
 * Default request method is "Get"
 */
function getRequestMethod(): string {
    return testconfig.requestMethod;
}

/**
 * Returns `void`.
 *
 * This function modifies the base url in testconfig.json file.
 * 
 * Default baseurl is "http://localhost:3000/"
 */
 function setBaseUrl(baseUrl: string): void {
    testconfig.baseurl = baseUrl;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig));
}

/**
 * Returns `string`.
 *
 * This function gets the base url from testconfig.json file.
 * 
 * Default baseurl is "http://localhost:3000/"
 */
function getBaseUrl(): string {
    return testconfig.baseurl;
}

/**
 * Returns `void`.
 *
 * This function modifies the expected response code in testconfig.json file.
 * The expected response code is the during the test expected response code of the test requests.
 * 
 * Default expected response code is 200 'OK'
 */
function setExpectedResponseCode(responseCode: number): void {
    testconfig.expectedResponseCode = responseCode;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig));
}

/**
 * Returns `number`.
 *
 * This function gets the expected response code from testconfig.json file.
 * The expected response code is the during the test expected response code of the test requests.
 * 
 * Default expected response code is 200 'OK'
 */
function getExpectedResponseCode(): number {
    return testconfig.expectedResponseCode;
}

export default {
    setRequestMethod,
    setBaseUrl,
    setExpectedResponseCode,
    getRequestMethod,
    getBaseUrl,
    getExpectedResponseCode
}