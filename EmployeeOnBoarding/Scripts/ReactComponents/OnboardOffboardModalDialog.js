"use strict";
let OnOffboardModalComponent = null;
let isEdit = false;
let nCurrentItemID = 0;
let nOnOffBoardModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
let oGridData = null;
let oDependentTasks = [];
let oOnOffBoardDepartmentComboProps = null;
let oOnOffBoardPositionComboProps = null;
let oOnOffBoardEmployeeTypeComboProps = null;
let nTotalRestCalls = 4; // It should be the total of all shared Combo calls + 1
let nCounterSuccess = 0; // It should be increased on each Combo success call + On GetItemById sucess call.
let StatusE = "Open";
let allCustomFields = [];
let allCustomFieldsName = [];
let detailsID = 0;
let lstCustomFields = "";
let ipAddress = "";
let cfLocation = "";
let allCustomFieldsDetail = [];
let ResetCall = false;
let LevelTitles = [];
let arrLevelIds = [];
let strAction = "";
// Actual Task changes -- Start
let oAtMProcessTypeComboProps = null;
let oAtMDepartmentComboProps = null;
let oAtMCategoryComboProps = null;
let oAtMLevelComboProps = null;
let nAtTotalRestCalls = 6; // It should be the total of all shared Combo calls + 1
let nAtCounterSuccess = 0; // It should be increased on each Combo success call + On GetItemById success call.
let atResetCall = false;
let TempArrActualTasks = [];
let arrAllTasks = [];
let arrAllActualTasks = [];
let oTaskTemplateType = null;
let TaskTemplateDetailTaskIds = [];
let finaloTasks = [];
// Actual Task changes -- End
let OnBoardDialogTabIdArray = ["tbBasicInfo", "tbTasks"];
let OffBoardEmpId = null;
let objEmpOffboard = null;
let SPUsersInfo = null;
let objLevelAdminUserEmails = [];
let LevelAdminUserEmails = [];
let ManagerEmails = [];
let ManagerUserNames = [];
let AssignToUserEmails = [];
let AssignToGroupIds = [];
let LevelAdminUserNames = [];
let validOffboardedEmp = true;

class OnboardOffboardModalDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            Action: this.props.Action,
            ItemId: this.props.ItemId,
            UpdateData: this.props.HandleDataUpdate,
            AddButtonText: "Save",
            sModalHeadingText: "Onboard " + ConfigModal.gConfigSettings.DisplayTextEmployee,
            GridRows: null,
            rGridRows: null,
            sFilterText: "",
            EnableControls: true,
            Process: this.props.Process,
            ProcessText: "Onboard",
            sEmployeeCustomFields: "",
            DojDorText: "Date Of Joining",
            UserType: "rdoOtherUser",
            LevelTabs: null,
            LevelIDs: null,
            gridHeader: null,
            atAction: "Add",
            atItemId: null,
            atResetOrCancelButtonText: "",
            atResetOrCancelFunction: null,
            EmployeeListCount: 0,
            LicenseValidationModal: null
        };
        nCounterSuccess = 0;
        OnOffboardModalComponent = this;
        OnOffboardModalComponent.SetOnOffboardModalComboProps();
        if (OnOffboardModalComponent.props.Process == "1") {
            OnOffboardModalComponent.state.ProcessText = "Onboard";
            OnOffboardModalComponent.state.DojDorText = "Date Of Joining";
        }
        else {
            OnOffboardModalComponent.state.ProcessText = "Offboard";
            OnOffboardModalComponent.state.DojDorText = "Date Of Relieving";
        }
        OnOffboardModalComponent.state.sModalHeadingText = OnOffboardModalComponent.state.ProcessText + " " + ConfigModal.gConfigSettings.DisplayTextEmployee;
        OnOffboardModalComponent.IsNumber = OnOffboardModalComponent.IsNumber.bind(OnOffboardModalComponent);
        OnOffboardModalComponent.UserTypeChange = OnOffboardModalComponent.UserTypeChange.bind(OnOffboardModalComponent);
        OnOffboardModalComponent.CategoryCombo = React.createRef();
        OnOffboardModalComponent.SetActualTaskModalComboProps("Add");
        OnOffboardModalComponent.EditRow = OnOffboardModalComponent.EditRow.bind(OnOffboardModalComponent);
        OnOffboardModalComponent.AddRow = OnOffboardModalComponent.AddRow.bind(OnOffboardModalComponent);
        OnOffboardModalComponent.OnCheckClick = OnOffboardModalComponent.OnCheckClick.bind(OnOffboardModalComponent);
        //if (BKSPShared.UserData.length == 0) {
        //    BKSPShared.GetSPGroups();
        //} 
    }

    componentDidMount() {
        OnOffboardModalComponent.GetEmployeeOnboardListData();
        if (OnOffboardModalComponent.state.Action == "View") {
            OnOffboardModalComponent.SetControlsState(true);
        }
        else {
            $("#btnOnOffBoardAbort").hide();
            if (ConfigModal.gConfigSettings.isAllowAllUsers == true) {
            }
            else if (ConfigModal.gConfigSettings.isCurrentUserAdmin == true) {
            }
            else {
                let isAllowEdit = false;
                if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                    for (var i = 0; i < ConfigModal.gConfigSettings.CurrentUserLevel.length; i++) {
                        if (ConfigModal.gConfigSettings.CurrentUserLevel[0].isAllowEdit) {
                            isAllowEdit = true;
                            break;
                        }
                    }
                }
                if (isAllowEdit) {
                    OnOffboardModalComponent.SetControlsState(false);
                }
                else {
                    OnOffboardModalComponent.SetControlsState(true);
                }
            }

        }
        if (OnOffboardModalComponent.state.Action != "Add") {
            OnOffboardModalComponent.GetOnOffBoardDetailByID();
        }
        if (OnOffboardModalComponent.props.Process == "1") {
            $("#divOnboardExtraFields").show();
            $("#divUserType").hide();
        }
        else {
            $("#divOnboardExtraFields").hide();
            $("#divUserType").show();
            if (OnOffboardModalComponent.props.ItemId) {
                //GetDataHere
            }
            else {
                OnOffboardModalComponent.CreateOffboardEmpPeoplePicker();
            }
        }
        var modal = document.getElementById("OnOffBoardDialog");
        modal.style.display = "block";
        $("#OnOffBoardHeadingDiv").text(OnOffboardModalComponent.props.ModalHeading);
        $("#txtDOJ").datepicker({
            autoclose: true,
            todayHighlight: true,
            format: "mm/dd/yyyy"
        }).datepicker().on("hide", function (e) {
        });
        $("#txtOnOffboardStartDate").datepicker({
            autoclose: true,
            todayHighlight: true,
            format: "mm/dd/yyyy"
        }).datepicker().on("hide", function (e) {
        });
        // Initiate with basic peoplepicker.
        if (OnOffboardModalComponent.props.ItemId) {
            //GetDataHere
        }
        else {
            OnOffboardModalComponent.CreatePeoplePicker();
            var modalComm = document.getElementById("CommentHistory");
            modalComm.style.display = "none";
            //$("#txtOnOffboardStartDate").val(moment(new Date()).format("MM/DD/YYYY"));
            $("#txtOnOffboardStartDate").datepicker('setDate', moment(new Date()).format("MM/DD/YYYY"));
        }
        OnOffboardModalComponent.LoadCustomFields();
        OnOffboardModalComponent.LoadDefaultSettings();
        $('a[data-toggle="tab"]').on('click', function (e) {
            var target = $(e.target).parent() // activated tab
            var CurrentTabID = target.attr("id")
            if (BKJSShared.NotNullOrUndefined(CurrentTabID)) {
                EOBShared.SetTabsTextAndBackGroundColor(OnBoardDialogTabIdArray, CurrentTabID);
            }
            OnOffboardModalComponent.EnableDisableTasksTab();
        });
        EOBShared.SetTabsTextAndBackGroundColor(OnBoardDialogTabIdArray, OnBoardDialogTabIdArray[0]);
        OnOffboardModalComponent.GetLevels();
        EOBConstants.SetNewThemeColor();

        OnOffboardModalComponent.AtCreatePeoplePicker();
        filesToUpload = [];
        FileUploadInitialize(0, EOBConstants.ListNames.EmployeeOnBoard, "#filesBasic"); //This method is written in the "FileUploadHelper.js" - You must include that file. 
        $('#TaskTemplateTypeSelect option').each(function () {
            var optionText = this.text;
            console.log(optionText);
            var newOption = "";
            if (optionText.length > 31)
                newOption = optionText.substring(0, 31) + "...";
            else
                newOption = optionText;
            console.log(newOption);
            $(this).text(newOption);
        });
    }

    CreatePeoplePicker() {
        BKSPPeoplePickerRest.CreatePeoplePicker("userpicker", true, OnOffboardModalComponent._OnAssignedToChange);
    }

    SetOnOffboardModalComboProps() {
        let strFilterString = "IsActive1 eq '1'";
        oOnOffBoardPositionComboProps = new EOBShared.ComboProperties("OnOffBoardPositionSelect", "Position", "Positionlst", "", "", "Select", "", "", "OData__PositionName", OnOffboardModalComponent._OnRestSuccessCall, strFilterString);
        oOnOffBoardDepartmentComboProps = new EOBShared.ComboProperties("OnOffBoardDepartmentSelect", "Department", "Departmentlst", "", "", "Select", "", "", "OData__DepartmentName", OnOffboardModalComponent._OnRestSuccessCall, strFilterString);
        oOnOffBoardEmployeeTypeComboProps = new EOBShared.ComboProperties("OnOffBoardEmployeeTypeSelect", ConfigModal.gConfigSettings.DisplayTextEmployee + " Type", "EmployeeTypelst", "", "", "Select", "", "", "OData__EmployeeType", OnOffboardModalComponent._OnRestSuccessCall, strFilterString);
    }

    _OnRestSuccessCall(data) {
        if (OnOffboardModalComponent.Action != "Add") {
            nCounterSuccess++;
            if (ResetCall) {
                ResetCall = false;
                OnOffboardModalComponent.FillDefaultValues(data);
            }
            else {
                if (nCounterSuccess == nTotalRestCalls) {
                    OnOffboardModalComponent.FillDefaultValues(data);
                }
            }
        }

    }

    HandleUpdate() {
        OnOffboardModalComponent.props.HandleDataUpdate();
    }

    CloseActualTaskModal() {
        //OnOffboardModalComponent.setState({ ActualTaskDialog: false });
    }

    LoadDefaultSettings() {
        $("#chkActualTaskActive").prop('checked', true);
        if (OnOffboardModalComponent.state.ItemId > 0) {
            OnOffboardModalComponent.setState({ sModalHeadingText: "Edit " + OnOffboardModalComponent.state.ProcessText + " " + ConfigModal.gConfigSettings.DisplayTextEmployee });
            OnOffboardModalComponent.setState({ AddButtonText: "Update" });
            OnOffboardModalComponent.GetSetEmployeeCustomFieldValues(OnOffboardModalComponent.state.ItemId);
        }
        else {
            // $("#chkOnOffBoardActive").prop('checked', true);
            OnOffboardModalComponent.setState({ ResetButtonText: "Reset" });
        }
    }

    GetOnOffBoardDetailByID() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('lstEmployeeOnboard')/items?$select=ID%2COData__EmployeeName%2CDOJ%2COData__StatusE%2COData__EmployeeNumber%2COData__Position%2F_PositionName%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__IDTaskTemplate%2F_TaskTemplateName%2CProcess%2FTitle%2CProcess%2FID%2COData__PositionId%2COData__DepartmentId%2COData__EmployeeTypeId%2COData__ManagerId";
        Url += "%2CPersonalEmail%2CContactNumber%2CAlternateContactNumber%2CPresentEmployer%2CLocation%2CRecruitersName%2COnOffboardStartDate%2COffBoardEmployeeIDId%2COData__IDTaskTemplateId";
        Url += "&$expand=AttachmentFiles%2COData__Position%2F_PositionName%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__IDTaskTemplate%2F_TaskTemplateName%2CProcess%2FTitle%2CProcess%2FID";
        Url += "&$filter=ID eq " + OnOffboardModalComponent.state.ItemId;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._OnRestSuccessCall, OnOffboardModalComponent.GetOnOffBoardDetailByID);
    }

    FillDefaultValues(data) {
        $("#btnOnOffBoardAddSave").val("Update");
        $("#btnOnOffBoardAbort").show();
        if (data) {
            if (data.d.results.length > 0) {
                if (data.d.results[0]["OData__StatusE"] == "Aborted") {
                    $("#btnOnOffBoardAbort").val("Re-Initiate");
                    $("#btnReset").hide();
                    $("#btnOnOffBoardAddSave").hide();
                }
                else {
                    $("#btnOnOffBoardAbort").val("Abort");
                    $("#btnReset").show();
                    $("#btnOnOffBoardAddSave").show();
                    OnOffboardModalComponent.setState({ ResetButtonText: "Cancel" });
                }
                $("#txtName").val(data.d.results[0]["OData__EmployeeName"]);
                $("#txtNumber").val(data.d.results[0]["OData__EmployeeNumber"]);
                $("#txtDOJ").val(moment(data.d.results[0]["DOJ"]).format("MM/DD/YYYY"));
                if (data.d.results[0]["OData__Position"]._PositionName != null) {
                    $("#OnOffBoardPositionSelect").val(data.d.results[0]["OData__PositionId"]);
                }
                if (data.d.results[0]["OData__Department"]._DepartmentName != null) {
                    $("#OnOffBoardDepartmentSelect").val(data.d.results[0]["OData__DepartmentId"]);
                }
                if (data.d.results[0]["OData__EmployeeType"]._EmployeeType != null) {
                    $("#OnOffBoardEmployeeTypeSelect").val(data.d.results[0]["OData__EmployeeTypeId"]);
                }
                if (data.d.results[0]["OData__IDTaskTemplateId"] != null) {
                    $("#TaskTemplateTypeSelect").val(data.d.results[0]["OData__IDTaskTemplateId"]);
                }
                else { $("#TaskTemplateTypeSelect").val("0"); }
                if (data.d.results[0]["OData__ManagerId"]) {
                    var arrManagerIDs = data.d.results[0]["OData__ManagerId"].results;
                    BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrManagerIDs, "userpicker", true, OnOffboardModalComponent._OnAssignedToChange);
                }
                else {
                    OnOffboardModalComponent.CreatePeoplePicker();
                }
                $("#txtPersonalEmail").val(data.d.results[0]["PersonalEmail"]);
                $("#txtContactNumber").val(data.d.results[0]["ContactNumber"]);
                $("#txtAlternateContactNumber").val(data.d.results[0]["AlternateContactNumber"]);
                $("#txtPresentEmployer").val(data.d.results[0]["PresentEmployer"]);
                $("#txtLocation").val(data.d.results[0]["Location"]);
                $("#txtRecruiterName").val(data.d.results[0]["RecruitersName"]);
                $("#txtOnOffboardStartDate").val(moment(data.d.results[0]["OnOffboardStartDate"]).format("MM/DD/YYYY"));
                if (data.d.results[0].AttachmentFiles.results.length > 0) {
                    LoadExistingFiles(data.d.results[0].AttachmentFiles.results, OnOffboardModalComponent.state.ItemId, EOBConstants.ListNames.EmployeeOnBoard, "#filesBasic");
                }
                if (data.d.results[0]["OffBoardEmployeeIDId"]) {
                    var arrOffboardEmployeeId = data.d.results[0]["OffBoardEmployeeIDId"];
                    //BKSPPeoplePicker.CreatePeoplePickerFromUserIds(arrOffboardEmployeeId, "offboardempuserpicker");
                    $("#rdoSharePointUser").checked = true;
                    $("#rdoOtherUser").checked = false;
                    $("#divEmployeeNameText").hide();
                    $("#txtName").removeClass("form-control form-control-sm BKValidateEmptyValue").addClass("form-control form-control-sm");
                    $("#divEmployeeNameText").hide();
                    $("#divEmployeeNamePeoplePicker").show();
                    BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrOffboardEmployeeId, "offboardempuserpicker", false, OnOffboardModalComponent._OnAssignedToChange);
                    OnOffboardModalComponent.setState({
                        UserType: "rdoSharePointUser"
                    });
                }
                else {
                    OnOffboardModalComponent.setState({
                        UserType: "rdoOtherUser"
                    });
                    OnOffboardModalComponent.CreateOffboardEmpPeoplePicker();
                    $("#rdoSharePointUser").checked = false;
                    $("#rdoOtherUser").checked = true;
                }
                EOBShared.GetRemarkVersions("lstEmployeeOnboard", "AdditionalComments", OnOffboardModalComponent.state.ItemId, '#ulRemarkVersions', 'CommentHistory');
                //OnOffboardModalComponent.LoadEmployeeCustomFieldsDetails(OnOffboardModalComponent.state.ItemId);
            }
        }
        // OnOffboardModalComponent.EnableDisableTasksTab();
    }

    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        OnOffboardModalComponent.setState({ Action: "Edit" });
    }

    AddUpdateOnBoardOffBoard() {
        OnOffboardModalComponent.GetEmployeeOnboardListData();
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKJSShared.NotNullOrUndefined(isExist)) {
            OnOffboardModalComponent.OpenValidationModal();
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, OnOffboardModalComponent.OpenValidationModal);
            OnOffboardModalComponent.OpenValidationModal();
        }
        //if (BKSPCustomerLicense.IsLicenseExpired() == false && OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
        if (BKSPCustomerLicense.IsLicenseExpired() == false) {
            var isShowModal = false;
            if (isExist.LicenseType == "Enterprise") {
                isShowModal = true;
            }
            else if (OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
                isShowModal = true;
            }
            if (isShowModal) {
                
                BKValidationShared.CheckValidations();
                let txtDOJ = document.getElementById("txtDOJ");
                if (txtDOJ.value != "") {
                    let isValidDoj = OnOffboardModalComponent.CheckIfValidDate(txtDOJ.value);
                    if ($("#divDOJ")) {
                        $("#divDOJ").html('');
                    }
                    if (txtDOJ.value != isValidDoj)
                        $("#txtDOJ").after("<div style='color:red;' id='divDOJ'>Invalid date.</div>");
                }
                let txtOnOffboardStartDate = document.getElementById("txtOnOffboardStartDate");
                if (txtOnOffboardStartDate != "") {
                    let isOnOffboardStartDate = OnOffboardModalComponent.CheckIfValidDate(txtOnOffboardStartDate.value);
                    if ($("#divOnOffboardStartDate")) {
                        $("#divOnOffboardStartDate").html('');
                    }
                    if (txtOnOffboardStartDate.value != isOnOffboardStartDate)
                        $("#txtOnOffboardStartDate").after("<div style='color:red;' id='divOnOffboardStartDate'>Invalid date.</div>");
                }
                let Manager = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
                let isManagerValid = true;
                if ($("#divuserpicker")) {
                    $("#divuserpicker").html('');
                }
                if (Manager["results"].length == 0) {
                    if ($("#divuserpicker")) {
                        $("#divuserpicker").html('');
                    }
                    $("#userpicker").after("<div style='color:red;' id='divuserpicker'>Required.</div>");
                    isManagerValid = false;
                }
                let txtNumber = document.getElementById("txtNumber");
                let txtName = document.getElementById("txtName");
                //let OffBoardEmpId = null;
                let isOffBoardEmpId = true;
                if ($("#rdoSharePointUser")["0"].checked == true) {
                    txtName.value = "";
                    OffBoardEmpId = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].GetSelectedUserIds();
                    if (!BKJSShared.NotNullOrUndefined(OffBoardEmpId)) {
                        if ($("#divPeoplePickerOffboard")) {
                            $("#divPeoplePickerOffboard").html('');
                        }
                        $("#offboardempuserpicker").after("<div  style='color:red;' id='divPeoplePickerOffboard'>Required.</div>");
                        isOffBoardEmpId = false;
                    }
                    else {
                        isOffBoardEmpId = true;
                        objEmpOffboard = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].SelectedUserData[OffBoardEmpId]
                        if (validOffboardedEmp == false)
                            isOffBoardEmpId = false;
                        txtName.value = objEmpOffboard.Title;
                    }
                }

                if ((isManagerValid == false) || (isOffBoardEmpId == false)) { return }

                if (!BKValidationShared.isErrorFree || !BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved) { return }

                let arrCheckedTasks = OnOffboardModalComponent.FilterTasksByChecked();
                $("#divMsg").html("");
                if (arrCheckedTasks.length == 0) {
                    $("#divMsg").attr('style', 'color:red;');
                    $("#divMsg").html("Select atleast one task from tasks tab.");
                    return;
                }
                let arrAssignToWhileOnOffBoardEmpty = OnOffboardModalComponent.FilterTasksByAssignToWhileOnOffboard();
                if (arrAssignToWhileOnOffBoardEmpty.length != 0) {
                    $("#divMsg").attr('style', 'color:red;');
                    $("#divMsg").html("All tasks with Task assign type 'Assign To While Onboading' must need assigment to user.");
                    return;
                }
                if (BKJSShared.NotNullOrUndefined(txtNumber.value) && (txtNumber.value != ""))
                    BKSPShared.SPItems.isValueExistInColumn(txtNumber.value, "OData__EmployeeNumber", EOBConstants.ListNames.EmployeeOnBoard, OnOffboardModalComponent.props.ItemId, OnOffboardModalComponent.SaveErrorMessage, OnOffboardModalComponent.SaveDataOnOffboard);
                else
                    OnOffboardModalComponent.SaveDataOnOffboard();
            }
        }
    }

    SaveDataOnOffboard() {
        let Manager = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
        let txtName = document.getElementById("txtName");
        OffBoardEmpId = null;
        if ($("#rdoSharePointUser")["0"].checked == true) {
            txtName.value = "";
            OffBoardEmpId = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].GetSelectedUserIds();
            if (!BKJSShared.NotNullOrUndefined(OffBoardEmpId)) {
                if ($("#divPeoplePickerOffboardEmp")) {
                    $("#divPeoplePickerOffboardEmp").html('');
                }
                $("#offboardempuserpicker").after("<div  style='color:red;' id='divPeoplePickerOffboardEmp'>Required.</div>");
            }
            else {
                let objEmpOffboard = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].SelectedUserData[OffBoardEmpId]
                txtName.value = objEmpOffboard.Title;
            }
        }

        let txtNumber = document.getElementById("txtNumber");
        let txtRemark = document.getElementById("txtRemark");
        let txtDOJ = document.getElementById("txtDOJ");
        let txtPersonalEmail = document.getElementById("txtPersonalEmail");
        let txtContactNumber = document.getElementById("txtContactNumber");
        let txtAlternateContactNumber = document.getElementById("txtAlternateContactNumber");
        let txtPresentEmployer = document.getElementById("txtPresentEmployer");
        let txtLocation = document.getElementById("txtLocation");
        let txtRecruiterName = document.getElementById("txtRecruiterName");
        let txtOnOffboardStartDate = document.getElementById("txtOnOffboardStartDate");
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmployeeOnBoard);
        let isActive = $("#chkOnOffBoardActive").prop('checked');
        let SelectedPosition = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardPositionSelect");
        let SelectedDepartment = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardDepartmentSelect");
        let SelectedEmployeeType = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardEmployeeTypeSelect");
        let SelectedProcessType = OnOffboardModalComponent.props.Process;
        let SelectedTaskTemplateType = BKJSShared.GetComboSelectedValueAndText("#TaskTemplateTypeSelect");
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "OData__EmployeeName": txtName.value,
            "OData__EmployeeNumber": txtNumber.value,
            "OData__PositionId": parseInt(SelectedPosition.Value),
            "OData__DepartmentId": parseInt(SelectedDepartment.Value),
            "OData__EmployeeTypeId": parseInt(SelectedEmployeeType.Value),
            "DOJ": txtDOJ.value,
            //"IsActive1": isActive, 
            "ProcessId": parseInt(SelectedProcessType),
            "OData__ManagerId": Manager,
            "OData__StatusE": StatusE,
            "AdditionalComments": txtRemark.value,
            "PersonalEmail": txtPersonalEmail.value,
            "ContactNumber": txtContactNumber.value,
            "AlternateContactNumber": txtAlternateContactNumber.value,
            "PresentEmployer": txtPresentEmployer.value,
            "Location": txtLocation.value,
            "RecruitersName": txtRecruiterName.value,
            "OnOffboardStartDate": txtOnOffboardStartDate.value,
            "OffBoardEmployeeIDId": OffBoardEmpId,
            "OData__IDTaskTemplateId": parseInt(SelectedTaskTemplateType.Value)
        }

        var RequestMethod = null;
        var Url = "";
        if (OnOffboardModalComponent.state.ItemId > 0) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/Items(" + OnOffboardModalComponent.state.ItemId + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items";
        }
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, OnOffboardModalComponent._onItemSave, OnOffboardModalComponent._onItemSaveFailed);
    }

    SaveErrorMessage() {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", ConfigModal.gConfigSettings.DisplayTextEmployee + " Number exist, consider changing the Number.")
    }

    SetControlsState(isDisable) {
        $('#rdoSharePointUser').prop('readonly', isDisable);
        $('#rdoOtherUser').prop('readonly', isDisable);
        $('#txtName').prop('readonly', isDisable);
        $('#txtNumber').prop('disabled', isDisable);
        $('#OnOffBoardPositionSelect').prop('disabled', isDisable);
        $('#OnOffBoardDepartmentSelect').prop('disabled', isDisable);
        $('#OnOffBoardEmployeeTypeSelect').prop('disabled', isDisable);
        $('#txtRemark').prop('disabled', isDisable);
        $("#txtPersonalEmail").prop('disabled', isDisable);
        $("#txtContactNumber").prop('disabled', isDisable);
        $("#txtAlternateContactNumber").prop('disabled', isDisable);
        $("#txtPresentEmployer").prop('disabled', isDisable);
        $("#txtLocation").prop('disabled', isDisable);
        $("#txtRecruiterName").prop('disabled', isDisable);
        $("#txtOnOffboardStartDate").prop('disabled', isDisable);
        $("#txtDOJ").prop('disabled', isDisable);
        // Manager people picker disabled
        //$('#divEmployeeNamePeoplePicker :input').attr('disabled', true);
        //$('#divPeoplePicker :input').attr('disabled', true);
        //$(this).find('.sp-peoplepicker-editorInput').prop("readonly", isDisable);
        //$(this).find('.sp-peoplepicker-editorInput').prop("disabled", isDisable);
        //$(this).find('.ms-entity-resolved').attr('style', 'cursor: text;');
        //$(this).find('.sp-peoplepicker-autoFillContainer').parent().attr('style', 'color:#b1b1b1;');
        //$(this).find('.sp-peoplepicker-delImage').each(function () {
        //    $(this).hide();
        //});
        //$(this).prop("readonly", true);
        //$(this).prop("disabled", true);
        $("#btnOnOffBoardAbort").prop('disabled', isDisable);
        $("#btnOnOffBoardAddSave").prop('disabled', isDisable);
    }

    Reset() {
        ResetCall = true;
        OnOffboardModalComponent.setState({ SaveErrorSuccessNotification: null })
        if (OnOffboardModalComponent.state.ItemId > 0) {
            OnOffboardModalComponent.GetOnOffBoardDetailByID();
            OnOffboardModalComponent.CloseModal();
        }
        else {
            $("#txtName").val("");
            $("#txtNumber").val("");
            $("#txtDOJ").val("");
            $("#OnOffBoardPositionSelect").val("0");
            $("#OnOffBoardDepartmentSelect").val("0");
            $("#OnOffBoardEmployeeTypeSelect").val("0");
            $("#txtRemark").val("");
            $("#txtPersonalEmail").val("");
            $("#txtContactNumber").val("");
            $("#txtAlternateContactNumber").val("");
            $("#txtPresentEmployer").val("");
            $("#txtLocation").val("");
            $("#txtRecruiterName").val("");
            $("#txtOnOffboardStartDate").val("");
            oDependentTasks = [];
            BKValidationShared.ResetValidation();
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved = true;
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();
            if ($("#rdoSharePointUser")["0"].checked == true) {
                BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].ResetFromIdToPeoplePickerData();
                BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].ResetPeoplePickerField();
                $("#rdoOtherUser")["0"].checked == true;
                $("#rdoSharePointUser")["0"].checked == false;
            }
            //OnOffboardModalComponent.EnableDisableTasksTab();
        }
    }

    CheckIfValidDate(dtDate) {
        return moment(dtDate).format('MM/DD/YYYY');
    }

    CloseModal() {
        var modal = document.getElementById("OnOffBoardDialog");
        modal.style.display = "none";
        OnOffboardModalComponent.setState({ Action: "Add" });
        $("#btnOnOffBoardAddSave").val("Save");
        nOnOffBoardModalCurrentEditItemID = 0;
        OnOffboardModalComponent.HandleUpdate();
        //OnOffboardModalComponent.setState({ ActualTaskDialog: false });
    }

    GetEmployeeOnboardListData() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/ItemCount";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._onEmployeeListSucess, OnOffboardModalComponent._onRestCallFailure);
    }

    _onEmployeeListSucess(data) {
        OnOffboardModalComponent.setState({ EmployeeListCount: data.d.ItemCount })
    }

    _onRestCallFailure(data) {
        console.log(data)
    }

    _onItemSave(data) {
        let id = 0;
        if (OnOffboardModalComponent.state.ItemId > 0) {
            id = OnOffboardModalComponent.state.ItemId;
            OnOffboardModalComponent.UpdateEmployeeCustomFieldsDetail(id);
        }
        else {
            id = data.d["ID"];
            OnOffboardModalComponent.fn_InsertCustomFields(id);
            EOBDataAnalytic.EmployeeOnboardDataAnalytics(OnOffboardModalComponent.props.Process);
        }
        OnOffboardModalComponent.AddUpdateTaskInActualTaskList(id);
        ProcessAttachmentsIfAny(OnOffboardModalComponent.CloseModal, id, EOBConstants.ListNames.EmployeeOnBoard);
    }

    GetSPUsersInfo() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUsers"
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._onSPUsersGet, OnOffboardModalComponent._onRestCallFailure);
    }

    _onSPUsersGet(data) {
        SPUsersInfo = data.d.results;
        OnOffboardModalComponent.GetEmailsOfLevelAdminsDepartmentAdminsAssignToUsers();
    }

    _onRestCallFailure(data) {
        console.log(data)
    }

    GetEmailsOfLevelAdminsDepartmentAdminsAssignToUsers() {
        // Get Onboarding initiator Level and its level admins id and find their emails 
        // Level Admin
        objLevelAdminUserEmails = [];
        let isLevelEmailFound = false;
        let LevelAdminsIDs = [];
        for (var lk = 0; lk < ConfigModal.gConfigSettings.CurrentUserLevel.length; lk++) {
            for (var lj = 0; lj < ConfigModal.gConfigSettings.CurrentUserLevel[lk].LevelAdminsIDs.length; lj++) {
                isLevelEmailFound = false;
                for (var i = 0; i < SPUsersInfo.length; i++) {
                    if (SPUsersInfo[i].Id == ConfigModal.gConfigSettings.CurrentUserLevel[lk].LevelAdminsIDs[lj]) {
                        if (SPUsersInfo[i].UserPrincipalName) {
                            let oListContent = {};
                            oListContent.LevelId = ConfigModal.gConfigSettings.CurrentUserLevel[lk].ID;
                            oListContent.LevelAdminUserEmails = [SPUsersInfo[i].UserPrincipalName];
                            oListContent.LevelAdminUserNames = [SPUsersInfo[i].Title];
                            isLevelEmailFound = true;
                            objLevelAdminUserEmails.push(oListContent);
                        }
                        break;
                    }
                }
                if (!isLevelEmailFound) {
                    OnOffboardModalComponent.GetSPGroupsLevelUsers(ConfigModal.gConfigSettings.CurrentUserLevel[lk].LevelAdminsIDs[lj]);
                    let oListContent = {};
                    oListContent.LevelId = ConfigModal.gConfigSettings.CurrentUserLevel[lk].ID;
                    oListContent.LevelAdminUserEmails = LevelAdminUserEmails;
                    oListContent.LevelAdminUserNames = LevelAdminUserNames;
                    objLevelAdminUserEmails.push(oListContent);
                }
            }
        }

        // Reporting Manager
        let Manager = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
        ManagerEmails = [];
        ManagerUserNames = [];
        let isManagerEmailFound = false;
        for (var mj = 0; mj < Manager.results.length; mj++) {
            for (var mi = 0; mi < SPUsersInfo.length; mi++) {
                if (SPUsersInfo[mi].Id == Manager.results[mj]) {
                    if (SPUsersInfo[mi].UserPrincipalName) {
                        ManagerEmails.push(SPUsersInfo[mi].UserPrincipalName);
                        ManagerUserNames.push(SPUsersInfo[mi].Title);
                        isManagerEmailFound = true;
                    }
                    break;
                }
            }
            if (!isManagerEmailFound) {
                OnOffboardModalComponent.GetSPGroupsManagerUsers(Manager.results[mj]);
            }
        }

        // Assigned to users
        let arrTaskAssignTo = OnOffboardModalComponent.FilterTasksByChecked();
        let isAssignToEmailFound = false;
        for (var ai = 0; ai < arrTaskAssignTo.length; ai++) {
            for (var aj = 0; aj < arrTaskAssignTo[ai].ActualTaskResponsible.results.length; aj++) {
                isAssignToEmailFound = false;
                for (var ak = 0; ak < SPUsersInfo.length; ak++) {
                    if (SPUsersInfo[ak].Id == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                        if (SPUsersInfo[ak].UserPrincipalName) {
                            //AssignToUserEmails.push(SPUsersInfo[mi].UserPrincipalName);
                            //verifiedAssignTo.push(arrTaskAssignTo[ai].ActualTaskResponsible[aj]);
                            isAssignToEmailFound = true;
                        }
                        break;
                    }
                }
                if (!isAssignToEmailFound) {
                    OnOffboardModalComponent.GetSPGroupsAssignToUsers(arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]);
                    let oListContent = {};
                    oListContent.GroupId = arrTaskAssignTo[ai].ActualTaskResponsible.results[aj];
                    oListContent.AssignToUserIdsFromGroup = AssignToGroupIds;
                    AssignToUserEmails.push(oListContent);
                }
            }
        }

        OnOffboardModalComponent.GetAllEmailTemplates();
    }

    GetSPGroupsLevelUsers(LevelAdminGrpId) {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/GetById(" + LevelAdminGrpId + ")/Users";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._OnGetSPGroupsLevelUsersSuccess, OnOffboardModalComponent._onCallFailure);
    }

    _OnGetSPGroupsLevelUsersSuccess(data) {
        console.log(data); //LevelAdminUserEmails
        let emailResults = data.d.results;
        LevelAdminUserEmails = [];
        LevelAdminUserNames = [];
        for (let e = 0; e < emailResults.length; e++) {
            LevelAdminUserEmails.push(emailResults[e].UserPrincipalName);
            LevelAdminUserNames.push(emailResults[e].Title);
        }
    }

    _onCallFailure(data) {
        console.log(data);
    }

    GetSPGroupsManagerUsers(ManagerGrpId) {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/GetById(" + ManagerGrpId + ")/Users";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._OnGetSPGroupsManagerUsersSuccess, OnOffboardModalComponent._onCallFailure);
    }

    _OnGetSPGroupsManagerUsersSuccess(data) {
        console.log(data); //LevelAdminUserEmails
        let emailResults = data.d.results;
        for (let e = 0; e < emailResults.length; e++) {
            ManagerEmails.push(emailResults[e].UserPrincipalName);
            ManagerUserNames.push(emailResults[e].Title);
        }
    }

    GetSPGroupsAssignToUsers(AssignToGrpId) {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/GetById(" + AssignToGrpId + ")/Users";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._OnGetSPGroupsAssignToUsersSuccess, OnOffboardModalComponent._onCallFailure);
    }

    _OnGetSPGroupsAssignToUsersSuccess(data) {
        console.log(data); //LevelAdminUserEmails
        let emailResults = data.d.results;
        AssignToGroupIds = [];
        for (let e = 0; e < emailResults.length; e++) {
            AssignToGroupIds.push(emailResults[e].Id);
        }
    }

    GetAllEmailTemplates() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items?$filter=IsActive1 eq 1";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._onGetAllEmailTemplatesSuccess, OnOffboardModalComponent._onGetAllEmailTemplateFailure);
    }

    _onGetAllEmailTemplatesSuccess(data) {
        if (data) {
            let EmailTempaltesArray = [];
            if (data.d.results.length > 0) {
                let oAllEmailRows = data.d.results;
                for (var i = 0; i < data.d.results.length; i++) {
                    let oAllEmailListContents = {};
                    oAllEmailListContents.ID = oAllEmailRows[i]["ID"];
                    oAllEmailListContents.Body = oAllEmailRows[i]["EmailTemplate"];
                    oAllEmailListContents.Subject = oAllEmailRows[i]["Subject"];
                    oAllEmailListContents.TemplateType = oAllEmailRows[i]["TemplateType"];
                    oAllEmailListContents.IsActive1 = oAllEmailRows[i]["IsActive1"];
                    EmailTempaltesArray.push(oAllEmailListContents);
                }
            }
            OnOffboardModalComponent.SendAllEmails(EmailTempaltesArray);
        }
    }

    SendAllEmails(EmailTempaltesArray) {
        let oEmailTemplate = [];
        let from = "";
        let to = [];
        let body = "";
        let subject = "";
        let Name = $("#txtName").val();
        let DOJ = $("#txtDOJ").val();
        let SelectedPosition = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardPositionSelect");
        let SelectedDepartment = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardDepartmentSelect");
        let Position = SelectedPosition.Value;
        let Department = SelectedDepartment.Value;
        let ReceiverName = "";
        if (Position == "")
            Position = "-";
        if (Department == "")
            Department = "-"
        // Not Needed -- Start
        // Employee Onboard without tasks - Send Email to all LevelAdmins
        // OR 
        // Employee Offboard without tasks - Send Email to all LevelAdmins
        // Not Needed -- End

        // Onboarding Initiated - Send Email to onboarding employee  
        // OR
        // Offboarding Initiated - Send Email to offboarding employee --- for now only to offboarding employee with sharepont user
        //let PersonalEmail = $("#txtPersonalEmail").val();
        if (objEmpOffboard != null) {
            let PersonalEmail = objEmpOffboard.Email;
            if (PersonalEmail != "") {
                if (OnOffboardModalComponent.props.Process == "2") {   //Offoboard
                    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 8);
                }
                //else {
                //    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 7);
                //}
                let Name = $("#txtName").val();
                let DOJ = $("#txtDOJ").val();
                let PresentEmployer = $("#txtPresentEmployer").val();
                let ContactNumber = $("#txtContactNumber").val();
                let AlternateContactNumber = $("#txtAlternateContactNumber").val();
                let Location = $("#txtLocation").val();
                to = [txtPersonalEmail.value];
                subject = oEmailTemplate[0].Subject;
                body = oEmailTemplate[0].Body;
                body = OnOffboardModalComponent.replaceAll(body, '#EmpName#', Name);
                body = body.replace('#CompanyName#', PresentEmployer);
                body = body.replace('#DOJ#', DOJ == null ? "--" : DOJ);
                body = body.replace('#DOR#', DOJ == null ? "--" : DOJ);
                body = body.replace('#PersonalEmail#', PersonalEmail);
                body = body.replace('#ContactNumber#', ContactNumber);
                body = body.replace('#AlternateContactNumber#', AlternateContactNumber);
                body = body.replace('#Location', Location);
                EOBShared.sendEmailNotification(from, to, body, subject, OnOffboardModalComponent.props.Process);
            }
        }
        // Employee Onboard with tasks - Send Email to all LevelAdmins
        // OR
        // Employee Offboard with tasks - Send Email to all LevelAdmins

        if (BKJSShared.NotNullOrUndefined(LevelAdminUserEmails)) {
            if (LevelAdminUserEmails.length != 0) {
                if (OnOffboardModalComponent.props.Process == "2") {   //Offoboard
                    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 3);
                }
                else {
                    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 1);
                }
                for (var lk = 0; lk < ConfigModal.gConfigSettings.CurrentUserLevel.length; lk++) {
                    for (let j = 0; j < objLevelAdminUserEmails.length; j++) {
                        if (objLevelAdminUserEmails[j].LevelId == ConfigModal.gConfigSettings.CurrentUserLevel[lk].ID) {
                            for (let a = 0; a < objLevelAdminUserEmails[j].LevelAdminUserEmails.length; a++) {
                                ReceiverName = objLevelAdminUserEmails[j].LevelAdminUserNames[a];
                                to = [];
                                to.push(objLevelAdminUserEmails[j].LevelAdminUserEmails[a]);
                                subject = oEmailTemplate[0].Subject;
                                body = "";
                                body = oEmailTemplate[0].Body;
                                body = body.replace('#RecieverName#', ReceiverName);
                                body = OnOffboardModalComponent.replaceAll(body, '#EmpName#', Name);
                                body = body.replace('#DOJ#', DOJ == null ? "--" : DOJ);
                                body = body.replace('#Position#', Position);
                                body = body.replace('#Department#', Department);
                                let TaskItems = OnOffboardModalComponent.FilterTasksByLevelIDAndChecked(ConfigModal.gConfigSettings.CurrentUserLevel[lk].ID);
                                var RowsString = "";
                                for (var i = 0; i < TaskItems.length; i++) {
                                    //var ProcessType = (TaskItems[i].ProcessId == 1) ? "Onboarding" : "Offboarding"
                                    var Row = "<tr style='border: 1px solid #ddd; color: #333; padding: 8px; font-family:Arial; font-size:13px;'>"
                                    Row += "<td>" + TaskItems[i].TaskName + "</td>"
                                    Row += "<td>" + TaskItems[i].TaskStartDate + "</td>"
                                    Row += "<td>" + TaskItems[i].DueDate + "</td>"
                                    // Row += "<td>" + TaskItems[i].ActualTaskResponsible + "</td>"
                                    Row += "<td>" + TaskItems[i].CategoryName + "</td>"
                                    ////Row += "<td>" + ProcessType + "</td>"
                                    //Row += "<td>" + moment(TaskItems[i].DueDate).format("MM/DD/YYYY") + "</td>"
                                    Row += "</tr>"
                                    RowsString += Row
                                }
                                body = body.replace("#TasksRows#", RowsString)
                                var ManagerUrl = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
                                body = body.replace("#ManagerUrl", ManagerUrl)

                                EOBShared.sendEmailNotification(from, to, body, subject, OnOffboardModalComponent.props.Process);
                            }
                        }
                    }
                }
            }
        }

        // Send Email to reporting manager -- Start
        if (BKJSShared.NotNullOrUndefined(ManagerEmails)) {
            if (ManagerEmails.length != 0) {
                if (OnOffboardModalComponent.props.Process == "2") {   //Offoboard
                    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 3);
                }
                else {
                    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 1);
                }
                for (let j = 0; j < ManagerEmails.length; j++) {
                    ReceiverName = ManagerUserNames[j];
                    to = [];
                    to.push(ManagerEmails[j]);
                    subject = oEmailTemplate[0].Subject;
                    body = "";
                    body = oEmailTemplate[0].Body;
                    body = body.replace('#RecieverName#', ReceiverName);
                    body = OnOffboardModalComponent.replaceAll(body, '#EmpName#', Name);
                    body = body.replace('#DOJ#', DOJ == null ? "--" : DOJ);
                    body = body.replace('#Position#', Position);
                    body = body.replace('#Department#', Department);
                    let TaskItems = OnOffboardModalComponent.FilterTasksByChecked();
                    var RowsString = ""
                    for (var i = 0; i < TaskItems.length; i++) {
                        var Row = "<tr style='border: 1px solid #ddd; color: #333; padding: 8px; font-family:Arial; font-size:13px;'>"
                        Row += "<td>" + TaskItems[i].TaskName + "</td>"
                        Row += "<td>" + TaskItems[i].TaskStartDate + "</td>"
                        Row += "<td>" + TaskItems[i].DueDate + "</td>"
                        //Row += "<td>" + TaskItems[i].ActualTaskResponsible + "</td>"
                        Row += "<td>" + TaskItems[i].CategoryName + "</td>"
                        Row += "</tr>"
                        RowsString += Row
                    }
                    body = body.replace("#TasksRows#", RowsString)
                    var ManagerUrl = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
                    body = body.replace("#ManagerUrl", ManagerUrl)

                    EOBShared.sendEmailNotification(from, to, body, subject, OnOffboardModalComponent.props.Process);
                }
            }
        }

        // Send Email to reporting manager -- End

        // Onboard task assignment - Send Email to assign task user 
        // OR
        // Offboard task assignment - Send Email to assign task user
        // Group users tasks

        let arrTaskAssignTo = OnOffboardModalComponent.FilterTasksByChecked();
        let isAssignToEmailFound = false;
        let arrVerifiedAssignTo = [];
        let finalArrTasksAssignTo = [];
        let isUserExisitsInArr = false;
        let finalGroup = [];
        for (var ai = 0; ai < arrTaskAssignTo.length; ai++) {
            for (var aj = 0; aj < arrTaskAssignTo[ai].ActualTaskResponsible.results.length; aj++) {
                if (arrVerifiedAssignTo.length > 0) {
                    for (let fi = 0; fi < arrVerifiedAssignTo.length; fi++) {
                        if (arrVerifiedAssignTo[fi] == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                            isUserExisitsInArr = true;
                            break;
                        }
                    }
                }
                if (!isUserExisitsInArr) {
                    for (var ak = 0; ak < SPUsersInfo.length; ak++) {
                        if (SPUsersInfo[ak].Id == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                            if (SPUsersInfo[ak].UserPrincipalName) {
                                isAssignToEmailFound = true;    /// took all tasks of same assignto id user
                                for (var bi = 0; bi < arrTaskAssignTo.length; bi++) {
                                    for (var bj = 0; bj < arrTaskAssignTo[bi].ActualTaskResponsible.results.length; bj++) {
                                        if (arrTaskAssignTo[ai].ActualTaskResponsible.results[aj] == arrTaskAssignTo[bi].ActualTaskResponsible.results[bj]) {
                                            finalArrTasksAssignTo.push(arrTaskAssignTo[bi]);
                                            if (arrVerifiedAssignTo.length > 0) {
                                                for (let gi = 0; gi < arrVerifiedAssignTo.length; gi++) {
                                                    if (arrVerifiedAssignTo[gi] == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                                                        isUserExisitsInArr = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (!isUserExisitsInArr) {
                                                arrVerifiedAssignTo.push(arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]);
                                            }
                                        }
                                    }
                                }
                                /// if this id exists in groupid then take out that group id tasks
                                if (AssignToUserEmails.length > 0) {
                                    for (let atu = 0; atu < AssignToUserEmails.length; atu++) {
                                        for (let atv = 0; atv < AssignToUserEmails[atu].AssignToUserIdsFromGroup.length; atv++) {
                                            if (AssignToUserEmails[atu].AssignToUserIdsFromGroup[atv] == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                                                finalGroup.push(AssignToUserEmails[atu].GroupId);
                                                break;
                                            }
                                        }
                                    }
                                }
                                for (var ci = 0; ci < arrTaskAssignTo.length; ci++) {
                                    for (var cj = 0; cj < arrTaskAssignTo[ci].ActualTaskResponsible.results.length; cj++) {
                                        for (let ck = 0; ck < finalGroup.length; ck++) {
                                            if (arrTaskAssignTo[ci].ActualTaskResponsible.results[cj] == finalGroup[ck]) {
                                                finalArrTasksAssignTo.push(arrTaskAssignTo[ci]);
                                                arrVerifiedAssignTo.push(arrTaskAssignTo[ci].ActualTaskResponsible.results[cj]);
                                                break;
                                            }
                                        }
                                    }
                                }

                                break;
                            }
                        }
                    }
                    if (!isAssignToEmailFound) {
                        if (AssignToUserEmails.length > 0) {
                            for (let atu = 0; atu < AssignToUserEmails.length; atu++) {
                                if (AssignToUserEmails[atu].GroupId == arrTaskAssignTo[ai].ActualTaskResponsible.results[aj]) {
                                    for (var ei = 0; ei < arrTaskAssignTo.length; ei++) {
                                        for (var ej = 0; ej < arrTaskAssignTo[ei].ActualTaskResponsible.results.length; ej++) {
                                            if (arrTaskAssignTo[ei].ActualTaskResponsible.results[ej] == AssignToUserEmails[atu].GroupId) {
                                                //finalArrTasksAssignTo.push(arrTaskAssignTo[ei]);
                                                //arrVerifiedAssignTo.push(arrTaskAssignTo[ei].ActualTaskResponsible.results[ej]);
                                                for (let atv = 0; atv < AssignToUserEmails[atu].AssignToUserIdsFromGroup.length; atv++) {
                                                    for (var di = 0; di < arrTaskAssignTo.length; di++) {
                                                        for (var dj = 0; dj < arrTaskAssignTo[di].ActualTaskResponsible.results.length; dj++) {
                                                            if (AssignToUserEmails[atu].AssignToUserIdsFromGroup[atv] == arrTaskAssignTo[di].ActualTaskResponsible.results[dj]) {
                                                                finalArrTasksAssignTo.push(arrTaskAssignTo[di]);
                                                                if (arrVerifiedAssignTo.length > 0) {
                                                                    for (let li = 0; li < arrVerifiedAssignTo.length; li++) {
                                                                        if (arrVerifiedAssignTo[li] == arrTaskAssignTo[di].ActualTaskResponsible.results[dj]) {
                                                                            isUserExisitsInArr = true;
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                                if (!isUserExisitsInArr) {
                                                                    arrVerifiedAssignTo.push(AssignToUserEmails[atu].AssignToUserIdsFromGroup[atv]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

        //if (OnOffboardModalComponent.props.Process == "2") {   //Offoboard
        //    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 6);
        //}
        //else {
        //    oEmailTemplate = OnOffboardModalComponent.FilterEmailTemplate(EmailTempaltesArray, 5);
        //}
        //for (let j = 0; j < ManagerEmails.length; j++) {
        //    to = [];
        //    to.push(ManagerEmails[j]);
        //    subject = oEmailTemplate[0].Subject;
        //    body = "";
        //    body = oEmailTemplate[0].Body;
        //    body = OnOffboardModalComponent.replaceAll(body, '#EmpName#', Name);
        //    body = body.replace('#CompanyName#', PresentEmployer);
        //    body = body.replace('#DOJ#', DOJ == null ? "--" : DOJ);
        //    body = body.replace('#DOR#', DOJ == null ? "--" : DOJ);
        //    //body = body.replace('#PersonalEmail#', PersonalEmail);
        //    body = body.replace('#ContactNumber#', ContactNumber);
        //    body = body.replace('#AlternateContactNumber#', AlternateContactNumber);
        //    body = body.replace('#Location', Location);

        //    let TaskItems = OnOffboardModalComponent.FilterTasksByChecked();
        //    var RowsString = ""
        //    for (var i = 0; i < TaskItems.length; i++) {
        //        //var ProcessType = (TaskItems[i].ProcessId == 1) ? "Onboarding" : "Offboarding"
        //        var Row = "<tr style='border:gray;border:solid;border-bottom-width:1px;height:30px;'>"
        //        Row += "<td>" + TaskItems[i].TaskName + "</td>"
        //        Row += "<td>" + TaskItems[i].DueDate + "</td>"
        //        Row += "<td>" + TaskItems[i].CategoryName + "</td>"
        //        ////Row += "<td>" + ProcessType + "</td>"
        //        //Row += "<td>" + moment(TaskItems[i].DueDate).format("MM/DD/YYYY") + "</td>"
        //        Row += "</tr>"
        //        RowsString += Row
        //    }
        //    body = body.replace("#TasksRows#", RowsString)
        //    var MyTaskUrl = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
        //    body = body.replace("#MyTaskUrl", MyTaskUrl)

        //    EOBShared.sendEmailNotification(from, to, body, subject, OnOffboardModalComponent.props.Process);
        //}
    }

    FilterEmailTemplate(EmailTempaltesArray, ID) {
        var ListItemsFilterData = EmailTempaltesArray.filter(function (el) {
            return el.ID == ID;
        });
        return ListItemsFilterData;
    }

    _onGetAllEmailTemplateFailure(data) {
        console.log("failure");
    }

    _onItemSaveFailed(data) {
        console.log(data);
    }

    //// Onboard Offboard Custom field methods --start
    LoadCustomFields() {
        ////var Process = "1";
        //if (Process == null || Process == "" || Process == undefined) {
        //    Process = 1;
        //}

        if (OnOffboardModalComponent.props.Process == "1")
            lstCustomFields = "EmployeeCustomFieldsOnBoard";
        else
            lstCustomFields = "EmployeeCustomFieldsOffBoard";
        OnOffboardModalComponent.LoadEmployeeCustomFieldsControls();
    }

    IsNumber(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode < 96 || charCode > 105) && (charCode < 48 || charCode > 57)) {
            evt.target.value = "";
            return false;
        }
        return true;
    }

    LoadEmployeeCustomFieldsControls() {
        var clientContext = new SP.ClientContext.get_current();
        var web = clientContext.get_web();
        var list = web.get_lists().getByTitle(lstCustomFields);
        OnOffboardModalComponent.listFields = list.get_fields();
        clientContext.load(OnOffboardModalComponent.listFields);
        clientContext.executeQueryAsync(Function.createDelegate(OnOffboardModalComponent,
            OnOffboardModalComponent.onListFieldsQuerySucceeded), Function.createDelegate(OnOffboardModalComponent,
                OnOffboardModalComponent.onListFieldsQueryFailed));
    }

    onListFieldsQuerySucceeded() {
        var fieldEnumerator = OnOffboardModalComponent.listFields.getEnumerator();
        var customFieldsHtml = [];
        var countField = 0;
        allCustomFields = [];
        allCustomFieldsName = [];
        while (fieldEnumerator.moveNext()) {
            var oField = fieldEnumerator.get_current();
            var schema = oField.get_schemaXml();
            if (schema.indexOf('SourceID="http://schemas.microsoft.com/sharepoint/v3"') == -1) {
                if (oField.get_internalName() != "EmployeeID") {
                    var htmlFtype = '';
                    var optionHtml = '';
                    var fType = oField.get_fieldTypeKind();
                    if (fType == SP.FieldType.choice) {
                        var choices = oField.get_choices();
                        console.log(choices[0]);
                        var comboValues = [];
                        for (var i = 0; i < choices.length; i++) {
                            optionHtml = <option value={choices[i]}>{choices[i]}</option>;
                            comboValues.push(optionHtml);
                        }
                        var choiceFormat = oField.get_editFormat();
                        /*if (choiceFormat == 0) {*///ddl
                        htmlFtype = <div className="col-md-3"><div className="form-group"><label>{oField.get_title()}</label><select id={oField.get_internalName()} className="form-control form-control-sm">{comboValues}</select></div></div>;
                        //}
                        //else if (choiceFormat == 1) { //radio buttons
                        //    htmlFtype = '<select id="' + oField.get_internalName() + '">' +
                        //        '<option> Select</option >' +
                        //        '<option value="HR" title="HR">HR</option>' +
                        //        '<option value="Manager" title="Manager">Manager</option></select>';
                        //}
                        //else {//checkboxes 
                        //}
                    }
                    else {
                        htmlFtype = OnOffboardModalComponent.GetFieldType(fType, oField.get_title(), oField.get_internalName());
                    }
                    if (htmlFtype != "") {
                        customFieldsHtml.push(htmlFtype);
                        //customFieldsHtml = htmlFtype;
                        allCustomFields[countField] = oField.get_internalName();
                        allCustomFieldsName[countField] = oField.get_title();
                        countField = countField + 1;
                    }
                }
            }
        }
        //if (customFieldsHtml != "")
        //    customFieldsHtml = <hr style='border: 0;height: 1px;background-color: lightgray;' /> + customFieldsHtml;
        //$('#divEmployeeCustomFields').html(customFieldsHtml);
        if (customFieldsHtml != "") {
            OnOffboardModalComponent.setState({ sEmployeeCustomFields: customFieldsHtml });
            var x = document.getElementById("divEmployeeCustomFields").querySelectorAll(".datetime");
            var i;
            for (i = 0; i < x.length; i++) {
                var ctrlId = x[i].id;
                $("#" + ctrlId).datepicker({
                    autoclose: true,
                    todayHighlight: true,
                    format: "mm/dd/yyyy"
                }).datepicker().on("hide", function (e) {
                    //DashboardComponent._UpdateSearchIcon();
                });
            }
        }
        else {
            document.getElementById("divEmployeeCustomFields").style.display = "none";
        }
        // OnOffboardModalComponent.LoadDefaultSettings();
    }

    onListFieldsQueryFailed(sender, args) { }

    GetFieldType(fType, title, name) {
        var fthtml = '';
        let strName = '';
        switch (fType) {
            case SP.FieldType.text:
                console.log("text");
                strName = "txt" + name;
                fthtml = <div className="col-md-3"><div className="form-group"><label>{title}</label><input name={strName} id={name} type="text" className="form-control form-control-sm text" placeholder={title} /></div></div>;
                break;
            case SP.FieldType.number:
                console.log("number");
                strName = "num" + name;
                fthtml = <div className="col-md-3"><div className="form-group"><label>{title}</label><input name={strName} id={name} type="text" onKeyUp={OnOffboardModalComponent.IsNumber} className="form-control form-control-sm text" placeholder={title} /></div></div>; /*onKeyUp = { OnOffboardModalComponent.IsNumber }*/
                break;
            case SP.FieldType.dateTime:
                console.log("dateTime");
                strName = "dt" + name;
                fthtml = <div className="col-md-3"><div className="form-group input-with-icon"><label>{title}</label><input name={strName} id={name} type="text" className="form-control form-control-sm datetime" placeholder={title} /><div className="input-icon"><a herf="#"><i className="fa fa-calendar" /></a></div></div></div>;
                break;
            //case SP.FieldType.choice:
            //    console.log("choice");
            //    fthtml = '<div class="input-control select full-size input-inner-text"><input name="ch' + countField + '" id="ctmEmpField' + countField + '" type="text"  placeholder="' + title + '"  readonly="true"/></div>';
            //    break;
        }
        return fthtml;
    }

    fn_InsertCustomFields(vEditID) {
        console.log("Inserting customFields start");
        let clientContext = new SP.ClientContext.get_current();
        let oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        let itemCreateInfo = new SP.ListItemCreationInformation();
        OnOffboardModalComponent.oListItem = oList.addItem(itemCreateInfo);
        OnOffboardModalComponent.oListItem.set_item("EmployeeID", vEditID);
        OnOffboardModalComponent.oListItem.set_item("Title", "");
        if (allCustomFields.length != 0) {
            for (var i = 0; i < allCustomFields.length; i++) {
                if ($("#" + allCustomFields[i]).val() != "")
                    OnOffboardModalComponent.oListItem.set_item(allCustomFields[i], $("#" + allCustomFields[i]).val());
                else
                    OnOffboardModalComponent.oListItem.set_item(allCustomFields[i], null);
                if (allCustomFields[i] == "IP_x0020_Address") {
                    ipAddress = $("#" + allCustomFields[i]).val();
                }
                if (allCustomFields[i] == "Location") {
                    cfLocation = $("#" + allCustomFields[i]).val();
                }
            }
        }
        OnOffboardModalComponent.oListItem.update();
        clientContext.load(OnOffboardModalComponent.oListItem);
        clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededInsertCustomFields), Function.createDelegate(this, this.onQueryFailedMaster));
    }

    onQuerySucceededInsertCustomFields() {
        console.log("Insert in Customfields success.");
        if (OnOffboardModalComponent.state.ItemId > 0) {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Updated successfully.");
        }
        else {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", OnOffboardModalComponent.state.ProcessText + "ing initiated.");
        }
        OnOffboardModalComponent.Reset();
        OnOffboardModalComponent.CloseModal();
    }

    onQueryFailedMaster(sender, args) {
        console.log("Insert in Customfields failed.");
        OnOffboardModalComponent.Reset();
        OnOffboardModalComponent.CloseModal();

    }

    GetSetEmployeeCustomFieldValues(eID) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + eID + '</Value></Eq></Where></Query></View>');
        OnOffboardModalComponent.collListItem1 = oList.getItems(camlQuery);
        clientContext.load(OnOffboardModalComponent.collListItem1);
        clientContext.executeQueryAsync(
            function () {
                var listItemEnumerator = OnOffboardModalComponent.collListItem1.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    var cusID = oListItem.get_item('ID');
                    OnOffboardModalComponent.SetEmployeeCustomFieldValues(cusID);
                }
            },
            function (sender, args) {
                console.log("Error in getting customfield values");
            });
    }

    SetEmployeeCustomFieldValues(eCusID) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        var listItem = oList.getItemById(eCusID);
        clientContext.load(listItem);
        clientContext.executeQueryAsync(
            function () {
                for (var i = 0; i < allCustomFields.length; i++) {
                    if ($('#' + allCustomFields[i]).hasClass("datetime")) {
                        if (listItem.get_item(allCustomFields[i]))
                            $('#' + allCustomFields[i]).val(moment(listItem.get_item(allCustomFields[i])).format('MM/DD/YYYY'));
                        else
                            $('#' + allCustomFields[i]).val("");
                    }
                    else {
                        $('#' + allCustomFields[i]).val(listItem.get_item(allCustomFields[i]));
                    }
                    if (allCustomFields[i] == "IP_x0020_Address") {
                        ipAddress = listItem.get_item(allCustomFields[i]);
                    }
                    if (allCustomFields[i] == "Location") {
                        cfLocation = listItem.get_item(allCustomFields[i]);
                    }
                }
            },
            function (sender, args) {
                console.log("Error in getting customfield values");
            });
    }

    UpdateEmployeeCustomFieldsDetail(vIDEmployee) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + vIDEmployee + '</Value></Eq></Where></Query></View>');
        OnOffboardModalComponent.collListItem = oList.getItems(camlQuery);
        clientContext.load(OnOffboardModalComponent.collListItem);
        clientContext.executeQueryAsync(
            function () {
                var listItemEnumerator = OnOffboardModalComponent.collListItem.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    var cusID = oListItem.get_item('ID');
                    OnOffboardModalComponent.finalUpdateCustomFieldDetail(cusID, vIDEmployee);
                }
            },
            function (sender, args) {
                console.log("Error in getting customfield values");
                OnOffboardModalComponent.Reset();
                OnOffboardModalComponent.CloseModal();
            });
    }

    finalUpdateCustomFieldDetail(fuid, vsIDEmployee) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        OnOffboardModalComponent.oListItem = oList.getItemById(fuid);
        if (allCustomFields.length != 0) {
            OnOffboardModalComponent.oListItem.set_item("EmployeeID", vsIDEmployee);
            OnOffboardModalComponent.oListItem.set_item("Title", "");
            for (var i = 0; i < allCustomFields.length; i++) {
                if ($("#" + allCustomFields[i]).val() != "")
                    OnOffboardModalComponent.oListItem.set_item(allCustomFields[i], $("#" + allCustomFields[i]).val());
                else
                    OnOffboardModalComponent.oListItem.set_item(allCustomFields[i], null);
                if (allCustomFields[i] == "IP_x0020_Address") {
                    ipAddress = $("#" + allCustomFields[i]).val();
                }
                if (allCustomFields[i] == "Location") {
                    cfLocation = $("#" + allCustomFields[i]).val();
                }
            }
        }
        OnOffboardModalComponent.oListItem.update();
        clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySuccessdedUpdateEmployeeCustomFieldsDetail), Function.createDelegate(this, this.onQueryFailedUpdateEmployeeCustomFieldsDetail));
    }

    onQuerySuccessdedUpdateEmployeeCustomFieldsDetail() {
        if (OnOffboardModalComponent.state.ItemId > 0) {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", ConfigModal.gConfigSettings.DisplayTextEmployee + " updated successfully.")
        }
        else {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", ConfigModal.gConfigSettings.DisplayTextEmployee + " " + OnOffboardModalComponent.state.ProcessText + "ed successfully.")
        }
        console.log("onQuerySuccessdedUpdateEmployeeCustomFieldsDetail");
        OnOffboardModalComponent.Reset();
        OnOffboardModalComponent.CloseModal();
    }

    onQueryFailedUpdateEmployeeCustomFieldsDetail() {
        OnOffboardModalComponent.Reset();
        OnOffboardModalComponent.CloseModal();
    }

    LoadEmployeeCustomFieldsDetails(ID) {
        detailsID = ID;
        var clientContext = new SP.ClientContext.get_current();
        var web = clientContext.get_web();
        var list = web.get_lists().getByTitle(lstCustomFields);
        OnOffboardModalComponent.listFields = list.get_fields();
        clientContext.load(OnOffboardModalComponent.listFields);
        clientContext.executeQueryAsync(Function.createDelegate(this,
            this.onLoadEmployeeCustomFieldsDetailsSucceeded), Function.createDelegate(this,
                OnOffboardModalComponent.onListFieldsQueryFailed));
    }

    onLoadEmployeeCustomFieldsDetailsSucceeded() {
        var fieldEnumerator = OnOffboardModalComponent.listFields.getEnumerator();
        var customFieldsHtml = '';
        var countField = 0;
        OnOffboardModalComponent.allCustomFieldsDetail = [];
        while (fieldEnumerator.moveNext()) {
            var oField = fieldEnumerator.get_current();
            var schema = oField.get_schemaXml();
            if (schema.indexOf('SourceID="http://schemas.microsoft.com/sharepoint/v3"') == -1) {
                if (oField.get_internalName() != "EmployeeID") {
                    let fType = oField.get_fieldTypeKind();
                    let htmlFtype = OnOffboardModalComponent.GetFieldTypeForDetails(fType, oField.get_title(), oField.get_internalName());
                    if (htmlFtype != "") {
                        customFieldsHtml = htmlFtype;
                        allCustomFields[countField] = oField.get_internalName();
                        //allCustomFieldsName[countField] = oField.get_title();
                        countField = countField + 1;
                    }
                }
            }
        }
        if (customFieldsHtml != "")
            customFieldsHtml = <hr style='border: 0;height: 1px;background-color: lightgray;' /> + customFieldsHtml;
        OnOffboardModalComponent.setState({ sEmployeeCustomFields: customFieldsHtml });
        //$('#divEmployeeCustomFields').html(customFieldsHtml);
        OnOffboardModalComponent.GetEmployeeCustomFieldValues(detailsID);
        //$('#divEmployeeCustomFields').html(customFieldsHtml);
        //var x = document.getElementById("divEmployeeCustomFields").querySelectorAll(".datetime");
        //var i;
        //for (i = 0; i < x.length; i++) {
        //    var ctrlId = x[i].id;
        //    $("#" + ctrlId).datepicker();
        //}
    }

    GetFieldTypeForDetails(fType, title, name) {
        var fthtml = '';
        switch (fType) {
            case SP.FieldType.text:
                console.log("text");
                fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;" name="spn' + name + '" id="' + name + '"  class="text" /></div>';
                break;
            case SP.FieldType.number:
                console.log("number");
                fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;"  name="spn' + name + '" id="' + name + '"  class="text" /></div>';
                break;
            case SP.FieldType.dateTime:
                console.log("dateTime");
                fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;"  name="spn' + name + '" id="' + name + '"  class="datetime" /></div>';
                break;
            case SP.FieldType.choice:
                console.log("choice");
                fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;" name="spn' + name + '" id="' + name + '"  class="text" /></div>';
                break;
        }
        return fthtml;
    }

    GetEmployeeCustomFieldValues(dID) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + dID + '</Value></Eq></Where></Query></View>');
        OnOffboardModalComponent.collListItem = oList.getItems(camlQuery);
        clientContext.load(OnOffboardModalComponent.collListItem);
        clientContext.executeQueryAsync(
            function () {
                var listItemEnumerator = OnOffboardModalComponent.collListItem.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    var cusID = oListItem.get_item('ID');
                    OnOffboardModalComponent.SetEmployeeCustomFieldValuesDetails(cusID);
                }
            },
            function (sender, args) {
                console.log("Error in getting customfield values");
            });
    }

    SetEmployeeCustomFieldValuesDetails(sCusID) {
        var clientContext = new SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
        var listItem = oList.getItemById(sCusID);
        clientContext.load(listItem);
        clientContext.executeQueryAsync(
            function () {
                $("#divEmployeeCustomFields").show();
                for (var i = 0; i < allCustomFields.length; i++) {
                    if ($('#' + allCustomFields[i]).hasClass("datetime")) {
                        if (listItem.get_item(allCustomFields[i]))
                            $('#' + allCustomFields[i]).html(moment(listItem.get_item(allCustomFields[i])).format('MM/DD/YYYY'));
                        else
                            $('#' + allCustomFields[i]).val("");
                    }
                    else {
                        $('#' + allCustomFields[i]).html(listItem.get_item(allCustomFields[i]));
                    }
                    if (allCustomFields[i] == "IP_x0020_Address") {
                        ipAddress = listItem.get_item(allCustomFields[i]);
                    }
                    if (allCustomFields[i] == "Location") {
                        cfLocation = listItem.get_item(allCustomFields[i]);
                    }
                }
            },
            function (sender, args) {
                console.log("Error in getting customfield values");
            });
    }

    getChoices() {
        var context = new SP.ClientContext.get_current();
        var web = context.get_web();
        // Get task list
        var testList = web.get_lists().getByTitle("TestChoice");//列表名
        // Get Priority field (choice field)
        var choiceField = context.castTo(testList.get_fields().getByInternalNameOrTitle("TestChoice"),//栏名
            SP.FieldChoice);
        context.load(choiceField);
        // Call server
        context.executeQueryAsync(Function.createDelegate(this, onSuccessMethod),
            Function.createDelegate(this, onFailureMethod));
        function onSuccessMethod(sender, args) {
            // Get string arry of possible choices (but NOT fill-in choices)
            var choices = choiceField.get_choices();
            console.log(choices[0]);//得到的是一个数组。那么我们就可以这么写 
            for (var i = 0; i < choices.length; i++) {
                var optionHtml = "<option value='" + choices[i] + "'>" + choices[i] + "</option>";
                $('#Test select').append(optionHtml);
            }

            //var myoption = choices.join(",");
            //var selectOptions = new Array;
            //selectOptions = myoption.split(",");
            //for (var i = 0; i < selectOptions.length; i++) {

            //var optionHtml = "<option value='" + selectOptions[i] + "'>" + selectOptions[i] + "</option>";
            //$('#Test select').append(optionHtml);
            //}
        }
        function onFailureMethod(sender, args) {
            console.log("oh oh!");
        }
    }
    //// Onboard Offboard Custom field methods --end

    //// Offboarding Employee people picker functionality --- start
    CreateOffboardEmpPeoplePicker() {
        BKSPPeoplePickerRest.CreatePeoplePicker("offboardempuserpicker", false, OnOffboardModalComponent._OnAssignedToChange);
    }

    UserTypeChange(event) {
        OnOffboardModalComponent.setState({
            UserType: event.target.value
        });
        if (event.target.id == "rdoSharePointUser") {
            $("#divEmployeeNameText").hide();
            $("#txtName").removeClass("form-control form-control-sm BKValidateEmptyValue").addClass("form-control form-control-sm");
            $("#divEmployeeNamePeoplePicker").show();
            $("#rdoSharePointUser").checked = true;
            $("#rdoOtherUser").checked = false;
            $("#txtName").val("");
        }
        else {
            $("#divEmployeeNameText").show();
            $("#txtName").removeClass("form-control form-control-sm").addClass("form-control form-control-sm BKValidateEmptyValue");
            $("#divEmployeeNamePeoplePicker").hide();
            $("#rdoSharePointUser").checked = false;
            $("#rdoOtherUser").checked = true;
        }
    }
    //// Offboarding Employee people picker functionality --- end

    //// Onboard Offboard Edit page Abort functionality --- start
    AbortReInitiateOnboardOffboard() {
        let StatusE = "";
        let RequestMethod = null;
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmployeeOnBoard);
        if (OnOffboardModalComponent.state.ItemId > 0) {
            if ($("#btnOnOffBoardAbort").val() == "Abort") {
                StatusE = "Aborted";
            }
            else {
                StatusE = "Open";
            }
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__StatusE": StatusE
            }
            let Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/Items(" + OnOffboardModalComponent.state.ItemId + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, OnOffboardModalComponent._onStatusChangeSuccess, OnOffboardModalComponent._onStatusChangeFailed);
        }
    }

    _onStatusChangeSuccess() {
        $("#btnReset").val("Cancel");
        if ($("#btnOnOffBoardAbort").val() == "Re-Initiate") {
            $("#btnOnOffBoardAbort").val("Abort");
            $("#btnReset").show();
            $("#btnOnOffBoardAddSave").show();
            OnOffboardModalComponent.setState({ ResetButtonText: "Cancel" });
        }
        else {
            $("#btnOnOffBoardAbort").val("Re-Initiate");
            $("#btnReset").hide();
            $("#btnOnOffBoardAddSave").hide();
        }
    }

    _onStatusChangeFailed() { }
    //// Onboard Offboard Edit page Abort functionality --- end

    //// Task section Accordian changes --- start
    GetLevels() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/items?$select=ID%2CTitle%2CResponsibleUsers%2FID%2CResponsibleUsers%2FTitle&$expand=ResponsibleUsers%2FID%2CResponsibleUsers%2FTitle&$filter=IsActive1 eq 1";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._FillLevels, OnOffboardModalComponent._onLevelDataGetFailure)
    }

    _onLevelDataGetFailure(data) {
        console.log("Failed in getting process items.");
    }

    _FillLevels(data) {
        var LevelTabs = [];
        var LevelIDs = [];
        LevelTitles = [];
        for (var k = 0; k < data.d.results.length; k++) {
            let LevelID = data.d.results[k]["ID"];
            let LevelTitle = data.d.results[k]["Title"];
            //let activeClassName = "nav-link";
            //if (k == 0)
            //    activeClassName = "nav-link active";
            //let Option = <li className="nav-item"><a className={activeClassName} data-toggle="tab" href={"#" + LevelTitle}>{LevelTitle}</a></li>;
            //LevelTabs.push(Option);
            let LvlTitle = OnOffboardModalComponent.replaceAll(LevelTitle, ' ', '');
            let activeClassName = "nav-link";
            if (k == 0)
                activeClassName = "nav-link active";
            let Option = <a className={activeClassName} id={LvlTitle + "tab"} data-toggle="pill" href={"#" + LvlTitle} role="tab" aria-controls={LvlTitle} aria-selected="true">{LevelTitle}</a>
            LevelTabs.push(Option);
            LevelIDs.push(LevelID);
            LevelTitles.push(LevelTitle);
        }
        OnOffboardModalComponent.setState({ LevelTabs: LevelTabs });
        arrLevelIds = LevelIDs;
        OnOffboardModalComponent.GetTaskGrids();
    }

    GetTaskGrids() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items?$select=OData__AssignedToId%2CAttachments%2CAttachmentFiles%2CID%2COData__TaskName%2COData__ResolutionDays%2CTaskType1%2CIsActive1%2CMandatoryTaskType%2CTaskFlow%2CRemarks%2CDependentTasks%2CTaskDepartment%2FOData__DepartmentName%2CTaskLevel%2FTitle%2CTaskLevel%2FID%2CTaskDepartment%2FID%2CProcessType%2FTitle%2CProcessType%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
        Url += "&$expand=AttachmentFiles%2CTaskDepartment%2FOData__DepartmentName%2CProcessType%2FTitle%2CTaskLevel%2FTitle%2CTaskLevel%2FID%2CTaskDepartment%2FID%2CProcessType%2FTitle%2CProcessType%2FID%2COData__IDCategory%2FCategoryName1%2COData__IDCategory%2FID";
        Url += "&$filter=IsActive1 eq 1 and ProcessTypeId/ID eq '" + OnOffboardModalComponent.props.Process + "'";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._FillTaskGrids, OnOffboardModalComponent._onTaskGridFailure)
    }

    _FillTaskGrids(data, isAtData) {
        let LevelIDs = arrLevelIds;
        let containsLevelIds = [];
        let arrgridheader = [];
        if (isAtData != true) {
            arrAllTasks = [];
            let oAllRows = data.d.results;
            for (var i = 0; i < oAllRows.length; i++) {
                let oAllListContents = {};
                oAllListContents.IDStandardTask = oAllRows[i]["ID"];
                oAllListContents.ActualTaskTempId = 0;
                oAllListContents.ActualTaskId = 0;
                oAllListContents.ActualTaskResponsible = oAllRows[i]["OData__AssignedToId"];
                oAllListContents.TaskName = oAllRows[i]["OData__TaskName"];
                oAllListContents.ResolutionDays = oAllRows[i]["OData__ResolutionDays"];
                oAllListContents.IDCategory = oAllRows[i]["OData__IDCategory"].ID;
                oAllListContents.CategoryName = oAllRows[i]["OData__IDCategory"].CategoryName1;
                oAllListContents.IDDepartment = oAllRows[i]["TaskDepartment"].ID;
                oAllListContents.DepartmentName = oAllRows[i]["TaskDepartment"].OData__DepartmentName;
                oAllListContents.IDTaskLevel = oAllRows[i]["TaskLevel"].ID;
                oAllListContents.TaskLevelName = oAllRows[i]["TaskLevel"].Title;
                oAllListContents.IsActive1 = oAllRows[i]["IsActive1"];
                oAllListContents.Remark = oAllRows[i]["Remarks"];
                oAllListContents.IDProcessType = oAllRows[i]["ProcessType"].ID;
                oAllListContents.ProcessTypeName = oAllRows[i]["ProcessType"].Title;
                oAllListContents.TaskFlow = oAllRows[i]["TaskFlow"];
                oAllListContents.TaskType = oAllRows[i]["TaskType1"];
                if (BKJSShared.NotNullOrUndefined(oAllRows[i]["Status"]))
                    oAllListContents.Status = oAllRows[i]["Status"];
                else
                    oAllListContents.Status = "Open";
                if (oAllRows[i]["TaskAssignType"] != null)
                    oAllListContents.TaskAssignType = oAllRows[i]["TaskAssignType"];
                else
                    oAllListContents.TaskAssignType = oAllRows[i]["TaskType1"];
                if (oAllRows[i]["MandatoryTaskType"]) {
                    oAllListContents.Checked = true;
                }
                else {
                    oAllListContents.Checked = false;
                }
                oAllListContents.isMandatory = oAllRows[i]["MandatoryTaskType"];
                oAllListContents.AttachmentFiles = oAllRows[i]["AttachmentFiles"].results;
                oAllListContents.DependentTasks = oAllRows[i]["DependentTasks"];
                arrAllTasks.push(oAllListContents);
            }

            //if (TaskTemplateDetailTaskIds.length != 0) {
            //    OnOffboardModalComponent.GetGridByTaskTemplateTypeTaskIds();
            //}
            //if (OnOffboardModalComponent.state.Action == "Edit" && TaskTemplateDetailTaskIds.length == 0)
            if (OnOffboardModalComponent.state.Action == "Edit") {
                OnOffboardModalComponent.GetActualTaskDetails();
            }
        }
        for (var k = 0; k < LevelIDs.length; k++) {
            let isAllowEdit = false;
            if (ConfigModal.gConfigSettings.isAllowAllUsers == true) {
                isAllowEdit = true;
            }
            else if (ConfigModal.gConfigSettings.isCurrentUserAdmin == true) {
                isAllowEdit = true;
            }
            if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                for (var li = 0; li < ConfigModal.gConfigSettings.CurrentUserLevel.length; li++) {
                    if (ConfigModal.gConfigSettings.CurrentUserLevel[li].isAllowEdit) {
                        if (ConfigModal.gConfigSettings.CurrentUserLevel[li].ID == LevelIDs[k])
                            isAllowEdit = true;
                        break;
                    }
                }
            }
            let LevelID = LevelIDs[k];
            let levelWiseTask = [];
            let checkAllId = "checkAllId" + LevelID;
            let activeClassName = "tab-pane fade";
            if (k == 0)
                activeClassName = "tab-pane active";
            GridRows = arrAllTasks;
            var arrTasksByLevelIDS = OnOffboardModalComponent.FilterTasksByLevelID(LevelID);
            GridRows = arrTasksByLevelIDS;
            OnOffboardModalComponent.CreateStandardGridRows(isAllowEdit);
            let LvlTitle = OnOffboardModalComponent.replaceAll(LevelTitles[k], ' ', '');
            let rowgridheader =
                <div className={activeClassName} id={LvlTitle} role="tabpanel" aria-labelledby={LvlTitle + "tab"}>
                    <h6>{LevelTitles[k]}</h6>
                    <div>
                        <table className="table table-striped table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th width="50%"><label htmlFor={checkAllId}>Task Name</label>
                                    </th>
                                    <th>
                                        Category
                                    </th>
                                    <th>Department
                                    </th>
                                    <th>Resolution Days
                                    </th>
                                    <th>Edit
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{DataRows}</tbody>
                        </table>
                    </div>
                </div>
            arrgridheader.push(rowgridheader);
        }
        OnOffboardModalComponent.setState({ gridHeader: arrgridheader }, EOBConstants.SetNewThemeColor);
    }

    GetGridByTaskTemplateTypeTaskIds() {
        let objIndex = 0;
        for (let taskTempTaskId = 0; taskTempTaskId < TaskTemplateDetailTaskIds.length; taskTempTaskId++) {
            objIndex = arrAllTasks.findIndex((obj => obj.IDStandardTask == TaskTemplateDetailTaskIds[taskTempTaskId]));
            if (arrAllTasks) {
                arrAllTasks[objIndex].IDStandardTask = TaskTemplateDetailTaskIds[taskTempTaskId];
                arrAllTasks[objIndex].Checked = true;
            }
        }
    }

    GetActualTaskDetails() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?";
        Url += "$select=Attachments%2CAttachmentFiles%2cAssignedToId%2cID%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CStatus%2cTitle%2cOData__IDCategory/CategoryName1%2cOData__IDCategory/ID%2COData__IDStandardTaskId%2CResolutionDays%2CTaskLevel%2FID%2CTaskLevel%2FTitle%2CProcess%2FID%2CProcess%2FTitle%2CTaskFlow%2CTypeOfTask%2CStatus%2CTaskAssignType%2cMandatoryTaskType%2CStartDate";
        Url += "&$expand=AttachmentFiles%2cOData__IDCategory/CategoryName1%2cOData__IDCategory/ID%2FOData__EmployeeID/OData__EmployeeName%2cOData__EmployeeID/ID%2CDepartments%2F_DepartmentName%2CTaskLevel%2FID%2CTaskLevel%2FTitle%2CProcess/ID,Process/Title";
        Url += "&$filter=OData__EmployeeID eq ('" + OnOffboardModalComponent.state.ItemId + "')";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent.FillActualTaskDataInGridSuccess, OnOffboardModalComponent.FillActualTaskDataInGridFailure)
    }

    CreateStandardGridRows(isAllowLevelTaskEdit) {
        DataRows = [];
        for (var k = 0; k < GridRows.length; k++) {
            var Row = [];
            var DataObject = {};
            var nTaskId = 0;
            if (BKJSShared.NotNullOrUndefined(GridRows[k]["IDStandardTask"]) && GridRows[k]["IDStandardTask"] != 0)
                nTaskId = "st" + GridRows[k]["IDStandardTask"];
            else if (BKJSShared.NotNullOrUndefined(GridRows[k]["ActualTaskId"]) && GridRows[k]["ActualTaskId"] != 0)
                nTaskId = "atActual" + GridRows[k]["ActualTaskId"];
            else if (BKJSShared.NotNullOrUndefined(GridRows[k]["ActualTaskTempId"]))
                nTaskId = "atTemp" + GridRows[k]["ActualTaskTempId"];

            var GridRow = <td className="d-none">{nTaskId}</td>;
            Row.push(GridRow);

            var FieldValue = GridRows[k]["TaskName"];
            let isTaskSelected = false;
            let isChecked = false;
            if (GridRows[k]["Checked"])
                isChecked = true;
            else
                isChecked = false;
            let isMandatory = false;
            if (GridRows[k]["isMandatory"]) {
                isChecked = true;
                isMandatory = true;
            }

            if (isAllowLevelTaskEdit == false) { isMandatory = true; }

            if (strAction == "Edit") {
                isTaskSelected = OnOffboardModalComponent.IsContainsTasks(nTaskId);
                taskProp = isTaskSelected.split("_");
                let dtId = taskProp[1];
                if (taskProp[1] == "0")
                    dtId = "";
                else
                    dtId = "dtId_" + taskProp[1];
                if (taskProp[0] == "true")
                    isChecked = true;
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} onChange={OnOffboardModalComponent.OnCheckClick} disabled={isMandatory} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{""}</label></div></td>;
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} onChange={OnOffboardModalComponent.OnCheckClick} disabled={isMandatory} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{FieldValue}</label></div></td>;
                }
            }
            else {
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={nTaskId} value="0" defaultChecked={isChecked} onChange={OnOffboardModalComponent.OnCheckClick} disabled={isMandatory} /><label className="custom-control-label" htmlFor={nTaskId}>{""}</label></div></td>;
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={nTaskId} value="0" defaultChecked={isChecked} onChange={OnOffboardModalComponent.OnCheckClick} disabled={isMandatory} /><label className="custom-control-label" htmlFor={nTaskId}>{FieldValue}</label></div></td>;
                }
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["IDCategory"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{GridRows[k]["CategoryName"]}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["IDDepartment"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{GridRows[k]["DepartmentName"]}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["ResolutionDays"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{GridRows[k]["ResolutionDays"]}</td>
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
                GridRow = <td style={style}>{GridRows[k]["TaskLevelName"]}</td>
            }
            Row.push(GridRow);

            if (!isMandatory) {
                FieldValue = GridRows[k]["TaskLevelId"]
                if (FieldValue == null) {
                    GridRow = <td><a className="collapsed" data-toggle="collapse" id={nTaskId + "st"} href="#addTaskCollapse" aria-expanded="false" aria-controls="addTaskCollapse" onClick={OnOffboardModalComponent.EditRow}><i className="fa fa-pencil"></i></a></td>;
                }
                else {
                    GridRow = <td><a className="collapsed" data-toggle="collapse" id={nTaskId + "EditRow"} href="#addTaskCollapse" aria-expanded="false" aria-controls="addTaskCollapse" onClick={OnOffboardModalComponent.EditRow}><i className="fa fa-pencil"></i></a></td>;
                }
                Row.push(GridRow);
            }
            else {
                FieldValue = GridRows[k]["TaskLevelId"]
                if (FieldValue == null) {
                    GridRow = <td />;
                }
                else {
                    GridRow = <td />;
                }
                Row.push(GridRow);
            }

            let DataSingleRow = <tr id={(nTaskId + "dRow")}>{Row}</tr>
            DataRows.push(DataSingleRow);
        }
    }

    HandleNoUserCheck() {
        OnOffboardModalComponent.setState({ LicenseValidationModal: false });
    }

    //OpenValidationModal() {
    //    var item = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
    //    if (BKSPCustomerLicense.IsLicenseExpired() || OnOffboardModalComponent.state.EmployeeListCount >= item.Users) {
    //        if (item.LicenseType == "Trial" || OnOffboardModalComponent.state.EmployeeListCount >= item.Users) {
    //            let Dialog = null;
    //            Dialog = <LicenseValidationModal OnCancel={OnOffboardModalComponent.HandleNoUserCheck}></LicenseValidationModal>
    //            OnOffboardModalComponent.setState({ LicenseValidationModal: Dialog });
    //            return;
    //        }
    //        else if (item.LicenseType == "Enterprise" && BKSPCustomerLicense.IsLicenseExpired()) {
    //            let Dialog = null;
    //            Dialog = <LicenseValidationModal OnCancel={OnOffboardModalComponent.HandleNoUserCheck}></LicenseValidationModal>
    //            OnOffboardModalComponent.setState({ LicenseValidationModal: Dialog });
    //            return;
    //        }
    //    }

    //}
    OpenValidationModal() {
        var item = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKSPCustomerLicense.IsLicenseExpired() || OnOffboardModalComponent.state.EmployeeListCount >= item.Users) {
            let Dialog = null;
            Dialog = <LicenseValidationModal OnCancel={OnOffboardModalComponent.HandleNoUserCheck}></LicenseValidationModal>
            OnOffboardModalComponent.setState({ LicenseValidationModal: Dialog });
            return;
        }
    }

    AddRow(event) {
        OnOffboardModalComponent.GetEmployeeOnboardListData();
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKJSShared.NotNullOrUndefined(isExist)) {
            OnOffboardModalComponent.OpenValidationModal();
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, OnOffboardModalComponent.OpenValidationModal);
            OnOffboardModalComponent.OpenValidationModal();
        }
        // if (BKSPCustomerLicense.IsLicenseExpired() == false && OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
        if (BKSPCustomerLicense.IsLicenseExpired() == false) {
            var isShowModal = false;
            if (isExist.LicenseType == "Enterprise") {
                isShowModal = true;
            }
            else if (OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
                isShowModal = true;
            }
            if (isShowModal) {
                OnOffboardModalComponent.SetActualTaskModalComboProps("Add");
                $("#addTaskCollapse").addClass("collapse show");
                let tempId = TempArrActualTasks.length + 1;
                FileUploadInitialize("ActualTaskTempId_" + tempId, EOBConstants.ListNames.ActualTasks, "#files1");
                CurrentItemFiles = [];
                var modalComm = document.getElementById("atCommentHistory");
                modalComm.style.display = "none";
            }
        }
    }

    EditRow(event) {
        // OnOffboardModalComponent.SetActualTaskModalComboProps("Edit");
        OnOffboardModalComponent.GetEmployeeOnboardListData();
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKJSShared.NotNullOrUndefined(isExist)) {
            OnOffboardModalComponent.OpenValidationModal();
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, OnOffboardModalComponent.OpenValidationModal);
            OnOffboardModalComponent.OpenValidationModal();
        }
        // if (BKSPCustomerLicense.IsLicenseExpired() == false && OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {

        if (BKSPCustomerLicense.IsLicenseExpired() == false) {
            var isShowModal = false;
            if (isExist.LicenseType == "Enterprise") {
                isShowModal = true;
            }
            else if (OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
                isShowModal = true;
            }
            if (isShowModal) {
                let RowID = event.currentTarget.id;
                $("#addTaskCollapse").addClass("collapse show");
                let arrTaskById = OnOffboardModalComponent.FilterTasksByTaskId(RowID);
                let txtTaskName = document.getElementById("txtTaskName");
                let txtResolutionDays = document.getElementById("txtResolutionDays");
                let txtRemark = document.getElementById("txtAtRemark");
                //let isActive = $("#chkActualTaskActive");
                let AtCategorySelect = document.getElementById("AtCategorySelect");
                let AtDepartmentSelect = document.getElementById("AtDepartmentSelect");
                let AtLevelSelect = document.getElementById("AtLevelSelect");
                let AtProcessTypeSelect = document.getElementById("AtProcessTypeSelect");
                let lblIdStandardTask = document.getElementById("lblIdStandardTask");
                let lblAtTempRowId = document.getElementById("lblAtTempRowId");
                let AtTaskAssignTypeSelect = document.getElementById("ddlTaskTypeSelect");
                let lblAtRowId = document.getElementById("lblAtRowId");
                txtTaskName.focus();
                lblIdStandardTask.value = arrTaskById[0]["IDStandardTask"];
                lblAtTempRowId.value = arrTaskById[0]["ActualTaskTempId"];
                lblAtRowId.value = arrTaskById[0]["ActualTaskId"];
                txtTaskName.value = arrTaskById[0]["TaskName"];
                txtResolutionDays.value = arrTaskById[0]["ResolutionDays"];
                AtCategorySelect.value = arrTaskById[0]["IDCategory"];
                AtDepartmentSelect.value = arrTaskById[0]["IDDepartment"];
                AtLevelSelect.value = arrTaskById[0]["IDTaskLevel"];
                AtProcessTypeSelect.value = arrTaskById[0]["IDProcessType"];
                //txtRemark.value = arrTaskById[0]["Remark"];
                //$("#chkMandatoryTask").prop('checked', arrTaskById[0]["MandatoryTaskType"]);
                AtTaskAssignTypeSelect.value = arrTaskById[0]["TaskAssignType"];
                let ActualTaskResponsible = "";
                if ((AtTaskAssignTypeSelect.value == "Standard Task") || (AtTaskAssignTypeSelect.value == "Assignto While Onboarding" && (BKJSShared.NotNullOrUndefined(arrTaskById[0]["ActualTaskResponsible"])))) {
                    ActualTaskResponsible = arrTaskById[0]["ActualTaskResponsible"].results;
                    BKSPPeoplePickerRest.CreatePeoplePickerEdit(ActualTaskResponsible, "atuserpicker", true);
                }
                var PeoplePickerDiv = document.getElementById('divAtPeoplePicker');
                if ((AtTaskAssignTypeSelect.value == "Reporting Manager") || (AtTaskAssignTypeSelect.value == "Onboarding Offboarding Employee")) {
                    PeoplePickerDiv.style.display = 'none';
                }
                else {
                    PeoplePickerDiv.style.display = 'block';
                }

                //if (arrTaskById[0]["IsActive1"] == true) {
                //    $("#chkActualTaskActive").prop('checked', true);
                //}
                //else {
                //    $("#chkActualTaskActive").prop('checked', false);
                //}
                if (arrTaskById[0]["ActualTaskId"] != 0) {
                    FileUploadInitialize("ActualTaskId_" + arrTaskById[0]["ActualTaskId"], EOBConstants.ListNames.ActualTasks, "#files1");
                    if (arrTaskById[0]["AttachmentFiles"]) {
                        LoadExistingFiles(arrTaskById[0]["AttachmentFiles"], "ActualTaskId_" + arrTaskById[0]["ActualTaskId"], EOBConstants.ListNames.ActualTasks, "#files1");
                    }
                    EOBShared.GetRemarkVersions("ActualTasks", "Remark", arrTaskById[0]["ActualTaskId"], '#atUlRemarkVersions', 'atCommentHistory');
                }
                else if (arrTaskById[0]["ActualTaskTempId"] != 0) {
                    FileUploadInitialize("ActualTaskTempId_" + arrTaskById[0]["ActualTaskTempId"], EOBConstants.ListNames.ActualTasks, "#files1");
                    LoadExistingFiles(arrTaskById[0]["AttachmentFiles"], "ActualTaskTempId_" + arrTaskById[0]["ActualTaskTempId"], EOBConstants.ListNames.ActualTasks, "#files1");
                }
                else {
                    FileUploadInitialize("IDStandardTask_" + arrTaskById[0]["IDStandardTask"], EOBConstants.ListNames.ActualTasks, "#files1");
                    LoadExistingFiles(arrTaskById[0]["AttachmentFiles"], "IDStandardTask_" + arrTaskById[0]["IDStandardTask"], EOBConstants.ListNames.StandardTask, "#files1");
                    EOBShared.GetRemarkVersions("StandardTask", "Remarks", arrTaskById[0]["IDStandardTask"], '#atUlRemarkVersions', 'atCommentHistory');
                }
            }
        }
    }

    OnCheckClick(event) {
        let RowID = event.currentTarget.id;
        RowID = OnOffboardModalComponent.replaceAll(RowID, "st", "");
        let objIndex = arrAllTasks.findIndex((obj => obj.IDStandardTask == RowID));
        if (arrAllTasks) {
            if (event.currentTarget.checked == true) {
                arrAllTasks[objIndex].Checked = true;
                //arrAllTasks[objIndex].isMandatory = true;
            }
            else {
                arrAllTasks[objIndex].Checked = false;
                //arrAllTasks[objIndex].isMandatory = false;
            }
        }
    }

    ResetAndCloseActualTask() {
        ResetCall = true;
        OnOffboardModalComponent.setState({ SaveErrorSuccessNotification: null });
        $("#txtTaskName").val("");
        $("#txtAtRemark").val("");
        //$("#chkActualTaskActive").prop('checked', true);
        $("#txtTaskType").val("");
        $("#txtResolutionDays").val("0");
        $("#AtCategorySelect").val("5");
        $("#AtDepartmentSelect").val("1");
        $("#AtLevelSelect").val("1");
        $("#AtProcessTypeSelect").val("1");
        $("#lblIdStandardTask").val("");
        $("#lblAtTempRowId").val("");
        $("#lblAtRowId").val("");
        $("#addTaskCollapse").removeClass("collapse show").addClass("collapse");
        BKSPPeoplePickerRest.PeoplePickerInstances["atuserpicker"].isResolved = true;
        BKSPPeoplePickerRest.PeoplePickerInstances["atuserpicker"].ResetFromIdToPeoplePickerData();
        BKSPPeoplePickerRest.PeoplePickerInstances["atuserpicker"].ResetPeoplePickerField();
        //$("#files1").children(".fileList").empty();
        //for (var i = 0; i < filesToUpload.length; ++i) {
        //    if (filesToUpload[i].id.indexOf("files1") >= 0)
        //        filesToUpload.splice(i, 1);
        //}
        OnOffboardModalComponent.ResetActualTaskValidation();
    }

    FilterTasksByTaskId(RowID) {
        let isActualTask = RowID.indexOf("atActual");
        let isTempActualTask = RowID.indexOf("atTemp");
        let isSt = RowID.indexOf("st");
        var ListItemsFilterData = arrAllTasks.filter(function (el) {
            if (el.IDStandardTask != 0 && (el.TaskType == "Standard Task" || el.TaskType == "StandardTask" || el.TaskType == "Assignto While Onboarding" || el.TaskType == "Onboarding Offboarding Employee" || el.TaskType == "Reporting Manager") && isSt > -1 && isActualTask < 0) {
                RowID = OnOffboardModalComponent.replaceAll(RowID, "st", "");
                return el.IDStandardTask == RowID;
            }
            else if (el.ActualTaskId != 0 && el.TaskType == "ActualTask" && isActualTask > -1) {
                RowID = OnOffboardModalComponent.replaceAll(RowID, "atActual", "");
                RowID = OnOffboardModalComponent.replaceAll(RowID, "st", "");
                return el.ActualTaskId == RowID;
            }
            else if (el.ActualTaskTempId != 0 && el.TaskType == "ActualTask" && isTempActualTask > -1) {
                RowID = OnOffboardModalComponent.replaceAll(RowID, "atTemp", "");
                RowID = OnOffboardModalComponent.replaceAll(RowID, "st", "");
                return el.ActualTaskTempId == RowID;
            }
        });
        return ListItemsFilterData;
    }

    FilterTasksByLevelID(LevelID) {
        var ListItemsFilterData = arrAllTasks.filter(function (el) {
            return el.IDTaskLevel == LevelID;
        });
        return ListItemsFilterData;
    }

    FilterTasksByChecked() {
        var ListItemsFilterData = arrAllTasks.filter(function (el) {
            return el.Checked == true;
        });
        return ListItemsFilterData;
    }

    FilterTasksByLevelIDAndChecked(LevelID) {
        var ListItemsFilterData = arrAllTasks.filter(function (el) {
            return el.IDTaskLevel == LevelID && el.Checked == true;
        });
        return ListItemsFilterData;
    }

    FilterTasksByAssignToWhileOnOffboard() {
        var ListItemsFilterData = arrAllTasks.filter(function (el) {
            return el.TaskAssignType == "Assignto While Onboarding" && (!BKJSShared.NotNullOrUndefined(el.ActualTaskResponsible) && el.Checked == true);
        });
        return ListItemsFilterData;
    }

    FillActualTaskDataInGridSuccess(data) {
        // Get all actual tasks and save in actualtasks array
        arrAllActualTasks = [];
        let oAllRows = data.d.results;
        for (var i = 0; i < oAllRows.length; i++) {
            let oAllListContents = {};
            oAllListContents.ActualTaskId = oAllRows[i].ID;
            oAllListContents.ActualTaskTempId = 0;
            oAllListContents.IDStandardTask = oAllRows[i]["OData__IDStandardTaskId"];
            oAllListContents.ActualTaskResponsible = oAllRows[i]["AssignedToId"];
            oAllListContents.TaskName = oAllRows[i]["Title"];
            oAllListContents.ResolutionDays = oAllRows[i]["ResolutionDays"];
            oAllListContents.IDCategory = oAllRows[i]["OData__IDCategory"].ID;
            oAllListContents.CategoryName = oAllRows[i]["OData__IDCategory"].CategoryName1;
            oAllListContents.IDDepartment = oAllRows[i]["IDDepartment"];
            oAllListContents.DepartmentName = oAllRows[i]["Departments"]._DepartmentName;
            oAllListContents.IDTaskLevel = oAllRows[i]["TaskLevel"].ID;
            oAllListContents.TaskLevelName = oAllRows[i]["TaskLevel"].Title;
            oAllListContents.IsActive1 = oAllRows[i]["IsActive1"];
            oAllListContents.Remark = oAllRows[i]["Remarks"];
            oAllListContents.IDProcessType = oAllRows[i]["Process"].ID;
            oAllListContents.ProcessTypeName = oAllRows[i]["Process"].Title;
            oAllListContents.TaskFlow = oAllRows[i]["TaskFlow"];
            oAllListContents.TaskType = oAllRows[i]["TypeOfTask"];
            oAllListContents.TaskStartDate = oAllRows[i]["StartDate"];
            if (BKJSShared.NotNullOrUndefined(oAllRows[i]["Status"])) {
                oAllListContents.Status = oAllRows[i]["Status"];
            }
            else {
                oAllListContents.Status = "Open";
            }
            if (BKJSShared.NotNullOrUndefined(oAllRows[i]["TaskAssignType"]))
                oAllListContents.TaskAssignType = oAllRows[i]["TaskAssignType"];
            else
                oAllListContents.TaskAssignType = oAllRows[i]["TypeOfTask"];
            oAllListContents.AttachmentFiles = oAllRows[i]["AttachmentFiles"].results;
            oAllListContents.Checked = true;
            oAllListContents.isMandatory = oAllRows[i]["MandatoryTaskType"];
            arrAllActualTasks.push(oAllListContents);
        }
        // Now add or update Array of all tasks as per actual task array
        // Find index of specific object using findIndex method. 
        for (var i = 0; i < arrAllActualTasks.length; i++) {
            let objIndex = arrAllTasks.findIndex((obj => obj.IDStandardTask == arrAllActualTasks[i]["IDStandardTask"] && arrAllActualTasks[i]["IDStandardTask"] != null));
            let objActualTaskIndex = arrAllTasks.findIndex((obj => obj.ActualTaskId == arrAllActualTasks[i]["ID"]));
            if (objIndex > -1 || objActualTaskIndex > -1) {
                arrAllTasks[objIndex].ActualTaskId = arrAllActualTasks[i]["ActualTaskId"];
                arrAllTasks[objIndex].IDStandardTask = arrAllActualTasks[i]["IDStandardTask"];
                arrAllTasks[objIndex].ActualTaskResponsible = arrAllActualTasks[i]["ActualTaskResponsible"];
                arrAllTasks[objIndex].TaskName = arrAllActualTasks[i]["TaskName"];
                arrAllTasks[objIndex].ResolutionDays = arrAllActualTasks[i]["ResolutionDays"];
                arrAllTasks[objIndex].IDCategory = arrAllActualTasks[i]["IDCategory"];
                arrAllTasks[objIndex].CategoryName = arrAllActualTasks[i]["CategoryName"];
                arrAllTasks[objIndex].IDDepartment = arrAllActualTasks[i]["IDDepartment"];
                arrAllTasks[objIndex].DepartmentName = arrAllActualTasks[i]["DepartmentName"];
                arrAllTasks[objIndex].IDTaskLevel = arrAllActualTasks[i]["IDTaskLevel"];
                arrAllTasks[objIndex].TaskLevelName = arrAllActualTasks[i]["TaskLevelName"];
                arrAllTasks[objIndex].IsActive1 = arrAllActualTasks[i]["IsActive1"];
                arrAllTasks[objIndex].Remark = arrAllActualTasks[i]["Remark"];
                arrAllTasks[objIndex].IDProcessType = arrAllActualTasks[i]["IDProcessType"];
                arrAllTasks[objIndex].ProcessTypeName = arrAllActualTasks[i]["ProcessTypeName"];
                arrAllTasks[objIndex].TaskFlow = arrAllActualTasks[i]["TaskFlow"];
                arrAllTasks[objIndex].TaskType = arrAllActualTasks[i]["TaskType"];
                arrAllTasks[objIndex].TaskStartDate = arrAllActualTasks[i]["StartDate"];
                arrAllTasks[objIndex].TaskAssignType = arrAllActualTasks[i]["TaskAssignType"];
                arrAllTasks[objIndex].MandatoryTaskType = arrAllActualTasks[i]["MandatoryTaskType"];
                arrAllTasks[objIndex].AttachmentFiles = arrAllActualTasks[i]["AttachmentFiles"];
                if (BKJSShared.NotNullOrUndefined(arrAllActualTasks[i]["Status"])) {
                    arrAllTasks[objIndex].Status = arrAllActualTasks[i]["Status"];
                }
                else {
                    arrAllTasks[objIndex].Status = "Open";
                }
                arrAllTasks[objIndex].Checked = true;
            }
            else {
                let oListContents = {};
                oListContents.ActualTaskId = arrAllActualTasks[i]["ActualTaskId"];
                oListContents.ActualTaskTempId = 0;
                oListContents.IdStandardTask = arrAllActualTasks[i]["IDStandardTask"];
                oListContents.ActualTaskResponsible = arrAllActualTasks[i]["ActualTaskResponsible"];
                oListContents.TaskName = arrAllActualTasks[i]["TaskName"];
                oListContents.ResolutionDays = arrAllActualTasks[i]["ResolutionDays"];
                oListContents.IDCategory = arrAllActualTasks[i]["IDCategory"];
                oListContents.CategoryName = arrAllActualTasks[i]["CategoryName"];
                oListContents.IDDepartment = arrAllActualTasks[i]["IDDepartment"];
                oListContents.DepartmentName = arrAllActualTasks[i]["DepartmentName"];
                oListContents.IDTaskLevel = arrAllActualTasks[i]["IDTaskLevel"];
                oListContents.TaskLevelName = arrAllActualTasks[i]["TaskLevelName"];
                oListContents.IsActive1 = arrAllActualTasks[i]["IsActive1"];
                oListContents.Remark = arrAllActualTasks[i]["Remark"];
                oListContents.IDProcessType = arrAllActualTasks[i]["IDProcessType"];
                oListContents.ProcessTypeName = arrAllActualTasks[i]["ProcessTypeName"];
                oListContents.TaskFlow = arrAllActualTasks[i]["TaskFlow"];
                oListContents.TaskType = arrAllActualTasks[i]["TaskType"];
                oListContents.TaskAssignType = arrAllActualTasks[i]["TaskAssignType"];
                oListContents.MandatoryTaskType = arrAllActualTasks[i]["MandatoryTaskType"];
                oListContents.AttachmentFiles = arrAllActualTasks[i]["AttachmentFiles"];
                if (BKJSShared.NotNullOrUndefined(arrAllActualTasks[i]["Status"])) {
                    oListContents.Status = arrAllActualTasks[i]["Status"];
                }
                else {
                    oListContents.Status = "Open";
                }
                oListContents.TaskStartDate = moment(new Date()).format("MM/DD/YYYY");
                oListContents.Checked = true;
                arrAllTasks.push(oListContents);
            }
        }
    }

    FillActualTaskDataInGridFailure(data) {
        console.log("FillActualTaskDataInGrid Fail");
    }

    _onTaskGridFailure(data) {
        console.log("Failed in getting process items.");
    }

    GetTaskTemplateDetailTasks(TaskTemplateTypeId) {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/items?$filter=OData__IDTaskTemplateId eq " + TaskTemplateTypeId;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._GetTaskTemplateDetailTasksSuccess, OnOffboardModalComponent._GetTaskTemplateDetailTasksFailure);
    }

    _GetTaskTemplateDetailTasksSuccess(data) {
        // Firstly uncheck all checkbox
        var array = document.getElementsByTagName("input");
        for (var ii = 0; ii < array.length; ii++) {
            if (array[ii].type == "checkbox") {
                if (array[ii].className == "custom-control-input" && (array[ii].disabled != true && array[ii].checked == true)) {
                    array[ii].checked = false;
                }
            }
        }
        let Taskid = 0;
        TaskTemplateDetailTaskIds = [];
        for (var k = 0; k < data.d.results.length; k++) {
            Taskid = data.d.results[k]["OData__IDStandardTaskId"];
            TaskTemplateDetailTaskIds.push(Taskid);
        }
        for (let jj = 0; jj < TaskTemplateDetailTaskIds.length; jj++) {
            for (let ii = 0; ii < array.length; ii++) {
                if (array[ii].type == "checkbox") {
                    if (array[ii].className == "custom-control-input" && (array[ii].id).substring(2) == TaskTemplateDetailTaskIds[jj]) {
                        array[ii].checked = true;
                        break;
                    }
                }
            }
        }
        if (arrAllTasks) {
            for (let allTaskId = 0; allTaskId < arrAllTasks.length; allTaskId++) {
                if (arrAllTasks[allTaskId].isMandatory != true)
                    arrAllTasks[allTaskId].Checked = false;
                else
                    arrAllTasks[allTaskId].Checked = true;
            }
            for (let taskTempTaskId = 0; taskTempTaskId < TaskTemplateDetailTaskIds.length; taskTempTaskId++) {
                for (let allTaskId = 0; allTaskId < arrAllTasks.length; allTaskId++) {
                    if (arrAllTasks[allTaskId].IDStandardTask == TaskTemplateDetailTaskIds[taskTempTaskId]) {
                        arrAllTasks[allTaskId].Checked = true;
                    }
                }
            }
        }
    }

    _GetTaskTemplateDetailTasksFailure() {
        console.log("Failed in getting process items.");
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

    //// Task section Accordian changes --- end

    /// Actual Task Section changes ---start
    AtCreatePeoplePicker() {
        BKSPPeoplePickerRest.CreatePeoplePicker("atuserpicker", true);
    }

    _OnAtRestSuccessCall(data) {
        if (OnOffboardModalComponent.state.Action != "Add") {
            nAtCounterSuccess++;
            if (atResetCall) {
                atResetCall = false;
            }
            else {
                if (nAtCounterSuccess == nAtTotalRestCalls) {
                }
            }
        }
    }

    SetActualTaskModalComboProps(ActualTaskAction) {
        oAtMProcessTypeComboProps = new EOBShared.ComboProperties("AtProcessTypeSelect", "Process Type", "lstProcessType", "", OnOffboardModalComponent.ApplyCategoryFilter, "", "", "", "Title", OnOffboardModalComponent._OnAtRestSuccessCall);

        if (ActualTaskAction != "Add") {
            let strFilterString = "Process1/ID eq '" + OnOffboardModalComponent.props.Process + "'";
            oAtMCategoryComboProps = new EOBShared.ComboProperties("AtCategorySelect", "Category", "Category", "", "", "", "", "", "CategoryName1", OnOffboardModalComponent._OnAtRestSuccessCall, strFilterString);
            oAtMLevelComboProps = new EOBShared.ComboProperties("AtLevelSelect", "Level", "Levellst", "", "", "", "", "", "Title", OnOffboardModalComponent._OnAtRestSuccessCall);
            let strTaskTemplateFilterString = "ProcessTypeId/ID eq '" + OnOffboardModalComponent.props.Process + "'";
            oTaskTemplateType = new EOBShared.ComboProperties("TaskTemplateTypeSelect", "Task Template", "TaskTemplateMaster", "", OnOffboardModalComponent.onChangeTaskTemplateType, "Select", "", "", "OData__TaskTemplateName", OnOffboardModalComponent._OnAtRestSuccessCall, strTaskTemplateFilterString);
            oAtMDepartmentComboProps = new EOBShared.ComboProperties("AtDepartmentSelect", "Department", "Departmentlst", "", "", "", "", "", "OData__DepartmentName", OnOffboardModalComponent._OnAtRestSuccessCall);
        }
        else {
            let strFilterString = "Process1/ID eq '" + OnOffboardModalComponent.props.Process + "' and IsActive1 eq '1'";
            oAtMCategoryComboProps = new EOBShared.ComboProperties("AtCategorySelect", "Category", "Category", "", "", "", "", "", "CategoryName1", OnOffboardModalComponent._OnAtRestSuccessCall, strFilterString);
            oAtMLevelComboProps = new EOBShared.ComboProperties("AtLevelSelect", "Level", "Levellst", "", "", "", "", "", "Title", OnOffboardModalComponent._OnAtRestSuccessCall);
            let strTaskTemplateFilterString = "ProcessTypeId/ID eq '" + OnOffboardModalComponent.props.Process + "' and IsActive1 eq '1'";
            oTaskTemplateType = new EOBShared.ComboProperties("TaskTemplateTypeSelect", "Task Template", "TaskTemplateMaster", "", OnOffboardModalComponent.onChangeTaskTemplateType, "Select", "", "", "OData__TaskTemplateName", OnOffboardModalComponent._OnAtRestSuccessCall, strTaskTemplateFilterString);
            let strDepartmentFilterString = "IsActive1 eq '1'";
            oAtMDepartmentComboProps = new EOBShared.ComboProperties("AtDepartmentSelect", "Department", "Departmentlst", "", "", "", "", "", "OData__DepartmentName", OnOffboardModalComponent._OnAtRestSuccessCall, strDepartmentFilterString);
        }
    }
    /// Actual Task Section changes ---end

    /// Add Actual Task list details in Temporary Array -- start
    AddEditTasksInTemporaryArray() {
        OnOffboardModalComponent.GetEmployeeOnboardListData();
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKJSShared.NotNullOrUndefined(isExist)) {
            OnOffboardModalComponent.OpenValidationModal();
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, OnOffboardModalComponent.OpenValidationModal);
            OnOffboardModalComponent.OpenValidationModal();
        }
        //if (BKSPCustomerLicense.IsLicenseExpired() == false && OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {

        if (BKSPCustomerLicense.IsLicenseExpired() == false) {
            var isShowModal = false;
            if (isExist.LicenseType == "Enterprise") {
                isShowModal = true;
            }
            else if (OnOffboardModalComponent.state.EmployeeListCount < isExist.Users) {
                isShowModal = true;
            }
            if (isShowModal) {
                let isValidated = OnOffboardModalComponent.ValidateActualTask();
                if (isValidated == true) {
                    SaveAttachmentsInMemory();
                    let oListContents = {};
                    let lblIdStandardTask = document.getElementById("lblIdStandardTask");
                    var IdStandardTask = 0;
                    if ($("#lblIdStandardTask").val() != "") {
                        IdStandardTask = $("#lblIdStandardTask").val();
                    }
                    let ActualTaskTempId = 0;
                    if ($("#lblAtTempRowId").val() != "") {
                        ActualTaskTempId = $("#lblAtTempRowId").val();
                    }
                    let ActualTaskId = 0;
                    if ($("#lblAtRowId").val() != "") {
                        ActualTaskId = $("#lblAtRowId").val();
                    }
                    let actualTaskResponsible = BKSPPeoplePickerRest.PeoplePickerInstances["atuserpicker"].GetSelectedUserIds();
                    let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
                    let SelectedTaskFlow = "Parallel";
                    let txtTaskName = document.getElementById("txtTaskName");
                    let txtResolutionDays = document.getElementById("txtResolutionDays");
                    let txtRemark = document.getElementById("txtAtRemark");
                    //let isActive = $("#chkActualTaskActive").prop('checked');
                    let SelectedCategory = BKJSShared.GetComboSelectedValueAndText("#AtCategorySelect");
                    let SelectedDepartment = BKJSShared.GetComboSelectedValueAndText("#AtDepartmentSelect");
                    let SelectedLevel = BKJSShared.GetComboSelectedValueAndText("#AtLevelSelect");
                    let SelectedProcessType = BKJSShared.GetComboSelectedValueAndText("#AtProcessTypeSelect");
                    let SelectedTaskAssignType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
                    let fileArray = [];

                    oListContents = {};
                    // Actual Task
                    if (IdStandardTask == 0) {
                        // New Actual Task
                        if (ActualTaskTempId == 0 && ActualTaskId == 0) {
                            oListContents.ActualTaskTempId = TempArrActualTasks.length + 1;
                            oListContents.ActualTaskId = 0;
                            oListContents.IdStandardTask = 0;
                            oListContents.ActualTaskResponsible = actualTaskResponsible;
                            oListContents.TaskName = txtTaskName.value;
                            oListContents.ResolutionDays = txtResolutionDays.value;
                            oListContents.IDCategory = parseInt(SelectedCategory.Value);
                            oListContents.CategoryName = SelectedCategory.Text;
                            oListContents.IDDepartment = SelectedDepartment.Value;
                            oListContents.DepartmentName = SelectedDepartment.Text;
                            oListContents.IDTaskLevel = SelectedLevel.Value;
                            oListContents.TaskLevelName = SelectedLevel.Text;
                            oListContents.IsActive1 = true;
                            oListContents.Remark = txtRemark.value;
                            oListContents.IDProcessType = parseInt(SelectedProcessType.Value);
                            oListContents.ProcessTypeName = SelectedProcessType.Text;
                            oListContents.TaskFlow = SelectedTaskFlow;
                            oListContents.TaskType = "ActualTask";
                            oListContents.Checked = true;
                            oListContents.TaskStartDate = moment(new Date()).format("MM/DD/YYYY");
                            oListContents.isMandatory = false;
                            oListContents.TaskAssignType = SelectedTaskType.Value;
                            TempArrActualTasks.push(oListContents);
                            arrAllTasks.push(oListContents);
                        }
                        else {   // Edit Actaul Task
                            //Find index of specific object using findIndex method.
                            let objIndex = arrAllTasks.findIndex((obj => obj.ActualTaskId == ActualTaskId && ActualTaskId != 0));
                            if (objIndex == -1) {
                                objIndex = arrAllTasks.findIndex(obj => obj.ActualTaskTempId == ActualTaskTempId);
                            }
                            if (arrAllTasks) {
                                arrAllTasks[objIndex].IdStandardTask = 0;
                                arrAllTasks[objIndex].ActualTaskResponsible = actualTaskResponsible;
                                arrAllTasks[objIndex].TaskName = txtTaskName.value;
                                arrAllTasks[objIndex].ResolutionDays = txtResolutionDays.value;
                                arrAllTasks[objIndex].IDCategory = parseInt(SelectedCategory.Value);
                                arrAllTasks[objIndex].CategoryName = SelectedCategory.Text;
                                arrAllTasks[objIndex].IDDepartment = SelectedDepartment.Value;
                                arrAllTasks[objIndex].DepartmentName = SelectedDepartment.Text;
                                arrAllTasks[objIndex].IDTaskLevel = SelectedLevel.Value;
                                arrAllTasks[objIndex].TaskLevelName = SelectedLevel.Text;
                                //arrAllTasks[objIndex].IsActive1 = isActive;
                                arrAllTasks[objIndex].Remark = txtRemark.value;
                                arrAllTasks[objIndex].IDProcessType = parseInt(SelectedProcessType.Value);
                                arrAllTasks[objIndex].ProcessTypeName = SelectedProcessType.Text;
                                arrAllTasks[objIndex].TaskFlow = SelectedTaskFlow;
                                arrAllTasks[objIndex].TaskType = "ActualTask";
                                arrAllTasks[objIndex].TaskAssignType = SelectedTaskType.Value;
                                arrAllTasks[objIndex].Checked = true;
                                //arrAllTasks[objIndex].isMandatory = $("#chkMandatoryTask").prop('checked');
                            }
                        }
                    }
                    else {
                        //Find index of specific object using findIndex method.    
                        let objIndex = arrAllTasks.findIndex((obj => obj.IDStandardTask == IdStandardTask));
                        if (arrAllTasks) {
                            arrAllTasks[objIndex].IDStandardTask = IdStandardTask;
                            arrAllTasks[objIndex].ActualTaskResponsible = actualTaskResponsible;
                            arrAllTasks[objIndex].TaskName = txtTaskName.value;
                            arrAllTasks[objIndex].ResolutionDays = txtResolutionDays.value;
                            arrAllTasks[objIndex].IDCategory = parseInt(SelectedCategory.Value);
                            arrAllTasks[objIndex].CategoryName = SelectedCategory.Text;
                            arrAllTasks[objIndex].IDDepartment = SelectedDepartment.Value;
                            arrAllTasks[objIndex].DepartmentName = SelectedDepartment.Text;
                            arrAllTasks[objIndex].IDTaskLevel = SelectedLevel.Value;
                            arrAllTasks[objIndex].TaskLevelName = SelectedLevel.Text;
                            //arrAllTasks[objIndex].IsActive1 = isActive;
                            arrAllTasks[objIndex].Remark = txtRemark.value;
                            arrAllTasks[objIndex].IDProcessType = parseInt(SelectedProcessType.Value);
                            arrAllTasks[objIndex].ProcessTypeName = SelectedProcessType.Text;
                            arrAllTasks[objIndex].TaskFlow = SelectedTaskFlow;
                            arrAllTasks[objIndex].TaskType = "StandardTask";
                            arrAllTasks[objIndex].TaskAssignType = SelectedTaskType.Value;
                            arrAllTasks[objIndex].Checked = true;
                            //arrAllTasks[objIndex].isMandatory = $("#chkMandatoryTask").prop('checked');
                            arrAllTasks[objIndex].TaskStartDate = moment(new Date()).format("MM/DD/YYYY");
                        }
                    }
                    OnOffboardModalComponent._FillTaskGrids(arrAllTasks, true);
                    OnOffboardModalComponent.ResetAndCloseActualTask();
                    let array = document.getElementsByTagName("input");
                    for (let ii = 0; ii < array.length; ii++) {
                        if (array[ii].type == "checkbox") {
                            if (array[ii].className == "custom-control-input" && (array[ii].id).substring(2) == IdStandardTask && IdStandardTask != 0) {
                                array[ii].checked = true;
                                break;
                            }
                        }
                    }
                }
                else { return; }
            }
        }
    }

    ValidateActualTask() {
        let isValid = true;
        OnOffboardModalComponent.ResetActualTaskValidation();

        if ($("#txtTaskName").val() == "") {
            $("#txtTaskName").after("<div style='color:red;' id='divValTaskName'>Required.</div>");
            isValid = false;
        }

        if ($("#txtResolutionDays").val() == "") {
            $("#txtResolutionDays").after("<div style='color:red;' id='divValResolutionDays'>Required.</div>");
            isValid = false;
        }

        let actualTaskResponsible = BKSPPeoplePickerRest.PeoplePickerInstances["atuserpicker"].GetSelectedUserIds();

        let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");

        if (actualTaskResponsible["results"].length == 0 && SelectedTaskType.Text == "Standard Task") {
            $("#atuserpicker").after("<div style='color:red;' id='divAtuserpicker'>Required.</div>");
            isValid = false;
        }

        let SelectedCategory = BKJSShared.GetComboSelectedValueAndText("#AtCategorySelect");
        if (SelectedCategory.Value == null) {
            $("#AtCategorySelect").after("<div style='color:red;' id='divAtCategory'>Required.</div>");
            isValid = false;
        }

        let SelectedDepartment = BKJSShared.GetComboSelectedValueAndText("#AtDepartmentSelect");
        if (SelectedDepartment.Value == null) {
            $("#AtDepartmentSelect").after("<div style='color:red;' id='divAtDepartment'>Required.</div>");
            isValid = false;
        }

        let SelectedLevel = BKJSShared.GetComboSelectedValueAndText("#AtLevelSelect");
        let isLevelFound = false;
        if (ConfigModal.gConfigSettings.isAllowAllUsers == true) {
            isLevelFound = true;
        }
        else if (ConfigModal.gConfigSettings.isCurrentUserAdmin == true) {
            isLevelFound = true;
        }
        if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
            for (var li = 0; li < ConfigModal.gConfigSettings.CurrentUserLevel.length; li++) {
                if (ConfigModal.gConfigSettings.CurrentUserLevel[li].isAllowEdit) {
                    if (ConfigModal.gConfigSettings.CurrentUserLevel[li].ID == SelectedLevel.Value) {
                        isLevelFound = true;
                    }
                    break;
                }
            }
        }
        if (isLevelFound == false) {
            isValid = false;
            $("#AtLevelSelect").after("<div style='color:red;' id='divAtLevelSelect'>Selected level task add/update is not allowed. Select another level.</div>");
        }

        return isValid;
    }
    /// Add Actual Task list in details in Temporary Array --end

    //// Final Add Update of tasks in Actual Tasks list --start
    AddUpdateTaskInActualTaskList(empId) {
        // Dependent task logic
        // Check if parent task is checked and not closed also having dependent task and that dependent task is checked then make dependent task status to inactive 
        OnOffboardModalComponent.UpdateDependentTaskStatus();
        let IDStandardTask = "";
        let ActualTaskId = "";
        let ActualTaskTempId = "";
        let dateDoj = $('#txtDOJ').val() == '' ? null : $('#txtDOJ').val();
        let OnOffboardStartDate = $('#txtOnOffboardStartDate').val() == '' ? null : $('#txtOnOffboardStartDate').val();
        for (let ii = 0; ii < arrAllTasks.length; ii++) {
            ActualTaskId = arrAllTasks[ii]["ActualTaskId"];
            ActualTaskTempId = arrAllTasks[ii]["ActualTaskTempId"];

            if (arrAllTasks[ii].Checked == true && ActualTaskId != "0") {
                // Update existing standard or actual task
                OnOffboardModalComponent.fn_AddUpdateActualTaskListDetail(arrAllTasks[ii], empId, dateDoj, OnOffboardStartDate);
            }
            else if (arrAllTasks[ii].Checked == false && ActualTaskId != "0") {
                // Delete existing standard or actual task
                OnOffboardModalComponent.fn_DeleteActualTaskDetail(ActualTaskId, empId);
            }
            else if (arrAllTasks[ii].Checked == true && ActualTaskId == "0") {
                // Insert standard or actual task
                OnOffboardModalComponent.fn_AddUpdateActualTaskListDetail(arrAllTasks[ii], empId, dateDoj, OnOffboardStartDate);
            }
        }
        ProcessAttachmentsIfAny(OnOffboardModalComponent.GetSPUsersInfo, null, EOBConstants.ListNames.ActualTasks);
        //OnOffboardModalComponent.Reset();
        //OnOffboardModalComponent.CloseModal();
    }

    UpdateDependentTaskStatus() {
        for (let parentTask = 0; parentTask < arrAllTasks.length; parentTask++) {
            if (arrAllTasks[parentTask]["Checked"] == true && BKJSShared.NotNullOrUndefined(arrAllTasks[parentTask]["DependentTasks"]) && arrAllTasks[parentTask]["Status"] != "Close") {
                let ObjDTasks = JSON.parse(arrAllTasks[parentTask]["DependentTasks"]);
                for (let d = 0; d < ObjDTasks.length; d++) {
                    let ObjDTask = ObjDTasks[d];
                    let objIndex = arrAllTasks.findIndex((obj => obj.IDStandardTask == ObjDTask.TaskId));
                    if (objIndex > -1) {
                        if (arrAllTasks[objIndex].Checked == true && arrAllTasks[objIndex].Status != "Close" && arrAllTasks[objIndex].isActive1 != false) {
                            arrAllTasks[objIndex].IsActive1 = false;
                        }
                    }
                }
            }
        }
    }

    ResetActualTaskValidation() {
        if ($("#divValTaskName")) {
            $("#divValTaskName").html('');
        }
        if ($("#divValResolutionDays")) {
            $("#divValResolutionDays").html('');
        }
        if ($("#divAtuserpicker")) {
            $("#divAtuserpicker").html('');
        }
    }

    CalculateDueDate(ResolutionDays, dateDoj, OnOffboardStartDate) {
        let res_day = parseInt(ResolutionDays);
        let new_date = "";
        if (ConfigModal.gConfigSettings.DueDateBasedOn == 2 && dateDoj != null) {
            new_date = OnOffboardModalComponent.DueDateCalculation(dateDoj, res_day);
        }
        else if (ConfigModal.gConfigSettings.DueDateBasedOn == 1 && OnOffboardStartDate != null) {
            new_date = OnOffboardModalComponent.DueDateCalculation(OnOffboardStartDate, res_day);
        }
        else {
            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1; //January is 0!
            let yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            today = mm + '/' + dd + '/' + yyyy;
            new_date = OnOffboardModalComponent.DueDateCalculation(today, res_day);
        }
        return new_date;
    }

    DueDateCalculation(dtCal, resdays) {
        var dt = new Date(dtCal);
        var dd = dt.getDate();
        var mm = dt.getMonth() + 1; //January is 0!
        var yyyy = dt.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var tempDuedate = mm + '/' + dd + '/' + yyyy;
        var res_day = parseInt(resdays);
        let new_date = moment(tempDuedate, "MM/DD/YYYY").add(res_day, 'days').format("MM/DD/YYYY").toString();
        return new_date;
    }

    fn_AddUpdateActualTaskListDetail(oTask, empId, dateDoj, OnOffboardStartDate) {
        oTask.DueDate = OnOffboardModalComponent.CalculateDueDate(oTask.ResolutionDays, dateDoj, OnOffboardStartDate);
        if (oTask.Status == "Not Started")
            oTask.Status = "Open";
        let Manager = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
        if (oTask.TaskAssignType == "Reporting Manager")
            oTask.ActualTaskResponsible = Manager;
        if (oTask.TaskAssignType == "Onboarding Offboarding Employee") {
            oTask.ActualTaskResponsible = { "results": [OffBoardEmpId] }
        }
        if (!BKJSShared.NotNullOrUndefined(oTask.TaskStartDate))
            oTask.TaskStartDate = moment(new Date()).format("MM/DD/YYYY");
        finaloTasks = oTask;
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.ActualTasks);
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "Title": oTask.TaskName,
            "ResolutionDays": oTask.ResolutionDays,
            "OData__IDCategoryId": oTask.IDCategory,
            "IDDepartment": oTask.IDDepartment,
            "DepartmentsId": oTask.IDDepartment,
            "TaskLevelId": oTask.IDTaskLevel,
            "Level": oTask.TaskLevelName,
            "IsActive1": oTask.IsActive1,
            "Remark": oTask.Remark,
            "ProcessId": oTask.IDProcessType,
            "TypeOfTask": oTask.TaskType,
            "AssignedToId": oTask.ActualTaskResponsible,
            "OData__IDStandardTaskId": oTask.IDStandardTask,
            "OData__EmployeeIDId": empId,
            "Status": oTask.Status,
            "StartDate": oTask.TaskStartDate,
            "DueDate": oTask.DueDate,
            "TaskAssignType": oTask.TaskAssignType,
            "MandatoryTaskType": oTask.MandatoryTaskType
        }
        var RequestMethod = null;
        var Url = "";
        let dId = 0;
        let DetailId = oTask.ActualTaskId;
        if (DetailId > 0) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + DetailId + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items";
        }
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, OnOffboardModalComponent._onItemActualTaskSave, OnOffboardModalComponent._onItemActualTaskSaveFailed)
    }

    onChangeTaskTemplateType() {
        let SelectedTaskTemplateType = BKJSShared.GetComboSelectedValueAndText("#TaskTemplateTypeSelect");
        OnOffboardModalComponent.GetTaskTemplateDetailTasks(SelectedTaskTemplateType.Value);
    }

    _OnTaskTypeChange() {
        let SelectedTaskType = BKJSShared.GetComboSelectedValueAndText("#ddlTaskTypeSelect");
        let SelectedVal = SelectedTaskType.Value;
        var PeoplePickerDiv = document.getElementById('divAtPeoplePicker');
        if (SelectedVal == "Standard Task" || SelectedVal == "Assignto While Onboarding") {
            // $("#divPeoplePicker *").attr("disabled", "disabled").off('click');
            PeoplePickerDiv.style.display = 'block';
        }
        else {
            PeoplePickerDiv.style.display = 'none';
        }
        //StandardTaskModalComponent.EnableDisableDependentTab();
    }

    _onItemActualTaskSave(data) {
        // Replace temporary id by actual id in filestoupload method
        // if Edit then replace by detail id and if new entry then replace by data.d.ID
        let finalid = 0;
        if (finaloTasks.ActualTaskId > 0)
            finalid = finaloTasks.ActualTaskId;
        else
            finalid = data.d.ID;
        OnOffboardModalComponent.ReplaceTemporaryIdByActualIdInFilesToUploadArr(finaloTasks, finalid);
        //ProcessAttachmentsIfAny(null, null, EOBConstants.ListNames.ActualTasks);
    }

    _onItemActualTaskSaveFailed(data) {
        console.log(data);
    }

    ReplaceTemporaryIdByActualIdInFilesToUploadArr(oTask, finalid) {
        if (filesToUpload != null && filesToUpload.length > 0) {
            $.each(filesToUpload, function (k, v) {
                if (v.Itemid != 0) {
                    if (oTask.ActualTaskId == v.Itemid.toString().replace("ActualTaskId_", "")) {
                        v.Itemid = finalid;
                    }
                    else if (oTask.ActualTaskTempId == v.Itemid.toString().replace("ActualTaskTempId_", "")) {
                        v.Itemid = finalid;
                    }
                    else if (oTask.IDStandardTask == v.Itemid.toString().replace("IDStandardTask_", "")) {
                        v.Itemid = finalid;
                    }
                }
            });
        }
    }

    fn_DeleteActualTaskDetail(DetailId) {
        //let dId = 0;
        //if (DetailId != "") {
        //    dId = DetailId.split("_")[1];
        //}
        let Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + DetailId + ")";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.DELETE, OnOffboardModalComponent._onItemDeleteSuccess, OnOffboardModalComponent._onItemDeleteFailed);
    }

    _onItemDeleteSuccess() { }

    _onItemDeleteFailed() { }

    OpenAddActualTask() {
        let Dialog = null;
        var intItemID = 0;
        var strAction = ""
        OnOffboardModalComponent.AtCreatePeoplePicker();
        //if (DataObject["ID"] != null) {
        //    intItemID = DataObject["ID"];
        //    strAction = DataObject["Action"];
        //}
        //else {
        strAction = "Add";
        //}
        ///Dialog = <ActualTaskDialog Action={strAction} ItemId={intItemID} CloseActualTaskModal={OnOffboardModalComponent.CloseActualTaskModal} ></ActualTaskDialog>
        //OnOffboardModalComponent.setState({ ActualTaskDialog: Dialog });
        return;
    }

    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    //// Final Add Update of tasks in Actual Tasks list --end

    EnableDisableTasksTab() {
        let flgValid = true;
        if ($("#txtName").val() == "")
            flgValid = false;

        let txtDOJ = document.getElementById("txtDOJ");
        if (txtDOJ.value != "") {
            let isValidDoj = OnOffboardModalComponent.CheckIfValidDate(txtDOJ.value);
            if (txtDOJ.value != isValidDoj) {
                flgValid = false;
            }
        }
        else { flgValid = false; }
        let txtOnOffboardStartDate = document.getElementById("txtOnOffboardStartDate");
        if (txtOnOffboardStartDate != "") {
            let isOnOffboardStartDate = OnOffboardModalComponent.CheckIfValidDate(txtOnOffboardStartDate.value);
            if (txtOnOffboardStartDate.value != isOnOffboardStartDate) {
                flgValid = false;
            }
        }
        else {
            flgValid = false;
        }
        let Manager = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds();
        let isManagerValid = true;
        if (Manager["results"].length == 0) {
            flgValid = false;
        }
        let txtNumber = document.getElementById("txtNumber");
        let txtName = document.getElementById("txtName");
        OffBoardEmpId = null;
        let isOffBoardEmpId = true;
        if ($("#rdoSharePointUser")["0"].checked == true) {
            txtName.value = "";
            OffBoardEmpId = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].GetSelectedUserIds();
            if (!BKJSShared.NotNullOrUndefined(OffBoardEmpId)) {
                flgValid = false;
            }
            else {
                isOffBoardEmpId = true;
                let objEmpOffboard = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].SelectedUserData[OffBoardEmpId]
                txtName.value = objEmpOffboard.Title;
                //OffBoardEmpId = OffBoardEmpId;
            }
        }
        if (flgValid == false) {
            //$('.nav li a').not('.active').addClass("disabled");
            $('.nav li').not('.active').find('a').removeAttr("data-toggle");
            $("#divMsg").html("");
            $("#divMsg").attr('style', 'color:red;');
            $("#divMsg").html("Please fill the required basic information.");
        }
        else {
            $("#divMsg").html("");
            $('.nav li a').not('.active').removeClass("disabled");
            $('.nav li').not('.active').find('a').attr("data-toggle", "tab");
            SaveAttachmentsInMemory();
        }
        $('a[data-toggle="tab"]').on('click', function (e) {
            OnOffboardModalComponent.ResetAndCloseActualTask();
            var target = $(e.target).parent() // activated tab
            var CurrentTabID = target.attr("id");
            if (BKJSShared.NotNullOrUndefined(CurrentTabID)) {
                EOBShared.SetTabsTextAndBackGroundColor(OnBoardDialogTabIdArray, CurrentTabID);
            }
        });
    }

    _OnAssignedToChange() {
        OnOffboardModalComponent.GetOffboardedEmployeeIdList();
    }

    GetOffboardedEmployeeIdList() {
        try {
            var Url = ""
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$select=ID%2COData__EmployeeName%2COffBoardEmployeeIDId&$filter=Process/ID eq '2' ";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnOffboardModalComponent._onEmployeeItemGet, OnOffboardModalComponent._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.GetEmployeeData"); }
    }

    _onEmployeeItemGet(data) {
        if (BKJSShared.NotNullOrUndefined(data)) {
            if (data.d.results.length > 0) {
                for (var i = 0; i < data.d.results.length; i++) {
                    var liOffBoardEmpId = data.d.results[i].OffBoardEmployeeIDId;
                    if ($("#rdoSharePointUser")["0"].checked == true) {
                        var OffBoardEmpId = BKSPPeoplePickerRest.PeoplePickerInstances["offboardempuserpicker"].GetSelectedUserIds();
                        if (!BKJSShared.NotNullOrUndefined(OffBoardEmpId)) {
                            if ($("#divPeoplePickerOffboard")) {
                                $("#divPeoplePickerOffboard").html('');
                            }
                            $("#offboardempuserpicker").after("<div style='color:red;' id='divPeoplePickerOffboard'>Required.</div>");
                            validOffboardedEmp = false;
                            return;
                        }
                        else {
                            if (liOffBoardEmpId == OffBoardEmpId) {
                                $("#offboardempuserpicker").after("<div style='color:red;' id='divPeoplePickerOffboard'>Already Offboarded</div>");
                                validOffboardedEmp = false;
                                return;
                            }
                            else {
                                if ($("#divPeoplePickerOffboard")) {
                                    $("#divPeoplePickerOffboard").html('');
                                    validOffboardedEmp = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    render() {
        return (
            <div>
                <div id="OnOffBoardDialog" className="modalReact pt-2">
                    <div className="modal-contentReact col-lg-8 col-md-10">
                        <div className="row modal-head align-items-center">
                            <div id="OnOffBoardHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{OnOffboardModalComponent.state.sModalHeadingText}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={OnOffboardModalComponent.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form modal-h-480">
                            <ul class="tab-menu nav nav-tabs mb-2" role="tablist">
                                <li class="nav-item" id="tbBasicInfo">
                                    <a class="nav-link active" data-toggle="tab" href="#BasicInfo">Basic Information</a>
                                </li>
                                <li class="nav-item" id="tbTasks">
                                    <a class="nav-link" data-toggle="tab" href="#Tasks">Tasks</a>
                                </li>
                            </ul>
                            <div id="divMsg"></div>
                            <div class="tab-content col-12 p-0">
                                <div id="BasicInfo" className="tab-pane active">
                                    <div className="col-12 mb-3">
                                        <div className="row section">
                                            <div className="col-md-3 col-sm-6 col-12" id="divUserType">
                                                <div className="form-group mb-0">
                                                    <label>User Type</label>
                                                </div>
                                                <div className="custom-control custom-radio custom-control-inline">
                                                    <input type="radio" id="rdoSharePointUser" name="rdoUserType" className="custom-control-input" value="rdoSharePointUser" onChange={OnOffboardModalComponent.UserTypeChange} checked={OnOffboardModalComponent.state.UserType === "rdoSharePointUser"} />
                                                    <label className="custom-control-label" htmlFor="rdoSharePointUser">SharePoint User</label>
                                                </div>
                                                <div className="custom-control custom-radio custom-control-inline">
                                                    <input type="radio" id="rdoOtherUser" name="rdoUserType" className="custom-control-input" onChange={OnOffboardModalComponent.UserTypeChange} checked={OnOffboardModalComponent.state.UserType === "rdoOtherUser"} value="rdoOtherUser" />
                                                    <label className="custom-control-label" htmlFor="rdoOtherUser">Other</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12" id="divEmployeeNameText">
                                                <div className="form-group">
                                                    <label>{ConfigModal.gConfigSettings.DisplayTextEmployee} Name <sup className="medentry">&#42;</sup></label>
                                                    <input type="text" id="txtName" className="form-control form-control-sm BKValidateEmptyValue" maxLength="25" placeholder="Enter Name" />
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12" id="divEmployeeNamePeoplePicker" style={{ display: 'none' }}>
                                                <div className="form-group">
                                                    <label>Employee Name <sup className="medentry">&#42;</sup></label>
                                                    <div id="divPeoplePickerOffboardEmp" className="form-group">
                                                        <div id="offboardempuserpicker"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>{ConfigModal.gConfigSettings.DisplayTextEmployee} Number</label>
                                                    <input type="text" id="txtNumber" maxLength="15" className="form-control form-control-sm" placeholder="Enter Number" />
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oOnOffBoardPositionComboProps}></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oOnOffBoardDepartmentComboProps}></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <ComboMain ComboProperties={oOnOffBoardEmployeeTypeComboProps}></ComboMain>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group input-with-icon">
                                                    <label>{OnOffboardModalComponent.state.DojDorText} <sup className="medentry">&#42;</sup></label>
                                                    <input type="text" id="txtDOJ" className="form-control form-control-sm BKValidateEmptyValue" placeholder="Enter Date" />
                                                    <div className="input-icon">
                                                        <a herf="#"><i className="fa fa-calendar"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Personal Email</label>
                                                    <input type="text" id="txtPersonalEmail" maxLength="50" className="form-control form-control-sm BKValidateEmail" placeholder="Enter Personal Email" />
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Contact Number</label>
                                                    <input type="text" id="txtContactNumber" maxLength="15" className="form-control form-control-sm" placeholder="Enter Contact Number" />
                                                </div>
                                            </div>
                                            <div id="divOnboardExtraFields" className="col-12">
                                                <div className="row">
                                                    <div className="col-md-3 col-sm-6 col-12">
                                                        <div className="form-group">
                                                            <label>Alternate Contact Number</label>
                                                            <input type="text" id="txtAlternateContactNumber" maxLength="15" className="form-control form-control-sm" placeholder="Enter Alternate Contact Number" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6 col-12">
                                                        <div className="form-group">
                                                            <label>Present Employer</label>
                                                            <input type="text" id="txtPresentEmployer" maxLength="200" className="form-control form-control-sm" placeholder="Enter Present Employer" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6 col-12">
                                                        <div className="form-group">
                                                            <label>Location</label>
                                                            <input type="text" id="txtLocation" maxLength="25" className="form-control form-control-sm" placeholder="Enter Location" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6 col-12">
                                                        <div className="form-group">
                                                            <label>Recruiter's Name</label>
                                                            <input type="text" id="txtRecruiterName" maxLength="25" className="form-control form-control-sm" placeholder="Enter Recruiter's Name" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div className="form-group input-with-icon">
                                                    <label>{OnOffboardModalComponent.state.ProcessText} Start Date <sup className="medentry">&#42;</sup></label>
                                                    <input type="text" id="txtOnOffboardStartDate" className="form-control form-control-sm BKValidateEmptyValue" placeholder="Enter Onboard Date" />
                                                    <div className="input-icon">
                                                        <a herf="#"><i className="fa fa-calendar"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 col-12">
                                                <div id="divPeoplePicker" className="form-group">
                                                    <label>Manager <sup className="medentry">&#42;</sup></label>
                                                    <div id="userpicker" className="SettingConfigUserPicker"></div>
                                                </div>
                                            </div>

                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Remarks</label>
                                                    <textarea className="form-control form-control-sm" rows="3" maxLength="225" placeholder="Enter text here..." id="txtRemark"></textarea>
                                                    <div id="CommentHistory">
                                                        <div className="collapse-main mt-2">
                                                            <a data-toggle="collapse" href="#collapse1" aria-expanded="false" aria-controls="collapse1" class="font-weight-normal"><i class="fa fa-angle-right"></i> <i class="fa fa-angle-down"></i> Additional Comments History </a>
                                                        </div>
                                                        <div className="collapse" id="collapse1">
                                                            <ul id="ulRemarkVersions" class="remark-versions-list">
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group files" id="filesBasic">
                                                    <label>Attachments</label> <a href="#" className="tooltip-icon" data-toggle="tooltip" data-placement="top" title="The attachments file size should not exceed 5 MB."><i className="fa fa-question-circle"></i></a>
                                                    <input type="file" id="fileUploadBasic" name="filesBasic" className="form-control-file select-input" multiple="true" />
                                                    <ul class="fileList choose-list"></ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="divEmployeeCustomFields" className="col-12">
                                        <div className="row section">
                                            {OnOffboardModalComponent.state.sEmployeeCustomFields}
                                        </div>
                                    </div>
                                </div>
                                <div id="Tasks" className="tab-pane fade">
                                    <div className="row mt-1 mb-3">
                                        <div className="col-12">
                                            <a class="add-new-btn collapsed" data-toggle="collapse" href="#addTaskCollapse" aria-expanded="false" aria-controls="addTaskCollapse" onClick={OnOffboardModalComponent.AddRow}><strong>+</strong>Add Task</a>
                                        </div>
                                    </div>
                                    <div className="col-12 collapse mb-2" id="addTaskCollapse">
                                        <div className="row section mb-3">
                                            <div className="col-12">
                                                <div id="StandardTaskDialog">
                                                    <div>
                                                        <div class="tab-content col-12 p-0">
                                                            <div id="StandardTask" className="row">
                                                                <label id="lblIdStandardTask"></label>
                                                                <label id="lblAtTempRowId"></label>
                                                                <label id="lblAtRowId"></label>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <label>Task Name <sup className="medentry">&#42;</sup></label>
                                                                        <input type="text" id="txtTaskName" maxlength="225" className="form-control form-control-sm" onKeyUp={BKValidationShared.IndividualValidationMethods.CheckSpecialChar} placeholder="Enter Task Name" onChange={OnOffboardModalComponent._OnTaskNameChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12" style={{ display: 'none' }}>
                                                                    <div className="form-group">
                                                                        <ComboMain ComboProperties={oAtMProcessTypeComboProps}></ComboMain>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <ComboMain ComboProperties={oAtMCategoryComboProps} ref={OnOffboardModalComponent.CategoryCombo}></ComboMain>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <label>Resolution Days <sup className="medentry">&#42;</sup></label>
                                                                        <input type="number" id="txtResolutionDays" defaultValue="0" className="form-control form-control-sm" placeholder="Enter Resolution Days" />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <ComboMain ComboProperties={oAtMDepartmentComboProps}></ComboMain>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <ComboMain ComboProperties={oAtMLevelComboProps}></ComboMain>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <label>Task Assign Type <sup className="medentry">&#42;</sup></label>
                                                                        <select className="form-control form-control-sm" id="ddlTaskTypeSelect" onChange={OnOffboardModalComponent._OnTaskTypeChange}>
                                                                            <option value={"Standard Task"}>Standard Task</option>
                                                                            <option value={"Reporting Manager"}>Reporting Manager</option>
                                                                            <option value={"Onboarding Offboarding Employee"}>Onboarding/Offboarding {ConfigModal.gConfigSettings.DisplayTextEmployee}</option>
                                                                            <option value={"Assignto While Onboarding"}>Assignto While Onboarding</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                                    <div id="divAtPeoplePicker" className="form-group">
                                                                        <label id="lblAtAssignedTo">Assigned To <sup className="medentry">&#42;</sup></label>
                                                                        <div id="atuserpicker"></div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                                    <div className="form-group">
                                                                        <label>Remark</label>
                                                                        <textarea className="form-control form-control-sm" maxlength="225" rows="3" placeholder="Enter text here..." id="txtAtRemark"></textarea>
                                                                        <div id="atCommentHistory">
                                                                            <div className="collapse-main mt-2">
                                                                                <a data-toggle="collapse" href="#collapse1" aria-expanded="false" aria-controls="collapse1" class="font-weight-normal"><i class="fa fa-angle-right"></i> <i class="fa fa-angle-down"></i> Additional Comments History </a>
                                                                            </div>
                                                                            <div className="collapse" id="collapse1">
                                                                                <ul id="atUlRemarkVersions" class="remark-versions-list">
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-3 col-sm-6 col-12" style={{ display: 'none' }}>
                                                                    <div className="form-group">
                                                                        <p className="m-0 f-w-medium c-black">Mandatory Task</p>
                                                                        <label className="switch success ">
                                                                            <input type="checkbox" className="success" id="chkMandatoryTask" />
                                                                            <span className="slider round ChangeSpanBackground"></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-3 col-sm-6 col-12" style={{ display: 'none' }}>
                                                                    <div className="form-group">
                                                                        <p className="m-0 f-w-medium c-black">Active</p>
                                                                        <label className="switch success ">
                                                                            <input type="checkbox" className="success" id="chkActualTaskActive" />
                                                                            <span className="slider round ChangeSpanBackground"></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6">
                                                                    <div className="form-group files" id="files1">
                                                                        <label>Attachments</label> <a href="#" className="tooltip-icon" data-toggle="tooltip" data-placement="top" title="The attachments file size should not exceed 5 MB."><i className="fa fa-question-circle"></i></a>
                                                                        <input type="file" id="fileUpload" name="files1" className="form-control-file select-input" multiple="true" />
                                                                        <ul class="fileList choose-list"></ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row modal-footer">
                                                            <div className="col-12 text-center">
                                                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"btnActualTaskAddSave"} onClick={OnOffboardModalComponent.AddEditTasksInTemporaryArray} value={OnOffboardModalComponent.state.AddButtonText} data-toggle="collapse show" href="#addTaskCollapse" aria-expanded="false" aria-controls="addTaskCollapse" />
                                                                <input type="Button" className="btn btn-light" data-toggle="collapse" href="#addTaskCollapse" aria-expanded="false" aria-controls="addTaskCollapse" onClick={OnOffboardModalComponent.ResetAndCloseActualTask} value="Cancel" />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row section m-0 justify-content-end">
                                        <div className="col-lg-3 col-md-4">
                                            <div className="form-group task-template-select mb-0">
                                                <ComboMain ComboProperties={oTaskTemplateType}></ComboMain>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-3 mt-3">
                                            <div className="row task-label m-0">
                                                <div className="col-lg-2 col-md-3 task-label-left">
                                                    <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                                        {OnOffboardModalComponent.state.LevelTabs}
                                                    </div>
                                                </div>
                                                <div className="col-lg-10 col-md-9 task-label-right pb-3">
                                                    <div class="tab-content" id="v-pills-tabContent">
                                                        {OnOffboardModalComponent.state.gridHeader}
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
                                <input type="Button" className="btn btn-light" id={"btnOnOffBoardAbort"} onClick={OnOffboardModalComponent.AbortReInitiateOnboardOffboard} />
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"btnOnOffBoardAddSave"} onClick={OnOffboardModalComponent.AddUpdateOnBoardOffBoard} value={OnOffboardModalComponent.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={OnOffboardModalComponent.Reset} value={OnOffboardModalComponent.state.ResetButtonText} id={"btnReset"} />
                            </div>
                        </div>
                    </div>
                    {OnOffboardModalComponent.state.LicenseValidationModal}
                </div>
            </div>
        );
    }
}

