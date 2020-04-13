"use strict";
var EOBUpgrade = {
    oListItems: null,
    strCurrentListName: "",
    clientContext: null,
    oWeb: null,
    oList: null,
    HRUsersOrGroups: null,
    ManagerUsersOrGroups: null,
    oConfigurationData: null,
    _AfterCompleteUpgradeCallBack:null,
    InitializeSPObjects: function () {
        EOBUpgrade.clientContext = new SP.ClientContext();
        EOBUpgrade.oWeb = EOBUpgrade.clientContext.get_web();
    },
    GetUpgradeStatus: function (CallBack) {
        try {
            EOBUpgrade._AfterCompleteUpgradeCallBack = CallBack
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserConfig + "')/items?$select=ID%2CKey%2CValue1";
            Url += "&$filter=ID eq 2";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBUpgrade.VerifyUpgradeStatus, EOBUpgrade.OperationFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "GetUpgradeStatus"); }
    },

    VerifyUpgradeStatus: function (data) {
        try {
            if (data) {
                var UpgradeStatus = data.d.results[0].Value1;
                if (UpgradeStatus == 0) {
                    EOBUpgrade.InitializeSPObjects();
                    EOBUpgrade.GetUserPermissions();
                }
                else {
                    if (EOBUpgrade._AfterCompleteUpgradeCallBack) {
                        EOBUpgrade._AfterCompleteUpgradeCallBack();
                    }
                }
            }
            else {
                if (EOBUpgrade._AfterCompleteUpgradeCallBack) {
                    EOBUpgrade._AfterCompleteUpgradeCallBack();
                }
            }
            
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "jUpgrade.VerifyUpgradeStatus"); }
    },
    UpgradeST: function () {
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name=\'TaskLevel\' /></IsNull></Where></Query></View>');
        EOBUpgrade.getListItems(EOBConstants.ListNames.StandardTask, EOBUpgrade.OnSTItemGetSuccess, null, camlQuery);
    },
    OnSTItemGetSuccess: function () {
        try {
            var oEnumerator = EOBUpgrade.oListItems.getEnumerator();
            var itemArray = [];
            while (oEnumerator.moveNext()) {
                var cItem = oEnumerator.get_current();
                var cListItem = EOBUpgrade.oList.getItemById(cItem.get_id());
                var LevelVal = oEnumerator.get_current().get_item('_TaskLevel');
                var DepartmentVal = oEnumerator.get_current().get_item('_TaskLevel');
                console.log(EOBUpgrade.oListItem);
                if (LevelVal == "HR") {
                    cListItem.set_item('TaskLevel', 1);
                }
                if (LevelVal == "Manager") {
                    cListItem.set_item('TaskLevel', 2);
                }
                cListItem.set_item('IsActive1', 1);
                cListItem.set_item('TaskType1', 'Standard Task');
                cListItem.set_item('TaskFlow', 'Parallel');

                cListItem.update();
                itemArray.push(EOBUpgrade.oListItem);
            }
            EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.StandardTaskUpdated, EOBUpgrade.OperationFailed);
        }
        catch (Excep) {
            return null;
        }
    },
    StandardTaskUpdated() {
        EOBUpgrade.UpgradeAT();
    },
    //Migrate Level and department for Actual Tasks list.
    UpgradeAT: function () {
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name=\'TaskLevel\' /></IsNull></Where></Query></View>');
        EOBUpgrade.getListItems(EOBConstants.ListNames.ActualTasks, EOBUpgrade.OnATItemGetSuccess, null, camlQuery);
    },
    OnATItemGetSuccess: function () {
        try {
            var oEnumerator = EOBUpgrade.oListItems.getEnumerator();
            //var itemArray = [];
            while (oEnumerator.moveNext()) {
                var cItem = oEnumerator.get_current();
                var cListItem = EOBUpgrade.oList.getItemById(cItem.get_id());
                var LevelVal = oEnumerator.get_current().get_item('Level');
                var OldDepartment = oEnumerator.get_current().get_item('IDDepartment')
                console.log(EOBUpgrade.oListItem);
                if (LevelVal == "HR") {
                    cListItem.set_item('TaskLevel', 1);
                }
                if (LevelVal == "Manager") {
                    cListItem.set_item('TaskLevel', 2);
                }
                cListItem.set_item('Departments', OldDepartment);
                cListItem.set_item('IsActive1', 1);
                cListItem.set_item('TaskFlow', 'Parallel');

                cListItem.update();
                //itemArray.push(EOBUpgrade.oListItem);
            }
            EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.ActualTasksUpgraded, EOBUpgrade.OperationFailed);
        }
        catch (Excep) {
            return null;
        }
    },
    ActualTasksUpgraded: function () {
        EOBUpgrade.UpgradeTaskTemplates();
    },
    UpgradeTaskTemplates: function () {
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name=\'TaskLevel\' /></IsNull></Where></Query></View>');
        EOBUpgrade.getListItems(EOBConstants.ListNames.TaskTemplateDetail, EOBUpgrade.OnTaskTemplateItemGetSuccess, EOBUpgrade.OperationFailed, camlQuery);
    },
    OnTaskTemplateItemGetSuccess: function () {
        try {
            var oEnumerator = EOBUpgrade.oListItems.getEnumerator();
            //var itemArray = [];
            while (oEnumerator.moveNext()) {
                var cItem = oEnumerator.get_current();
                var cListItem = EOBUpgrade.oList.getItemById(cItem.get_id());
                var LevelVal = oEnumerator.get_current().get_item('Level');
                console.log(EOBUpgrade.oListItem);
                if (LevelVal == "HR") {
                    cListItem.set_item('TaskLevel', 1);
                }
                if (LevelVal == "Manager") {
                    cListItem.set_item('TaskLevel', 2);
                }
                cListItem.set_item('_IsActive', 1);
                cListItem.update();
                //itemArray.push(EOBUpgrade.oListItem);
            }
            EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.TaskTemplateUpgraded, EOBUpgrade.OperationFailed);
        }
        catch (Excep) {
            return null;
        }
    },
    TaskTemplateUpgraded: function () {
        EOBUpgrade.UpdateUpgradeStatus();
    },
    GetUpgradeStatusFailure: function (data) {
        try {
            // Ignore Upgrade check;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "jUpgrade.GetUpgradeStatusFailure"); }
    },

    // For Level permission migration
    GetUserPermissions: function () {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserPermissions + "')/items?$select=Username%2FID%2CType";
            Url += "&$expand=Username%2FID";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBUpgrade.SetHRMManagerPermissions);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "GetUpgradeStatus"); }
    },

    SetHRMManagerPermissions(data) {
        if (data.d.results.length > 0) {
            for (var i = 0; i < data.d.results.length; i++) {
                var Type = data.d.results[i].Type
                if (Type == "HR") {
                    debugger;
                    var HRUserGrp = data.d.results[i].Username.results;
                    EOBUpgrade.HRUsersOrGroups = HRUserGrp;
                }
                else if (Type == "Manager") {
                    EOBUpgrade.ManagerUsersOrGroups = data.d.results[i].Username.results;
                }
            }
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name=\'ResponsibleUsers\' /></IsNull></Where></Query></View>');
            EOBUpgrade.getListItems(EOBConstants.ListNames.Level, EOBUpgrade.SetPermissionsToLevel, null, camlQuery)
        }
        else {
            EOBUpgrade.GetConfigurationData();
        }
        
    },
    SetPermissionsToLevel: function () {
        debugger;
        var oEnumerator = EOBUpgrade.oListItems.getEnumerator();
        var itemArray = [];
        while (oEnumerator.moveNext()) {

            var cItem = oEnumerator.get_current();
            var cListItem = EOBUpgrade.oList.getItemById(cItem.get_id());

            // clientContext.load(itemArray[itemArray.length - 1]);


            var LevelVal = cItem.get_item('Title');
            // var lookupsIds = new Array();
            var levelUser = "";
            debugger;
            if (LevelVal == "HR") {
                for (var i = 0; i < EOBUpgrade.HRUsersOrGroups.length; i++) {
                    // lookupsIds.push(EOBUpgrade.HRUsersOrGroups[i].ID);
                    levelUser = EOBUpgrade.HRUsersOrGroups[i].Title;
                }
            }
            if (LevelVal == "Manager") {
                for (var i = 0; i < EOBUpgrade.ManagerUsersOrGroups.length; i++) {
                    // lookupsIds.push(EOBUpgrade.HRUsersOrGroups[i].ID);
                    levelUser = EOBUpgrade.ManagerUsersOrGroups[i].Title;
                }
            }
            //var lookups = [];
            //for (var ii in lookupsIds) {
            //    var lookupValue = new SP.FieldUsValue();
            //    lookupValue.set_lookupId(lookupsIds[ii]);
            //    lookups.push(lookupValue);
            //}  
            var singleUser = SP.FieldUserValue.fromUser(levelUser);

            cListItem.set_item('ResponsibleUsers', singleUser);
            cListItem.update();
            itemArray.push(cListItem);
        }
        debugger;
        EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.LevelPermissionUpdated, EOBUpgrade.OperationFailed);
    },
    LevelPermissionUpdated: function () {
        EOBUpgrade.GetConfigurationData();
    },
    OperationFailed: function (data) {
        console.log(data);
        alert("Error in upgrading Employee Onboarding, please try refreshing the page or contact Beyond Key support.")
    },

    //Migrate the Configure data into the settings list
    GetConfigurationData: function () {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Configurations + "')/items?$select=ThemeColor%2COnboardTitle%2COffboardTitle";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBUpgrade.SetConfigurationsData);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "GetUpgradeStatus"); }
    },
    SetConfigurationsData: function (data) {
        if (data.d.results.length > 0) {
            EOBUpgrade.oConfigurationData = {};
            for (var i = 0; i < data.d.results.length; i++) {
                EOBUpgrade.oConfigurationData.ThemeColor = data.d.results[i].ThemeColor;
                EOBUpgrade.oConfigurationData.OnboardTitle = data.d.results[i].OnboardTitle;
                EOBUpgrade.oConfigurationData.OffboardTitle = data.d.results[i].OffboardTitle;
            }
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name=\'OnboardTitle\' /></IsNull></Where></Query></View>');
            EOBUpgrade.getListItems(EOBConstants.ListNames.Settings, EOBUpgrade.UpdateConfigurationsToSettings, null, camlQuery)
        }
        else {
            EOBUpgrade.UpgradeST();
        }       
    },
    UpdateConfigurationsToSettings: function () {
        var oEnumerator = EOBUpgrade.oListItems.getEnumerator();
        while (oEnumerator.moveNext()) {
            var cItem = oEnumerator.get_current();
            var cListItem = EOBUpgrade.oList.getItemById(cItem.get_id());
            cListItem.set_item('ThemeColor', EOBUpgrade.oConfigurationData.ThemeColor);
            cListItem.set_item('OnboardTitle', EOBUpgrade.oConfigurationData.OnboardTitle);
            cListItem.set_item('OffboardTitle', EOBUpgrade.oConfigurationData.OffboardTitle);
            cListItem.update();
        }
        EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.SettingsDataUpdated, EOBUpgrade.OperationFailed);
    },
    SettingsDataUpdated: function () {
        EOBUpgrade.UpgradeST();
    },

    //Shared Code
    getListItems: function (ListName, OnItemGetSuccess, OnItemGetfailed, CamlQuery) {
        if (!BKJSShared.NotNullOrUndefined(CamlQuery)) { CamlQuery = SP.CamlQuery.createAllItemsQuery(); }
        if (EOBUpgrade.oWeb == undefined) {
            EOBUpgrade.InitializeSPObjects();
        }
        EOBUpgrade.oList = EOBUpgrade.oWeb.get_lists().getByTitle(ListName);
        EOBUpgrade.oListItems = EOBUpgrade.oList.getItems(CamlQuery);
        EOBUpgrade.clientContext.load(EOBUpgrade.oListItems);
        EOBUpgrade.clientContext.executeQueryAsync(OnItemGetSuccess, OnItemGetfailed);
    },

    UpdateUpgradeStatus: function () {
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.UserConfig);
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "Value1": "1"
        }

        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserConfig + "')/items(2)";

        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.MERGE, EOBUpgrade._onUpgradeDone, EOBUpgrade.OperationFailed)
    },
    _onUpgradeDone: function () {
        if (EOBUpgrade._AfterCompleteUpgradeCallBack) {
            EOBUpgrade._AfterCompleteUpgradeCallBack();
        }
    },
    DataMigrate: {
        STListItemsData: null,
        STList:null,
        RawData: '{"1":[{"_Name":"_TaskName","__text":"Sent offer letter and confirmed acceptance"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"1"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"2":[{"_Name":"_TaskName","__text":"Completed workspace setup"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"3"},{"_Name":"ID","__text":"2"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"3":[{"_Name":"_TaskName","__text":"Completed equipment setup"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"3"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"4":[{"_Name":"_TaskName","__text":"Generated domain account and email ID"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"4"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"5":[{"_Name":"_TaskName","__text":"Updated distribution list"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"5"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"6":[{"_Name":"_TaskName","__text":"Performed other tasks such as business cards order"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"6"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"7":[{"_Name":"_TaskName","__text":"Received previous company work experience letter"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"7"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"8":[{"_Name":"_TaskName","__text":"Welcome letter generated and sent to manager with all details"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"8"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"9":[{"_Name":"_TaskName","__text":"Drug test/background check completed"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"9"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"8"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"10":[{"_Name":"_TaskName","__text":"Employee ID Card (UNICARD) and Secured Device (if applicable) issued"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"10"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"11":[{"_Name":"_TaskName","__text":"Induction/ Orientation (overview about organization culture, dress code, timesheets/leave reports)"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"11"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"12":[{"_Name":"_TaskName","__text":"Set up Meeting with Manager"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"12"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"13":[{"_Name":"_TaskName","__text":"Tour of workspace, department layouts"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"2"},{"_Name":"ID","__text":"13"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"14":[{"_Name":"_TaskName","__text":"G-Drive access request"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"14"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"15":[{"_Name":"_TaskName","__text":"Mobile phone request"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"5"},{"_Name":"ID","__text":"15"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"16":[{"_Name":"_TaskName","__text":"Share company policies"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"16"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"7"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"17":[{"_Name":"_TaskName","__text":"Employment contract signed and submitted"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"17"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"18":[{"_Name":"_TaskName","__text":"I-9 form filled and submitted"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"3"},{"_Name":"ID","__text":"18"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"19":[{"_Name":"_TaskName","__text":"W-4 form duly filled and submitted to Finance team"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"3"},{"_Name":"ID","__text":"19"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"20":[{"_Name":"_TaskName","__text":"Read specific protocols/ procedures"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"20"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"21":[{"_Name":"_TaskName","__text":"Read the Employee benefits policy and attended meeting regarding the same?"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"21"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"22":[{"_Name":"_TaskName","__text":"Read Leaves policy"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"22"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"23":[{"_Name":"_TaskName","__text":"Read the Payroll Practices policy"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"23"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"24":[{"_Name":"_TaskName","__text":"Read the Nondiscrimination in employment policy"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"24"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"25":[{"_Name":"_TaskName","__text":"Read the Death Payments policy"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"25"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"26":[{"_Name":"_TaskName","__text":"Parking Permit form submitted"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"5"},{"_Name":"ID","__text":"26"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"27":[{"_Name":"_TaskName","__text":"Submitted other necessary documents and photographs"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"3"},{"_Name":"ID","__text":"27"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"28":[{"_Name":"_TaskName","__text":"Employee handbook received"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"28"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"29":[{"_Name":"_TaskName","__text":"Gave onboarding experience feedback"},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"29"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"6"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"30":[{"_Name":"_TaskName","__text":"Assign Laptop"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"2"},{"_Name":"ID","__text":"30"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"5"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"31":[{"_Name":"_TaskName","__text":"Assign Computer"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"2"},{"_Name":"ID","__text":"31"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"5"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"32":[{"_Name":"_TaskName","__text":"Assign Phone"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"32"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"5"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"33":[{"_Name":"_TaskName","__text":"Provide Head Phone"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"33"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"5"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"34":[{"_Name":"_TaskName","__text":"SharePoint"},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"34"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"5"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"1"},{"_Name":"TaskType1","__text":"Standard Task"}],"35":[{"_Name":"_TaskName","__text":"Obtain and accept resignation letter."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"35"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"1"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"36":[{"_Name":"_TaskName","__text":"Enter employee departure date in HR system to trigger oﬀboarding checklist and alerts to key departments."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"36"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"1"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"37":[{"_Name":"_TaskName","__text":"Conﬁrm employee appointment with beneﬁts team."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"5"},{"_Name":"ID","__text":"37"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"1"},{"_Name":"TaskDepartment","__text":"3"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"38":[{"_Name":"_TaskName","__text":"Begin processing any outstanding expense reports, petty cash or other expenses."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"38"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"1"},{"_Name":"TaskDepartment","__text":"5"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"39":[{"_Name":"_TaskName","__text":"Begin processing of paid time oﬀ and/or leave balances."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"2"},{"_Name":"ID","__text":"39"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"1"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"40":[{"_Name":"_TaskName","__text":"Remove personal information from company-owned devices."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"40"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"41":[{"_Name":"_TaskName","__text":"Schedule ﬁnal manager/team lunch/happy hour with departing employee."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"41"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"4"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"42":[{"_Name":"_TaskName","__text":"Collaborate with employee on knowledge transfer list of current project status, internal and external contacts and other key information."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"10"},{"_Name":"ID","__text":"42"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"5"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"43":[{"_Name":"_TaskName","__text":"Notify team and appropriate stakeholders of employee departure."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"43"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"44":[{"_Name":"_TaskName","__text":"Employee meeting with HR team to discuss beneﬁts, paid time oﬀ balances, retirement plans and employment veriﬁcation process."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"44"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"45":[{"_Name":"_TaskName","__text":"Return all keys, IDs, credit cards, calling cards, permits and other company property."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"45"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"3"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"46":[{"_Name":"_TaskName","__text":"Return all phones, computing devices and media."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"46"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"4"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"47":[{"_Name":"_TaskName","__text":"Provide reliable contact information (home address, phone, email address) for future correspondence (especially for payroll and W-2)."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"47"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"5"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"48":[{"_Name":"_TaskName","__text":"Conduct exit interviews for feedback either through online survey or in-person meeting."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"48"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"2"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"49":[{"_Name":"_TaskName","__text":"Ask employee to sign agreement conﬁrming removal of company data from personal services and devices."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"49"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"3"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"50":[{"_Name":"_TaskName","__text":"Meet with IT to review scope of employee electronic footprint and property transfer completion."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"50"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"3"},{"_Name":"TaskDepartment","__text":"3"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"51":[{"_Name":"_TaskName","__text":"Remove all personal items from workspace."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"51"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"3"},{"_Name":"TaskDepartment","__text":"4"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"52":[{"_Name":"_TaskName","__text":"Review checklist in offboarding system with employee, verify all tasks completed."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"52"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"3"},{"_Name":"TaskDepartment","__text":"5"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"53":[{"_Name":"_TaskName","__text":"Reminder to send follow-up termination information."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"53"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"4"},{"_Name":"TaskDepartment","__text":"1"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"54":[{"_Name":"_TaskName","__text":"Notify partners."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"54"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"4"},{"_Name":"TaskDepartment","__text":"2"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"55":[{"_Name":"_TaskName","__text":"Cancel memberships (industry), licenses, contracts."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"55"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"4"},{"_Name":"TaskDepartment","__text":"3"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"56":[{"_Name":"_TaskName","__text":"Remove from recurring meeting schedules; update org charts, company contacts, mailbox, nameplate."},{"_Name":"TaskLevel","__text":"2"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"56"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"4"},{"_Name":"TaskDepartment","__text":"4"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}],"57":[{"_Name":"_TaskName","__text":"Review of employee feedback given at exit interview for continuous improvement."},{"_Name":"TaskLevel","__text":"1"},{"_Name":"_ResolutionDays","__text":"1"},{"_Name":"ID","__text":"57"},{"_Name":"IsActive1","__text":"1"},{"_Name":"_IDCategory","__text":"4"},{"_Name":"TaskDepartment","__text":"5"},{"_Name":"ProcessType","__text":"2"},{"_Name":"TaskType1","__text":"Standard Task"}]}',
        ParseSTRawData:null,
        StartMigrationData: function () {
            
            if (EOBUpgrade.oWeb == undefined) {
                EOBUpgrade.InitializeSPObjects();
            }
            var query = SP.CamlQuery.createAllItemsQuery();
            EOBUpgrade.DataMigrate.ParseSTRawData = JSON.parse(EOBUpgrade.DataMigrate.RawData);
            EOBUpgrade.DataMigrate.STList = EOBUpgrade.oWeb.get_lists().getByTitle(EOBConstants.ListNames.StandardTask);
            EOBUpgrade.DataMigrate.STListItemsData = EOBUpgrade.oList.getItems(query);
            EOBUpgrade.clientContext.load(EOBUpgrade.DataMigrate.STListItemsData);
            EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.DataMigrate._onItemGetSuccess, EOBUpgrade.DataMigrate._onItemGetFailure);

        },
        _onItemGetSuccess: function () {
            var oEnumerator = EOBUpgrade.DataMigrate.STListItemsData.getEnumerator();
            while (oEnumerator.moveNext()) {
                var cItem = oEnumerator.get_current();
                var cListItem = EOBUpgrade.DataMigrate.STList.getItemById(cItem.get_id());
                var CurrentSTData = EOBUpgrade.DataMigrate.ParseSTRawData[cItem.get_id()]
                var TaskDepartmentData = new SP.FieldLookupValue();
                TaskDepartment.set_lookupId(CurrentSTData[1]["__text"]);  
                var TaskLevelData = new SP.FieldLookupValue();
                TaskLevelData.set_lookupId(CurrentSTData[6]["__text"]); 
                cListItem.set_item('TaskDepartment', TaskDepartmentData);
                cListItem.set_item('TaskLevel', TaskLevelData);
               // cListItem.set_item('OffboardTitle', EOBUpgrade.oConfigurationData.OffboardTitle);
                cListItem.update();
            }
            EOBUpgrade.clientContext.executeQueryAsync(EOBUpgrade.SettingsDataUpdated, EOBUpgrade.OperationFailed);
        },
        _onItemGetFailure: function () {
            console.log("Failed to get standard task items.")
        }
    }
};
