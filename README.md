**Everything about Solid-FileManager** This is a fork of Solid-FileManager from Otta AA. Everything about it is to be found there https://github.com/Otto-AA/solid-filemanager. Thanks for his great work!

**In this fork**
- I changed presentation of folders and files from grid to list
- I added a treeview.  
Those modifications are actually of no importance
- I added a tag management:

**Edit tags**
- Right click on an item (file or folder) => Edit tags
- Listbox: You can enter the name of the tag. Proposals appear in the listbox from Local tags, Central tags or Google
- Enter to validate a tag.
- Tags are always and by default only saved on Local (_Meta file in /public). If you want them also saved on Central index: CLick on tag or "Publish all tags to central" checkbox.  
- Tagged files are NOT modified.
- If no extension file you can enter a mime type (currently not used)

**List tags**
- Top left corner switch to "Tags"
- 2 lists: Tags on 
    - Local = only yours. Black are on local only, purple are also on central index
    - Central = all tags anybody saved on Central index, including yours. 
      - Purple are tags on central you use (and maybe created), 
      - Black tags are used by other people but not you.  
    - Selecting tags will show up associated files. Then:  
      - Double click to see content of the file (if available).
      - Right click for context menu. Only works for your files:
        - Edit tags works
        - All other functions may NOT work

**Status**: This is NOT a working app but a proof of concept
- Registering and retrieving tags works but ...
- Synchronisation between Pods and Local/Central indexes is not always done: If you delete a file or folder please previously manually delete tags
- Some features are not implemented in context menu, left lists (tag/treeview) are not always synchronized with right list (files and folders).
- The application is not bug proff guaranteed
- Central index is on my personal server, high availability is not guaranteed
- I don't plan to work anymore on this app except if there is blocking issues or new ideas about tags to test

So play around with this fork of solid-filemanager, enjoy and let us know if the central tag index idea worth growing up ...
  
