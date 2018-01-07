
export default class TimeSystem {
    current: number;
    
    constructor() {
        this.run();
    }
    
    run() {
        let that = this;
        
        window.requestAnimationFrame(() => { that.run(); });
    
        this.current = (new Date()).getTime();
    }
}
