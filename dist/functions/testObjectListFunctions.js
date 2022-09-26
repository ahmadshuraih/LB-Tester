"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testObjectFunctions_1 = __importDefault(require("./testObjectFunctions"));
/**
 * Returns `TestObjectList`.
 *
 * This function generates a new TestObjectList based on the given data
 */
function createNewTestObjectList(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep) {
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
function addTestObjectToList(testObjectList, testObject) {
    if (testObjectList.testObjects === undefined)
        testObjectList.testObjects = [];
    testObjectList.testObjects.push(testObject);
}
/**
 * Returns `string`.
 *
 * increments the startTenantId and return it as string
 */
function incrementTenantId(startTenantId, incrementValue) {
    const tenantIdLength = startTenantId.length;
    const tenantIdAsNumber = Number(startTenantId);
    const tenantIdAsNumberAfterIncrement = tenantIdAsNumber + incrementValue;
    const totalZerosToAdd = tenantIdLength - `${tenantIdAsNumberAfterIncrement}`.length;
    return `${totalZerosToAdd > 0 ? '0'.repeat(totalZerosToAdd) : ''}${tenantIdAsNumberAfterIncrement}`;
}
/**
 * Returns `TestObject[]`.
 *
 * Generate the TestObjects and add them to the TestObjectList
 */
function generateTestObjects(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep) {
    const testObjects = [];
    for (let i = 0; i < (totalTestObjects * incrementStep); i += incrementStep) {
        const tenantId = fixedTenant ? originalTestObject.tenantId : incrementTenantId(startTenantId, i);
        testObjects.push(testObjectFunctions_1.default.createNewTestObject(`Test of tenantId: ${tenantId}`, tenantId, originalTestObject.requestParameters, originalTestObject.requestBody, originalTestObject.requestHeaders, originalTestObject.urlAddition));
    }
    return testObjects;
}
exports.default = {
    createNewTestObjectList,
    addTestObjectToList
};
