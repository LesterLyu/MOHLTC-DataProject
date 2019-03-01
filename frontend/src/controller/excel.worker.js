onmessage = startCounter;

function startCounter(event) {
  console.log(event.data);
  let initial = event.data;
  setTimeout(() => this.postMessage(initial++), 1000);
}

