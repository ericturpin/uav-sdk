export default class MicroSD {
    capacity: number;
    used: number;
    resources: any;
    
    constructor(capacity: number) {
        this.capacity = capacity;
        this.used = 0;
    
        this.resources = {};
    }
}
