// Note: Only one command can be called in one time.
importScripts('/node_modules/pako/dist/pako.min.js');

onmessage = function (e) {
    console.log('Message received from main thread: ' + e.data.cmd);
    const data = e.data;
    switch(data.cmd) {
        case 'zip':
            this.postMessage(zip(data.data));
            break;
        case 'unzip':
            this.postMessage(unzip(data.data));
            break;
        default:
            console.error('Unknown command');
    }
};

function unzip(binary) {
    return JSON.parse(pako.inflate(binary, {to: 'string'}));
}

function zip(string) {
    return pako.deflate(string, {to: 'string'});
}
