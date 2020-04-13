"use strict";
let DashboardComponent = null;
let isDeleteDialogOpened = false;
var oEmployeeTasksColProps = [];
let oEmployeeTaskGridProps = null;
let oTaskColumnProps = null;

let TaskGridComponent = null;
let gDashBoardData = {
    Employees: [],
    AllOpenTasks: [],
    OnGoingOnBoardEmployees: [],
    OnGoingOffBoardEmployees: [],
    OverDueOnBoardEmployees: [],
    OverDueOffBoardEmployees: [],
    PerCentOngoingPerDepartment: {
        "OnBoard": [],
        "OffBoard": []
    },
    Departments: [],
    DrawerOpen: 1
}

class MyTasksMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            TasksData: null,
            ProcessType: null,
            OnGoingOnBoardingEmployeeCount: "",
            OnGoingOffBoardingEmployeeCount: "",
            OngoingDepartmentWiseOnBoardEmployees: "",
            OngoingDepartmentWiseOffBoardEmployees: "",
            TasksGrid: null,
            OverDueTaskData: null,
            StatusOptions: null,
            DepartmentOptions: null,
        }
        DashboardComponent = this;
        this.TaskGridComponent = React.createRef()
        this.BindContextToFunctions();
        this.SetTaskColumnProperties();
        this.setTaskGridProps();

    }
    componentWillMount() {

    }
    componentDidMount() {
        EOBConstants.SetNewThemeColor();
      
        this.CreateDashBoard();
        $("#dtFromPicker").datepicker({
            autoclose: true,
            todayHighlight: true,
            format: "dd/mm/yyyy",
        }).datepicker().on("hide", function (e) {

            DashboardComponent._UpdateSearchIcon();
        });;


        $("#dtToPicker").datepicker({
            autoclose: false,
            todayHighlight: true,
            format: "dd/mm/yyyy",
        }).datepicker().on("hide", function (e) {

            DashboardComponent._UpdateSearchIcon();
        });;
        BKSPPeoplePicker.InitializePeoplePicker({
            element: "userpicker",
            isAllowMultipleValues: true,
            classuserSpan: "peoplepicker-userSpan",
            classtoplevel: "peoplepicker-topLevel",
            classhelptext: "peoplepicker-initialHelpText",
            classautofillcontainer: "peoplepicker-autoFillContainer",
            callback: DashboardComponent._UpdateSearchIcon

        });
        this.GetTaskStatusValues();
       
    }
    BindContextToFunctions() {
        this._onNotAbortedEmployeeGetSuccess = this._onNotAbortedEmployeeGetSuccess.bind(this);
        this._onGetAllOpenTasksSuccess = this._onGetAllOpenTasksSuccess.bind(this);
        this._onRestCallFailure = this._onRestCallFailure.bind(this);
        this.CreateDashBoard = this.CreateDashBoard.bind(this);
        this.isTaskDue = this.isTaskDue.bind(this);
        this.FilterTasksByEmployee = this.FilterTasksByEmployee.bind(this);      
        this.FilterTasksByProcessType = this.FilterTasksByProcessType.bind(this);
        this.ReturnUserBasedFilterString = this.ReturnUserBasedFilterString.bind(this);
        this._isDueDateExceed = this._isDueDateExceed.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.SetTaskColumnProperties = this.SetTaskColumnProperties.bind(this);
        this.setTaskGridProps = this.setTaskGridProps.bind(this);
        this.FilterGridTasks = this.FilterGridTasks.bind(this);
        this._onTaskStatusValuesSucess = this._onTaskStatusValuesSucess.bind(this);
        this.GetTaskStatusValues = this.GetTaskStatusValues.bind(this);
        this._UpdateSearchIcon = this._UpdateSearchIcon.bind(this);
        this.CreateDashBoardTasks = this.CreateDashBoardTasks.bind(this);
        this.FillDepartmentOptions = this.FillDepartmentOptions.bind(this);    
    }
    CreateDashBoard() {
        this.CreateEmplpoyeeBoardingSnapShot();
        ConfigModal._onUserAdminStatusLoadCallBack = this.CreateDashBoardTasks;

    }
    CreateEmplpoyeeBoardingSnapShot() {
        this.GetNotAbortedEmployees();
    }
    toggleDrawer() {
        if (gDashBoardData.DrawerOpen == 0) {
            $("#MyTasksMain").removeClass("db-menu-open")

            gDashBoardData.DrawerOpen = 1;
        }
        else {
            gDashBoardData.DrawerOpen = 0;
            $("#MyTasksMain").addClass("db-menu-open")

        }

    }
    
    GetNotAbortedEmployees() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$filter=(OData__StatusE%20ne%20%27Aborted%27)";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onNotAbortedEmployeeGetSuccess, this._onRestCallFailure);
    }
    GetTaskStatusValues() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('ActualTasks')/fields?$filter=Internalname eq 'Status'";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onTaskStatusValuesSucess, this._onRestCallFailure);
    }
    GetAllOpenTasks() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$select=ID%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus&$expand=OData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetAllOpenTasksSuccess, this._onRestCallFailure);
    }
    
    isTaskDue(TaskDueDate) {
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        var currDate = Date.parse(utc);
        var TaskDueDate = new Date(TaskDueDate);
        TaskDueDate = new Date(TaskDueDate);
        var utcTaskDueDate = new Date(TaskDueDate).toJSON().slice(0, 10).replace(/-/g, '/');
        TaskDueDate = Date.parse(new Date(utcTaskDueDate));
        if (TaskDueDate < currDate) {
            return true
        }
        else {
            return false;
        }
    }
   
    FilterTasksByEmployee(EmployeeID) {

        var ListItemsFilterData = gDashBoardData.AllOpenTasks.filter(function (el) {
            return el.OData__EmployeeIDId == EmployeeID
        });
        return ListItemsFilterData;
    }
    FilterTasksByProcessType(ProcessName) {
        var ProcessId = 1;
        var ProcessTypeBasedOnGoingTasks = [];
        ProcessTypeBasedOnGoingTasks = gDashBoardData.OnGoingOnBoardEmployees;
        //  1 = OnBoard, 2 = OffBoard
        if (ProcessName == "Off Board") {
            ProcessId = 2;
            ProcessTypeBasedOnGoingTasks = gDashBoardData.OnGoingOffBoardEmployees;
        }
        //if (isNumber) {
        var ListItemsFilterData = ProcessTypeBasedOnGoingTasks.filter(function (el) {
            return el.ProcessId == ProcessId
        });
        return ListItemsFilterData;
    }

   
    ReturnUserBasedFilterString(isAssignAnd) {
        var FilterText = [];
        var FilterAssignArray = [];
        var CombineQueryFilter = "";
        if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
            if (ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.length > 0) {
                for (var j = 0; j < ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.length; j++) {
                    FilterAssignArray.push("(AssignedTo eq '" + ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds[j] + "')")
                }
            }
            for (var l = 0; l < ConfigModal.gConfigSettings.CurrentUserDepartment.length; l++) {
                FilterText.push("(DepartmentsId/_DepartmentName eq '" + ConfigModal.gConfigSettings.CurrentUserDepartment[l] + "')")
            }
        }
        if (isAssignAnd !== "") {
            FilterAssignArray = FilterAssignArray.join(" or ")
        }
        else {
            FilterAssignArray = FilterAssignArray.join(" " + isAssignAnd + " ")
        }
        FilterText = FilterText.join(" or ")
        for (var i = 0; i < FilterAssignArray.length; i++) {
            CombineQueryFilter += FilterAssignArray[i]
        }
        CombineQueryFilter += " or "
        for (var i = 0; i < FilterText.length; i++) {
            CombineQueryFilter += FilterText[i]
        }
        return ("(" + CombineQueryFilter + ")");
    }
    CreateDashBoardTasks() {
        var FilterString = "";
        var StrictFilter = "";
        gDashBoardData.Departments = ConfigModal.arrDepartments;
        if (!ConfigModal.gConfigSettings.isCurrentUserAdmin) {           
            if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
                FilterString = this.ReturnUserBasedFilterString()
            }
            else {
                FilterString = "(AssignedTo eq '" + _spPageContextInfo.userId + "')"
            }
            StrictFilter = FilterString;
        }
        this.FillDepartmentOptions();

        const Grid = <DataGridMain GridProperties={oEmployeeTaskGridProps} FilterText={FilterString} StrictFilter={StrictFilter} SortText={"DueDate asc"} ref={this.TaskGridComponent} ></DataGridMain>
        this.setState({ TasksGrid: Grid })
    }

  
    _onNotAbortedEmployeeGetSuccess(data) {
        console.log("Not aborted data:")

        gDashBoardData.Employees = data.d.results;
        this.GetAllOpenTasks()
    }
    _onGetAllOpenTasksSuccess(data) {
        gDashBoardData.AllOpenTasks = data.d.results;
    }
    FillDepartmentOptions(data) {
        //gDashBoardData.Departments = ConfigModal.arrDepartments;
        if (gDashBoardData.Departments.length > 0) {
            var DepartmentOptions = []
            const Option = <option ></option>
            DepartmentOptions.push(Option)
            for (var i = 0; i < gDashBoardData.Departments.length; i++) {
                var DepartmentName = gDashBoardData.Departments[i]["OData__DepartmentName"]
                const Option = <option value={DepartmentName}>{DepartmentName}</option>
                DepartmentOptions.push(Option)
            }
            this.setState({ DepartmentOptions: DepartmentOptions })
        }

    }
    _onTaskStatusValuesSucess(data) {      
        if (data.d.results.length > 0) {
            var StatusChoices = data.d.results[0].Choices;
            var OptionsArray = [];
            const Option = <option ></option>
            OptionsArray.push(Option)
            for (var i = 0; i < StatusChoices.results.length; i++) {
                const Option = <option value={StatusChoices.results[i]}>{StatusChoices.results[i]}</option>
                OptionsArray.push(Option)
            }
            this.setState({ StatusOptions: OptionsArray });
        }

    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    _isDueDateExceed(FieldValue) {
        var DueDate = moment(FieldValue).format("DD/MM/YYYY")
        var isDateDue = moment(DueDate, "DD/MM/YYYY").isBefore(moment())

        var DueDateTD = null;
        //css class is not reflecting so currently doing through this way
        var OverDueBorderStyle = {
            borderLeftWidth: "5px",
            borderRightWidth: "0px",
            borderTopWidth: "0px",
            borderBottomWidth: "0px",
            borderStyle: "solid",
            borderColor: "#e61717"
        };
        if (isDateDue) {
            // date is past
            DueDateTD = <td style={OverDueBorderStyle}>{DueDate}</td>
        } else {
            // date is future
            DueDateTD = <td>{DueDate}</td>
        }


        return DueDateTD;
    }
    SetTaskColumnProperties() {
        var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
        oEmployeeTasksColProps.push(colID);

        var colActivity = new ColumnProperties("DueDate", "Due Date", "", true, true, "text", "DD/MM/YYYY", false, "", this._isDueDateExceed);
        oEmployeeTasksColProps.push(colActivity);

        var colTitle = new ColumnProperties("Title", "Title", "", true, true, "text", "", false, "");
        oEmployeeTasksColProps.push(colTitle);

        var colEmployee = new ColumnProperties("OData__EmployeeID", "Employee Name", "", true, true, "Lookup", "", true, "_EmployeeName");
        oEmployeeTasksColProps.push(colEmployee);

        //var colDepartmentID = new ColumnProperties("IDDepartment", "Department", "", true, true, "Number", "", false, "");
        //oEmployeeTasksColProps.push(colDepartmentID);

        var colDepartmentID = new ColumnProperties("Departments", "Department", "", true, true, "Lookup", "", true, "_DepartmentName");
        oEmployeeTasksColProps.push(colDepartmentID);


        var colAssignedTo = new ColumnProperties("AssignedTo", "Assigned To", "", true, true, "People", "", false, "");
        oEmployeeTasksColProps.push(colAssignedTo);

        var colStatus = new ColumnProperties("Status", "Status", "", true, true, "text", "", false, "");
        oEmployeeTasksColProps.push(colStatus);

        //var colRemark = new ColumnProperties("Remark", "Remark", "", true, true, "text", "", false, "");
        //oEmployeeTasksColProps.push(colRemark);

    }
    setTaskGridProps() {
        oEmployeeTaskGridProps = new GridProperties("gridStandardTask", EOBConstants.ListNames.ActualTasks, oEmployeeTasksColProps, "", "", true, 5, "", true, true, false, null, null, "", "");
    }
    FilterGridTasks() {

        var sDateFrom = $("#dtFromPicker").val();
        var sDateTo = $("#dtToPicker").val();
        var sEmployeeName = $("#txtEmployeeName").val();
        var sTaskStatus = $("#ddStatus").val();
        var sDepartment = $("#ddDepartments").val();
        var sProcessType = $("#ddDashBoardProcess").val();
        let isMyTask = $("#chkMyTask").prop('checked');
        var AssignedIDObject = BKSPPeoplePicker.GetSelectedUserIds();
        AssignedIDObject = AssignedIDObject.results.slice();
        var dFilterObject = [];
        var FilterText = "";
        var FilterArray = [];
        if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
            var FilterString = this.ReturnUserBasedFilterString("or")
            dFilterObject.push(FilterString)
        }
        FilterArray = FilterArray.join(" or ")
        var dDueFrom = moment(sDateFrom, "DD/MM/YYYY");
        dDueFrom = moment(dDueFrom).format("YYYY-MM-DDT00:00:00.000") + "Z"
        var dDueTo = moment(sDateTo, "DD/MM/YYYY");
        dDueTo = moment(dDueTo).format("YYYY-MM-DDT00:00:00.000") + "Z"


        if (sDateFrom != "") {
            FilterText = "(DueDate ge datetime'" + dDueFrom + "')"
            dFilterObject.push(FilterText);
        }
        if (sDateTo != "") {
            FilterText = "(DueDate le datetime'" + dDueTo + "')"
            dFilterObject.push(FilterText);
        }
        if (sEmployeeName != "") {
            FilterText = "(OData__EmployeeIDId/_EmployeeName eq '" + sEmployeeName + "')"
            dFilterObject.push(FilterText);
        }
        if (isMyTask) {
            AssignedIDObject.push(_spPageContextInfo.userId);
        }
        if (AssignedIDObject.length > 0) {

            for (var i = 0; i < AssignedIDObject.length; i++) {
                FilterText = "(AssignedTo eq '" + AssignedIDObject[i] + "')"
                dFilterObject.push(FilterText);
            }
        }
        if (sTaskStatus != "") {
            FilterText = "(Status eq '" + sTaskStatus + "')"
            dFilterObject.push(FilterText);
        }
        if (sDepartment != "") {
            FilterText = "(Departments/_DepartmentName eq '" + sDepartment + "')"
            dFilterObject.push(FilterText);
        }
        if (sProcessType != "") {

            FilterText = "(ProcessId/Title eq '" + sProcessType + "')"
            dFilterObject.push(FilterText);
        }


        this.TaskGridComponent.current.CreateFilterString(dFilterObject)
    }
    DeleteDepartment(DataObject) {
        nDeleteModalCurrentItemID = DataObject["ID"]
        if (!isDeleteDialogOpened) {
            isDeleteDialogOpened = true;
            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Department} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={DashboardComponent.DeleteDepartment} HandleDataUpdate={DashboardComponent.UpdateGrid} ></DeleteDialog >
            DashboardComponent.setState({ DeleteDialog: Dialog });
        }
        else {
            var modal = document.getElementById("DeleteDialog");
            modal.style.display = "block";
            $("#DeleteModalBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        }
    }
    UpdateGrid() {
        DashboardComponent.DataGrid.current.CreateGrid();
    }
    OpenAddDepartment(DataObject) {
        if (DataObject["ID"]) {
            //opened component 
            nDepartmentModalCurrentEditItemID = DataObject["ID"];
            $("#DepartmentAddSaveBtn").val("Edit")
            $("#DepartmentTxtBox").val(DataObject["Department Name"])
            $("#DepartmentHeadingDiv").text("Edit Department")
            $("#DepartmentActiveChk").prop('checked', DataObject["Active"]);
        }
        else {
            $("#DepartmentHeadingDiv").text("Add Department")
            $("#DepartmentActiveChk").prop('checked', true);
        }
        if (!isDialogOpened) {
            isDialogOpened = true;
            let Dialog = null;
            if (DataObject["ID"]) {
                Dialog = <DepartmentDialog isEdit={true} DepartmentName={DataObject["Department Name"]} isActive={DataObject["Active"]} ModalHeading={"Edit Department"} HandleDataUpdate={DashboardComponent.UpdateGrid}></DepartmentDialog>
            }
            else {

                Dialog = <DepartmentDialog isEdit={false} ModalHeading={"Add Department"} isActive={true} HandleDataUpdate={DashboardComponent.UpdateGrid}></DepartmentDialog>
            }

            DashboardComponent.setState({ DepartmentDialog: Dialog });
        }
        else {
            var modal = document.getElementById("DepartmentDialog");
            modal.style.display = "block";
            $("#DepartmentAddSaveBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        }
    }
    ReturnSelectedActiveStatus() {
        let SelectedActive = document.getElementById("ActiveFilterSelect");
        SelectedActive = SelectedActive.value;
        var nCurrentActiveID = 0;
        nCurrentActiveID = $("#ActiveFilterSelect").children(":selected").attr("id");
        nCurrentActiveID = nCurrentActiveID.replace(SelectedActive, "");
        nCurrentActiveID = parseInt(nCurrentActiveID);

        let ActiveObject = {}
        ActiveObject["Id"] = nCurrentActiveID
        ActiveObject["Value"] = SelectedActive
        return ActiveObject;
    }
    isCurrentUserSuperAdmin() {
        var isAdmin = false;
        let CurrentUserID = _spPageContextInfo.userId;
        for (var i = 0; i < ConfigModal.gConfigSettings.CurrentAdminUserID.length; i++) {
            var isGroup = BKSPShared.CurrentUserGroupsData[CurrentUserID];
            if (ConfigModal.gConfigSettings.CurrentAdminUserID[i] == CurrentUserID || (BKJSShared.NotNullOrUndefined(isGroup))) {
                isAdmin = true;
                break
            }
        }
        ConfigModal.gConfigSettings.isCurrentUserAdmin = isAdmin
    }
    isCurrentUserDepartmentAdmin() {
        var isDepartmentAdmin = false;
        let CurrentUserID = _spPageContextInfo.userId;
        for (var i = 0; i < gDashBoardData.Departments.length; i++) {
            if (gDashBoardData.Departments[i].DepartmentAdminId !== null) {
                var CurrentAdmins = gDashBoardData.Departments[i].DepartmentAdminId.results

                var isFound = $.inArray(CurrentUserID, CurrentAdmins);
                if (isFound > -1) {
                    isDepartmentAdmin = true;
                    ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.push(CurrentAdmins[0])
                    ConfigModal.gConfigSettings.CurrentUserDepartment.push(gDashBoardData.Departments[i].OData__DepartmentName)
                }
            }
        }
        ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin = isDepartmentAdmin;

    }
    _OnResetClick() {
        $("#DepartmentGridSearchTextBox").val("");
        $("#ActiveFilterSelect").val("All");
        DashboardComponent.DataGrid.current.ClearFilter();
    }
    _OnSearchClick() {
        var FreeText = $("#DepartmentGridSearchTextBox").val();
        var Active = DashboardComponent.ReturnSelectedActiveStatus();
        var FilterText = "";
        FilterObject = [];
        if (FreeText != "") {
            FilterText = "substringof('" + FreeText + "','OData__DepartmentName')";
            FilterObject.push(FilterText);
        }
        if (Active.Value != "All") {
            FilterText += "IsActive1 eq" + Active.Id;
            FilterObject.push(FilterText);
        }
        DashboardComponent.DataGrid.current.CreateFilterString(FilterObject);
    }
    _UpdateSearchIcon() {
        var ControlsObject = [
            { ID: "#dtFromPicker", Type: "text" },
            { ID: "#dtToPicker", Type: "text" },
            { ID: "#ddDashBoardProcess", Type: "text" },
            { ID: "#txtEmployeeName", Type: "text" },
            { ID: "#ddDepartments", Type: "text" },
            { ID: "#chkMyTask", Type: "bool" }
        ]
        var isValueFound = false;
        if (BKSPPeoplePicker.isAnyUserGroupSelected) {
            isValueFound = true;
        }
        else {
            for (var i = 0; i < ControlsObject.length; i++) {
                var ControlValue = null;
                if (ControlsObject[i]["Type"] !== "bool") {
                    ControlValue = $(ControlsObject[i]["ID"]).val()
                }
                else {
                    ControlValue = $("#chkMyTask").prop('checked');
                }
                if (BKJSShared.NotNullOrUndefined(ControlValue) == true) {
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
            $("#dashboardFilterIcon").addClass("hvr-pulse")
        }
        else {
            $("#dashboardFilterIcon").removeClass("hvr-pulse")
        }
    }
    render() {
        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Dashboard"} />

                </div>
                <Leftnavigation />
                <div className="content-dashboard-main">
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-12">
                                <a onClick={this.toggleDrawer} data-toggle="tooltip" title="Open & Close Filter" className="menu-icon"><i className="fa fa-arrow-left"></i><i className="fa fa-arrow-right"></i></a>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-lg-9 col-md-12 db-left-section p-0">
                                <div className="row db-section-main mb-4">
                                    <div className="col-12">
                                        <div className="row db-section-body">
                                            <div className="col-12 p-0">
                                                <div className="db-head">
                                                    <p>Task</p>
                                                </div>
                                            </div>
                                            <div className="col-12 p-0">
                                                <div className="row pt-3 db-task-form">
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group input-with-icon">
                                                            <label>From Date</label>
                                                            <input type="text" id="dtFromPicker" className="form-control form-control-sm" />
                                                            <div className="input-icon">
                                                                <a herf="#"><i className="fa fa-calendar"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group input-with-icon">
                                                            <label>To Date</label>
                                                            <input type="text" id="dtToPicker" className="form-control form-control-sm" />
                                                            <div className="input-icon">
                                                                <a herf="#"><i className="fa fa-calendar"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label>Process</label>
                                                            <select id="ddDashBoardProcess" onChange={DashboardComponent._UpdateSearchIcon} class="form-control form-control-sm">
                                                                <option></option>
                                                                <option>OnBoarding</option>
                                                                <option>OffBoarding</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label>Employee</label>
                                                            <input type="text" id="txtEmployeeName" onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label>Assigned To</label>
                                                            <div id="userpicker"></div>

                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label>Status</label>
                                                            <select id="ddStatus" class="form-control">
                                                                {this.state.StatusOptions}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label>Department</label>
                                                            <select id="ddDepartments" onChange={DashboardComponent._UpdateSearchIcon} class="form-control form-control-sm">
                                                                {this.state.DepartmentOptions}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group big-check-box">
                                                            <label className="d-lg-block d-md-block">&nbsp;</label>
                                                            <div className="custom-control custom-checkbox">
                                                                <input id="chkMyTask" type="checkbox" onChange={DashboardComponent._UpdateSearchIcon} className="custom-control-input" />
                                                                <label className="custom-control-label" for="chkMyTask">My Task</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                                        <div className="form-group">
                                                            <label className="d-lg-block">&nbsp;</label>
                                                            <button type="Button" data-toggle="tooltip" title="Search" className="btn btn-primary btn-sm mw-auto mr-2" onClick={this.FilterGridTasks}><i id="dashboardFilterIcon" className="fa fa-search active"></i></button>
                                                            <button type="Button" data-toggle="tooltip" title="Refresh" className="btn btn-light btn-sm mw-auto"><i className="fa fa-refresh"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.TasksGrid}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

            </div>




        );

    }
}
const dom = document.getElementById("MyTasksMain");
ReactDOM.render(
    <MyTasksMain />,
    dom
);

