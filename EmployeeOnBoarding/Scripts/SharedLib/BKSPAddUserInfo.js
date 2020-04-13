"use strict";
var BKSPAddUserInfo = {
    isUseStagingWebService: true,
    IsUserExistWebServiceUrl: "https://userinfostage.azurewebsites.net/api/userinfo/IsCustomerExists/",
    AddNewUserWebServiceUrl: "https://userinfostage.azurewebsites.net/api/userinfo/AddCustomerInfo/",
    UserIPWebServiceUrl:"https://www.beyondintranet.com/contactus/ipinfo",
    AppName: "Employee Onboarding",
    DomainName: "",
    _onUserExistCallBack: null,
    AfterCustomerAddCallBack: null,
    CustomerAddFailureCallBack: null,
    InitializeData: function () {
        BKSPAddUserInfo.SetWebServiceUrl();
        BKSPAddUserInfo.DomainName = (_spPageContextInfo.tenantDisplayName + "." + _spPageContextInfo.webDomain)
    },
    SetWebServiceUrl: function () {
        if (!BKSPAddUserInfo.isUseStagingWebService) {
            BKSPAddUserInfo.IsUserExistWebServiceUrl = "http://userinfostaging.azurewebsites.net/api/userinfo/IsCustomerExists/"
            BKSPAddUserInfo.AddNewUserWebServiceUrl = "http://userinfostaging.azurewebsites.net/api/userinfo/AddCustomerInfo/"
        }
    },
    CheckIsUserExist: function (CallBack) {
        BKSPAddUserInfo.InitializeData();
        BKSPAddUserInfo._onUserExistCallBack = CallBack
        var IsUserExistUrl = BKSPAddUserInfo._ReturnUserExistenceUrl();
        BKJSShared.AjaxCall(IsUserExistUrl, null, BKJSShared.HTTPRequestType.GET, null, BKSPAddUserInfo._onIsUserExistSuccess, BKSPAddUserInfo._onIsUserExistFailure,true)
    },
    GetNewUserIPAddress: function () {
        BKJSShared.AjaxCall(BKSPAddUserInfo.UserIPWebServiceUrl, null, BKJSShared.HTTPRequestType.GET, false, BKSPAddUserInfo._onGetIPSucess, BKSPAddUserInfo._onGetIPFailed, true);
    },
    AddNewUser: function (UserName, EmailId, AppVersion, ContactNumber, CallBack,FailureCallback) {
        BKSPAddUserInfo.AfterCustomerAddCallBack = CallBack;
        BKSPAddUserInfo.CustomerAddFailureCallBack = FailureCallback;
        BKSPAddUserInfo.InitializeData();
        var AddNewUserObject = BKSPAddUserInfo._ReturnNewUserAllDetailsObject();
        AddNewUserObject.UserName = UserName;
        AddNewUserObject.EmailId = EmailId;
        AddNewUserObject.AppVersion = AppVersion;
        AddNewUserObject.ContactNumber = ContactNumber;
        BKSPAddUserInfo._currentUserObject = AddNewUserObject
        BKSPAddUserInfo.GetNewUserIPAddress();
    },
    _onIsUserExistSuccess: function (data) {        
        if (BKSPAddUserInfo._onUserExistCallBack) {
            BKSPAddUserInfo._onUserExistCallBack(data)
        }
    },
    _onIsUserExistFailure: function (data) {
        console.log(data);
    },    
    _currentUserObject: null,
    _ReturnUserExistenceUrl: function () {
        var IsUserExistUrl = BKSPAddUserInfo.IsUserExistWebServiceUrl + "?domain=" + BKSPAddUserInfo.DomainName + "&appName=" + BKSPAddUserInfo.AppName
        return IsUserExistUrl;
    },
    _ReturnNewUserAllDetailsObject: function () {
        var IsUserExist = {};
        IsUserExist["DomainName"] = BKSPAddUserInfo.DomainName;
        IsUserExist["AppName"] = BKSPAddUserInfo.AppName;
        IsUserExist["UserName"] = "";
        IsUserExist["EmailId"] = "";
        IsUserExist["AppVersion"] = "";
        IsUserExist["ContactNumber"] = "";
        IsUserExist["IpAddress"] = "";       
        return IsUserExist;
    },   
    _onAddNewUserSuccess: function (data) {
        console.log("Added in DB"); console.log(data)
    },
    _onAddNewUserFailure: function (data) {
        console.log("Failed Adding in DB"); console.log(data)
    },
    _onGetIPSucess: function (data) {
        if (data) {            
            BKSPAddUserInfo._currentUserObject.IpAddress = data.IP;
            //BKJSShared.AjaxCall(BKSPAddUserInfo.AddNewUserWebServiceUrl, BKSPAddUserInfo._currentUserObject, BKJSShared.HTTPRequestType.POST, null, BKSPAddUserInfo._onAddNewUserSuccess, BKSPAddUserInfo._onAddNewUserFailure,true)
            BKSPAddUserInfo.AddCustomerRecord(BKSPAddUserInfo.AddNewUserWebServiceUrl, BKSPAddUserInfo._currentUserObject)
        }
    },
    _onGetIPFailed: function (data) { console.log(data) },
    AddCustomerRecord(Url,DataObject) {

        $.ajax({
            url: Url,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(DataObject),
            success: function (data) {
                if (data == 1) {
                    BKSPAddUserInfo.AfterCustomerAddCallBack()
                }
            },
            error: function (data) {
                if (BKSPAddUserInfo.CustomerAddFailureCallBack) {
                    BKSPAddUserInfo.CustomerAddFailureCallBack();
                }
                console.log(data)
            }
        });
    }
};