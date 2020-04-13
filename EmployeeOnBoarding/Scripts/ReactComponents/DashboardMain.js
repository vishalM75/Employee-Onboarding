"use strict";
let DashboardComponent = null;
let isDeleteDialogOpened = false;
var oEmployeeTasksColProps = [];
let oEmployeeTaskGridProps = null;
let oTaskColumnProps = null;
var FilterObject = [];

var TaskGridComponent = null;
var PieChartWidthGlobal = 0
let gDashBoardData = {
    Employees: [],
    AllOpenTasks: [],
    OnGoingOnBoardEmployees: [],
    OnGoingOffBoardEmployees: [],
    OnBoardedEmployees: [],
    OffBoardedEmployees: [],
    OverDueOnBoardEmployees: [],
    OverDueOffBoardEmployees: [],
    PerCentOngoingPerDepartment: {
        "OnBoard": [],
        "OffBoard": []
    },
    Departments: [],
    DrawerOpen: 1,
    DashboardDrawerOpen: 1,
    isFilterClicked: false,
    ClosedTasksIDArray: [],
    OpenedTasksIDArray: [],
    CurrentClosingTaskEventID: null,
    CurrentOpeningTaskEventID: null,
    CurrentClickedCheckBoxID:null
}

class DashboardMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            TasksData: null,
            ProcessType: null,
            OnGoingOnBoardingEmployeeCount: null,
            OnGoingOffBoardingEmployeeCount: null,
            OnboardedEmployeeCount: null,
            OffBoardedEmployeeCount: null,
            OnboardOverDueTables: null,
            OffboardOverDueTables: null,
            OngoingDepartmentWiseOnBoardEmployees: "",
            OngoingDepartmentWiseOffBoardEmployees: "",
            TasksGrid: null,
            OverDueTaskData: null,
            StatusOptions: null,
            DepartmentOptions: null,
            CategoryOptions: null,
            LevelOptions: null,
            TaskEditDialog: null,
            PermissionBasedFilterString: "",
            UserInfoModal: null,
            OverDueTaskReminderDialog: null,
            OffboardingEmployeeModal: null,
            Footer: null
        }
        DashboardComponent = this;

        TaskGridComponent = React.createRef()
        this.BindContextToFunctions();
        this.SetTaskColumnProperties();
        this.setTaskGridProps();
        //ConfigModal._onUserAdminStatusLoadCallBack = this.CreateDashBoardTasks;

    }
    componentDidMount() {
        EOBDataAnalytic.GetDataAnalytics(BKJSShared.Application.Version);
        //   EOBShared.GetPageData(_spPageContextInfo.webDomain); // pass the page name as a parameter 
        //BKSPShared.InitSPObject(null, this._SPInitSuccess)
        try {
            this.CreateDashBoard();
            $("#dtFromPicker").datepicker({
                autoclose: true,
                todayHighlight: true,
                format: "mm/dd/yyyy",
            }).datepicker().on("hide", function (e) {
                DashboardComponent._UpdateSearchIcon();
            });

            $("#dtToPicker").datepicker({
                autoclose: true,
                todayHighlight: true,
                format: "mm/dd/yyyy",
            }).datepicker().on("hide", function (e) {

                DashboardComponent._UpdateSearchIcon();
            });
            BKSPPeoplePicker.InitializePeoplePicker({
                element: "userpicker",
                isAllowMultipleValues: true,
                classuserSpan: "peoplepicker-userSpan",
                classtoplevel: "peoplepicker-topLevel",
                classhelptext: "peoplepicker-initialHelpText",
                classautofillcontainer: "peoplepicker-autoFillContainer",
                callback: this._UpdateSearchIcon
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip({
                    trigger: 'hover'
                })
            });

            EOBConstants.SetNewThemeColor();

        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.componentDidMount"); }
    }
    BindContextToFunctions() {

        this.OpenTaskUpdateModal = this.OpenTaskUpdateModal.bind(this);
        this._onNotAbortedEmployeeGetSuccess = this._onNotAbortedEmployeeGetSuccess.bind(this);
        this._onGetAllOpenTasksSuccess = this._onGetAllOpenTasksSuccess.bind(this);
        this._onRestCallFailure = this._onRestCallFailure.bind(this);
        this.CreateDashBoard = this.CreateDashBoard.bind(this);
        this.isTaskDue = this.isTaskDue.bind(this);
        this.ProcessEmployee_OngoingOnOffBoardingStatus = this.ProcessEmployee_OngoingOnOffBoardingStatus.bind(this);
        this.ProcessEmployee_OnBoardedOffBoardedStatus = this.ProcessEmployee_OnBoardedOffBoardedStatus.bind(this);
        this.FilterTasksByEmployee = this.FilterTasksByEmployee.bind(this);
        this.CalculateOngoingTasksPerDepartment = this.CalculateOngoingTasksPerDepartment.bind(this);
        this.FilterTasksByProcessType = this.FilterTasksByProcessType.bind(this);
        this.ReturnUserBasedFilterString = this.ReturnUserBasedFilterString.bind(this);
        //this._onGetDepartmentNames = this._onGetDepartmentNames.bind(this);
        this.OpenFilterPane = this.OpenFilterPane.bind(this);
        this.GetDepartmentNames = this.GetDepartmentNames.bind(this);
        this._isDueDateExceed = this._isDueDateExceed.bind(this);
        this.toggleDashboardDrawer = this.toggleDashboardDrawer.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this._SPInitSuccess = this._SPInitSuccess.bind(this)
        this.isCurrentUserSuperAdmin = this.isCurrentUserSuperAdmin.bind(this);
        this.SetTaskColumnProperties = this.SetTaskColumnProperties.bind(this);
        this.setTaskGridProps = this.setTaskGridProps.bind(this);
        this.ShowOverDueTaskData = this.ShowOverDueTaskData.bind(this);
        this.FilterGridTasks = this.FilterGridTasks.bind(this);
        this._onTaskStatusValuesSucess = this._onTaskStatusValuesSucess.bind(this);
        this._onLevelValueSucess = this._onLevelValueSucess.bind(this);
        this.GetTaskStatusValues = this.GetTaskStatusValues.bind(this);
        this.GetLevelValues = this.GetLevelValues.bind(this);
        this._UpdateSearchIcon = this._UpdateSearchIcon.bind(this);
        this.CreateDashBoardTasks = this.CreateDashBoardTasks.bind(this);
        this.FillDepartmentOptions = this.FillDepartmentOptions.bind(this);
        this.FillEmployeeAutoComplete = this.FillEmployeeAutoComplete.bind(this);
        this.CreateAutoComplete = this.CreateAutoComplete.bind(this);
        this.FilterOverDueTasks = this.FilterOverDueTasks.bind(this);
        this.CheckBoxCheckFunction = this.CheckBoxCheckFunction.bind(this);
        this.NotSPClickFunction = this.NotSPClickFunction.bind(this);
        this.ReturnSelectedActiveStatus = this.ReturnSelectedActiveStatus.bind(this);
        this._OnResetClick = this._OnResetClick.bind(this);
        this._OnSearchClick = this._OnSearchClick.bind(this);
        this.CustomEditCondition = this.CustomEditCondition.bind(this);
        this.CustomEditFunction = this.CustomEditFunction.bind(this);
        //this.isCurrentUserDepartmentAdmin = this.isCurrentUserDepartmentAdmin.bind(this);
        this._onTaskStatusOpenUpdate = this._onTaskStatusOpenUpdate.bind(this);
        this._onTaskUpdateFailure = this._onTaskUpdateFailure.bind(this);
        this._onCategoryValueSucess = this._onCategoryValueSucess.bind(this);
        this.GetCategoryValues = this.GetCategoryValues.bind(this);
        this.SearchTasksByName = this.SearchTasksByName.bind(this);
        this._UpdateSearchIcon2 = this._UpdateSearchIcon2.bind(this);
        this.CheckAndSearch = this.CheckAndSearch.bind(this);
        this.CreateGridRowDataObject = this.CreateGridRowDataObject.bind(this);
        this.UpdateTaskStatusToClose = this.UpdateTaskStatusToClose.bind(this);
        this.UpdateTaskStatusToOpen = this.UpdateTaskStatusToOpen.bind(this);
        this._CheckProcessAndUpdateCategory = this._CheckProcessAndUpdateCategory.bind(this);
        this.HideLoader = this.HideLoader.bind(this);
        this._onTaskStatusCloseUpdate = this._onTaskStatusCloseUpdate.bind(this);
        this.ShowOpenAsNotStarted = this.ShowOpenAsNotStarted.bind(this);
        this._CheckPermissionAfterTaskGet = this._CheckPermissionAfterTaskGet.bind(this);
        this.AfterGridRender = this.AfterGridRender.bind(this);
        this.ResetDashboardGlobalObjects = this.ResetDashboardGlobalObjects.bind(this);
        this.ResetDashBoardSnapShots = this.ResetDashBoardSnapShots.bind(this);
        this._OnUserExistSuccess = this._OnUserExistSuccess.bind(this);
        this.ShowLoader = this.ShowLoader.bind(this);
        this.OpenTaskReminderDialog = this.OpenTaskReminderDialog.bind(this);
        this.CloseReminderDialog = this.CloseReminderDialog.bind(this);
        this.LoadLicenseDetails = this.LoadLicenseDetails.bind(this);
        this.ShowFooter = this.ShowFooter.bind(this);
        this.UpgradeGridFromTaskUpdateModal = this.UpgradeGridFromTaskUpdateModal.bind(this);
        this.GetCurrentTasksAfterClose = this.GetCurrentTasksAfterClose.bind(this);
        this._onGetCurrentTaskAfterCloseSuccess = this._onGetCurrentTaskAfterCloseSuccess.bind(this)
        this._onActicateAllDependateTasks = this._onActicateAllDependateTasks.bind(this)
        this.isTaskSelfAssigned = this.isTaskSelfAssigned.bind(this)
    }
    CreateDashBoard() {
        try {
            //this.GetDepartmentNames();
            ConfigModal._onUserAdminStatusLoadCallBack = this.CreateDashBoardTasks;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CreateDashBoard"); }

    }
    CreateEmplpoyeeBoardingSnapShot() {
        try {
            this.GetNotAbortedEmployees();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CreateEmplpoyeeBoardingSnapShot"); }
    }
    ResetDashBoardSnapShots() {
        try {
            $("#OnboardPieChartHeading").html("");
            $("#OffboardPieChartHeading").html("");
            $("#OffboardPieChart").html("");
            $("#OnboardPieChart").html("");
            gDashBoardData = this.ResetDashboardGlobalObjects();
            gDashBoardData.Departments = ConfigModal.arrDepartments;
            this.CreateEmplpoyeeBoardingSnapShot();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ResetDashBoardSnapShots"); }
    }
    ResetDashboardGlobalObjects() {
        try {
            var gDashBoardData = {
                Employees: [],
                AllOpenTasks: [],
                OnGoingOnBoardEmployees: [],
                OnGoingOffBoardEmployees: [],
                OnBoardedEmployees: [],
                OffBoardedEmployees: [],
                OverDueOnBoardEmployees: [],
                OverDueOffBoardEmployees: [],
                PerCentOngoingPerDepartment: {
                    "OnBoard": [],
                    "OffBoard": []
                },
                Departments: [],
                DrawerOpen: 1,
                DashboardDrawerOpen: 1,
                isFilterClicked: false,
                ClosedTasksIDArray: [],
                OpenedTasksIDArray: []
            }
            return gDashBoardData
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ResetDashboardGlobalObjects"); }
    }
    OpenFilterPane() {
        try {
            $("#DashboardMain").addClass("db-menu-open");
            $("#FilterRightPaneButton").addClass("active");
            $("#FilterRightPane").fadeIn("fast");
            $("#DashBoardRightPaneButton").removeClass("active");
            $("#DashBoardRightPane").fadeOut("fast");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.OpenFilterPane"); }
    }
    SearchTasksByName() {
        try {
            var TaskName = $("#StandardTaskGridSearchTextBox").val();
            let isMyTask = $("#chkMyTask").prop('checked');
            var dFilterObject = [];
            //dFilterObject.push(this.state.PermissionBasedFilterString)
            var FilterText = "";
            var AssignedIds = jQuery.unique(ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds);
            if (isMyTask) {
                for (var k = 0; k < AssignedIds.length; k++) {
                    FilterText = "(AssignedTo eq '" + AssignedIds[k] + "')"
                    dFilterObject.push(FilterText);
                }
            }
            if (BKJSShared.NotEmptyString(TaskName)) {
                FilterText = "substringof('" + encodeURIComponent(TaskName) + "',Title)"
                dFilterObject.push(FilterText);
            }
            TaskGridComponent.current.CreateFilterString(dFilterObject);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.SearchTasksByName"); }
    }
    toggleDrawer(event) {
        try {
            var PaneIDArray = ["FilterRightPaneButton", "DashBoardRightPaneButton"]
            let PaneBUttonId = event.currentTarget.id;
            var CorrespoindingDivId = PaneBUttonId.replace("Button", "");
            var CurrentCLassNames = $('#' + PaneBUttonId).attr('class');
            var isActive = (CurrentCLassNames.indexOf("active") > -1) ? true : false;
            if (isActive) {
                $("#DashboardMain").removeClass("db-menu-open")
                //  $("#" + CorrespoindingDivId).removeClass("db-menu-open");
                $("#" + PaneBUttonId).removeClass("active");
                // $("#" + CorrespoindingDivId).addClass("d-none");
                $("#" + CorrespoindingDivId).fadeIn("fast");
            }
            else {
                $("#" + PaneBUttonId).addClass("active");
                $("#DashboardMain").addClass("db-menu-open")
                //$("#" + CorrespoindingDivId).removeClass("d-none");
                $("#" + CorrespoindingDivId).fadeIn("fast");
                for (var i = 0; i < PaneIDArray.length; i++) {
                    if (PaneIDArray[i] !== PaneBUttonId) {
                        $("#" + PaneIDArray[i]).removeClass("active");
                        var OtheDiv = PaneIDArray[i].replace("Button", "");
                        //$("#" + OtheDiv).addClass("d-none");
                        $("#" + OtheDiv).fadeOut("fast");
                    }
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.toggleDrawer"); }

    }
    toggleDashboardDrawer() {
        try {
            if (gDashBoardData.DashboardDrawerOpen === 0) {
                $("#DashboardMain").addClass("db-sidebar-open-right");

                gDashBoardData.DashboardDrawerOpen = 1;

            }
            else {
                gDashBoardData.DashboardDrawerOpen = 0;
                $("#DashboardMain").removeClass("db-sidebar-open-right");
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.toggleDashboardDrawer"); }
    }
    GetDepartmentNames() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Department + "')/items?$Select=ID,OData__DepartmentName,DepartmentAdminId";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetDepartmentNames, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetDepartmentNames"); }
    }
    GetNotAbortedEmployees() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$filter=(OData__StatusE%20ne%20%27Aborted%27)";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onNotAbortedEmployeeGetSuccess, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetNotAbortedEmployees"); }
    }
    GetTaskStatusValues() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('ActualTasks')/fields?$filter=Internalname eq 'Status'";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onTaskStatusValuesSucess, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetTaskStatusValues"); }
    }
    GetCategoryValues() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Category')/items?$select=CategoryName1,Process1Id&$filter=(IsActive1 ne '0')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onCategoryValueSucess, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetCategoryValues"); }
    }
    GetLevelValues() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Levellst')/items?$select=Title";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onLevelValueSucess, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetLevelValues"); }
    }
    GetAllOpenTasks() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$select=ID%2CProcessId%2CAssignedToId%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus&$expand=OData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle&$filter=(Status%20ne%20%27Close%27)";//
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetAllOpenTasksSuccess, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetAllOpenTasks"); }
    }
    ProcessEmployee_OngoingOnOffBoardingStatus() {
        try {
            for (var i = 0; i < gDashBoardData.Employees.length; i++) {
                var EmployeeTasks = this.FilterTasksByEmployee(gDashBoardData.Employees[i]["ID"])
                for (var k = 0; k < EmployeeTasks.length; k++) {
                    if (EmployeeTasks[k]["OData__EmployeeIDId"] == gDashBoardData.Employees[i]["ID"]) {
                        var isTaskOverDue = this.isTaskDue(EmployeeTasks[k]["DueDate"]);
                        var CurrentProcessType = gDashBoardData.Employees[i]["ProcessId"]
                        //  1 = OnBoard, 2 = OffBoard
                        if (isTaskOverDue) {
                            if (CurrentProcessType == 1) {
                                gDashBoardData.OverDueOnBoardEmployees.push(gDashBoardData.Employees[i]);
                                gDashBoardData.OnGoingOnBoardEmployees.push(gDashBoardData.Employees[i]);
                            }
                            else if (CurrentProcessType == 2) {
                                gDashBoardData.OverDueOffBoardEmployees.push(gDashBoardData.Employees[i]);
                                gDashBoardData.OnGoingOffBoardEmployees.push(gDashBoardData.Employees[i]);
                            }
                            break;
                        }

                        if (k == (EmployeeTasks.length - 1)) {
                            if (CurrentProcessType == 1) {
                                gDashBoardData.OnGoingOnBoardEmployees.push(gDashBoardData.Employees[i]);
                            }
                            else if (CurrentProcessType == 2) {
                                gDashBoardData.OnGoingOffBoardEmployees.push(gDashBoardData.Employees[i]);
                            }
                        }
                    }
                }
            }
            this.setState({ OnGoingOnBoardingEmployeeCount: gDashBoardData.OnGoingOnBoardEmployees.length });
            this.setState({ OnGoingOffBoardingEmployeeCount: gDashBoardData.OnGoingOffBoardEmployees.length });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ProcessEmployee_OngoingOnOffBoardingStatus"); }
    }
    ProcessEmployee_OnBoardedOffBoardedStatus() {
        try {
            for (var i = 0; i < gDashBoardData.Employees.length; i++) {
                var EmployeeTasks = this.FilterTasksByEmployee(gDashBoardData.Employees[i]["ID"])
                if (EmployeeTasks.length > 0) {
                    for (var k = 0; k < EmployeeTasks.length; k++) {
                        var isEmployeeAllTasksCompleted = false;
                        if (EmployeeTasks[k]["OData__EmployeeIDId"] == gDashBoardData.Employees[i]["ID"]) {
                            var isTaskClosed = (EmployeeTasks[k]["Status"] == "Close") ? true : false;
                            var CurrentProcessType = gDashBoardData.Employees[i]["ProcessId"]
                            //  1 = OnBoard, 2 = OffBoard
                            if (!isTaskClosed) {
                                break;
                            }
                            if (k == (EmployeeTasks.length - 1)) {
                                if (CurrentProcessType == 1) {
                                    gDashBoardData.OnBoardedEmployees.push(gDashBoardData.Employees[i]);
                                }
                                else if (CurrentProcessType == 2) {
                                    gDashBoardData.OffBoardedEmployees.push(gDashBoardData.Employees[i]);
                                }
                            }
                        }
                    }
                }
                else {
                    var CurrentProcessType = gDashBoardData.Employees[i]["ProcessId"]
                    if (CurrentProcessType == 1) {
                        gDashBoardData.OnBoardedEmployees.push(gDashBoardData.Employees[i]);
                    }
                    else if (CurrentProcessType == 2) {
                        gDashBoardData.OffBoardedEmployees.push(gDashBoardData.Employees[i]);
                    }
                }
            }
            this.setState({ OnGoingOnBoardingEmployeeCount: gDashBoardData.OnGoingOnBoardEmployees.length })
            this.setState({ OnGoingOffBoardingEmployeeCount: gDashBoardData.OnGoingOffBoardEmployees.length })
            //ONoffboarded
            this.setState({ OnboardedEmployeeCount: gDashBoardData.OnBoardedEmployees.length });
            this.setState({ OffBoardedEmployeeCount: gDashBoardData.OffBoardedEmployees.length });

        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ProcessEmployee_OnBoardedOffBoardedStatus"); }

    }
    isTaskDue(TaskDueDate) {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.isTaskDue"); }
    }
    CalculateOngoingTasksPerDepartment(Event) {
        try {
            var P = ["On Board", "Off Board"]
            for (var m = 0; m < P.length; m++) {
                var Items = this.FilterTasksByProcessType(P[m])
                var DepartmentsTasks = {};
                for (var i = 0; i < Items.length; i++) {
                    var Department = Items[i].OData__DepartmentId;
                    var CurrentValue = 0;
                    if (DepartmentsTasks[Department] == undefined) {
                        CurrentValue = 1;
                        //DepartmentsTasks[Department] = (CurrentValue + 1)
                    }
                    else {
                        CurrentValue = DepartmentsTasks[Department]
                        CurrentValue = (CurrentValue + 1)
                        // DepartmentsTasks[Department] = (CurrentValue + 1)
                    }
                    DepartmentsTasks[Department] = CurrentValue
                }
                var PiePercentWiseData = {};
                var StringTR = ""
                var DepartmentsNameArr = []
                $.each(DepartmentsTasks, function (key, value) {
                    var PercentWiseDprtMent = DepartmentsTasks[key] / Items.length;
                    PiePercentWiseData[key] = PercentWiseDprtMent;
                    var CurrentDepartmentName = ""
                    for (var j = 0; j < gDashBoardData.Departments.length; j++) {
                        if (gDashBoardData.Departments[j]["ID"] == key) {
                            CurrentDepartmentName = gDashBoardData.Departments[j]["OData__DepartmentName"]
                            DepartmentsNameArr.push(CurrentDepartmentName)
                        }
                    }

                    StringTR += CurrentDepartmentName + " " + (PercentWiseDprtMent * 100) + "% ";
                });

                var ChartWidth = ($(".db-tab-section").width() - 10)

                if (ChartWidth <= 0) {
                    ChartWidth = PieChartWidthGlobal;
                }
                else {
                    ChartWidth = ($(".db-tab-section").width() - 10)
                    PieChartWidthGlobal = ChartWidth
                }
                var PieChartOptions = {
                    chart: {
                        width: ChartWidth,
                        type: 'pie',
                    },
                    labels: DepartmentsNameArr,
                    series: Object.values(DepartmentsTasks),
                    legend: {
                        show: true,
                        position: "bottom"
                    },
                    responsive: [{
                        breakpoint: 480
                    }],
                    plotOptions: {
                        pie: {
                            size: undefined,
                            customScale: 0.85,
                            offsetX: 0,
                            offsetY: 0,
                            expandOnClick: true
                        }
                    },
                    colors: ['#F44336', '#E91E63', '#9C27B0',"#D82458"]
                    ,
                    dataLabels: {
                        enabled: true,
                        textAnchor: 'start',
                        style: {
                            colors: ['#fff'],
                            fontSize: '14px',
                        },
                        formatter: function (val, opts) {
                            return opts.w.config.series[opts.seriesIndex]
                        },
                        offsetX: 0,
                        dropShadow: {
                            enabled: true
                        },

                    },
                    tooltip: {
                        enabled: true,
                        enabledOnSeries: undefined,
                        shared: true,
                        followCursor: true,
                        intersect: false,
                        inverseOrder: false,
                        fillSeriesColor: true,
                        onDatasetHover: {
                            highlightDataSeries: false,
                        },
                        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                            var totalValue = 0
                            for (var k = 0; k < series.length; k++) {
                                totalValue = totalValue + series[k]
                            }
                            var Percentage = (100 / totalValue) * series[seriesIndex];
                            var CurrentPartHexColor = w.config.chart.zoom.zoomedArea.fill.color
                            //return '<div style="background-color:'+CurrentPartHexColor+';padding-left:2px;padding-right:2px;">' + w.config.labels[seriesIndex] +" - "+ Percentage + "% </div>";
                            return '<div style="background-color:black;color:white;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;">' + w.config.labels[seriesIndex] + " - " + parseFloat(Percentage).toFixed(1) + "% </div>";
                        }
                    },
                }
                //var series = Object.values(DepartmentsTasks)
                let PieChart = null
                if (DepartmentsNameArr.length == 0 || DepartmentsTasks == null) {
                    PieChart = '<p class="mb-2 pl-3 pr-3">No ongoing employee found.</p>'
                }
                else {
                    var ChartHeading = null;
                    if (P[m] == "On Board") {
                        ChartHeading = '<p class="mb-2 pl-3 pr-3">Onboarding ' + ConfigModal.gConfigSettings.DisplayTextEmployee + ' per departments.</p>'
                        $("#OnboardPieChartHeading").html(ChartHeading)
                    }
                    else {
                        ChartHeading = '<p class="mb-2 pl-3 pr-3">Offboarding ' + ConfigModal.gConfigSettings.DisplayTextEmployee + ' per departments.</p>'

                        $("#OffboardPieChartHeading").html(ChartHeading)
                    }
                    //PieChart = <div>{ChartHeading}<ReactApexChart options={PieChartOptions} series={series} type="pie" width={($(".db-tab-section").width() - 10)} /></div>
                }

                if (P[m] == "On Board") {
                    if (DepartmentsNameArr.length !== 0 || Object.keys(DepartmentsTasks).length !== 0) {
                        var chart = new ApexCharts(
                            document.querySelector("#OnboardPieChart"),
                            PieChartOptions
                        );

                        chart.render();
                    }
                    else {
                        $("#OnboardPieChart").html('<p class="mb-2 pl-3 pr-3">No ongoing ' + ConfigModal.gConfigSettings.DisplayTextEmployee +' found.</p>')
                    }
                    //this.setState({ OngoingDepartmentWiseOnBoardEmployees: PieChart })
                    const OngoingOverDueData = <OverDueTasksDashboard Employees={gDashBoardData.Employees} AllOpenTasks={gDashBoardData.AllOpenTasks} IsGroupByOnboardOffBoard={EOBConstants.ProcessNames.OnBoard} OnRowClickfunction={this.FilterOverDueTasks} />
                    this.setState({ OnboardOverDueTables: OngoingOverDueData })
                }
                else {
                    if (DepartmentsNameArr.length !== 0 || Object.keys(DepartmentsTasks).length !== 0) {
                        var chart = new ApexCharts(
                            document.querySelector("#OffboardPieChart"),
                            PieChartOptions
                        );

                        chart.render();
                    }
                    else {
                        $("#OffboardPieChart").html('<p class="mb-2 pl-3 pr-3">No ongoing ' + ConfigModal.gConfigSettings.DisplayTextEmployee + ' found.</p>')
                    }
                    //this.setState({ OngoingDepartmentWiseOffBoardEmployees: PieChart })
                    const OffboardOverDueData = <OverDueTasksDashboard Employees={gDashBoardData.Employees} AllOpenTasks={gDashBoardData.AllOpenTasks} IsGroupByOnboardOffBoard={EOBConstants.ProcessNames.OffBoard} OnRowClickfunction={this.FilterOverDueTasks} />
                    this.setState({ OffboardOverDueTables: OffboardOverDueData })
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CalculateOngoingTasksPerDepartment"); }
    }
    FilterTasksByEmployee(EmployeeID) {
        try {
            var ListItemsFilterData = gDashBoardData.AllOpenTasks.filter(function (el) {
                return el.OData__EmployeeIDId == EmployeeID
            });
            return ListItemsFilterData;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FilterTasksByEmployee"); }
    }
    FilterTasksByProcessType(ProcessName) {
        try {
            var ProcessId = 1;
            var ProcessTypeBasedOnGoingTasks = [];
            ProcessTypeBasedOnGoingTasks = gDashBoardData.OnGoingOnBoardEmployees.slice();
            //ProcessTypeBasedOnGoingTasks = gDashBoardData.OnGoingOnBoardEmployees;
            for (var i = 0; i < gDashBoardData.OverDueOnBoardEmployees.length; i++) {
                ProcessTypeBasedOnGoingTasks.push(gDashBoardData.OverDueOnBoardEmployees[i])
            }
            //  1 = OnBoard, 2 = OffBoard
            if (ProcessName == "Off Board") {
                ProcessId = 2;
                ProcessTypeBasedOnGoingTasks = gDashBoardData.OnGoingOffBoardEmployees.slice();

                for (var i = 0; i < gDashBoardData.OverDueOffBoardEmployees.length; i++) {
                    ProcessTypeBasedOnGoingTasks.push(gDashBoardData.OverDueOffBoardEmployees[i])
                }
            }
            //if (isNumber) {
            var ListItemsFilterData = ProcessTypeBasedOnGoingTasks.filter(function (el) {
                return el.ProcessId == ProcessId
            });
            return ListItemsFilterData;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FilterTasksByProcessType"); }
    }
    ShowOverDueTaskData() {
        try {
            const OverDueData = <OverDueTasksDashboard Employees={gDashBoardData.Employees} AllOpenTasks={gDashBoardData.AllOpenTasks} OnRowClickfunction={this.FilterOverDueTasks} />
            this.setState({ OverDueTaskData: OverDueData }, function () { setTimeout(this.HideLoader, 600); });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ShowOverDueTaskData"); }
    }
    _SPInitSuccess(data) {
        // BKSPShared.GetCurrentUserAssociatedGroup(this._OnGroupLoad)        
    }
    ReturnUserBasedFilterString(isAssignAnd) {
        try {
            var FilterText = [];
            var FilterAssignArray = [];
            var CombineQueryFilter = "";
            if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
                //if (ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.length > 0) {
                //    for (var j = 0; j < ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds.length; j++) {
                //        FilterAssignArray.push("(AssignedTo eq '" + ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds[j] + "')")
                //    }
                //}

                for (var l = 0; l < ConfigModal.gConfigSettings.CurrentUserDepartment.length; l++) {
                    if (l > 0) {
                        FilterText.push(" or (DepartmentsId/_DepartmentName eq '" + encodeURIComponent(ConfigModal.gConfigSettings.CurrentUserDepartment[l]) + "')")
                    }
                    else {
                        FilterText.push("(DepartmentsId/_DepartmentName eq '" + encodeURIComponent(ConfigModal.gConfigSettings.CurrentUserDepartment[l]) + "')")
                    }

                }
            }
            for (var i = 0; i < FilterText.length; i++) {
                CombineQueryFilter += FilterText[i]
            }
            return ("(" + CombineQueryFilter + ")");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ReturnUserBasedFilterString"); }

    }
    CreateDashBoardTasks() {
        try {
            var FilterString = "(Status ne 'Close') and (IsActive1 ne '0') and (OData__EmployeeID%2FOData__StatusE%20ne%20'Aborted')"
            var StrictFilter = ""
            gDashBoardData.Departments = ConfigModal.arrDepartments;
            if (ConfigModal.gConfigSettings.isCurrentUserAdmin || ConfigModal.gConfigSettings.isAllowAllUsers) {
                // StrictFilter = FilterString;
                //$("#DashBoardRightPane").removeClass("d-none")
                $("#DashboardMain").addClass("db-menu-open")
                $("#FilterRightPane").fadeOut("fast")
                $("#OverDueTaskDiv").removeClass("d-none")
            }
            else if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                $("#DashBoardRightPaneButton").addClass("d-none")
                $("#DashBoardRightPane").addClass("d-none")
            }

            else if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
                // FilterString += this.ReturnUserBasedFilterString("and")
                $("#DashBoardRightPaneButton").addClass("d-none")
                $("#DashBoardRightPane").addClass("d-none")
            }
             else {
                    ConfigModal.gConfigSettings.isCurrentUserHasLowestPermission = true;
                    //FilterString += " and (AssignedTo eq '" + _spPageContextInfo.userId + "')"
                    $("#chkMyTask").prop('checked', true);
                    $("#chkMyTask").attr("disabled", true);
                }
                StrictFilter = FilterString;
            
            this.setState({ PermissionBasedFilterString: StrictFilter })
            this.FillDepartmentOptions();
            this.FillEmployeeAutoComplete();
            this.GetTaskStatusValues();
            this.GetCategoryValues();
            this.GetLevelValues();
            this.GetTaskStatusValues();
            const Grid = <DataTableMain GridProperties={oEmployeeTaskGridProps} FilterText={FilterString} StrictFilter={StrictFilter} SortText={"DueDate asc"} ref={TaskGridComponent}></DataTableMain>
            this.setState({ TasksGrid: Grid }, function () {
                if (!ConfigModal.gConfigSettings.isCurrentUserAdmin || !ConfigModal.gConfigSettings.isAllowAllUsers) {
                    setTimeout(this.HideLoader, 600);
                }
            });
            if (ConfigModal.gConfigSettings.isCurrentUserAdmin || ConfigModal.gConfigSettings.isAllowAllUsers) {
                $("#DashBoardRightPane").css("display", "block")
                $("#OverdeuTablesDiv").css("display", "block")
                this.CreateEmplpoyeeBoardingSnapShot();
            }
            else {
                $("#DashboardGridDiv").removeClass("col-lg-9")
                $("#DashboardGridDiv").addClass("col-lg-12")
                // $("#OverdeuTablesDiv").css("display", "none")
                // $("#DashBoardRightPane").css("display", "none")

            }
            if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                $("#OverDueTaskDiv").removeClass("d-none")
            }
            //MyOffboardingCode
            DashboardComponent.GetEmployeeData();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CreateDashBoardTasks"); }
    }
    _OnUserExistSuccess(data) {
        try {
            if (data == 0) {
                //Open Dialog
                let dialog = null;
                dialog = <BKUserInfoModal AfterUserSave={this.LoadLicenseDetails} />
                this.setState({ UserInfoModal: dialog });
            }
            else {
                //  MainHeaderComponent.InitializeSettings()
                this.ShowFooter();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._OnUserExistSuccess"); }
    }
    LoadLicenseDetails() {
        BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, this.ShowFooter)
    }
    ShowFooter() {
        var LocalObject = JSON.parse(localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys.EmployeeOnBoarding))
        var AppVersion = LocalObject.AppVersion
        let Footer = null;
        Footer = <EOBFooter AppVersion={AppVersion}/>
        this.setState({ Footer: Footer });
    }
    HideLoader() {
        try {
            EOBConstants.SetNewThemeColor();
            $("#loading").hide();
            var PPlPicker = $(".sp-peoplepicker-initialHelpText");
            PPlPicker[0].innerText = "Enter name or email."
            $(".sp-peoplepicker-initialHelpText").css("top", "3px");
            $(".sp-peoplepicker-initialHelpText").css("font-size", "14px");
            BKSPAddUserInfo.CheckIsUserExist(this._OnUserExistSuccess);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.HideLoader"); }
    }
    ShowLoader() {
        try {
            $("#loading").show();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ShowLoader"); }
    }
    FillDepartmentOptions(data) {
        //gDashBoardData.Departments = ConfigModal.arrDepartments;
        try {
            if (gDashBoardData.Departments.length > 0) {
                var DepartmentOptions = []
                for (var i = 0; i < gDashBoardData.Departments.length; i++) {
                    if (gDashBoardData.Departments[i].IsActive1) {
                        var DepartmentName = gDashBoardData.Departments[i]["OData__DepartmentName"]
                        const Option = <option key={DepartmentName} value={DepartmentName}>{DepartmentName}</option>
                        DepartmentOptions.push(Option)
                    }                    
                }
                this.setState({ DepartmentOptions: DepartmentOptions })
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FillDepartmentOptions"); }
    }
    FillEmployeeAutoComplete() {
        try {
            var ColumnObject = [
                { InternalName: "OData__EmployeeName", Type: "String" },
                { InternalName: "DOJ", Type: "Date" },
                { InternalName: "Process", Type: "LookUpObject" }
            ]

            //var EmployeeColumns = ["OData__EmployeeName", "DOJ"]
            EOBShared.GetEmployeeData(ColumnObject, this.CreateAutoComplete);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FillEmployeeAutoComplete"); }
    }
    CreateAutoComplete() {
        try {
            BKJSShared.UIControls.autocomplete("txtEmployeeName", EOBShared._EmployeeDataObject, "OData__EmployeeName", "DOJ");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CreateDashBoard"); }
    }
    CheckAndSearch(event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                this.SearchTasksByName()
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CheckAndSearch"); }
    }
    _UpdateSearchIcon2() {
        try {
            var ControlsObject = [
                { ID: "#StandardTaskGridSearchTextBox", Type: "text" },
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "dashboardFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._UpdateSearchIcon2"); }
    }
    isCurrentUserLevelAdminOrItemAssignedTo(SPRowData) {
        try {
            var isShowCheckBox = false;
            if (ConfigModal.gConfigSettings.isCurrentUserAdmin) {
                isShowCheckBox = true;
                return isShowCheckBox;
            }
            if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                for (var i = 0; i < ConfigModal.gConfigSettings.CurrentUserLevel.length; i++) {
                    var LevelName = SPRowData["TaskLevel"]
                    var isSameLevel = (ConfigModal.gConfigSettings.CurrentUserLevel[i].Name == LevelName) ? true : false;
                    if (ConfigModal.gConfigSettings.CurrentUserLevel[i].isAllowEdit && isSameLevel) {
                        isShowCheckBox = true;
                        break;
                    }
                }
            }
            if (!isShowCheckBox) {
                if (SPRowData["Departments"]) {
                    for (var k = 0; k < ConfigModal.gConfigSettings.CurrentUserDepartment.length; k++) {
                        if (ConfigModal.gConfigSettings.CurrentUserDepartment[k] == SPRowData["Departments"]) {
                            isShowCheckBox = true;
                            break;
                        }
                    }
                }
            }
            if (!isShowCheckBox) {
                if (SPRowData["Assigned To"]) {
                    var SelfAssignedIds = [_spPageContextInfo.userId];
                    var GrpId = Object.keys(BKSPShared.CurrentUserGroupsData)
                    for (var h = 0; h < GrpId.length; h++) {
                        SelfAssignedIds.push(GrpId[h]);
                    }
                    SelfAssignedIds = jQuery.unique(SelfAssignedIds);
                    for (var j = 0; j < SPRowData["Assigned To"].results.length; j++) {
                        for (var e = 0; e < SelfAssignedIds.length; e++) {
                            if (SPRowData["Assigned To"].results[j] == SelfAssignedIds[e]) {
                                isShowCheckBox = true;
                                break;
                            }

                        }
                    }
                }

            }
            return isShowCheckBox;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.isCurrentUserLevelAdminOrItemAssignedTo"); }
    }
    //Custom checkbox in grid
    CheckBoxCheckFunction(RowData) {
        try {
            var isShowActionToCurrentUser = this.isCurrentUserLevelAdminOrItemAssignedTo(RowData)
            if (isShowActionToCurrentUser) {
                var td = null;
                if (RowData["Status"] == "Close") {
                    td = <td className="text-center"><div className="custom-control custom-checkbox  "><input type="checkbox" className="TaskClosedCheckBox custom-control-input" checked name="" id={RowData["ID"] + "CloseTask"} onClick={this.UpdateTaskStatusToOpen} value="1" /><label className="custom-control-label" for={RowData["ID"] + "CloseTask"}></label></div>
                    </td>
                }
                else {

                    td = <td className="text-center"><div className="custom-control custom-checkbox  "><input value="0" type="checkbox" className="TaskOpenedCheckBox custom-control-input" name="" id={RowData["ID"] + "CloseTask"} onClick={this.UpdateTaskStatusToClose} /><label className="custom-control-label" for={RowData["ID"] + "CloseTask"}></label></div></td>
                }
                return td
            }
            else {
                var td = <td><p> </p></td>
                return td
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CheckBoxCheckFunction"); }
    }
    CustomEditCondition(RowData) {
        try {
            var isShowActionToCurrentUser = this.isCurrentUserLevelAdminOrItemAssignedTo(RowData);
            return isShowActionToCurrentUser
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CustomEditCondition"); }
    }
    CustomEditFunction() {
        alert("3")
    }
    CreateGridRowDataObject(event) {
        try {
            var arrHeaderArray = TaskGridComponent.current.GetGridHeaders(true);
            //let RowID = event.currentTarget.id;
            let RowID = gDashBoardData.CurrentClickedCheckBoxID;
            
            RowID = RowID.replace("CloseTask", "Row")
            var TDs = $('#' + RowID).find("td")
            var DataObject = {};

            for (var i = 0; i < TDs.length; i++) {
                if (arrHeaderArray[i] == "Edit" || arrHeaderArray[i] == "Delete") {
                    continue;
                }
                var isCHeckBOxElement = $(TDs[i]).find("input[type=checkbox]")
                if (isCHeckBOxElement.length > 0) {
                    var isCheckBox = $(TDs[i]).find("input:checked")
                    if (isCheckBox.length > 0) {

                        DataObject[arrHeaderArray[i]] = true;
                    }
                    else {
                        DataObject[arrHeaderArray[i]] = false;
                    }
                }
                else {
                    DataObject[arrHeaderArray[i]] = TDs[i].innerText;
                }

            }
            DataObject["Action"] = "Edit";
            return DataObject;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CreateGridRowDataObject"); }
    }
    NotSPClickFunction(event) {
        try {
            var DataObject = this.CreateGridRowDataObject(event);
            this.UpdateTaskStatusToClose(DataObject);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.NotSPClickFunction"); }
    }
    UpdateTaskStatusToClose(event) {
        try {
            gDashBoardData.CurrentClickedCheckBoxID = event.currentTarget.id;
            $("#GridLoaderBG").removeClass("d-none")
            setTimeout(function () {
               

                var DataObject = DashboardComponent.CreateGridRowDataObject(event);
                //var CurrentCHeckBoxId = event.currentTarget.id
                //event.currentTarget.style.display = "none"
                let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.ActualTasks);
                var SaveData = {
                    __metadata: { 'type': ListTypeName },
                    "Status": "Close"
                }
                var RequestMethod = null;
                var Url = ""

                if (DataObject["ID"] > 0) {
                    gDashBoardData.ClosedTasksIDArray.push(DataObject["ID"])
                    Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + DataObject["ID"] + ")";
                    RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
                    BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, DashboardComponent._onTaskStatusCloseUpdate, DashboardComponent._onTaskUpdateFailure)
                    DashboardComponent.GetCurrentTasksAfterClose(DataObject["ID"]);
                }

           }, 10)
            //  this.ShowLoader();
          
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.UpdateTaskStatusToClose"); }
    }
    UpdateTaskStatusToOpen(event) {
        try {
            //var DataObject = this.CreateGridRowDataObject(event);
            gDashBoardData.CurrentClickedCheckBoxID = event.currentTarget.id
            $("#GridLoaderBG").removeClass("d-none")
            setTimeout(function () {
                var DataObject = DashboardComponent.CreateGridRowDataObject(event);
                let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.ActualTasks);
                var SaveData = {
                    __metadata: { 'type': ListTypeName },
                    "Status": "In Progress"
                }
                var RequestMethod = null;
                var Url = ""

                if (DataObject["ID"] > 0) {
                    gDashBoardData.OpenedTasksIDArray.push(DataObject["ID"])
                    Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/Items(" + DataObject["ID"] + ")";
                    RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
                    BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, DashboardComponent._onTaskStatusOpenUpdate, DashboardComponent._onTaskUpdateFailure)
                }


            }, 10)
            //var CurrentCHeckBoxId = event.currentTarget.id
            //event.currentTarget.style.display = "none"
            
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.UpdateTaskStatusToOpen"); }
    }
    ShowOpenAsNotStarted(RowData) {
        try {
            if (RowData) {
                var td = null;
                if (RowData == "Open") {
                    td = <td><p>Not Started</p></td>
                }
                else {
                    td = <td><p>{RowData}</p></td>
                }
            }
            return td;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ShowOpenAsNotStarted"); }
    }

    GetCurrentTasksAfterClose (ID) {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?&$select=ID%2CAssignedToId%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CTypeOfTask%2COData__IDStandardTask%2FID%2COData__EmployeeID%2F_StatusE%2COData__EmployeeID%2FID%2CDepartments%2F_DepartmentName%2COData__IDCategory%2FCategoryName1%2CTaskLevel%2FTitle%2CAssignedTo%2FTitle%2CStatus&$expand=OData__EmployeeID%2F_EmployeeName%2COData__IDStandardTask%2FID%2COData__EmployeeID%2F_StatusE%2COData__EmployeeID%2FID%2CDepartments%2F_DepartmentName%2COData__IDCategory%2FCategoryName1%2CTaskLevel%2FTitle%2CAssignedTo%2FTitle&$filter=(ID eq '" + ID + "')";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetCurrentTaskAfterCloseSuccess, this._onRestCallFailure);
    }
    _onGetCurrentTaskAfterCloseSuccess(data) {
        if (data) {
            EOBEmployeeDependentTaskStatus.CheckCurrentTaskDependency(data.d.results[0], this._onActicateAllDependateTasks)
        }
        
        
    }
    _onActicateAllDependateTasks() {
        this.FilterGridTasks()
        
    }
    //Custom checkbox in grid end
    SetTaskColumnProperties() {
        try {
            var closeTask = new ColumnProperties("", "Close", "3", true, false, ReactDataGridConstants.ColumnTypes.CustomHTMLControl, "", false, null, this.CheckBoxCheckFunction, null, true);
            oEmployeeTasksColProps.push(closeTask);

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
            oEmployeeTasksColProps.push(colID);

            var colAssignedToID = new ColumnProperties("AssignedToId", "Assigned To", "3", false, true, "PeopleWithID", "", false, "");
            oEmployeeTasksColProps.push(colAssignedToID);

            var colActivity = new ColumnProperties("DueDate", "Due Date", "8", true, true, "text", "MM/DD/YYYY", false, "", this._isDueDateExceed);
            oEmployeeTasksColProps.push(colActivity);

            var colTitle = new ColumnProperties("Title", "Task Name", "16", true, true, "text", "", false, "");
            oEmployeeTasksColProps.push(colTitle);

            var colEmployee = new ColumnProperties("OData__EmployeeID", "Employee", "9", true, true, "Lookup", "", true, "_EmployeeName");
            oEmployeeTasksColProps.push(colEmployee);

            var colTaskType = new ColumnProperties("TypeOfTask", "TaskType", "9", false, true, "text", "", false, "");
            oEmployeeTasksColProps.push(colTaskType);

            var colStandardTaskID = new ColumnProperties("OData__IDStandardTask", "StandardTaskID", "9", false, true, "Lookup", "", true, "ID");
            oEmployeeTasksColProps.push(colStandardTaskID);



            var colEmployeeStatus = new ColumnProperties("OData__EmployeeID", "Employee Status", "9", false, true, "Lookup", "", true, "_StatusE");
            oEmployeeTasksColProps.push(colEmployeeStatus);

            var colEmployeeID = new ColumnProperties("OData__EmployeeID", "Employee ID", "", false, true, "Lookup", "", true, "ID");
            oEmployeeTasksColProps.push(colEmployeeID);

            //var colDepartmentID = new ColumnProperties("IDDepartment", "Department", "", true, true, "Number", "", false, "");
            //oEmployeeTasksColProps.push(colDepartmentID);

            var colDepartmentID = new ColumnProperties("Departments", "Department", "11", true, true, "Lookup", "", true, "_DepartmentName");
            oEmployeeTasksColProps.push(colDepartmentID);

            var colCategoryID = new ColumnProperties("OData__IDCategory", "Category", "9", true, true, "Lookup", "", true, "CategoryName1");
            oEmployeeTasksColProps.push(colCategoryID);

            var colLevel = new ColumnProperties("TaskLevel", "Level", "8", true, true, "Lookup", "", true, "Title");
            oEmployeeTasksColProps.push(colLevel);

            var colAssignedTo = new ColumnProperties("AssignedTo", "Assigned To", "10", true, false, "People", "", false, "");
            oEmployeeTasksColProps.push(colAssignedTo);

            var colStatus = new ColumnProperties("Status", "Status", "6", true, true, "text", "", false, "", this.ShowOpenAsNotStarted);
            oEmployeeTasksColProps.push(colStatus);

            //var colRemark = new ColumnProperties("Remark", "Remark", "", true, true, "text", "", false, "");
            //oEmployeeTasksColProps.push(colRemark);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.SetTaskColumnProperties"); }

    }
    OpenTaskUpdateModal(DataObject) {
        try {
            let Dialog = null;
            var intItemID = 0;

            var strAction
            if (DataObject != null) {
                intItemID = DataObject["ID"];
                strAction = DataObject["Action"];
            }

            Dialog = <TaskUpdateDialog Action={strAction} ItemId={intItemID} HandleDataUpdate={this.UpgradeGridFromTaskUpdateModal} UpdateSnapShot={this.ResetDashBoardSnapShots}></TaskUpdateDialog>
            this.setState({ TaskEditDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.OpenTaskUpdateModal"); }
    }


    setTaskGridProps() {
        try {
            oEmployeeTaskGridProps = new GridProperties("gridStandardTask", EOBConstants.ListNames.ActualTasks, oEmployeeTasksColProps, "", "", true, 10, "", true, false, false, this.OpenTaskUpdateModal, null, "", this.AfterGridRender, null, null, null, EOBConstants.ClassNames.SwitchTitleColor, this._CheckPermissionAfterTaskGet, null, this.CustomEditCondition);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.setTaskGridProps"); }
    }
    FilterGridTasks() {
        try {
            var TaskName = $("#StandardTaskGridSearchTextBox").val();
            var sDateFrom = $("#dtFromPicker").val();
            var sDateTo = $("#dtToPicker").val();
            var sEmployeeName = $("#txtEmployeeName").val();
            var sTaskStatus = $("#ddStatus").val();
            var sDepartment = $("#ddDepartments").val();
            var sCategory = $("#ddCategory").val();
            var sLevel = $("#ddLevel").val();
            var sProcessType = $("#ddDashBoardProcess").val();
            let isMyTask = $("#chkMyTask").prop('checked');
            var AssignedIDObject = BKSPPeoplePicker.GetSelectedUserIds();
            AssignedIDObject = AssignedIDObject.results.slice();
            var dFilterObject = [];
            var FilterText = "";
            var FilterArray = [];

            FilterArray = FilterArray.join(" or ")
            var dDueFrom = moment(sDateFrom, "MM/DD/YYYY");
            dDueFrom = moment(dDueFrom).format("YYYY-MM-DDT00:00:00.000") + "Z"
            var dDueTo = moment(sDateTo, "MM/DD/YYYY");
            //dDueTo = moment(dDueTo).format("YYYY-MM-DDT00:00:00.000") + "Z"
            dDueTo = moment(sDateTo, "MM/DD/YYYY").add('1', 'days').format("YYYY-MM-DDT00:00:00.000") + "Z"

            if (sDateFrom != "") {
                FilterText = "(DueDate ge datetime'" + dDueFrom + "')"
                dFilterObject.push(FilterText);
            }
            if (sDateTo != "") {
                FilterText = "(DueDate le datetime'" + dDueTo + "')"
                dFilterObject.push(FilterText);
            }
            if (sDateFrom && sDateTo) {
                var DueFrom = moment(sDateFrom, "MM/DD/YYYY");
                var DueTO = moment(sDateTo, "MM/DD/YYYY");
                var isEndBeforeStart = DueTO.isBefore(DueFrom)
                if (isEndBeforeStart) {
                    if (isEndBeforeStart) {
                        $("#dtFromPicker").after("<p style='color:red;' id='ErrorisEndBeforeStart'>START date cannot be greater than 'TO' date</p>")
                    }

                }
                else {
                    $("#ErrorisEndBeforeStart").remove();
                }
            }
            else {
                $("#ErrorisEndBeforeStart").remove();
            }
            if (sEmployeeName != "") {
                FilterText = "(OData__EmployeeIDId/_EmployeeName eq '" + sEmployeeName + "')"
                dFilterObject.push(FilterText);
            }

            if (BKJSShared.NotNullOrUndefined(sTaskStatus)) {
                if (sTaskStatus != "" && sTaskStatus !== "NotClosed") {
                    if (sTaskStatus == "Not Started") {
                        FilterText = "(Status eq 'Open')"
                        dFilterObject.push(FilterText);
                    }
                    FilterText = "(Status eq '" + sTaskStatus + "')"
                    dFilterObject.push(FilterText);
                }
                else if (sTaskStatus == "NotClosed") {
                    FilterText = "(Status ne '" + "Close" + "')"
                    dFilterObject.push(FilterText);
                }
            }

            if (BKJSShared.NotEmptyString(TaskName)) {
                FilterText = "substringof('" + encodeURIComponent(TaskName) + "',Title)"
                dFilterObject.push(FilterText);
            }
            if (BKJSShared.NotNullOrUndefined(sDepartment)) {
                if (sDepartment != "" && sDepartment != "All") {
                    FilterText = "(Departments/_DepartmentName eq '" + encodeURIComponent(sDepartment) + "')"
                    dFilterObject.push(FilterText);
                }
            }

            if (BKJSShared.NotNullOrUndefined(sCategory)) {
                if (sCategory != "" && sCategory != "All") {
                    FilterText = "(OData__IDCategory/CategoryName1 eq '" + encodeURIComponent(sCategory) + "')"
                    dFilterObject.push(FilterText);
                }
            }

            if (BKJSShared.NotNullOrUndefined(sLevel)) {
                if (sLevel != "" && sLevel != "All") {
                    FilterText = "(TaskLevel/Title eq '" + encodeURIComponent(sLevel) + "')"
                    dFilterObject.push(FilterText);
                }
            }
            if (BKJSShared.NotNullOrUndefined(sProcessType)) {
                if (sProcessType != "" && sProcessType != "0") {

                    FilterText = "(ProcessId/ID eq '" + sProcessType + "')"
                    dFilterObject.push(FilterText);
                }
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
            FilterText = "(IsActive1 ne '0')"
            dFilterObject.push(FilterText);
            $("#dashboardFilterIcon1").removeClass("hvr-pulse onsearchiconchange")
            $("#dashboardFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            gDashBoardData.isFilterClicked = true;
            TaskGridComponent.current.CreateFilterString(dFilterObject);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FilterGridTasks"); }
    }
    FilterOverDueTasks(DataObject) {
        try {
            var FilterArray = [];
            var FilterText = "";
            FilterText = "(Status ne 'Close')"
            FilterArray.push(FilterText);
            if (BKJSShared.NotNullOrUndefined(DataObject["ProcessType"])) {
                if (DataObject["ProcessType"] != "") {
                    FilterText = "(ProcessId/Title eq '" + DataObject["ProcessType"] + "')"
                    FilterArray.push(FilterText);
                }
            }
            if (DataObject["TableType"] == "AssignedToType") {
                if (BKJSShared.NotNullOrUndefined(DataObject["ID"])) {
                    FilterText = "(AssignedTo eq '" + DataObject["ID"] + "')"
                    FilterArray.push(FilterText);
                }
            }
            else if (DataObject["TableType"] == "EmployeeType") {
                if (BKJSShared.NotNullOrUndefined(DataObject["ID"])) {
                    FilterText = "(OData__EmployeeIDId/ID eq '" + DataObject["ID"] + "')"
                    FilterArray.push(FilterText);
                }
            }
            else {
                if (BKJSShared.NotNullOrUndefined(DataObject["Title"])) {
                    if (DataObject["Title"] != "") {
                        FilterText = "(Departments/_DepartmentName eq '" + encodeURIComponent(DataObject["Title"]) + "')"
                        FilterArray.push(FilterText);
                    }
                }

            }
            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            var currDate = Date.parse(utc);
            FilterText = "(DueDate lt '" + moment(currDate).toISOString() + "')"
            FilterArray.push(FilterText);
            console.log(DataObject)
            TaskGridComponent.current.CreateFilterString(FilterArray);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.FilterOverDueTasks"); }
    }
    DeleteDepartment(DataObject) {
        try {
            nDeleteModalCurrentItemID = DataObject["ID"]
            if (!isDeleteDialogOpened) {
                isDeleteDialogOpened = true;
                let Dialog = null;
                Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Department} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={DashboardComponent.DeleteDepartment} HandleDataUpdate={DashboardComponent.UpdateGrid} ></DeleteDialog >
                this.setState({ DeleteDialog: Dialog });
            }
            else {
                var modal = document.getElementById("DeleteDialog");
                modal.style.display = "block";
                $("#DeleteModalBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.DeleteDepartment"); }
    }
    UpgradeGridFromTaskUpdateModal() {
        this.FilterGridTasks();
        DashboardComponent.setState({ TaskEditDialog: false });
    }
    UpdateGrid() {
        try {
            //var PermissionBasedFilterString = this.state.PermissionBasedFilterString + " and (Status ne 'Close')"
            var Filter = ["(Status ne 'Close')"]
            //var Filter = [PermissionBasedFilterString]
            TaskGridComponent.current.CreateFilterString(Filter);
            DashboardComponent.setState({ DeleteDialog: false });
            DashboardComponent.setState({ TaskEditDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.UpdateGrid"); }
    }
    AfterGridRender() {
        try {
            $(".TaskClosedCheckBox").prop('checked', true);
            $(".TaskOpenedCheckBox").prop('checked', false);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.AfterGridRender"); }
    }
    ReturnSelectedActiveStatus() {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.ReturnSelectedActiveStatus"); }
    }
    isCurrentUserSuperAdmin() {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.isCurrentUserSuperAdmin"); }
    }
    //overdue tasks reminder emails
    OpenTaskReminderDialog() {
        try {
            var OverDueTasksComponent = <OverDueTasksNotificationEmails CloseDialogHandle={this.CloseReminderDialog} />
            this.setState({ OverDueTaskReminderDialog: OverDueTasksComponent });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.OpenTaskReminderDialog"); }
    }
    CloseReminderDialog() {
        try {
            this.setState({ OverDueTaskReminderDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.CloseReminderDialog"); }
    }
    //overdue tasks reminder emails end

    _onNotAbortedEmployeeGetSuccess(data) {
        try {
            gDashBoardData.Employees = data.d.results;
            this.GetAllOpenTasks();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onNotAbortedEmployeeGetSuccess"); }
    }
    _onGetAllOpenTasksSuccess(data) {
        try {
            gDashBoardData.AllOpenTasks = data.d.results;
            this.ProcessEmployee_OngoingOnOffBoardingStatus();
            this.ProcessEmployee_OnBoardedOffBoardedStatus();
            if (ConfigModal.gConfigSettings.isCurrentUserAdmin || ConfigModal.gConfigSettings.isAllowAllUsers) {
                //only admin can see pie chart and other right side tables
                this.CalculateOngoingTasksPerDepartment();
                this.ShowOverDueTaskData();
            }
            else {
                $("#DashboardGridDiv").removeClass("col-lg-9")
                $("#DashboardGridDiv").addClass("col-lg-12")
                $("#OverdeuTablesDiv").css("display", "none")
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onGetAllOpenTasksSuccess"); }
    }
    _onLevelValueSucess(data) {
        try {
            if (data) {
                if (data.d.results.length > 0) {
                    var OptionsArray = [];
                    var SelectAllLevel = <option key={1} value="All">Select level</option>
                    OptionsArray.push(SelectAllLevel);
                    for (var i = 0; i < data.d.results.length; i++) {
                        const Option = <option value={data.d.results[i].Title} key={"Opt" + data.d.results[i].Title}>{data.d.results[i].Title}</option>
                        OptionsArray.push(Option)
                    }
                    this.setState({ LevelOptions: OptionsArray });
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onLevelValueSucess"); }
    }
    _onTaskStatusValuesSucess(data) {
        try {
            var AllowedStatus = ["Close", "Not Started", "In Progress"]
            if (data.d.results.length > 0) {
                var StatusChoices = data.d.results[0].Choices;
                var OptionsArray = [];
                const Option = <option value="">All status</option>
                OptionsArray.push(Option)
                const Option1 = <option selected value={"NotClosed"} > {"Not Closed"}</option>
                OptionsArray.push(Option1)

                for (var i = 0; i < StatusChoices.results.length; i++) {
                    var isAllowed = $.inArray(StatusChoices.results[i], AllowedStatus);
                    if (isAllowed > -1) {
                        const Option = <option value={StatusChoices.results[i]} key={"Opt" + i}>{StatusChoices.results[i]}</option>
                        OptionsArray.push(Option)
                    }
                }
                this.setState({ StatusOptions: OptionsArray });
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onTaskStatusValuesSucess"); }
    }
    _onCategoryValueSucess(data) {
        try {
            if (data.d.results.length > 0) {
                var OptionsArray = [];
                const Option = <option value="All">Select category</option>
                OptionsArray.push(Option)
                for (var i = 0; i < data.d.results.length; i++) {

                    const Option = <option className={"ProType" + data.d.results[i].Process1Id} value={data.d.results[i].CategoryName1} >{data.d.results[i].CategoryName1}</option>
                    OptionsArray.push(Option)

                }
                this.setState({ CategoryOptions: OptionsArray });
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onCategoryValueSucess"); }
    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    _isDueDateExceed(FieldValue) {
        try {
            if (FieldValue == "Invalid date") {
                var EmptyDate = <td> </td>
                return EmptyDate;
            }
            var CurrentDate = new Date();
            var CurrentDateString = CurrentDate.getDate() + "/" + (CurrentDate.getMonth() + 1) + "/" + CurrentDate.getFullYear()
            var DueDate = moment(FieldValue, 'MM/DD/YYYY');
            var TodayDate = moment(CurrentDate, "MM/DD/YYYY");
            //var isDateDue = (TodayDate > DueDate) ? true : false
            var CurrentDate1 = new Date(CurrentDate.getFullYear(), (CurrentDate.getMonth() + 1), CurrentDate.getDate(), 0, 0, 0);
            var DueDate1 = new Date(DueDate.year(), (DueDate.month() + 1), DueDate.date(), 0, 0, 0);
            var isDateDUe1 = moment(CurrentDate1).isAfter(DueDate1, 'day');
            var isDateDue = moment(TodayDate._i).isAfter(DueDate._i, 'day');
            var DueDateTD = null;
            //css class is not reflecting so currently doing through this way
            var OverDueBorderStyle = {
                color: "#ea0b0b"
            };
            if (isDateDUe1) {
                // date is past
                DueDateTD = <td style={OverDueBorderStyle}>{FieldValue}</td>
            } else {
                // date is future
                DueDateTD = <td>{FieldValue}</td>
            }
            return DueDateTD;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._isDueDateExceed"); }
    }
    _OnResetClick() {
        try {
            $("#StandardTaskGridSearchTextBox").val("");
            $("#dtFromPicker").val("");
            $("#dtToPicker").val("");
            $("#ddDashBoardProcess").val("0");
            $("#txtEmployeeName").val("");
            BKSPPeoplePicker.ResetPeoplePickerField();
            $("#ddDepartments").val("All");
            $("#ddCategory").val("All");
            $("#ddStatus").val("NotClosed");
            $("#ddLevel").val("All");
            if (!ConfigModal.gConfigSettings.isCurrentUserHasLowestPermission) {
                $("#chkMyTask").prop('checked', false);
            }
            $("#dashboardFilterIcon1").removeClass("hvr-pulse onsearchiconchange")
            $("#dashboardFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            $("#ErrorisEndBeforeStart").remove()
            $("#ProType1").removeClass("d-none");
            $("#ProType2").removeClass("d-none");
            gDashBoardData.isFilterClicked = false;
            //var PermissionBasedFilterString = this.state.PermissionBasedFilterString + " and (Status ne 'Close')"
            var Filter = ["(Status ne 'Close')", "(IsActive1 ne '0')"]

            //var Filter = [PermissionBasedFilterString]
            TaskGridComponent.current.CreateFilterString(Filter);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#DepartmentGridSearchTextBox").val();
            var Active = this.ReturnSelectedActiveStatus();
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
            this.DataGrid.current.CreateFilterString(FilterObject);
            $("#dashboardFilterIcon").addClass("hvr-pulse onsearchiconchange");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._OnSearchClick"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#dtFromPicker", Type: "text" },
                { ID: "#dtToPicker", Type: "text" },
                { ID: "#ddDashBoardProcess", Type: "text" },
                { ID: "#txtEmployeeName", Type: "text" },
                { ID: "#ddDepartments", Type: "text" },
                { ID: "#ddCategory", Type: "text" },
                { ID: "#ddLevel", Type: "text" },
                { ID: "#chkMyTask", Type: "bool" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "dashboardFilterIcon1");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._UpdateSearchIcon"); }
    }
    //Check employee status after Task status update
    _onTaskStatusOpenUpdate() {
        try {
           
            $("#GridLoaderBG").addClass("d-none")
            gDashBoardData.CurrentClickedCheckBoxID = null;
            var ToBeRemovedIndex = []
            for (var k = 0; k < gDashBoardData.OpenedTasksIDArray.length; k++) {
                for (var i = 0; i < TableData.length; i++) {
                    if (TableData[i]["ID"] == gDashBoardData.OpenedTasksIDArray[k]) {
                        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "Task opened.", "Task " + TableData[i]["Title"] + " has been opened.", 1500)
                        EOBEmployeeTasksStatus.CheckAndUpdateEmployeeStatus(TableData[i]["Employee ID"], this.ResetDashBoardSnapShots)
                        ToBeRemovedIndex.push(k)
                        break;
                    }
                }
            }
            for (var m = 0; m < ToBeRemovedIndex.length; m++) {
                gDashBoardData.OpenedTasksIDArray.splice(ToBeRemovedIndex[m], 1);
            }
            this.FilterGridTasks();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onTaskStatusOpenUpdate"); }
    }
    _onTaskStatusCloseUpdate() {
        try {
           
            $("#GridLoaderBG").addClass("d-none")
            gDashBoardData.CurrentClickedCheckBoxID = null;
            var ToBeRemovedIndex = []
            for (var k = 0; k < gDashBoardData.ClosedTasksIDArray.length; k++) {
                for (var i = 0; i < TableData.length; i++) {
                    if (TableData[i]["ID"] == gDashBoardData.ClosedTasksIDArray[k]) {
                        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "Task closed.", "Task " + TableData[i]["Title"] + " has been closed.", 1500)
                        EOBEmployeeTasksStatus.CheckAndUpdateEmployeeStatus(TableData[i]["Employee ID"], this.ResetDashBoardSnapShots)
                        ToBeRemovedIndex.push(k)
                        break;
                    }
                }
            }
            for (var m = 0; m < ToBeRemovedIndex.length; m++) {
                gDashBoardData.ClosedTasksIDArray.splice(ToBeRemovedIndex[m], 1);
            }
            this.FilterGridTasks();
           // this.HideLoader();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onTaskStatusCloseUpdate"); }
    }
    _onTaskUpdateFailure() {
        console.log("Fail in task Update")
    }
    //Check employee status after Task status update end
    _CheckProcessAndUpdateCategory(event) {
        try {
            var ProcessType = $("#ddDashBoardProcess").val()
            if (ProcessType !== "0") {
                var isOnBoard = (ProcessType == "1") ? true : false;
                if (isOnBoard) {
                    $(".ProType2").addClass("d-none")
                    $(".ProType1").removeClass("d-none");
                }
                else {
                    $(".ProType1").addClass("d-none")
                    $(".ProType2").removeClass("d-none");
                }
            }
            else {
                $(".ProType1").removeClass("d-none");
                $(".ProType2").removeClass("d-none");
            }
            this._UpdateSearchIcon();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._CheckProcessAndUpdateCategory"); }
    }
    _CheckPermissionAfterTaskGet(SPData) {
        try {
            var SPFilteredItems = [];
            for (var i = 0; i < SPData.length; i++) {
                var isTaskAlreadyPushedIn = false;
                if (ConfigModal.gConfigSettings.isCurrentUserAdmin || ConfigModal.gConfigSettings.isAllowAllUsers) {
                    SPFilteredItems.push(SPData[i])
                    isTaskAlreadyPushedIn = true;
                    continue
                }
                else if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                    if (!isTaskAlreadyPushedIn) {
                        for (var j = 0; j < ConfigModal.gConfigSettings.CurrentUserLevel.length; j++) {
                            var LevelName = SPData[i]["TaskLevel"]["Title"]
                            var isSameLevel = (ConfigModal.gConfigSettings.CurrentUserLevel[j].Name == LevelName) ? true : false;
                            if (isSameLevel) {

                                SPFilteredItems.push(SPData[i])
                                isTaskAlreadyPushedIn = true;
                                break;

                            }
                            else {
                                var isAllowTask = this.isTaskSelfAssigned(SPData[i])
                                if (isAllowTask) {
                                    SPFilteredItems.push(SPData[i])
                                    isTaskAlreadyPushedIn = true;
                                    break;
                                }
                            }


                        }
                    }

                }
                else if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
                    if (!isTaskAlreadyPushedIn) {
                        for (var k = 0; k < ConfigModal.gConfigSettings.CurrentUserDepartment.length; k++) {
                            if (ConfigModal.gConfigSettings.CurrentUserDepartment[k] == SPData[i]["Departments"]._DepartmentName) {
                                SPFilteredItems.push(SPData[i])
                                isTaskAlreadyPushedIn = true;
                            }
                            //else {
                            //    var isAllowTask = this.isTaskSelfAssigned(SPData[i])
                            //    if (isAllowTask) {
                            //        SPFilteredItems.push(SPData[i])
                            //        isTaskAlreadyPushedIn = true;
                                    
                            //    }
                            //}
                        }
                        if (!isTaskAlreadyPushedIn) {
                                  var isAllowTask = this.isTaskSelfAssigned(SPData[i])
                                if (isAllowTask) {
                                    SPFilteredItems.push(SPData[i])
                                    isTaskAlreadyPushedIn = true;

                                }
                        }
                    }
                }
                else {                    
                    var isAllowTask = this.isTaskSelfAssigned(SPData[i])
                    if (isAllowTask) {
                        SPFilteredItems.push(SPData[i])
                    }

                }
            }
            return SPFilteredItems;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._CheckPermissionAfterTaskGet"); }
    }
    isTaskSelfAssigned(SPData) {
        var isAllowTask = false
        //var SelfAssignedIds = jQuery.unique(ConfigModal.gConfigSettings.nCurrentUserAndDepartmentGrpIds);
        var SelfAssignedIds = [];
        SelfAssignedIds.push(_spPageContextInfo.userId)
        var GrpId = Object.keys(BKSPShared.CurrentUserGroupsData)
        for (var h = 0; h < GrpId.length; h++) {
            SelfAssignedIds.push(GrpId[h]);
        }
        SelfAssignedIds = jQuery.unique(SelfAssignedIds);
        if (SPData["AssignedToId"]) {
            var CurrentAssignedIDs = SPData["AssignedToId"].results;
            for (var m = 0; m < CurrentAssignedIDs.length; m++) {
                for (var n = 0; n < SelfAssignedIds.length; n++) {
                    if (SelfAssignedIds[n] == CurrentAssignedIDs[m]) {
                        //if (!isTaskAlreadyPushedIn) {
                        //  SPFilteredItems.push(SPData)
                        //     isTaskAlreadyPushedIn = true;
                        isAllowTask = true;
                        // }
                    }
                }
            }
        }
       
       
        return isAllowTask;
    }
    //My Offboarding code
    GetEmployeeData() {
        try {
            var Url = ""
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$orderby=ID asc&$select=ID%2COData__EmployeeName%2CDOJ%2COData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle%2COData__StatusE%2COData__EmployeeNumber&$expand=OData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle&$filter=OffBoardEmployeeID eq '" + _spPageContextInfo.userId + "' and Process/ID eq '2' ";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, DashboardComponent._onEmployeeItemGet, DashboardComponent._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.GetEmployeeData"); }
    }
    _onEmployeeItemGet(data) {
        try {
            if (data.d.results.length > 0) {

                var offboardedEmployeeId = data.d.results[0].ID;
                if (offboardedEmployeeId != null && data.d.results[0]["OData__StatusE"] != "Aborted") {
                    $("#OffboardedEmployee").removeClass("d-none");
                }
                else {
                    $("#OffboardedEmployee").addClass("d-none");
                }
            }
            else {
                $("#OffboardedEmployee").addClass("d-none");
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onEmployeeItemGet"); }
    }
    _onItemSaveFailed(data) {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Unable to found Employee Data.", "");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain._onItemSaveFailed"); }
    }

    OpenoffboardEmpTasksModal() {
        try {

            let Dialog = null;
            var intItemID = 0;
            intItemID = _spPageContextInfo.userId;
            Dialog = <OffboardingEmployeeModal ItemId={intItemID} HandleDataUpdate={DashboardComponent.update}></OffboardingEmployeeModal>
            DashboardComponent.setState({ OffboardingEmployeeModal: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.OpenoffboardEmpTasksModal"); }
    }
    update() {
        try {
            DashboardComponent.setState({ OffboardingEmployeeModal: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DashboardMain.update"); }
    }
    //End
    render() {
        return (
            <div>

                <div>
                    <MainHeaderConfig PageHeading={"Dashboard"} />

                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Home} />
                </div>
                <div className="content-dashboard-main">
                    <div id="demo" className="sidebar sidebar-sticky sidebar-bg collapse show">
                        <div className="sidebar-body">
                            <div id="DashBoardRightPane" className="db-right-section mt-3">
                                <div className="row right-notification-section pb-2">
                                    <div className="col-6 pr-2">
                                        <div className="row notification-bg-main">
                                            <div className="col-3 notification-icon-main">
                                                <i className="fas fa-user-plus bg-primary"></i>
                                            </div>
                                            <div className="col-9">
                                                <p className="notification-number">{this.state.OnGoingOnBoardingEmployeeCount}</p>
                                                <p className="notification-heading">Onboarding</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 pl-2">
                                        <div className="row notification-bg-main">
                                            <div className="col-3 notification-icon-main">
                                                <i className="fas fa-user-minus bg-primary"></i>
                                            </div>
                                            <div className="col-9">
                                                <p id="OnGoingOffBoardingEmployeeCount" className="notification-number">{this.state.OnGoingOffBoardingEmployeeCount}</p>
                                                <p className="notification-heading">Offboarding</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 pr-2">
                                        <div className="row notification-bg-main">
                                            <div className="col-3 notification-icon-main">
                                                <i className="fas fa-user-check bg-success"></i>
                                            </div>
                                            <div className="col-9">
                                                <p className="notification-number">{this.state.OnboardedEmployeeCount}</p>
                                                <p className="notification-heading">Onboarded</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 pl-2">
                                        <div className="row notification-bg-main">
                                            <div className="col-3 notification-icon-main">
                                                <i className="fas fa-user-check bg-success"></i>
                                            </div>
                                            <div className="col-9">
                                                <p id="OnGoingOffBoardingEmployeeCount" className="notification-number">{this.state.OffBoardedEmployeeCount}</p>
                                                <p className="notification-heading">Offboarded</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="OverdeuTablesDiv" className="db-section-main mb-4">
                                    <div className="db-section-body">
                                        <div className="col-12 p-0">
                                            <div className="db-head p-0 db-tab-section">
                                                <ul className="nav">
                                                    <li className="nav-item">
                                                        <a className="nav-link" key="All" data-toggle="tab" href="#all">All</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link active" key="OnBoard" data-toggle="tab" href="#on-board">Onboard</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" data-toggle="tab" href="#off-board" key="OffBoard" >Offboard</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row pt-3">
                                                <div className="col-12">
                                                    <div className="tab-content">
                                                        <div className="tab-pane fade" id="all">{this.state.OverDueTaskData}</div>
                                                        <div className="tab-pane fade active show" id="on-board"><div id="OnboardPieChartHeading"></div><div id="OnboardPieChart"></div>{this.state.OngoingDepartmentWiseOnBoardEmployees}{this.state.OnboardOverDueTables}</div>
                                                        <div className="tab-pane fade" id="off-board"><div id="OffboardPieChartHeading"></div><div id="OffboardPieChart"></div>{this.state.OngoingDepartmentWiseOffBoardEmployees}{this.state.OffboardOverDueTables}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div id="FilterRightPane" className="row mt-3 ">
                                <div className="col-12">
                                    <h6 className="sidebar-heading">Filters</h6>
                                </div>
                                <div className="col-6 pr-2">
                                    <div className="form-group input-with-icon">
                                        <input type="text" id="dtFromPicker" className="form-control form-control-sm" placeholder="From Date" />
                                        <div className="input-icon">
                                            <a herf="#"><i className="fa fa-calendar"></i></a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 pl-2">
                                    <div className="form-group input-with-icon">
                                        <input type="text" id="dtToPicker" className="form-control form-control-sm" placeholder="To Date" />
                                        <div className="input-icon">
                                            <a herf="#"><i className="fa fa-calendar"></i></a>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6 pr-2">
                                    <div className="form-group">
                                        <select id="ddDashBoardProcess" title="Select process type" defaultValue={'DEFAULT'} onChange={DashboardComponent._CheckProcessAndUpdateCategory} className="form-control form-control-sm">
                                            <option key={0} value={0}>Select process</option>
                                            <option key={1} value={1}>Onboarding</option>
                                            <option key={2} value={2}>Offboarding</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-6 pl-2">
                                    <div className="form-group">
                                        <input type="text" id="txtEmployeeName" onChange={this._UpdateSearchIcon} className="form-control form-control-sm" placeholder="Employee Name" />
                                    </div>
                                </div>
                                <div className="col-6 pr-2">
                                    <div className="form-group">
                                        <div id="userpicker"></div>
                                    </div>
                                </div>
                                <div className="col-6 pl-2">
                                    <div className="form-group">
                                        <select id="ddDepartments" title="Select task department" key={"DepartmentOptionsKey"} defaultValue={'DEFAULT'} onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm">
                                            <option key={1} value="All">Select department</option>{this.state.DepartmentOptions}</select>
                                    </div>
                                </div>
                                <div className="col-6 pr-2">
                                    <div className="form-group">
                                        <select id="ddCategory" title="Select task category" key={"CategoryOptionsKey"} defaultValue={'DEFAULT'} onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm">
                                            {this.state.CategoryOptions}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-6 pl-2">
                                    <div className="form-group">
                                        <select id="ddLevel" title="Select task level" key={"LevelOptionsKey"} defaultValue={'DEFAULT'} onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm">
                                            {this.state.LevelOptions}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-6 pr-2">
                                    <div className="form-group">
                                        <select id="ddStatus" title="Select task status" defaultValue={'NotClosed'} key={"StatusDashboardKey"} className="formPlaceHolder" onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm">

                                            {this.state.StatusOptions}</select>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-group mt-1">
                                        <button type="Button" data-toggle="tooltip" title="Search" className="btn btn-primary btn-sm mw-auto mr-2 modalBtn" onClick={this.FilterGridTasks}><i id="dashboardFilterIcon1" className="fas fa-search active SwitchTitleColor"></i></button>
                                        <button type="Button" data-toggle="tooltip" title="Reset" onClick={this._OnResetClick} className="btn btn-light btn-sm mw-auto"><i className="fa fa-refresh" onClick={this._OnResetClick}></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 menu-icon-fixed">
                                <a id="FilterRightPaneButton" onClick={this.toggleDrawer} data-toggle="tooltip" className="menu-icon filter-toggle"><i className="fa fa fa-filter faa-horizontal animated SwitchTitleColor"></i><i className="fa fa-close SwitchTitleColor"></i><span className="filter-icon-text SwitchTitleColor">Filter</span></a>
                                <a id="DashBoardRightPaneButton" onClick={this.toggleDrawer} data-toggle="tooltip" className="menu-icon dashboard-toggle mt-5 active"><i className="fa fa-close SwitchTitleColor"></i><i className="fas fa-chart-pie faa-horizontal animated SwitchTitleColor"></i><span className="filter-icon-text SwitchTitleColor">Dashboard</span></a>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div id="DashboardGridDiv" className="col-12 db-left-section">
                                <div className="db-section-main mb-4">
                                    <div className="col-12">
                                        <div className="row db-section-body">
                                            <div className="col-12 p-0">
                                                <div className="db-head">
                                                    <div className="row">
                                                        <div className="form-group col-md-3 search m-0">
                                                            <input onKeyDown={this.CheckAndSearch} onChange={this._UpdateSearchIcon2} className="form-control form-control-sm" type="TextBox" id="StandardTaskGridSearchTextBox" placeholder="Search by task name" />
                                                            <i className="search-icon fa fa-search"></i>
                                                        </div>
                                                        <div className="form-inline col-md-4 pl-0 m-0 filter-buttons">
                                                            <div className="form-group big-check-box mb-0 mr-2">
                                                                <div className="custom-control custom-checkbox">
                                                                    <input id="chkMyTask" type="checkbox" onChange={this._UpdateSearchIcon} className="custom-control-input" />
                                                                    <label className="custom-control-label" htmlFor="chkMyTask">My Task</label>
                                                                </div>
                                                            </div>
                                                            <button type="Button" data-toggle="tooltip" title="Search" id="btnDashboardSearch" onClick={this.FilterGridTasks} className="btn btn-primary btn-sm mw-auto mr-2 SwitchTitleColor"><i id="dashboardFilterIcon" className="fa fa-search active"></i></button>
                                                            <button data-toggle="tooltip" title="Filter" onClick={this.OpenFilterPane} type="Button" className="btn btn-light btn-sm mw-auto mr-2"> <i className="fa fa-filter "></i></button>
                                                            <button data-toggle="tooltip" title="Reset" type="Button" onClick={this._OnResetClick} className="btn btn-light btn-sm mw-auto"><i className="fa fa-refresh"></i></button>
                                                        </div>

                                                        <div className="col-md-5 text-right send-email ">

                                                            <button data-toggle="tooltip" id="OffboardedEmployee" title="My Offboarding Tasks" type="Button" onClick={DashboardComponent.OpenoffboardEmpTasksModal} className="btn btn-light btn-sm d-none mr-2"><i className="fas fa-user-minus"></i>&nbsp; My Offboarding</button>
                                                            <button data-toggle="tooltip" id="OverDueTaskDiv" title="Send task notification for overdue tasks or all pending tasks." type="Button" onClick={this.OpenTaskReminderDialog} className="btn btn-primary btn-sm SwitchTitleColor d-none"><i className="fa fa-envelope"></i>&nbsp; Task Notification</button>

                                                        </div>

                                                        {this.state.OverDueTaskReminderDialog}
                                                        {this.state.OffboardingEmployeeModal}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 p-0">
                                                
                                                <div id="GridLoaderBG" className="d-none">
                                                    <div className="loading-img-bg">
                                                        <img id="loading-image" src="../Images/loader.gif" alt="Loading..." />
                                                        <p>Working on it...</p>
                                                    </div>
                                                </div>
                                                {this.state.TasksGrid}{this.state.TaskEditDialog}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div id="chartContainer"></div>
                {this.state.UserInfoModal}
                {this.state.Footer}
            </div>
        );
    }
}
var EOBDashBoard = {
    ShowDashBoard: function () {
        $('loading').hide();
        const dom = document.getElementById("DashboardMain");
        ReactDOM.render(
            <DashboardMain />,
            dom
        );
    }
}
$('loading').show();
EOBUpgrade.GetUpgradeStatus(EOBDashBoard.ShowDashBoard)

