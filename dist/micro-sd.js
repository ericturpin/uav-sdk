"use strict";
class MicroSD {
    constructor(capacity) {
        this.capacity = capacity;
        this.used = 0;
        this.resources = {};
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MicroSD;
