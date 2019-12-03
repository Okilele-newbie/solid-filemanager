import SolidFileClientUtils from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from '../Api/Item';

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
    fileUrl: string,
    description: string,
    fileType: string,
    application: string,
    extension: string,
    tags: MetaTag[],
}


const tagDir = '/public'
const tagFileName = '_Meta4.json'

export default class TagUtils {

    static allMetas = [] as Meta[];
    static currentMeta = {} as Meta;
    static currentItem = {} as Item

    static getTagIndexFullPath() {
        //console.log(`Location of indexes tags: ${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`)
        return `${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`
        //return `https://okilele.solid.community/public/tagI1.json`
    }

    static async getAllMetas() {
        let allMetas = [] as Meta[]
        if (this.allMetas.length !== 0) allMetas = this.allMetas
        else {
            var json: string = await SolidFileClientUtils.FileClientReadFileAsString(TagUtils.getTagIndexFullPath())
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


    static filterByMetaTag(metas: Meta[], testTag: MetaTag) {
        return lodash.filter(metas, function (meta) {
            return lodash.some(meta.tags, function (tag) {
                return (tag.value === testTag.value);
            });
        });
    }


    //List of selected tags
    static async getMetaList(selectedTags: MetaTag[]) {
        /*
        let filteredMetas = [] as Meta[]
        await this.getAllMetas() as unknown as Meta[]
        filteredMetas = response.filter(el => (el.fileUrl === selectedTag[0].value))
        return filteredMetas
        */
        //const existingMeta = allMetas.filter(el => el.fileUrl === item.getUrl())[0];


        //filteredMetas = allMetas.filter(el => (el.fileUrl === selectedTag[0].value))
        //function(o) { return !o.active; }
        //foundTagsU = lodash.sortBy(foundTagsU, ['tagType', 'value']);
        //const filteredMetas = lodash.filter(allMetas, meta => {meta.tags => {tag.value === selectedTag[0].value}})
        //const filteredMetas = lodash.filter(allMetas, function (meta) {function (meta.tags) (tag.value === selectedTag[0].value)))
        //AND

        //return await this.getAllMetas() as unknown as Meta[]

        const allMetas = await this.getAllMetas() as unknown as Meta[]
        let filteredMetas = [] as Meta[]
        //Create a list of copies of metas filtered by view selection and only wearing selected tags
        if (false) {
            //AND
            let filteredMetas = allMetas
            selectedTag.map(testTag => {
                filteredMetas = filteredMetas.filter(({ meta }) => meta.tags.includes(testTag))
            })
        } else {
            //OR   
            selectedTags.map((testTag) => {
                //get new metas for the tag and reset tags to testTag
                console.log(`working on ${testTag.value}`)
                //let havingTagMetas = allMetas.filter(({ tags }) => tags.includes(testTag))
                //let havingTagMetas = this.filterByValue(allMetas, testTag.value)
                let havingTagMetas = this.filterByMetaTag(allMetas, testTag)
                //let havingTagMetax = allMetas.filter(meta => meta.tags.includes(testTag))
                //let havingTagMetay = allMetas.filter(({ tags }) => tags.includes(testTag))
                //let havingTagMetaz = allMetas.filter(meta => (meta.tags => (tag.value === testTag.value)))

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
                        // works correctly ? let newMetaCopy = Object.assign({}, newMeta)
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
        /*
                        newMetas.map(meta => {
                            meta.tags = [testTag]
                        })
                        //add testTag to existing filtered metas
                        filteredMetas.filter(({ tags }) => tags.includes(testTag)).map(meta => {
                            meta.tags.push(testTag)
                        })
                        //add new to existing
                        filteredMetas.push(...newMetas)
        */
        lodash.sortBy(filteredMetas, 'value')
        return filteredMetas
    }

    //Get the met of an item
    static async getOrInitMeta(item: Item) {
        //console.log(`enter with item=${item.url}`)
        //init in case this one is returned
        let meta = {
            fileUrl: item.getUrl(),
            description: '',
            fileType: '',
            application: '',
            extension: item.getDisplayName().split('.').length > 1 ? item.getDisplayName().split('.').pop() : '',
            tags: []
        } as Meta
        //console.log(`loading currentItemMeta ${meta}`)
        if (this.currentMeta !== undefined
            && this.currentMeta.fileUrl === item.url)
            meta = this.currentMeta
        else {
            const allMetas: Meta[] = await this.getAllMetas()
            if (allMetas !== undefined) {
                const existingMeta = allMetas.filter(el => el.fileUrl === item.getUrl())[0];
                if (existingMeta !== undefined) meta = existingMeta
            }
        }
        this.currentMeta = meta
        this.currentItem = item
        //console.log(`return ${meta} with url=${meta.fileUrl} and tags=${meta.tags}`)
        return meta
    }

    static async updateMeta(meta: Meta) {
        console.log(`call TagUtols.updatemeta, ${meta}`)
        let allMetas: Meta[] = await this.getAllMetas() as unknown as Meta[]
        // remove previous tags of the item
        allMetas = allMetas.filter(el => el.fileUrl !== meta.fileUrl);

        //Add new meta
        allMetas.push(meta)
        SolidFileClientUtils.FileClientupdateFile(
            TagUtils.getTagIndexFullPath(),
            JSON.stringify(allMetas)
        )
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