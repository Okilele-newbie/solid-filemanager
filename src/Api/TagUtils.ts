import SolidFileClientUtils from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from './Item';
import CouchDb, { CouchDbRow } from './CouchDb';

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

    static getTagIndexFullPath() {
        return `${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`
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

    //List of selected tags from Local (file) repo
    static async getLocalMetaList(selectedTags: MetaTag[]) {
        const allMetas = await this.getAllMetas() as unknown as Meta[]
        let filteredMetas = [] as Meta[]
        //Create a list of copies of metas filtered by view selection and only wearing selected tags
        if (false) {
            //Filter: AND: ToDo
        } else {
            //Filter: OR   
            selectedTags.map((testTag) => {
                //get metas for testTag and reset tags to testTag
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

    //getLocalMetaList() helper
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
    }

    static async getLocalUsedTags(alsoSearchOnCentral: boolean) {
        let usedTag = [] as MetaTag[]

        let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        //get list of tags in meta
        let foundTags = [] as MetaTag[]
        allMetas.map(meta => {
            //if alsoSearchOnCentral don't get published tags 
            if (!alsoSearchOnCentral) foundTags.push(...meta.tags)
            else {
                meta.tags.map(tag => {
                    if (!tag.published) foundTags.push(tag)
                })
            }
        })
        usedTag = lodash.uniqWith(foundTags, function (first, second) {
            return first.tagType === second.tagType && first.value === second.value
        });
        usedTag = lodash.sortBy(usedTag, ['tagType', 'value']);
        //published prop of tags temporarly used as "coming from server?"
        //usedTag.forEach(tag => tag.published = false)
        return usedTag
    }

    static async getCentralUsedTags(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            CouchDb.getItemsByView(CouchDb.viewNames.GroupedTags, '')
                .then(
                    (usedTag: MetaTag[]) => {
                        //published prop temporarly used as "coming from server?"
                        usedTag.forEach(tag => tag.published = true)
                        resolve(usedTag)
                    }
                )
        })

    }

}




