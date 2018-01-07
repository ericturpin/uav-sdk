// delay --> ms
function sleep(delay) {
    return new Promise((reject, resolve) => {
        setTimeout(() => { resolve(true); }, delay);
    });
}

class Engine {
    constructor(worker, powerMax) {
        console.log('Worker:Engine:new', powerMax);
        
        this.worker = worker;
        this.power = {
	    current: 0,
	    max: powerMax
	};
        
        this.init();
    }
    
    init() {
        console.log('Worker:Engine:init');
        
        this.power.current = 0;
        this.on = false;
    }
    
    start() {
        console.log('Worker:Engine:start');
        
        this.on = true;
        this.run();
    }
    
    run() {
        console.log('Worker:Engine:run');
        
        setInterval((engine) => {
            engine.update();
        }, 1000, this);
    }
    
    update() {
       // console.log('Worker:Engine:update');
        
        this.post();
    }
    
    stop() {
        console.log('Worker:Engine:stop');
        
        this.power.current = 0;
        this.on = false;
    }
    
    decrease_power() {
        console.log('Worker:Engine:decrease');
        
        if (0 < this.power.current)
            this.power.current -= 50;
    }
    
    increase_power() {
        console.log('Worker:Engine:increase');
        
        if (this.power.current < this.power.max)
            this.power.current += 50;
        
        console.log('Worker', this.power.current);
    }
    
    post() {
        this.worker.postMessage({ 'power' : this.power.current });
    }
}

let ENGINE;

this.onmessage = function(event) {
    let message = event.data;
    
    if (!ENGINE)
        ENGINE = new Engine(this, message.power);
    
    switch (message.action)
    {
        case 'init' : ENGINE.init(); break;
        case 'start' : ENGINE.start(); break;
        case 'decrease' : ENGINE.decrease_power(); break;
        case 'increase' : ENGINE.increase_power(); break;
        case 'stop' : ENGINE.stop(); break;
    }
};
