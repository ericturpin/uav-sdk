"use strict";
class TimeSystem {
    constructor() {
        this.run();
    }
    run() {
        let that = this;
        window.requestAnimationFrame(() => { that.run(); });
        this.current = (new Date()).getTime();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeSystem;
