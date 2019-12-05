// Make the actual CORS request.
//var couchDbBaseUrl = '`http://127.0.0.1:5984/solidfilemanager/"006" -d"{\"test\":\"true\"}"`
var couchDbServerUrl = `http://127.0.0.1:5984`
var couchDbDatabaseName = `solidfilemanager`
var couchDbBaseUrl = `${couchDbServerUrl}/${couchDbDatabaseName}`

export function GetMetaFromCouchDb(id) {
  var xhr = createCORSRequest('GET', `${couchDbBaseUrl}/${id}`);
  if (xhr) {
    xhr.onload = function () {
      var text = xhr.responseText;
      var title = getTitle(text);
      return text;
    };
    xhr.onerror = function () {
      alert('Error calling request to CouchDb.');
    };
    xhr.send();
  }
}

export function UpdateMetaInCouchDb(meta) {
  var xhr = createCORSRequest('GET', `${couchDbBaseUrl}/${id}`);
  if (xhr) {
    xhr.onload = function () {
      var oldMeta = JSON.parse(xhr.responseText)
      if (oldMeta._rev) meta._rev = oldMeta._rev
      WriteMetaInCouchDb(meta)
    }
    xhr.onerror = function () {
      alert('Error calling UpdateMetaInCouchDb.');
    };
    xhr.send();
  }
}

function WriteMetaInCouchDb(meta) {
  var xhr = createCORSRequest('PUT', `${couchDbBaseUrl}/${id}`);
  if (xhr) {
    // Response handlers.
    xhr.onload = function () { };
    xhr.onerror = function () {
      alert('Error calling WriteMetaInCouchDb.');
    };
    xhr.send(JSON.stringify(meta));
  }
}

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

  } else if (typeof XDomainRequest != "undefined") {
    //XDomainRequest for IE.
    //Error: 'XDomainRequest' is not defined  no-undef
    //xhr = new XDomainRequest();
    //xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  if (!xhr) {
    alert('CORS not supported');
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>') && text.match('<title>(.*)?</title>').lenght > 1 ? text.match('<title>(.*)?</title>')[1] : "";
}

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}