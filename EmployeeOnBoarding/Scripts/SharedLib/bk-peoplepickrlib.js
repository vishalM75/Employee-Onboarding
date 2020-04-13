let BKSPPeoplePicker = {
    // Initializa required variables in configuration for people picker
    version:"1.5.4",
    sPrincipalAccountType: "User,DL,SecGroup,SPGroup",
    iSearchPrincipalSource: 15,
    iResolvePrincipalSource: 15,
    iMaximumEntitySuggestions: 50,
    sPicketResolvedList: "_TopSpan_ResolvedList",
    sSPUserSpan: ".sp-peoplepicker-userSpan",
    sEditorInput: "_TopSpan_EditorInput",
    sEntityType: "User",
    sProviderName: "Tenant",
    sProviderDisplayName: "Tenant",
    isResolved: true,
    arrSelectedUsersAllDetails: [],
    isAnyUserGroupSelected:false,
    gPeoplePickerConfig: null,
    arrPeoplePickerFromIds: [],
    sPeoplePickerFromIdElementId: "",
    arrPeoplePickerFromIdUserObject: [],
    CurrentFurtherUserDetailKey: null,
    
    ResetFromIdToPeoplePickerData: function () {
        BKSPPeoplePicker.arrPeoplePickerFromIds = [];
        BKSPPeoplePicker.sPeoplePickerFromIdElementId = "";
        BKSPPeoplePicker.arrPeoplePickerFromIdUserObject = [];
        BKSPPeoplePicker.arrSelectedUsersAllDetails = [];
        
    },
    oSPClasses: {
        clsPeoplePickerSpan: ".sp-peoplepicker-userSpan",
        clsPeoplePickerTopLevel: ".sp-peoplepicker-topLevel",
        clsPeoplePickerinitialHelpText: ".sp-peoplepicker-initialHelpText",
        clsPeoplePickerautoFillContainer: ".sp-peoplepicker-autoFillContainer",
    },

    InitializeConfiguration: function (isAllowMultipleValues) {

        try {
            var schema = {};
            schema['PrincipalAccountType'] = BKSPPeoplePicker.sPrincipalAccountType;
            schema['SearchPrincipalSource'] = BKSPPeoplePicker.iSearchPrincipalSource;
            schema['ResolvePrincipalSource'] = BKSPPeoplePicker.iResolvePrincipalSource;
            schema['AllowMultipleValues'] = isAllowMultipleValues;
            schema['MaximumEntitySuggestions'] = BKSPPeoplePicker.iMaximumEntitySuggestions;
            return schema;
        }
        catch (e) {

            console.log("Line: " + e.lineNo +" Error: "+e.message);
        }
    },

    InitializePeoplePicker: function (oConfigItems) {

        try {            
            if (oConfigItems != undefined) {
                BKSPPeoplePicker.gPeoplePickerConfig = oConfigItems;
                if (oConfigItems.element == undefined) { alert("PeoplePicker : No Control set to Initiate PeoplePicker."); }
                if (oConfigItems.isAllowMultipleValues == undefined) { oConfigItems.isAllowMultipleValues = true; }
                if (oConfigItems.editmode == undefined) { oConfigItems.editmode = false; }
                if (oConfigItems.oUserSet == undefined) { oConfigItems.oUserSet = []; }

                var schema = BKSPPeoplePicker.InitializeConfiguration(oConfigItems.isAllowMultipleValues);

                if (oConfigItems.editmode == true) {

                    BKSPPeoplePicker.InitializePeoplePickerEdit(oConfigItems.element, oConfigItems.oUserSet, oConfigItems.isAllowMultipleValues)
                }
                else {

                    SPClientPeoplePicker_InitStandaloneControlWrapper(oConfigItems.element, null, schema);
                }

                BKSPPeoplePicker.InitiateClass(oConfigItems);


                let ele = "#" + oConfigItems.element + "" + BKSPPeoplePicker.sEditorInput;

                $(ele).on('focusout', function () {                    
                    BKSPPeoplePicker.GetSelectedUsersDetails();
                    if (BKSPPeoplePicker.FocusOutCallback) {
                        BKSPPeoplePicker.FocusOutCallback();
                    }
                });
            }
            else {

                alert("PeoplePicker : No Control set for Initiate PeoplePicker.");
            }
        }
        catch (e) {

            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }

    },
    InitializePeoplePickerEdit: function (element, oUserItems, isAllowMultipleValues) {

        try {
            // Create a schema to store picker properties, and set the properties.
            var schema = BKSPPeoplePicker.InitializeConfiguration(isAllowMultipleValues);

            var users = null;
            users = new Array(oUserItems.length);

            if (oUserItems.length > 0) {
                for (var i = 0; i < oUserItems.length; i++) {

                    if (oUserItems[i].email != "") {

                        var user = new Object();
                        user.AutoFillDisplayText = oUserItems[i].name;
                        user.AutoFillKey = oUserItems[i].name;
                        user.AutoFillSubDisplayText = "";
                        user.DisplayText = oUserItems[i].name;
                        user.EntityType = BKSPPeoplePicker.sEntityType;
                        user.IsResolved = BKSPPeoplePicker.isResolved;;
                        user.Key = oUserItems[i].Key;
                        user.ProviderDisplayName = BKSPPeoplePicker.sProviderDisplayName;
                        user.ProviderName = BKSPPeoplePicker.sProviderName;
                        user.Resolved = BKSPPeoplePicker.isResolved;
                        user.Description = oUserItems[i].email;
                        users[i] = user;
                    }

                }
            }

            // Render and initialize the picker. 
            // Pass the ID of the DOM element that contains the picker, an array of initial
            // PickerEntity objects to set the picker value, and a schema that defines
            // picker properties.CreatePeoplePicker
            SPClientPeoplePicker_InitStandaloneControlWrapper(element, users, schema);

            BKSPPeoplePicker.RemovePickerCancelLink(element);
        }
        catch (e) {
            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }
    },
    RemovePickerCancelLink: function (element) {

        try {
            var peoplePickerContainer = document.getElementById("#" + element + "" + BKSPPeoplePicker.sPicketResolvedList);
            var removableObj = new Object();
            var removableObjName = [];

            var elementSpan = "#" + element + "" + BKSPPeoplePicker.sPicketResolvedList + "" + BKSPPeoplePicker.sSPUserSpan;

            for (var i = 0; i < document.querySelectorAll(elementSpan).length; i++) {
                var obj = document.querySelectorAll(elementSpan)[i];
                if (obj.id.indexOf('undefined') != -1) {
                    removableObjName.push(obj.id);
                    removableObj[obj.id] = obj;
                }
            }

            for (var i = 0; i < removableObjName.length; i++) {
                peoplePickerContainer.removeChild(removableObj[removableObjName[i]]);
            }
        }
        catch (e) {
            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }
    },
    GetPeoplePickerSelectedUser: function (element,isReturnKey) {

        try {
            usersLogins = new Array();
            BKSPPeoplePicker.arrSelectedUsersAllDetails = [];
            BKSPPeoplePicker.arrPeoplePickerFromIdUserObject = [];
            BKSPPeoplePicker.isAnyUserGroupSelected = false;
            var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[element + "_TopSpan"];
            if (peoplePicker.UnresolvedUserCount > 0) {
                BKSPPeoplePicker.isResolved = false;
                return
            }
            else {
                BKSPPeoplePicker.isResolved = true;
            }
            var users = peoplePicker.GetAllUserInfo();
            
            for (var i = 0; i < users.length; i++) {
                if (typeof (users[i].Description) != "undefined") {
                    if (isReturnKey) {
                        if (users[i]["Key"]) {
                            if (users[i]["Key"].indexOf(".f|membership|")< 0) {

                               // BKSPPeoplePicker.arrSelectedUsersAllDetails.push(parseInt(users[i]["EntityData"]["SPGroupID"]))
                                //usersLogins.push(users[i].Key)
                                if (users[i]["EntityData"]) {
                                    var UserObject = { name: users[i]["EntityData"]["AccountName"], email: "", Key: "" }
                                    BKSPPeoplePicker.arrPeoplePickerFromIdUserObject.push(UserObject);
                                    BKSPPeoplePicker.arrSelectedUsersAllDetails.push(users[i]["EntityData"]["SPGroupID"])
                                    
                                }
                                else {
                                    var GrpIdUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + users[i]["DisplayText"] + "')";
                                    BKSPPeoplePicker.AjaxCall(GrpIdUrl, null, "Get", BKSPPeoplePicker._onGrpIdSucess, BKSPPeoplePicker._onGrpIdFailed);
                                }
                                
                            }
                            else {
                                usersLogins.push(users[i].Key);
                            }
                        }                       
                        else {
                            usersLogins.push(users[i].Key);
                        }
                       
                    }
                    else {
                        usersLogins.push(SP.FieldUserValue.fromUser(users[i].Key));
                    }
                    
                }
            }
            if (usersLogins.length > 0) {
                BKSPPeoplePicker.isAnyUserGroupSelected = true;
            }          
            return usersLogins;
        }
        catch (e) {
            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }
    },
    GetPeoplePickerSelectedUserFieldObject: function () {
        try {
            usersLogins = new Array();
            BKSPPeoplePicker.arrSelectedUsersAllDetails = [];
            BKSPPeoplePicker.isAnyUserGroupSelected = false;
            var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[BKSPPeoplePicker.gPeoplePickerConfig.element + "_TopSpan"];

            var users = peoplePicker.GetAllUserInfo();

            for (var i = 0; i < users.length; i++) {
                if (typeof (users[i].Description) != "undefined") {
                            usersLogins.push(SP.FieldUserValue.fromUser(users[i].Key));
                }
            }
            if (usersLogins.length > 0) {
                BKSPPeoplePicker.isAnyUserGroupSelected = true;
            }
            return usersLogins;
        }
        catch (e) {
            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }
    },
    ResetPeoplePickerField: function () {      
        var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[BKSPPeoplePicker.gPeoplePickerConfig.element + "_TopSpan"];
        var users = peoplePicker.GetAllUserInfo();        
        for (var i = 0; i < users.length; i++) {
            peoplePicker.DeleteProcessedUser();               
        }
        BKSPPeoplePicker.isAnyUserGroupSelected = false;
    },
    InitiateClass: function (objitems) {

        try {
            if (objitems.classuserSpan == undefined) { objitems.classuserSpan = ""; }
            if (objitems.classtoplevel == undefined) { objitems.classtoplevel = ""; }
            if (objitems.classhelptext == undefined) { objitems.classhelptext = ""; }
            if (objitems.classautofillcontainer == undefined) { objitems.classautofillcontainer = ""; }

            $(BKSPPeoplePicker.oSPClasses.clsPeoplePickerSpan).addClass(objitems.classuserSpan);
            $(BKSPPeoplePicker.oSPClasses.clsPeoplePickerTopLevel).addClass(objitems.classtoplevel);
            $(BKSPPeoplePicker.oSPClasses.clsPeoplePickerinitialHelpText).addClass(objitems.classhelptext);
            $(BKSPPeoplePicker.oSPClasses.clsPeoplePickerautoFillContainer).addClass(objitems.classautofillcontainer);
        }
        catch (e) {
            console.log("Line: " + e.lineNo + " Error: " + e.message);
        }
    },
    
    GetSelectedUsersDetails: function () {
        var AllSelectedUsers = BKSPPeoplePicker.GetPeoplePickerSelectedUser(BKSPPeoplePicker.gPeoplePickerConfig.element, true);
        if (BKSPPeoplePicker.gPeoplePickerConfig.callback) {
            BKSPPeoplePicker.gPeoplePickerConfig.callback();
        }
        for (var i = 0; i < AllSelectedUsers.length; i++) {
            BKSPPeoplePicker.GetUserFurtherDetails(AllSelectedUsers[i])
        }
    },
    GetSelectedUserIds: function () {
        
        var SelectedUsersIdAr = jQuery.unique(BKSPPeoplePicker.arrSelectedUsersAllDetails);    
       
        var RestIdObject = { 'results': SelectedUsersIdAr };
        return RestIdObject;
    },
    GetUserFurtherDetails: function (UserKey) {       
        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=%27i:0%23.f|membership|" + UserKey +"%27";
        //var Url = _spPageContextInfo.webAbsoluteUrl + "_api/siteusers/GetPropertiesFor(accountName=@v)?@v='" + encodeURIComponent(UserKey) + "'";
        BKSPPeoplePicker.CurrentFurtherUserDetailKey = UserKey;
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers(@v)?@v='" + encodeURIComponent(UserKey) + "'";        
       // var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUserInfoList/items?$filter=(Title eq '" + UserKey + "')"
        BKSPPeoplePicker.AjaxCall(Url, null, "Get", BKSPPeoplePicker._onSiteUsersSuccess, BKSPPeoplePicker._onUsersRestCallFailed);
    },
    CreatePeoplePickerFromUserIds: function (IdsArray, ElementID) {
        BKSPPeoplePicker.arrPeoplePickerFromIds = IdsArray;
        BKSPPeoplePicker.sPeoplePickerFromIdElementId = ElementID;
        for (var i = 0; i < BKSPPeoplePicker.arrPeoplePickerFromIds.length;i++) {
            //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid('" + BKSPPeoplePicker.arrPeoplePickerFromIds[i] + "')";
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUserInfoList/items?$filter=(ID eq '" + BKSPPeoplePicker.arrPeoplePickerFromIds[i] +"')"
            BKSPPeoplePicker.AjaxCall(Url, null, "Get", BKSPPeoplePicker._onUserDetailFromIdSuccess, BKSPPeoplePicker._onUsersRestCallFailed);
        }       
    },
    AjaxCall: function (url, dataObject, type, success, failure) {       
        try {
            var headers = null;
            headers = {
                'Accept': 'application/json;odata=verbose',
                'Content-type': 'application/json;odata=verbose',
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            }
           

            var AjaxObject = {
                dataType: "json",
                url: url,
                type: type,
                async: false,
                headers: headers,
                success: function (data) {
                    success(data);
                },
                error: function (data) {
                    failure(data);
                }
            }

            if (dataObject) {
                AjaxObject["data"] = JSON.stringify(dataObject)
            }

            $.ajax(AjaxObject);

        } catch (e) { console.log("Error in Ajax Call Line: " + e.lineNo + " Error: " + e.message); }
    },
    _UpdatePeoplePickerSelectedID: function (EnsuredUserId) {
        BKSPPeoplePicker.arrSelectedUsersAllDetails.push(EnsuredUserId);
    },
    _onSiteUsersSuccess: function (data) {
        BKSPPeoplePicker.arrSelectedUsersAllDetails.push(data.d.Id);                    
    },
    _onUsersRestCallFailed: function (data) {      
        if (data.responseJSON.error.message.value.indexOf("User cannot be found.") > -1) {
            BKSPShared.UsersAndGroups.EnsureUser(BKSPPeoplePicker.CurrentFurtherUserDetailKey,BKSPPeoplePicker._UpdatePeoplePickerSelectedID)
        }
    },
    _onUserDetailFromIdSuccess: function (data) {
        var UserObject = { name: data.d.results[0].Title, email: data.d.results[0].EMail, Key: data.d.results[0].Name }
        BKSPPeoplePicker.arrSelectedUsersAllDetails.push(data.d.results[0].ID)
        BKSPPeoplePicker.arrPeoplePickerFromIdUserObject.push(UserObject);
        if (BKSPPeoplePicker.arrPeoplePickerFromIdUserObject.length == BKSPPeoplePicker.arrPeoplePickerFromIds.length) {
            BKSPPeoplePicker.InitializePeoplePicker({

                element: BKSPPeoplePicker.sPeoplePickerFromIdElementId,
                isAllowMultipleValues: true,
                editmode: true,
                classuserSpan: "peoplepicker-userSpan",
                classtoplevel: "peoplepicker-topLevel",
                classhelptext: "peoplepicker-initialHelpText",
                classautofillcontainer: "peoplepicker-autoFillContainer",
                oUserSet: BKSPPeoplePicker.arrPeoplePickerFromIdUserObject,

            });
        }
    },
    _onGrpIdSucess: function (data) {
        if (data) {
            var UserObject = { name: data.d.Title, email: "", Key: data.d.LoginName }
            BKSPPeoplePicker.arrPeoplePickerFromIdUserObject.push(UserObject);
            BKSPPeoplePicker.arrSelectedUsersAllDetails.push(data.d.Id)
        }
        
    },
    _onGrpIdFailed: function (data) {
        console.log("Failed in loading group details.")
        console.log(data);
    }
};

