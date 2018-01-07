importScripts('../files/image-reader.js');

let IMAGEREADER = new ImageReader();

function exif(workerName, fileIndex, file) {
    IMAGEREADER.readAsArrayBuffer(file).then(buffer => {
        let view = new DataView(buffer);
        let exif = IMAGEREADER.getExif(view);

        this.postMessage({ workerName: workerName, type: 'exif', fileIndex: fileIndex, exif: exif });
    });
}

function xmp(workerName, fileIndex, file) {
    IMAGEREADER.readAsArrayBuffer(file).then(buffer => {
        let view = new DataView(buffer);
        let xmp = IMAGEREADER.getXMP(view);

        this.postMessage({ workerName: workerName, type: 'xmp', fileIndex: fileIndex, xmp: xmp });
    });
}

function thumbnail(workerName, fileIndex, file) {
    IMAGEREADER.readAsArrayBuffer(file).then(buffer => {
        let view = new DataView(buffer);
        let thumb = IMAGEREADER.getThumbnail(view);
        
        this.postMessage({ workerName: workerName, type: 'thumbnail', fileIndex: fileIndex, thumbnail: thumb });
    });
}

function tags(workerName, fileIndex, file) {
    IMAGEREADER.readAsArrayBuffer(file).then(buffer => {
        let view = new DataView(buffer);

        let exif = IMAGEREADER.getExif(view);
        let xmp = IMAGEREADER.getXMP(view);
        let thumb = IMAGEREADER.getThumbnail(view);

        this.postMessage({ workerName: workerName, type: 'tags', fileIndex: fileIndex, exif: exif, xmp: xmp, thumbnail: thumb });
    });
}

this.onmessage = function(event) {
    let { workerName, action, fileIndex, file } = event.data;

    switch (action)
    {
        case 'exif': exif(workerName, fileIndex, file); break;
        case 'xmp': xmp(workerName, fileIndex, file); break;
        case 'thumbnail': thumbnail(workerName, fileIndex, file); break;
        case 'tags': tags(workerName, fileIndex, file); break;
    }
};
