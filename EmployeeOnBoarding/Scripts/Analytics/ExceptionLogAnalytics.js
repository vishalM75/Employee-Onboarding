
/*

ExceptionLogAnalytic is to  insert data  into database from user exception list 
for this first check log list if it is blank so insert all data from user exception 
list into database and get last transfer  date time from database and insert into
log list if log list is not blank  so get last transfer date from database and get all
data from user exception list those greater from last transfer date time and insert into 
database and get last trasfer date time from database and update log list 

*/
var exception = "";
var analyticNameException = "Exception Analytics";
var lastTransferDate = '';
var oGlobalUserExceptionConfigurations = {
    ListName: "User Exception",
    userexception: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
    remoteAzURL: "https://analyticsstage.azurewebsites.net/"
};

var oGlobalLogExceptionAnalyticConfigurations = {

    ListName: "Log",
    type: "",
    productId: "",
    domain: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
};

var lstExceptionAnalyticClientData = [];
var lstAnalyticLogClientData = [];
var logType = "Exception Analytics";
//Stage
//var remoteAzURL = "http://analyticsstage.azurewebsites.net/";

//Production
//var remoteAzURL = "https://beyondintranetdataanalytics.azurewebsites.net";

window.addEventListener('load', function () {
    oGlobalUserExceptionConfigurations.currentContext = new SP.ClientContext.get_current();
    oGlobalLogExceptionAnalyticConfigurations.currentContext = new SP.ClientContext.get_current();
    getExceptionAnalyticLogListItem();
}, false);

function getExceptionAnalyticLogListItem() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();

        domain = getdomainnameexceptionloganalytic();
        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + "Exception Analytics" + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );
        this.collListItemExAnLog = oList.getItems(camlQuery);
        clientContext.load(collListItemExAnLog);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getExceptionAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getExceptionAnalyticLogListItemFailed));
    }
    catch (e)
    { }
}

function getExceptionAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemExAnLog.getEnumerator();
        var oListItem = '';
        var createdDatetime = '';

        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();

        }
        if (oListItem) {

            var lgupdate = "Update";
            getLastTrasferDateExceptionAnalytic(lgupdate);
        }
        else {

            getExceptionAnalyticListItemDefault();
        }

    }
    catch (e)
    { }
}

function getExceptionAnalyticLogListItemFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}

// Get All List Item On the  Case Of  First Transfer 

function getExceptionAnalyticListItemDefault() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('User Exception');
        var camlQuery = new SP.CamlQuery();
        this.collListItemExAnDef = oList.getItems(camlQuery);
        clientContext.load(collListItemExAnDef);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getExceptionAnalyticListItemDefaultSucceeded), Function.createDelegate(this, this.getExceptionAnalyticListItemDefaultFailed));
    }
    catch (e)
    { }
}

function getExceptionAnalyticListItemDefaultSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemExAnDef.getEnumerator();
        var createdDatetime = '';

        domain = getdomainnameexceptionloganalytic();

        lstExceptionAnalyticClientData = [];
        lstExceptionAnalyticClientData.length = 0;

        while (listItemEnumerator.moveNext()) {
            var lstExceptionAnalytics = { Exception: "", CreatedBy: "", ProductId: "", CreatedDate: "", Domain: "" }
            var oListItem = listItemEnumerator.get_current();
            lstExceptionAnalytics.Exception = oListItem.get_item('Exception');
            lstExceptionAnalytics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstExceptionAnalytics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstExceptionAnalytics.CreatedDate = oListItem.get_item('Created');
            lstExceptionAnalytics.Domain = domain;
            lstExceptionAnalyticClientData.push(lstExceptionAnalytics);
        }

        var exceptionCallBackType = "Insert";

        SaveExceptionAnalyticListItem(lstExceptionAnalyticClientData, exceptionCallBackType);//,event
    }
    catch (e)
    { }


}

function getExceptionAnalyticListItemDefaultFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

function InsertLogExceptionAnalyticList(exceptionLastUpdatedDate) {
    try {
        //Get Domain
        domain = getdomainnameexceptionloganalytic();

        //GetDomainEnd
        oGlobalLogExceptionAnalyticConfigurations.qListcnt = oGlobalLogExceptionAnalyticConfigurations.currentContext.get_web().get_lists().getByTitle('Log');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalUserExceptionConfigurations.currentContext.get_url();
        this.oListItem = oGlobalLogExceptionAnalyticConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('Type', "Exception Analytics");
        oListItem.set_item('ProductId', oAdConfigurations.objProductIds[_spPageContextInfo.webTitle]);
        oListItem.set_item('Domain', domain);
        oListItem.set_item('Created', exceptionLastUpdatedDate);
        oListItem.update();
        oGlobalLogExceptionAnalyticConfigurations.currentContext.load(oListItem);
        oGlobalLogExceptionAnalyticConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertLogExceptionAnalyticListSucceeded), Function.createDelegate(this, this.InsertLogExceptionAnalyticListFailed));
    }
    catch (e)
    { }
}

function InsertLogExceptionAnalyticListSucceeded() {

}

function InsertLogExceptionAnalyticListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
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

function getLastTrasferDateExceptionAnalytic(exceptionLgtype) {
    try {
        var dfdEl = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        domain = getdomainnameexceptionloganalytic();

        $.ajax({
            url: oGlobalUserExceptionConfigurations.remoteAzURL + "/api/Log/GetLastTransferDate/" + "?analyticName=" + analyticNameException + "&domainName=" + domain,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (data) {
                    var jsonDate = data;
                    if (exceptionLgtype == "Update") {

                        getExceptionAnalyticListItem(jsonDate);
                    }
                    if (exceptionLgtype == "Insert") {
                        InsertLogExceptionAnalyticList(jsonDate);
                    }
                    if (exceptionLgtype == "Blank") {
                        lastTransferDate = jsonDate;
                        getExceptionLogListItemId();//event
                    }
                }
                dfdEl.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {

                console.log(errorThrown);
            }
        });
        var retStr = false;
        return dfdEl.promise(retStr);
    }
    catch (e)
    { }
}

function getExceptionAnalyticListItem(exceptionLastupdatedDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('User Exception');
        var camlQuery = new SP.CamlQuery();

        var query = "<View><Query><Where><Gt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='True' StorageTZ='TRUE'>" + exceptionLastupdatedDate + "</Value></Gt></Where></Query></View>";

        camlQuery.set_viewXml(query);
        this.collListItemExAn = oList.getItems(camlQuery);
        clientContext.load(collListItemExAn);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getExceptionAnalyticListItemSucceeded), Function.createDelegate(this, this.getExceptionAnalyticListItemFailed));
    }
    catch (e)
    { }
}

function getExceptionAnalyticListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemExAn.getEnumerator();
        var createdDatetime = '';
        domain = getdomainnameexceptionloganalytic();
        lstExceptionAnalyticClientData = [];
        lstExceptionAnalyticClientData.length = 0;
        while (listItemEnumerator.moveNext()) {
            var lstExceptionAnalytics = { Exception: "", CreatedBy: "", ProductId: "", CreatedDate: "", Domain: "" }

            var oListItem = listItemEnumerator.get_current();
            lstExceptionAnalytics.Exception = oListItem.get_item('Exception');
            lstExceptionAnalytics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstExceptionAnalytics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstExceptionAnalytics.CreatedDate = oListItem.get_item('Created');
            lstExceptionAnalytics.Domain = domain;

            lstExceptionAnalyticClientData.push(lstExceptionAnalytics);
        }

        var callBackTypeUpdate = "Update";
        SaveExceptionAnalyticListItem(lstExceptionAnalyticClientData, callBackTypeUpdate);//, events
    }
    catch (e)
    { }


}

function getExceptionAnalyticListItemFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}

function SaveExceptionAnalyticListItem(lstExceptionAnalyticClientData, exceptionCallBackType) {//,event
    try {
        var dfdSel = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        $.ajax({
            url: oGlobalUserExceptionConfigurations.remoteAzURL + "/api/ExceptionAnalytic/Add",
            type: 'Post',
            dataType: 'text',
            data: JSON.stringify(lstExceptionAnalyticClientData),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (exceptionCallBackType == "Insert") {
                    var lgtypeinsert = "Insert";
                    getLastTrasferDateExceptionAnalytic(lgtypeinsert);//,event
                }
                else {
                    var lgTypeBlank = "Blank";
                    getLastTrasferDateExceptionAnalytic(lgTypeBlank);//,event

                }
                dfdSel.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

        lstExceptionAnalyticClientData = [];
        var retStr = false;
        return dfdSel.promise(retStr);
    }
    catch (e)
    { }
}

//Get Log Item Id For Update 

function getExceptionLogListItemId() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();
        domain = getdomainnameexceptionloganalytic();
        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + "Exception Analytics" + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );

        this.collListItemExLog = oList.getItems(camlQuery);
        clientContext.load(collListItemExLog);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getExceptionLogListItemIdSucceeded), Function.createDelegate(this, this.getExceptionLogListItemIdFailed));
    }
    catch (e)
    { }
}

function getExceptionLogListItemIdSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItemExLog.getEnumerator();
        var createdDatetime = '';
        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();//ID
            exceptionItemId = oListItem.get_item('ID');
        }

        UpdateLogExceptionAnalyticList(exceptionItemId)
    }
    catch (e)
    { }

}

function getExceptionLogListItemIdFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}

// Get Log Item Id For Update  End 

//Update Log List

function UpdateLogExceptionAnalyticList(exceptionItemId) {
    try {
        //var clientContext = new SP.ClientContext();
        var oList = oGlobalLogExceptionAnalyticConfigurations.currentContext.get_web().get_lists().getByTitle('Log');
        this.oListItem = oList.getItemById(exceptionItemId);
        oListItem.set_item("Created", lastTransferDate);
        oListItem.update();
        oGlobalLogExceptionAnalyticConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.UpdateLogExceptionAnalyticListSucceeded), Function.createDelegate(this, this.UpdateLogExceptionAnalyticListFailed));
    }
    catch (e)
    { }
}

function UpdateLogExceptionAnalyticListSucceeded() {

}

function UpdateLogExceptionAnalyticListFailed(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function getdomainnameexceptionloganalytic() {
    try {
        hosturl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        spHostUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));

        if (spHostUrl != 'undefined') {
            domain = extractDomain(spHostUrl);
            //domain = domain.split(".").join("_");
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

function getQueryStringParameter(urlParameterKey) {
    try {
        var params = document.URL.split('?')[1].split('&');
        var strParams = '';
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split('=');
            if (singleParam[0].toLowerCase() == urlParameterKey.toLowerCase()) {
                var param = singleParam[1].replace('#', "");
                return decodeURIComponent(param);
            }
        }
    }
    catch (e)
    { }
}
// Update Log List End


