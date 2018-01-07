"use strict";
class BlackBox {
    constructor() {
        this.delay = 1000; // delay before a new record
        this.times = [];
        this.positions = [];
    }
    record(data) {
        let t = (new Date()).getTime();
        let dt = this.times.length ? (t - this.times[this.times.length - 1]) : (this.delay + 1);
        if (dt < this.delay)
            return;
        if (data.position)
            this.recordPosition(data.position);
        this.times.push(t);
    }
    recordPosition(position) {
        let longitude_deg = 180 * position.longitude / Math.PI;
        let latitude_deg = 180 * position.latitude / Math.PI;
        this.positions = this.positions.concat([longitude_deg, latitude_deg]);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlackBox;
