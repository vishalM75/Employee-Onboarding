"use strict";
var gOverDueByDepartmentTasksData = {
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
    OverDueTasksByDepartment: null,
    OverDueTasksByEmployee: null,
    OverDueTasksByAssignedTo: null,
    isDepartmentClicked: 0,
    isCountClicked: 0,
    isEmployeeClicked: 0,
    isEmployeeCountClicked: 0
}
class OverDueTasksDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            Employees: this.props.Employees,
            TasksData: this.props.AllOpenTasks,
            Departments: null,
            isGroupByOnboardOffBoard: this.props.IsGroupByOnboardOffBoard,
            OverDueRowsData: null,
            OverDueEmployeeRowsData: null,
            OverDueAssignedToRowsData: null,
            OverDueTasksByDepartment: null,
            OverDueTasksByEmployee: null,
            DepartmentSortIconClass: "fa fa-sort",
            DepartmentCountSortIconClass: "fa fa-sort",
            EmployeeSortIconClass: "fa fa-sort",
            EmployeeCountSortIconClass: "fa fa-sort",
            OnRowClickfunction: this.props.OnRowClickfunction
        }
        this._onRowCLick = this._onRowCLick.bind(this);
        this._onRestCallFailure = this._onRestCallFailure.bind(this);
        this.CreateOverDueTasksTables = this.CreateOverDueTasksTables.bind(this);
        this.isTaskDue = this.isTaskDue.bind(this);
        this.FilterTasksByEmployee = this.FilterTasksByEmployee.bind(this);
        this.CalculateOverDueTasksPerDepartment = this.CalculateOverDueTasksPerDepartment.bind(this);
        this.FilterTasksByProcessType = this.FilterTasksByProcessType.bind(this)
        this._onGetDepartmentNames = this._onGetDepartmentNames.bind(this)
        this.GetDepartmentNames = this.GetDepartmentNames.bind(this)
        this.CreateOverdueTaskTable = this.CreateOverdueTaskTable.bind(this);
        this.SortOverDueTaskByDepartmentData = this.SortOverDueTaskByDepartmentData.bind(this);
        this.SortOverDueTaskByEmployeeData = this.SortOverDueTaskByEmployeeData.bind(this);
        this.DynamicSort = this.DynamicSort.bind(this);
        this.CalculateOverDueTasksPerAssignedTo = this.CalculateOverDueTasksPerAssignedTo.bind(this);
        this.RenderDueTables = this.RenderDueTables.bind(this);
        this.CalculateOnBoardOffBoardOverDueTasksPerDepartment = this.CalculateOnBoardOffBoardOverDueTasksPerDepartment.bind(this);
        this.CalculateOnBoardOffBoardOverDueTasksPerEmployee = this.CalculateOnBoardOffBoardOverDueTasksPerEmployee.bind(this);
        this.CalculateOnBoardOffBoardOverDueTasksPerAssignedTo = this.CalculateOnBoardOffBoardOverDueTasksPerAssignedTo.bind(this);

    }
    componentWillMount() {

    }
    componentDidMount() {
        EOBConstants.SetNewThemeColor();
        this.CreateOverDueTasksTables();
    }
    CreateOverDueTasksTables() {
        this.GetDepartmentNames();
    }
    GetDepartmentNames() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Department + "')/items?$Select=ID,OData__DepartmentName";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetDepartmentNames, this._onRestCallFailure);
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
    CalculateOverDueTasksPerDepartment() {
        //var Items = gOverDueByDepartmentTasksData.AllOpenTasks;        
        var Items = this.state.TasksData;
        var DepartmentsTasks = {};

        for (var i = 0; i < Items.length; i++) {
            var Department = Items[i].IDDepartment;
            var CurrentValue = 0;
            var CurrentDepartmentName = ""
            for (var j = 0; j < this.state.Departments.length; j++) {
                if (this.state.Departments[j]["ID"] == Department) {
                    CurrentDepartmentName = this.state.Departments[j]["OData__DepartmentName"]
                    break;
                }
            }
            var isTaskOverDue = this.isTaskDue(Items[i]["DueDate"]);
            if (isTaskOverDue) {
                if (DepartmentsTasks[CurrentDepartmentName] == undefined) {
                    CurrentValue = 1;
                }
                else {
                    CurrentValue = DepartmentsTasks[CurrentDepartmentName]
                    CurrentValue = (CurrentValue + 1)
                }
                DepartmentsTasks[CurrentDepartmentName] = CurrentValue

            }
        }



        //gOverDueByDepartmentTasksData.OverDueTasksByDepartment = DepartmentsTasks;
        this.setState({ OverDueTasksByDepartment: DepartmentsTasks }, function () {
            this.CreateOverdueTaskTable(this.state.OverDueTasksByDepartment)
        });

    }
    CalculateOverDueTasksPerEmployee() {
        var EmployeeTasksHash = {};
        var EmployeeNameId = {};
        var ProperDataObject = {};
        for (var i = 0; i < this.state.Employees.length; i++) {
            var EmployeeTasks = this.FilterTasksByEmployee(this.state.Employees[i]["ID"])
            for (var k = 0; k < EmployeeTasks.length; k++) {
                if (EmployeeTasks[k]["OData__EmployeeIDId"] == this.state.Employees[i]["ID"]) {
                    var isTaskOverDue = this.isTaskDue(EmployeeTasks[k]["DueDate"]);
                    var CurrentValue = 0;
                    var CurrentEmployeeID = this.state.Employees[i]["ID"]
                    //  1 = OnBoard, 2 = OffBoard
                    if (isTaskOverDue) {
                        if (EmployeeTasksHash[CurrentEmployeeID] == undefined) {
                            CurrentValue = 1;
                            EmployeeNameId[CurrentEmployeeID] = this.state.Employees[i]["OData__EmployeeName"]
                        }
                        else {
                            CurrentValue = EmployeeTasksHash[CurrentEmployeeID]
                            CurrentValue = (CurrentValue + 1)
                        }
                        EmployeeTasksHash[CurrentEmployeeID] = CurrentValue
                    }
                }
            }
        }
        $.each(EmployeeTasksHash, function (key, value) {
            var CurrentEmployeeName = EmployeeNameId[key];
            ProperDataObject[key + "BKEOB_Emp" + CurrentEmployeeName] = value;
            //ProperDataObject[CurrentEmployeeName] = value;
        });
        this.setState({ OverDueTasksByEmployee: ProperDataObject })
        //gOverDueByDepartmentTasksData.OverDueTasksByEmployee = ProperDataObject; 
        this.CreateOverdueTaskTable(ProperDataObject, true)
    }
    CalculateOverDueTasksPerAssignedTo() {
        //var Items = gOverDueByDepartmentTasksData.AllOpenTasks;
        var Items = this.state.TasksData;
        var AssignedToTasks = {};
        for (var i = 0; i < Items.length; i++) {
            var AssignedTo = null;
            var AssignedToIds = null;
            if (Items[i].AssignedTo) {
                if (BKJSShared.NotNullOrUndefined(Items[i].AssignedTo.results)) {
                    if (Items[i].AssignedTo.results.length > 0) {
                        AssignedTo = Items[i].AssignedTo.results;
                        AssignedToIds = Items[i].AssignedToId.results
                    }
                }

            }

            var CurrentValue = 0;
            var CurrentDepartmentName = ""
            var isTaskOverDue = this.isTaskDue(Items[i]["DueDate"]);
            if (isTaskOverDue) {
                if (BKJSShared.NotNullOrUndefined(Items[i].AssignedTo.results)) {
                    for (var l = 0; l < AssignedTo.length; l++) {
                        var CurrentAssignedToID = AssignedToIds[l];
                        if (AssignedToTasks[CurrentAssignedToID + "BKEOB_ASGNTO" + AssignedTo[l]["Title"]] == undefined) {
                            CurrentValue = 1;
                        }
                        else {
                            CurrentValue = AssignedToTasks[CurrentAssignedToID + "BKEOB_ASGNTO" + AssignedTo[l]["Title"]]
                            CurrentValue = (CurrentValue + 1)
                        }
                        //AssignedToTasks[AssignedTo[l]["Title"]] = CurrentValue
                       
                        AssignedToTasks[CurrentAssignedToID + "BKEOB_ASGNTO" + AssignedTo[l]["Title"]] = CurrentValue
                    }
                }
            }
        }
        // gOverDueByDepartmentTasksData.OverDueTasksByAssignedTo = AssignedToTasks;
        this.CreateOverdueTaskTable(AssignedToTasks, null, true)
    }
    //grouped by process type
    CalculateOnBoardOffBoardOverDueTasksPerDepartment(OnBaordOffBoardProcessName) {
        var Items = this.state.TasksData;
        var ProcessId = ""
        if (OnBaordOffBoardProcessName == EOBConstants.ProcessNames.OffBoard) {
            ProcessId = 2;
        }
        else {
            ProcessId = 1;
        }
        var DepartmentsTasks = {};
        for (var i = 0; i < Items.length; i++) {
            var Department = Items[i].IDDepartment;
            var CurrentValue = 0;
            var CurrentDepartmentName = ""
            if (Items[i].ProcessId == ProcessId) {
                for (var j = 0; j < this.state.Departments.length; j++) {
                    if (this.state.Departments[j]["ID"] == Department) {
                        CurrentDepartmentName = this.state.Departments[j]["OData__DepartmentName"]
                        break;
                    }
                }
                var isTaskOverDue = this.isTaskDue(Items[i]["DueDate"]);
                if (isTaskOverDue) {
                    if (DepartmentsTasks[CurrentDepartmentName] == undefined) {
                        CurrentValue = 1;
                    }
                    else {
                        CurrentValue = DepartmentsTasks[CurrentDepartmentName]
                        CurrentValue = (CurrentValue + 1)
                    }
                    DepartmentsTasks[CurrentDepartmentName] = CurrentValue
                }
            }

        }
        //gOverDueByDepartmentTasksData.OverDueTasksByDepartment = DepartmentsTasks;
        this.setState({ OverDueTasksByDepartment: DepartmentsTasks }, function () {
            this.CreateOverdueTaskTable(this.state.OverDueTasksByDepartment)
        });
    }
    CalculateOnBoardOffBoardOverDueTasksPerEmployee(OnBaordOffBoardProcessName) {
        var ProcessId = ""
        if (OnBaordOffBoardProcessName == EOBConstants.ProcessNames.OffBoard) {
            ProcessId = 2;
        }
        else {
            ProcessId = 1;
        }
        var EmployeeTasksHash = {};
        var EmployeeNameId = {};
        var ProperDataObject = {};
        for (var i = 0; i < this.state.Employees.length; i++) {
            var EmployeeTasks = this.FilterTasksByEmployee(this.state.Employees[i]["ID"])
            if (EmployeeTasks) {
                for (var k = 0; k < EmployeeTasks.length; k++) {
                    if (EmployeeTasks[k]["OData__EmployeeIDId"] == this.state.Employees[i]["ID"]) {
                        if (EmployeeTasks[k].ProcessId == ProcessId) {
                            var isTaskOverDue = this.isTaskDue(EmployeeTasks[k]["DueDate"]);
                            var CurrentValue = 0;
                            var CurrentEmployeeID = this.state.Employees[i]["ID"]
                            //  1 = OnBoard, 2 = OffBoard
                            if (isTaskOverDue) {
                                if (EmployeeTasksHash[CurrentEmployeeID] == undefined) {
                                    CurrentValue = 1;
                                    EmployeeNameId[CurrentEmployeeID] = this.state.Employees[i]["OData__EmployeeName"]
                                }
                                else {
                                    CurrentValue = EmployeeTasksHash[CurrentEmployeeID]
                                    CurrentValue = (CurrentValue + 1)
                                }
                                EmployeeTasksHash[CurrentEmployeeID] = CurrentValue
                            }
                        }
                    }
                }
            }
        }
        $.each(EmployeeTasksHash, function (key, value) {
            var CurrentEmployeeName = EmployeeNameId[key];
            ProperDataObject[key + "BKEOB_Emp" + CurrentEmployeeName] = value;
        });
        this.setState({ OverDueTasksByEmployee: ProperDataObject })
        //gOverDueByDepartmentTasksData.OverDueTasksByEmployee = ProperDataObject; 
        this.CreateOverdueTaskTable(ProperDataObject, true)
    }
    CalculateOnBoardOffBoardOverDueTasksPerAssignedTo(OnBaordOffBoardProcessName) {
        var ProcessId = ""
        if (OnBaordOffBoardProcessName == EOBConstants.ProcessNames.OffBoard) {
            ProcessId = 2;
        }
        else {
            ProcessId = 1;
        }
        var Items = this.state.TasksData;
        var AssignedToTasks = {};
        for (var i = 0; i < Items.length; i++) {
            if (Items[i].ProcessId == ProcessId) {
                var AssignedTo = null;
                var AssignedToIds = null
                if (Items[i].AssignedTo.results) {
                    if (Items[i].AssignedTo.results.length > 0) {
                        AssignedTo = Items[i].AssignedTo.results;
                        AssignedToIds = Items[i].AssignedToId.results
                    }
                }

                var CurrentValue = 0;
                var CurrentDepartmentName = ""

                var isTaskOverDue = this.isTaskDue(Items[i]["DueDate"]);
                if (isTaskOverDue) {
                    if (AssignedTo) {
                        for (var l = 0; l < AssignedTo.length; l++) {
                            var CurrentAssignedToID = AssignedToIds[l];
                            var Key = CurrentAssignedToID + "BKEOB_ASGNTO" + AssignedTo[l]["Title"]
                            if (AssignedToTasks[Key] == undefined) {
                                CurrentValue = 1;
                            }
                            else {
                                CurrentValue = AssignedToTasks[Key]
                                CurrentValue = (CurrentValue + 1)
                            }
                            
                            AssignedToTasks[Key] = CurrentValue
                        }
                    }

                }
            }
        }
        this.CreateOverdueTaskTable(AssignedToTasks, null, true)
    }
    //grouped by process type end
    CreateOverdueTaskTable(TableData, isEmployee, isAssignedTo) {
        var RowsArray = []
        var TableType = ""
        if (isEmployee) {
            TableType = "EmployeeType"
        }
        else if (isAssignedTo) {
            TableType = "AssignedToType"
        }
        else {
            TableType = "DepartmentType"
        }

        if (Object.keys(TableData).length > 0) {
            var onClickFunction = this._onRowCLick;
            $.each(TableData, function (key, value) {
                var CurrentRowValue = []
                var CurrentRowTitle = ""
                if (isEmployee) {
                    CurrentRowValue = key.split("BKEOB_Emp")
                    CurrentRowTitle = CurrentRowValue[1]
                }
                else if (isAssignedTo) {
                    CurrentRowValue = key.split("BKEOB_ASGNTO")
                    CurrentRowTitle = CurrentRowValue[1]
                }
                else {

                    CurrentRowTitle = key
                }
                let TR = <tr key={key}><td><a onClick={onClickFunction} className={"OnRowCLick " + CurrentRowValue[0] + TableType} herf="#"  >{CurrentRowTitle}</a></td><td className="text-right">{value}</td></tr>
                RowsArray.push(TR);
            });
        }
        else {
            const TR = <b key={"404"}>No records found!</b>
            RowsArray.push(TR);
        }
        if (isEmployee) {
            this.setState({ OverDueEmployeeRowsData: RowsArray })
        }
        else if (isAssignedTo) {
            this.setState({ OverDueAssignedToRowsData: RowsArray })
        }
        else {
            this.setState({ OverDueRowsData: RowsArray })
        }

    }
    FilterTasksByEmployee(EmployeeID) {
        var ListItemsFilterData = this.state.TasksData.filter(function (el) {
            return el.OData__EmployeeIDId == EmployeeID
        });
        return ListItemsFilterData;
    }
    FilterTasksByProcessType(ProcessName) {
        var ProcessId = 1;
        var ProcessTypeBasedOnGoingTasks = [];
        ProcessTypeBasedOnGoingTasks = gOverDueByDepartmentTasksData.OnGoingOnBoardEmployees;
        //  1 = OnBoard, 2 = OffBoard
        if (ProcessName == "Off Board") {
            ProcessId = 2;
            ProcessTypeBasedOnGoingTasks = gOverDueByDepartmentTasksData.OnGoingOffBoardEmployees;
        }

        var ListItemsFilterData = ProcessTypeBasedOnGoingTasks.filter(function (el) {
            return el.ProcessId == ProcessId
        });
        return ListItemsFilterData;
    }
    DynamicSort(property, isNumber, Items, isDescending) {
        let ListItemsData = null;
        if (isNumber) {
            if (isDescending) {
                ListItemsData = Items.sort(function (a, b) {
                    return parseFloat(b[property]) - parseFloat(a[property]);

                });
            }
            else {
                ListItemsData = Items.sort(function (a, b) {
                    return parseFloat(a[property]) - parseFloat(b[property]);
                });
            }
        }
        else {
            if (isDescending) {
                ListItemsData = Items.sort(function (a, b) {
                    return b[property].localeCompare(a[property]);
                });
            }
            else {
                ListItemsData = Items.sort(function (a, b) {
                    return a[property].localeCompare(b[property]);
                });
            }

        }
        return ListItemsData;
    }
    SortOverDueTaskByDepartmentData(Event) {
        var ColumnName = Event.currentTarget.innerText;
        let ListItemsData = {};
        var sortable = [];

        for (var key in this.state.OverDueTasksByDepartment) {
            var DObject = {}
            DObject["Name"] = key
            DObject["Count"] = this.state.OverDueTasksByDepartment[key]
            //sortable.push([key, gOverDueByDepartmentTasksData.OverDueTasksByDepartment[key]]);
            sortable.push(DObject)
        }
        if (ColumnName == "Department") {
            if (gOverDueByDepartmentTasksData.isDepartmentClicked == 0) {
                //0 ascending, 1 descending
                sortable = this.DynamicSort("Name", false, sortable, false)
                this.setState({ DepartmentSortIconClass: "fa fa-caret-down" })
                this.setState({ DepartmentCountSortIconClass: "fa fa-sort" })
                gOverDueByDepartmentTasksData.isDepartmentClicked = 1
            }
            else {
                sortable = this.DynamicSort("Name", false, sortable, true)
                this.setState({ DepartmentSortIconClass: "fa fa-caret-up" })
                this.setState({ DepartmentCountSortIconClass: "fa fa-sort" })
                gOverDueByDepartmentTasksData.isDepartmentClicked = 0
            }
        }
        else {
            if (gOverDueByDepartmentTasksData.isCountClicked == 0) {
                //0 ascending, 1 descending
                sortable = this.DynamicSort("Count", true, sortable, false)
                gOverDueByDepartmentTasksData.isCountClicked = 1
                this.setState({ DepartmentCountSortIconClass: "fa fa-caret-down" })
                this.setState({ DepartmentSortIconClass: "fa fa-sort" })

            }
            else {
                sortable = this.DynamicSort("Count", true, sortable, true)
                gOverDueByDepartmentTasksData.isCountClicked = 0
                this.setState({ DepartmentCountSortIconClass: "fa fa-caret-up" })
                this.setState({ DepartmentSortIconClass: "fa fa-sort" })
            }

        }
        for (var i = 0; i < sortable.length; i++) {
            ListItemsData[sortable[i]["Name"]] = sortable[i]["Count"]
        }
        this.CreateOverdueTaskTable(ListItemsData);
    }
    SortOverDueTaskByEmployeeData(Event) {
        var ColumnName = Event.currentTarget.innerText;
        let ListItemsData = {};
        var sortable = [];

        for (var key in this.state.OverDueTasksByEmployee) {
            var DObject = {}
            DObject["Name"] = key
            DObject["Count"] = this.state.OverDueTasksByEmployee[key]
            sortable.push(DObject)
        }
        if (ColumnName == "Employee") {

            if (gOverDueByDepartmentTasksData.isEmployeeClicked == 0) {
                //0 ascending, 1 descending
                sortable = this.DynamicSort("Name", false, sortable, false)
                this.setState({ EmployeeSortIconClass: "fa fa-caret-down" })
                this.setState({ EmplopyeeCountSortIconClass: "fa fa-sort" })
                gOverDueByDepartmentTasksData.isEmployeeClicked = 1
            }
            else {
                sortable = this.DynamicSort("Name", false, sortable, true)
                this.setState({ EmployeeSortIconClass: "fa fa-caret-up" })
                this.setState({ EmplopyeeCountSortIconClass: "fa fa-sort" })
                gOverDueByDepartmentTasksData.isEmployeeClicked = 0
            }
        }
        else {

            if (gOverDueByDepartmentTasksData.isCountClicked == 0) {
                //0 ascending, 1 descending
                sortable = this.DynamicSort("Count", true, sortable, false)
                gOverDueByDepartmentTasksData.isCountClicked = 1
                this.setState({ EmplopyeeCountSortIconClass: "fa fa-caret-down" })
                this.setState({ EmployeeSortIconClass: "fa fa-sort" })

            }
            else {

                sortable = this.DynamicSort("Count", true, sortable, true)
                gOverDueByDepartmentTasksData.isCountClicked = 0
                this.setState({ EmplopyeeCountSortIconClass: "fa fa-caret-up" })
                this.setState({ EmployeeSortIconClass: "fa fa-sort" })
            }

        }
        for (var i = 0; i < sortable.length; i++) {
            ListItemsData[sortable[i]["Name"]] = sortable[i]["Count"]
        }
        this.CreateOverdueTaskTable(ListItemsData, true);
    }
    SortOverDueTaskByAssignedData(Event) {

    }
    RenderDueTables() {
        if (BKJSShared.NotNullOrUndefined(this.state.isGroupByOnboardOffBoard)) {
            if (this.state.isGroupByOnboardOffBoard == EOBConstants.ProcessNames.OnBoard) {
                this.CalculateOnBoardOffBoardOverDueTasksPerDepartment(EOBConstants.ProcessNames.OnBoard)
                this.CalculateOnBoardOffBoardOverDueTasksPerEmployee(EOBConstants.ProcessNames.OnBoard)
                this.CalculateOnBoardOffBoardOverDueTasksPerAssignedTo(EOBConstants.ProcessNames.OnBoard)
            }
            else {
                this.CalculateOnBoardOffBoardOverDueTasksPerDepartment(EOBConstants.ProcessNames.OffBoard)
                this.CalculateOnBoardOffBoardOverDueTasksPerEmployee(EOBConstants.ProcessNames.OffBoard)
                this.CalculateOnBoardOffBoardOverDueTasksPerAssignedTo(EOBConstants.ProcessNames.OffBoard)
            }

        }
        else {
            this.CalculateOverDueTasksPerDepartment();
            this.CalculateOverDueTasksPerEmployee();
            this.CalculateOverDueTasksPerAssignedTo();
        }
    }
    _onRowCLick(event) {
        var RowTitle = event.currentTarget.innerText;
        var TableType = event.currentTarget.classList[1];
        var Type = ""
        var ID = ""
        var isAssigneedType = TableType.indexOf("AssignedToType")
        if (isAssigneedType > -1) {
            Type = "AssignedToType"
            ID = TableType.split("AssignedToType")[0]
        }
        else {
            var isEmployeeType = TableType.indexOf("EmployeeType")
            if (isEmployeeType > -1) {
                Type = "EmployeeType"
                ID = TableType.split("EmployeeType")[0]
            }
        }


        var DataObject = {
            Title: RowTitle,
            TableType: Type,
            ID: ID,
            ProcessType: this.state.isGroupByOnboardOffBoard
        }
        this.props.OnRowClickfunction(DataObject)
    }
    _onGetDepartmentNames(data) {
        this.setState({ Departments: data.d.results }, this.RenderDueTables)

    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    render() {
        return (
            <div>
                <div className="mb-2">
                    <div className="col-12">
                        <div className="db-head-inner-tab collapse-main">
                            <a data-toggle="collapse" href="#OverdueDepartment" aria-expanded="true" aria-controls="OverdueDepartment" className="d-block">
                                Overdue Task By Department
                                <i className="fa fa-angle-right float-right mr-0"></i>
                                <i className="fa fa-angle-down float-right mr-0"></i>
				            </a>
                        </div>
                    </div>
                    <div className="col-12 collapse show" id="OverdueDepartment">
                        <div className="table-responsive-xl p-0">
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th width="75%" onClick={this.SortOverDueTaskByDepartmentData} className="showCursorPointer SwitchTitleColor">Department
                                                    <a herf="#" className="float-right"><i className={this.state.DepartmentSortIconClass}></i>
                                            </a>
                                        </th>
                                        <th onClick={this.SortOverDueTaskByDepartmentData} className="showCursorPointer SwitchTitleColor">Count <a herf="#" className="float-right" ><i className={this.state.DepartmentCountSortIconClass}></i></a></th></tr>
                                </thead>
                                <tbody>{this.state.OverDueRowsData}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <div className="col-12">
                        <div className="db-head-inner-tab collapse-main">
                            <a data-toggle="collapse" href="#OverdueEmployee" aria-expanded="true" aria-controls="OverdueEmployee" className="d-block">
                                {"Overdue Task By " + ConfigModal.gConfigSettings.DisplayTextEmployee}
                                <i className="fa fa-angle-right float-right mr-0"></i>
                                <i className="fa fa-angle-down float-right mr-0"></i>
                            </a>
                        </div>
                    </div>
                    <div className="col-12 collapse show" id="OverdueEmployee">
                        <div className="table-responsive-xl p-0">
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr><th width="75%" onClick={this.SortOverDueTaskByEmployeeData} className="showCursorPointer SwitchTitleColor">{ConfigModal.gConfigSettings.DisplayTextEmployee} <a herf="#" className="float-right"><i className={this.state.EmployeeSortIconClass}></i></a></th>
                                        <th onClick={this.SortOverDueTaskByEmployeeData} className="showCursorPointer SwitchTitleColor">Count <a herf="#" className="float-right" ><i className={this.state.EmployeeCountSortIconClass}></i></a></th></tr>
                                </thead>
                                <tbody>{this.state.OverDueEmployeeRowsData}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <div className="col-12">
                        <div className="db-head-inner-tab collapse-main">
                            <a data-toggle="collapse" href="#OverdueAssignedTo" aria-expanded="true" aria-controls="OverdueAssignedTo" className="d-block">
                                Overdue Task By Assigned To
                                <i className="fa fa-angle-right float-right mr-0"></i>
                                <i className="fa fa-angle-down float-right mr-0"></i>
                            </a>
                        </div>
                    </div>
                    <div className="col-12 collapse show" id="OverdueAssignedTo">
                        <div className="table-responsive-xl p-0">
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr><th width="75%" onClick={this.SortOverDueTaskByAssignedData} className="showCursorPointer SwitchTitleColor">Assigned To <a herf="#" className="float-right"><i className={this.state.EmployeeSortIconClass}></i></a></th>
                                        <th onClick={this.SortOverDueTaskByAssignedData} className="showCursorPointer SwitchTitleColor">Count <a herf="#" className="float-right" ><i className={this.state.EmployeeCountSortIconClass}></i></a></th></tr>
                                </thead>
                                <tbody>{this.state.OverDueAssignedToRowsData}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );

    }

}


