import SolidFileClientUtils from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from './Item';
import CouchDb from './CouchDb';
import config from './../config';

const tagDir = '/public'
const tagFileName = '_Meta7.json'
export const onServerColor = 'mediumspringgreen'

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

    static allLocalMetas = [] as Meta[];
    static currentMeta = {} as Meta;
    static currentItem = {} as Item
    static currentLocalUsedTags = [] as MetaTag[]

    static getTagIndexFullPath() {
        return `${config.getHost()}${tagDir}/${tagFileName}`
    }

    //Local storage, read the file and get all metas in it
    static async getAllMetas() {
        let allMetas = [] as Meta[]
        if (this.allLocalMetas.length !== 0) allMetas = this.allLocalMetas
        else {
            var json: string = await SolidFileClientUtils.fileClientReadFileAsString(TagUtils.getTagIndexFullPath())
            //console.log(`json for allTags=>>${json}<<`)
            if (json === '') SolidFileClientUtils.fileClientcreateFile(TagUtils.getTagIndexFullPath())
            else allMetas = JSON.parse(json)
            //console.log(`Found ${allTags.length} tags all items`)
            this.allLocalMetas = allMetas
        }
        return allMetas
    }

    //List of Meta for selected tags
    static async getLocalMetaList(selectedTags: MetaTag[]) {
        const allMetas = await this.getAllMetas() as unknown as Meta[]
        let filteredMetas = [] as Meta[]
        //Create a list of copies of metas filtered by view selection and only wearing selected tags
        if (false) {
            //Filter: AND: ToDo
        } else {
            //Filter: OR   
            selectedTags.map((testTag) => {
                //get metas for current testTag and reset tags to its value
                let havingTagMetas = this.filterByMetaTag(allMetas, testTag)
                havingTagMetas.map(havingTagMeta => {
                    //search already in filtered to add or update list
                    let existingFilteredMeta =
                        lodash.find(filteredMetas, function (meta) {
                            return havingTagMeta.hostName + havingTagMeta.pathName === meta.hostName + meta.pathName
                        })
                    if (existingFilteredMeta !== undefined) {
                        existingFilteredMeta.tags.push(testTag)
                    } else {
                        //filteredMetas: "fakes" Meta having only selected tags of the current view
                        let havingTagMetaCopy = JSON.parse(JSON.stringify(havingTagMeta))
                        havingTagMetaCopy.creationDate = new Date(0)
                        havingTagMetaCopy.tags = [testTag]
                        filteredMetas.push(havingTagMetaCopy)
                    }
                })
            })
        }
        return filteredMetas
    }

    //getLocalMetaList() helper, returns Metas having testTag
    static filterByMetaTag(metas: Meta[], testTag: MetaTag) {
        return lodash.filter(metas, function (meta) {
            return lodash.some(meta.tags, function (tag) {
                return (tag.value === testTag.value);
            });
        });
    }

    //Get or init the meta of a file
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
        let allLocalMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        allLocalMetas = allLocalMetas.filter(el => !(el.hostName === meta.hostName && el.pathName === meta.pathName));
        allLocalMetas.push(meta)
        SolidFileClientUtils.fileClientupdateFile(
            TagUtils.getTagIndexFullPath(),
            JSON.stringify(allLocalMetas)
        )

        //COUCHDB:
        let metaCopy = JSON.parse(JSON.stringify(meta)) as Meta
        metaCopy.tags = metaCopy.tags.filter(tag => tag.published);
        metaCopy.tags.forEach(function (tag) { delete tag.published });
        CouchDb.updateMeta(metaCopy)

        //FINALLY
        this.currentMeta = meta
        this.allLocalMetas = allLocalMetas
        //update currentLocalUsedTags if already loaded
        if (this.currentLocalUsedTags !== undefined) {
            TagUtils.getLocalUsedTags()
                .then((foundTags: MetaTag[]) => {
                    this.currentLocalUsedTags = foundTags
                })
        }
    }

    static async getLocalUsedTags() {
        let usedTags = [] as MetaTag[]
        if (this.currentLocalUsedTags.length !== 0) usedTags = this.currentLocalUsedTags
        else {
            let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
            //get list of tags in meta
            let foundTags = [] as MetaTag[]
            allMetas.map(meta => {
                meta.tags.map(tag => {
                    foundTags.push(tag)
                })
            })
            usedTags = lodash.uniqWith(foundTags, function (first, second) {
                return first.tagType === second.tagType && first.value === second.value
            });
            usedTags = lodash.sortBy(usedTags, ['tagType', 'value']);
        }
        return usedTags
    }

    static async getCentralUsedTags(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            CouchDb.getItemsByView(CouchDb.viewNames.GroupedTags, '')
                .then(
                    (centralTags: MetaTag[]) => {
                        //published prop temporarly used as "server tag published on local?"
                        centralTags.forEach(centralTag => { centralTag.published = false })
                        TagUtils.getLocalUsedTags()
                            .then((localTags: MetaTag[]) => {
                                //refresh cache as we have the value
                                this.currentLocalUsedTags = localTags
                                localTags.forEach(localTag => {
                                    if (localTag.published === true) {
                                        this.markCentralFromLocal(centralTags, localTag)
                                    }
                                })
                                resolve(centralTags)
                            })
                    }
                )
        })

    }

    //getCentralUsedTags() helper, marks published=true to central tags found in local tags
    static markCentralFromLocal(centralTags: MetaTag[], localTag: MetaTag) {
        let publishedTags: MetaTag[] = lodash.filter(
            centralTags,
            function (tag) { return (tag.value === localTag.value) }
        )
        //publishedTags.length should be 0 or 1
        publishedTags.forEach((tag: MetaTag) => tag.published = true)
    }

}




