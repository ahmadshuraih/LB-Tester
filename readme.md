# LBTester

The **LBTester** is a testser made especially to test the performance and the trustiness of the load balancer that will be made for the project **Latest Collection**
g
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

### Import RequestParameter, TestObject and TestObjectList classes

> import { RequestParameter } from "./RequestParameter";<br>
> import { TestObject } from './model/TestObject';<br>
> import { TestObjectList } from './model/TestObjectList';

### Create a RequestParameter objects list

RequestParameter(name, value)

> const requestParamaters = [new RequestParameter('token','MasterToken')];

### Create a TestObject

TestObject(testName, expectedSrverName, expectedServerPort, tenantId, requestParameters?, requestBody?, requestHeaders?)

> let testObject = new TestObject('test1', 'Abo-ward', '3000', '00000', requestParamaters);

### create auto generated TestObjectList

TestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)

> let testObjectList = new TestObjectList(testObject, '00000', 1000, false, 1);

## 3. Prepare tester

To be able to run the tests you have first to add the testobjects to the tester object as follow:

### Import tester

> import tester from './tester/tester';

### Add TestObject to tester one by one or as auto generated TestObjectList

> tester.addTestObject(testObject); //Add the given object to the current list

or

> tester.setTestObjectList(testObjectList); //Replaces the current list with the given list

or

> tester.addTestObjectList(testObjectList2); //Add the given list to the current list

## 4. Run tests

To run the tests call the function startTest() from tester object as follow:

> tester.startTest();

## 5. Tests log

After running the test process, the tester will automatically log the results to the console. But if you want later to see the results, you can see the latest test result using one of these ways:

### Open testlog.txt file

> The path of testlog.txt is: src/logger/testlog.txt

### Log the contents of testlog.txt to the console

> import logger from '../logger/logger';<br>
> logger.log();

### For more exact tests informations

> The path of testresults.json is: src/logger/testresults.json

## 6. Modules details

### RequestParameter

RequestParameter is a class wich plays the role of a request parameter:

#### Attributes:

> - name: string; //The request parameter name.<br>
> - value: any; //The request parameter value.

#### Functions:

> - toString(): string //Turns RequestParameter into string and returns it like this 'name=value'.

### TestObject

TestObject is used to add test options for each test:

#### Attributes:

> - testName: string //This will be displayed by error or fault test in the test log.<br>
> - expectedSrverName: string //This will be compared with the server name that will be returned by the response.<br>
> - expectedServerPort: string //This will be compared with the server port that will be returned by the response.<br>
> - tenantId: string //This will be added to the request url instead of #{tenantId}.<br>
> - requestParameters: RequestParameter[] //This is for the request parameters, must be added using RequestParameter list 'or empty list []'.<br>
> - requestBody?: any //(optional) This is for the requst body.<br>
> - requestHeaders: object //(optional) This is for the request headers.

#### Functions:

> - addRequestParameter(requestParamater: RequestParameter): void //Add a request parameter to the request parameters list within the test object.<br>
> - getRequestParametersAsString(): string //Get the request paramaters list as string like this 'name1=val1&name2=val2'.<br>
> - toTesterOptions(): TesterOptions //Get a TesterOptions object using the attributes of TesterObject and the configurations.

### TestObjectList

TestObjectList is used to generate new TestObjects based on a given TestObject and to contain the TestObjects as a list and to manage them within it:

#### Attributes:

> - originalTestObject: TestObject //The original TestObject wich will be copied (Only tenantId will be replaced if neccessary).<br>
> - startTenantId: string //is the start tenant it wich will be increased based on incrementStep.<br>
> - totalTestObjects: //is how many test objects you want to generate.<br>
> - fixedTenant: boolean //If you want to increased the startTenantId of the generated TestObjects or use it as-is for all generated objects from the originalTestObject.<br>
> - incrementStep: number //how many steps (numbers) do you want to increase the startTenantId per generated object.<br>
> - testObjects: TestObject[] //The list that contains all TestObjects.<br>

#### Functions:

> - addTestObject(testObject: TestObject): void //Adds a test object into the test objects list.<br>
> - #incrementTenantId(incrementValue: number): string //Increments the startTenantId and return it as string.<br>
> - createAndSetTestObjectsList(): TestObject[] //Generate the TestObjects and add them to the current list.

### testconfig.json

JSON file to save the test configurations that will be used for all the tests during testing

#### Attributes:

> - "requestMethod": string //The method of all requests (Default GET)<br>
> - "baseurl": string //The base url that will be used in all requests (Default http://localhost:3000)<br>
> - "expectedResponseCode": number //The expected response code of all requests (Default 200)

### configurator

A helper module to be able to read and update the attributes of testconfig.json file

#### Functions:

> - setRequestMethod(requestMethod: string): void<br>
> - setBaseUrl(baseUrl: string): void<br>
> - setExpectedResponseCode(responseCode: number): void<br>
> - getRequestMethod(): string<br>
> - getBaseUrl(): string<br>
> - getExpectedResponseCode(): number

### logger

This module manages the logging into the log file testlog.txt

#### Functions:

> - increaseSucceedOrBrokenRequests(succeed: boolean): void //Increase succeed and broken tests in list to give a better report at the end.<br>
> - secceedAndBrokenListToString(): string //Turn increased succeed and broken results into string.<br>
> - addPassedTest(timeSpent: number): void //Increases the passed tests and the time spent during testing current test object.<br>
> - addFailedTest(fault: string, timeSpent: number): void //Increases the failed tests and the time spent during testing current test object. It also adds the fail description to the fails descriptions list to add it later to the log.<br>
> - addError(error: string): void //Increases the errors. It also adds the error description to the errors descriptions list to add it later to the log.<br>
> - serverIsBroken(): void //Calculate how many requests can the server manage at the same time until it breaks and how much time does that cost.<br>
> - prepair(): void //Calculates the logger's informations and writes them to testlog.txt file.<br>
> - writeJsonTestResults(testResultObjects: TestResultObject[]): void //This function writes the test result objects to testresults.json file.<br>
> - readTestLog(): string //Reads the testlog.txt file and returns its contents as string.<br>
> - log(): void //Logs the contents of the testlog.txt file on the console.<br>
> - reset(): void //Reset all counters and lists inside the logger object to start a new test.<br>
> - clear(): void //Clear testlog.txt and testresults.json files contents.

### testchecker

Here will be the requests responses results compared with the expected results of the tests. Then the results of the check will be later added to the testlog.txt file using logger module.

#### Functions:

> - convertTestCheckObjectToResultObject(testCheckObject: TestCheckObject): TestResultObject //Extracts the useful informations from the TestCheckObject to make a TestResultObject wich will be written in testresults.json file.<br>
> - check(testChechList: TestCheckObject[]): Promise<void> //Compares the requests results with the expected results and adds the check results to testlog.txt file.

### tester

Inside the tester will be the requests called and the responses of them sent to be checked by testchecker module

#### Functions:

> - callApi(options: TesterOptions): Promise<TestCallResponse> //Calls a request and returns the response of it.<br>
> - setTestObjectList(testObjectList: TestObjectList): void //Replace the current list of TestObject with the given one to be tested.<br>
> - addTestObject(testObject: TestObject): void //Add a TestObject to the TestObjects list.<br>
> - addTestObjectList(testObjectList: TestObjectList): void //Add the given TestObjectList to the current list<br>
> - getTestObjectList(): TestObjectList[] //Returns the current TestObjectList.<br>
> - function startTest(): Promise<void> //Starts the tests and logs the results on the console.

## 7. Types details

Within the LBTester are there several types made to make it easier to understand and to use. These types are as following:

### TesterOptions

#### Attributes:

> - url: string //The base url + the requests parameters as one url<br>
> - data?: any //(optional) Data object<br>
> - headers?: AxiosRequestConfig<any> //(optional) The request headers

### TestCallResponse

Object to contain if the request succeed or failed, the response and the spent time during the requesting

#### Attributes:

> - succeed: boolean //The result of the api call, if the call succeed or failed with error<br>
> - response?: AxiosResponse<any, any> //The response of the api call<br>
> - error?: any //The error description if the api call failed with error<br>
> - timeSpent?: number //The time spent during this api call

### TestCheckObject

This object contains testobject, testeroptions and testcallresponse that are useful while checking the tests reponse and comparing the results

#### Attributes:

> - testObject: TestObject<br>
> - testerOptions: TesterOptions<br>
> - testCallResponse: TestCallResponse

### TestResultObject

This objects contains the useful details for the user to be written in testresults.json file

#### Attributes:

> - testObject: TestObject<br>
> - testerOptions: TesterOptions<br>
> - testCallResponse: {status: number, headers: {}, timeSpent: number}

### SucceedOrBrokenTotal

This object contains how many requests has been succeed or refused by the server because of too many requests

#### Attributes:

> - succeed: boolean //If server accepted or breaks the request.<br>
> - total: number //Total accepted before next break, or total breaks before next acception.
