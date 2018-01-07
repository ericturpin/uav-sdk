"use strict";
const black_box_1 = require('./black-box');
const engine_1 = require('./engine');
const time_system_1 = require('./time-system');
let changeCameraEvent;
function getFlagForKeyCode(keyCode) {
    switch (keyCode) {
        case 32:
            return 'startEngine';
        case 90:
            return 'increasePower';
        case 83:
            return 'decreasePower';
        case 37: // left
        case 81:
            return 'leftRolling';
        case 39:
        case 68:
            return 'rightRolling';
        case 17:
            return 'rolling';
        case 38:
            return 'downPitching';
        case 40:
            return 'upPitching';
        default:
            return undefined;
    }
}
let clickMousePosition;
let previousMousePosition;
let currentMousePosition;
class Drone {
    constructor() {
        // commands
        this.commands = null;
        this.flags = {
            moving: false,
            rolling: false,
            leftRolling: false,
            rightRolling: false,
            upPitching: false,
            downPitching: false,
            startEngine: false,
            increasePower: false,
            decreasePower: false,
            stopEngine: false,
            switchingCamera: false
        };
        this.engine = new engine_1.default(5000);
        this.timeSystem = new time_system_1.default();
        this.blackbox = new black_box_1.default();
        this.distance_covered = 0;
        this.services = new Map();
        this.lastSentImageMessage = Date.now();
    }
    setID(id) {
        this.id = id;
    }
    getID() {
        return this.id;
    }
    setCamera(camera) {
        this.camera = camera;
    }
    getCamera() {
        return this.camera;
    }
    setCoordinates(coords) {
        this.coordinates = Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, coords.altitude);
        this.altitude = coords.altitude;
    }
    setOrientation(orientation) {
        this.heading = orientation.heading;
        this.pitch = orientation.pitch;
        this.roll = orientation.roll;
    }
    emitData() {
        let t = Date.now();
        this.srv_com_socket.emit('position', {
            flightId: this.getID(),
            coords: { longitude: this.longitude, latitude: this.latitude, altitude: this.altitude },
            orientation: { heading: this.heading, pitch: this.pitch, roll: this.roll }
        });
        if (500 < t - this.lastSentImageMessage) {
            if (this.camera && this.camera.recording) {
                const image = {
                    flight: this.getID(),
                    type: 'png',
                    name: 'IMAGE_' + t,
                    status: 'uploading',
                    geometry: { type: 'Point', coordinates: [this.camera.longitude, this.camera.latitude] },
                    altitude: this.camera.altitude,
                    theta: this.camera.theta,
                    psi: this.camera.psi,
                    fov: this.camera.fov,
                    focalLength: this.camera.focalLength
                };
            }
            this.lastSentImageMessage = t;
        }
    }
    attachEntity(entity) {
        this.entity = entity;
    }
    addSocketEvents() {
        this.addCommunicationSocketEvents();
        this.addStorageSocketEvents();
    }
    addCommunicationSocketEvents() {
        console.log('Connect to the communication station');
        this.srv_com_socket = this.services.get('WebSocketService').connectOn('communication', 'http://127.0.0.1:4002');
        this.srv_com_socket.on('connected', (message) => {
            console.log('Connected to the communication station', message);
        });
        this.srv_com_socket.on('position', (message) => {
        });
        this.srv_com_socket.on('orientation', (message) => {
            console.log('get orientation', message);
            this.camera.rotation[0] = message.roll;
            this.camera.rotation[1] = message.pitch;
        });
    }
    addStorageSocketEvents() {
        console.log('Connect to the storage station');
        this.srv_storage_socket = this.services.get('WebSocketService').connectOn('storage', 'http://127.0.0.1:4003');
        this.srv_storage_socket.on('connected', (message) => {
            console.log('Connected to the storage station', message);
        });
    }
    attachService(service_name, service) {
        this.services.set(service_name, service);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Drone;
