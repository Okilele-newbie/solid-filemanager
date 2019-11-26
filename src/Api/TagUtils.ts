import SolidFileClientUtils, { IFolder } from './SolidFileClientUtils';
import { Item } from '../../../Api/Item';

export interface Tag {
    fileUrl?: string,
    tagType: string,
    value: string,
    description?: string
}

const tagDir = '/public'
const tagFileName = 'tagI1.json'

export default class TagUtils {

    static allTags = [] as Tag[];
    static libraryTags = [] as Tag[];
    static currentItemTags = [] as Tag[];
    static currentItem = {} as Item

    static getTagIndexFullPath() {
        //console.log(`Location of indexes tags: ${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`)
        return `${SolidFileClientUtils.getServerId()}${tagDir}/${tagFileName}`
        //return `https://okilele.solid.community/public/tagI1.json`
    }

    static getLibraryTags(item: Item) {
        let libraryTags = [] as Tag[]
        if (this.libraryTags.length !== 0) libraryTags = this.libraryTags
        else {
            libraryTags.push(...this.getExtMimeTags());
            libraryTags.push(...this.getNamedTags());
            libraryTags.push(...this.getAppsTags());
            //add current item reference so that tags are ready to be recorded if selected
            libraryTags.map(tag => tag.fileUrl = item.getUrl())
            console.log(`Found ${libraryTags.length} tags in the library of tags`)
            this.libraryTags = libraryTags
        }
        return libraryTags
    }

    static async getAllTags() {
        let allTags = [] as Tag[]
        if (this.allTags.length !== 0) allTags = this.allTags
        else {
            var json: string = await SolidFileClientUtils.FileClientReadFileAsString(TagUtils.getTagIndexFullPath())
            console.log(`json for allTags=>>${json}<<`)
            if (json !== '') {
                console.log(`Parsing ...`)
                allTags = JSON.parse(json)
            }
            //console.log(`Found ${allTags.length} tags all items`)
            this.allTags = allTags
        }
        return allTags as unknown as Tag[]
    }

    static async getCurrentItemTags(item: Item) {
        let currentItemTags = [] as Tag[]
        console.log(`loading currentItemTags ${currentItemTags}`)
        console.log(`loading currentItemTags ${currentItemTags.length}`)
        if (this.currentItemTags.length !== 0 && item.url === this.currentItem.url) 
            currentItemTags = this.currentItemTags
        else {
            const allTags: Tag[] = await this.getAllTags()            
            if (allTags !== undefined) {
                currentItemTags = allTags.filter(el => el.fileUrl === item.getUrl());
            }
            //console.log(`Found ${itemTags.length} tags for current item`)
            this.currentItemTags = currentItemTags
            this.currentItem = item
        }
        return currentItemTags
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