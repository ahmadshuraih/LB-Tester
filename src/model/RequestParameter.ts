export class RequestParameter {
    name: string;
    value: string;

    constructor(name:string, value: string) {
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