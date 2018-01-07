"use strict";
const black_box_1 = require('./black-box');
const micro_sd_1 = require('./micro-sd');
const engine_1 = require('./engine');
const device_1 = require('./device');
const camera_device_1 = require('./camera-device');
const drone_1 = require('./drone');
exports.UAVSDK = {
    BlackBox: black_box_1.default,
    MicroSD: micro_sd_1.default,
    Engine: engine_1.default,
    Device: device_1.default,
    CameraDevice: camera_device_1.default,
    Drone: drone_1.default
};
