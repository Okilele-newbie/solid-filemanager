import { Meta, MetaTag } from './TagUtils';


interface CouchDbRowKeyValue {
  key: string,
  value: string
}

export interface FoundTags {
  key: string,
  value: string
}


export default class CouchDb {

  static couchDbServerUrl = `http://127.0.0.1:5984`
  static couchDbDatabaseName = `solidfilemanager`
  static couchDbBaseUrl = `${CouchDb.couchDbServerUrl}/${CouchDb.couchDbDatabaseName}`

  // unused.
  static getMetaById(id: string) {
    const xhr = this.createCORSRequest('GET', `${this.couchDbBaseUrl}/${id}`);
    if (xhr) {
      xhr.onload = function () {
        const text = xhr.responseText;//=> ToDo return object
        return text;
      };
      xhr.onerror = function () {
        alert('Error calling request to CouchDb.');
      };
      xhr.send();
    }
  }

  static viewNames = { "MetasByTags": "MetasByTags", "MetaById": "MetaById", "GroupedTags": "GroupedTags", }
  static getItemsByView(viewName: string, key: string): Promise<Array<any>> {
    //const view = this.viewNames.[{viewName}]
    //const view: string = Object.keys(this.viewNames).find((name: string) => this.viewNames[name] === viewName)
    return new Promise((resolve, reject) => {
      let param: string = ''
      key === ''
        ? param = `_design/DesignDoc/_view/${viewName}`
        : param = `_design/DesignDoc/_view/${viewName}?key="${key}"`

      //http://127.0.0.1:5984/solidfilemanager/_design/DesignDoc/_view/GroupedTags?reduce=true&group=true
      const url: string = `${this.couchDbBaseUrl}/${param}?reduce=true&group=true`
      const xhr = this.createCORSRequest('GET', url);
      if (xhr) {
        xhr.onload = () => {
          const response = [] as any[]
          if (xhr.status >= 200 && xhr.status < 300) {
            if (viewName === CouchDb.viewNames.GroupedTags) {
              let res = JSON.parse(xhr.response)
              if (res.rows) {
                res.rows.map((row: CouchDbRowKeyValue) => {
                  const usedTag = ({ tagType: 'NamedTag', value: row.key, published: true }) as MetaTag
                  response.push(usedTag)
                })
              }
            }
            resolve(response)
          } else {
            reject(xhr.statusText);
          }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
      }
    })
  }


  //Need a callback to handle error (rollback on Local?)
  static updateMeta(meta: Meta) {
    const xhr = this.createCORSRequest('GET', `${this.couchDbBaseUrl}/${this.createIdFromMeta(meta)}`);
    if (xhr) {
      xhr.onload = function () {
        const oldMeta = JSON.parse(xhr.responseText)
        if (oldMeta && oldMeta._rev) meta._rev = oldMeta._rev
        CouchDb.writeMeta(meta)
      }
      xhr.onerror = function () {
        alert('Error reading original Meta when updating.');
      };
      xhr.send();
    }
  }

  //"private", only called by previous updateMeta
  static writeMeta(meta: Meta) {
    const xhr = this.createCORSRequest('PUT', `${this.couchDbBaseUrl}/${this.createIdFromMeta(meta)}`);
    if (xhr) {
      // Response handlers.
      xhr.onload = function () { };
      xhr.onerror = function () {
        alert('Error writing meta in CouchDb.');
      };
      xhr.send(JSON.stringify(meta));
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
