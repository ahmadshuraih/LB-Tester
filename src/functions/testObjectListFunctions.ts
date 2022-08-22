import { TestObject, TestObjectList } from "../types";
import testObjectFunctions from "./testObjectFunctions";

/**
 * Returns `TestObjectList`.
 * 
 * This function generates a new TestObjectList based on the given data
 */
function createNewTestObjectList(originalTestObject: TestObject, startTenantId: string, totalTestObjects: number, fixedTenant: boolean, incrementStep: number): TestObjectList {
    return { 
        originalTestObject,
        startTenantId,
        totalTestObjects,
        fixedTenant,
        incrementStep,
        testObjects: generateTestObjects(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep) 
    };
}

/**
 * Returns `void`.
 * 
 * This function adds a test object into the test objects list
 */
function addTestObjectToList(testObjectList: TestObjectList, testObject: TestObject): void {
    if (testObjectList.testObjects === undefined) testObjectList.testObjects = [];
    testObjectList.testObjects.push(testObject);
}

/**
 * Returns `string`.
 * 
 * increments the startTenantId and return it as string
 */
function incrementTenantId(startTenantId: string, incrementValue: number): string {
    const tenantIdLength = startTenantId.length;
    const tenantIdAsNumber = Number(startTenantId);
    const tenantIdAsNumberAfterIncrement = tenantIdAsNumber + incrementValue;
    const totalZerosToAdd =  tenantIdLength - `${tenantIdAsNumberAfterIncrement}`.length;
    return `${totalZerosToAdd > 0 ? '0'.repeat(totalZerosToAdd) : ''}${tenantIdAsNumberAfterIncrement}`;
}

/**
 * Returns `TestObject[]`.
 * 
 * Generate the TestObjects and add them to the TestObjectList
 */
function generateTestObjects(originalTestObject: TestObject, startTenantId: string, totalTestObjects: number, fixedTenant: boolean, incrementStep: number): TestObject[] {
    const testObjects: TestObject[] = [];

    for (let i = 0; i < (totalTestObjects * incrementStep); i += incrementStep) {
        const tenantId = fixedTenant ? originalTestObject.tenantId : incrementTenantId(startTenantId, i);
        
        testObjects.push(
            testObjectFunctions.createNewTestObject(
                `Test of tenantId: ${tenantId}`,
                tenantId,
                originalTestObject.requestParameters,
                originalTestObject.requestBody,
                originalTestObject.requestHeaders)
        );
    }

    return testObjects;
}

export default {
    createNewTestObjectList,
    addTestObjectToList
}