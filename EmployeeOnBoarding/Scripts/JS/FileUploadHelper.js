var arraycount = 0;
var fileUploadeCount = 0;
var SuccessCallback = null;
var filesToUpload = [];
var filesUploader = null;
var fileIdCounter = 0;
var CurrentItemId = 0;
var CurrentListName = "";
var CurrentItemFiles = [];
$.fn.fileUploader = function () {
    this.closest(".files").change(function (evt) {
        var output = [];

        for (var i = 0; i < evt.target.files.length; i++) {
            fileIdCounter++;
            var maxFileSize = 5242880;

            var file = evt.target.files[i];
            var ext = file.name.match(/\.([^\.]+)$/)[1];
            var match = (new RegExp('[~#%\&{}+\|]|\\.\\.|^\\.|\\.$')).test(file.name);
            var FileUniqueId = CurrentListName + CurrentItemId + file.name;
            if (match) {
                ext = 'InvalidFileName';
            }

            var fileId = 'files' + fileIdCounter;
            var fileSize = file.size;
            if (fileSize > maxFileSize) {
                ext = 'sizeExceed';
            }

            [].forEach.call(CurrentItemFiles, function (value, index) {
                if (value.FileName == file.name && value.ListName == CurrentListName && value.ItemId == CurrentItemId) {
                    ext = 'FileAlreadyAttach';
                }
            });
            switch (ext) {
                case 'jpg':
                case 'txt':
                case 'png':
                case 'pdf':
                case 'jpeg':
                case 'docx':
                case 'doc':
                case 'excel':
                case 'xlsm':
                case 'xls':
                case 'xlsx':
                case 'ods':
                case 'zip':
                case 'rar':
                    CurrentItemFiles.push({
                        id: fileId,
                        Itemid: CurrentItemId,
                        Status: "New",
                        FileUrl: "",
                        FileName: file.name,
                        ListName: CurrentListName,
                        FileUniqueId: FileUniqueId,
                        file: file
                    });
                    var removeLink = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + FileUniqueId + "\">X</a>";
                    output.push("<li><div class='choose-file-name'> <strong>", file.name, "</strong> - ", fileSize / 1000, " KB. &nbsp; &nbsp; </div>", removeLink, "</li> ");
                    break;
                case 'sizeExceed':
                    alert('File size exceeded');
                    break;
                case 'FileAlreadyAttach':
                    alert('A file with the same name already attached');
                    break;
                case 'InvalidFileName':
                    alert("File name should not contain special characters");
                    break;
                default:
                    alert('Invalid format');
            }
        };

        $(this).children(".fileList")
            .append(output.join(""));

        //reset the input to null - nice little chrome bug!
        evt.target.value = null;
    });

    $(this).on("click", ".removeFile", function (e) {
        e.preventDefault();

        var strfileName = $(this).parent().children("a").data("fileid");

        // loop through the files array and check if the name of that file matches FileName
        // and get the index of the match
        for (var i = 0; i < CurrentItemFiles.length; ++i) {
            if (CurrentItemFiles[i].FileUniqueId === strfileName)
                if (CurrentItemFiles[i].Status == "New") {
                    CurrentItemFiles.splice(i, 1);
                }
                else {
                    CurrentItemFiles[i].Status = "Delete";
                }
        }
        for (var i = 0; i < filesToUpload.length; ++i) {
            if (filesToUpload[i].FileUniqueId === strfileName)
                if (filesToUpload[i].Status == "New") {
                    filesToUpload.splice(i, 1);
                }
                else {
                    filesToUpload[i].Status = "Delete";
                }
        }
        $(this).parent().remove();
    });

    this.clear = function () {
        for (var i = 0; i < filesToUpload.length; ++i) {
            //   if (filesToUpload[i].id.indexOf(sectionIdentifier) >= 0)
            filesToUpload.splice(i, 1);
        }
        CurrentItemFiles = [];
        $(this).children(".fileList").empty();
        var fileIdCounter = 0;
    }
    return this;
};
function SaveAttachmentsInMemory() {
    for (var i = 0; i < CurrentItemFiles.length; ++i) {
        if (IsFileAlreadyExists(CurrentItemFiles[i].FileUniqueId) == false) {
            filesToUpload.push(CurrentItemFiles[i]);
        }
    }
    CurrentItemFiles = [];
}
function IsFileDeleted(strFileName) {
    var bFileDeleted = false;
    for (var j = 0; j < filesToUpload.length; j++) {
        if (filesToUpload[j].FileName == strFileName) {
            if (filesToUpload[j].Status == "Delete") {
                bFileDeleted = true;
                break;
            }
        }
    }
    return bFileDeleted;
}
function IsFileAlreadyExists(strFileId) {
    var bFileExists = false;
    for (var j = 0; j < filesToUpload.length; j++) {
        if (filesToUpload[j].FileUniqueId == strFileId) {
            bFileExists = true;
            break;
        }
    }
    return bFileExists;
}
function LoadExistingFiles(AttachmentFiles, ItemId, strListName, FileControlId) {
    if (FileControlId == undefined) { FileControlId = "#files1"; }
    var output = [];
    var sectionIdentifier = "files";
    fileUploadeCount = 0;
    CurrentItemFiles = [];
    // filesToUpload = [];
    $(FileControlId).children(".fileList").empty();
    if (!BKJSShared.NotNullOrUndefined(AttachmentFiles))
        AttachmentFiles = [];
    for (var i = 0; i < AttachmentFiles.length; i++) {

        fileIdCounter++;
        var objattchment = AttachmentFiles[i];
        var strFileName = objattchment.FileName;
        var url = _spPageContextInfo.webAbsoluteUrl;
        var halfurl = url.split("/sites")[0];
        var AttachmentURL = halfurl + encodeURI(objattchment.ServerRelativeUrl);
        var FileUniqueId = strListName + ItemId + strFileName;
        var fileId = sectionIdentifier + fileIdCounter;
        if (IsFileDeleted(strFileName)) { continue; }
        var removeLink = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + FileUniqueId + "\">X</a>";
        //  output.push("<li><div class='choose-file-name'><strong><a href=" + serverURL+">,"+ escape(strFileName), +"</a></strong> &nbsp; &nbsp; </div>", removeLink, "</li> ");
        output.push("<li><div class='choose-file-name'><a href=" + AttachmentURL + " target='_blank'> <strong>", strFileName, "</strong>&nbsp; &nbsp;</a></div>", removeLink, "</li> ");
        CurrentItemFiles.push({
            id: fileId,
            Itemid: ItemId,
            Status: "Existing",
            FileName: strFileName,
            FileUrl: AttachmentURL,
            ListName: strListName,
            FileUniqueId: FileUniqueId,
            file: null
        });
    };
    for (var l = 0; l < filesToUpload.length; l++) {
        if (filesToUpload[l].Itemid == ItemId && filesToUpload[l].Status == "New") {
            fileIdCounter++;
            var objLoclattchment = filesToUpload[l].file;
            var strFileName1 = objLoclattchment.name;
            var fileId1 = sectionIdentifier + fileIdCounter;
            var FileUniqueId1 = strListName + ItemId + strFileName1;
            var removeLink1 = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + FileUniqueId1 + "\">X</a>";
            output.push("<li><div class='choose-file-name'><a href=\"#\"> <strong>", strFileName1, "</strong>&nbsp; &nbsp;</a></div>", removeLink1, "</li> ");
            //output.push("<li><div class='choose-file-name'><a href=\"#\" target='_blank'> <strong>", strFileName, "</strong>&nbsp; &nbsp;</a></div>", removeLink, "</li> ");
        }
    };

    $(FileControlId).children(".fileList")
        .append(output.join(""));
}
//function LoadExistingFilesFromMemory(ItemId) {
//    var output = [];
//    var sectionIdentifier = "files";
//    fileUploadeCount = 0;
//    CurrentItemFiles = [];
//    // filesToUpload = [];
//    $("#files1").children(".fileList").empty();
//    for (var i = 0; i < filesToUpload.length; i++) {
//        if (filesToUpload[i].Itemid == ItemId) {
//            fileIdCounter++;
//            var objattchment = filesToUpload[i].file;
//            var strFileName = objattchment.FileName;
//            var fileId = sectionIdentifier + fileIdCounter;

//            var removeLink = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + strFileName + "\">X</a>";
//            output.push("<li><div class='choose-file-name'><a href=\"#\"> <strong>", strFileName, "</strong>&nbsp; &nbsp;</a></div>", removeLink, "</li> ");
//            //output.push("<li><div class='choose-file-name'><a href=\"#\" target='_blank'> <strong>", strFileName, "</strong>&nbsp; &nbsp;</a></div>", removeLink, "</li> ");
//        }
//    };
//    $("#files1").children(".fileList")
//        .append(output.join(""));
//}
function FileUploadInitialize(ItemId, ListName, InputFileControlId) {
    if (InputFileControlId == undefined) { InputFileControlId = "#files1"; }
    CurrentItemId = ItemId;
    CurrentListName = ListName;
    filesUploader = $(InputFileControlId).fileUploader();
}
function createNewItemWithAttachments(listname, filearray, listItem, _SuccessCallback) {

    var dfd = $.Deferred();
    arraycount = filearray.length;
    SuccessCallback = _SuccessCallback;
    var initializePermsCall = PostAjax(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listname + "')/items", listItem);
    $.when(initializePermsCall).then(function (permData) {
        var id = permData.d.Id;
        if (filearray.length != 0) {
            for (i = 0; i <= filearray.length - 1; i++) {
                loopFileUpload(listname, id, filearray[i]).then(
                    function () {
                    },
                    function (sender, args) {
                        console.log("Error uploading");
                        dfd.reject(sender, args);
                    }
                );
            }
        }
    });
}
function PostAjax(siteurl, listItem) {
    return $.ajax({
        url: siteurl,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(listItem),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        }
    });
}
function loopFileUpload(listName, id, objfile) {
    var dfd = $.Deferred();
    uploadFile(listName, id, objfile); return dfd.promise();
}
function uploadFile(listname, ID, file) {
    var getFileBuffer = function (file) {

        var deferred = $.Deferred();
        var reader = new FileReader();

        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(file);
        return deferred.promise();
    };
    getFileBuffer(file).then(function (buffer) {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items(" + ID + ")/AttachmentFiles/add(FileName='" + file.name + "')",
            method: 'POST',
            async: false,
            data: buffer,
            processData: false,
            headers: {
                "Accept": "application/json; odata=verbose",
                "content-type": "application/json; odata=verbose",
                "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value

            },
            success: function (data) {
                onAttachmentSucess(data);
            },
            error: function (data) {
                console.log(data);
            }

        });

    });

}
function onAttachmentSucess() {
    fileUploadeCount++;
    if (arraycount == fileUploadeCount) {
        SuccessCallback();
        filesUploader.clear();
    }
}
function ProcessAttachmentsIfAny(_SuccessCallback, Itemid, ListName) {
    SaveAttachmentsInMemory();
    arraycount = 0;
    SuccessCallback = _SuccessCallback;
    if (filesToUpload != null && filesToUpload.length > 0) {
        fileArray = [];
        //Update count for total files attachments to be processed.
        $.each(filesToUpload, function (k, v) {
            //if (v.file) {
            if (v.Status == "New") {
                arraycount++;
            }
            else if (v.Status == "Delete") {
                arraycount++;
            }
            //}
        });
        //Loop through all the files and process one by one async.
        $.each(filesToUpload, function (k, v) {
            if (v.Itemid != 0) { Itemid = v.Itemid; }
            if (v.ListName != "") { ListName = v.ListName }
            if (v.Status == "New") {
                if (v.file) {
                    loopFileUpload(ListName, Itemid, v.file)
                }
            }
            else if (v.Status == "Delete") {
                DeleteFile(v.FileUrl);
            }
        });
    }
    else {
        SuccessCallback();
    }
}
function DeleteFile(URL) {
    $.ajax({
        url: URL,
        method: 'DELETE',
        headers: {
            'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
        },
        success: function (data) {
            onAttachmentSucess();
        },
        error: function (data) {
            console.log(data);
        }
    });
}

