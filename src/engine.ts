export default class Engine {
    public on: boolean;

    public power = {
        current: 0,
        max: 0
    };

    public worker: any;         // Worker

    constructor(power: number) {
        this.power.max = power;
        
        this.worker = new Worker('./assets/uav-lib/workers/engine.js');
        this.worker.name = 'droneengine';
        this.worker.parent = this;
        
        this.init();
    }
    
    init() {
        this.worker.postMessage({action : 'init', power : this.power.max});
    }
    
    start() {
        if (!this.on)
        {
            this.worker.postMessage({action: 'start'});
            this.on = true;
        }
    }
    
    decode(action: any) {
        this.power.current = action.power;
    }
    
    run() {
    }
    
    update() {
    }
    
    stop() {
        this.worker.postMessage({action: 'stop'});
        this.on = false;
    }
    
    decrease_power() {
        this.worker.postMessage({action: 'decrease'});
    }
    
    increase_power() {
        this.worker.postMessage({action: 'increase'});
    }
}
