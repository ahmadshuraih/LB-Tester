/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestObject } from "../model/TestObject";

export type TesterOptions = {url: string; data?: any; headers?: AxiosRequestConfig<any>};
export type TestCallResponse = {succeed: boolean; response?: AxiosResponse<any, any>; error?: any; timeSpent?: number};
export type TestCheckObject = {testObject: TestObject; testerOptions: TesterOptions; testCallResponse: TestCallResponse};
export type TestResultObject = {testObject: TestObject; testerOptions: TesterOptions; testCallResponse: {status: number, headers: object, timeSpent: number}};
export type SucceedOrBrokenTotal = {succeed: boolean; total: number};