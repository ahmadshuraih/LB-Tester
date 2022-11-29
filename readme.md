# LBTester

The **LBTester** is a testser made especially to test the performance and the trustiness of the load balancer that will be made for the project **Latest Collection**. An example of usage is available on src/index.ts

Table of Contents:

1. [Configure](#1-configure)
2. [Add tests](#2-add-tests)
3. [Prepare tester](#3-prepare-tester)
4. [Run tests](#4-run-tests)
5. [Tests log](#5-tests-log)
6. [Modules details](#6-modules-details)
7. [Types details](#7-types-details)

---

## 1. Configure

The configurations are saved in testconfig.json file. By changing the configurations, they will be changed in this file and saved to be always used while the tests running. So be sure that you always set the correct configurations for your tests.

### Import configurator

> import configurator from './configurations/configurator';

### Set the request method of the tests list

> configurator.setRequestMethod('Get'); //Default 'Get'.

### Set the basic url of the tests list

> configurator.setBaseUrl('http://localhost:3000/data/#{tenantId}/inbox'); //Default 'http://localhost:3000'.

        #{tenantId} will be replaced with the given tenantId during the tests.

### Enable/Disable expectations automatic assign

> configurator.setExpectationsUsingAddressBook(true) //Default false.

### Set the expected response code of the tests listd

> configurator.setExpectedResponseCode(200) //Default 200.

### Set the address book url from the loadbalancer

> configurator.setAddressBookUrl('http://localhost:3100/loadbalancer/addressbook') //Default 'http://localhost:3100/loadbalancer/addressbook'.

### Randomize the test objects in the list (Optional)

> configurator.setRandomizeTestLists(true) //Default false.

### Set the loadbalancer authentication token to get the addressbook

> configurator.setLBAuthenticationToken('MasterTestToken') //Default 'MasterTestToken'.

### Set the response time header

> configurator.setResponseTimeHeader('X-Response-Time'); //Default "".

### Set asynchrounous test configuration

> - configurator.setParallelTest(true) //Default 'false'
> - configurator.setParallelTestConcurrency(5) //Default 1

### Enable/Disable RAM usage repport

> - configurator.setCheckRAMUsage(true); //Set true to enable or false to disable default (false). When disable no need for the rest configurating steps.
> - configurator.setRAMCheckRequestMethod('Post'); //Request method to get the RAM details.
> - configurator.setRAMCheckRequestUrl('https://localhost:3100/loadbalancer/data'); //Request url to get the RAM details. Default 'https://localhost:3100/loadbalancer/data'.
> - configurator.setRAMCheckRequestBody({ "command": "inspect" }); //Request body to get the RAM details. Default {}. In case of using RAM inspection using the load balancer set it as empty object like this configurator.setRAMCheckRequestBody({});
> - configurator.setRAMCheckRequestHeaders({'Accept-Encoding': 'gzip'}); //This will add these headers to the RAM requests.
> - configurator.setMultiRAMCheck(true); //Set true if the RAM usage will be inspected from multi servers/services using the load balancer. 
> - configurator.setMultiTimeUsageCheck(true); //Set true if the time usage will be inspected from multi servers/services using the load balancer. 
> - configurator.setTestFinishSoundAlert(true); //Play alert sound when tests has been finished

## 2. Add tests

You have first to prepare the request parameters and the test objects to add them to tester.

### Import testObjectFunctions and testObjectListFunctions modules

> - import testObjectFunctions from './functions/testObjectFunctions';
> - import testObjectListFunctions from './functions/testObjectListFunctions';

### Create a RequestParameter objects list

RequestParameter(name, value)

> const requestParamaters = [ { name: 'token', value: 'MasterToken' } ];

### Create a TestObject

createNewTestObject(testName, tenantId, requestParameters?, requestBody?, requestHeaders?, additionUrl?)

> const testObject = testObjectFunctions.createNewTestObject('test1', '00000', requestParamaters);

### create auto generated TestObjectList

createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep)

> let testObjectList = testObjectListFunctions.createNewTestObjectList(testObject, '00000', 1000, false, 1);

## 3. Prepare tester

To be able to run the tests you have first to add the testobjects to the tester object as follow:

### Import tester

> import tester from './tester/tester';

### Add TestObject to tester one by one or as auto generated TestObjectList

> tester.addTestObject(testObject); //Add the given object to the current list.

or

> tester.setTestObjectList(testObjectList); //Replaces the current list with the given list.

or

> tester.addTestObjectList(testObjectList2); //Add the given list to the current list.

### Set the test warm up test objects and rounds per test object

> tester.addWarmUpTestObject(testObject, 100); //testObject is a TestObject to warm up with, 100 is the total of warm up rounds.

## 4. Run tests

To run the tests call the function startTest() from tester object as follow:

> tester.startTest();

## 5. Tests log

After running the test process, the tester will automatically log the results to the console. But if you want later to see the results, you can see the latest test result using one of these ways:

### Open testlog.txt file

> The path of testlog.txt is: /testlog.txt

### Log the contents of testlog.txt to the console

> - import logger from '../logger/logger';
> - logger.log();

### For more exact tests informations

> - The path of testresults.json is: /testresults.json
> - The path of teststimeusagechart.png is: /teststimeusagechart.png
> - The path of testsramusagechart.png is: /testsramusagechart.png

## 6. Modules details

### testObjectFunctions

This module is used to manage the TestObject.

#### Functions:

> - createNewTestObject(testName:string, tenantId: string, requestParameters?: RequestParameter[], requestBody?: any, requestHeaders?: object): TestObject //This function creates a new TestObject.
> - createNewTestObjectWithExpectations(testName:string, expectedServerName: string, expectedServerPort: string, tenantId: string, requestParameters?: RequestParameter[], requestBody?: any, requestHeaders?: object, urlAddition?: string): TestObject //This function creates a new TestObject based on the info that has been given inclusive the expected server name and port.
> - getRequestParametersAsString(testObject: TestObject): string //Get the request paramaters list from TestObject as string like this 'name1=val1&name2=val2'.
> - toTesterOptions(testObject: TestObject): TesterOptions //Get a TesterOptions object from a TestObject using the attributes of the given TesterObject and the configurations.

### testObjectListFunctions

This is used to manage the TestObjectList.

#### Functions:

> - createNewTestObjectList(originalTestObject: TestObject, startTenantId: string, totalTestObjects: number, fixedTenant: boolean, incrementStep: number): TestObjectList //This function creates a new TestObjectList.
> - addTestObjectToList(testObjectList: TestObjectList, testObject: TestObject): void //Adds the given test object into the given test objects list.
> - incrementTenantId(startTenantId: string, incrementValue: number): string //Increments the startTenantId and return it as string.
> - generateTestObjects(originalTestObject: TestObject, startTenantId: string, totalTestObjects: number, fixedTenant: boolean, incrementStep: number): TestObject[] //Generate the TestObjects and add them to the test objects list.

### testconfig.json

JSON file to save the test configurations that will be used for all the tests during testing

#### Attributes:

> - "requestMethod": string //The method of all requests (Default GET)
> - "baseurl": string //The base url that will be used in all requests (Default http://localhost:3000)
> - "expectedResponseCode": number //The expected response code of all requests (Default 200)
> - "expectationsUsingAddressBook": boolean //To set the expected server name and port automatically using the address book.
> - "addressBookUrl": string //The request url of the addressbook from the loadbalancer (Default http://localhost:3100/loadbalancer/addressbook)
> - "randomizeTestLists": boolean //If the tester has to RANDOM resort the testobject list.
> - "lbAuthenticationToken": string //Authentication token when using the load balancer (default "MasterTestToken")
> - "checkRAMUsage": boolean //If the tester has to check the RAM while testing or not (Default false)
> - "ramCheckRequestMethod": string //Request method to get RAM details (Default Post)
> - "ramCheckRequestUrl": string //Request url to get RAM details (default "https://localhost:3100/loadbalancer/data")
> - "ramCheckRequestBody": {} //Request body to get RAM details (default {})
> - "ramCheckRequestHeaders": {} //Request headers to get RAM details (default {})
> - "multiRAMCheck": boolean //If the tester needs to check the RAM usage of multi servers (default false)
> - "multiTimeUsageCheck": false //If the tester needs to check the time usage of multi servers (default false)
> - "parallelTest": boolean //If the tester has to run tests in parallel (default false)
> - "parallelTestConcurrency": number //The concurrency total when run parallel test (default 1)
> - "testFinishSoundAlert": boolean //Play sound alert when the test has been finished (default false)
> - "responseTimeHeader": string //The response time usage that will be in the response (default "")

### configurator

A helper module to be able to read and update the attributes of testconfig.json file

#### Functions:

> - setRequestMethod(requestMethod: string): void
> - setBaseUrl(baseUrl: string): void
> - setExpectedResponseCode(responseCode: number): void
> - setExpectationsUsingAddressBook(expectationsUsingAddressBook: boolean): void
> - setAddressBookUrl(addressBookUrl: string): void
> - setRandomizeTestLists(randomizeTestLists: boolean): void
> - setLBAuthenticationToken(authenticationToken: string): void
> - setCheckRAMUsage(checkRAMUsage: boolean): void
> - setRAMCheckRequestMethod(ramCheckRequestMethod: string): void
> - setRAMCheckRequestUrl(ramCheckRequestUrl: string): void
> - setRAMCheckRequestBody(ramCheckRequestBody: object): void
> - setRAMCheckRequestHeaders(ramCheckRequestHeaders: object): void
> - setMultiRAMCheck(multiRAMCheck: boolean): void
> - setMultiTimeUsageCheck(multiTimeUsageCheck: boolean): void
> - setParallelTest(asynchTest: boolean): void
> - setParallelTestConcurrency(parallelTestConcurrency: number): void
> - setTestFinishSoundAlert(testFinishSoundAlert: boolean): void 
> - setResponseTimeHeader(responseTimeHeader: string): void
> - getRequestMethod(): string
> - getBaseUrl(): string
> - getExpectedResponseCode(): number
> - isExpectationsUsingAddressBook(): boolean
> - getAddressBookUrl(): string
> - isRandomizeTestLists(): boolean
> - getLBAuthenticationToken(): string
> - isCheckRAMUsage(): boolean
> - getRAMCheckRequestMethod(): string
> - getRAMCheckRequestUrl(): string
> - getRAMCheckRequestBody(): object
> - getRAMCheckRequestHeaders(): AxiosRequestHeaders
> - isMultiRAMCheck(): boolean
> - isMultiTimeUsageCheck(): boolean
> - isParallelTest(): boolean
> - getParallelTestConcurrency(): number
> - isTestFinishSoundAlert(): boolean
> - getResponseTimeHeader(): string
> - resetToDefault(): void

### logger

This module manages the logging into the log file testlog.txt

#### Functions:

> - increaseSucceedOrBrokenRequests(succeed: boolean): void //Increase succeed and broken tests in list to give a better report at the end.
> - secceedAndBrokenListToString(): string //Turn increased succeed and broken results into string.
> - addPassedTest(timeUsage: number, server: string): void //Increases the passed tests and the time usage during testing current test object.
> - addFailedTest(fault: string, timeUsage: number): void //Increases the failed tests and the time usage during testing current test object. It also adds the fail description to the fails descriptions list to add it later to the log.
> - addError(error: string, timeUsage: number): void //Increases the errors. It also adds the error description to the errors descriptions list to add it later to the log.
> - addRAMUsage(ramUsage: number, server: string): void //Add ramUsage to be plotted at the end of logging.
> - addWarmpUpRAMUsage(ramUsage: number): void //Add warmUpRAMUsage to be plotted at the end of logging.
> - addRAMUsageAndCapacity(testRAMUsage: TestRAMUsage): void //Add ramUsage and RAM capacity to be plotted at the end of logging.
> - setWarmUpProcessDuration(duration: number): void //Set the total warming up process duration
> - setTestProcessDuration(duration: number): void //Set the total testing process duration
> - serverIsBroken(): void //Calculate how many requests can the server manage at the same time until it breaks and how much time does that cost.
> - prepair(): void //Calculates the logger's informations and writes them to testlog.txt file.
> - plotTestResults(width: number): Promise<<void>void> //Plot the tests usage times and save it to teststimeusagechart.png file.
> - plotTestRAMUsage(width: number): Promise<<void>void> //Plot the RAM usage during the tests and save it to testsramusagechart.png file.
> - plotMultiTestRAMUsage(): Promise<<void>void> //This function loops through the RAM expected servers and runs the plot for each one of them.
> - plotOneMultiTestRAMUsage(serverName:string, listToPlot: number[], width: number): Promise<<void>void> //Plot the RAM usage of one server during the tests and save it to testsramusagechartof[hostport].png file.
> - plotWarmpUpRAMUsage(width: number): Promise<<void>void> //Plot the RAM usage during the warming up and save it to warmpupramusagechart.png file.
> - writeJsonTestResults(testResultObjects: TestResultObject[]): void //This function writes the test result objects to testresults.json file.
> - readTestLog(): string //Reads the testlog.txt file and returns its contents as string.
> - log(): void //Logs the contents of the testlog.txt file on the console.
> - reset(): void //Reset all counters and lists inside the logger object to start a new test.
> - clear(): void //Clear testlog.txt and testresults.json files contents.

### testchecker

Here will be the requests responses results compared with the expected results of the tests. Then the results of the check will be later added to the testlog.txt file using logger module.

#### Functions:

> - convertTestCheckObjectToResultObject(testCheckObject: TestCheckObject, testNumber: number): TestResultObject //Extracts the useful informations from the TestCheckObject to make a TestResultObject wich will be written in testresults.json file.
> - check(testChechList: TestCheckObject[]): Promise<<void>void> //Compares the requests results with the expected results and adds the check results to testlog.txt file.

### tester

Inside the tester will be the requests called and the responses of them sent to be checked by testchecker module

#### Functions:

> - callApi(options: TesterOptions): Promise<<TestCallResponse>TestCallResponse> //Calls a request and returns the response of it.
> - callRAMUsageApi(body: object): Promise<<TestRAMUsage>TestRAMUsage> //This function calls the RAM usage api on itself.
> - getRAMBody(body: object): object //This function decides whether the RAM usage will use the body in configurations or the body has been sent with the tenantId from the tests.
> - getAddressBook(): Promise<AddressBook | any> //This function calls the api of the addressbook in the loadbalancer.
> - setTestObjectsAddresses(): Promise<<boolean>boolean> //Assign the expected server name and port for all TestObjects including the warmUpTestObject.
> - randomSortTestObjectsList(testObjects: TestObject[]): Promise<<void>void> //This function resorts the testObjects list randomly.
> - setTestObjectList(testObjectList: TestObjectList): void //Replace the current list of TestObject with the given one to be tested.
> - addTestObject(testObject: TestObject): void //Add a TestObject to the TestObjects list.
> - addTestObjectList(testObjectList: TestObjectList): void //Add the given TestObjectList to the current list.
> - getTestObjectList(): TestObjectList[] //Returns the current TestObjectList.
> - addWarmUpTestObject(testObject: TestObject, rounds: number): void //Add TestObject and rounds total per object to the warm up list.
> - beep(): Promise<<void>void> //Play beep sound.
> - doWarmUp(multibar: MultiBar): Promise<<void>void> //This function runs the warming up.
> - doSequentialTests(testCheckList: TestCheckObject[], multibar: MultiBar): Promise<<void>void> //This function runs the tests sequentially.
> - doOneParallelTest(testObject: TestObject, testCheckList: TestCheckObject[]): Promise<<void>void> //This function runs one test. It's used for parallel only tests.
> - doBatchParallelTests(testObjectsBatch: TestObject[], testCheckList: TestCheckObject[], multibar: MultiBar): Promise<<void>void> //This function runs a batch of parallel tests. It plays the rule of a user.
> - splitListIntoBatches(testObjects: TestObject[], batchCount: number): TestObject[][] //This function splits the testObjectsList into batches depending on concurrency number.
> - doParallelTests(testCheckList: TestCheckObject[], multibar: MultiBar): Promise<<void>void> //This function runs the tests parallel.
> - startTest(): Promise<<void>void> //This function runs the warmup and tests functions.

## 7. Types details

Within the LBTester are there several types made to make it easier to understand and to use. These types are as following:

### TesterOptions

Object that contains the request options.

#### Attributes:

> - url: string //The base url + the requests parameters as one url.
> - data?: any //(optional) Data object.
> - headers?: AxiosRequestConfig<<any>any> //(optional) The request headers.

### TestCallResponse

Object to contain if the request succeed or failed, the response and the usage time during the requesting.

#### Attributes:

> - succeed: boolean //The result of the api call, if the call succeed or failed with error.
> - response?: { status: number; headers: object } //The needed info from the response of the api call.
> - error?: any //The error description if the api call failed with error.
> - testRAMUsage?: number //The ram usage during this test.

### TestRAMUsage

This object contains the total used RAM and the RAM capacity in the server during a test.

#### Attributes:

> - totalRAM: number //Total RAM capacity in the server.
> - usedRAM: number //Total used RAM in the server.

### TestCheckObject

This object contains testobject, testeroptions and testcallresponse that are useful while checking the tests reponse and comparing the results.

#### Attributes:

> - testObject: TestObject
> - testerOptions: TesterOptions
> - testCallResponse: TestCallResponse

### TestResultObject

This objects contains the useful details for the user to be written in testresults.json file.

#### Attributes:

> - testNumber: number
> - testObject: TestObject
> - testerOptions: TesterOptions
> - testCallResponse: { status: number, headers: object, testRAMUsage?: number }

### SucceedOrBrokenTotal

This object contains how many requests has been succeed or refused by the server because of too many requests

#### Attributes:

> - succeed: boolean //If server accepted or breaks the request.
> - total: number //Total accepted before next break, or total breaks before next acception.

### AddressBook 

This object plays the rule of the addressbook in the loadbalancer.

#### Attributes:

> - [tenantId: string]: TenantAddress //The TenantAddress object assigned to the tenantId as a key.

### RequestParameter

RequestParameter is a class wich plays the role of a request parameter:

#### Attributes:

> - name: string; //The request parameter name.
> - value: any; //The request parameter value.

### TenantAddress:

TenantAddress is used to be easier to use the contents of the returned addressbook from the loadbalancer:

#### Attributes:

> - tenantId: string; //The tenant id.
> - serverProtocol: string; The protocol of the server.
> - serverName: string; //The name of the server.
> - serverPort: number; //The port of the server.

### TestObject

TestObject is used to add test options for each test:

#### Attributes:

> - testName: string //This will be displayed by error or fault test in the test log.
> - expectedServerName: string //This will be compared with the server name that will be returned by the response.
> - expectedServerPort: string //This will be compared with the server port that will be returned by the response.
> - tenantId: string //This will be added to the request url instead of #{tenantId}.
> - requestParameters?: RequestParameter[] //This is for the request parameters, must be added using RequestParameter list 'or empty list []'.
> - requestBody?: any //(optional) This is for the requst body.
> - requestHeaders?: object //(optional) This is for the request headers.
> - urlAddition?: string //URL addition to be added at the end of the url.

### TestObjectList

TestObjectList is used to generate new TestObjects based on a given TestObject and to contain the TestObjects as a list and to manage them within it:

#### Attributes:

> - originalTestObject: TestObject //The original TestObject wich will be copied (Only tenantId will be replaced if neccessary).
> - startTenantId: string //is the start tenant it wich will be increased based on incrementStep.
> - totalTestObjects: //is how many test objects you want to generate.
> - fixedTenant: boolean //If you want to increased the startTenantId of the generated TestObjects or use it as-is for all generated objects from the originalTestObject.
> - incrementStep: number //how many steps (numbers) do you want to increase the startTenantId per generated object.
> - testObjects: TestObject[] //The list that contains all TestObjects.

### WarmUpTestObject 

This object contains the TestObject and the total rounds to know how many times this TestObject has be warmed up before testing.

#### Attributes:

> - testObject: TestObject
> - rounds: number

### CallResponse

Object to contain if the request succeed or failed and the response.

#### Attributes:

> - succeed: boolean //The result of the api call, if the call succeed or failed with error.
> - response?: AxiosResponse<any, any> //The response of the api call.
> - error?: any //The error description if the api call failed with error.

### Collection

Object that contains the attributes and values which being got from the response of the collections url request.
These data are used to add a list of TenantAddress in the tests.

#### Attributes:

> - schema: string //Contains the schema name
> - name: string //Contains the endpoint of the tenant in the schema
> - inCache: boolean
> - count: number
> - checkPoint: number
> - lastOplogId: number

### MultiRAMPLotList 

This object contains list of the servers that has been inspected for RAM with lists of each server RAM usage to be plotted.

#### Attributes:

> - [ server: string ]: number[] //The host:port string assigned to the server as a key.

### MultiTimeUsageList 

This object contains list of the servers that has been tested for time usage with lists of each server time usage to be logged or plotted.

#### Attributes:

> - [ server: string ]: number[] //The host:port string assigned to the server as a key.