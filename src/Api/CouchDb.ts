import { Meta, MetaTag } from './MetaUtils';


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

  //List of unique used tags
  static async getItemsByViewGroupedTags(): Promise<MetaTag[]> {
    //   http://127.0.0.1:5984/solidfilemanager/_design/DesignDoc/_view/GroupedTags?reduce=true&group=true
    const url: string = `${this.couchDbBaseUrl}/_design/DesignDoc/_view/GroupedTags?reduce=true&group=true`
    let json = await this.executeQueryonCouch(url) as string
    let response = JSON.parse(json)
    let usedTag = [] as MetaTag[]
    if (response.rows) {
      response.rows.forEach((row: CouchDbRowKeyValue) => {
        const tag = ({ tagType: row.key[0], value: row.key[1], published: true }) as MetaTag
        usedTag.push(tag)
      })
    }
    return usedTag
  }

    //List of Meta for selected Tags
    static async getMetaFromTags(selectedTags: MetaTag[]): Promise<Meta[]> {
      let tagsAsString = this.tagArrayTotring(selectedTags)
      //   http://127.0.0.1:5984/solidfilemanager/_design/DesignDoc/_view/MetasByTags?keys=['tagValue'']
      const url: string = `${this.couchDbBaseUrl}/_design/DesignDoc/_view/MetasByTags?keys=${tagsAsString}`
      let json = await this.executeQueryonCouch(url) as string
      let response = JSON.parse(json)
      let foundMeta = [] as Meta[]
      if (response.rows) {
        response.rows.forEach((row: CouchDbRowKeyValue) => {
          const meta = row.value as unknown as Meta
          foundMeta.push(meta)
        })
      }
      return foundMeta
    }



  //ToDo: callback to handle error (rollback on Local?)
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

  //"privates", only called by previous updateMeta =================================================

  static executeQueryonCouch(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = this.createCORSRequest('GET', url);
      if (xhr) {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(xhr.statusText);
          }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
      }
    })
  }

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

  static tagArrayTotring(tags: MetaTag[]) {
    let tagsAsAstring = ''
    let comma = ''
    tags.forEach(tag => {
      tagsAsAstring += `${comma}"${tag.tagType}:${tag.value}"`
      comma = ','
    })
    return `[${tagsAsAstring}]`
  }

}
