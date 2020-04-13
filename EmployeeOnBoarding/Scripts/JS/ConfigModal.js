"use strict";
var ConfigModal = {
    gConfigSettings: {
        ThemeColor: "",
        OnBoardText: "",
        OffBoardText: "",
        DisplayTextEmployee:"",
        LogoUrl: "",
        CustomLogoUrl: "",
        AnalyticsRetentionPeriod:"",
        CurrentUserID: null,
        isCurrentUserAdmin: false,
        isCurrentUserDepartmentAdmin: false,
        isCurrentUserHasLowestPermission:false,
        isOpenLogoUrlInNewTab:false,
        nCurrentUserAndDepartmentGrpIds: [],
        CurrentUserDepartment: [],
        CurrentUserLevel: [],
        CurrentAdminUserID: [],
        isAllowAllUsers:false
    },
    arrDepartments: null,
    iDefaultLogoWidth: 130,
    iDefaultLogoHeight: 50,
    AfterLogoLoadCallBack: null,
    _isCallBackMustCalled:false,
    _onUserAdminStatusLoadCallBack: null,
    _FunctionsAfterAdminStatusLoad:[],
    GetGlobalSettings: function (CallBack,_isCallBackMustCalled) {
        ConfigModal.AfterLogoLoadCallBack = CallBack;
        ConfigModal._isCallBackMustCalled = _isCallBackMustCalled
        ConfigModal.GetThemeColor();
        ConfigModal.GetLogoImagePath();    
        BKSPShared.InitSPObject( null,ConfigModal._SPInitSuccess)

    },

    GetLogoImagePath: function () {

        var imageUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Logo Image')/items?$select=FileRef,RedirectURL&$orderby=Modified desc&$top=1";
        BKJSShared.AjaxCall(imageUrl, null, BKJSShared.HTTPRequestType.GET, null, ConfigModal._onImageItemGet, ConfigModal._onRestFailed)
    },
    GetThemeColor: function () {
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Settings')/Items(1)";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.GET, null, ConfigModal._onItemGet, ConfigModal._onRestFailed)
    },
    GetLevelAssociation: function () {
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('levellst')/Items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.GET, null, ConfigModal._onLevelItemGet, ConfigModal._onRestFailed)
    },
    isCurrentUserSuperAdmin: function () {
        var isAdmin = false;
        let CurrentUserID = _spPageContextInfo.userId;
        for (var i = 0; i < ConfigModal.gConfigSettings.CurrentAdminUserID.length; i++) {
            var isGroup = BKSPShared.CurrentUserGroupsData[CurrentUserID];
            if (ConfigModal.gConfigSettings.CurrentAdminUserID[i] == CurrentUserID || (BKJSShared.NotNullOrUndefined(isGroup))) {
                isAdmin = true;
                break
            }
        }
        ConfigModal.gConfigSettings.isCurrentUserAdmin = isAdmin
    },
    isCurrentUserDepartmentAdmin: function () {
        var isDepartmentAdmin = false;
        let CurrentUserID = _spPageContextInfo.userId;
        var CurrentUserGroupIds = Object.keys(BKSPShared.CurrentUserGroupsData)
        for (var i = 0; i < ConfigModal.arrDepartments.length; i++) {
            if (ConfigModal.arrDepartments[i].DepartmentAdminId !== null) {
                var CurrentAdmins = ConfigModal.arrDepartments[i].DepartmentAdminId.results
                for (var o = 0; o < CurrentAdmins.length; o++) {
                    for (var p = 0; p < CurrentUserGroupIds.length; p++) {
                        if (CurrentAdmins[o].toString() == CurrentUserGroupIds[p]) {
                            isDepartmentAdmin = true;
                            ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.push(CurrentAdmins[o])
                            ConfigModal.gConfigSettings.CurrentUserDepartment.push(ConfigModal.arrDepartments[i].OData__DepartmentName)
                        }
                    }
                }
                var isFound = $.inArray(CurrentUserID, CurrentAdmins);
                if (isFound > -1) {
                    isDepartmentAdmin = true;
                    ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.push(CurrentAdmins[0])
                    ConfigModal.gConfigSettings.CurrentUserDepartment.push(ConfigModal.arrDepartments[i].OData__DepartmentName)
                }
                if (isDepartmentAdmin && (isFound < 0)) {
                    ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.push(CurrentUserID)
                }
            }
        }
        ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin = isDepartmentAdmin;
        if (isDepartmentAdmin) {
            
                ConfigModal.gConfigSettings.isAllowAllUsers = false;
            
        }

    },
    GetDepartmentNames: function () {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Departmentlst')/items?$Select=ID,OData__DepartmentName,DepartmentAdminId,IsActive1";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, ConfigModal._onGetDepartmentNames, ConfigModal._onRestFailed);
    },
    _SPInitSuccess: function (data) {
        BKSPShared.GetCurrentUserAssociatedGroup(ConfigModal._OnGroupLoad)
    },
    _onImageItemGet: function (data) {
        if (data.d.results.length > 0) {
            ConfigModal.gConfigSettings.LogoUrl = data.d.results[0].FileRef;
            var fullWebUrl = window.location.protocol + '//' + window.location.host;
            ConfigModal.gConfigSettings.LogoUrl = fullWebUrl + ConfigModal.gConfigSettings.LogoUrl;
            if (data.d.results[0].FileRef != null) {
                if (ConfigModal.AfterLogoLoadCallBack) {
                    ConfigModal.AfterLogoLoadCallBack()

                }
            }
            //if (data.d.results[0].RedirectURL != null) {
            //}
        }
        else {
            //No Image
            var ImageSource = _spPageContextInfo.webAbsoluteUrl + "/Images/bi_logo.png"
            $("#EOBMainLogo").attr("src", ImageSource);
            if (ConfigModal._isCallBackMustCalled) {
                ConfigModal.AfterLogoLoadCallBack();
            }
        }
       
    },
    _onItemGet: function (data) {
        ConfigModal.gConfigSettings.OffBoardText = data.d.OffboardTitle;
        ConfigModal.gConfigSettings.OnBoardText = data.d.OnboardTitle;
        ConfigModal.gConfigSettings.CustomLogoUrl = data.d.LogoUrl;
        ConfigModal.gConfigSettings.isOpenLogoUrlInNewTab = data.d.IsOpenInNewTab
        ConfigModal.gConfigSettings.AnalyticsRetentionPeriod = data.d.AnalyticsRetentionPeriod
        ConfigModal.gConfigSettings.DisplayTextEmployee = data.d.DisplayTextEmployee
        if (data.d.AdminUsersId) {
            if (typeof (data.d.AdminUsersId) == "object") {
                ConfigModal.gConfigSettings.CurrentAdminUserID = data.d.AdminUsersId.results
            }
            else {
                var Arr = [data.d.AdminUsersId]
                ConfigModal.gConfigSettings.CurrentAdminUserID = Arr;
            }
        }
        else {
            ConfigModal.gConfigSettings.isAllowAllUsers = true;
        }
       
        if (data.d.ThemeColor == null) {
            data.d.ThemeColor = '#007bff'
        }
        ConfigModal.gConfigSettings.ThemeColor = data.d.ThemeColor;
        ConfigModal.gConfigSettings.DueDateBasedOn = data.d.DueDateBasedOn;
    },
    _onRestFailed: function (data) {
        console.log(data);
    },
    _onLevelItemGet: function (data) {
        if (data.d.results.length > 0) {
            var arrUserAndGrp = []
            var iCurrentUserId = _spPageContextInfo.userId;
            var arrCurrentUserGrpArray = Object.keys(BKSPShared.CurrentUserGroupsData);
            arrCurrentUserGrpArray.push(iCurrentUserId);
            for (var i = 0; i < data.d.results.length; i++) {
                var levelAdmin = data.d.results[i]["ResponsibleUsersId"]
                if (BKJSShared.NotNullOrUndefined(levelAdmin) == true) {
                    for (var k = 0; k < levelAdmin.results.length; k++) {
                        for (var j = 0; j < arrCurrentUserGrpArray.length; j++) {
                            if (levelAdmin.results[k] == arrCurrentUserGrpArray[j]) {
                                var oLevelObject = ConfigModal.Level.GetLevel();
                                oLevelObject.Name = data.d.results[i]["Title"];
                                oLevelObject.isAllowOnBoard = data.d.results[i]["AllowOnBoardOffBoard"];
                                oLevelObject.isAllowEdit = data.d.results[i]["AllowUserEdit"];
                                oLevelObject.isActive = data.d.results[i]["IsActive1"];
                                oLevelObject.ID = data.d.results[i]["ID"];
                                if (data.d.results[i].ResponsibleUsersId) {
                                    oLevelObject.LevelAdminsIDs = data.d.results[i].ResponsibleUsersId.results;
                                }
                                ConfigModal.gConfigSettings.CurrentUserLevel.push(oLevelObject);
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
            ConfigModal.gConfigSettings.isAllowAllUsers = false;
        }
    },
    _OnGroupLoad: function () {

        ConfigModal.GetLevelAssociation();
        ConfigModal.GetDepartmentNames()

    },
    _onGetDepartmentNames: function (data) {
        ConfigModal.arrDepartments = data.d.results;
        ConfigModal.isCurrentUserSuperAdmin();
        ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.push(_spPageContextInfo.userId);
        //if (!ConfigModal.gConfigSettings.isCurrentUserAdmin) {
            ConfigModal.isCurrentUserDepartmentAdmin();
        //}
        if (ConfigModal._onUserAdminStatusLoadCallBack) {
            ConfigModal._onUserAdminStatusLoadCallBack();           
        } 
        if (ConfigModal._FunctionsAfterAdminStatusLoad.length > 0) {
            for (var i = 0; i < ConfigModal._FunctionsAfterAdminStatusLoad.length; i++) {
                var CurrentFunction = ConfigModal._FunctionsAfterAdminStatusLoad[i];
                CurrentFunction();
            }
        }
    },
   
    //remoteAzURL : "https://beyondintranetdataanalytics.azurewebsites.net",   /// production
   ///s remoteAzURL: "https://beyondintranetstaging.azurewebsites.net",    /// testing
  //  remoteAzURL: "https://analyticsstage.azurewebsites.net/",
    saveUpdateEODataAnalyticsOnAZ: function (data) {
        var Url = "";
        let remoteAzURL = "https://analyticsstage.azurewebsites.net/";
        try {
            //var dfdSpla = $.Deferred();
            $.ajax({
               
                url: remoteAzURL + "/api/DataAnalytics/add",
                type: 'Post',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function (data, textStatus, xhr) {
                   // console.log(xhr);
                    // dfdSpla.resolve(xhr);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
            //return dfdSpla.promise();
        }
        catch (e) { }
    },

    addDynamicAnalyticsJs: function () {
        var pageAnalyticsJs = document.createElement('script');
        pageAnalyticsJs.setAttribute('src', dynamicJsPath + "pageanalytics.js");
        document.body.appendChild(pageAnalyticsJs);
        var ExceptionAnalyticsJs = document.createElement('script');
        ExceptionAnalyticsJs.setAttribute('src', dynamicJsPath + "ExceptionAnalytics.js");
        document.body.appendChild(ExceptionAnalyticsJs);
        var ExceptionLogAnalyticsJs = document.createElement('script');
        ExceptionLogAnalyticsJs.setAttribute('src', dynamicJsPath + "ExceptionLogAnalytics.js");
        document.body.appendChild(ExceptionLogAnalyticsJs);
    },

    addDynamicAnalyticsJsForHome: function () {
        var userAnalyticsJs = document.createElement('script');
        //userAnalyticsJs.setAttribute('src', "../Scripts/Analytics/UserAnalytics.js");
        userAnalyticsJs.setAttribute('src', dynamicJsPath + "UserAnalytics.js");
        document.body.appendChild(userAnalyticsJs);
        var clearAnalyticsJs = document.createElement('script');
        clearAnalyticsJs.setAttribute('src', '../Scripts/Analytics/CleanDataAnalyticsSyncData.js');
        document.body.appendChild(clearAnalyticsJs);
    },
    Category: {
        GetCategory: function () {
            var Category = {
                iID: "",
                sName: "",
                sType: "",
                isActive: true
            };
            return Category;
        }
    },
    Department: {
        GetDepartment: function () {
            var Department = {
                iID: "",
                sName: "",
                isActive: true
            };
            return Department;
        }
    },
    Position: {
        GetPosition: function () {
            var Position = {
                iID: "",
                sName: "",
                isActive: true
            };
            return Position;
        }
    },
    EmployeeType: {
        GetEmployeeType: function () {
            var EmployeeType = {
                iID: "",
                sName: "",
                isActive: true
            };
            return EmployeeType;
        }
    },
    ThemeConfig: {
        GetThemeConfig: function () {
            var ThemeConfig = {
                sColor: "",
                sOnBoardingTitle: "",
                sOffBoardingTitle: ""
            };
            return ThemeConfig;
        }
    },
    Level: {
        GetLevel: function () {
            var Level = {
                "Name": {
                    isAllowOnBoard: false,
                    isAllowEdit: false,
                    isActive: false,
                    ID: 0,
                    LevelAdminsIDs:[]
                }
            }
            return Level;
        }
    }
};
var EOBSettings = {
    Categories: [],
    EmployeeTypes: [],
    Departments: [],
    Positions: [],
    ThemeConfig: {}
}
var CheckEOBLicense = {
    Check: function () {
        var PageName = BKJSShared.GetCurrentPageName();
        if (PageName.indexOf("Dashboard.aspx") > -1) {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, CheckEOBLicense.UpdateAppVersionInLocalStorage);
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding);
        }
    },
    UpdateAppVersionInLocalStorage: function () {
        if (localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys.EmployeeOnBoarding) !== null) {
            var LicenseObject = JSON.parse(localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys.EmployeeOnBoarding))
            LicenseObject.AppVersion = BKJSShared.Application.Version;
            localStorage.setItem(BKSPCustomerLicense.ProductLocalStorageKeys.EmployeeOnBoarding, JSON.stringify(LicenseObject));
        }
    }
};
$(document).ready(function () {
    InitializeAppParameters();
    CheckEOBLicense.Check();
});
function InitializeAppParameters() {
    BKJSShared.Application.Version = "4.0.1.3";
}
