import { TestObject } from "../model/TestObject";

export type TesterOptions = {url: string; data?: any; headers?: AxiosRequestConfig<any>};
export type TestCallResponse = {succeed: boolean; response?: AxiosResponse<any, any>; error?: any; timeSpent?: number};
export type TestCheckObject = {testObject: TestObject; testerOptions: TesterOptions; testCallResponse: TestCallResponse};