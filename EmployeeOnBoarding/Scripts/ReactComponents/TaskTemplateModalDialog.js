"use strict";
let TaskTemplateDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nTaskTemplateModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
let TaskTemplateDetailTaskIds = [];
let TaskTemplateDetailIds = [];
let LevelTitles = [];
let arrLevelIds = [];
let intItemID = 0;
let strAction = "";
let GridRows = [];
let DataRows = [];
let taskProp = [];
let TaskTemplateTabIds = [];
let oProcessTypeModalComboProps = null;
class TaskTemplateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            TaskTemplateText: this.props.TaskTemplateName,
            ItemId: this.props.ItemId,
            isActive: this.props.isActive,
            AddButtonText: "Save",
            LevelTabs: null,
            LevelIDs: null,
            gridHeader: null,
            ResetButtonText: "Reset"
        };
        TaskTemplateDialogComponenthis = this;
        TaskTemplateDialogComponenthis.SetProcessComboProps();
    }

    componentWillMount() {
        if (TaskTemplateDialogComponenthis.props.isEdit == true) {
            strAction = "Edit";
            TaskTemplateDialogComponenthis.setState({ AddButtonText: "Update" });
            TaskTemplateDialogComponenthis.setState({ ResetButtonText: "Cancel" });
        }
        else {
            strAction = "Add";
        }
    }

    componentDidMount() {
        var modal = document.getElementById("TaskTemplateDialog");
        modal.style.display = "block";
        $("#TaskTemplateHeadingDiv").text(TaskTemplateDialogComponenthis.props.ModalHeading)
        if (strAction == "Edit") {
            TaskTemplateDialogComponenthis.GetTaskDetailsByID();
            TaskTemplateDialogComponenthis.GetTaskTemplateDetailTasks();
        }
        else {
            $("#TaskTemplateTxtBox").val("")
            $("#TaskTemplateActiveChk").prop('checked', true);
            TaskTemplateDialogComponenthis.GetLevels();
        }
        EOBConstants.SetNewThemeColor();

    }

    SetProcessComboProps() {
        try {
            oProcessTypeModalComboProps = new EOBShared.ComboProperties("TemplateMProcessTypeSelect", "Process Type", "lstProcessType", "", TaskTemplateDialogComponenthis._OnChangeProcessType, "", "", "", "Title");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.SetProcessComboProps"); }
    }

    _OnChangeProcessType() {
        TaskTemplateDialogComponenthis.GetLevels();
    }

    GetTaskDetailsByID() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('TaskTemplateMaster')/items?";
        Url += "&$filter=ID eq " + TaskTemplateDialogComponenthis.state.ItemId;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskTemplateDialogComponenthis._OnTaskTemplateByIdSucess, TaskTemplateDialogComponenthis._OnTaskTemplatesByIdFailure);
    }

    _OnTaskTemplateByIdSucess(data) {
        $("#TaskTemplateAddSaveBtn").val("Update");
        $("#TaskTemplateTxtBox").val(data.d.results[0]["OData__TaskTemplateName"]);
        if (data.d.results[0]["ProcessTypeId"]) {
            $("#TemplateMProcessTypeSelect").val(data.d.results[0]["ProcessTypeId"]);
        }
        else { $("#TemplateMProcessTypeSelect").val(1); }
        $('#TemplateMProcessTypeSelect').prop('disabled', true);
        if (data.d.results[0]["IsActive1"] == true) {
            $("#TaskTemplateActiveChk").prop('checked', true);
        }
        else {
            $("#TaskTemplateActiveChk").prop('checked', false);
        }
    }

    _OnTaskTemplatesByIdFailure(data) {
        console.log(data);
    }

    HandleUpdate() {
        TaskTemplateDialogComponenthis.props.HandleDataUpdate();
    }

    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        isEdit = true;
    }

    CloseModal() {
        var modal = document.getElementById("TaskTemplateDialog");
        modal.style.display = "none";
        isEdit = false;
        nTaskTemplateModalCurrentEditItemID = 0;
        TaskTemplateDialogComponenthis.HandleUpdate()
        $("#TaskTemplateAddSaveBtn").val("Save")
        $("#TaskTemplateTxtBox").val("")
        TaskTemplateDialogComponenthis.ResetAllGridRows(false, 'st');
    }

    AddUpdateTaskTemplate() {
        let ProcessObject = BKJSShared.GetComboSelectedValueAndText("#TemplateMProcessTypeSelect");
        if (ProcessObject["Text"] == "") { return }
        BKValidationShared.CheckValidations();
        if (!BKValidationShared.isErrorFree) { return }
        let TaskTemplateNameTB = document.getElementById("TaskTemplateTxtBox").value;
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.TaskTemplateMaster);
        var nCurrentItemId = null;
        if (nTaskTemplateModalCurrentEditItemID > 0) {
            nCurrentItemId = nTaskTemplateModalCurrentEditItemID;
        }
        BKSPShared.SPItems.isValueExistInColumn(TaskTemplateNameTB, "OData__TaskTemplateName", EOBConstants.ListNames.TaskTemplateMaster, nCurrentItemId, TaskTemplateDialogComponenthis.SaveErrorMessage, TaskTemplateDialogComponenthis.SaveData)
    }

    SaveData() {
        let TaskTemplateNameTB = document.getElementById("TaskTemplateTxtBox");
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.TaskTemplateMaster);
        let isActive = $("#TaskTemplateActiveChk").prop('checked');
        let SelectedProcessType = BKJSShared.GetComboSelectedValueAndText("#TemplateMProcessTypeSelect");
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "OData__TaskTemplateName": TaskTemplateTxtBox.value,
            "ProcessTypeId": parseInt(SelectedProcessType.Value),
            "IsActive1": isActive
        }
        var RequestMethod = null;
        var Url = ""
        if (nTaskTemplateModalCurrentEditItemID > 0) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateMaster + "')/Items(" + nTaskTemplateModalCurrentEditItemID + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateMaster + "')/items"
        }
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, TaskTemplateDialogComponenthis._onItemSave, TaskTemplateDialogComponenthis._onItemSaveFailed)
    }

    SaveErrorMessage() {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Template with same name exist, consider changing the name.")
    }

    _onItemSave(data) {
        if (strAction == "Edit") {
            TaskTemplateDialogComponenthis.AddUpdateTaskTemplateDetail(nTaskTemplateModalCurrentEditItemID);
        }
        else {
            TaskTemplateDialogComponenthis.AddUpdateTaskTemplateDetail(data.d["ID"]);
        }
    }

    _onItemSaveFailed(data) {
        console.log(data);
    }

    AddUpdateTaskTemplateDetail(IDTaskTemplate) {
        var array = document.getElementsByTagName("input");
        for (var ii = 0; ii < array.length; ii++) {
            if (array[ii].type == "checkbox") {
                if (array[ii].className == "custom-control-input" && (array[ii].id).substring(0, 2) == "st") {
                    var RowID = array[ii].id.replace("st", "");
                    var Row = $('#' + RowID + "dRow");
                    var TDs = $(Row).find("td");
                    var Div = $(TDs[1]).find("div");
                    var Label = $(Div).find("label");
                    var TaskTitle = $(Label).text();
                    var TaskLevel = $(TDs[4]).html();
                    var DetailId = array[ii].name;
                    if (array[ii].checked == true && DetailId != "") {
                        // UpdateTaskTemplate
                        TaskTemplateDialogComponenthis.fn_AddUpdateTaskTemplateDetail(DetailId, IDTaskTemplate, 1, RowID, TaskLevel, true)
                    }
                    else if (array[ii].checked == false && DetailId != "") {
                        // DeleteTaskTemplate
                        TaskTemplateDialogComponenthis.fn_DeleteTaskDetail(DetailId)
                    }
                    else if (array[ii].checked == true && DetailId == "") {
                        // InsertTaskTemplate
                        TaskTemplateDialogComponenthis.fn_AddUpdateTaskTemplateDetail(DetailId, IDTaskTemplate, 1, RowID, TaskLevel, true)
                    }
                }
            }
        }
        TaskTemplateDialogComponenthis.Reset();
        TaskTemplateDialogComponenthis.CloseModal();
    }

    fn_AddUpdateTaskTemplateDetail(DetailId, _IDTaskTemplate, _IDCategory, _IDStandardTask, Level, IsActive) {
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.TaskTemplateDetail);
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "OData__IDStandardTaskId": _IDStandardTask,
            "OData__IDTaskTemplateId": _IDTaskTemplate,
            "OData__IDCategoryId": _IDCategory,
            "TaskLevelId": Level,
            "OData__IsActive": IsActive
        }
        var RequestMethod = null;
        var Url = ""
        let dId = 0;
        if (DetailId != "") {
            dId = DetailId.split("_")[1];
        }

        if (dId > 0) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/Items(" + dId + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/items"
        }
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, TaskTemplateDialogComponenthis._onItemTaskTemplateDetailSave, TaskTemplateDialogComponenthis._onItemTaskTemplateDetailSaveFailed)
    }

    _onItemTaskTemplateDetailSave() {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Task Template saved successfully.")
    }

    Reset() {
        $("#TaskTemplateTxtBox").val("")
        TaskTemplateDialogComponenthis.ResetAllGridRows(false, 'st');
        TaskTemplateDialogComponenthis.setState({ SaveErrorSuccessNotification: null })
        BKValidationShared.ResetValidation();
        if (strAction == "Edit") {
            TaskTemplateDialogComponenthis.CloseModal();
        }
        $("#TaskTemplateActiveChk").prop('checked', true);
    }

    _onItemTaskTemplateDetailSaveFailed(data) {
        console.log(data);
    }

    fn_DeleteTaskDetail(DetailId) {
        let dId = 0;
        if (DetailId != "") {
            dId = DetailId.split("_")[1];
        }
        let Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/Items(" + dId + ")";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.DELETE, TaskTemplateDialogComponenthis._onItemDeleteSuccess, TaskTemplateDialogComponenthis._onItemDeleteFailed)
    }

    _onItemDeleteSuccess() { }

    _onItemDeleteFailed() { }

    ResetAllGridRows(check, idSubstring) {
        var array = document.getElementsByTagName("input");
        for (var ii = 0; ii < array.length; ii++) {
            if (array[ii].type == "checkbox") {
                if (array[ii].className == "custom-control-input" && (array[ii].id).substring(0, 2) == idSubstring) {
                    array[ii].checked = check;
                }
            }
        }
    }

    ////////////////////////////////////////////////////
    //// Tab main changes --- start
    GetLevels() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/items?$filter=IsActive1 eq 1";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskTemplateDialogComponenthis._FillLevels, TaskTemplateDialogComponenthis._onLevelDataGetFailure)
    }

    _onLevelDataGetFailure(data) {
        console.log("Failed in getting process items.")
    }

    _FillLevels(data) {
        var LevelTabs = [];
        var LevelIDs = [];
        LevelTitles = [];
        TaskTemplateTabIds = [];
        for (var k = 0; k < data.d.results.length; k++) {
            let LevelID = data.d.results[k]["ID"];
            let LevelTitle = data.d.results[k]["Title"];
            let activeClassName = "nav-link";
            let CurrentTabId = ""
            if (data.d.results[k]["Title"]) {
                CurrentTabId = "tab" + data.d.results[k]["Title"]
                CurrentTabId = TaskTemplateDialogComponenthis.replaceAll(CurrentTabId, ' ', '')
            }
            TaskTemplateTabIds.push(CurrentTabId);
            if (k == 0)
                activeClassName = "nav-link active";
            let Option = <li id={CurrentTabId} className="nav-item"><a className={activeClassName} data-toggle="tab" href={"#" + TaskTemplateDialogComponenthis.replaceAll(LevelTitle, ' ', '')}>{LevelTitle}</a></li>;
            LevelTabs.push(Option);
            LevelIDs.push(LevelID);
            LevelTitles.push(LevelTitle);
        }
        TaskTemplateDialogComponenthis.setState({ LevelTabs: LevelTabs }, TaskTemplateDialogComponenthis.SetTabsColor);
        arrLevelIds = LevelIDs;
        TaskTemplateDialogComponenthis.GetTaskGrids();
    }

    SetTabsColor() {
        EOBConstants.SetNewThemeColor()
        $('a[data-toggle="tab"]').on('click', function (e) {
            var target = $(e.target).parent() // activated tab
            var CurrentTabID = target.attr("id")
            if (BKJSShared.NotNullOrUndefined(CurrentTabID)) {
                EOBShared.SetTabsTextAndBackGroundColor(TaskTemplateTabIds, CurrentTabID);
            }
        });
        EOBShared.SetTabsTextAndBackGroundColor(TaskTemplateTabIds, TaskTemplateTabIds[0]);

    }

    GetTaskGrids() {
        let SelectedProcessType = BKJSShared.GetComboSelectedValueAndText("#TemplateMProcessTypeSelect");
        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items";
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items?$select=ID%2COData__TaskName%2CTaskLevelId%2CTaskDepartment%2FOData__DepartmentName%2CTaskDepartment%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
        Url += "&$expand=TaskDepartment%2FOData__DepartmentName%2CTaskDepartment%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
        Url += "&$filter=IsActive1 eq 1 and ProcessTypeId eq " + SelectedProcessType.Value;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskTemplateDialogComponenthis._FillTaskGrids, TaskTemplateDialogComponenthis._onTaskGridFailure)
    }

    _FillTaskGrids(data) {
        let LevelIDs = arrLevelIds;
        let containsLevelIds = [];
        let arrgridheader = [];
        for (var k = 0; k < LevelIDs.length; k++) {
            let LevelID = LevelIDs[k];
            let levelWiseTask = [];
            let checkAllId = "checkAllId" + LevelID;
            let activeClassName = "tab-pane";
            if (k == 0)
                activeClassName = "tab-pane active";
            GridRows = data.d.results;
            var arrTasksByLevelIDS = TaskTemplateDialogComponenthis.FilterTasksByLevelID(LevelID)
            GridRows = arrTasksByLevelIDS;
            TaskTemplateDialogComponenthis.CreateStandardGridRows();
            let levelTitleText = TaskTemplateDialogComponenthis.replaceAll(LevelTitles[k], ' ', '')
            let rowgridheader = <div id={levelTitleText} className={activeClassName}>
                <table className="table table-striped table-bordered mb-0">
                    <thead>
                        <tr>
                            <th className="SwitchTitleColor" width="50%"><label htmlFor={checkAllId}>Name</label>
                            </th>
                            <th className="SwitchTitleColor" width="25%">
                                Category
                                </th>
                            <th className="SwitchTitleColor" width="25%">Department
                                </th>
                        </tr>
                    </thead>
                    <tbody>{DataRows}</tbody>
                </table>
            </div>
            arrgridheader.push(rowgridheader);
        }
        TaskTemplateDialogComponenthis.setState({ gridHeader: arrgridheader }, TaskTemplateDialogComponenthis.SetTabsColor);
    }

    CreateStandardGridRows() {
        DataRows = [];
        for (var k = 0; k < GridRows.length; k++) {
            var Row = [];
            var DataObject = {};
            var nTaskId = GridRows[k]["ID"];
            var GridRow = <td className="d-none">{nTaskId}</td>;
            Row.push(GridRow);

            var FieldValue = GridRows[k]["OData__TaskName"];
            let isTaskSelected = false;
            let isChecked = false;
            if (strAction == "Edit") {
                isTaskSelected = TaskTemplateDialogComponenthis.IsContainsTasks(nTaskId);
                taskProp = isTaskSelected.split("_");
                let dtId = taskProp[1];
                if (taskProp[1] == "0")
                    dtId = "";
                else
                    dtId = "dtId_" + taskProp[1];
                if (taskProp[0] == "true")
                    isChecked = true;
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{""}</label></div></td>
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{FieldValue}</label></div></td>
                }
            }
            else {
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{""}</label></div></td>
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{FieldValue}</label></div></td>
                }
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["OData__IDCategory"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{FieldValue["CategoryName1"]}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["TaskDepartment"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{FieldValue["OData__DepartmentName"]}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["TaskLevelId"]
            let style = {
                display: "none"
            };
            if (FieldValue == null) {
                GridRow = <td style={style}>{""}</td>
            }
            else {
                GridRow = <td style={style}>{FieldValue}</td>
            }
            Row.push(GridRow);
            let DataSingleRow = <tr id={(nTaskId + "dRow")}>{Row}</tr>
            DataRows.push(DataSingleRow);
        }
        if (DataRows.length == 0) {
            DataRows.push("No records found!");
        }
    }

    FilterTasksByLevelID(LevelID) {
        var ListItemsFilterData = GridRows.filter(function (el) {
            return el.TaskLevelId == LevelID
        });
        return ListItemsFilterData;
    }

    _onTaskGridFailure(data) {
        console.log("Failed in getting process items.")
    }

    GetTaskTemplateDetailTasks() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/items?$filter=OData__IDTaskTemplateId eq " + TaskTemplateDialogComponenthis.state.ItemId;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskTemplateDialogComponenthis._GetTaskTemplateDetailTasksSuccess, TaskTemplateDialogComponenthis._GetTaskTemplateDetailTasksFailure)
    }

    _GetTaskTemplateDetailTasksSuccess(data) {
        let Taskid = 0;
        let Detailid = 0;
        TaskTemplateDetailTaskIds = [];
        TaskTemplateDetailIds = [];
        for (var k = 0; k < data.d.results.length; k++) {
            Taskid = data.d.results[k]["OData__IDStandardTaskId"];
            Detailid = data.d.results[k]["ID"];
            TaskTemplateDetailTaskIds.push(Taskid);
            TaskTemplateDetailIds.push(Detailid);
        }
        TaskTemplateDialogComponenthis.GetLevels();
    }

    _GetTaskTemplateDetailTasksFailure() {
        console.log("Failed in getting process items.")
    }

    IsContainsTasks(nTaskId) {
        let isTaskfound = false;
        for (var jj = 0; jj < TaskTemplateDetailTaskIds.length; jj++) {
            if (TaskTemplateDetailTaskIds[jj] == nTaskId) {
                isTaskfound = true;
                return isTaskfound + "_" + TaskTemplateDetailIds[jj];
            }
        }
        return isTaskfound + "_" + "0";
    }

    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    render() {
        return (
            <div >
                <div id="TaskTemplateDialog" className="modalReact pt-2">
                    <div className="modal-contentReact col-lg-6">
                        <div className="row modal-head align-items-center">
                            <div id="TaskTemplateHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{TaskTemplateDialogComponenthis.state.ModalHeadingText}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={TaskTemplateDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12 mb-2">
                                <div className="row section mb-0">
                                    <div className="form-group col-lg-4 col-md-4">
                                        <label>Template Name</label>
                                        <input type="text" id="TaskTemplateTxtBox" className="form-control form-control-sm BKValidateEmptyValue" maxLength="100" aria-describedby="TaskTemplateName" maxlength="225" placeholder="Enter Template name" onKeyUp={BKValidationShared.IndividualValidationMethods.CheckSpecialChar} />
                                    </div>
                                    <div className="form-group col-lg-4 col-md-4">
                                        <ComboMain ComboProperties={oProcessTypeModalComboProps}></ComboMain>
                                    </div>
                                    <div className="form-group col-lg-4 col-md-4">
                                        <label>Active/In-Active</label> <br />
                                        <label className="switch success">
                                            <input type="checkbox" className="success" id="TaskTemplateActiveChk" />
                                            <span className="slider round ChangeSpanBackground"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="row section p-2">
                                    <ul className="tab-menu nav nav-tabs mb-2" role="tablist">
                                        {TaskTemplateDialogComponenthis.state.LevelTabs}
                                    </ul>
                                    <div className="tab-content col-12 p-0 tbl-small">
                                        {TaskTemplateDialogComponenthis.state.gridHeader}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"TaskTemplateAddSaveBtn"} onClick={TaskTemplateDialogComponenthis.AddUpdateTaskTemplate} defaultValue={TaskTemplateDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={TaskTemplateDialogComponenthis.Reset} defaultValue={TaskTemplateDialogComponenthis.state.ResetButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
