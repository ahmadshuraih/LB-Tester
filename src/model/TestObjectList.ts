import { TestObject } from "./TestObject";

export class TestObjectList {
    originalTestObject: TestObject;
    startTenantId: string;
    totalTestObjects: number;
    fixedTenant: boolean;
    incrementStep: number;
    testObjects: TestObject[] = [];

    constructor(originalTestObject: TestObject, startTenantId: string, totalTestObjects: number, fixedTenant: boolean, incrementStep: number) {
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
    addTestObject(testObject: TestObject): void {
        if (this.testObjects === undefined) this.testObjects = [];
        
        this.testObjects.push(testObject);
    }

    /**
     * Returns `string`.
     * 
     * increments the startTenantId and return it as string
     */
    #incrementTenantId(incrementValue: number): string {
        const tenantIdLength = this.startTenantId.length;
        const tenantIdAsNumber = Number(this.startTenantId);
        const tenantIdAsNumberAfterIncrement = tenantIdAsNumber + incrementValue;
        const totalZerosToAdd =  tenantIdLength - `${tenantIdAsNumberAfterIncrement}`.length;
        return `${totalZerosToAdd > 0 ? '0'.repeat(totalZerosToAdd) : ''}${tenantIdAsNumberAfterIncrement}`;
    }

    /**
     * Returns `TestObject[]`.
     * 
     * Generate the TestObjects and add them to the current list
     */
    createAndSetTestObjectsList(): TestObject[] {
        this.testObjects = [];

        for (let i = 0; i < (this.totalTestObjects * this.incrementStep); i += this.incrementStep) {
            const tenantId = this.fixedTenant ? this.originalTestObject.tenantId : this.#incrementTenantId(i);
            
            this.testObjects.push(new TestObject(`Test of tenantId: ${tenantId}`,
                tenantId,
                this.originalTestObject.requestParameters,
                this.originalTestObject.requestBody,
                this.originalTestObject.requestHeaders));
        }

        return this.testObjects;
    }
}