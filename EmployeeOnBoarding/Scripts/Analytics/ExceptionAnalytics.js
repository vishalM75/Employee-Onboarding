
/*

Exception Analytic is to capture exception information from app for this first capture Exception information
and insert Into user exception sharepoint list 

*/


//Add exception

var exception = "";
var analyticNameException = "Exception Analytics";
var lastTransferDate = '';
var oGlobalLogConfigurations = {

    ListName: "Log",
    type: "",
    productId: "",
    domain: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
};
var oGlobalUserExceptionConfigurations = {

    ListName: "User Exception",
    userexception: "",
    currentContext: {},
    currentweb: '',
    qListcnt: '',
    sProductId: ""
};
var previousException = '';
var countP = 0;
var errorCountDebug = 0;
window.addEventListener('load', function () {
    oGlobalUserExceptionConfigurations.currentContext = new SP.ClientContext.get_current();
    oGlobalLogConfigurations.currentContext = new SP.ClientContext.get_current();
}, false);

window.onerror = function (msg, url, lineNo, columnNo, error) {
    exception = msg;
    try {
        if (oGlobalConfigurations.currentContext != "") {
            oGlobalUserExceptionConfigurations.currentContext = oGlobalConfigurations.currentContext;
            oGlobalLogExceptionAnalyticConfigurations.currentContext = oGlobalConfigurations.currentContext;
        }
        else {
            oGlobalUserExceptionConfigurations.currentContext = new SP.ClientContext.get_current();
            oGlobalLogExceptionAnalyticConfigurations.currentContext = new SP.ClientContext.get_current();
        }
    }
    catch (e) {
        oGlobalUserExceptionConfigurations.currentContext = new SP.ClientContext.get_current();
        oGlobalLogExceptionAnalyticConfigurations.currentContext = new SP.ClientContext.get_current();
    }
    if (previousException != msg) {
        Insertonuserexceptionlist(exception);
    }
    return false;
};

function getUserInfoExceptionAnaly() {
    try {
        oGlobalUserExceptionConfigurations.currentweb = oGlobalUserExceptionConfigurations.currentContext.get_web();
        currentUser = oGlobalUserExceptionConfigurations.currentweb.get_currentUser();
        oGlobalUserExceptionConfigurations.currentContext.load(currentUser);
        oGlobalUserExceptionConfigurations.currentContext.executeQueryAsync(getUserInfoExceptionAnalySuccess, getUserInfoExceptionAnalyFail);
    }
    catch (e)
    { }
}

function getUserInfoExceptionAnalySuccess(sender, args) {
    try {
        oGlobalUserExceptionConfigurations.userexception = exception;
        Insertonuserexceptionlist();
    }
    catch (e)
    { }
}

function getUserInfoExceptionAnalyFail(sender, args) {

    console.log('Failed to get current user' + args.get_message());
}

function Insertonuserexceptionlist(exceptionDetail) {
    try {
        previousException = exception;
        oGlobalUserExceptionConfigurations.qListcnt = oGlobalUserExceptionConfigurations.currentContext.get_web().get_lists().getByTitle('User Exception');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var relativeWebUrl = oGlobalUserExceptionConfigurations.currentContext.get_url();
        this.oListItem = oGlobalUserExceptionConfigurations.qListcnt.addItem(itemCreateInfo);
        oListItem.set_item('Exception', exceptionDetail);
        oListItem.update();
        oGlobalUserExceptionConfigurations.currentContext.load(oListItem);
        oGlobalUserExceptionConfigurations.currentContext.executeQueryAsync(Function.createDelegate(this, this.InsertonuserexceptionlistSucceeded), Function.createDelegate(this, this.InsertonuserexceptionlistFailed));
    }
    catch (e)
    { }
}

function InsertonuserexceptionlistSucceeded() {


}


function InsertonuserexceptionlistFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}
