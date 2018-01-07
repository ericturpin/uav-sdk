"use strict";
class Engine {
    constructor(power) {
        this.power = {
            current: 0,
            max: 0
        };
        this.power.max = power;
        this.worker = new Worker('./assets/uav-lib/workers/engine.js');
        this.worker.name = 'droneengine';
        this.worker.parent = this;
        this.init();
    }
    init() {
        this.worker.postMessage({ action: 'init', power: this.power.max });
    }
    start() {
        if (!this.on) {
            this.worker.postMessage({ action: 'start' });
            this.on = true;
        }
    }
    decode(action) {
        this.power.current = action.power;
    }
    run() {
    }
    update() {
    }
    stop() {
        this.worker.postMessage({ action: 'stop' });
        this.on = false;
    }
    decrease_power() {
        this.worker.postMessage({ action: 'decrease' });
    }
    increase_power() {
        this.worker.postMessage({ action: 'increase' });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Engine;
