"use strict";
let TaskUpdateComponent = null;
let SetDashboardTaskModalComboProps = null;
let CategoryCombo = null;
let CurrentAssignIDs = [];
let EditDetails = [];
let UserInfo = [];
let UpdateAssingID = [];
var gTaskUpdateModal = {
    UpdateAssingID: [],
    SPUserInfo: [],
    CurrentEmployeeID: "",
    CurrentTask: null,
    CurrentEmployeeData: null,
    EmailTemplate: null,
    OffboardEmailtemplate: null,
    CurrentStatus:""
}
class TaskUpdateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Itemid: this.props.ItemId,
            UpdateData: this.props.HandleDataUpdate,
            UpdateSnapShot: this.props.UpdateSnapShot
        };
        TaskUpdateComponent = this;
        TaskUpdateComponent.CategoryCombo = React.createRef();
        filesToUpload = [];
    }

    componentWillMount() {

    }

    componentDidMount() {
        TaskUpdateComponent.InitializeSettings();
        EOBConstants.SetNewThemeColor();
    }
    CreatePeoplePicker() {
        BKSPPeoplePickerRest.CreatePeoplePicker("userpickermodal", true, null);
    }
    InitializeSettings() {
        var modal = document.getElementById("TaskUpdateDialog");
        modal.style.display = "block";
        TaskUpdateComponent.GetTaskDetailsByID();
        FileUploadInitialize(0, EOBConstants.ListNames.ActualTasks); //This method is written in the "FileUploadHelper.js" - You must include that file. 
        // Initiate with basic peoplepicker.
        TaskUpdateComponent.GetSPUsersInfo();

    }
    AddUpdateDashboardTask() {
        $('#loading').show();
        let Status;
        let RemarkTB = document.getElementById("txtRemark");
        let Responsible = null;
        if ($("#lbluserpicker").is(":hidden")) {
            Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].GetSelectedUserIds();

            //for (var i = 0; i < Responsible.results.length; i++) {
            //    if (Responsible.results[i] != CurrentAssignIDs[i]) {
            //        console.log('conditon match');
            //        TaskUpdateComponent.getEmailTemplate()
            //    }
            //}

            var tempArr = Responsible.results.filter(function (item) {
                return !CurrentAssignIDs.includes(item);
            });
            gTaskUpdateModal.UpdateAssingID = tempArr;
            //console.log(tempArr)
            //if (tempArr.length > 0) {
            //    for (var j = 0; j < tempArr.length; j++) {
            //       // UpdateAssingID = tempArr[j];
            //        TaskUpdateComponent.getEmailTemplate()
            //    }
            //}

        }
        if ($('#NotStartedRadioInline1').is(':checked')) {
            Status = "Open";
            gTaskUpdateModal.CurrentStatus = "Open"
        }
        if ($('#InProgressRadioInline2').is(':checked')) {
            Status = "In Progress";
            gTaskUpdateModal.CurrentStatus = "In Progress"
        }
        if ($('#CompletedRadioInline3').is(':checked')) {
            Status = "Close";
            gTaskUpdateModal.CurrentStatus = "Close"
        }

        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.ActualTasks);
        var fileArray = [];
        var SaveData = {};
        if (Responsible != null) {
            SaveData = {
                __metadata: { 'type': ListTypeName },
                "Status": Status,
                "Remark": RemarkTB.value,
                "AssignedToId": Responsible
            }
        }
        else {
            SaveData = {
                __metadata: { 'type': ListTypeName },
                "Status": Status,
                "Remark": RemarkTB.value,
            }
        }
        var RequestMethod = null;
        var Url = ""
        if (TaskUpdateComponent.state.Itemid > 0) {

            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + TaskUpdateComponent.state.Itemid + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items"
        }
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, TaskUpdateComponent._onItemSave, TaskUpdateComponent._onItemSaveFailed)

    }

    getEmailTemplate() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items?$filter=((ID eq '5') or (ID eq '6'))&$orderby=ID asc";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskUpdateComponent._onEmailTemplateGet, TaskUpdateComponent._onRestCallFailure);
    }
    ReturnEmailObject(TaskItems, AssignedToID) {
        var Subject = "";
        var Body = (TaskItems.ProcessId == 1) ? (gTaskUpdateModal.EmailTemplate) : (gTaskUpdateModal.OffboardEmailtemplate)
        Subject = Body.Subject
        Body = Body.EmailTemplate
        var UserObject = TaskUpdateComponent.ReturnUserEmailFromID(AssignedToID);
        Body = Body.replace("#RecieverName#", UserObject.Title);
        Body = Body.replace("#EmpName#", TaskItems.OData__EmployeeID.OData__EmployeeName);
        Body = Body.replace("#Position#", gTaskUpdateModal.CurrentEmployeeData.OData__Position._PositionName);
        Body = Body.replace("#Department#", gTaskUpdateModal.CurrentEmployeeData.OData__Department._DepartmentName);
        Body = Body.replace("#DOJ#", moment(gTaskUpdateModal.CurrentEmployeeData.DOJ).format("MM/DD/YY"));
        var RowsString = ""
        var StartDate = (moment(TaskItems.StartDate).format("MM/DD/YY") == "Invalid date") ? " " : (moment(TaskItems.StartDate).format("MM/DD/YY"))
        var DueDate = (moment(TaskItems.DueDate).format("MM/DD/YY") == "Invalid date") ? " " : (moment(TaskItems.DueDate).format("MM/DD/YY"))
        var Row = "<tr>"
        Row += "<td>" + TaskItems.Title + "</td>"
        Row += "<td>" + StartDate + "</td>"
        Row += "<td>" + DueDate + "</td>"
        Row += "<td>" + UserObject.Title + "</td>"
        Row += "<td>" + gTaskUpdateModal.CurrentTask.OData__IDCategory.CategoryName1 + "</td>"
        Row += "</tr>"
        RowsString += Row
        Body = Body.replace("#TasksRows#", RowsString)
        var MyTasksUrl = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
        Body = Body.replace("#MyTaskUrl", MyTasksUrl)
        var EmailObject = {
            To: [UserObject.Email],
            From: "Employee Onboarding team",
            Body: Body,
            Subject: Subject
        }
        return EmailObject;
    }


    StartEmailProcess() {
        if (gTaskUpdateModal.SPUserInfo.length == 0) {
            TaskUpdateComponent.GetSPUsersInfo()
        }
        else {
            TaskUpdateComponent.GetCurrentEmployee();
        }
    }

    CloseDialogAfterSave() {
        $('#loading').hide();
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Task saved successfully.")
        TaskUpdateComponent.ClearControls();
        TaskUpdateComponent.setState({ SaveErrorSuccessNotification: null });
        BKValidationShared.ResetValidation();
        TaskUpdateComponent.CloseModal();

    }
    CloseModal() {
        var modal = document.getElementById("TaskUpdateDialog");
        modal.style.display = "none";
        $("#btnStandardTaskAddSave").val("Save");

        TaskUpdateComponent.ClearControls();
        TaskUpdateComponent.HandleUpdate();
        if (BKJSShared.NotNullOrUndefined(BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"])) {
            BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].ResetFromIdToPeoplePickerData();
        }
    }

    EnableDisableDependentTab() {
        var IsTaskNameEmpty = false;
        var IsAssignToEmpty = false;
        let SelectedTextVal = $('#lblTaskName').val();
        if (SelectedTextVal.length == 0) {
            IsTaskNameEmpty = true;
        }
        else {
            let Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].GetSelectedUserIds();
            let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
            if (Responsible["results"].length == 0 && SelectedTaskType.Text == "ActualTasks Task") {
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
    }
    Reset() {
        BKValidationShared.ResetValidation();
        BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].isResolved = true;
        BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].ResetFromIdToPeoplePickerData();
        BKSPPeoplePickerRest.PeoplePickerInstances["userpickermodal"].ResetPeoplePickerField();
    }
    HandleUpdate() {
        TaskUpdateComponent.state.UpdateData();
    }
    ClearControls() {
        $("#lblTaskDescription").val("")
        $("#lblCategoryName").val("");
        $("#lblTaskName").val("");
        $("#lblAssignedTo").val("");
        $("#lblEmployeeName").val("");
        $("#lblTaskDueDate").val("");
        $("#lblJoiningDate").val("");
        $("#NotStartedRadioInline1").val("");
        $("#InProgressRadioInline2").val("");
        $("#CompletedRadioInline3").val("");
        $("#txtRemark").val("");
    }

    GetTaskDetailsByID() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items('" + TaskUpdateComponent.state.Itemid + "')?$select=ID,TypeOfTask%2CProcessId%2CStartDate%2CAttachments%2CAttachmentFiles%2cAssignedTo/Title%2cAssignedToId%2cOData__EmployeeID/DOJ%2cOData__EmployeeID/ID%2cRemark%2cStatus%2cOData__EmployeeID/OData__EmployeeName%2cOData__EmployeeID/ID%2cDueDate%2cBody%2cStatus%2cDueDate%2cTitle%2cOData__IDCategory/CategoryName1%2cOData__IDCategory/ID%2cTaskLevel/Title%2cDepartments/OData__DepartmentName%2COData__IDStandardTask/ID";
        Url += "&$expand=AssignedTo%2cAttachmentFiles%2cOData__IDCategory/CategoryName1%2cOData__IDCategory/ID%2FOData__EmployeeID/OData__EmployeeName%2cOData__EmployeeID/ID%2FOData__EmployeeID/DOJ%2cOData__EmployeeID/ID%2cTaskLevel/Title%2cDepartments/OData__DepartmentName%2COData__IDStandardTask/ID";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TaskUpdateComponent._OnRestSuccessCall, TaskUpdateComponent._OnTasksByIdFailure);
    }
    GetCurrentEmployee() {
        var EmployeeURl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('lstEmployeeOnboard')/items?$select=ID%2COData__EmployeeName%2CDOJ%2COData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle%2COData__StatusE&$expand=OData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle&$filter=ID eq '" + gTaskUpdateModal.CurrentTask.OData__EmployeeID.ID + "'"
        BKJSShared.AjaxCall(EmployeeURl, null, BKJSShared.HTTPRequestMethods.GET, false, TaskUpdateComponent._onEmployeeSuccess, TaskUpdateComponent._onRestCallFailure);
    }
    ReturnUserEmailFromID(AssignedToID) {
        var UserEmail = null
        for (var i = 0; i < gTaskUpdateModal.SPUserInfo.length; i++) {
            if (gTaskUpdateModal.SPUserInfo[i].Id == AssignedToID) {
                if (gTaskUpdateModal.SPUserInfo[i].UserPrincipalName) {
                    UserEmail = gTaskUpdateModal.SPUserInfo[i]
                }
                break;
            }
        }
        var Object = {
            Email: UserEmail.UserPrincipalName,
            Title: UserEmail.Title
        }
        return Object
    }
    GetActuallTasksByStandardTask() {

    }
    FillDefaultValues(data) {
        if (!data) {
            return;
        }
        EditDetails = data;
        gTaskUpdateModal.CurrentTask = data.d;
        var arrAssignToIDs = [];
        if (data.d.AssignedToId.results.length > 0) {
            var AssignedUsers = [];
            for (var i = 0; i < data.d.AssignedToId.results.length; i++) {
                if (data.d.AssignedTo["results"][i] != null) {
                    AssignedUsers.push(data.d.AssignedTo["results"][i].Title);
                }
            }
            if (AssignedUsers.length > 0) {
                $(lbluserpicker).text(AssignedUsers.join(", "));
            }
            
            arrAssignToIDs = data.d.AssignedToId.results;
            CurrentAssignIDs = data.d.AssignedToId.results;
            //BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrAssignToIDs, "userpickermodal", true);
        }
        var LevelAssociation = EOBShared.ReturnUserTaskUserAssociationLevel(data.d)
        if (LevelAssociation["isNoAdminCurrentUser"]) {
            $("#userpickermodal").addClass("d-none");
        }
        else {
            BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrAssignToIDs, "userpickermodal", true);
            $("#lbluserpicker").addClass("d-none");
        }
        if (data.d.AttachmentFiles.results.length > 0) {

            LoadExistingFiles(data.d.AttachmentFiles.results, TaskUpdateComponent.state.Itemid, EOBConstants.ListNames.ActualTasks);
        }
        if (data.d.OData__EmployeeID.DOJ != null) {
            $("#lblJoiningDate").text(moment(data.d.OData__EmployeeID.DOJ).format("MM/DD/YYYY"));
        }

        if (data.d.OData__EmployeeID.OData__EmployeeName != null) {
            $("#lblEmployeeName").text(data.d.OData__EmployeeID.OData__EmployeeName)
        }
        if (data.d.Body != null) {
            document.getElementById('lblTaskDescription').innerHTML = data.d.Body;
        }

        if (data.d.OData__IDCategory.CategoryName1 != null) {
            $("#lblCategoryName").text(data.d.OData__IDCategory.CategoryName1);
        }

        if (data.d.Title != null) {
            $("#lblTaskName").text(data.d.Title);
        }

        if (data.d.DueDate != null) {
            $("#lblTaskDueDate").text(moment(data.d.DueDate).format("MM/DD/YYYY"));
        }

        var CompareString = data.d.Status;


        if (CompareString === "Not Started" || CompareString == "Open") {
            $("#NotStartedRadioInline1").prop('checked', true);
        }
        else if (CompareString === "Close") {
            $("#CompletedRadioInline3").prop('checked', true);
        }
        else if (CompareString === "In Progress") {
            $("#InProgressRadioInline2").prop('checked', true);
        }


        EOBShared.GetRemarkVersions("ActualTasks", "Remark", TaskUpdateComponent.state.Itemid, '#ulRemarkVersions', 'CommentHistory');
    }
    GetSPUsersInfo() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUsers"
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onSPUsersGet, this._onRestCallFailure);
    }
    _onSPUsersGet(data) {
        gTaskUpdateModal.SPUserInfo = data.d.results;
    }
    _onEmployeeSuccess(data) {
        gTaskUpdateModal.CurrentEmployeeData = data.d.results[0]
        if (gTaskUpdateModal.EmailTemplate !== null) {
            for (var i = 0; i < gTaskUpdateModal.UpdateAssingID.length; i++) {
                var UserObject = TaskUpdateComponent.ReturnUserEmailFromID(UpdateAssingID[i]);
                if (UserObject.Email !== "") {
                    var EmailObject = TaskUpdateComponent.ReturnEmailObject(gTaskUpdateModal.CurrentTask, gTaskUpdateModal.UpdateAssingID[i])
                    console.log(EmailObject);
                    BKSPShared.SPEMail.SendEMail(_spPageContextInfo.userEmail, EmailObject.To, EmailObject.Body, EmailObject.Subject, TaskUpdateComponent._onEmailSent, TaskUpdateComponent._onRestCallFailure)
                }
            }
        }
        else {
            TaskUpdateComponent.getEmailTemplate();
        }
    }
    _OnTasksByIdFailure(data) {
        console.log(data);
    }
    _OnRestSuccessCall(data) {
        TaskUpdateComponent.FillDefaultValues(data);
    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    _onEmailTemplateGet(data) {
        console.log(data.d.results)
        if (data) {
            var EmailTempaltesArray = [];
            gTaskUpdateModal.EmailTemplate = data.d.results[0];
            gTaskUpdateModal.OffboardEmailtemplate = data.d.results[1];

        }

        for (var i = 0; i < gTaskUpdateModal.UpdateAssingID.length; i++) {
            var EmailObject = TaskUpdateComponent.ReturnEmailObject(gTaskUpdateModal.CurrentTask, gTaskUpdateModal.UpdateAssingID[i])
            BKSPShared.SPEMail.SendEMail(_spPageContextInfo.userEmail, EmailObject.To, EmailObject.Body, EmailObject.Subject, TaskUpdateComponent._onEmailSent, TaskUpdateComponent._onRestCallFailure)
        }
    }
    _onItemSaveFailed(data) {
        $('#loading').hide();
        console.log(data);
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Failed To Save.", "")
    }
    _OnAssignedToChange() {
        TaskUpdateComponent.EnableDisableDependentTab();
    }
    _onItemSave(data) {
        if (gTaskUpdateModal.UpdateAssingID.length > 0) {
            TaskUpdateComponent.StartEmailProcess()
        }
        if (gTaskUpdateModal.CurrentStatus == "Close") {
            EOBEmployeeDependentTaskStatus.CheckCurrentTaskDependency(gTaskUpdateModal.CurrentTask, null)
        }
        if (data != undefined) {
            ProcessAttachmentsIfAny(TaskUpdateComponent.CloseDialogAfterSave, data.d.ID, EOBConstants.ListNames.ActualTasks);
        }
        else {
            ProcessAttachmentsIfAny(TaskUpdateComponent.CloseDialogAfterSave, TaskUpdateComponent.state.Itemid, EOBConstants.ListNames.ActualTasks);
        }
        EOBEmployeeTasksStatus.CheckAndUpdateEmployeeStatus(gTaskUpdateModal.CurrentTask.OData__EmployeeID.ID, TaskUpdateComponent.state.UpdateSnapShot);
    }
    _onEmailSent(data) {
    }
    
    UpdateGrid() {
        TaskUpdateComponent.DataGrid.current.ResetGridRows();
        TaskUpdateComponent.DataGrid.current.CreateGrid();
    }

    render() {
        return (
            <div >
                <div id="TaskUpdateDialog" className="modalReact pt-2">
                    <div className="modal-contentReact col-lg-7 col-md-10">
                        <div className="row modal-head align-items-center">
                            <div id="TaskHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0 SwitchTitleColor">Edit Task</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={TaskUpdateComponent.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div class="row section mb-3">
                                    <div className="col-md-4 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label><strong>Task Name </strong></label>
                                            <p id="lblTaskName" className="m-0"></p>
                                        </div>
                                    </div>
                                    <div className="col-md-4 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label ><strong>Task Category</strong></label>
                                            <p id="lblCategoryName" className="m-0"></p>
                                        </div>
                                    </div>
                                    <div className="col-md-4 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label><strong> Task Due Date </strong></label>
                                            <p id="lblTaskDueDate" className="m-0"></p>
                                        </div>
                                    </div>
                                   
                                    <div className="col-md-4 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label ><strong>Employee Name </strong></label>
                                            <p id="lblEmployeeName" className="m-0"></p>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-sm-6 col-12">
                                        <div className="form-group input-with-icon">
                                            <label ><strong>Joining Date </strong></label>
                                            <p id="lblJoiningDate" className="m-0"></p>
                                        </div>
                                    </div>
                                    
                                </div>

                                <div className="row section">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <div>
                                                <label><strong>Status</strong></label>
                                            </div>
                                            <div className="custom-control custom-radio custom-control-inline">
                                                <input type="radio" id="NotStartedRadioInline1" name="customRadioInline1" value="Not Started" className="custom-control-input" />
                                                <label className="custom-control-label" for="NotStartedRadioInline1" value="Not Started">Not Started</label>
                                            </div>
                                            <div class="custom-control custom-radio custom-control-inline">
                                                <input type="radio" id="InProgressRadioInline2" name="customRadioInline1" value="In Progress" className="custom-control-input" />
                                                <label className="custom-control-label" for="InProgressRadioInline2" value="Not Started">In Progress</label>
                                            </div>
                                            <div class="custom-control custom-radio custom-control-inline">
                                                <input type="radio" id="CompletedRadioInline3" name="customRadioInline1" value="Close" className="custom-control-input" />
                                                <label className="custom-control-label" for="CompletedRadioInline3" value="Not Started">Close</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <div id="divPeoplePicker" className="form-group">
                                                <label id="lblAssignedTo"><strong>Assigned To</strong> <sup className="medentry">&#42;</sup></label><br />
                                                <p id="lbluserpicker" className="m-0"></p>
                                                <div id="userpickermodal"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
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
                                    <div className="col-md-6">
                                        <div className="form-group files" id="files1">
                                            <label>Attachments</label> <a href="#" className="tooltip-icon" data-toggle="tooltip" data-placement="top" title="The attachments file size should not exceed 5 MB."><i className="fa fa-question-circle"></i></a>
                                            <input type="file" id="fileUpload" name="files1" className="form-control-file select-input" multiple="true" />
                                            <ul class="fileList choose-list"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">

                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" value="Update" onClick={TaskUpdateComponent.AddUpdateDashboardTask} />
                                <input type="Button" className="btn btn-light" value="Cancel" onClick={TaskUpdateComponent.CloseModal} />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


