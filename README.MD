# Content Management System

### Task

a online CMS (Content Management System) to manage JSON files.

### Requirements

1. Create new content folder (show error when folder name is invalid)
2. Upload new content file(s) from local machine (show error when file name is not .JSON, or format is invalid JSON)
3. Delete existing content folder(s)/file(s) with confirmation dialog (deleting folder removes all sub-folders and files in it)
4. Navigate through content folders and view file list (e.g. go into "folderA" and come back "..")
5. Edit content file (highlight errors in JSON format) and save(validate JSON format)/cancel

### Service

Service is written in NodeJS under "service" folder.

Please use sqlite3 database and create the following APIs:

1. Create new content folder
2. Store the upload file(s)
3. Delete content folder(s)/file(s)
4. Get file list for a given folder path
5. Store the content file for editing->save

Some design suggestions:

- Create "upload" folder in file system for all uploaded files, use GUID as file names
- Create "content" table in database with schema { id, filename, is_folder, parent, guid, size, upload_time, modified_time }
- When folder is created, create row { 1, "rootFolderA", true, -1, "", 0, "2020-03-22 13:26:44.000", "2020-03-22 13:26:44.000" }
- When file is uploaded under that folder, create row { 2, "abc.json", false, 1, "6167bdd4-fdcf-45f3-a138-a4e5f33a934a", 1024, "2020-03-22 13:26:44.000", "2020-03-22 13:26:44.000" }
- When folder/file is deleted, update both database and file system

### WebApp

WebApp is written in React under "web" folder.

Please use material-ui (https://material-ui.com) to create the following pages (consider use routing library):

1. Content listing

   - Use Table component (consider to show pages if too many files/folders)

2. Content editing
   - Use react-monaco-editor component (https://github.com/react-monaco-editor/react-monaco-editor)
   - Show Save and Cancel buttons

## Tools

- NodeJS - https://nodejs.org
- React - https://reactjs.org
- Material-ui - https://material-ui.com
- react-monaco-editor - https://github.com/react-monaco-editor/react-monaco-editor
- VSCode - main source code editor/debugger (open in root folder and install the recommended extensions, press Alt+Shift+F to prettify the code as needed)
- SQLite Expert Personal - to create/view sqlite3 database
