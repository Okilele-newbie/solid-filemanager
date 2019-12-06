import SolidFileClientUtils from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from './Item';
import {updateMetaInCouchDb, getMetaInCouchDb} from './cors';

export interface Tag {
    tagType: string,
    value: string,
    displayedValue: string,
    description?: string
}

//Same as Tag without description for Meta
export interface MetaTag {
    tagType: string,
    value: string,
    displayedValue?: string
}

export interface Meta {
    fileUrl: string,//without "https://", used as CouchDB id
    description: string,
    fileType: string,
    application: string,
    extension: string,
    owner: string,//only for use in CouchDb as derived from fileUrl
    tags: MetaTag[],
}


const tagDir = '/public'
const tagFileName = '_Meta6.json'

export default class TagUtils {

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
            if (json !== '') {
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
            //AND
            //let filteredMetas = allMetas
            //selectedTags.map(testTag => {
            //    filteredMetas = filteredMetas.filter(({ meta: Meta }) => meta.tags.includes(testTag))
            //})
        } else {
            //OR   
            selectedTags.map((testTag) => {
                //get new metas for testTag and reset its tags to testTag
                console.log(`working on ${testTag.value}`)
                let havingTagMetas = this.filterByMetaTag(allMetas, testTag)
                console.log(`  found ${havingTagMetas.length} in allMeta`)
                havingTagMetas.map(newMeta => {
                    console.log(`      searching ${newMeta.fileUrl}] in existingFilteredMeta having ${filteredMetas.length} items`)
                    //search already in filtered
                    let existingFilteredMeta =
                        lodash.find(filteredMetas, function (meta) { return newMeta.fileUrl === meta.fileUrl })
                    if (existingFilteredMeta !== undefined) {
                        console.log(`      found 1 in filteredMetas: ${existingFilteredMeta.fileUrl}`)
                        existingFilteredMeta.tags.push(testTag)
                        console.log(`      and added tag to it`)
                    } else {
                        let newMetaCopy = {
                            'fileUrl': newMeta.fileUrl,
                            'description': newMeta.description,
                            'fileType': newMeta.fileType,
                            'application': newMeta.application,
                            'extension': newMeta.extension,
                            'tags': newMeta.tags,
                        }
                        newMetaCopy.tags = [testTag]
                        //add a new object as meta in filtered are "fakes" having only selected tags of the current view
                        filteredMetas.push(newMetaCopy)
                        console.log(`      not found in filtered and added new meta ${newMeta.fileUrl}`)
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

    //Get the met of an item
    static async getOrInitMeta(item: Item) {
        //console.log(`enter with item=${item.url}`)
        //init in case this one is returned
        //const itemUrl = item.getUrl().replace(/(^\w+:|^)\/\//, '')
        let itemUrl = item.getUrl()
        if (itemUrl.indexOf('http') !== -1) itemUrl = itemUrl.split('://')[1]
        //let reg = new RegExp("[(^\w+:|^)\/\/]", "g")
        //itemUrl = itemUrl.replace(reg, '')
        //let reg = new RegExp("[/]", "g")
        //itemUrl = itemUrl.replace(reg, '.')
        //itemUrl.indexOf('http')  !== -1 ? itemUrl = itemUrl.slice(4) : itemUrl
        let meta = {
            fileUrl: itemUrl,
            description: '',
            fileType: '',
            application: '',
            extension: item.getDisplayName().split('.').length > 1 ? item.getDisplayName().split('.').pop() : '',
            owner: itemUrl.split("/")[0],
            tags: []
        } as Meta
        //console.log(`loading currentItemMeta ${meta}`)
        if (this.currentMeta !== undefined
            && this.currentMeta.fileUrl === itemUrl)
            meta = this.currentMeta
        else {
            const allMetas: Meta[] = await this.getAllMetas()
            if (allMetas !== undefined) {
                const existingMeta = allMetas.filter(el => el.fileUrl === itemUrl)[0]
                if (existingMeta !== undefined) meta = existingMeta
            }
        }
        this.currentMeta = meta
        this.currentItem = item
        //console.log(`return ${meta} with url=${meta.fileUrl} and tags=${meta.tags}`)
        return meta
    }

    static async updateMeta(meta: Meta) {
        //FILE
        console.log(`call TagUtols.updatemeta, ${meta}`)
        let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        // remove previous tags of the item
        allMetas = allMetas.filter(el => el.fileUrl !== meta.fileUrl);

        //Add new meta
        allMetas.push(meta)
        SolidFileClientUtils.fileClientupdateFile(
            TagUtils.getTagIndexFullPath(),
            JSON.stringify(allMetas)
        )

        //COUCHDB
        updateMetaInCouchDb(meta)

        //FINALLY
        this.currentMeta = meta
        this.allMetas = allMetas
    }

    static async getUsedTags() {
        let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        //get list of tags in meta
        let foundTags = [] as MetaTag[]
        let foundTagsU = [] as MetaTag[]
        allMetas.map(meta => {
            foundTags.push(...meta.tags)
        })
        //foundTagsU = lodash.uniqBy(foundTags, 'value');
        foundTagsU = lodash.uniqWith(foundTags, function (first, second) {
            return first.tagType === second.tagType && first.value === second.value
        });
        foundTagsU = lodash.sortBy(foundTagsU, ['tagType', 'value']);
        return foundTagsU as unknown as MetaTag[]
    }


}