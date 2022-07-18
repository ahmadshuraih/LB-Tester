# LBTester

The **LBTester** is a testser made especially to test the performance and the trustiness of the load balancer that will be made for the project **Latest Collection**

Table of Contents

1. [Configure](#configure)
2. [Add tests](#add-tests)
3. [Prepare tester](#prepare-tester)
4. [Run tests](#run-tests)
5. [Tests log](#tests-log)
6. [Modules details](#modules-details)
7. [Types details](#types-details)

---

## 1. Configure

The configurations are saved in src/configurations/testconfig.json file. By changing the configurations, they will be changed in this file and saved to be always used while the tests running. So be sure that you always set the correct configurations for your tests

### Import configurator

> import configurator from './configurations/configurator';

### Set the request method of the tests list

> configurator.setRequestMethod('Get'); //Default 'Get'

### Set the basic url of the tests list

> configurator.setBaseUrl('http://127.0.0.1:3000/data/98765/inbox') //Default 'http://localhost:3000'

### Set the expected response code of the tests list

> configurator.setExpectedResponseCode(200) //Default 200

## 2. Add tests

You have first to prepare the request parameters and the test objects to add them to tester

### Import RequestParameter and TestObject classes

> import { RequestParameter } from "./RequestParameter";\n
> import { TestObject } from './model/TestObject';

### Create a RequestParameter objects list

> const requestParamaters = [new RequestParameter('token','MasterToken')];

### Create a TestObject

> let testObject = new TestObject('test1', 'Abo-ward', '3000', '00000', requestParamaters);

## 3. Prepare tester

To be able to run the tests you have first to add the testobjects to the tester object as follow:

### Import tester

> import tester from './tester/tester';

### Add TestObjects to tester one by one or as list

> tester.addTestObject(testObject);

or

> tester.setTestObjects([testObject]);

## 4. Run tests

To run the tests call the function startTest() from tester object as follow:

> tester.startTest();

## 5. Tests log

After running the test process, the tester will automatically log the results to the console. But if you want later to see the results, you can see the latest test result using one of these two ways:

### Open testlog.txt file

> The path of testlog.txt is: src/logger/testlog.txt

### Log the contents of testlog.txt to the console

> import logger from '../logger/logger';
> logger.log();

## 6. Modules details

### RequestParameter

RequestParameter is a class wich plays the role of a request parameter:

#### Attributes:

> name: string; //The request parameter name
> value: string; //The request parameter value

#### Functions:

> toString(): string //Turns RequestParameter into string and returns it like this 'name=value'

### TestObject

TestObject is used to add test options for each test:

#### Attributes:

> testName: string //This will be displayed by error or fault test in the test log
> expectedSrverName: string //This will be compared with the server name that will be returned by the response
> expectedServerPort: string //This will be compared with the server port that will be returned by the response
> expectedTenantId: string //This will be compared with the tenant id that will be returned by the response
> requestParameters: RequestParameter[] //This is for the request parameters, must be added using RequestParameter list 'or empty list []'
> requestBody?: any //(optional) This is for the requst body
> requestHeaders: AxiosRequestConfig<any> //(optional) This is for the request headers

#### Functions:

> addRequestParameter(requestParamater: RequestParameter): void //Add a request parameter to the request parameters list within the test object
> getRequestParametersAsString(): string //Get the request paramaters list as string like this 'name1=val1&name2=val2'
> toTesterOptions(): TesterOptions //Get a TesterOptions object using the attributes of TesterObject and the configurations

### testconfig.json

JSON file to save the test configurations that will be used for all the tests during testing

#### Attributes:

> "requestMethod": string //The method of all requests (Default GET)
> "baseurl": string //The base url that will be used in all requests (Default http://localhost:3000)
> "expectedResponseCode": number //The expected response code of all requests (Default 200)

### configurator

A helper module to be able to read and update the attributes of testconfig.json file

#### Functions:

> setRequestMethod(requestMethod: string): void
> setBaseUrl(baseUrl: string): void
> setExpectedResponseCode(responseCode: number): void
> getRequestMethod(): string
> getBaseUrl(): string
> getExpectedResponseCode(): number

### logger

This module manages the logging into the log file testlog.txt

#### Functions:

> addPassedTest(timeSpent: number): void //Increases the passed tests and the time spent during testing current test object
> addFailedTest(fault: string, timeSpent: number): void //Increases the failed tests and the time spent during testing current test object. It also adds the fail description to the fails descriptions list to add it later to the log
> addError(error: string): void //Increases the errors. It also adds the error description to the errors descriptions list to add it later to the log
> prepair(): void //Calculates the logger's informations and writes them to testlog.txt file
> read(): string //Reads the testlog.txt file and returns its contents as string
> log(): void //Logs the contents of the testlog.txt file on the console
> reset(): void //Reset all counters and lists inside the logger object to start a new test
> clear(): void //Clear testlog.txt file contents

### testchecker

Here will be the requests responses results compared with the expected results of the tests. Then the results of the check will be later added to the testlog.txt file using logger module.

#### Functions:

> check(testChechList: TestCheckObject[]): Promise<void> //Compares the requests results with the expected results and adds the check results to testlog.txt file

### tester

Inside the tester will be the requests called and the responses of them sent to be checked by testchecker module

#### Functions:

> callApi(options: TesterOptions): Promise<TestCallResponse> //Calls a request and returns the response of it
> setTestObjects(testObjects: TestObject[]): void //Set a list of TestObject to be tested
> addTestObject(testObject: TestObject): void //Add a TestObject to the TestObjects list
> getTestObjects(): TestObject[] //Returns the TestObjects list
> function startTest(): Promise<void> //Starts the tests and logs the results on the console

## 7. Types details

Within the LBTester are there several types made to make it easier to understand and to use. These types are as following:

### TesterOptions

#### Attributes

> url: string //The base url + the requests parameters as one url
> data?: any //(optional) Data object
> headers?: AxiosRequestConfig<any> //(optional) The request headers

### TestCallResponse

#### Attributes

> succeed: boolean //The result of the api call, if the call succeed or failed with error
> response?: AxiosResponse<any, any> //The response of the api call
> error?: any //The error description if the api call failed with error
> timeSpent?: number //The time spent during this api call

### TestCheckObject

This object contains testobject, testeroptions and testcallresponse that are useful while checking the tests reponse and comparing the results

#### Attributes

> testObject: TestObject
> testerOptions: TesterOptions
> testCallResponse: TestCallResponse
