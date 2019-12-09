import SolidFileClientUtils from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from './Item';
import Cors, {CouchDbRow} from './Cors';

const tagDir = '/public'
const tagFileName = '_Meta7.json'

//Same as Tag without description for Meta
export interface MetaTag {
    tagType: string,
    value: string,
    published: boolean
}

export interface Meta {
    hostName: string,
    pathName: string,
    mimeType: string,
    creationDate: Date,
    tags: MetaTag[],
    _rev?: string //CouchDb field
}

export default class TagUtils {

    constructor(props: any) {
        TagUtils.callBackFromCouchDbGetUsedTags = TagUtils.callBackFromCouchDbGetUsedTags.bind(this)
    }

    static allMetas = [] as Meta[];
    static currentMeta = {} as Meta;
    static currentItem = {} as Item

    static getTagIndexFullPath() {
        return `${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`
    }

    static async getAllMetas() {
        let allMetas = [] as Meta[]
        if (this.allMetas.length !== 0) allMetas = this.allMetas
        else {
            var json: string = await SolidFileClientUtils.fileClientReadFileAsString(TagUtils.getTagIndexFullPath())
            //console.log(`json for allTags=>>${json}<<`)
            if (json === '') {
                SolidFileClientUtils.fileClientcreateFile(TagUtils.getTagIndexFullPath())
            } else {
                allMetas = JSON.parse(json)
            }
            //console.log(`Found ${allTags.length} tags all items`)
            this.allMetas = allMetas
        }
        return allMetas as unknown as Meta[]
    }

    static filterByValue(metas: Meta[], string: string) {
        return metas.filter(
            (meta: Meta) => Object.keys(meta.tags).some(tag => tag === string)
        );
    }

    //List of selected tags
    static async getMetaList(selectedTags: MetaTag[]) {
        const allMetas = await this.getAllMetas() as unknown as Meta[]
        let filteredMetas = [] as Meta[]
        //Create a list of copies of metas filtered by view selection and only wearing selected tags
        if (false) {
            //Filter: AND
            //let filteredMetas = allMetas
            //selectedTags.map(testTag => {
            //    filteredMetas = filteredMetas.filter(({ meta: Meta }) => meta.tags.includes(testTag))
            //})
        } else {
            //Filter: OR   
            selectedTags.map((testTag) => {
                //get new metas for testTag and reset its tags to testTag
                console.log(`working on ${testTag.value}`)
                let havingTagMetas = this.filterByMetaTag(allMetas, testTag)
                console.log(`  found ${havingTagMetas.length} in allMeta`)
                havingTagMetas.map(newMeta => {
                    console.log(`      searching ${newMeta.pathName}] in existingFilteredMeta having ${filteredMetas.length} items`)
                    //search already in filtered
                    let existingFilteredMeta =
                        lodash.find(filteredMetas, function (meta) {
                            return newMeta.hostName + newMeta.pathName === meta.hostName + meta.pathName
                        })
                    if (existingFilteredMeta !== undefined) {
                        console.log(`      found 1 in filteredMetas: ${existingFilteredMeta.pathName}`)
                        existingFilteredMeta.tags.push(testTag)
                        console.log(`      and added tag to it`)
                    } else {
                        let newMetaCopy = {
                            'hostName': newMeta.hostName,
                            'pathName': newMeta.pathName,
                            'mimeType': newMeta.mimeType,
                            'creationDate': new Date(0),
                            'tags': newMeta.tags,
                        }
                        newMetaCopy.tags = [testTag]
                        //add a new object as meta in filtered are "fakes" having only selected tags of the current view
                        filteredMetas.push(newMetaCopy)
                        console.log(`      not found in filtered and added new meta ${newMeta.pathName}`)
                    }
                })
            })
        }
        lodash.sortBy(filteredMetas, 'value')
        return filteredMetas
    }

    static filterByMetaTag(metas: Meta[], testTag: MetaTag) {
        return lodash.filter(metas, function (meta) {
            return lodash.some(meta.tags, function (tag) {
                return (tag.value === testTag.value);
            });
        });
    }

    //Get the meta of an item
    static async getOrInitMeta(item: Item) {
        const url = new URL(item.getUrl())
        //init in case no better foiund
        let meta = {
            hostName: url.hostname,
            pathName: url.pathname,
            mimeType: '',
            creationDate: new Date(),
            tags: []
        } as Meta
        //console.log(`loading currentItemMeta ${meta}`)
        //Already the current one?
        if (this.currentMeta !== undefined
            && this.currentMeta.hostName === url.hostname && this.currentMeta.pathName === url.pathname)
            meta = this.currentMeta
        else {
            //Read in meta storage
            const allMetas: Meta[] = await this.getAllMetas()
            if (allMetas !== undefined) {
                const existingMeta = allMetas.filter(el => el.hostName === url.hostname && el.pathName === url.pathname)[0]
                if (existingMeta !== undefined) meta = existingMeta
            }
        }
        this.currentMeta = meta
        this.currentItem = item
        //console.log(`return ${meta} with url=${meta.pathhName} and tags=${meta.tags}`)
        return meta
    }

    static async updateMeta(meta: Meta) {
        //FILE: remove old meta from list if exists and add the new one
        let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        allMetas = allMetas.filter(el => !(el.hostName === meta.hostName && el.pathName === meta.pathName));
        allMetas.push(meta)
        SolidFileClientUtils.fileClientupdateFile(
            TagUtils.getTagIndexFullPath(),
            JSON.stringify(allMetas)
        )
        
        //COUCHDB: Filter tags not having the "central" character
        meta.tags = meta.tags.filter(tag => tag.published);
        Cors.updateMetaInCouchDb(meta)

        //FINALLY
        this.currentMeta = meta
        this.allMetas = allMetas
    }

    static async getUsedTags(localOrCentral: boolean, callBackFromTagUtilsGetUsedTags: {}) {
        let usedTag = [] as MetaTag[]
        if (localOrCentral) {
                    //Local
            let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
            //get list of tags in meta
            let foundTags = [] as MetaTag[]
            allMetas.map(meta => {
                foundTags.push(...meta.tags)
            })
            //returnTags = lodash.uniqBy(foundTags, 'value');
            usedTag = lodash.uniqWith(foundTags, function (first, second) {
                return first.tagType === second.tagType && first.value === second.value
            });
            usedTag = lodash.sortBy(usedTag, ['tagType', 'value']);
            return usedTag
        } else {
            //Central. Use a callback
            TagUtils.callBackFromTagUtilsGetUsedTags = callBackFromTagUtilsGetUsedTags
            const nothing = Cors.couchDbGetUsedTags(this.callBackFromCouchDbGetUsedTags) as unknown as CouchDbRow[]
            return nothing
        }

    }
    static callBackFromTagUtilsGetUsedTags: {};

    //static callBackFromTagUtilsGetUsedTags: (MetaTag[])
    static callBackFromCouchDbGetUsedTags(tagsFromCouch: CouchDbRow[]) {
        let metaTags = [] as MetaTag[]
        tagsFromCouch.map(row => {
            const metaTag = ({ tagType: 'NamedTag', value: row.key })
            metaTags.push(metaTag)
        })
        TagUtils.callBackFromTagUtilsGetUsedTags(metaTags)
    }
}



