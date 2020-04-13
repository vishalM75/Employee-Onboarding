var AnalyticsRetentionPeriod = 30;

window.addEventListener('load', function () {
    getAnalyticsRetentionPeriod();
}, false);

function getAnalyticsRetentionPeriod() {

    var currentcontext = new SP.ClientContext.get_current();
    var currentweb = currentcontext.get_web();
    var lstConfig = currentweb.get_lists().getByTitle('Settings');

    var camlQuery = new SP.CamlQuery();
    var Query = '<View><Query></Query></View>';
    camlQuery.set_viewXml(Query);
    this.listItems = lstConfig.getItems(camlQuery);
    currentcontext.load(listItems);

    currentcontext.executeQueryAsync(Function.createDelegate(this, this.ExecuteGetConfigurationOnSuccess),
        Function.createDelegate(this, this.ExecuteOnFailure));
}

function ExecuteGetConfigurationOnSuccess(sender, args) {
    var listItemEnumerator = listItems.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        AnalyticsRetentionPeriod = oListItem.get_item('AnalyticsRetentionPeriod');
    }
    getUserAnalyticsLogLastUpdateDate();
    getPageAnalyticsLogLastUpdateDate();
    getExceptionAnalyticsLogLastUpdateDate();
}


//Check Log List For user analytic Transfer Date 
function getUserAnalyticsLogLastUpdateDate() {
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
        this.collistItemUserAnalyticLog = oList.getItems(camlQuery);
        clientContext.load(collistItemUserAnalyticLog);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getUserAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getAnalyticLogListItemFailed));

    }
    catch (e)
    { }
}

function getUserAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collistItemUserAnalyticLog.getEnumerator();
        var oListItem = '';
        var lastUpdateDatetime = '';
        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();
            if (oListItem.get_item("Type")) {
                GetUserAnalyticDateToCleanData(oListItem.get_item("Created"));
            }
        }
    }
    catch (e)
    { }
}

function getDataAnalyticCleanFailed(sender, args) {
    console.log('Failed to get current user' + args.get_message());
}

function GetUserAnalyticDateToCleanData(dataAnalyticLastUpdateDate) {

    var lastUpdateDate = new Date(dataAnalyticLastUpdateDate).toISOString();
    var today = new Date();
    var claenDataUptoDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - AnalyticsRetentionPeriod,
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
        today.getMilliseconds()
    ).toISOString();

    if (lastUpdateDate > claenDataUptoDate)
        CleanUserAnalyticsData(claenDataUptoDate);
    else
        CleanUserAnalyticsData(lastUpdateDate);
}

function CleanUserAnalyticsData(cleanUpDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle("User Analytics");
        var camlQuery = new SP.CamlQuery();
        var query = "<View><Query><Where><Lt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='false' StorageTZ='TRUE'>" + cleanUpDate + "</Value></Lt></Where></Query></View>";
        camlQuery.set_viewXml(query);
        this.collListItemUserCleanData = oList.getItems(camlQuery);
        clientContext.load(collListItemUserCleanData);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.CleanUserAnalyticsDataSucceeded), Function.createDelegate(this, this.getDataAnalyticCleanFailed));
    }
    catch (e)
    { }
}

function CleanUserAnalyticsDataSucceeded(sender, args) {
    try {
        var arlUserCleanItem = [];
        var listItemUserCleanDataEnumerator = collListItemUserCleanData.getEnumerator();
        var oListItemUserCleanData = '';
        while (listItemUserCleanDataEnumerator.moveNext()) {
            oListItemUserCleanData = listItemUserCleanDataEnumerator.get_current();
            arlUserCleanItem.push(oListItemUserCleanData.get_id());
        }
        if (arlUserCleanItem.length != 0) {
            for (var i = 0; i < arlUserCleanItem.length; i++) {
                deleteUserListItem(arlUserCleanItem[i]);
            }
        }
    }
    catch (e)
    { }
}

function deleteUserListItem(ID) {
    try {
        this.itemId = ID;
        var clientContext = new SP.ClientContext.get_current;
        var oList = clientContext.get_web().get_lists().getByTitle("User Analytics");
        this.oListItem = oList.getItemById(itemId);
        oListItem.deleteObject();
        clientContext.executeQueryAsync(function () { console.log("Delete Success"); deleteBrowserDataInfo(ID); }, Function.createDelegate(this, this.onQueryFailedDelete));
    }
    catch (e)
    { }
}

function deleteBrowserDataInfo(ID) {
    try {
        $.ajax({
            type: "GET",
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('BrowserDataInfo')/items?$select=ID&$filter=UserAnalyticId eq " + ID,
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                var sType = data.d.results;
                var clientContext = new SP.ClientContext.get_current;
                var oList = clientContext.get_web().get_lists().getByTitle("BrowserDataInfo");
                for (var i = 0; i < sType.length; i++) {
                    var oListItem = oList.getItemById(sType[i].ID);
                    oListItem.deleteObject();
                    clientContext.executeQueryAsync(function () { console.log("Delete Success"); }, function () { console.log("Delete failed"); });
                }
            },
            error: function (err) {
            }
        });
    }
    catch (e)
    { }
}

//Check Log List For page analytic Transfer Date 
function getPageAnalyticsLogLastUpdateDate() {
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
        this.collistItemPageAnalyticLog = oList.getItems(camlQuery);
        clientContext.load(collistItemPageAnalyticLog);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getPageAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getAnalyticLogListItemFailed));
    }
    catch (e)
    { }
}

function getPageAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collistItemPageAnalyticLog.getEnumerator();
        var oListItem = '';
        var lastUpdateDatetime = '';
        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();
            if (oListItem.get_item("Type")) {
                GetPageAnalyticDateToCleanData(oListItem.get_item("Created"));
            }
        }
    }
    catch (e)
    { }
}

function GetPageAnalyticDateToCleanData(PageAnalyticLastUpdateDate) {
    var lastUpdateDate = new Date(PageAnalyticLastUpdateDate).toISOString();
    var today = new Date();
    var claenDataUptoDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - AnalyticsRetentionPeriod,
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
        today.getMilliseconds()
    ).toISOString();

    if (lastUpdateDate > claenDataUptoDate)
        CleanPageAnalyticsData(claenDataUptoDate);
    else
        CleanPageAnalyticsData(lastUpdateDate);
}

function CleanPageAnalyticsData(cleanUpDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle("Page Analytics");
        var camlQuery = new SP.CamlQuery();
        var query = "<View><Query><Where><Lt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='false' StorageTZ='TRUE'>" + cleanUpDate + "</Value></Lt></Where></Query></View>";
        camlQuery.set_viewXml(query);
        this.collListItemPageCleanData = oList.getItems(camlQuery);
        clientContext.load(collListItemPageCleanData);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.CleanPageAnalyticsDataSucceeded), Function.createDelegate(this, this.getDataAnalyticCleanFailed));
    }
    catch (e)
    { }
}

function CleanPageAnalyticsDataSucceeded(sender, args) {
    try {
        var arlPageCleanItem = [];
        var listItemPageCleanDataEnumerator = collListItemPageCleanData.getEnumerator();
        var oListItemPageCleanData = '';
        while (listItemPageCleanDataEnumerator.moveNext()) {
            oListItemPageCleanData = listItemPageCleanDataEnumerator.get_current();
            arlPageCleanItem.push(oListItemPageCleanData.get_id());
        }
        if (arlPageCleanItem.length != 0) {
            for (var i = 0; i < arlPageCleanItem.length; i++) {
                deletePageListItem(arlPageCleanItem[i]);
            }
        }
    }
    catch (e)
    { }
}

function deletePageListItem(ID) {
    try {
        this.itemId = ID;
        var clientContext = new SP.ClientContext.get_current;
        var oList = clientContext.get_web().get_lists().getByTitle("Page Analytics");
        this.oListItem = oList.getItemById(itemId);
        oListItem.deleteObject();
        clientContext.executeQueryAsync(function () { console.log("Delete Success"); }, Function.createDelegate(this, this.onQueryFailedDelete));
    }
    catch (e)
    { }
}



//Check Log List For Exception analytic Transfer Date 
function getExceptionAnalyticsLogLastUpdateDate() {
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
        this.collistItemExceptionAnalyticLog = oList.getItems(camlQuery);
        clientContext.load(collistItemExceptionAnalyticLog);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.getExceptionAnalyticLogListItemSucceeded), Function.createDelegate(this, this.getAnalyticLogListItemFailed));
    }
    catch (e)
    { }
}

function getExceptionAnalyticLogListItemSucceeded(sender, args) {
    try {
        var listItemEnumerator = collistItemExceptionAnalyticLog.getEnumerator();
        var oListItem = '';
        var lastUpdateDatetime = '';
        while (listItemEnumerator.moveNext()) {
            oListItem = listItemEnumerator.get_current();
            if (oListItem.get_item("Type")) {
                GetExceptionAnalyticDateToCleanData(oListItem.get_item("Created"));
            }
        }
    }
    catch (e)
    { }
}

function GetExceptionAnalyticDateToCleanData(ExceptionAnalyticLastUpdateDate) {
    var lastUpdateDate = new Date(ExceptionAnalyticLastUpdateDate).toISOString();
    var today = new Date();
    var claenDataUptoDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - AnalyticsRetentionPeriod,
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
        today.getMilliseconds()
    ).toISOString();

    if (lastUpdateDate > claenDataUptoDate)
        CleanExceptionAnalyticsData(claenDataUptoDate);
    else
        CleanExceptionAnalyticsData(lastUpdateDate);
}

function CleanExceptionAnalyticsData(cleanUpDate) {
    try {
        var clientContext = new SP.ClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle("User Exception");
        var camlQuery = new SP.CamlQuery();
        var query = "<View><Query><Where><Lt>" +
            "<FieldRef Name='Created'/>" +
            "<Value Type='DateTime' IncludeTimeValue='false' StorageTZ='TRUE'>" + cleanUpDate + "</Value></Lt></Where></Query></View>";
        camlQuery.set_viewXml(query);
        this.collListItemExceptionCleanData = oList.getItems(camlQuery);
        clientContext.load(collListItemExceptionCleanData);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.CleanExceptionAnalyticsDataSucceeded), Function.createDelegate(this, this.getDataAnalyticCleanFailed));
    }
    catch (e)
    { }
}

function CleanExceptionAnalyticsDataSucceeded(sender, args) {
    try {
        var arlExceptionCleanItem = [];
        var listItemExceptionCleanDataEnumerator = collListItemExceptionCleanData.getEnumerator();
        var oListItemExceptionCleanData = '';
        while (listItemExceptionCleanDataEnumerator.moveNext()) {
            oListItemExceptionCleanData = listItemExceptionCleanDataEnumerator.get_current();
            arlExceptionCleanItem.push(oListItemExceptionCleanData.get_id());
        }
        if (arlExceptionCleanItem.length != 0) {
            for (var i = 0; i < arlExceptionCleanItem.length; i++) {
                deleteExceptionListItem(arlExceptionCleanItem[i]);
            }
        }
    }
    catch (e)
    { }
}

function deleteExceptionListItem(ID) {
    try {
        this.itemId = ID;
        var clientContext = new SP.ClientContext.get_current;
        var oList = clientContext.get_web().get_lists().getByTitle("User Exception");
        this.oListItem = oList.getItemById(itemId);
        oListItem.deleteObject();
        clientContext.executeQueryAsync(function () { console.log("Delete Success"); }, Function.createDelegate(this, this.onQueryFailedDelete));
    }
    catch (e)
    { }
}