import configurator from "../configurations/configurator";
import { RequestParameter, TesterOptions, TestObject } from "../types";

/**
 * Returns `TestObject`.
 * 
 * This function creates a new TestObject based on the info that has been given
 */
function createNewTestObject(testName:string, tenantId: string, requestParameters?: RequestParameter[], requestBody?: any, requestHeaders?: object): TestObject {
    return { 
        testName, 
        expectedServerName: "", 
        expectedServerPort: "", 
        tenantId, 
        requestParameters: requestParameters != undefined ? requestParameters : [], 
        requestBody, 
        requestHeaders: requestHeaders != undefined ? requestHeaders : {}
    };
}

/**
 * Returns `string`.
 * 
 * This function turns the request parameters list from the given TestObject into string and returns it
 */
function getRequestParametersAsString(testObject: TestObject): string {
    const requestParameters: string[] = [];
    if (testObject.requestParameters) for (const requestParamater of testObject.requestParameters) requestParameters.push(`${requestParamater.name}=${requestParamater.value}`);
    if (testObject.requestParameters !== undefined && testObject.requestParameters.length > 0) return `?${requestParameters.join("&")}`;
    else return '';
}

/**
 * Returns `TesterOptions`.
 * 
 * This function converts the given TestObject into TesterOptions and returns it
 */
 function toTesterOptions(testObject: TestObject): TesterOptions {
    return { url: `${configurator.getBaseUrl().replace('#{tenantId}', testObject.tenantId)}${getRequestParametersAsString(testObject)}`,
        data: testObject.requestBody,
        headers: testObject.requestHeaders };
}

export default {
    createNewTestObject,
    toTesterOptions
}