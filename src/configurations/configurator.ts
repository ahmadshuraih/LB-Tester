import testconfig from '../../testconfig.json';
import fs from 'fs';
import { AxiosRequestHeaders } from 'axios';
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
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
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
 * Default baseurl is "http://localhost:3000"
 */
function setBaseUrl(baseUrl: string): void {
    testconfig.baseurl = baseUrl;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the base url from testconfig.json file.
 * 
 * Default baseurl is "http://localhost:3000"
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
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
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

/**
 * Returns `void`.
 *
 * This function modifies the address book url in testconfig.json file.
 * The address book url is used to get the addresses of the tenants that has been saved in addressBook.json file
 * 
 * Default addres book url is 'http://localhost:3100/loadbalancer/addressbook'
 */
function setAddressBookUrl(addressBookUrl: string): void {
    testconfig.addressBookUrl = addressBookUrl;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the address book url from testconfig.json file.
 * The address book url is used to get the addresses of the tenants that has been saved in addressBook.json file
 * 
 * Default addres book url is 'http://localhost:3100/loadbalancer/addressbook'
 */
function getAddressBookUrl(): string {
    return testconfig.addressBookUrl;
}

/**
 * Returns `void`.
 *
 * This function modifies the randomizeTestLists in testconfig.json file.
 * 
 * Default randomizeTestLists is false
 */
function setRandomizeTestLists(randomizeTestLists: boolean): void {
    testconfig.randomizeTestLists = randomizeTestLists;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the randomizeTestLists from testconfig.json file.
 * 
 * Default randomizeTestLists is false
 */
function isRandomizeTestLists(): boolean {
    return testconfig.randomizeTestLists;
}

/**
 * Returns `void`.
 *
 * This function modifies the authentication token in testconfig.json file.
 * 
 * Default authentication token is "MasterTestToken"
 */
function setLBAuthenticationToken(authenticationToken: string): void {
    testconfig.lbAuthenticationToken = authenticationToken;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the authentication token from testconfig.json file.
 * 
 * Default authentication token is "MasterTestToken"
 */
function getLBAuthenticationToken(): string {
    return testconfig.lbAuthenticationToken;
}

/**
 * Returns `void`.
 *
 * This function modifies the checkRAMUsage in testconfig.json file.
 * 
 * Default checkRAMUsage is false
 */
function setCheckRAMUsage(checkRAMUsage: boolean): void {
    testconfig.checkRAMUsage = checkRAMUsage;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the checkRAMUsage from testconfig.json file.
 * 
 * Default checkRAMUsage is false
 */
function isCheckRAMUsage(): boolean {
    return testconfig.checkRAMUsage;
}

/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestMethod in testconfig.json file.
 * 
 * Default ramCheckRequestMethod is "Post"
 */
function setRAMCheckRequestMethod(ramCheckRequestMethod: string): void {
    testconfig.ramCheckRequestMethod = ramCheckRequestMethod;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the ramCheckRequestMethod from testconfig.json file.
 * 
 * Default ramCheckRequestMethod is "Post"
 */
function getRAMCheckRequestMethod(): string {
    return testconfig.ramCheckRequestMethod;
}

/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestUrl in testconfig.json file.
 * 
 * Default ramCheckRequestUrl is "https://localhost:3100/loadbalancer/data"
 */
function setRAMCheckRequestUrl(ramCheckRequestUrl: string): void {
    testconfig.ramCheckRequestUrl = ramCheckRequestUrl;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the ramCheckRequestUrl from testconfig.json file.
 * 
 * Default ramCheckRequestUrl is "https://localhost:3100/loadbalancer/data"
 */
function getRAMCheckRequestUrl(): string {
    return testconfig.ramCheckRequestUrl;
}

/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestBody in testconfig.json file.
 * 
 * Default ramCheckRequestBody is {}
 */
function setRAMCheckRequestBody(ramCheckRequestBody: object): void {
    testconfig.ramCheckRequestBody = ramCheckRequestBody;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `object`.
 *
 * This function gets the ramCheckRequestBody from testconfig.json file.
 * 
 * Default ramCheckRequestBody is {}
 */
function getRAMCheckRequestBody(): object {
    return testconfig.ramCheckRequestBody;
}

/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestHeaders in testconfig.json file.
 * 
 * Default ramCheckRequestHeaders is {}
 */
function setRAMCheckRequestHeaders(ramCheckRequestHeaders: object): void {
    testconfig.ramCheckRequestHeaders = ramCheckRequestHeaders;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `AxiosRequestHeaders`.
 *
 * This function gets the ramCheckRequestHeaders from testconfig.json file.
 * 
 * Default ramCheckRequestHeaders is {}
 */
function getRAMCheckRequestHeaders(): AxiosRequestHeaders {
    return testconfig.ramCheckRequestHeaders;
}

/**
 * Returns `void`.
 *
 * This function modifies the multiRAMCheck in testconfig.json file.
 * 
 * Default multiRAMCheck is false
 */
function setMultiRAMCheck(multiRAMCheck: boolean): void {
    testconfig.multiRAMCheck = multiRAMCheck;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the multiRAMCheck from testconfig.json file.
 * 
 * Default multiRAMCheck is false
 */
function isMultiRAMCheck(): boolean {
    return testconfig.multiRAMCheck;
}

/**
 * Returns `void`.
 *
 * This function modifies the multiTimeUsageCheck in testconfig.json file.
 * 
 * Default multiTimeUsageCheck is false
 */
 function setMultiTimeUsageCheck(multiTimeUsageCheck: boolean): void {
    testconfig.multiTimeUsageCheck = multiTimeUsageCheck;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the multiTimeUsageCheck from testconfig.json file.
 * 
 * Default multiTimeUsageCheck is false
 */
function isMultiTimeUsageCheck(): boolean {
    return testconfig.multiTimeUsageCheck;
}

/**
 * Returns `void`.
 *
 * This function modifies the parallelTest in testconfig.json file.
 * 
 * Default parallelTest is false
 */
function setParallelTest(parallelTest: boolean): void {
    testconfig.parallelTest = parallelTest;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the parallelTest from testconfig.json file.
 * 
 * Default parallelTest is false
 */
function isParallelTest(): boolean {
    return testconfig.parallelTest;
}

/**
 * Returns `void`.
 *
 * This function modifies the parallelTestConcurrency in testconfig.json file.
 * 
 * Default parallelTestConcurrency is 1
 */
function setParallelTestConcurrency(parallelTestConcurrency: number): void {
    testconfig.parallelTestConcurrency = parallelTestConcurrency;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `number`.
 *
 * This function gets the parallelTestConcurrency from testconfig.json file.
 * 
 * Default parallelTestConcurrency is 1
 */
function getParallelTestConcurrency(): number {
    return testconfig.parallelTestConcurrency;
}

/**
 * Returns `void`.
 *
 * This function modifies the testFinishSoundAlert in testconfig.json file.
 * 
 * Default testFinishSoundAlert is false
 */
function setTestFinishSoundAlert(testFinishSoundAlert: boolean): void {
    testconfig.testFinishSoundAlert = testFinishSoundAlert;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `boolean`.
 *
 * This function gets the testFinishSoundAlert from testconfig.json file.
 * 
 * Default testFinishSoundAlert is false
 */
function isTestFinishSoundAlert(): boolean {
    return testconfig.testFinishSoundAlert;
}

/**
 * Returns `void`.
 *
 * This function modifies the responseTimeHeader in testconfig.json file.
 * 
 * Default responseTimeHeader is ""
 */
function setResponseTimeHeader(responseTimeHeader: string): void {
    testconfig.responseTimeHeader = responseTimeHeader;
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

/**
 * Returns `string`.
 *
 * This function gets the responseTimeHeader from testconfig.json file.
 * 
 * Default responseTimeHeader is ""
 */
function getResponseTimeHeader(): string {
    return testconfig.responseTimeHeader;
}

/**
 * Returns `void`.
 *
 * This function reset all testconfig.json file attributes to default values.
 */
function resetToDefault(): void {
    testconfig.requestMethod = "Get";
    testconfig.baseurl = "http://localhost:3000";
    testconfig.expectedResponseCode = 200;
    testconfig.addressBookUrl = "http://localhost:3100/loadbalancer/addressbook";
    testconfig.randomizeTestLists = false;
    testconfig.lbAuthenticationToken = "MasterTestToken";
    testconfig.checkRAMUsage = false;
    testconfig.ramCheckRequestMethod = "Post";
    testconfig.ramCheckRequestUrl = "https://localhost:3100/loadbalancer/data";
    testconfig.ramCheckRequestBody = {};
    testconfig.ramCheckRequestHeaders = {};
    testconfig.multiRAMCheck = false;
    testconfig.multiTimeUsageCheck = false;
    testconfig.parallelTest = false;
    testconfig.parallelTestConcurrency = 1;
    testconfig.testFinishSoundAlert = false;
    testconfig.responseTimeHeader = "";
    fs.writeFileSync(configFileName, JSON.stringify(testconfig, null, 4));
}

export default {
    setRequestMethod,
    setBaseUrl,
    setExpectedResponseCode,
    setAddressBookUrl,
    setRandomizeTestLists,
    setLBAuthenticationToken,
    setCheckRAMUsage,
    setRAMCheckRequestMethod,
    setRAMCheckRequestUrl,
    setRAMCheckRequestBody,
    setRAMCheckRequestHeaders,
    setMultiRAMCheck,
    setMultiTimeUsageCheck,
    setParallelTest,
    setParallelTestConcurrency,
    setTestFinishSoundAlert,
    setResponseTimeHeader,
    getRequestMethod,
    getBaseUrl,
    getExpectedResponseCode,
    getAddressBookUrl,
    isRandomizeTestLists,
    getLBAuthenticationToken,
    isCheckRAMUsage,
    getRAMCheckRequestMethod,
    getRAMCheckRequestUrl,
    getRAMCheckRequestBody,
    getRAMCheckRequestHeaders,
    isMultiRAMCheck,
    isMultiTimeUsageCheck,
    isParallelTest,
    getParallelTestConcurrency,
    isTestFinishSoundAlert,
    getResponseTimeHeader,
    resetToDefault
}