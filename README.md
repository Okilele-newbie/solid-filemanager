**Everything about Solid-FileManager** is to be found in the original Github repository here https://github.com/Otto-AA/solid-filemanager. Thanks for his great work!

**In this fork**
- I changed presentation of folers and files from grid to list
- I added a treeview.
Those modifications are actually of no importance
- I added a tag management:

**Edit tags**
    . Right click on an item (file or folder) => Edit tags
    . Listbox: You can enter the name of the tag. Proposals appear in the listbox from Local tags, Central tags or Google
    . Enter to validate a tag.
    . By default tags are only and always saved on Local (_Meta file in /public). If you want them also saved on Central index: CLick on tag or "Publish all tags to central" checkbox. Tagged files are NOT modified.
    . If no extension file you can enter a mime type (currently not used)

**List tags**
    . Top left corner switch to "Tags"
    . 2 lists: Tags on 
        . Local = only yours
        . Central = all tags anybody saved on Central index, including yours

**Status**: This is NOT a working app but a POC (Proof Of Concept)
    . Registering and retrieving tags works but ...
    . Synchronisation between Pods and Local/Central indexes is not done: If you delete a file or folder please previously manually  delete tags
    . A lot of features are not implemented (refresh list of tags when editing tags of a file, switch from a view to another etc...)
    . Central index is on my personal server, high availability is not guaranteed

So play around with the solid-filemanager and let us know if this idea worth growing up ...
  
