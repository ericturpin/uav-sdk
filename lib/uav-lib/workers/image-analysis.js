importScripts('../ia/imagery/ianalyser.js');

let IANALYSER = new IAnalyser();

function process(imageData) {
    let options = { histogram : IANALYSER.zero(255) };
       
    IANALYSER.process(imageData.data, options); 
    
    this.postMessage({ imageData, options }, [ imageData.data.buffer ]);
}

this.onmessage = function(event) {
    let { action , value } = event.data;
    
    switch (action)
    {
        case 'mask': IANALYSER.setMask(value); break;
        case 'data': process(value); break;
    }
};
