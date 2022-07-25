"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestParameter = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
class RequestParameter {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    /**
     * Returns `String`.
     *
     * Get the name and the value of the request parameter as string "name=value"
     */
    toString() {
        return `${this.name}=${this.value}`;
    }
}
exports.RequestParameter = RequestParameter;
