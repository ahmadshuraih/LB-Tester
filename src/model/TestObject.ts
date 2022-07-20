import configurator from '../configurations/configurator';
import { RequestParameter } from "./RequestParameter";
import { TesterOptions } from "../types";
import { AxiosRequestConfig } from 'axios';

export class TestObject {
    testName: string;
    expectedServerName: string;
    expectedServerPort: string;
    tenantId: string;
    requestParameters: RequestParameter[];
    requestBody?: any;
    requestHeaders?: object;

    constructor(testName:string, 
        expectedServerName: string, 
        expectedServerPort: string, 
        tenantId: string, 
        requestParameters?: RequestParameter[], 
        requestBody?: any,
        requestHeaders?: object) {

        this.testName = testName;
        this.expectedServerName = expectedServerName;
        this.expectedServerPort = expectedServerPort;
        this.tenantId = tenantId;
        this.requestParameters = requestParameters != undefined ? requestParameters : [];
        this.requestBody = requestBody;
        this.requestHeaders = requestHeaders != undefined ? requestHeaders : {};
    }

    /**
     * Returns `void`.
     * 
     * This function adds a request parameter into the request parameters list
     */
    addRequestParameter(requestParamater: RequestParameter): void {
        this.requestParameters.push(requestParamater);
    }

    /**
     * Returns `string`.
     * 
     * This function turns the request parameters list into string and returns it
     */
    getRequestParametersAsString(): string {
        if (this.requestParameters.length > 0) return `?${this.requestParameters.join("&")}`;
        else return '';
    }

    /**
     * Returns `TesterOptions`.
     * 
     * This function converts this object into TesterOptions and returns it
     */
    toTesterOptions(): TesterOptions {
        return {url: `${configurator.getBaseUrl().replace('#{tenantId}', this.tenantId)}${this.getRequestParametersAsString()}`,
            data: this.requestBody,
            headers: this.requestHeaders};
    };
}