import { Meta } from './TagUtils';

export interface CouchDbRow {
  key: string,
  value: string
}


export default class TagUtils {

  static couchDbServerUrl = `http://127.0.0.1:5984`
  static couchDbDatabaseName = `solidfilemanager`
  static couchDbBaseUrl = `${TagUtils.couchDbServerUrl}/${TagUtils.couchDbDatabaseName}`

  // unused.
  static getMetaFromCouchDb(id: string) {
    const xhr = this.createCORSRequest('GET', `${this.couchDbBaseUrl}/${id}`);
    if (xhr) {
      xhr.onload = function () {
        const text = xhr.responseText;
        return text;
      };
      xhr.onerror = function () {
        alert('Error calling request to CouchDb.');
      };
      xhr.send();
    }
  }

  static updateMetaInCouchDb(meta: Meta) {
    const xhr = this.createCORSRequest('GET', `${this.couchDbBaseUrl}/${this.createIdFromMeta(meta)}`);
    if (xhr) {
      xhr.onload = function () {
        const oldMeta = JSON.parse(xhr.responseText)
        if (oldMeta && oldMeta._rev) meta._rev = oldMeta._rev
        TagUtils.writeMetaInCouchDb(meta)
      }
      xhr.onerror = function () {
        alert('Error calling UpdateMetaInCouchDb.');
      };
      xhr.send();
    }
  }

  //only called by previous updateMeta
  static writeMetaInCouchDb(meta: Meta) {
    const xhr = this.createCORSRequest('PUT', `${this.couchDbBaseUrl}/${this.createIdFromMeta(meta)}`);
    if (xhr) {
      // Response handlers.
      xhr.onload = function () { };
      xhr.onerror = function () {
        alert('Error calling writeMetaInCouchDb.');
      };
      xhr.send(JSON.stringify(meta));
    }
  }

  static couchDbGetUsedTags(callBackFromCouchDbGetUsedTags: {}) {
    const xhr = this.createCORSRequest('GET', `${this.couchDbBaseUrl}/_design/DesignDoc/_view/byTagsReduced?group=true`);
    if (xhr) {
      // Response handlers.
      xhr.onload = function () {
        const list = JSON.parse(xhr.responseText).rows as CouchDbRow[];
        //return list;
        callBackFromCouchDbGetUsedTags(list)
        return null
      };
      xhr.onerror = function () {
        alert('Error calling getListOfUsedTags.');
      };
      xhr.send();
    }
  }

// Create the XHR object.
static createCORSRequest(method: string, url: string) {
  let xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true); //false to be sync
    xhr.setRequestHeader("Content-Type", "application/json");
    //} else if (typeof XDomainRequest != "undefined") {
    //XDomainRequest for IE.
    //Error: 'XDomainRequest' is not defined  no-undef
    //xhr = new XDomainRequest();
    //xhr.open(method, url);
  } else {
    alert('CORS not supported');
  }
  return xhr;
}

static createIdFromMeta(meta: Meta) {
  const reg = new RegExp("[/]", "g")
  return (meta.hostName + meta.pathName).replace(reg, '.')
}
}
