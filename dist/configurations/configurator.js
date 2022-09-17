"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testconfig_json_1 = __importDefault(require("../../testconfig.json"));
const fs_1 = __importDefault(require("fs"));
const configFileName = 'testconfig.json';
/**
 * Returns `void`.
 *
 * This function modifies the request method in testconfig.json file.
 *
 * Default request method is "Get"
 */
function setRequestMethod(requestMethod) {
    testconfig_json_1.default.requestMethod = requestMethod;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the request method from testconfig.json file.
 *
 * Default request method is "Get"
 */
function getRequestMethod() {
    return testconfig_json_1.default.requestMethod;
}
/**
 * Returns `void`.
 *
 * This function modifies the base url in testconfig.json file.
 *
 * Default baseurl is "http://localhost:3000"
 */
function setBaseUrl(baseUrl) {
    testconfig_json_1.default.baseurl = baseUrl;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the base url from testconfig.json file.
 *
 * Default baseurl is "http://localhost:3000"
 */
function getBaseUrl() {
    return testconfig_json_1.default.baseurl;
}
/**
 * Returns `void`.
 *
 * This function modifies the expected response code in testconfig.json file.
 * The expected response code is the during the test expected response code of the test requests.
 *
 * Default expected response code is 200 'OK'
 */
function setExpectedResponseCode(responseCode) {
    testconfig_json_1.default.expectedResponseCode = responseCode;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `number`.
 *
 * This function gets the expected response code from testconfig.json file.
 * The expected response code is the during the test expected response code of the test requests.
 *
 * Default expected response code is 200 'OK'
 */
function getExpectedResponseCode() {
    return testconfig_json_1.default.expectedResponseCode;
}
/**
 * Returns `void`.
 *
 * This function modifies the address book url in testconfig.json file.
 * The address book url is used to get the addresses of the tenants that has been saved in addressBook.json file
 *
 * Default addres book url is 'http://localhost:3100/addressbook'
 */
function setAddressBookUrl(addressBookUrl) {
    testconfig_json_1.default.addressBookUrl = addressBookUrl;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the address book url from testconfig.json file.
 * The address book url is used to get the addresses of the tenants that has been saved in addressBook.json file
 *
 * Default addres book url is 'http://localhost:3100/addressbook'
 */
function getAddressBookUrl() {
    return testconfig_json_1.default.addressBookUrl;
}
/**
 * Returns `void`.
 *
 * This function modifies the authentication token in testconfig.json file.
 *
 * Default authentication token is "MasterTestToken"
 */
function setLBAuthenticationToken(authenticationToken) {
    testconfig_json_1.default.lbAuthenticationToken = authenticationToken;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the authentication token from testconfig.json file.
 *
 * Default authentication token is "MasterTestToken"
 */
function getLBAuthenticationToken() {
    return testconfig_json_1.default.lbAuthenticationToken;
}
/**
 * Returns `void`.
 *
 * This function modifies the checkRAMUsage in testconfig.json file.
 *
 * Default checkRAMUsage is false
 */
function setCheckRAMUsage(checkRAMUsage) {
    testconfig_json_1.default.checkRAMUsage = checkRAMUsage;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `boolean`.
 *
 * This function gets the checkRAMUsage from testconfig.json file.
 *
 * Default checkRAMUsage is false
 */
function getCheckRAMUsage() {
    return testconfig_json_1.default.checkRAMUsage;
}
/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestMethod in testconfig.json file.
 *
 * Default ramCheckRequestMethod is "Post"
 */
function setRAMCheckRequestMethod(ramCheckRequestMethod) {
    testconfig_json_1.default.ramCheckRequestMethod = ramCheckRequestMethod;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the ramCheckRequestMethod from testconfig.json file.
 *
 * Default ramCheckRequestMethod is "Post"
 */
function getRAMCheckRequestMethod() {
    return testconfig_json_1.default.ramCheckRequestMethod;
}
/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestUrl in testconfig.json file.
 *
 * Default ramCheckRequestUrl is "https://127.0.0.1:3100/loadbalancer/data"
 */
function setRAMCheckRequestUrl(ramCheckRequestUrl) {
    testconfig_json_1.default.ramCheckRequestUrl = ramCheckRequestUrl;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `string`.
 *
 * This function gets the ramCheckRequestUrl from testconfig.json file.
 *
 * Default ramCheckRequestUrl is "https://127.0.0.1:3100/loadbalancer/data"
 */
function getRAMCheckRequestUrl() {
    return testconfig_json_1.default.ramCheckRequestUrl;
}
/**
 * Returns `void`.
 *
 * This function modifies the ramCheckRequestBody in testconfig.json file.
 *
 * Default ramCheckRequestBody is {}
 */
function setRAMCheckRequestBody(ramCheckRequestBody) {
    testconfig_json_1.default.ramCheckRequestBody = ramCheckRequestBody;
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
/**
 * Returns `object`.
 *
 * This function gets the ramCheckRequestBody from testconfig.json file.
 *
 * Default ramCheckRequestBody is {}
 */
function getRAMCheckRequestBody() {
    return testconfig_json_1.default.ramCheckRequestBody;
}
/**
 * Returns `void`.
 *
 * This function reset all testconfig.json file attributes to default values.
 */
function resetToDefault() {
    testconfig_json_1.default.requestMethod = "Get";
    testconfig_json_1.default.baseurl = "http://localhost:3000";
    testconfig_json_1.default.expectedResponseCode = 200;
    testconfig_json_1.default.addressBookUrl = "http://127.0.0.1:3100/loadbalancer/addressbook";
    testconfig_json_1.default.lbAuthenticationToken = "MasterTestToken";
    testconfig_json_1.default.checkRAMUsage = false;
    testconfig_json_1.default.ramCheckRequestMethod = "Post";
    testconfig_json_1.default.ramCheckRequestUrl = "https://127.0.0.1:3100/loadbalancer/data";
    testconfig_json_1.default.ramCheckRequestBody = {};
    fs_1.default.writeFileSync(configFileName, JSON.stringify(testconfig_json_1.default));
}
exports.default = {
    setRequestMethod,
    setBaseUrl,
    setExpectedResponseCode,
    setAddressBookUrl,
    setLBAuthenticationToken,
    setCheckRAMUsage,
    setRAMCheckRequestMethod,
    setRAMCheckRequestUrl,
    setRAMCheckRequestBody,
    getRequestMethod,
    getBaseUrl,
    getExpectedResponseCode,
    getAddressBookUrl,
    getLBAuthenticationToken,
    getCheckRAMUsage,
    getRAMCheckRequestMethod,
    getRAMCheckRequestUrl,
    getRAMCheckRequestBody,
    resetToDefault
};
