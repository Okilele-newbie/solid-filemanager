import SolidFileClientUtils, { IFolder } from './SolidFileClientUtils';
import lodash from 'lodash'
import { Item } from '../Api/Item';

export interface Tag {
    tagType: string,
    value: string,
    description?: string
}

//Same as Tag without description for Meta
export interface MetaTag {
    tagType: string,
    value: string,
}

export interface Meta {
    fileUrl: string,
    description?: string,
    tags: MetaTag[],
    creationDate?: string
}


const tagDir = '/public'
const tagFileName = '_Meta1.json'

export default class TagUtils {

    static allMetas = [] as Meta[];
    static currentMeta = {} as Meta;
    static libraryTags = [] as Tag[];
    static currentItem = {} as Item

    static getTagIndexFullPath() {
        //console.log(`Location of indexes tags: ${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`)
        return `${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`
        //return `https://okilele.solid.community/public/tagI1.json`
    }

    static getLibraryTags() {
        let libraryTags = [] as Tag[]
        if (this.libraryTags.length !== 0) libraryTags = this.libraryTags
        else {
            libraryTags.push(...this.getExtMimeTags());
            libraryTags.push(...this.getNamedTags());
            libraryTags.push(...this.getAppsTags());
            //add current item reference so that tags are ready to be recorded if selected
            //console.log(`Found ${libraryTags.length} tags in the library of tags`)
            this.libraryTags = libraryTags
        }
        return libraryTags
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

    static async getMeta(item: Item) {
        console.log(`enter with item=${item.url}`)
        let currentMeta = {} as Meta
        console.log(`loading currentItemMeta ${currentMeta}`)
        if (this.currentMeta !== undefined
            && currentMeta.fileUrl !== undefined
            && currentMeta.fileUrl === this.currentItem.url)
            currentMeta = this.currentMeta
        else {
            const allMetas: Meta[] = await this.getAllMetas()
            if (allMetas !== undefined) {
                currentMeta = allMetas.filter(el => el.fileUrl === item.getUrl())[0];
            }
            if (currentMeta === undefined) (currentMeta = { fileUrl: item.url, tags: [] })
            this.currentMeta = currentMeta
            this.currentItem = item
        }
        console.log(`return ${currentMeta} with url=${currentMeta.fileUrl} and tags=${currentMeta.tags}`)
        return currentMeta
    }

    static async updateMeta(meta: Meta) {
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
        allMetas.map(meta => {
            foundTags.push(meta.tags)
        })
        foundTags = lodash.sortedUniq(foundTags);
        return foundTags
    }

    static getExtMimeTags() {
    return this.mockGetExtMimeTags()
}

    static getNamedTags() {
    return this.mockGetNamedTags()
}

    static getAppsTags() {
    return this.mockGetAppNameTags()
}

    static mockGetUserTags() {
    var json = {
        list: [
            {
                tagType: "ext/MIME",
                value: "multipart/mixed",
            },
            {
                tagType: "NamedTag",
                value: "http://solid.community/ontology/cooking",
            },
            {
                tagType: "NamedTag",
                value: "http://someother.org/conputing",
            },
            {
                tagType: "AppName",
                value: "http://solid.community/applist/solidfb",
            }
        ]
    }
    return json.list
}

    static mockGetExtMimeTags() {
    var json = {
        list: [
            {
                tagType: "ext/MIME",
                value: "text-plain",
                description: "Used for text editable in notepad-like editors for instance"
            },
            {
                tagType: "ext-MIME",
                value: ".png",
                description: "png extension"
            },
            {
                tagType: "ext-MIME",
                value: "multipart/mixed",
                description: "Mixed content"
            }

        ]
    }
    return json.list
}

    static mockGetNamedTags() {
    var json = {
        list: [
            {
                tagType: "NamedTag",
                value: "http://solid.community/ontology/cooking",
                description: "Solid community description of cooking"
            },
            {
                tagType: "NamedTag",
                value: "http://some.org/conputing",
                description: "Conputing as in some.org ontology"
            },
            {
                tagType: "NamedTag",
                value: "http://someother.org/conputing",
                description: "Conputing as in someother.org ontology"
            }
        ]
    }
    return json.list
}

    static mockGetAppNameTags() {
    var json = {
        list: [
            {
                tagType: "AppName",
                value: "http://solid.community/applist/solidfb",
                description: "Solid Facebook like"
            },
            {
                tagType: "AppName",
                value: "http://solid.community/applist/solidagram",
                description: "Solid Instagram like"
            },
        ]
    }
    return json.list
}

}