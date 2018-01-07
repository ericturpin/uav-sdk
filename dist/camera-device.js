"use strict";
const device_1 = require('./device');
class CameraDevice extends device_1.default {
    constructor(fov, focalLength) {
        super();
        this.updateParameters = function (position, heading, pitch, roll) {
            let pos = Cesium.Cartographic.fromCartesian(position); // (lon (rad), lat (rad), alt)
            this.coordinates[0] = 180 * pos.longitude / Math.PI;
            this.coordinates[1] = 180 * pos.latitude / Math.PI;
            this.coordinates[2] = pos.height;
            if (this.raster_front && this.raster_front.classList.contains('image-analysis-show')) {
                let that = this;
                this.image.onload = function () {
                    that.context_back.drawImage(that.image, 0, 0, that.image.width, that.image.height);
                    that.imageData = that.context_back.getImageData(0, 0, that.image.width, that.image.height);
                    that.applyMask('image-analysis-worker', that.imageData);
                };
                this.image.src = this.frame;
            }
        };
        this.applyMask = function (name, imageData) {
            this.workers.get(name).postMessage({ action: 'data', value: imageData }, [imageData.data.buffer]);
        };
        this.time0 = (new Date()).getTime();
        this.fov = fov;
        this.focalLength = focalLength;
        this.energy = 100;
        this.coordinates = [0, 0, 0];
        this.rotation = [0, 0];
        this.zoom = 1;
        this.recording = false;
        this.workers = new Map();
        let worker = new Worker('./assets/uav-lib/workers/image-analysis.js');
        worker.name = 'image-analysis-worker';
        worker.parent = this;
        this.workers.set(worker.name, worker);
        this.run();
    }
    get longitude() {
        return this.coordinates[0];
    }
    get latitude() {
        return this.coordinates[1];
    }
    get altitude() {
        return this.coordinates[2];
    }
    get theta() {
        return this.rotation[0];
    }
    get psi() {
        return this.rotation[1];
    }
    rotate(axis, angle) {
        this.rotation[axis] += angle;
        this.rotation[axis] = this.rotation[axis] % (2 * Math.PI);
    }
    run() {
        this.timer = setTimeout((camera) => {
            camera.updateClock();
            camera.recordImage();
            camera.run();
        }, 500, this);
    }
    updateClock() {
        this.date = new Date();
        this.time = Math.round(((new Date()).getTime() - this.time0) / 1000);
    }
    recordImage() {
        if (this.recording) {
            let imageSize = 3 * this.width * this.height; // RGB * width * height (octets)
            this.sd.used += imageSize;
        }
    }
    get frame() {
        return this.canvas ? this.canvas.toDataURL('image/png') : null;
    }
    get screen() {
        return this.raster_front.toDataURL('image/png');
    }
    imageAnalysisWorkerMessage(message) {
        this.context_front.putImageData(message.imageData, 0, 0);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CameraDevice;
