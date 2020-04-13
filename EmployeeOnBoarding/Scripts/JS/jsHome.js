var collListItemToBeUpdated = "";
var listItemToBeUpdated = "";
var UserModel = "";
$(document).ready(function () {
    getItemsToBeUpdated();
   // GetUser();
    //EOBDataAnalytic.GetDataAnalytics();
});


function GetUser() {
    var tdate = new Date();
    var today = moment(tdate).format("YYYY-MM-DDT00:00:00.000") + "Z"
     var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserAnalytics + "')/items?$filter=Created ge datetime'" + today + "' and AuthorId eq " + _spPageContextInfo.userId;
    BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onUserValueSucess, this._onRestCallFailure);
}

function _onUserValueSucess(data) {
    if (data.d.results.length==0) {
        let ListTypeName = "SP.Data.User_x0020_AnalyticsListItem";
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "Domain": _spPageContextInfo.webDomain,
            "Email": _spPageContextInfo.userEmail
        }
        var RequestMethod = null;
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserAnalytics + "')/items"
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, this._onItemSave, this._onItemSaveFailed)
    }
}

function _onItemSave(data) {
    BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "User saved successfully.")
}

function _onItemSaveFailed(data) {
    console.log(data);
    //BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "")
}
function _onRestCallFailure(data) {
    console.log(data)
}
function getItemsToBeUpdated() // this function called on button click to get ID's
{
    //<Eq>
    //    <FieldRef Name='LastName' />
    //    <Value Type='Text'>Doe</Value>
    //</Eq>
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle('StandardTask');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><And><IsNull><FieldRef Name=\'_AssignedTo\' /></IsNull><Eq><FieldRef Name=\'TaskType1\' /><Value Type=\'Text\'>Standard Task</Value></Eq></And></Where></Query></View>');
    collListItemToBeUpdated = oList.getItems(camlQuery);
    clientContext.load(collListItemToBeUpdated);
    clientContext.executeQueryAsync(getItemsToBeUpdatedSuccess, getItemsToBeUpdatedFailed);
}
function getItemsToBeUpdatedSuccess() {
    ListItemToBeUpdated = collListItemToBeUpdated.getEnumerator();
    updateMultipleListItems();
}
function getItemsToBeUpdatedFailed(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function updateMultipleListItems() // this function called on successfully getting ID's
{
    var itemArray = [];
    var clientContext = SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle('StandardTask');
    var usersLogins = _spPageContextInfo.userId;
    while (ListItemToBeUpdated.moveNext()) {
        var oItem = ListItemToBeUpdated.get_current();
        var oListItem = oList.getItemById(oItem.get_id());
        oListItem.set_item('_AssignedTo', usersLogins);
        oListItem.update();
        itemArray.push(oListItem);
        clientContext.load(itemArray[itemArray.length - 1]);
    }
    clientContext.executeQueryAsync(updateMultipleListItemsSuccess, updateMultipleListItemsFailed);
}
function updateMultipleListItemsSuccess() {
    console.log('Items Updated');
}

function updateMultipleListItemsFailed(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

