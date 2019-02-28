let socket = io.connect('https://concido.serveo.net');
let counter = 0;

let accr = document.getElementById('requestList');

socket.on('connect', function (data) {
  let path = window.location.pathname;
  path = path.substring(1, path.length);
  socket.emit('path', path);
});

socket.on('request', function (data) {
  addRequest(data);
});

function addRequest(data) {
  console.log(data);
  counter++;
  accr.innerHTML = `
      <div class="card my-1">
        <div class="card-header px-3 py-2" id="header" data-toggle="collapse" data-target="#request${counter}">
          <div class="row">
            <p class="text-truncate mb-0 col-10"> ${data.details.method} <code class="ml-2">${data.details.path}</code></p>
            <div class="col-2 text-right"><span class="badge badge-secondary">${counter}</span></div>
          </div>
        </div>
        <div class="collapse" id="request${counter}">
          <div class="card-body p-2">
            <div class="row">
              <div class="col pr-auto">
                <p class="mb-1 mt-0 req-label"><strong>Request Body</strong></p>
                <textarea class="form-control payload" rows="8" disabled>${JSON.stringify(data.body, null, 2)}</textarea>
              </div>
              <div class="col pl-0 collapse" id="header${counter}">
                <p class="mb-1 mt-0 req-label"><strong>Request Headers</strong></p>
                <textarea class="form-control payload" rows="8" disabled>${JSON.stringify(data.header, null, 2)}</textarea>
              </div>
            </div>
            <div class="row">
              <div class="col text-right" data-toggle="collapse" data-target="#header${counter}"><p class="req-label text-muted mb-0 mt-1">View Headers</p></div>
            </div>
          </div>
        </div>
      </div>
      `+ accr.innerHTML;
}