
/*

Page Analytic is to capture Page information from app for this first capture Page Information
and insert Into page analytic sharepoint list and then cheq log list If it is first transfer  then save
all data of Search  analytic into database and insert into log list with last transfer date and if it is not 
first transfer then get last transfer date from database and insert all data grater from last transfer date
into database and update last transfer datetime on log list 

*/
var analyticNamePage = "Page Analytics";
var oGlobalPageAnalyConfigurations = {
    ListName: "Page Analytics",
    pageurl: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
};
var oAdConfigurations = {
    objProductIds: {
        "Employee Onboarding": "1D56418B-35FB-4BF6-92BB-22B9D1A518AC",
    }
};
var oGlobalLogPageAnalyticConfigurations = {

    ListName: "Log",
    type: "",
    productId: "",
    domain: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
   // remoteAzURL :"http://localhost:51576/",
    remoteAzURL: "https://analyticsstage.azurewebsites.net/",
   _afterPageAnalyticsSaveCallBack:null
};

var lstPageAnalyticClientData = [];
var lstAnalyticLogClientData = [];
var logType = "Page Analytics";
var lastTransferDate = '';
var hosturl = '';

//Stage
//var remoteAzURL = "http://analyticsstage.azurewebsites.net/";

//Production
//var remoteAzURL = "https://beyondintranetdataanalytics.azurewebsites.net";

window.addEventListener('load', function () {
    try {
        if (oGlobalConfigurations.currentContext != "") {
            oGlobalPageAnalyConfigurations.currentContext = oGlobalConfigurations.currentContext;
            oGlobalLogPageAnalyticConfigurations.currentContext = oGlobalConfigurations.currentContext;
        }
        else {
            oGlobalPageAnalyConfigurations.currentContext = new SP.ClientContext.get_current();
            oGlobalLogPageAnalyticConfigurations.currentContext = new SP.ClientContext.get_current();
        }
    }
    catch (e) {
        oGlobalPageAnalyConfigurations.currentContext = new SP.ClientContext.get_current();
        oGlobalLogPageAnalyticConfigurations.currentContext = new SP.ClientContext.get_current();
    }
    getUserInfoPageAnaly();

}, false);

function getUserInfoPageAnaly() {
    try {
        oGlobalPageAnalyConfigurations.currentweb = oGlobalPageAnalyConfigurations.currentContext.get_web();
        currentUser = oGlobalPageAnalyConfigurations.currentweb.get_currentUser();
        oGlobalPageAnalyConfigurations.currentContext.load(currentUser);
        oGlobalPageAnalyConfigurations.currentContext.executeQueryAsync(getUserInfoPageAnalySuccess, getUserInfoPageAnalyFail);
    }
    catch (e)
    { }
}

function getUserInfoPageAnalySuccess(sender, args) {
    try {
        var pathname = window.location.pathname;
        oGlobalPageAnalyConfigurations.pageurl = pathname;
       InsertPageAnalyList();
       // checkPageInsertedOrNot();
    }
    catch (e)
    { }
}
function checkPageInsertedOrNot() {
    try {
     
        var context = oGlobalLogPageAnalyticConfigurations.currentContext;
        var oList = context.get_web().get_lists().getByTitle('Page Analytics');
        var camlQuery = new SP.CamlQuery();
        var qq = "<View>/"
            + "<Query>/"
            + "<Where><And><Eq><FieldRef Name='Author' LookupId='True' /><Value Type='Integer'>" + _spPageContextInfo.userId + "</Value></Eq>/ <Eq> <FieldRef Name='PageUrl' /><Value Type='Text'>" + oGlobalPageAnalyConfigurations.pageurl + "</Value> </Eq > </And>"
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
                var temp = dataSet.toString().includes(dateTodayS);
               // var temp = dataSet.toString().indexOf(dateTodayS) != -1 ? true : false;
                //if (!temp) {
                //    InsertPageAnalyList();
                //}
              
                if (dataSet!= dateTodayS) {
                    InsertPageAnalyList();
                }
            },
            function (sender, args) {
                console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
            });
    }
    catch (e) { }
}
function getUserInfoPageAnalyFail(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

function InsertPageAnalyList() {
    try {
        var accessUser = "";
        oGlobalPageAnalyConfigurations.qListcnt = oGlobalPageAnalyConfigurations.currentContext.get_web().get_lists().getByTitle('Page Analytics');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalPageAnalyConfigurations.currentContext.get_url();
        this.oListItem = oGlobalPageAnalyConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('PageUrl', oGlobalPageAnalyConfigurations.pageurl);
        oListItem.update();
        oGlobalPageAnalyConfigurations.currentContext.load(oListItem);
        oGlobalPageAnalyConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertPageAnalyListSucceeded), Function.createDelegate(this, this.InsertPageAnalyListFailed));
    }
    catch (e)
    { }
}

function InsertPageAnalyListSucceeded() {
    getPageAnalyticLogListItem();
}


function InsertPageAnalyListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

// Check Last Transfer Of Page Analytic Exist Or Not

function getPageAnalyticLogListItem() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();
        domain = getdomainnamesphosturl();
        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + "Page Analytics" + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );
        this.collListItem3 = oList.getItems(camlQuery);
        clientContext.load(collListItem3);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getPageAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getPageAnalyticLogListItemFailed));
    }
    catch (e)
    { }
}

function getPageAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem3.getEnumerator();
        var oListItem = '';
        var createdDatetime = '';
        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();
        }
        if (oListItem) {

            var lgupdate = "Update";
            getLastTrasferDatePageAnalytic(lgupdate);
        }
        else {

            getPageAnalyticListItemDefault();
        }
    }
    catch (e)
    { }
}

function getPageAnalyticLogListItemFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}


// Get All List Item On the  Case Of  First Transfer 

function getPageAnalyticListItemDefault() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Page Analytics');
        var camlQuery = new SP.CamlQuery();
        this.collListItem = oList.getItems(camlQuery);
        clientContext.load(collListItem);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getPageAnalyticListItemDefaultSucceeded), Function.createDelegate(this, this.getPageAnalyticListItemDefaultFailed));
    }
    catch (e)
    { }
}

function getPageAnalyticListItemDefaultSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem.getEnumerator();
        var createdDatetime = '';
        hosturl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        domain = getdomainnamesphosturl();
        lstPageAnalyticClientData = [];
        lstPageAnalyticClientData.length = 0;
        while (listItemEnumerator.moveNext()) {
            var lstPageAnalytics = { PageUrl: "", CreatedBy: "", ModifiedBy: "", ProductId: "", CreatedDate: "", Domain: ""}
            var oListItem = listItemEnumerator.get_current();
            lstPageAnalytics.PageUrl = oListItem.get_item('PageUrl');
            lstPageAnalytics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstPageAnalytics.ModifiedBy = oListItem.get_item('Editor').get_lookupValue();
            lstPageAnalytics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstPageAnalytics.CreatedDate = oListItem.get_item('Created');
            lstPageAnalytics.Domain = domain;
            lstPageAnalyticClientData.push(lstPageAnalytics);
        }
        var pageCallBackType = "Insert";
        SavePageAnalyticListItem(lstPageAnalyticClientData, pageCallBackType);
    }
    catch (e) {
        console.log(e);
    }
}

function getPageAnalyticListItemDefaultFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}


function InsertLogPageAnalyticList(pageLastUpdatedDate) {
    try {
        //Get Domain
        domain = getdomainnamesphosturl();
        //GetDomainEnd

        oGlobalLogPageAnalyticConfigurations.qListcnt = oGlobalLogPageAnalyticConfigurations.currentContext.get_web().get_lists().getByTitle('Log');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalLogPageAnalyticConfigurations.currentContext.get_url();
        this.oListItem = oGlobalLogPageAnalyticConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('Type', "Page Analytics");
        oListItem.set_item('ProductId', oAdConfigurations.objProductIds[_spPageContextInfo.webTitle]);
        oListItem.set_item('Domain', domain);
        oListItem.set_item('Created', pageLastUpdatedDate);

        oListItem.update();
        oGlobalLogPageAnalyticConfigurations.currentContext.load(oListItem);
        oGlobalLogPageAnalyticConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertLogPageAnalyticListSucceeded), Function.createDelegate(this, this.InsertLogPageAnalyticListFailed));
    }
    catch (e)
    { }
}

function InsertLogPageAnalyticListSucceeded() {

}


function InsertLogPageAnalyticListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function getLastTrasferDatePageAnalytic(pageLgtype) {
    try {
       
        var dfdPl = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        domain = getdomainnamesphosturl();
        $.ajax({
            url: oGlobalLogPageAnalyticConfigurations.remoteAzURL + "/api/Log/GetLastTransferDate/" + "?analyticName=" + analyticNamePage + "&domainName=" + domain,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (data) {
                    var jsonDate = data;
                    if (pageLgtype == "Update") {
                        getPageAnalyticListItem(jsonDate);
                    }
                    if (pageLgtype == "Insert") {
                        InsertLogPageAnalyticList(jsonDate);
                    }
                    if (pageLgtype == "Blank") {
                        lastTransferDate = jsonDate;
                        getPageLogListItemId();
                    }

                }
                dfdPl.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {

                console.log(errorThrown);
            }
        });
        return dfdPl.promise();
    }
    catch (e)
    { }
}

function getPageAnalyticListItem(pageLastupdatedDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Page Analytics');
        var camlQuery = new SP.CamlQuery();

        var query = "<View><Query><Where><Gt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='True' StorageTZ='TRUE'>" + pageLastupdatedDate + "</Value></Gt></Where></Query></View>";

        camlQuery.set_viewXml(query);

        this.collListItem1 = oList.getItems(camlQuery);
        clientContext.load(collListItem1);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getPageAnalyticListItemSucceeded), Function.createDelegate(this, this.getPageAnalyticListItemFailed));
    }
    catch (e)
    { }
}

function getPageAnalyticListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem1.getEnumerator();
        var createdDatetime = '';
        domain = getdomainnamesphosturl();
        lstPageAnalyticClientData = [];
        while (listItemEnumerator.moveNext()) {

            var lstPageAnalytics = { PageUrl: "", CreatedBy: "", ModifiedBy: "", ProductId: "", CreatedDate: "", Domain: "" }
            var oListItem = listItemEnumerator.get_current();
            lstPageAnalytics.PageUrl = oListItem.get_item('PageUrl');
            lstPageAnalytics.CreatedBy = oListItem.get_item('Author').get_lookupValue();
            lstPageAnalytics.ModifiedBy = oListItem.get_item('Editor').get_lookupValue();
            lstPageAnalytics.ProductId = oAdConfigurations.objProductIds[_spPageContextInfo.webTitle];
            lstPageAnalytics.CreatedDate = oListItem.get_item('Created');
            lstPageAnalytics.Domain = domain;
            lstPageAnalyticClientData.push(lstPageAnalytics);
        }
        var callBackTypeUpdate = "Update";
        SavePageAnalyticListItem(lstPageAnalyticClientData, callBackTypeUpdate);
    }
    catch (e)
    { }

}

function getPageAnalyticListItemFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

function SavePageAnalyticListItem(lstPageAnalyticClientData, pageCallbacktype) {
    try {
        var dfdSpl = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        $.ajax({
            url: oGlobalLogPageAnalyticConfigurations.remoteAzURL + "/api/PageAnalytic/Add",
            type: 'Post',
            dataType: 'text',
            data: JSON.stringify(lstPageAnalyticClientData),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (pageCallbacktype == "Insert") {
                    var lgtypeinsert = "Insert";
                    getLastTrasferDatePageAnalytic(lgtypeinsert);
                }
                else {
                    var lgTypeBlank = "Blank";
                    getLastTrasferDatePageAnalytic(lgTypeBlank);

                }
                dfdSpl.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        lstPageAnalyticClientData = [];
        return dfdSpl.promise();
    }
    catch (e) {

    }
}


function SavePageLogAnalyticListItem(lstAnalyticLogClientData) {
    try {
        var dfdSpla = $.Deferred();
        //var remoteurl = "https://knowledgemanagement.azurewebsites.net";
        $.ajax({
            url: oGlobalLogPageAnalyticConfigurations.remoteAzURL + "/api/Log/Add",
            type: 'Post',
            dataType: 'json',
            data: JSON.stringify(lstAnalyticLogClientData),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                console.log(xhr);
                dfdSpla.resolve(xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        lstAnalyticLogClientData = [];
        return dfdSpla.promise();
    }
    catch (e)
    { }
}
//Get Log Item Id For Update 


function getPageLogListItemId() {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle('Log');
        var camlQuery = new SP.CamlQuery();
        domain = getdomainnamesphosturl();
        camlQuery.set_viewXml(
            '<View><Query><Where><And><Eq><FieldRef Name=\'Type\'/>' +
            '<Value Type=\'Text\'>' + "Page Analytics" + '</Value></Eq>' + '<Eq><FieldRef Name=\'Domain\'/>' +
            '<Value Type=\'Text\'>' + domain + '</Value></Eq></And>' +
            '</Where></Query></View>'
        );

        this.collListItem2 = oList.getItems(camlQuery);
        clientContext.load(collListItem2);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getPageLogListItemIdSucceeded), Function.createDelegate(this, this.getPageLogListItemIdFailed));
    }
    catch (e)
    { }
}

function getPageLogListItemIdSucceeded(sender, args) {
    try {
        var listItemEnumerator = collListItem2.getEnumerator();
        var createdDatetime = '';
        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();//ID
            pageItemId = oListItem.get_item('ID');
        }

        UpdateLogPageAnalyticList(pageItemId)
    }
    catch (e)
    { }

}

function getPageLogListItemIdFailed(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

// Get Log Item Id For Update  End 

//Update Log List

function UpdateLogPageAnalyticList(pageItemId) {
    try {
        //var clientContext = new SP.ClientContext();
        var oList = oGlobalLogPageAnalyticConfigurations.currentContext.get_web().get_lists().getByTitle('Log');
        this.oListItem = oList.getItemById(pageItemId);
        oListItem.set_item("Created", lastTransferDate);
        oListItem.update();
        oGlobalLogPageAnalyticConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.UpdateLogSearchAnalyticListSucceeded), Function.createDelegate(this, this.UpdateLogSearchAnalyticListFailed));
    }
    catch (e)
    { }
}

function UpdateLogSearchAnalyticListSucceeded() {

}


function UpdateLogSearchAnalyticListFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}
function getdomainnamesphosturl() {
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



