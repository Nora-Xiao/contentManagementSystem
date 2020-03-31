import './App.css';

import { Button, Checkbox } from '@material-ui/core';

import MonacoEditor from 'react-monaco-editor';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import logo from './logo.svg';
import { makeStyles } from '@material-ui/core/styles';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.classes = makeStyles(theme => ({
      root: {
        '& > *': {
          margin: theme.spacing(1),
          width: '25ch',
        },
      },
    }));
    this.serverPath = "http://127.0.0.1:3001/";
    this.folderNames = [];
    this.fileNames = [];
    this.folderPath = ["rootFolder"];

    this.handleCreateFolder = this.handleCreateFolder.bind(this);
    this.isFolderExisted = this.isFolderExisted.bind(this);
    this.handleUploadFiles = this.handleUploadFiles.bind(this);
    this.handleEditFile = this.handleEditFile.bind(this);
    this.editFile = this.editFile.bind(this);
    this.fetchFileContent = this.fetchFileContent.bind(this);
    this.fetchSubFolders = this.fetchSubFolders.bind(this);
    this.showSubFolders = this.showSubFolders.bind(this);
    this.showFilenames = this.showFilenames.bind(this);
    this.fetchGet = this.fetchGet.bind(this);
    this.handleSelectSubFolder = this.handleSelectSubFolder.bind(this);
    this.showFileList = this.showFileList.bind(this);
    this.showForCreateFolder = this.showForCreateFolder.bind(this);
    this.updateParentFolders = this.updateParentFolders.bind(this);
    this.initializeFolderNames = this.initializeFolderNames.bind(this);
    this.updateFolders = this.updateFolders.bind(this);
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this);
    this.deleteFolderAndFiles = this.deleteFolderAndFiles.bind(this);
    this.initializeFileNames = this.initializeFileNames.bind(this);
    this.handleDeleteFile = this.handleDeleteFile.bind(this);
    this.addFile = this.addFile.bind(this);
    this.handleCancelFile = this.handleCancelFile.bind(this);
    this.handleSaveFile = this.handleSaveFile.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.updateFileList = this.updateFileList.bind(this);
    
  
    this.fetchFolderNames(this.initializeFolderNames);
    this.fetchFileNames(this.initializeFileNames);
    this.fetchSubFolders("rootFolder", this.showSubFolders);
  }

  render() {
    return (
      <div>
        <div class="margin-bottom">
          <h2>View File List</h2>
          <input type="submit" id="select-sub-folder-button" value="Select a Sub-folder Under Root Folder"
                 onClick={this.handleSelectSubFolder} />
          <select id="select-sub-folders">
            <option></option>
          </select>
          <br></br>

          <h4 id="file-list-title">Files in Root Folder:</h4>
          <p id="file-list-message">No file in this folder</p>
          <ul id="file-list"></ul>
          <Button variant="contained" color="primary" id="go-back"
                  onClick={this.handleGoBack}>
            Go back to parent folder
          </Button>
        </div>
        <hr></hr>
        
        <div class="margin-bottom">
          <h2>Create Folder</h2>
          <label htmlFor="select-parent-folder">Select a Folder:&nbsp;&nbsp;&nbsp;</label>
          <select id="select-parent-folder">
            <option></option>
          </select>
          <br></br>
          
          <form className={this.classes.root} noValidate autoComplete="off" id="folder-name">
            <TextField id="outlined-basic" label="folder name" variant="outlined" />
          </form>
          <p id="error-create-folder"></p>
          <Button variant="contained" color="primary" id="create-folder"
                  onClick={this.handleCreateFolder}>
            Create new content folder 
          </Button>
        </div>
        <hr></hr>
        
        <div class="margin-bottom">
          <h2>Upload File</h2>
          <label htmlFor="select-folders">Select a Folder:&nbsp;&nbsp;&nbsp;</label>
          <select id="select-folders">
            <option></option>
          </select>
          <br></br>
          
          <input type="file" id="files" name="files[]" />
          <br></br>
          <p id="error-upload-files"></p>
          <Button variant="contained" color="primary" id="upload-files"
                  onClick={this.handleUploadFiles}>
            Upload new content file
          </Button>
        </div>
        <hr></hr>
        
        <div class="margin-bottom">
          <h2>Delete Folder</h2>
          <label htmlFor="delete-folder">Select a Folder:&nbsp;&nbsp;&nbsp;</label>
          <select id="delete-folder">
            <option></option>
          </select>
          <br></br>

          <Button variant="contained" color="primary" id="delete-folder-button"
                  onClick={this.handleDeleteFolder}>
            Delete
          </Button>
        </div>
        <hr></hr>

        <div class="margin-bottom">
          <h2>Delete File</h2>
          <label htmlFor="delete-file">Select a File:&nbsp;&nbsp;&nbsp;</label>
          <select id="delete-file">
            <option></option>
          </select>
          <br></br>

          <Button variant="contained" color="primary" id="delete-file-button"
                  onClick={this.handleDeleteFile}>
            Delete
          </Button>
        </div>
        <hr></hr>
        
        <div id="editor-area">
          <h2>Edit File</h2>
          <input type="submit" id="select-button-file" value="Select a File"
                 onClick={this.handleEditFile} />
          <select id="select-file">
            <option></option>
          </select>
          <br></br>

          <div class="margin-top">
          <Button variant="contained" color="primary" id="save"
                  onClick={this.handleSaveFile}>
            Save
          </Button>
          <Button variant="contained" color="primary" id="cancel"
                  onClick={this.handleCancelFile}>
            Cancel
          </Button>
          </div>
          
          <p id="error-edit-file"></p>

          <div id="editor">
            <MonacoEditor width="800" height="600" theme="vs-dark" language="json"
                          editorDidMount={this.editorDidMount} />
          </div>
        </div>
      </div>
    );
  }

  handleGoBack(e) {
    this.folderPath.pop();
    let currentFolder = this.folderPath[this.folderPath.length - 1];
    this.updateFileList(currentFolder);
  }

  handleSelectSubFolder(e) {
    let selectedFolder = document.getElementById("select-sub-folders").value;
    // button
    document.getElementById("select-sub-folder-button").value = "Select a Sub-folder Under " + selectedFolder +" Folder";
    // title
    document.getElementById("file-list-title").innerText = "Files in " + selectedFolder + " Folder:";
    this.folderPath.push(selectedFolder);

    this.fetchGet("subFolder?currentFolder=" + selectedFolder, this.showSubFolders);
    this.fetchGet("fileList?currentFolder=" + selectedFolder, this.showFileList);
  }

  updateFileList(currentFolder) {
    // button
    document.getElementById("select-sub-folder-button").value = "Select a Sub-folder Under " + currentFolder +" Folder";
    // title
    document.getElementById("file-list-title").innerText = "Files in " + currentFolder + " Folder:";
    this.fetchGet("subFolder?currentFolder=" + currentFolder, this.showSubFolders);
    if (currentFolder !== "rootFolder") {
      this.fetchGet("fileList?currentFolder=" + currentFolder, this.showFileList);
    } else {
      document.getElementById("file-list").style.display = "none";
      document.getElementById("file-list-message").style.display = "block";
    }
  }

  handleSaveFile(e) {
    let edited = this.editor.getValue();
    try {
      // js object
      JSON.parse(edited);
      document.getElementById('error-edit-file').innerText = "";
      
      let newSize = (new TextEncoder().encode(edited)).length;
      let fileName = document.getElementById('select-file').value;
      
      let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileName,
                               size: newSize,
                               string: edited })
      };
      
      // add one more function, 这个anonymous function可能access不到this
      // this.serverPath + "uploadFile"
      fetch(this.serverPath + "updateFile", requestOptions)
        .catch(console.log);
    } catch {
      document.getElementById('error-edit-file').innerText = "hint: file format is invalid JSON";
    } 
  }

  handleCancelFile(e) {
    this.editor.setValue("");
  }

  initializeFileNames(result) {
    this.fileNames = [];
    for (let i = 0; i < result.length; i++) {
      let fileName = result[i].filename;
      this.fileNames.push(fileName);
    }
    
    this.fileNames.sort();
    this.updateFiles();
  }

  updateFiles() {
    this.showFilenames1("select-file", this.fileNames);
    this.showFilenames1("delete-file", this.fileNames);
  }

  handleDeleteFile(e) {
    let deletedFile = document.getElementById("delete-file").value;
    let newFileNames = [];
    for (let i = 0; i < this.fileNames.length; i++) {
      if (this.fileNames[i] !== deletedFile) {
        newFileNames.push(this.fileNames[i]);
      }
    }
    this.fileNames = newFileNames;
    this.updateFiles();     

    let options2 = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filesNames: [deletedFile] })
    }; 

    fetch(this.serverPath + "deleteFiles", options2)
      .catch(console.log); 
       
  }

  handleDeleteFolder(e) {
    let deletedFolder = document.getElementById("delete-folder").value;
    this.fetchGet("fileList?currentFolder=" + deletedFolder, this.deleteFolderAndFiles);
  }

  deleteFolderAndFiles(result) {
    let deletedFolder = document.getElementById("delete-folder").value;
    
    let deletedFiles = [];
    for (let i = 0; i < result.length; i++) {
      let file = result[i].filename;
      deletedFiles.push(file);
    }

    let newFolderNames = [];
    for (let i = 0; i < this.folderNames.length; i++) {
      if (this.folderNames[i] !== deletedFolder) {
        newFolderNames.push(this.folderNames[i]);
      }
    }
    this.folderNames = newFolderNames;
    this.updateFolders();

    if (deletedFiles.length > 0) {
      let options2 = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filesNames: deletedFiles })
      }; 
  
      fetch(this.serverPath + "deleteFiles", options2)
        .catch(console.log); 
      
      this.fetchGet("notFileList?currentFolder=" + deletedFolder, this.initializeFileNames);
    }

    let options1 = {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: deletedFolder
    };
      
    fetch(this.serverPath + "deleteFolder", options1)
       .catch(console.log);
  }

  initializeFolderNames(result) {
    for (let i = 0; i < result.length; i++) {
      let folderName = result[i].filename;
      this.folderNames.push(folderName);
    }
    
    this.folderNames.sort();
    this.updateFolders();
  }

  updateFolders() {
    this.showFilenames1('select-folders', this.folderNames);
    this.showForCreateFolder1();
    this.showFilenames1('delete-folder', this.folderNames);
  }

  showForCreateFolder1() {
    this.showFilenames1("select-parent-folder", this.folderNames);
    let select = document.getElementById("select-parent-folder");
    let option = document.createElement("option");
    option.value = "rootFolder";
    option.innerText = "rootFolder";
    select.appendChild(option);
  }

  showFilenames1(selectElementId, array) {
    let selectElement = document.getElementById(selectElementId);
    selectElement.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
      let folderName = array[i];
      let option = document.createElement("option");
      option.value = folderName;
      option.innerText = folderName;
      
      selectElement.appendChild(option);
    }
  }

  showFilenames(result, selectElementId) {
    let selectElement = document.getElementById(selectElementId);
    selectElement.innerHTML = "";
    for (let i = 0; i < result.length; i++) {
      let folderName = result[i].filename;
      let option = document.createElement("option");
      option.value = folderName;
      option.innerText = folderName;
      
      selectElement.appendChild(option);
    }
  }

  showCurrentFolders(result) {
    this.showFilenames(result, 'select-folders');
  }

  showForCreateFolder(result) {
    this.showFilenames(result, "select-parent-folder");
    let select = document.getElementById("select-parent-folder");
    let option = document.createElement("option");
    option.value = "rootFolder";
    option.innerText = "rootFolder";
    select.appendChild(option);
  }

  showFileList(result) {
    console.log(result);
    let ul = document.getElementById("file-list");
    ul.innerHTML = "";
    for (let i = 0; i < result.length; i++) {
      let file = result[i].filename;
      let li = document.createElement("li");
      li.value = file;
      li.innerText = file;
      
      ul.appendChild(li);
    }

    //let fileListLength = document.getElementById("file-list").children.length;                   
    if (result.length === 0) {
      document.getElementById("file-list").style.display = "none";
      document.getElementById("file-list-message").style.display = "block";
    } else {
      document.getElementById("file-list").style.display = "block";
      document.getElementById("file-list-message").style.display = "none";
    }
  }

  fetchSubFolders(currentFolder, functionName) {
    this.fetchGet("subFolder?currentFolder=" + currentFolder, functionName);
  }

  fetchGet(parameter, functionName) {
    fetch(this.serverPath + parameter)
      .then(res => res.json())
      .then(functionName)
      .catch(console.log);
  }

  showSubFolders(result) {
    this.showFilenames(result, "select-sub-folders");
  }

  editorDidMount = editor => {
    //console.log("editorDidMount", editor, editor.getValue(), editor.getModel());
    this.editor = editor;
  };

  showCurrentFiles(result) {
    let selectElement = document.getElementById('select-file');
    selectElement.innerHTML = "";
    for (let i = 0; i < result.length; i++) {
      let folderName = result[i].filename;
      let option = document.createElement("option");
      option.value = folderName;
      option.innerText = folderName;
      
      selectElement.appendChild(option);
    }
  }

  handleEditFile(e) {
    let selectedFile = document.getElementById('select-file').value;
    this.fetchFileContent(selectedFile);
  }

  fetchFileContent(fileName) {
    fetch(this.serverPath + "fileContent?fileName=" + fileName)
      .then(res => res.text())
      .then(this.editFile)
      .catch(console.log);
  }

  editFile(result) {
    /*
    let jsonString = JSON.stringify(result);
    console.log(jsonString);
    */
   // this.editor.setValue(jsonString);
    this.editor.setValue(result);
  }

  handleCreateFolder(e) {
    // get all existed folder names  
    // , {mode: 'cors'}
    this.fetchFolderNames(this.isFolderExisted);
  }

  fetchFolderNames(functionName) {
    fetch(this.serverPath + "folderName")
      .then(res => res.json())
      .then(functionName)
      .catch(console.log);
  }

  fetchFileNames(functionName) {
    this.fetchGet("fileName", functionName)
  }

  isFolderExisted(result) {
    let newFolderName = document.getElementById('outlined-basic').value;

    let isFolderExisted = false;
    for (let i = 0; i < result.length; i++) {
      if (newFolderName === result[i].filename) {
        isFolderExisted = true;
        break;
      }
    }

    if (isFolderExisted) {
      document.getElementById('error-create-folder').innerText = "hint: This folder already exists";
      document.getElementById('error-create-folder').style.display = "block";
    } else {
      //document.getElementById('error-create-folder').innerText = "";
      document.getElementById('error-create-folder').style.display = "none";
      /*
      let options = {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: newFolderName
      };
      */

      let parentFolderName = document.getElementById('select-parent-folder').value;
      let options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newFolderName: newFolderName,
                              parentFolder: parentFolderName })
      };

      fetch(this.serverPath + "newFolder", options)
       // .then(res => res.json())
       // .then(this.updateParentFolders)
        .catch(console.log);
      
      document.getElementById('outlined-basic').value = "";
      
      this.folderNames.push(newFolderName);
      this.folderNames.sort();
      this.updateFolders();
    }
  }

  updateParentFolders(res) {
    console.log(res);
    this.fetchFolderNames(this.showForCreateFolder);
    document.getElementById('outlined-basic').value = "";
  }

  handleUploadFiles(e) {
    let file = document.getElementById('files').files[0];
    let fileName = file.name;
    if (!fileName.endsWith(".json")) {
      document.getElementById('error-upload-files').innerText = "hint: Must upload json files";
      document.getElementById('error-upload-files').style.display = "block";
      console.log(document.getElementById('error-upload-files').style.display);
      return;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    var context = this;
    reader.onload = function() {
      try {
        // js object
        let obj = JSON.parse(reader.result);

        document.getElementById('error-upload-files').style.display = "none";
        context.addFile(fileName);

        let folderName = document.getElementById('select-folders').value;
        let requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent: reader.result,
                                 fileName: file.name,
                                 folder: folderName,
                                 fileSize: file.size })
        };
        
        // add one more function, 这个anonymous function可能access不到this
        // this.serverPath + "uploadFile"
        fetch("http://127.0.0.1:3001/uploadFile", requestOptions)
          .catch(console.log);
      } catch {
        document.getElementById('error-upload-files').innerText = "hint: file format is invalid JSON";
        document.getElementById('error-upload-files').style.display = "block";
      } 
    }
  }

  addFile(fileName) {
    this.fileNames.push(fileName);
    this.fileNames.sort();
    this.updateFiles();
  }
}

export default App;
