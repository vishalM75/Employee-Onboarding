/*

User Analytic is to capture user information from app for this first capture user 
and insert Into user analytic sharepoint list and then cheq log list If it is first transfer  then save
all data of user analytic into database and insert into log list with last transfer date and if it is not 
first transfer then get last transfer date from database and insert all data grater from last transfer date
into database and update last transfer datetime on log list 

*/


var domain = '';
var spHostUrl = '';
var newpid = '';
var lastTransferDate = '';
var analyticName = "User Analytics";
var appname = '';
var logType = "User Analytics";
var hosturl = '';
var oClientData = [];

var oGlobalUserAnalyConfigurations = {
    ListName: "User Analytics",
    pid: "",
    domain: "",
    session: "",
    UserName: "",
    Title:"",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
    UserEmail: "",
    Phone: "",
    remoteAzURL:"https://analyticsstage.azurewebsites.net/"
};
var oGlobalLogConfigurations = {
    ListName: "Log",
    type: "",
    productId: "",
    domain: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
};

var lstUserAnalyticClientData = [];
var userItemId = '';
//Stage
//var remoteAzURL = "http://analyticsstage.azurewebsites.net/";
//var remoteAzURL = "http://localhost:51576/";
//Production
//var remoteAzURL = "https://beyondintranetdataanalytics.azurewebsites.net";

window.addEventListener('load', function () {
    BKJSShared.AjaxCall(BKSPAddUserInfo.UserIPWebServiceUrl, null, BKJSShared.HTTPRequestType.GET, false, getBrowserData, _onGetIPFailed, true);
    GetUserDetails();
   
}, false);

function getBrowserData(data) {
    oClientData.push(data);
    oGlobalUserAnalyConfigurations.currentContext = new SP.ClientContext.get_current();
    oGlobalLogConfigurations.currentContext = new SP.ClientContext.get_current();
    getUserInfoUserAnaly();
}

function _onGetIPFailed(data) { console.log(data) }
function getUserInfoUserAnaly() {
    try {
        oGlobalUserAnalyConfigurations.currentweb = oGlobalUserAnalyConfigurations.currentContext.get_web();
        currentUser = oGlobalUserAnalyConfigurations.currentweb.get_currentUser();
        oGlobalUserAnalyConfigurations.currentContext.load(currentUser);
        oGlobalUserAnalyConfigurations.currentContext.executeQueryAsync(getUserInfoUserAnalySuccess, getUserInfoUserAnalyFail);
    }
    catch (e)
    { }
}

function getUserInfoUserAnalySuccess(sender, args) {
    try {
        domain = getdomainnameuseranalytic();
        oGlobalUserAnalyConfigurations.domain = domain;
        oGlobalUserAnalyConfigurations.UserName = currentUser.get_id();
        oGlobalUserAnalyConfigurations.UserEmail = currentUser.get_email();
        oGlobalUserAnalyConfigurations.Title = currentUser.get_title();
        //InsertUserAnalyList();
        checkUserInsertedOrNot();
    }
    catch (e)
    { }
}

function checkUserInsertedOrNot() {
    try {
        var context = oGlobalUserAnalyConfigurations.currentContext;
        var oList = context.get_web().get_lists().getByTitle('User Analytics');
        var camlQuery = new SP.CamlQuery();
        var qq = "<View>/"
            + "<Query>/"
            + "<Where><Eq><FieldRef Name='Author' LookupId='True' /><Value Type='Integer'>" + _spPageContextInfo.userId + "</Value></Eq>/"
            + "</Where > /"
            + "</Query>/"
            + "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Created' /><FieldRef Name='Author' /></ViewFields>/"
            + "</View > ";
        camlQuery.set_viewXml(qq);
        var items = oList.getItems(camlQuery);
        context.load(items);
        context.executeQueryAsync(
            function () {
                var dataSet = [];
                var listEnum = items.getEnumerator();
                while (listEnum.moveNext()) {
                    var item = listEnum.get_current();
                    var date = new Date(item.get_item('Created'));
                    dataSet.push(date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear());
                }
                var dateToday = new Date();  //exists
                var dateTodayS = dateToday.getDate() + '/' + dateToday.getMonth() + '/' + dateToday.getFullYear();
                //var temp = dataSet.toString().includes(dateTodayS);
                var temp = dataSet.toString().indexOf(dateTodayS) != -1 ? true : false;
                if (!temp) {
                    InsertUserAnalyList();
                }
            },
            function (sender, args) {
                console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
            });
    }
    catch (e)
    { }
}

function getUserInfoUserAnalyFail(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}

function extractDomain(url) {
    try {
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }
        //find & remove port number
        domain = domain.split(':')[0];

        return domain;
    }
    catch (e)
    { }
}

function getQueryStringParameter(paramToRetrieve) {
    try {

        var params =
            document.URL.split("?")[1].split("&");

        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }
    catch (e)
    { }
}

//Insert User Analytic  List 

function InsertUserAnalyList() {
    try {
        
        oGlobalUserAnalyConfigurations.qListcnt = oGlobalUserAnalyConfigurations.currentContext.get_web().get_lists().getByTitle('User Analytics');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalUserAnalyConfigurations.currentContext.get_url();
        this.oListItem = oGlobalUserAnalyConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('Domain', oGlobalUserAnalyConfigurations.domain);
        oListItem.set_item('Email', oGlobalUserAnalyConfigurations.UserEmail);
        oListItem.set_item('Title', oGlobalUserAnalyConfigurations.Title);
        oListItem.set_item('ContactNo', oGlobalUserAnalyConfigurations.Phone);
        oListItem.update();
        oGlobalUserAnalyConfigurations.currentContext.load(oListItem);
        oGlobalUserAnalyConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertUserAnalyListSucceeded), Function.createDelegate(this, this.InsertUserAnalyListFailed));
    }
    catch (e)
    { }
}

function InsertUserAnalyListSucceeded() {
    try {
        var tempId = this.oListItem.get_id();
        if (tempId != -1) {
            InsertClientInfo(tempId);
        }
    }
    catch (e) {
        console.log(e);
    }
    getAnalyticLogListItem();
}

function InsertUserAnalyListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function InsertClientInfo(userAnalyticId) {
    var list = oGlobalUserAnalyConfigurations.currentContext.get_web().get_lists().getByTitle('BrowserDataInfo');
    var itemCreateInfo = new SP.ListItemCreationInformation();
    var oListItemNew = list.addItem(itemCreateInfo);
    oListItemNew.set_item('UserAnalyticId', userAnalyticId);
    oListItemNew.set_item('BrowserCodeName', navigator.appCodeName);
    oListItemNew.set_item('BrowserName', navigator.appName);
    oListItemNew.set_item('BrowserVersion', navigator.appVersion);
    oListItemNew.set_item('BrowserPlatform', navigator.platform);
    oListItemNew.set_item('BrowserProduct', navigator.product);
    oListItemNew.set_item('BrowserUserAgent', navigator.userAgent);
    oListItemNew.set_item('BrowserVendor', navigator.vendor);
    oListItemNew.set_item('UserIp', oClientData[0].IP == undefined ? "" : oClientData[0].IP);
    oListItemNew.set_item('UserCountry', oClientData[0].ClientCountryCode == undefined ? "" : oClientData[0].ClientCountryCode);
    oListItemNew.set_item('UserState', oClientData[0].ClientRegion == undefined ? "" : oClientData[0].ClientRegion);
    oListItemNew.set_item('UserCity', oClientData[0].ClientCity == undefined ? "" : oClientData[0].ClientCity);
    oListItemNew.set_item('UserTimeZone', oClientData[0].ClientTimeZone == undefined ? "" : oClientData[0].ClientTimeZone);
    oListItemNew.set_item('UserZipCode', oClientData[0].ClientZipcode == undefined ? "" : oClientData[0].ClientZipcode);
    oListItemNew.update();
    oGlobalUserAnalyConfigurations.currentContext.load(oListItemNew);
    oGlobalUserAnalyConfigurations.currentContext.executeQueryAsync(
        function () {
            console.log('client browser info saved.');

        },
        function (sender, args) {
            console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
        }
    );
}



// Insert Log  On Log List

function InsertLogUserAnalyticList(userLastUpdatedDate) {
    try {
        //Get Domain
        domain = getdomainnameuseranalytic();

        //GetDomainEnd
        oGlobalLogConfigurations.qListcnt = oGlobalLogConfigurations.currentContext.get_web().get_lists().getByTitle('Log');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalLogConfigurations.currentContext.get_url();
        this.oListItem = oGlobalLogConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('Type', "User Analytics");
        oListItem.set_item('ProductId', oAdConfigurations.objProductIds[_spPageContextInfo.webTitle]);
        oListItem.set_item('Domain', domain);
        oListItem.set_item('Created', userLastUpdatedDate);
        oListItem.update();
        oGlobalLogConfigurations.currentContext.load(oListItem);
        oGlobalLogConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertLogUserAnalyticListSucceeded), Function.createDelegate(this, this.InsertLogUserAnalyticListFailed));

    }
    catch (e)
    { }
}

function InsertLogUserAnalyticListSucceeded() {

}

function InsertLogUserAnalyticListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

//Check Log List For Any Transfer Date 

function getAnalyticLogListItem() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();
        domain = getdomainnameuseranalytic();

        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + "User Analytics" + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );
        this.collListItem2 = oList.getItems(camlQuery);
        clientContext.load(collListItem2);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getAnalyticLogListItemFailed));

    }
    catch (e)
    { }
}

function getAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem2.getEnumerator();
        var oListItem = '';
        var createdDatetime = '';

        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();

        }
        if (oListItem) {

            var lgupdate = "Update";
            getLastTrasferDate(lgupdate);
        }
        else {
            getUserAnalyticListItemDefault();
        }
    }
    catch (e)
    { }

}

function getAnalyticLogListItemFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

// Get Last Transfer Date

function getLastTrasferDate(userLgtype) {
    try {
        var dfdUl = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        domain = getdomainnameuseranalytic();

        $.ajax({
            url: oGlobalUserAnalyConfigurations.remoteAzURL + "/api/Log/GetLastTransferDate/" + "?analyticName=" + analyticName + "&domainName=" + domain,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (data) {
                    var jsonDate = data;
                    if (userLgtype == "Update") {
                        getUserAnalyticListItem(jsonDate);
                    }
                    if (userLgtype == "Insert") {
                        InsertLogUserAnalyticList(jsonDate);
                    }
                    if (userLgtype == "Blank") {
                        lastTransferDate = jsonDate;
                        getLogListItemId();
                    }
                }
                console.log(xhr);
                dfdUl.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
                //return dfdUl.promise();
            }
        });
    }
    catch (e)
    { }

}

// Get User Analytic List Item Start On The Base Of Last Updated Date 

function getUserAnalyticListItem(userLastupdatedDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('User Analytics');
        var camlQuery = new SP.CamlQuery();

        var query = "<View><Query><Where><Gt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='True' StorageTZ='TRUE'>" + userLastupdatedDate + "</Value></Gt></Where></Query></View>";
        camlQuery.set_viewXml(query);
        this.collListItemIn = oList.getItems(camlQuery);
        clientContext.load(collListItemIn);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getUserAnalyticListItemSucceeded), Function.createDelegate(this, this.getUserAnalyticListItemFailed));
    }
    catch (e)
    { }
}

function getUserAnalyticListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemIn.getEnumerator();
        var createdDatetime = '';
        lstUserAnalyticClientData = [];
        while (listItemEnumerator.moveNext()) {
            var lstUserAnalyics = {
                Domain: "",
                CreatedBy: "",
                ProductId: "",
                CreatedDate: "",
                appCodeName: navigator.appCodeName,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                platform: navigator.platform,
                product: navigator.product,
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                ip: oClientData[0].IP == undefined ? "" : oClientData[0].IP,
                country: oClientData[0].ClientCountryCode == undefined ? "" : oClientData[0].ClientCountryCode,
                state: oClientData[0].ClientRegionCode == undefined ? "" : oClientData[0].ClientRegionCode,
                city: oClientData[0].ClientCity == undefined ? "" : oClientData[0].ClientCity,
                timeZone: oClientData[0].ClientTimeZone == undefined ? "" : oClientData[0].ClientTimeZone,
                zip: oClientData[0].ClientZipcode == undefined ? "" : oClientData[0].ClientZipcode,
            }
            var oListItem = listItemEnumerator.get_current();
            lstUserAnalyics.Domain = oListItem.get_item('Domain');
            lstUserAnalyics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstUserAnalyics.CreatedDate = oListItem.get_item('Created');;
            lstUserAnalyics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstUserAnalyticClientData.push(lstUserAnalyics);
        }
        var callBackTypeUpdate = "Update";
        SaveUserAnalyticListItem(lstUserAnalyticClientData, callBackTypeUpdate);
    }
    catch (e)
    { }
}

function getUserAnalyticListItemFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}



//Get User Analytic List Item End 
//Save User Analytic List Item Into Database Start

function SaveUserAnalyticListItem(lstUserAnalyticClientData, userCallbacktype) {
    try {
        var dfdSul = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        $.ajax({
            url: oGlobalUserAnalyConfigurations.remoteAzURL + "/api/UserAnalytic/Add",
            type: 'Post',
            dataType: 'text',
            data: JSON.stringify(lstUserAnalyticClientData),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                console.log(xhr);
                if (userCallbacktype == "Insert") {
                    var lgtypeinsert = "Insert";
                    getLastTrasferDate(lgtypeinsert);
                }
                else {
                    var lgTypeBlank = "Blank";
                    getLastTrasferDate(lgTypeBlank);

                }
                dfdSul.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        lstUserAnalyticClientData = [];
        return dfdSul.promise();
    }
    catch (e) {
        console.log(e);
    }
}

//Get All List Item On The Case Of  Not Any Transfer 

function getUserAnalyticListItemDefault() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('User Analytics');
        var camlQuery = new SP.CamlQuery();
        this.collListItemUsrAn = oList.getItems(camlQuery);
        clientContext.load(collListItemUsrAn);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getUserAnalyticListItemDefaultSucceeded), Function.createDelegate(this, this.getUserAnalyticListItemDefaultFailed));
    }
    catch (e)
    { }
}

function getUserAnalyticListItemDefaultSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemUsrAn.getEnumerator();
        var createdDatetime = '';
        lstUserAnalyticClientData = [];
        lstUserAnalyticClientData.length = 0;
        while (listItemEnumerator.moveNext()) {
            var lstUserAnalyics = {
                Domain: "",
                CreatedBy: "",
                ProductId: "",
                CreatedDate: "",
                appCodeName: navigator.appCodeName,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                platform: navigator.platform,
                product: navigator.product,
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                ip: oClientData[0].IP == undefined ? "" : oClientData[0].IP,
                country: oClientData[0].ClientCountryCode == undefined ? "" : oClientData[0].ClientCountryCode,
                state: oClientData[0].ClientRegionCode == undefined ? "" : oClientData[0].ClientRegionCode,
                city: oClientData[0].ClientCity == undefined ? "" : oClientData[0].ClientCity,
                timeZone: oClientData[0].ClientTimeZone == undefined ? "" : oClientData[0].ClientTimeZone,
                zip: oClientData[0].ClientZipcode == undefined ? "" : oClientData[0].ClientZipcode,
            }
            var oListItem = listItemEnumerator.get_current();
            lstUserAnalyics.Domain = oListItem.get_item('Domain');
            lstUserAnalyics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstUserAnalyics.CreatedDate = oListItem.get_item('Created');;
            lstUserAnalyics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstUserAnalyticClientData.push(lstUserAnalyics);
        }
        var userCallBackType = "Insert";
        SaveUserAnalyticListItem(lstUserAnalyticClientData, userCallBackType);
    }
    catch (e)
    { }

}

function getUserAnalyticListItemDefaultFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

//Get All List Item On The Case Of  Not Any Transfer  End 

//Get Log Item Id For Update 

function getLogListItemId() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();
        domain = getdomainnameuseranalytic();


        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + 'User Analytics' + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );
        this.collListItem = oList.getItems(camlQuery);
        clientContext.load(collListItem);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getLogListItemIdSucceeded), Function.createDelegate(this, this.getLogListItemIdFailed));
    }
    catch (e)
    { }
}

function getLogListItemIdSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem.getEnumerator();
        var createdDatetime = '';
        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();//ID
            userItemId = oListItem.get_item('ID');
        }

        UpdateLogUserAnalyticList(userItemId)
    }
    catch (e)
    { }
}

function getLogListItemIdFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

// Get Log Item Id For Update  End 

//Update Log List

function UpdateLogUserAnalyticList(userItemId) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        this.oListItem = oList.getItemById(userItemId);
        oListItem.set_item("Created", lastTransferDate);
        oListItem.update();
        clientContext.load(oListItem);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.UpdateLogUserAnalyticListSucceeded), Function.createDelegate(this, this.UpdateLogUserAnalyticListFailed));
    }
    catch (e)
    { }
}

function UpdateLogUserAnalyticListSucceeded() {

}

function UpdateLogUserAnalyticListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}
function GetUserDetails() {
    var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUserInfoList/items?$filter=(ID eq '" + _spPageContextInfo.userId + "')"
    BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetUserDetailsSucess, this._onRestCallFailure);
}
function _onGetUserDetailsSucess(data) {
    if (data.d.results.length > 0) {
        oGlobalUserAnalyConfigurations.Phone = data.d.results.MobilePhone;
    }
}
function _onRestCallFailure(data) {
    console.log(data)
}
function getdomainnameuseranalytic() {
    try {
        hosturl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        spHostUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
        if (spHostUrl != 'undefined') {
            domain = extractDomain(spHostUrl);
            //domain = domain.split(".").join("_");
            // alert(domain);
        }
        else {
            domain = extractDomain(hosturl);
            domain = domain.split(".").join("_");
            var strRemovePart = domain.split("_");
            var strToRemove = strRemovePart[0].split("-");
            var finalStrToRemove = strToRemove[1];
            domain = domain.replace("-" + finalStrToRemove, "");
            domain = domain.split("_").join(".");
        }
        return domain;
    }
    catch (e)
    { }
}
