export class RequestParameter {
    name: string;
    value: any;

    constructor(name:string, value: any) {
        this.name = name;
        this.value = value;
    }

    /**
     * Returns `String`.
     * 
     * Get the name and the value of the request parameter as string "name=value"
     */
    toString(): string {
        return `${this.name}=${this.value}`;
    };
}