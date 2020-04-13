"use strict";
let StandardTaskModalComponent = null;
let isEdit = false;
let nCurrentItemID = 0;
let nStandardTaskModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
let oGridData = null;
let oDependentTasks = [];
let oSTMProcessTypeComboProps = null;
let oSTMDepartmentComboProps = null;
let oSTMCategoryComboProps = null;
let oSTMLevelComboProps = null;
let oDSTCategoryComboProps = null;
let nTotalRestCalls = 5; // It should be the total of all shared Combo calls + 1
let nCounterSuccess = 0; // It should be increased on each Combo success call + On GetItemById success call.
let ResetCall = false;
let strTaskFilterVal = "";
let strCategoryFilterVal = "";
let blnCyclicDepedency = false;
var StandardTaskModalTabIdArray = ["tabStandardTask", "tabDependent"]
var InActiveMasterHandleData = {
    "CategoryCombo": { "ID": "STCategorySelect", "Value": "", "ValueID": "" },
    "DepartmentCombo": { "ID": "STDepartmentSelect", "Value": "", "ValueID": ""},
    "LevelCombo": { "ID": "STLevelSelect", "Value": "","ValueID":"" }
}
class StandardTaskDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Action: this.props.Action,
            ItemId: this.props.ItemId,
            UpdateData: this.props.HandleDataUpdate,

            AddButtonText: "Save",
            sModalHeadingText: "Add Standard Task",
            GridRows: null,
            RemarkVersionHistory: null,
            rGridRows: null,
            sFilterText: "",
            EnableControls: true,
            SaveErrorSuccessNotification: null,
            ResetOrCancelFunction: null,
            ResetOrCancelButtonText: ""

        };
        $('#loading').show();
        $('#dependent').hide();
        nCounterSuccess = 0;
        StandardTaskModalComponent = this;
        StandardTaskModalComponent.CategoryCombo = React.createRef();
        StandardTaskModalComponent.SetStandardTaskModalComboProps();
        filesToUpload = [];
    }
   
    componentDidMount() {

        try {
            StandardTaskModalComponent.InitializeSettings();
            if (BKJSShared.NotEmptyString(StandardTaskModalComponent.state.ItemId)) {
                StandardTaskModalComponent.setState({ ResetOrCancelButtonText: "Cancel" });
                StandardTaskModalComponent.setState({ ResetOrCancelFunction: StandardTaskModalComponent.CloseModal });
            }
            else {
                StandardTaskModalComponent.setState({ ResetOrCancelButtonText: "Reset" });
                StandardTaskModalComponent.setState({ ResetOrCancelFunction: StandardTaskModalComponent.Reset });
            }
            if (StandardTaskModalComponent.state.ItemId > 0) {
                EOBShared.SetTabsTextAndBackGroundColor(StandardTaskModalTabIdArray, StandardTaskModalTabIdArray[0]);
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.componentDidMount"); }
    }
    InitializeSettings() {
        try {
            //$("#chkTaskFlow").prop("disabled", true);
            if (StandardTaskModalComponent.state.Action == "View") {
                StandardTaskModalComponent.SetControlsState(true);
            }
            else {
                StandardTaskModalComponent.SetControlsState(false);
            }
            if (StandardTaskModalComponent.state.Action != "Add") {
                StandardTaskModalComponent.GetTaskDetailsByID();
            }
            else {
                var modal = document.getElementById("CommentHistory");
                modal.style.display = "none";
                $("#txtResolutionDays").val('0');
            }

            StandardTaskModalComponent.CreateDependentTaskGrid();
            StandardTaskModalComponent.CreateSelectedTaskGrid();
            var modal = document.getElementById("StandardTaskDialog");
            modal.style.display = "block";
            $("#StandardTaskHeadingDiv").text(StandardTaskModalComponent.props.ModalHeading)

            FileUploadInitialize(0, EOBConstants.ListNames.StandardTask,"#files1"); //This method is written in the "FileUploadHelper.js" - You must include that file. 
            // Initiate with basic peoplepicker.
            if (StandardTaskModalComponent.props.ItemId) {
                //GetDataHere
            }
            else {

                StandardTaskModalComponent.CreatePeoplePicker();
            }
            StandardTaskModalComponent.LoadDefaultSettings();
            $('#loading').hide();
            EOBConstants.SetNewThemeColor();
            if (StandardTaskModalComponent.state.Action == "Add") {
                StandardTaskModalComponent.ApplyCategoryFilter();
            }

            StandardTaskModalComponent.EnableDisableDependentTab();
            EOBShared.SetTabsTextAndBackGroundColor(StandardTaskModalTabIdArray, StandardTaskModalTabIdArray[0]);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.InitializeSettings"); }
    }
    _onTabClick(CurrentTabId) {
        try {
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
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._onTabClick"); }
    }
    CreatePeoplePicker() {
        try {
            BKSPPeoplePickerRest.CreatePeoplePicker("userpicker", true, StandardTaskModalComponent._OnAssignedToChange);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CreatePeoplePicker"); }
    }
    _OnAssignedToChange() {
        try {
            StandardTaskModalComponent.EnableDisableDependentTab();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnAssignedToChange"); }
    }
    CheckCyclicDependency(TaskId) {
        try {
            blnCyclicDepedency = false;
            var DependentTasks = [];
            var objTask = BKJSShared.GetObjectByID(TaskId, oGridData);
            DependentTasks = objTask["DependentTasks"];
            if (DependentTasks == undefined || DependentTasks == null) {
                return false;
            }
            var ObjDTasks = JSON.parse(DependentTasks);
            for (var d = 0; d < ObjDTasks.length; d++) {
                if (blnCyclicDepedency) {
                    break;
                }
                var ObjDTask = ObjDTasks[d];
                if (StandardTaskModalComponent.state.ItemId == ObjDTask.TaskId) {
                    blnCyclicDepedency = true;
                    break;
                }
                else {
                    StandardTaskModalComponent.CheckCyclicDependency(ObjDTask.TaskId);
                }
            }
            return blnCyclicDepedency;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnAssignedToChange"); }
    }
    LoadDefaultSettings() {
        try {
            if (StandardTaskModalComponent.state.ItemId > 0) {
                StandardTaskModalComponent.setState({ sModalHeadingText: "Edit Standard Task" });
                StandardTaskModalComponent.setState({ AddButtonText: "Update" });
            }
            else {
                $("#chkStandardTaskActive").prop('checked', true);
                $("#chkMandatoryTask").prop('checked', false);
                StandardTaskModalComponent._OnTaskFlowChange();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnAssignedToChange"); }
    }
    GetTaskDetailsByID(ResetCall) {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('StandardTask')/items?$select=OData__AssignedToId%2CAttachments%2CAttachmentFiles%2CID%2COData__TaskName%2COData__ResolutionDays%2CTaskType1%2CIsActive1%2CMandatoryTaskType%2CTaskFlow%2CRemarks%2CDependentTasks%2CTaskDepartment%2FOData__DepartmentName%2CTaskLevel%2FTitle%2CTaskLevel%2FID%2CTaskDepartment%2FID%2CProcessType%2FTitle%2CProcessType%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
            Url += "&$expand=AttachmentFiles%2CTaskDepartment%2FOData__DepartmentName%2CProcessType%2FTitle%2CTaskLevel%2FTitle%2CTaskLevel%2FID%2CTaskDepartment%2FID%2CProcessType%2FTitle%2CProcessType%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
            Url += "&$filter=ID eq " + StandardTaskModalComponent.state.ItemId;
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, StandardTaskModalComponent._OnRestSuccessCall, StandardTaskModalComponent._OnTasksByIdFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.GetTaskDetailsByID"); }
    }
    FillDefaultValues(data) {
        try {
            if (!data) {
                return;
            }
            FileUploadInitialize(StandardTaskModalComponent.state.ItemId, EOBConstants.ListNames.StandardTask);
            $("#btnStandardTaskAddSave").val("Update");
            $("#txtTaskName").val(data.d.results[0]["OData__TaskName"]);

            if (data.d.results[0]["TaskLevel"].Title != null) {
                $("#STLevelSelect").val(data.d.results[0]["TaskLevel"].ID);
                InActiveMasterHandleData.LevelCombo.Value = data.d.results[0]["TaskLevel"].Title
                InActiveMasterHandleData.LevelCombo.ValueID = data.d.results[0]["TaskLevel"].ID
            }
            if (data.d.results[0]["ProcessType"].Title != null) {
                $("#STProcessTypeSelect").val(data.d.results[0]["ProcessType"].ID);
            }
            var objProcessType = BKJSShared.GetComboSelectedValueAndText();

            if (data.d.results[0]["OData__IDCategory"].CategoryName1 != null) {
                $("#STCategorySelect").val(data.d.results[0]["OData__IDCategory"].ID);
                InActiveMasterHandleData.CategoryCombo.Value = data.d.results[0]["OData__IDCategory"].CategoryName1
                InActiveMasterHandleData.CategoryCombo.ValueID = data.d.results[0]["OData__IDCategory"].ID
            }
            if (data.d.results[0]["TaskDepartment"].OData__DepartmentName != null) {
                $("#STDepartmentSelect").val(data.d.results[0]["TaskDepartment"].ID);
                InActiveMasterHandleData.DepartmentCombo.Value = data.d.results[0]["TaskDepartment"].OData__DepartmentName
                InActiveMasterHandleData.DepartmentCombo.ValueID = data.d.results[0]["TaskDepartment"].ID
            }
            $("#ddlTaskTypeSelect").val(data.d.results[0]["TaskType1"]);
            $("#txtResolutionDays").val(data.d.results[0]["OData__ResolutionDays"]);
            if (data.d.results[0]["IsActive1"] == true) {
                $("#chkStandardTaskActive").prop('checked', true);
            }
            else {
                $("#chkStandardTaskActive").prop('checked', false);
            }
            if (data.d.results[0]["MandatoryTaskType"] == true) {
                $("#chkMandatoryTask").prop('checked', true);
            }
            else {
                $("#chkMandatoryTask").prop('checked', false);
            }
            if (data.d.results[0]["TaskFlow"] == "Dependent") {
                $("#chkTaskFlow").prop('checked', true);
            }
            else {
                $("#chkTaskFlow").prop('checked', false);
            }
            if (BKJSShared.NotEmptyString(data.d.results[0]["DependentTasks"])) {
                oDependentTasks = JSON.parse(data.d.results[0]["DependentTasks"]);
            }
            if (data.d.results[0].AttachmentFiles.results.length > 0) {
               
                LoadExistingFiles(data.d.results[0].AttachmentFiles.results, StandardTaskModalComponent.state.ItemId, EOBConstants.ListNames.StandardTask);
            }
            if (data.d.results[0].OData__AssignedToId) {
                var arrAssignToIDs = data.d.results[0].OData__AssignedToId.results;
                BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrAssignToIDs, "userpicker", true, StandardTaskModalComponent._OnAssignedToChange);
            }
            else {
                StandardTaskModalComponent.CreatePeoplePicker();
            }
            StandardTaskModalComponent._OnTaskFlowChange();
            EOBShared.GetRemarkVersions("StandardTask", "Remarks", StandardTaskModalComponent.state.ItemId, '#ulRemarkVersions', 'CommentHistory');
            StandardTaskModalComponent.EnableDisableDependentTab();
            StandardTaskModalComponent._OnTaskTypeChange();
            StandardTaskModalComponent.CheckActiveInActiveComboStatus()
            //StandardTaskModalComponent.SetStandardTaskModalComboProps();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.FillDefaultValues"); }

    }
    CheckActiveInActiveComboStatus() {
        StandardTaskModalComponent.ApplyCategoryFilter();
        var ComboObject = Object.values(InActiveMasterHandleData)
        for (var i = 0; i < Object.values(InActiveMasterHandleData).length; i++){
            var isFound = false;
            $("#" + ComboObject[i].ID + " > option").each(function () {
                if (this.value == ComboObject[i].ValueID) { isFound = true; }
            });
            if (!isFound) {
                $("#" + ComboObject[i].ID).append('<option value="' + ComboObject[i].ValueID + '">' + ComboObject[i].Value + '</option>');
                $("#" + ComboObject[i].ID).val(ComboObject[i].ValueID)
            }
            else {
                $("#" + ComboObject[i].ID).val(ComboObject[i].ValueID)
            }
        }
        
    }
    _OnRestSuccessCall(data) {
        try {
            if (StandardTaskModalComponent.state.Action != "Add") {
                nCounterSuccess++;
                if (ResetCall) {
                    ResetCall = false;
                    StandardTaskModalComponent.FillDefaultValues(data);
                }
                else {
                    if (nCounterSuccess === nTotalRestCalls) {
                        StandardTaskModalComponent.FillDefaultValues(data);
                    }
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnRestSuccessCall"); }
    }
    _OnTasksByIdFailure(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnTasksByIdFailure"); }
    }
    SetStandardTaskModalComboProps(ItemID) {
        try {
            var ActiveFilterString = "IsActive1 eq '1'";
            oSTMProcessTypeComboProps = new EOBShared.ComboProperties("STProcessTypeSelect", "Process Type", "lstProcessType", "", StandardTaskModalComponent.ApplyCategoryFilter, "", "", "", "Title", StandardTaskModalComponent._OnRestSuccessCall );
            
            oSTMDepartmentComboProps = new EOBShared.ComboProperties("STDepartmentSelect", "Department", "Departmentlst", "", null, "", "", "", "OData__DepartmentName", StandardTaskModalComponent._OnRestSuccessCall, ActiveFilterString);
            oSTMCategoryComboProps = new EOBShared.ComboProperties("STCategorySelect", "Category", "Category", "", null, "", "", "", "CategoryName1", StandardTaskModalComponent._OnRestSuccessCall, ActiveFilterString);
            var strFilterString = "Process1/ID eq '1'";
            oDSTCategoryComboProps = new EOBShared.ComboProperties("dSTCategoryFilter", "", "Category", "", StandardTaskModalComponent.ApplyDepedentTasksFilter, "Select", "d-none", "", "CategoryName1", "", strFilterString, ActiveFilterString);
            oSTMLevelComboProps = new EOBShared.ComboProperties("STLevelSelect", "Level", "Levellst", "", null, "", "", "", "Title", StandardTaskModalComponent._OnRestSuccessCall, ActiveFilterString);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.SetStandardTaskModalComboProps"); }
    }
    ApplyCategoryFilter() {
        try {
            var objProcessCombo = BKJSShared.GetComboSelectedValueAndText("#STProcessTypeSelect")
            var strFilterString = "Process1/ID eq '" + objProcessCombo.Value + "' and (IsActive1 eq '1')";
            StandardTaskModalComponent.CategoryCombo.current.ResetFilter(strFilterString);
           
            var objProcessCombo = BKJSShared.GetComboSelectedValueAndText("#STProcessTypeSelect")
            if (objProcessCombo.Value == 1) {
                $('#ddlTaskTypeSelect').find('option:eq(2)').hide();
            }
            else {
                $('#ddlTaskTypeSelect').find('option:eq(2)').show();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.ApplyCategoryFilter"); }
    }
    HandleUpdate() {
        try {
            StandardTaskModalComponent.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.HandleUpdate"); }
    }
    UpdateEditStatus(ID) {
        try {
            nCurrentItemID = ID;
            StandardTaskModalComponent.setState({ Action: "Edit" });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.UpdateEditStatus"); }
    }
    CloseModal() {
        try {
            var modal = document.getElementById("StandardTaskDialog");
            modal.style.display = "none";
            StandardTaskModalComponent.setState({ Action: "Add" });
            $("#btnStandardTaskAddSave").val("Save");
            nStandardTaskModalCurrentEditItemID = 0;
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
            //BKSPPeoplePicker.ResetFromIdToPeoplePickerData();
            StandardTaskModalComponent.HandleUpdate();
            StandardTaskModalComponent.ClearControls();
            strCategoryFilterVal = "";
            strTaskFilterVal = "";
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CloseModal"); }
    }
    GetDependentTaskJSON() {

    }
    AddUpdateStandardTask() {
        try {
            BKValidationShared.CheckValidations();
            let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
            if (SelectedTaskType.Value != "Standard Task") {
                BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved = true;
                BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
                BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();
            }
            let Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();

            var blnEmptyAssignTo = false;
            var blnEmptyDependentTask = false;
            if ($("#divuserpicker")) {
                $("#divuserpicker").html('');
            }
            if ($("#divDependentTaskMsg")) {
                $("#divDependentTaskMsg").html('');
            }
            if (Responsible["results"].length == 0 && SelectedTaskType.Value == "Standard Task") {
                blnEmptyAssignTo = true;
                $("#userpicker").after("<div  style='color:red;' id='divuserpicker'>Required.</div>");
            }
            let SelectedTaskFlow = "Parallel"; //BKJSShared.GetComboSelectedValueAndText("#ddlTaskFlowSelect");
            if ($("#chkTaskFlow").prop('checked')) {
                SelectedTaskFlow = "Dependent";
            }
            if (SelectedTaskFlow == "Dependent" && oDependentTasks.length == 0) {
                blnEmptyDependentTask = true;
                alert('Please select at least one dependent task or uncheck the Add Dependent Task checkbox!');
                // $("#lblTaskFlow").after("<div  style='color:red;' id='divDependentTaskMsg'>Please select at least one dependent task in the Dependent tab.</div>");
            }
            if (SelectedTaskFlow != "Dependent") {

            }
            if ((!BKValidationShared.isErrorFree) || (blnEmptyAssignTo == true) || (blnEmptyDependentTask == true)) { return }

            if (!BKValidationShared.isErrorFree) {
                $('#StandardTask').tab('show')
                return;
            }
            let StandardTaskNameTB = document.getElementById("txtTaskName");
            let ResolutionDaysTB = document.getElementById("txtResolutionDays");
            let RemarkTB = document.getElementById("txtRemark");

            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.StandardTask);
            let isActive = $("#chkStandardTaskActive").prop('checked');
            let isMandatoryTask = $("#chkMandatoryTask").prop('checked');

            let SelectedCategory = BKJSShared.GetComboSelectedValueAndText("#STCategorySelect");
            let SelectedDepartment = BKJSShared.GetComboSelectedValueAndText("#STDepartmentSelect");
            let SelectedLevel = BKJSShared.GetComboSelectedValueAndText("#STLevelSelect");
            let SelectedProcessType = BKJSShared.GetComboSelectedValueAndText("#STProcessTypeSelect");

            var fileArray = [];
            let strDependentTasks = "";
            if (oDependentTasks != null && SelectedTaskFlow == "Dependent") {
                if (oDependentTasks.length > 0) {
                    strDependentTasks = JSON.stringify(oDependentTasks)
                }
            }
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__TaskName": StandardTaskNameTB.value,
                "OData__ResolutionDays": ResolutionDaysTB.value,
                "OData__IDCategoryId": parseInt(SelectedCategory.Value),
                "TaskDepartmentId": parseInt(SelectedDepartment.Value),
                "TaskLevelId": parseInt(SelectedLevel.Value),
                "IsActive1": isActive,
                "MandatoryTaskType": isMandatoryTask,
                "Remarks": RemarkTB.value,
                "ProcessTypeId": parseInt(SelectedProcessType.Value),
                "TaskFlow": SelectedTaskFlow,
                "TaskType1": SelectedTaskType.Value,
                "OData__AssignedToId": Responsible,
                "DependentTasks": strDependentTasks
                // "Files": fileArray
            }

            var RequestMethod = null;
            var Url = ""
            if (StandardTaskModalComponent.state.ItemId > 0) {

                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/Items(" + StandardTaskModalComponent.state.ItemId + ")";
                RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            }
            else {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items"
            }
            $('#loading').show();
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, StandardTaskModalComponent._onItemSave, StandardTaskModalComponent._onItemSaveFailed)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.AddUpdateStandardTask"); }
    }
    DeleteStandardTask() {

    }

    SetControlsState(isDisable) {
        try {
            $('#txtTaskName').prop('readonly', isDisable);
            $('#txtResolutionDays').prop('readonly', isDisable);
            $('#txtRemark').prop('readonly', isDisable);

            $('#ddlCategorySelect').prop('disabled', isDisable);
            $('#ddlDepartmentSelect').prop('disabled', isDisable);
            $('#ddlLevelSelect').prop('disabled', isDisable);
            $('#ddlProcessTypeSelect').prop('disabled', isDisable);

            // $('#ddlTaskFlowSelect').prop('disabled', isDisable);
            $('#ddlTaskTypeSelect').prop('disabled', isDisable);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.SetControlsState"); }
    }
    SaveErrorMessage() {
        try {
            $('#loading').hide();
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Standard task with the same name already exist, please consider changing the name.");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.SaveErrorMessage"); }
    }
    ClearControls() {
        try {
            $("#txtTaskName").val("")
            $("#txtTaskName").val("");
            $("#ddlCategorySelect").val("Select");
            $("#ddlDepartmentSelect").val("Select");
            $("#ddlLevelSelect").val("Select");
            $("#txtTaskType").val("");
            $("#txtResolutionDays").val("0");
            $("#chkTaskFlow").prop('checked', false);
            $("#files1").children(".fileList").empty();
            for (var i = 0; i < filesToUpload.length; ++i) {
                if (filesToUpload[i].id.indexOf("files1") >= 0)
                    filesToUpload.splice(i, 1);
            }

            oDependentTasks = [];
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.ClearControls"); }

    }
    Reset() {
        try {
            ResetCall = true;
            StandardTaskModalComponent.setState({ SaveErrorSuccessNotification: null })
            if (StandardTaskModalComponent.state.ItemId > 0) {
                StandardTaskModalComponent.GetTaskDetailsByID();
            }
            else {
                StandardTaskModalComponent.ClearControls();
            }
            StandardTaskModalComponent.CreateDependentTaskGrid();
            StandardTaskModalComponent.CreateSelectedTaskGrid();

            $('#StandardTask a[href="#StandardTask"]').tab('show');

            var DependentDiv = document.getElementById('tabDependent');
            DependentDiv.style.display = 'none';

            BKValidationShared.ResetValidation();


            $("#txtRemark").val("");
            $("#STDepartmentSelect").val($("#STDepartmentSelect option:first").val());
            $("#STCategorySelect").val($("#STCategorySelect option:first").val());
            $("#STLevelSelect").val($("#STLevelSelect option:first").val());
            $("#STProcessTypeSelect").val($("#STProcessTypeSelect option:first").val());
            $("#ddlTaskTypeSelect").val($("#ddlTaskTypeSelect option:first").val());
            $("#lblAssignedTo").val("");

            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved = true;
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();
            BKJSShared.ActivateTab('StandardTask');
            StandardTaskModalComponent.EnableDisableDependentTab();
            EOBShared.SetTabsTextAndBackGroundColor(StandardTaskModalTabIdArray, StandardTaskModalTabIdArray[0]);
            $("#chkStandardTaskActive").prop('checked', true);
            $("#chkMandatoryTask").prop('checked', false);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.Reset"); }
    }


    _onItemSave(data) {
        try {
            if (data != undefined) {
                ProcessAttachmentsIfAny(StandardTaskModalComponent.CloseDialogAfterSave, data.d.ID, EOBConstants.ListNames.StandardTask);
                EOBDataAnalytic.standardTaskDataAnalytics();
            }
            else {
                ProcessAttachmentsIfAny(StandardTaskModalComponent.CloseDialogAfterSave, StandardTaskModalComponent.state.ItemId, EOBConstants.ListNames.StandardTask);
               
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._onItemSave"); }
    }
    CloseDialogAfterSave() {
        try {
            $('#loading').hide();
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Standard task saved successfully.")
            StandardTaskModalComponent.ClearControls();
            ResetCall = true;
            StandardTaskModalComponent.setState({ SaveErrorSuccessNotification: null });
            BKValidationShared.ResetValidation();
            StandardTaskModalComponent.CloseModal();
        }

        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CloseDialogAfterSave"); }
    }
    _onItemSaveFailed(data) {
        try {
            $('#loading').hide();
            console.log(data);
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._onItemSaveFailed"); }
    }
    SetFilterStrings() {

    }
    _OnTaskFlowChange() {
        try {
        let ControlValue = $("#chkTaskFlow").prop('checked');
        var DependentDiv = document.getElementById('tabDependent');
        if (ControlValue == true) {
            if (DependentDiv.style.display == 'block') {
                DependentDiv.style.display = 'none';
            }
            else {
                DependentDiv.style.display = 'block';
                let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
                if (Color == "White") {
                    $('#tabDependent').find('a').css("color", "Black");
                }
                else {
                    $('#tabDependent').find('a').css("color", "Black");
                }
            }
        }
        else {
            DependentDiv.style.display = 'none';
        }
            StandardTaskModalComponent.EnableDisableDependentTab();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnTaskFlowChange"); }
    }
    _OnTaskTypeChange() {
        try {
            let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");;
            let SelectedVal = SelectedTaskType.Value;
            var PeoplePickerDiv = document.getElementById('divPeoplePicker');
            if (SelectedVal == "Standard Task") {
                // $("#divPeoplePicker *").attr("disabled", "disabled").off('click');
                PeoplePickerDiv.style.display = 'block';
            }
            else {
                PeoplePickerDiv.style.display = 'none';
            }
            StandardTaskModalComponent.EnableDisableDependentTab();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnTaskTypeChange"); }
    }
    CreateDependentTaskGrid() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('StandardTask')/items?$orderby=OData__TaskName%20asc&$select=ID%2COData__TaskName%2CTaskType1%2CDependentTasks%2CTaskDepartment%2FOData__DepartmentName%2COData__IDCategory%2FCategoryName1&$expand=TaskDepartment%2FOData__DepartmentName%2COData__IDCategory%2FCategoryName1";
            if (this.state.sFilterText !== "") {
                Url += "&$filter=" + this.state.sFilterText;
            }
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, StandardTaskModalComponent._OnStandardTaskGet, StandardTaskModalComponent._OnStandardTaskGetFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CreateDependentTaskGrid"); }
    }
    _OnStandardTaskGet(data) {
        try {
            oGridData = data.d.results;
            StandardTaskModalComponent.CreateStandardGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnStandardTaskGet"); }
    }
    _OnStandardTaskGetFailure(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnStandardTaskGetFailure"); }
    }
    CreateSelectedTaskGrid() {
        try {

        var rDataRows = [];
        for (var i = 0; i < oDependentTasks.length; i++) {
            var nRTaskId = oDependentTasks[i].TaskId;
            var objTask = BKJSShared.GetObjectByID(nRTaskId, oGridData);
            var sRTaskName = objTask.OData__TaskName;//oDependentTasks[i].TaskName;
            var rRow = [];
            var rGridRow = <td class="d-none">{nRTaskId}</td>
            rRow.push(rGridRow);

            rGridRow = <td><div className="custom-control custom-checkbox mr-sm-2"> <input type="checkbox" className="custom-control-input" id={"checkRight" + nRTaskId} /> < label className="custom-control-label" for={"checkRight" + nRTaskId}>{sRTaskName}</label></div></td>
            rRow.push(rGridRow);
            let rDataSingleRow = <tr id={(nRTaskId + "drRow")}> {rRow} </tr>
            rDataRows.push(rDataSingleRow);
        }
            StandardTaskModalComponent.setState({ rGridRows: rDataRows }, StandardTaskModalComponent.CheckUncheckAllRows(false, "checkRigh"));

        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CreateSelectedTaskGrid"); }
    }
    CheckUncheckAllRows(check, idSubstring) {
        try {
            var array = document.getElementsByTagName("input");
            for (var ii = 0; ii < array.length; ii++) {
                if (array[ii].type == "checkbox") {
                    if (array[ii].className == "custom-control-input" && (array[ii].id).substring(0, 9) == idSubstring) {
                        array[ii].checked = check;
                    }
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CreateSelectedTaskGrid"); }
    }
    _OnLeftToRightButtonClick() {
        try {
            var array = document.getElementsByTagName("input");
            for (var ii = 0; ii < array.length; ii++) {
                if (array[ii].type == "checkbox") {
                    if (array[ii].className == "custom-control-input" && (array[ii].id).substring(0, 9) == "checkLeft") {
                        var RowID = array[ii].id.replace("checkLeft", "");
                        var Row = $('#' + RowID + "dRow");
                        var TDs = $(Row).find("td");
                        var Div = $(TDs[1]).find("div");
                        var Label = $(Div).find("label");
                        var TaskTitle = $(Label).text();
                        var objDependentTask = DependentTasksProps(RowID, TaskTitle);
                        if (array[ii].checked) {
                            oDependentTasks.push(objDependentTask);
                        }
                    }
                }
            }
            StandardTaskModalComponent.CreateSelectedTaskGrid();
            StandardTaskModalComponent.CreateStandardGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnLeftToRightButtonClick"); }
    }
    _OnRightToLeftButtonClick() {
        try {
            var array = document.getElementsByTagName("input");
            for (var ii = 0; ii < array.length; ii++) {
                if (array[ii].type == "checkbox") {
                    if (array[ii].className == "custom-control-input" && (array[ii].id).substring(0, 10) == "checkRight") {
                        var RowID = array[ii].id.replace("checkRight", "");
                        if (array[ii].checked) {
                            for (var i = 0; i < oDependentTasks.length; i++) {
                                if (oDependentTasks[i].TaskId == RowID) {
                                    oDependentTasks.splice(i, 1);
                                }
                            }
                        }
                    }
                }
            }
            StandardTaskModalComponent.CreateSelectedTaskGrid();
            StandardTaskModalComponent.CreateStandardGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnRightToLeftButtonClick"); }
    }
    ReturnSelectedCategoryStatus() {
        try {
            let SelectedCategory = document.getElementById("SelectDependentFilterCategory");
            SelectedCategory = SelectedCategory.value;
            return SelectedCategory;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.ReturnSelectedCategoryStatus"); }
    }


    ChangeFocus() {
        //$('#myModal').on('shown.bs.modal', function () {

        //})
    }
    //To create grid for dependent tasks selector.
    CreateStandardGridRows() {
        try {
            var DataRows = [];

            for (var k = 0; k < oGridData.length; k++) {
                var Row = [];
                var DataObject = {};
                var nTaskId = oGridData[k]["ID"];
                if (nTaskId == StandardTaskModalComponent.state.ItemId) {
                    continue;
                }

                if (oDependentTasks != null && oDependentTasks.length > 0) {
                    const dTask = oDependentTasks.find(oDependentTask => oDependentTask.TaskId == nTaskId);
                    if (dTask != null) {
                        continue;
                    }
                }

                if (StandardTaskModalComponent.CheckCyclicDependency(nTaskId) == true) {
                    continue;
                }
                var FieldValue = oGridData[k]["OData__TaskName"]

                var blnSkipRecord = false;
                var blnTaskNameMatches = false;
                var blnCategoryMatches = false;
                if (strTaskFilterVal != "") {
                    if (FieldValue.toLowerCase().indexOf(strTaskFilterVal.toLowerCase() == -1) == false) {
                        blnTaskNameMatches = true;
                    }
                }
                if (strCategoryFilterVal != "") {
                    if (oGridData[k]["OData__IDCategory"]["CategoryName1"] != null) {
                        //if (oGridData[k]["OData__IDCategory"]["CategoryName1"].includes(strCategoryFilterVal) == false) {
                        if (oGridData[k]["OData__IDCategory"]["CategoryName1"].indexOf(strCategoryFilterVal) == -1) {
                            blnCategoryMatches = true;
                        }
                    }
                    else {
                        blnCategoryMatches = true;
                    }
                }
                if (strCategoryFilterVal != "" && strTaskFilterVal != "") {
                    if (blnCategoryMatches == true && blnTaskNameMatches == true) {
                        blnSkipRecord = true;
                    }
                }
                else {
                    if (strTaskFilterVal == "" && strCategoryFilterVal == "") {
                        blnSkipRecord = false;
                    }
                    else {
                        if (strCategoryFilterVal != "") {
                            if (blnCategoryMatches) {
                                blnSkipRecord = true;
                            }
                        }
                        else if (strTaskFilterVal != "") {
                            if (blnTaskNameMatches) {
                                blnSkipRecord = true;
                            }
                        }
                    }
                }
                if (blnSkipRecord == true) {
                    continue;
                }
                var GridRow = <td class="d-none">{nTaskId}</td>
                Row.push(GridRow);


                if (FieldValue == null) {
                    GridRow = <td> <div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" id={"checkLeft" + nTaskId} value="0" /><label className="custom-control-label" for={"checkLeft" + nTaskId}>{""}</label></div></td>
                }
                else {
                    GridRow = <td> <div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" id={"checkLeft" + nTaskId} value="0" /><label className="custom-control-label" for={"checkLeft" + nTaskId}>{FieldValue}</label></div></td>
                }
                Row.push(GridRow);

                FieldValue = oGridData[k]["OData__IDCategory"]
                if (FieldValue == null) {
                    GridRow = <td>{""}</td>
                }
                else {
                    GridRow = <td>{FieldValue["CategoryName1"]}</td>
                }
                Row.push(GridRow);

                FieldValue = oGridData[k]["TaskType1"]
                if (FieldValue == null) {
                    GridRow = <td>{""}</td>
                }
                else {
                    GridRow = <td>{FieldValue}</td>
                }
                Row.push(GridRow);
                let DataSingleRow = <tr id={(nTaskId + "dRow")}> {Row} </tr>
                DataRows.push(DataSingleRow);
            }
            StandardTaskModalComponent.setState({ GridRows: DataRows }, StandardTaskModalComponent.CheckUncheckAllRows(false, "checkLeft"));
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CreateStandardGridRows"); }
    }
    _OnCheckAllLeftClick(event) {
        try {
            var IsChecked = event.currentTarget.checked;
            StandardTaskModalComponent.CheckUncheckAllRows(IsChecked, "checkLeft");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnCheckAllLeftClick"); }
    }
    _OnCheckAllRightClick(event) {
        try {
            var IsChecked = event.currentTarget.checked;
            StandardTaskModalComponent.CheckUncheckAllRows(IsChecked, "checkRigh");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnCheckAllRightClick"); }
    }
    ApplyDepedentTasksFilter() {
        try {
            strTaskFilterVal = "";
            strCategoryFilterVal = "";
            let SelectedCategoryFilterDT = BKJSShared.GetComboSelectedValueAndText("#dSTCategoryFilter");
            let SelectedTextVal = $('#TextDependentFilter').val();

            if (SelectedCategoryFilterDT.Text != "") {
                strCategoryFilterVal = SelectedCategoryFilterDT.Text.trim();
            }
            if (SelectedTextVal != "") {
                strTaskFilterVal = SelectedTextVal.trim();
            }
            if (SelectedTextVal == "" || SelectedTextVal.length < 3) {
                strTaskFilterVal = "";
            }
            if (SelectedCategoryFilterDT.Text == "") {
                strCategoryFilterVal = "";
            }
            StandardTaskModalComponent.CreateStandardGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.ApplyDepedentTasksFilter"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.CheckAndSearch"); }
    }
    EnableDisableDependentTab() {
        try {
            var IsTaskNameEmpty = false;
            var IsAssignToEmpty = false;
            let SelectedTextVal = $('#txtTaskName').val();
            if (SelectedTextVal.length == 0) {
                IsTaskNameEmpty = true;
            }
            else {
                let Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
                let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
                if (Responsible["results"].length == 0 && SelectedTaskType.Value == "Standard Task") {
                    IsAssignToEmpty = true;
                }
            }
            if (IsTaskNameEmpty == true || IsAssignToEmpty == true) {
                $('.nav li a').not('.active').addClass("disabled");
                $('.nav li').not('.active').find('a').removeAttr("data-toggle");

            }
            else {
                $('.nav li a').not('.active').removeClass("disabled");
                $('.nav li').not('.active').find('a').attr("data-toggle", "tab");


            }
            $('a[data-toggle="tab"]').on('click', function (e) {
                var target = $(e.target).parent() // activated tab
                var CurrentTabID = target.attr("id")
                if (BKJSShared.NotNullOrUndefined(CurrentTabID)) {
                    EOBShared.SetTabsTextAndBackGroundColor(StandardTaskModalTabIdArray, CurrentTabID);
                }
            });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog.EnableDisableDependentTab"); }
    }
    _OnTaskNameChange() {
        try {
            StandardTaskModalComponent.EnableDisableDependentTab();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskModalDialog._OnTaskNameChange"); }
    }

    render() {
        return (
            <div >
                <div id="StandardTaskDialog" className="modalReact pt-2">
                    <div className="modal-contentReact col-lg-8 col-md-10">
                        <div className="row modal-head align-items-center">
                            <div id="StandardTaskHeadingDiv" className="col-10">
                                <p className="f-16 m-0 SwitchTitleColor">{StandardTaskModalComponent.state.sModalHeadingText}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={StandardTaskModalComponent.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <ul class="tab-menu nav nav-tabs mb-2" role="tablist">
                                <li id="tabStandardTask" class="nav-item">
                                    <a class="nav-link active SwitchTitleColor" data-toggle="tab" href="#StandardTask">Standard Task</a>
                                </li>
                                <li id="tabDependent" class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#dependent">Dependent</a>
                                </li>
                            </ul>
                            <div class="tab-content col-12 p-0">
                                <div id="StandardTask" className="tab-pane active" onSelect={StandardTaskModalComponent.EnableDisableDependentTab}>
                                    <div className="col-12">
                                        <div className="row section">
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Task Name <sup className="medentry">&#42;</sup></label>
                                                    <input type="text" id="txtTaskName" maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" onKeyUp={BKValidationShared.IndividualValidationMethods.CheckSpecialChar} placeholder="Enter Task Name" onChange={StandardTaskModalComponent._OnTaskNameChange} />
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oSTMProcessTypeComboProps}  ></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oSTMCategoryComboProps} ref={StandardTaskModalComponent.CategoryCombo}></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Resolution Days <sup className="medentry">&#42;</sup></label>
                                                    <input type="number" id="txtResolutionDays" className="form-control form-control-sm BKValidateEmptyValue" placeholder="Enter Resolution Days" />
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Task Assign Type <sup className="medentry">&#42;</sup></label>
                                                    <select className="form-control form-control-sm" id="ddlTaskTypeSelect" onChange={StandardTaskModalComponent._OnTaskTypeChange}>
                                                        <option value={"Standard Task"}>Standard Task</option>
                                                        <option value={"Reporting Manager"}>Reporting Manager</option>
                                                        <option value={"Onboarding Offboarding Employee"}>Offboarding Employee</option>
                                                        <option value={"Assignto While Onboarding"}>Assign While Onboarding</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div id="divPeoplePicker" className="form-group">
                                                    <label id="lblAssignedTo">Assigned To <sup className="medentry">&#42;</sup></label>
                                                    <div id="userpicker"></div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group" >
                                                    <ComboMain ComboProperties={oSTMDepartmentComboProps}  ></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oSTMLevelComboProps}  ></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 col-12">
                                                <div className="form-group big-check-box">
                                                    <label className="d-lg-block d-md-block">&nbsp;</label>
                                                    <div className="custom-control custom-checkbox">
                                                        <input id="chkTaskFlow" type="checkbox" class="custom-control-input" onChange={StandardTaskModalComponent._OnTaskFlowChange} />
                                                        <label id="lblTaskFlow" class="custom-control-label" for="chkTaskFlow">Add Dependent Tasks</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-8 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Remark</label>
                                                    <textarea className="form-control form-control-sm" maxlength="225" rows="3" placeholder="Enter text here..." id="txtRemark"></textarea>
                                                    <div id="CommentHistory">
                                                        <div className="collapse-main mt-2">
                                                            <a data-toggle="collapse" href="#collapse1" aria-expanded="false" aria-controls="collapse1" class="font-weight-normal"><i class="fa fa-angle-right SwitchTitleColor"></i> <i class="fa fa-angle-down SwitchTitleColor"></i> Additional Comments History </a>
                                                        </div>
                                                        <div className="collapse" id="collapse1">
                                                            <ul id="ulRemarkVersions" class="remark-versions-list">

                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label className="mb-1">Mandatory Task</label><br/>
                                                    <label className="switch success ">
                                                        <input type="checkbox" className="success" id="chkMandatoryTask" />
                                                        <span className="slider round ChangeSpanBackground"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label className="mb-1">Active</label><br />
                                                    <label className="switch success ">
                                                        <input type="checkbox" className="success" id="chkStandardTaskActive" />
                                                        <span className="slider round ChangeSpanBackground"></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="form-group files" id="files1">
                                                    <label>Attachments</label> <a href="#" className="tooltip-icon" data-toggle="tooltip" data-placement="top" title="The attachments file size should not exceed 5 MB."><i className="fa fa-question-circle"></i></a>
                                                    <input type="file" id="fileUpload" name="files1" className="form-control-file select-input" multiple="true" />
                                                    <ul class="fileList choose-list"></ul>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>

                                <div id="dependent" className="tab-pane fade" onSelect={StandardTaskModalComponent.EnableDisableDependentTab}>
                                    <div className="col-12">
                                        <div className="row section">
                                            <div className="col-12" id="divDependent">
                                                <div>
                                                    <div className="row">
                                                        <div className="col-12 mb-2">
                                                            <form className="form-inline select-task-list-filter">
                                                                <label for="email" classname="mr-sm-2">Search</label>
                                                                <input type="text" onKeyDown={StandardTaskModalComponent.CheckAndSearch} className="form-control form-control-sm mr-2 ml-2" placeholder="Search By Task Name" id="TextDependentFilter" onChange={StandardTaskModalComponent.ApplyDepedentTasksFilter} />
                                                                <ComboMain ComboProperties={oDSTCategoryComboProps}  ></ComboMain>
                                                                <button type="button" value="" className="btn btn-primary btn-sm mw-auto d-none" onClick={StandardTaskModalComponent._OnSearchDependentTasksClick}> <i class="fa fa-search"></i> </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                    <div className="row align-items-center">
                                                        <div className="col-lg-7 col-md-6 col-sm-6">
                                                            <div className="tbl-select">
                                                                <table id="AddDependentTasksGrid" class="table table-striped table-bordered mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th width="50%">
                                                                                <div className="custom-control custom-checkbox mr-sm-2">
                                                                                    <input type="checkbox" className="custom-control-input" id="checkallLeft" onChange={StandardTaskModalComponent._OnCheckAllLeftClick} />
                                                                                    <label className="custom-control-label SwitchTitleColor" for="checkallLeft">Task Name</label>
                                                                                </div>
                                                                            </th>
                                                                            <th width="25%" className="SwitchTitleColor">Category</th>
                                                                            <th width="25%" className="SwitchTitleColor">Type</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {StandardTaskModalComponent.state.GridRows}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-1 col-md-2 col-sm-2 text-center">
                                                            <div><button type='button' id="btnAppend" className="btn btn-light btn-transfer" onClick={StandardTaskModalComponent._OnLeftToRightButtonClick}><i className="fa fa-caret-right"></i></button></div>
                                                            <div><button type='button' id="btnEleminate" className="btn btn-light btn-transfer" onClick={StandardTaskModalComponent._OnRightToLeftButtonClick}><i className="fa fa-caret-left"></i></button></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="tbl-select border">
                                                                <table class="table table-striped table-bordered mb-0">
                                                                    <thead>
                                                                        <tr>

                                                                            <th>
                                                                                <div className="custom-control custom-checkbox mr-sm-2">
                                                                                    <input type="checkbox" className="custom-control-input" id="checkallRight" onChange={StandardTaskModalComponent._OnCheckAllRightClick} />
                                                                                    <label className="custom-control-label SwitchTitleColor" for="checkallRight">Selected Tasks</label>
                                                                                </div>
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {StandardTaskModalComponent.state.rGridRows}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"btnStandardTaskAddSave"} onClick={StandardTaskModalComponent.AddUpdateStandardTask} value={StandardTaskModalComponent.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={StandardTaskModalComponent.state.ResetOrCancelFunction} value={StandardTaskModalComponent.state.ResetOrCancelButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


$('.nav-tabs a').on('shown.bs.tab', function (event) {
    var x = $(event.target).text();         // active tab
    var y = $(event.relatedTarget).text();  // previous tab
});
function DependentTasksProps(TaskId, TaskName) {
    var MyObj = {};
    MyObj.TaskId = TaskId;
    MyObj.TaskName = TaskName;
    return MyObj;
}
