import Device from './device';

export default class CameraDevice extends Device {
    public fov: number;                 // field of view
    public focalLength: number;         // focal distance
    public energy: number;              // power energy
    
    public time0: number;               // turn on the camera at time0
    
    public date: Date;                  // current date
    public time: number;                // time since turn on the camera
    public coordinates: Array<number>;  // lon, lat, alt (°, °, m)
    public rotation: Array<number>;     // theta, psi (in °)
    public zoom: number;                
    
    public timer: any;                  // timer to update the current date
    public recording: boolean;          // recording or not the current image

    public workers: Map<string, any>;   // <string, Worker>
    
    constructor(fov: number, focalLength: number) {
        super();
        
        this.time0 = (new Date()).getTime();
        
        this.fov = fov;
        this.focalLength = focalLength;
        this.energy = 100;
        
        this.coordinates = [ 0, 0, 0 ];
        this.rotation = [ 0, 0 ];
        this.zoom = 1;

        this.recording = false;

        this.workers = new Map<string, any>();
        
        let worker: any = new Worker('./assets/uav-lib/workers/image-analysis.js');
        
        worker.name = 'image-analysis-worker';
        worker.parent = this;
        
        this.workers.set(worker.name, worker);
        
        this.run();
    }
    
    get longitude(): number {
        return this.coordinates[0];
    }
    
    get latitude(): number {
        return this.coordinates[1];
    }
    
    get altitude(): number {
        return this.coordinates[2];
    }
    
    get theta(): number {
        return this.rotation[0];
    }
    
    get psi(): number {
        return this.rotation[1];
    }

    rotate(axis: number, angle: number) {
        this.rotation[ axis ] += angle;
        this.rotation[ axis ] = this.rotation[ axis ] % (2 * Math.PI);
    }
    
    run() {
        this.timer = setTimeout((camera: CameraDevice) => {
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
            let imageSize = 3 * this.width * this.height;           // RGB * width * height (octets)
        
            this.sd.used += imageSize;
        }
    }
    
    updateParameters = function(position: any, heading: number, pitch: number, roll: number) {
        let pos = Cesium.Cartographic.fromCartesian( position );   // (lon (rad), lat (rad), alt)
        
        this.coordinates[0] = 180 * pos.longitude / Math.PI;
        this.coordinates[1] = 180 * pos.latitude / Math.PI;
        this.coordinates[2] = pos.height;

        if (this.raster_front && this.raster_front.classList.contains('image-analysis-show'))
        {
            let that = this;
            
            this.image.onload = function() {
                that.context_back.drawImage(that.image, 0, 0, that.image.width, that.image.height);
                that.imageData = that.context_back.getImageData(0, 0, that.image.width, that.image.height);
                
                that.applyMask('image-analysis-worker', that.imageData);
            };
            
            this.image.src = this.frame;
        }
    }

    get frame(): string {
        return this.canvas ? this.canvas.toDataURL('image/png') : null;
    }

    get screen() {
        return this.raster_front.toDataURL('image/png');
    }
    
    applyMask = function(name: string, imageData: ImageData) {
        this.workers.get( name ).postMessage({ action : 'data', value : imageData }, [ imageData.data.buffer ]);
    }
    
    imageAnalysisWorkerMessage(message: any) {
        this.context_front.putImageData(message.imageData, 0, 0);
    }
}

