
import MicroSD from './micro-sd'; 

export default class Device {
    public id: string;

    public canvas: any;
    public image: HTMLImageElement;
    public imageData: ImageData;
    
    public width: number;              // width (pixels)
    public height: number;             // height (pixels)
    
    public sd: MicroSD;                 // its micro SD
    
    // back buffer
    public raster_back: HTMLCanvasElement;
    public context_back: CanvasRenderingContext2D;
    
    // front buffer
    public raster_front: HTMLCanvasElement;
    public context_front: CanvasRenderingContext2D;
    
    public masks = [ 'rgb', 'grayscale', 'classification', 'red', 'green', 'blue', 'gray', 'buildings', 'roads', 'vegetation', 'water' ];

    constructor() {
        this.sd = new MicroSD(4 * 1024 * 1024 * 1024);
    }

    setCanvas(id, canvas) {
        this.id = id;
        this.canvas = canvas;
    }
    
    createRaster = function() {
        if (!this.canvas)
            return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.image = new Image();
        
        // back raster
        this.raster_back = document.createElement('canvas');
        this.raster_back.classList.add('raw', 'raw-hide');
        
        this.raster_back.width = this.width;
        this.raster_back.height = this.height;
        
        this.context_back = this.raster_back.getContext('2d');
        
        // front raster 
        this.raster_front = document.createElement('canvas');
        this.raster_front.classList.add('image-analysis', 'image-analysis-hide');
        
        this.raster_front.width = this.width;
        this.raster_front.height = this.height;
        
        this.context_front = this.raster_front.getContext('2d');
        
        let body = document.querySelector('body');
        let parent = document.querySelector('#' + this.id);
    
        body.appendChild(this.raster_back);
        parent.appendChild(this.raster_front);
    }
}
