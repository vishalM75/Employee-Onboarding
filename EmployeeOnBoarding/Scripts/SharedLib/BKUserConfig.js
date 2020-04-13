"use strict";
class UserDetails {
    Users = [];
    IgnoreUserCheck= "";
    LicenseType = "";
    //UserEmail = "";
    //UserId = "";
    //UserName = "";
}

window.addEventListener('load', function () {
    BKUserConfig.GetUserDetail();
}, false);
var BKUserConfig = {
   
    GetUserDetail() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserConfig + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onUserDetailSuccess, this._onRestCallFailure);
    },

    UpdateUserDetail(SaveData) {
        var RequestMethod = null;
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserConfig + "')/items";
        RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, BKUserConfig._onItemSave, BKUserConfig._onRestCallFailure)
    },
    _onItemSave(data) {
        console.log(data)
    },

    _onUserDetailSuccess(data) {
        if (data.d.results.length > 0) {
            if (data.d.results[0].Value1 == "[]") {
                var obj = {
                    UserEmail: _spPageContextInfo.userEmail,
                    UserId: _spPageContextInfo.userId,
                    UserName: _spPageContextInfo.userDisplayName,
                    //Key:"UsersList"
                }
                UserDetails.Users = JSON.stringify(obj);
                let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.UserConfig);
                var SaveData = {
                    __metadata: { 'type': ListTypeName },
                    "Value1": UserDetails.Users,                    
                }
                console.log(UserDetails)
                
                var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserConfig + "')/items(1)";
                
                BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.MERGE, BKUserConfig._onItemSave, BKUserConfig._onRestCallFailure)
            }
        }
    },
    _onRestCallFailure(data) {
        console.log(data)
    }
}