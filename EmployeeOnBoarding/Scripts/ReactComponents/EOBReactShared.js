class EOBReactShared {
    ProcessTypeFillAction = null;
    GetProcessTypes(ProcessTypeComboCallback) {
        ProcessTypeFillAction = ProcessTypeComboCallback;
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ProcessType + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, FillProcessTypes, OnProceeTypeDataGetFailure);
    }
    OnProceeTypeDataGetFailure(data) {
        console.log(data);
    }
    FillProcessTypes(data) {
        var ProcessTypeOptions = [];
        for (var k = 0; k < data.d.results.length; k++) {
            let Option = <option value={data.d.results[k]["ID"]}> {data.d.results[k]["Title"]}</option>;
        }
        ProcessTypeFillAction(ProcessTypeOptions);
    }
    
}
export default EOBHelper;
