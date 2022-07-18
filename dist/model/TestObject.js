"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestObject = void 0;
const configurator_1 = __importDefault(require("../configurations/configurator"));
class TestObject {
    testName;
    expectedSrverName;
    expectedServerPort;
    expectedTenantId;
    requestParameters;
    requestBody;
    requestHeaders;
    constructor(testName, expectedSrverName, expectedServerPort, expectedTenantId, requestParameters, requestBody, requestHeaders) {
        this.testName = testName;
        this.expectedSrverName = expectedSrverName;
        this.expectedServerPort = expectedServerPort;
        this.expectedTenantId = expectedTenantId;
        this.requestParameters = requestParameters != undefined ? requestParameters : [];
        this.requestBody = requestBody;
        this.requestHeaders = requestHeaders != undefined ? requestHeaders : {};
    }
    /**
     * Returns `void`.
     *
     * This function adds a request parameter into the request parameters list
     */
    addRequestParameter(requestParamater) {
        this.requestParameters.push(requestParamater);
    }
    /**
     * Returns `string`.
     *
     * This function turns the request parameters list into string and returns it
     */
    getRequestParametersAsString() {
        if (this.requestParameters.length > 0)
            return `?${this.requestParameters.join("&")}`;
        else
            return '';
    }
    /**
     * Returns `TesterOptions`.
     *
     * This function converts this object into TesterOptions and returns it
     */
    toTesterOptions() {
        return { url: `${configurator_1.default.getBaseUrl()}${this.getRequestParametersAsString()}`,
            data: this.requestBody,
            headers: this.requestHeaders };
    }
    ;
}
exports.TestObject = TestObject;
