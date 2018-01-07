import BlackBox from './black-box';
import CameraDevice from './camera-device';
import Engine from './engine';
import TimeSystem from './time-system';

let changeCameraEvent: any;

function getFlagForKeyCode(keyCode: number): string {
    switch (keyCode) {
    case 32:    // space
        return 'startEngine';
    case 90:    // z
        return 'increasePower';
    case 83:    // s
        return 'decreasePower';
    case 37:    // left
    case 81:    // q
        return 'leftRolling';
    case 39:
    case 68:    // d
        return 'rightRolling'; 
    case 17:    // left ctrl
        return 'rolling';
    case 38:
        return 'downPitching';
    case 40:
        return 'upPitching';

    default:
        return undefined;
    }
}

let clickMousePosition: any;
let previousMousePosition: any;
let currentMousePosition: any;

export default class Drone {
    public id: string;                  // the current associated flight ID
    
    public timeSystem: any;
    public entity: any;

    public engine: Engine;              // drone engine
    public camera: CameraDevice;        // embedded camera
    public blackbox: BlackBox;          // storage disk

    // Features
    public mass: number;                 // drone mass
    
    // Geolocation position
    public coordinates: any;                // Cesium.Cartesian3(x,y,z)
    
    public longitude: number;            // readonly
    public latitude: number;             // readonly 
    public altitude: number;             // readonly

    public heading: number;             // readonly
    public pitch: number;               // readonly 
    public roll: number;                // readonly
    
    public distance_covered: number;     // readonly
    
    // commands
    public commands: any = null;

    public flags = {
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
    
    services: Map<string, any>;
    
    // the sockets
    srv_com_socket: any;
    srv_storage_socket: any;

    lastSentImageMessage: number;

    constructor() {
        this.engine = new Engine(5000);
        this.timeSystem = new TimeSystem();
        
        this.blackbox = new BlackBox(); 
        
        this.distance_covered = 0;

        this.services = new Map<string, any>();
        
        this.lastSentImageMessage = Date.now();
    }

    setID(id: string) {
        this.id = id;
    }

    getID() {
        return this.id;
    }

    setCamera(camera: CameraDevice) {
        this.camera = camera;
    }
    
    getCamera() {
        return this.camera;
    }

    setCoordinates(coords: any) {
        this.coordinates = Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, coords.altitude);
        this.altitude = coords.altitude;
    }

    setOrientation(orientation: any) {
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

        if (500 < t - this.lastSentImageMessage)
        {
            if (this.camera && this.camera.recording)
            {
                const image = {
                    flight: this.getID(),
                    type: 'png',
                    name: 'IMAGE_' + t,
                    status: 'uploading',
                    geometry: { type: 'Point', coordinates: [ this.camera.longitude, this.camera.latitude ] },
                    altitude: this.camera.altitude,
                    theta: this.camera.theta,
                    psi: this.camera.psi,
                    fov: this.camera.fov,
                    focalLength: this.camera.focalLength
                };

                /*
		this.imageService.create(image).do(image => {
                    const image_data = {
                        id: image._id,
                        data: this.camera.screen
                    };

                    this.srv_storage_socket.emit('image', image_data);
                }).subscribe();
		*/
            }    
                
            this.lastSentImageMessage = t;
        }
    }   
    
    attachEntity(entity: any) {
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

    attachService(service_name: string, service: any) {
        this.services.set(service_name, service);
    }
}

