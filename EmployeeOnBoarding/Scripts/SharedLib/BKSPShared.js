"use strict";
//This library dependent of SP.js and BKJSShared.js.
//Make sure you include that in your project in appropriate order to use this library.
var BKSPShared = {
    JSLibraryVersion: "1.0.8",
    SPContext: null,
    SPWeb: null,
    SPLists: null,
    SPGroups: null,
   
    AlwaysUseRootSite: false,
    afterAllListLoadFunction: null,
    SiteAbsoluteURL: "",
    AfterListItemsCallBack: null,
    _AfterSPInitCallBack: null,
    ListItemsFetchCount: "",
    ListItemsFetchStartIndex: "",
    ListItemsFetchOrderBy: "",
    GetListItemsIDToExclude: [],
    _CurrentListItemsListName: "",
    _CurrentListItemsBiggestID: "",
    _CurrentListItemsIDsArray: [],
    _CurrentListItemsAllData: [],
    _ListItemsTotalSuccessCallback: null,
    _CurrentTotalItemsCountListName: "",
    ListsData: {},
    UserData: [],
    CurrentUser: null,
    _CurrentUserGroups: null,
    _CurrentUserGroupsCallBack: null,
    CurrentUserGroupsData: {},
    InitSPObject: function (SiteURL, callback) {
        //Call this function before using any further functions of this library.
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            if (SiteURL) {
                BKSPShared.SPContext = new SP.ClientContext(decodeURIComponent(SiteURL));
              
            }
            else {
               
                BKSPShared.SPContext = new SP.ClientContext.get_current();
            }
           
            BKSPShared.SPWeb = BKSPShared.SPContext.get_web();
            BKSPShared.SPLists = BKSPShared.SPWeb.get_lists();
            BKSPShared.SiteAbsoluteURL = BKSPShared.SPContext.get_url();
            if (callback) {
                callback();
            }
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.InitSPObject"); }
    },
    _onSPInitSuccess: function () {
        if (BKSPShared._AfterSPInitCallBack) {
            BKSPShared._AfterSPInitCallBack();
        }
    },
    _onSPInitFailure: function () {
        console.log("Failed in loading context.")
    },
    GetListObjectProperties: function () {
        var ListObjectProperties = {
            TotalItemsCount: 0,
            Items: [],
            Fields: [],
        };
        return ListObjectProperties;
    },
    //Lists Related functions
    GetAllLists: function (CallBackFuntion, isReturn) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            BKSPShared.afterAllListLoadFunction = CallBackFuntion;
            BKSPShared.SPWeb = BKSPShared.SPContext.get_web();
            BKSPShared.SPLists = BKSPShared.SPWeb.get_lists();
            BKSPShared.SPContext.load(BKSPShared.SPLists, "Include(Title, Id,ContentTypes)");
            BKSPShared.SPContext.executeQueryAsync(BKSPShared.afterAllListLoadFunction, BKSPShared.OnListsQueryFailed);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.GetAllLists"); }
    },
    GetListByName: function (ListName, SuccesCallBack, ErrorCallBack) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            if (!BKJSShared.Application.isSPFx) {
                BKSPShared.SiteAbsoluteURL = _spPageContextInfo.siteAbsoluteUrl;
            }
            var ListUrl = BKSPShared.SiteAbsoluteURL + "/_api/lists/getbytitle('" + ListName + "')";
            BKJSShared.AjaxCall(ListUrl, null, "GET", SuccesCallBack, ErrorCallBack);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.GetListByName"); }
    },
    GetListItemsByName: function (ListName, SuccesCallBack, ErrorCallBack) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            if (!BKJSShared.Application.isSPFx) {
                BKSPShared.SiteAbsoluteURL = _spPageContextInfo.siteAbsoluteUrl;
            }
            BKSPShared._CurrentListItemsListName = ListName;
            var ListUrl = BKSPShared.SiteAbsoluteURL + "/_api/lists/GetByTitle('" + ListName + "')/items?";
            if (BKJSShared.NotEmptyString(BKSPShared.ListItemsFetchStartIndex)) {
                ListUrl += "%24skiptoken=Paged%3DTRUE%26p_ID%3D" + BKSPShared.ListItemsFetchStartIndex;
            }
            if (BKJSShared.NotEmptyString(BKSPShared.ListItemsFetchCount)) {
                ListUrl += "&%24top=" + BKSPShared.ListItemsFetchCount;
            }
            if (BKJSShared.NotEmptyString(BKSPShared.ListItemsFetchOrderBy)) {
                ListUrl += "&%24orderby=" + BKSPShared.ListItemsFetchOrderBy + " asc";
            }
            BKJSShared.AjaxCall(ListUrl, null, "GET", SuccesCallBack, ErrorCallBack);
            BKSPShared.GetListItemsIDToExclude = [];
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.GetListItemsByName"); }
    },
    ReturnListItemsData: function (ListName, SuccessCallBack, ErrorFunction, ItemsCount, StartIndex, OrderBy) {
        // will return current list items data in key value pair object to use further in your project,  BKSPShared._CurrentListItemsAllData is the object
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            BKSPShared.AfterListItemsCallBack = SuccessCallBack;
            BKSPShared.ListItemsFetchCount = ItemsCount;
            BKSPShared.ListItemsFetchStartIndex = StartIndex;
            BKSPShared.ListItemsFetchOrderBy = OrderBy;
            BKSPShared.GetListItemsByName(ListName, BKSPShared._ReturnListItemSuccess, BKSPShared._LogRestErrorInConsole);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.ReturnListItemsData"); }
    },
    _ReturnListItemSuccess: function (data) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            //1st level of success
            var ListItemsValueObject = [];
            BKSPShared._CurrentListItemsAllData = [];
            for (var i = 0; i < data.d.results.length; i++) {
                var ListItemValue = {};
                var InternalNames = Object.keys(data.d.results[i]);
                for (var k = 0; k < InternalNames.length; k++) {
                    if (InternalNames[k] == "Id" || InternalNames[k] == "ContentTypeId") {
                        continue;
                    }
                    if (data.d.results[i][InternalNames[k]]) {
                        if (InternalNames[k] !== "__metadata") {
                            if (
                                data.d.results[i][InternalNames[k]].hasOwnProperty(
                                    "__deferred"
                                ) == false
                            ) {
                                if (
                                    data.d.results[i][InternalNames[k]].hasOwnProperty(
                                        "__metadata"
                                    ) == false
                                ) {
                                    ListItemValue[InternalNames[k]] =
                                        data.d.results[i][InternalNames[k]];
                                }
                            }
                        }
                    }
                }
                BKSPShared._CurrentListItemsIDsArray.push(parseInt(data.d.results[i]["ID"]));
                ListItemsValueObject.push(ListItemValue);
                BKSPShared._CurrentListItemsAllData.push(ListItemValue);

                if (BKJSShared.NotNullOrUndefined(BKSPShared.ListsData[BKSPShared._CurrentListItemsListName])) {
                    BKSPShared.ListsData[BKSPShared._CurrentListItemsListName].Items.push(ListItemValue);
                }
            }
            BKSPShared.AfterListItemsCallBack(ListItemsValueObject);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared._ReturnListItemSuccess"); }
    },
    _LogRestErrorInConsole: function (data) {
        console.log(data);
    },
    OnListsQuerySucces: function () {
        BKSPShared.afterListLoadFunction();
    },
    GetListItemsTotalCount: function (ListName, SuccesCallBack) {
        if (BKJSShared.ErrorMode == true) { return false; }
        try {
            if (!BKJSShared.Application.isSPFx) {
                BKSPShared.SiteAbsoluteURL = _spPageContextInfo.siteAbsoluteUrl;
            }
            BKSPShared._CurrentTotalItemsCountListName = ListName;
            var ListUrl = BKSPShared.SiteAbsoluteURL + "/_api/lists/getbytitle('" + ListName + "')/ItemCount";
            var ListObject = BKSPShared.GetListObjectProperties();
            BKSPShared.ListsData[BKSPShared._CurrentTotalItemsCountListName] = ListObject;
            BKSPShared._ListItemsTotalSuccessCallback = SuccesCallBack;
            BKJSShared.AjaxCall(ListUrl, null, "GET", BKSPShared._LisItemsTotalSuccess, BKSPShared._LogRestErrorInConsole);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.GetListItemsTotalCount"); }
    },
    _LisItemsTotalSuccess: function (data) {
        if (BKJSShared.ErrorMode == true) { return false; }
        try {
            BKSPShared.ListsData[BKSPShared._CurrentTotalItemsCountListName].TotalItemsCount = data.d.ItemCount;
            BKSPShared._ListItemsTotalSuccessCallback(BKSPShared.ListsData[BKSPShared._CurrentTotalItemsCountListName]);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared._LisItemsTotalSuccess"); }
    },
    OnListsQueryFailed: function (sender, args) {
        alert(
            "Request failed. " + args.get_message() + "\n" + args.get_stackTrace()
        );
    },
    //Users related function
    GetAllUsersOfSite: function () {
        if (BKJSShared.ErrorMode == true) { return false; }
        try {
            BKSPShared.SPGroups = BKSPShared.SPWeb.get_siteGroups();
            BKSPShared.SPContext.load(BKSPShared.SPGroups);
            BKSPShared.SPContext.load(BKSPShared.SPGroups, 'Include(Users)');
            BKSPShared.SPContext.executeQueryAsync(BKSPShared._onGetAllUsersQuerySucceeded, BKSPShared._onGetAllUsersQueryFailed);
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.GetAllUsersOfSite"); }
    },
    ReturnUserObject: function () {
        var UserObject = {
            "Title": "",
            "ID": "",
            "LoginName": "",
            "GroupTitle": "",
            "GroupID": ""
        }
        return UserObject;
    },
    GetCurrentUserAssociatedGroup: function (CallBack) {

        if (CallBack) {
            BKSPShared._CurrentUserGroupsCallBack = CallBack;
        }
        BKSPShared.CurrentUser = BKSPShared.SPContext.get_web().get_currentUser();
        BKSPShared._CurrentUserGroups = BKSPShared.CurrentUser.get_groups();

        BKSPShared.SPContext.load(BKSPShared.CurrentUser);
        BKSPShared.SPContext.load(BKSPShared._CurrentUserGroups);
        BKSPShared.SPContext.executeQueryAsync(BKSPShared._onCurrentUserGroupSuccess, BKSPShared._onCallFailure);
    },
    _onCurrentUserGroupSuccess: function () {
        var groupsInfo = '';
        var groupsEnumerator = BKSPShared._CurrentUserGroups.getEnumerator();

        while (groupsEnumerator.moveNext()) {
            var oGroup = groupsEnumerator.get_current();
            BKSPShared.CurrentUserGroupsData[oGroup.get_id()] = oGroup.get_title()
            groupsInfo += '\n' + 'Group ID: ' + oGroup.get_id() + ', ' + 'Title : ' + oGroup.get_title();
        }
        if (BKSPShared._CurrentUserGroupsCallBack) {
            BKSPShared._CurrentUserGroupsCallBack();
        }

    },
    GetSPGroups: function () {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, BKSPShared._OnSpGroupsSuccess, BKSPShared._onCallFailure);
    },
    _OnSpGroupsSuccess: function (data) {
        console.log(data)
    },
    _onCallFailure: function (data) {
        console.log(data);
    },
    _onGetAllUsersQuerySucceeded: function () {
        if (BKJSShared.ErrorMode == true) { return false; }
        try {

            var groupEnumerator = BKSPShared.SPGroups.getEnumerator();
            while (groupEnumerator.moveNext()) {
                var oGroup = groupEnumerator.get_current();
                var collUser = oGroup.get_users();
                var userEnumerator = collUser.getEnumerator();
                while (userEnumerator.moveNext()) {
                    var oUser = userEnumerator.get_current();
                    var User = BKSPShared.ReturnUserObject();
                    User.ID = oUser.get_id();
                    User.GroupID = oGroup.get_id()
                    User.LoginName = oUser.get_loginName()
                    User.Title = oUser.get_title()
                    User.GroupTitle = oGroup.get_title()
                    BKSPShared.UserData.push(User)
                }
            }
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared._onGetAllUsersQuerySucceeded"); }
    },

    _onGetAllUsersQueryFailed: function (sender, args) {
        alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    },
    getRelativeUrlFromAbsolute: function (absoluteUrl) {
        absoluteUrl = absoluteUrl.replace('https://', '');
        absoluteUrl = absoluteUrl.replace('http://', '');
        var parts = absoluteUrl.split('/');
        var relativeUrl = '/';
        for (var i = 1; i < parts.length; i++) {
            relativeUrl += parts[i] + '/';
        }
        return relativeUrl;
    },
    //File Upload To Document Libray
    SPFiles: {
        appWebUrl: "",
        hostUrl: "",
        targetSiteUrl: "",
        libraryName: "",
        CallBack: null,
        InitUrls: function () {
            BKSPShared.SPFiles.appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
            BKSPShared.SPFiles.hostUrl = _spPageContextInfo.siteAbsoluteUrl;
            BKSPShared.SPFiles.targetSiteUrl = _spPageContextInfo.webAbsoluteUrl + "/" + BKJSShared.Application.Name + "/";
        },
        UploadFile: function (file, CallbackFunction) {

            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                if (BKJSShared.NotNullOrUndefined(file)) {
                    if (CallbackFunction) {
                        BKSPShared.SPFiles.CallBack = CallbackFunction;
                    }
                    BKSPShared.SPFiles.InitUrls();
                    var fileName = file.name;
                    var fileExtension = fileName.substr((fileName.lastIndexOf('.')));
                    //~, #, %, & , *, {, }, \, :, <, >, ?, /, |, “
                    fileName = fileName.replace(/[^a-zA-Z0-9-_\.]/g, '');
                    fileName = fileName.replace(fileExtension, '')
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        BKSPShared.SPFiles.addFile(e.target.result, fileName, fileExtension);
                    }
                    reader.onerror = function (e) {
                        console.log(e.target.error);
                    }
                    reader.readAsArrayBuffer(file);
                }
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.UploadFile"); }
        },

        addFile: function (buffer, fileName, fileExtension) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                var call = BKSPShared.SPFiles.uploadFileToDoc(buffer, fileName, fileExtension);
                call.done(function (data, textStatus, jqXHR) {
                    var call2 = BKSPShared.SPFiles.getFile(data.d);
                    call2.done(function (data, textStatus, jqXHR) {
                        var item = data.d;
                        if (BKSPShared.SPFiles.CallBack) {
                            BKSPShared.SPFiles.CallBack();
                        }
                    });
                    call2.fail(function (jqXHR, textStatus, errorThrown) {
                        BKSPShared.SPFiles.failHandlerFile(jqXHR, textStatus, errorThrown);
                    });
                });
                call.fail(function (jqXHR, textStatus, errorThrown) {
                    BKSPShared.SPFiles.failHandlerFile(jqXHR, textStatus, errorThrown);
                });
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPFiles.addFile"); }
        },

        uploadFileToDoc: function (buffer, fileName, fileExtension) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                var url = BKSPShared.SPFiles.appWebUrl + "/_api/SP.AppContextSite(@TargetSite)/web/lists/getByTitle(@TargetLibrary)/RootFolder/Files/add(url=@TargetFileName,overwrite='true')?" + "@TargetSite='" + BKSPShared.SPFiles.targetSiteUrl + "'" + "&@TargetLibrary='" + BKSPShared.SPFiles.libraryName + "'" + "&@TargetFileName='" + fileName + fileExtension + "'";
                var call = jQuery.ajax({
                    url: url,
                    type: "POST",
                    data: buffer,
                    processData: false,
                    headers: {
                        Accept: "application/json;odata=verbose",
                        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
                        //"Content-Length": buffer.byteLength
                    }
                });
                return call;
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPFiles.uploadFileToDoc"); }
        },

        getFile: function (file) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                var callURL = BKSPShared.SPFiles.convertURLCrossDomainForLogo(file.ListItemAllFields.__deferred.uri);
                var call = jQuery.ajax({
                    url: callURL,
                    type: "GET",
                    dataType: "json",
                    headers: {
                        Accept: "application/json;odata=verbose"
                    }
                });
                return call;
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPFiles.getFile"); }
        },

        convertURLCrossDomainForLogo: function (url) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                var urlsplitted = url.split('/');
                var newURL = "";
                var startwrite = false;
                for (var i = 0; i < urlsplitted.length; i++) {
                    if (urlsplitted[i].toLowerCase() == "_api") {
                        newURL += BKSPShared.SPFiles.appWebUrl + "/_api/";
                        startwrite = true
                    } else if (urlsplitted[i].toLowerCase() == "web") newURL += "SP.AppContextSite(@TargetSite)/web/"
                    else if ((i + 1) == urlsplitted.length) {
                        if (urlsplitted[i].indexOf("?") > -1) {
                            newURL += urlsplitted[i] + "&@TargetSite='" + BKSPShared.SPFiles.targetSiteUrl + "'";
                        } else {
                            newURL += urlsplitted[i] + "?@TargetSite='" + BKSPShared.SPFiles.targetSiteUrl + "'";
                        }
                    } else if (startwrite) newURL += urlsplitted[i] + "/";
                }
                return newURL;
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPFiles.convertURLCrossDomainForLogo"); }
        },

        failHandlerFile: function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            var message = response ? response.error.message.value : textStatus;
            console.log("Call failed. Error: " + message);
        }
    }
    //Data check
    ,
    SPItems: {
        sInternalName: "",
        sValueToCheck: "",
        nItemID: "",
        sListname: "",
        isFoundFunction: null,
        isNotFoundFunction: null,

        isValueExistInColumn: function (ValueToCheck, ColumnInternalName, ListName, ItemID, isFoundFunction, isNotFoundFunction) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                BKSPShared.SPItems.sListname = ListName;
                BKSPShared.SPItems.sInternalName = ColumnInternalName;
                BKSPShared.SPItems.sValueToCheck = ValueToCheck;
                BKSPShared.SPItems.nItemID = ItemID;
                BKSPShared.SPItems.isFoundFunction = isFoundFunction;
                BKSPShared.SPItems.isNotFoundFunction = isNotFoundFunction;
                var Url = ""
                if (BKSPShared.SPItems.nItemID) {
                    var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListName + "')/items?$select=" + ColumnInternalName + "&$filter=(ID ne '" + BKSPShared.SPItems.nItemID + "')";
                }
                else {
                    Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListName + "')/items?$select=" + ColumnInternalName;
                }
                BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, BKSPShared.SPItems._onisValueExistInColumnSuccess, BKSPShared.SPItems._onisValueExistInColumnError);
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPItems.isValueExistInColumn"); }
        },
        _onisValueExistInColumnSuccess: function (data) {
            if (BKJSShared.ErrorMode == true) { return false; }
            try {
                var isFound = false;
                if (data.d.results.length > 0) {
                    for (var i = 0; i < data.d.results.length; i++) {
                        if (BKJSShared.NotNullOrUndefined(data.d.results[i][BKSPShared.SPItems.sInternalName])) {
                            if (data.d.results[i][BKSPShared.SPItems.sInternalName].toLowerCase() == BKSPShared.SPItems.sValueToCheck.toLowerCase()) {
                                if (BKSPShared.SPItems.isFoundFunction) {
                                    BKSPShared.SPItems.isFoundFunction();
                                }
                                isFound = true;
                                break;
                            }
                        }                        
                    }
                }
                if (!isFound) {
                    if (BKSPShared.SPItems.isNotFoundFunction) {
                        BKSPShared.SPItems.isNotFoundFunction();
                    }

                }
            } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKSPShared.SPItems._onisValueExistInColumnSuccess"); }
        },
        _onisValueExistInColumnError: function (data) {
            console.log("Error in checking same name in list " + BKSPShared.SPItems.sListname);
            console.log(data);
        },
        _LookUpValueSucessFunction: function (data) {
            if (data) {
                if (data.d.results.length > 0) {
                    BKSPShared.SPItems._LookUpValueFoundFunction();
                }
                else {
                    BKSPShared.SPItems._LookUpValueNotFoundFunction();
                }
            }
        },
        _LookUpValueFoundFailedFunction: function (data) {
            console.log("Error in finding lookup value exist in other list.");
            console.log(data);
        },
        _LookUpValueFoundFunction: null,
        _LookUpValueNotFoundFunction: null,
        isLookUpValueExistInOtherList: function (ListName, ValueToCheck, ColumnInternalName, LookupColumnInternalName,LookUpExpandInternalName, isFoundSuccessFunction, isNotFoundFunction) {
            //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListName + "')/items?$select=" + ColumnInternalName + "%2F" + LookupColumnInternalName + "&$expand=" + ColumnInternalName + "%2F" + LookupColumnInternalName + "&$filter=(" + ColumnInternalName + "%2F" + LookupColumnInternalName + " eq '" + ValueToCheck + "')";
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListName + "')/items?expand=" + LookUpExpandInternalName + "%2F" + LookupColumnInternalName + "&$select=ID," + ColumnInternalName + "%2F" + LookupColumnInternalName + "&$filter=(" + ColumnInternalName + "%2F" + LookupColumnInternalName + " eq '" + ValueToCheck + "')";
            BKSPShared.SPItems._LookUpValueFoundFunction = isFoundSuccessFunction;
            BKSPShared.SPItems._LookUpValueNotFoundFunction = isNotFoundFunction;
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, BKSPShared.SPItems._LookUpValueSucessFunction, BKSPShared.SPItems._LookUpValueFoundFailedFunction);
        },
        ReturnLookUpValueExistInOtherListObject: function (ListName, ValueToCheck, ColumnInternalName, LookupColumnInternalName, LookUpExpandInternalName) {
            var LkUpObj = {};
            LkUpObj.ListName = ListName;
            LkUpObj.ValueToCheck = ValueToCheck;
            LkUpObj.ColumnInternalName = ColumnInternalName;
            LkUpObj.LookupColumnInternalName = LookupColumnInternalName;
            LkUpObj.LookUpExpandInternalName = LookUpExpandInternalName;
            
            return LkUpObj;
        },
    },
    UsersAndGroups: {
        oUserToAdd: null,
        EnsureUserData: null,
        EnsureUserCallBack: null,
        SPGroupsRest: null,
        SPGroupsUsersRest: {},
        _AfterAllSPGroupAndUsersCallback:null,
        AddUserToSharePointGroup: function (GroupId,UserEmail,UserTitle,LoginName) {

           
            var collGroup = BKSPShared.SPWeb.get_siteGroups();
            var oGroup = collGroup.getById(GroupId);
            var userCreationInfo = new SP.UserCreationInformation();
            userCreationInfo.set_email(UserEmail);
            userCreationInfo.set_loginName(LoginName);
            userCreationInfo.set_title(UserTitle);
            BKSPShared.UsersAndGroups.oUserToAdd = oGroup.get_users().add(userCreationInfo);

            BKSPShared.SPContext.load(BKSPShared.UsersAndGroups.oUserToAdd);
            BKSPShared.SPContext.executeQueryAsync(BKSPShared.UsersAndGroups._onUserAddToGroupQuerySucceeded, BKSPShared.UsersAndGroups._onUserAddToGroupQueryFailed);

        },
        AddUserToSPGroupRest: function (GroupName, UserLoginName) {
            var g = BKJSShared.GetHostWebUrlFromCurrentAppWeb()
            var newUserUrl = g  + "/_api/web/sitegroups/getbyname('" + GroupName +"')/users";
            var UserData = {
                __metadata: {
                    'type': 'SP.User'
                },
                LoginName: UserLoginName
            };  
            BKJSShared.AjaxCall(newUserUrl, UserData, BKJSShared.HTTPRequestType.POST, null, BKSPShared.UsersAndGroups._onUserAddedInSPGroupSuccess, BKSPShared.UsersAndGroups._onUserAddedInSPGroupFailed)            
        },
        _onUserAddToGroupQuerySucceeded: function () {

            alert(BKSPShared.UsersAndGroups.oUserToAdd.get_title() + " added.");
        },

        _onUserAddToGroupQueryFailed: function (sender, args) {

            alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
        },
        EnsureUser: function (UserLoginName, CallBack) {
            BKSPShared.UsersAndGroups.EnsureUserCallBack = CallBack;
            //Example of userLognName "i:0#.f|membership|russell.avre@domain.onmicrosoft.com" 
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/ensureUser";
            var UserData = { 'logonName': UserLoginName };
            BKJSShared.AjaxCall(Url, UserData, BKJSShared.HTTPRequestType.POST, null, BKSPShared.UsersAndGroups._onUserEnsureSuccess, BKSPShared.UsersAndGroups._onUserEnsureFailed)            
        },
        _onUserEnsureSuccess: function (data) {
            BKSPShared.UsersAndGroups.EnsureUserData = data;
            if (BKSPShared.UsersAndGroups.EnsureUserCallBack) {
                BKSPShared.UsersAndGroups.EnsureUserCallBack(data);
            }
        },
        _onUserEnsureFailed: function (data) {
            console.log("failed in ensure the user");
            console.log(data)
        },
        _onUserAddedInSPGroupSuccess: function (data) { console.log(data) },
        _onUserAddedInSPGroupFailed: function (data) { console.log(data) },
        GetAllSPGroupsAndUsersByRest: function (Callback) {
            BKSPShared.UsersAndGroups._AfterAllSPGroupAndUsersCallback = Callback;
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, BKSPShared.UsersAndGroups._OnSpGroupsSuccess, BKSPShared.UsersAndGroups._onCallFailure);
        },
        GetUsersOfEachGroup: function (GroupID) {
            
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/GetById(" + GroupID+")/Users";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, function (data) {

                BKSPShared.UsersAndGroups.SPGroupsUsersRest[GroupID] =data
            }, BKSPShared.UsersAndGroups._onCallFailure);
        },
        _OnSpGroupsSuccess: function (data) {
            if (data) {
                BKSPShared.UsersAndGroups.SPGroupsRest = data.d.results;
                for (var i = 0; i < BKSPShared.UsersAndGroups.SPGroupsRest.length; i++) {
                    BKSPShared.UsersAndGroups.GetUsersOfEachGroup(BKSPShared.UsersAndGroups.SPGroupsRest[i].Id)
                }
            }
        
        },
        _OnSpGroupUserSuccess: function (data) {
            BKSPShared.UsersAndGroups.SPGroupsUsersRest.push(data)
        },
        _onCallFailure: function (data) {
            console.log(data);
        },

    },
    SPEMail: {
        ReturnEmailData: function (From, To, Body, Subject) {
            var Data = {
                'properties': {
                    '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
                    'From': From,
                    'To': { 'results': To },
                    'Body': Body,
                    'Subject': Subject
                }
            }
            return Data;
        },
        SendEMail: function (From, ToArray, Body, Subject, SuccessCallback, FailureCallback) {
            var EmailData = BKSPShared.SPEMail.ReturnEmailData(From, ToArray, Body, Subject);
            var EmailUrl = _spPageContextInfo.webServerRelativeUrl + "/_api/SP.Utilities.Utility.SendEmail";
            BKJSShared.AjaxCall(EmailUrl, EmailData, BKJSShared.HTTPRequestType.POST, null, SuccessCallback, FailureCallback)
        }
    },    
};
