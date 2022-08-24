/* eslint-disable @typescript-eslint/no-explicit-any */
export type TesterOptions = { url: string; data?: any; headers?: AxiosRequestConfig<any> };
export type TestCallResponse = { succeed: boolean; response?: AxiosResponse<any, any>; error?: any; timeSpent?: number };
export type TestCheckObject = { testObject: TestObject; testerOptions: TesterOptions; testCallResponse: TestCallResponse };
export type TestResultObject = { testNumber: number; testObject: TestObject; testerOptions: TesterOptions; testCallResponse: { status: number, headers: object, timeSpent: number } };
export type SucceedOrBrokenTotal = { succeed: boolean; total: number };
export type AddressBook = { [ tenantId:string ]: TenantAddress };
export type RequestParameter = { name: string; value: any };
export type TenantAddress = { tenantId: string; serverProtocol: string; serverName: string; serverPort: number };
export type TestObject = { testName: string; expectedServerName: string; expectedServerPort: string; tenantId: string; requestParameters?: RequestParameter[]; requestBody?: any; requestHeaders?: object };
export type TestObjectList = { originalTestObject: TestObject; startTenantId: string; totalTestObjects: number; fixedTenant: boolean; incrementStep: number; testObjects: TestObject[] = []; }