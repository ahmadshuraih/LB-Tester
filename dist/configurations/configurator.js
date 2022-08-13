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
exports.default = {
    setRequestMethod,
    setBaseUrl,
    setExpectedResponseCode,
    setAddressBookUrl,
    getRequestMethod,
    getBaseUrl,
    getExpectedResponseCode,
    getAddressBookUrl
};
