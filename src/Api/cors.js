// Make the actual CORS request.
//var couchDbBaseUrl = '`http://127.0.0.1:5984/solidfilemanager/"006" -d"{\"test\":\"true\"}"`
var couchDbServerUrl = `http://127.0.0.1:5984`
var couchDbDatabaseName = `solidfilemanager`
var couchDbBaseUrl = `${couchDbServerUrl}/${couchDbDatabaseName}`

export function getMetaFromCouchDb(id) {
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

export function updateMetaInCouchDb(meta) {
  var xhr = createCORSRequest('GET', `${couchDbBaseUrl}/${meta.fileUrl}`);
  if (xhr) {
    xhr.onload = function () {
      var oldMeta = JSON.parse(xhr.responseText)
      if (oldMeta._rev) meta._rev = oldMeta._rev
      writeMetaInCouchDb(meta)
    }
    xhr.onerror = function () {
      alert('Error calling UpdateMetaInCouchDb.');
    };
    xhr.send();
  }
}

function writeMetaInCouchDb(meta) {
  var xhr = createCORSRequest('PUT', `${couchDbBaseUrl}/${meta.fileUrl}`);
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
