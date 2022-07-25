"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestObjectList = void 0;
const TestObject_1 = require("./TestObject");
class TestObjectList {
    originalTestObject;
    startTenantId;
    totalTestObjects;
    fixedTenant;
    incrementStep;
    testObjects = [];
    constructor(originalTestObject, startTenantId, totalTestObjects, fixedTenant, incrementStep) {
        this.originalTestObject = originalTestObject;
        this.startTenantId = startTenantId;
        this.totalTestObjects = totalTestObjects;
        this.fixedTenant = fixedTenant;
        this.incrementStep = incrementStep;
        this.testObjects = this.createAndSetTestObjectsList();
    }
    /**
     * Returns `void`.
     *
     * This function adds a test object into the test objects list
     */
    addTestObject(testObject) {
        if (this.testObjects === undefined)
            this.testObjects = [];
        this.testObjects.push(testObject);
    }
    /**
     * Returns `string`.
     *
     * increments the startTenantId and return it as string
     */
    #incrementTenantId(incrementValue) {
        const tenantIdLength = this.startTenantId.length;
        const tenantIdAsNumber = Number(this.startTenantId);
        const tenantIdAsNumberAfterIncrement = tenantIdAsNumber + incrementValue;
        const totalZerosToAdd = tenantIdLength - `${tenantIdAsNumberAfterIncrement}`.length;
        return `${totalZerosToAdd > 0 ? '0'.repeat(totalZerosToAdd) : ''}${tenantIdAsNumberAfterIncrement}`;
    }
    /**
     * Returns `TestObject[]`.
     *
     * Generate the TestObjects and add them to the current list
     */
    createAndSetTestObjectsList() {
        this.testObjects = [];
        for (let i = 0; i < (this.totalTestObjects * this.incrementStep); i += this.incrementStep) {
            const tenantId = this.fixedTenant ? this.originalTestObject.tenantId : this.#incrementTenantId(i);
            this.testObjects.push(new TestObject_1.TestObject(`Test of tenantId: ${tenantId}`, this.originalTestObject.expectedServerName, this.originalTestObject.expectedServerPort, tenantId, this.originalTestObject.requestParameters, this.originalTestObject.requestBody, this.originalTestObject.requestHeaders));
        }
        return this.testObjects;
    }
}
exports.TestObjectList = TestObjectList;
