var EOBShared = {
    ComboProperties: function (ComboId, LableText, ListName, DefaultValue, OnChangeEvent, FirstValueText, LableClass, ComboClass, ColumnName, SucessCallback, FilterString) {
        try {
            var MyObj = {};
            MyObj.ComboId = ComboId;
            MyObj.LableText = LableText;
            MyObj.ListName = ListName;
            MyObj.DefaultValue = DefaultValue;
            MyObj.OnChangeEvent = OnChangeEvent;
            MyObj.FirstValueText = FirstValueText;
            MyObj.LableClass = LableClass;
            MyObj.ComboClass = ComboClass;
            MyObj.ColumnName = ColumnName;
            MyObj.SucessCallback = SucessCallback;
            MyObj.FilterString = FilterString;
            return MyObj;
        }
        catch (Excep) {
            return null;
        }
    },
    ShowHideFilterIcon: function (ControlsObject, FilterIconId) {

        var isValueFound = false;
        for (var i = 0; i < ControlsObject.length; i++) {
            var ControlValue = null;
            if (ControlsObject[i]["Type"] == "text") {
                ControlValue = $(ControlsObject[i]["ID"]).val()
            }
            else if (ControlsObject[i]["Type"] == "combo") {
                ControlValue = BKJSShared.GetComboSelectedValueAndText(ControlsObject[i]["ID"]);
            }
            else {
                ControlValue = $(ControlsObject[i]["ID"]).prop('checked');
            }
            if ((ControlsObject[i]["Type"] == "combo")) {
                if (ControlValue.Value !== 0 && ControlValue.Text !== "All") {
                    isValueFound = true;
                }
            }
            else {
                if ((BKJSShared.NotNullOrUndefined(ControlValue) == true)) {
                    if (ControlValue !== false) {
                        if (ControlValue !== "" || ControlValue == true) {
                            isValueFound = true;
                            break;
                        }
                    }
                }
            }
        }
        if (isValueFound) {
            $("#" + FilterIconId).addClass("hvr-pulse onsearchiconchange")
        }
        else {
            $("#" + FilterIconId).removeClass("hvr-pulse onsearchiconchange")
        }
    },
    GetRemarkVersions: function (ListName, FieldName, ItemId, ElementId, containeId) {
        try {
            $().SPServices({
                operation: "GetVersionCollection",
                async: false,
                strlistID: ListName,
                strlistItemID: ItemId,
                strFieldName: FieldName,
                completefunc: function (xData, Status) {
                    var data = "";
                    var FieldsData = [];
                    var modal = document.getElementById(containeId);
                    var arrFieldsCollection = []; var arraytempversion = [];
                    $(xData.responseText).find("Version").each(function (i) {
                        if (arrFieldsCollection.indexOf($(this).attr("Fields")) == -1) {
                            var date = $(this).attr("Modified").substr(5, 2) + "/" + $(this).attr("Modified").substr(8, 2) + "/" + $(this).attr("Modified").substr(0, 4);
                            var time = $(this).attr("Modified");
                            var times = new Date(time);
                            var validtime = times.toLocaleTimeString();
                            var tempremartk = $(this).attr(FieldName) + "-" + times.getHours() + ":" + times.getMinutes();

                            if (jQuery.inArray(tempremartk, arraytempversion) == -1) {
                                data = data + "<li><b>" + $(this).attr(FieldName) + "</b><br>By: <b> " + $(this).attr("Editor").split("#")[1] + " </b> Modified: <b>" + date + " " + validtime + "</b></li>";
                                arrFieldsCollection.push($(this).attr(FieldName));
                                arraytempversion.push(tempremartk);
                                FieldsData.push(data);
                            }
                        }
                    });
                    if (data != "") {      
                        modal.style.display = "block";
                        $(ElementId).html(data);
                    }
                    else {
                        
                        modal.style.display = "none";
                    }
                }
            });
        }
        catch (e) { }
    },
    ReturnModalHeightData: function () {
        var VisibleHeight = window.innerHeight;
        var ModalHeightData = {}
        ModalHeightData["Header"] = (VisibleHeight / 100) * 20;
        ModalHeightData["Body"] = (VisibleHeight / 100) * 80;
        ModalHeightData["Footer"] = (VisibleHeight / 100) * 20;
        return ModalHeightData;
    },
    SetModalHeight: function () {
        var ModalHeightData = EOBShared.ReturnModalHeightData();
        $(".modal-body").css("height", ModalHeightData["Body"] + "px")
        $(".modal-body").css("overflow-y", "auto")
    },
    SetTabsTextAndBackGroundColor: function (TabIdArray, CurrentTabId) {
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        for (var i = 0; i < TabIdArray.length; i++) {
            var NotCurrentTab = $("#" + TabIdArray[i]).find("a")
            if (TabIdArray[i] !== CurrentTabId) {
                $(NotCurrentTab).css("background-color", "");
                if (Color == "White") {

                    $(NotCurrentTab).css("color", "");
                    $(NotCurrentTab).css("color", "black");
                }
            }
            else {
                $(NotCurrentTab).css("background-color", ConfigModal.gConfigSettings.ThemeColor);
                $(NotCurrentTab).css("color", Color);
            }
        }
    },
    _onEmployeeItemCallBack: null,
    _EmployeeDataObject: [],
    _EmployeeDataColumnObject: null,
    GetEmployeeData: function (ColumnsObject, CallBackFunction) {

        var ColumnsInternalNamesArray = [];
        EOBShared._EmployeeDataColumnObject = ColumnsObject;
        //for (var i = 0; i < ColumnsObject.length; i++) {
        //    ColumnsInternalNamesArray.push(ColumnsObject[i]["InternalName"]);
        //}
        //EOBShared._EmployeeDataInternalNames = ColumnsInternalNamesArray;
        if (CallBackFunction) {
            EOBShared._onEmployeeItemCallBack = CallBackFunction;
        }
        //if (ColumnsObject) {
        //    ColumnsInternalNamesArray = ColumnsInternalNamesArray.join(',')
        //}
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$select=OData__EmployeeName,DOJ,Process/Title&$expand=Process/Title"

        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBShared._onEmployeeItemsGet, EOBShared._onEmployeeItemsFailure);


    },
    _onEmployeeItemsGet: function (data) {
        EOBShared._EmployeeDataObject = [];
        if (data) {
            if (data.d.results.length > 0) {
                for (var i = 0; i < data.d.results.length; i++) {
                    var EmpData = {}
                   

                    EmpData["OData__EmployeeName"] = data.d.results[i]["OData__EmployeeName"]
                    if (data.d.results[i]["Process"]["Title"] == "Onboarding") {
                        EmpData["DOJ"] = "DOJ" + " - " + moment(data.d.results[i]["DOJ"]).format("MM/DD/YYYY")
                    }
                    else if (data.d.results[i]["Process"]["Title"] == "Offboarding") {
                        EmpData["DOJ"] = "DOR" + " - " + moment(data.d.results[i]["DOJ"]).format("MM/DD/YYYY")
                    }
                    
                    EOBShared._EmployeeDataObject.push(EmpData)
                }
            }
        }
        if (EOBShared._onEmployeeItemCallBack) {
            EOBShared._onEmployeeItemCallBack();
        }
    },
    _onEmployeeItemsFailure: function (data) { console.log(data) },
    sendEmailNotification: function (from, to, body, subject, Process) {
        //Get the relative url of the site
        //Code Changes by Sachin because is "from" parameter content any value then it is not working in onprem 2016
        from = "";
        if (Process == "2")
            from = "Employee.Offboarding"; // shared email address, if not get then addin name dispaly in from text
        else
            from = "Employee.Onboarding"; // shared email address, if not get then addin name dispaly in from text
        var siteurl = _spPageContextInfo.webServerRelativeUrl;
        var urlTemplate = siteurl + "/_api/SP.Utilities.Utility.SendEmail";
        $.ajax({
            contentType: 'application/json',
            url: urlTemplate,
            type: "POST",
            //async: false,
            data: JSON.stringify({
                'properties': {
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    'From': from,
                    'To': {
                        'results': to
                    },
                    'Body': body,
                    'Subject': subject
                }
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: function (data) {
            },
            error: function (err) {
            }
        });

    },
    GetPageData: function (pageName) {
        var tdate = new Date();
        var today = moment(tdate).format("YYYY-MM-DDT00:00:00.000") + "Z"
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.PageAnalytics + "')/items?$filter=Created ge datetime'" + today + "' and PageUrl eq '" + pageName + "'";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onUserValueSucess, this._onRestCallFailure);
    },
    _onUserValueSucess: function (data) {
        if (data.d.results.length == 0) {
            let ListTypeName = "SP.Data.Page_x0020_AnalyticsListItem";
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "PageUrl": _spPageContextInfo.webDomain,
                // "Email": _spPageContextInfo.userEmail
            }
            var RequestMethod = null;
            var Url = ""
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.PageAnalytics + "')/items"
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, this._onItemSave, this._onItemSaveFailed)
        }
    },
    _onItemSave: function (data) {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "User saved successfully.")
    },
    _onItemSaveFailed: function (data) {
        console.log(data);
        //BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "")
    },
    _onRestCallFailure: function (data) {
        console.log(data)

    },
    ReturnUserTaskUserAssociationLevel: function (SPRowData) {
        var isShowCheckBox = {};

        isShowCheckBox["isLevelUser"] = false;
        isShowCheckBox["isDepartmentUser"] = false;
        isShowCheckBox["isNoAdminCurrentUser"] = false;
        if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
            for (var i = 0; i < ConfigModal.gConfigSettings.CurrentUserLevel.length; i++) {
                var LevelName = SPRowData["TaskLevel"]
                if (typeof (LevelName) == "object") {
                    LevelName = SPRowData["TaskLevel"].Title
                }
                var isSameLevel = (ConfigModal.gConfigSettings.CurrentUserLevel[i].Name == LevelName) ? true : false;
                if (isSameLevel) {

                    isShowCheckBox["isLevelUser"] = true;
                    break;
                }
            }
        }

        if (SPRowData["Departments"]) {
            var DepartmentName = SPRowData["Departments"]
            if (typeof (DepartmentName) == "object") {
                DepartmentName = SPRowData["Departments"].OData__DepartmentName;
            }
            for (var k = 0; k < ConfigModal.gConfigSettings.CurrentUserDepartment.length; k++) {
                if (ConfigModal.gConfigSettings.CurrentUserDepartment[k] == DepartmentName) {
                    isShowCheckBox["isDepartmentUser"] = true;
                    break;
                }
            }
        }
        if (!isShowCheckBox["isDepartmentUser"] && !isShowCheckBox["isLevelUser"]) {
            if (SPRowData["AssignedToId"]) {
                if (SPRowData["AssignedToId"].results) {
                    for (var j = 0; j < SPRowData["AssignedToId"].results.length; j++) {
                        if (SPRowData["AssignedToId"].results[j] == _spPageContextInfo.userId) {
                            isShowCheckBox["isNoAdminCurrentUser"] = true;
                            break;
                        }
                    }
                }
            }
        }
        return isShowCheckBox;
    }
};
function ReturnEmployeeTaskStatusProperties() {
    var EOBEmployeeTasksData = {
        EmployeeID: 0,
        AfterCheckCallBack: null,
        EmployeeProcessType: 0,
        StatusNames: {
            1: "Onboarded",
            2: "Offboarded"
        },
        CheckEmployeeTasks: function () {

            //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$filter=((OData__EmployeeIDId/ID eq %27" + EOBEmployeeTasksData.EmployeeID + "%27)%20and%20((Status%20ne%20%27Onboarded%27)%20and%20(Status%20ne%20%27Offboarded%27)%20and%20(Status%20ne%20%27Aborted%27)))"
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$filter=((OData__EmployeeIDId/ID%20eq%20%27" + EOBEmployeeTasksData.EmployeeID + "%27)%20and%20(Status%20ne%20%27Close%27)%20)"
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBEmployeeTasksData._onCheckEmployeeTasksSuccess, EOBEmployeeTasksData._onRestCallFailure);
        },
        UpdateEmployeeStatusToComplete: function () {
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmployeeOnBoard);
            var Status = ""
            for (var i = 0; i < gDashBoardData.Employees.length; i++) {
                if (gDashBoardData.Employees[i].ID == EOBEmployeeTasksData.EmployeeID) {
                    Status = EOBEmployeeTasksData.StatusNames[gDashBoardData.Employees[i].ProcessId]
                    break;
                }
            }

            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__StatusE": Status
            }
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items(" + EOBEmployeeTasksData.EmployeeID + ")"
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.MERGE, EOBEmployeeTasksData._onUpdateEmployeeStatusToCompleteSuccess, EOBEmployeeTasksData._onRestCallFailure);
        },
        UpdateEmployeeStatusToNotComplete: function () {
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmployeeOnBoard);
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__StatusE": "Open"
            }
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items(" + EOBEmployeeTasksData.EmployeeID + ")"
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.MERGE, EOBEmployeeTasksData._onUpdateEmployeeStatusToCompleteSuccess, EOBEmployeeTasksData._onRestCallFailure);
        },
        _onCheckEmployeeTasksSuccess: function (data) {

            if (data) {
                if (data.d.results.length > 0) {
                    EOBEmployeeTasksData.UpdateEmployeeStatusToNotComplete()
                }
                else {
                    EOBEmployeeTasksData.UpdateEmployeeStatusToComplete()
                }
            }
        },
        _onUpdateEmployeeStatusToNotCompleteSuccess: function (data) {
            if (EOBEmployeeTasksData.AfterCheckCallBack) {
                EOBEmployeeTasksData.AfterCheckCallBack();
            }
        },
        _onUpdateEmployeeStatusToCompleteSuccess: function (data) {
            if (EOBEmployeeTasksData.AfterCheckCallBack) {
                EOBEmployeeTasksData.AfterCheckCallBack();
            }
        },
        _onRestCallFailure: function (data) {
            console.log(data)
        }
    }
    return EOBEmployeeTasksData;
}
var EOBEmployeeTasksStatus = {
    EmployeeStatusInstances: {},
    CheckAndUpdateEmployeeStatus: function (EmployeeID, Callback) {
        var isInstanceExist = EOBEmployeeTasksStatus.EmployeeStatusInstances[EmployeeID]
        if (!isInstanceExist) {
            var CurrentEmployeeStatus = ReturnEmployeeTaskStatusProperties()
            CurrentEmployeeStatus.EmployeeID = EmployeeID;
            CurrentEmployeeStatus.AfterCheckCallBack = Callback;
            EOBEmployeeTasksStatus.EmployeeStatusInstances[EmployeeID] = CurrentEmployeeStatus;
        }
        EOBEmployeeTasksStatus.EmployeeStatusInstances[EmployeeID].CheckEmployeeTasks();
    }
};

function ReturnEmployeeDependentTaskStatusProperties() {
    var EOBEmployeeDependentTasksData = {
        CurrentTaskData: null,
        EmployeeID: 0,
        StandardTaskID: 0,
        CurrentStandardTaskDependentObject: null,
        AfterCheckCallBack: null,
        CurrentTaskTotalDependentTasks: 0,
        CurrentTaskDependentTasks: [],
        GetDependentTasksIds: function () {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items(" + EOBEmployeeDependentTasksData.StandardTaskID + ")";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBEmployeeDependentTasksData._onStandardTaskGet, EOBEmployeeDependentTasksData._onStandardTaskGetFailure);
        },
        GetCurrentEmployeeAllTasks: function () {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?&$select=ID%2CAssignedToId%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CTypeOfTask%2COData__IDStandardTask%2FID%2COData__EmployeeID%2F_StatusE%2COData__EmployeeID%2FID%2CDepartments%2F_DepartmentName%2COData__IDCategory%2FCategoryName1%2CTaskLevel%2FTitle%2CAssignedTo%2FTitle%2CStatus&$expand=OData__EmployeeID%2F_EmployeeName%2COData__IDStandardTask%2FID%2COData__EmployeeID%2F_StatusE%2COData__EmployeeID%2FID%2CDepartments%2F_DepartmentName%2COData__IDCategory%2FCategoryName1%2CTaskLevel%2FTitle%2CAssignedTo%2FTitle&$filter=(OData__EmployeeIDId/ID eq '" + EOBEmployeeDependentTasksData.EmployeeID + "') and (IsActive1 ne '1')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EOBEmployeeDependentTasksData._onGetCurrentEmployeeAllTaskSuccess, EOBEmployeeDependentTasksData._GetCurrentEmployeeAllTasksFailure);
        },
        CheckDependentTasks: function () {

            if (EOBEmployeeDependentTasksData.CurrentTaskData.TypeOfTask == "StandardTask" || EOBEmployeeDependentTasksData.CurrentTaskData.TypeOfTask =="Standard Task") {
                EOBEmployeeDependentTasksData.EmployeeID = EOBEmployeeDependentTasksData.CurrentTaskData.OData__EmployeeID.ID;
                EOBEmployeeDependentTasksData.StandardTaskID = EOBEmployeeDependentTasksData.CurrentTaskData.OData__IDStandardTask.ID;
                EOBEmployeeDependentTasksData.GetDependentTasksIds();
            }


        },
        SetCurrentDependentTaskToActive: function (CurrentDependentTask) {
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.ActualTasks);
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "IsActive1": true
            }
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + CurrentDependentTask.ID + ")";
            var RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, EOBEmployeeDependentTasksData._onTaskStatusInActiveUpdate, EOBEmployeeDependentTasksData._onTaskStatusInActiveUpdateFailed)
        },
        _onStandardTaskGet: function (data) {
            EOBEmployeeDependentTasksData.CurrentStandardTaskDependentObject = data.d;
            if (EOBEmployeeDependentTasksData.CurrentStandardTaskDependentObject.DependentTasks) {
                EOBEmployeeDependentTasksData.GetCurrentEmployeeAllTasks();
            }
        },
        _onStandardTaskGetFailure: function (data) {
            console.log(data)
        },
        _onGetCurrentEmployeeAllTaskSuccess: function (data) {
            //EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks = data.d.results
            var StandardTaskObject = JSON.parse(EOBEmployeeDependentTasksData.CurrentStandardTaskDependentObject.DependentTasks)

            for (var i = 0; i < data.d.results.length; i++) {
                for (var k = 0; k < StandardTaskObject.length; k++) {
                    if (StandardTaskObject[k].TaskId == data.d.results[i].OData__IDStandardTask.ID) {
                        EOBEmployeeDependentTasksData.CurrentTaskDependentTasks.push(data.d.results[i]);
                      //EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks = EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks + 1;
                        EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks = EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks + 1;
                    }
                }
            }

            for (var l = 0; l < EOBEmployeeDependentTasksData.CurrentTaskDependentTasks.length;l++) {
                EOBEmployeeDependentTasksData.SetCurrentDependentTaskToActive(EOBEmployeeDependentTasksData.CurrentTaskDependentTasks[l])
            }
        },
        _GetCurrentEmployeeAllTasksFailure: function (data) {
            console.log(data);
        },
        _onTaskStatusInActiveUpdate: function (data) {
            EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks = EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks - 1;
            if (EOBEmployeeDependentTasksData.CurrentTaskTotalDependentTasks == 0) {
                if (EOBEmployeeDependentTasksData.AfterCheckCallBack) {
                    EOBEmployeeDependentTasksData.AfterCheckCallBack()
                }
            }
        },
        _onTaskStatusInActiveUpdateFailed: function (data) {
            console.log(data)
        }
    }
    
    return EOBEmployeeDependentTasksData;
}
var EOBEmployeeDependentTaskStatus = {
    CurrentTaskInstances: {},
    CheckCurrentTaskDependency: function (CurrentTask, Callback) {
        var isInstanceExist = EOBEmployeeDependentTaskStatus.CurrentTaskInstances[CurrentTask.ID]
        if (!isInstanceExist) {
            var CurrentTaskStatus = ReturnEmployeeDependentTaskStatusProperties()
            CurrentTaskStatus.CurrentTaskData = CurrentTask;
            CurrentTaskStatus.AfterCheckCallBack = Callback;
            EOBEmployeeDependentTaskStatus.CurrentTaskInstances[CurrentTask.ID] = CurrentTaskStatus;
        }
        EOBEmployeeDependentTaskStatus.CurrentTaskInstances[CurrentTask.ID].CheckDependentTasks();

        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items(" + CurrentTaskID+")?$select=OData__IDStandardTaskId/ID%2CID%2CProcessId%2CAssignedToId%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus&$expand=OData__IDStandardTaskId/ID%2COData__IDStandardTaskId/DependentTasks%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle&$filter=(TypeOfTask eq 'Standard Task') and (OData__EmployeeID%2FOData__StatusE%20ne%20'Aborted')";//
        //BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetAllOpenTasksSuccess, this._onRestCallFailure);
    }
};