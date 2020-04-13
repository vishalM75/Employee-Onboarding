"use strict";
let ReportComponent = null;
let isDialogOpened = false;
let oReportColumnProps = [];
let oGroupByOptions = [];
let oLookupColumnProps = null;
let oReportGridProps = null;
let oProcessTypeComboProps = null;
let oSortedColumns = null;
var FilterObject = {
    "OData__TaskName": ""

}
class ReportMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ReportDialog: null,
            ProcessTypeOptions: null,
            CategoryOptions: null,
            DepartmentOptions: null,
            DeleteDialog: null,
            StatusOptions: null,
            ReportDT: null,
            ProcessTypeCombo:null
        }

        ReportComponent = this;
        ReportComponent.DataGrid = React.createRef();
        ReportComponent.SetReportColumnProps();
        ReportComponent.SetGroupByOptions();
        ReportComponent.setReportGridProps();
        ReportComponent.SetReportComboProps();
       
    }
    componentDidMount() {
        try {
            ReportComponent.InitiateGridComponent();
            let ProcessCombo = <ComboMain ComboProperties={oProcessTypeComboProps}></ComboMain>
            ReportComponent.setState({ ProcessTypeCombo: ProcessCombo })

            setTimeout(
                function () {
                    //do something special
                    ReportComponent.FillEmployeeAutoComplete();
                }, 500);
            //ReportComponent.FillEmployeeAutoComplete();

            $('#loading').hide();


            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#ReportSearchbtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#ReportSearchbtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor);
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                CategoryComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            EOBConstants.SetNewThemeColor();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.componentDidMount"); }
    }

    groupBy(data, key) {
        try {
            return data.reduce(function (acc, item) {
                (acc[item[key]] = acc[item[key]] || []).push(item);
                return acc;
            }, {});
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.groupBy"); }
    }
    SetReportComboProps() {
        try {
            oProcessTypeComboProps = new EOBShared.ComboProperties("RepProcessTypeFilter", "Process Type", "lstProcessType", "", ReportComponent._UpdateSearchIcon, "All", "", "", "Title", "");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.SetReportComboProps"); }
    }
    _isDueDateExceed(FieldValue) {
        try {
            var CurrentDate = new Date();
            var CurrentDateString = CurrentDate.getDate() + "/" + (CurrentDate.getMonth() + 1) + "/" + CurrentDate.getFullYear()
            var DueDate = moment(FieldValue, 'DD/MM/YYYY');
            var TodayDate = moment(CurrentDate, "DD/MM/YYYY");
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport._isDueDateExceed"); }
    }
    SetReportColumnProps() {
        try {
            oReportColumnProps = [];

            var colTitle = new ColumnProperties("Title", "Title", "", true, true, "text", "", false, "");
            oReportColumnProps.push(colTitle);

            var colEmployee = new ColumnProperties("OData__EmployeeID", "Employee Name", "", true, true, "Lookup", "", true, "_EmployeeName");
            oReportColumnProps.push(colEmployee);

            var colActivity = new ColumnProperties("DueDate", "Due Date", "", true, true, "text", "MM/DD/YYYY", false, "", ReportComponent._isDueDateExceed);
            oReportColumnProps.push(colActivity);

            var colCategoryID = new ColumnProperties("OData__IDCategory", "CategoryId", "", false, true, "Lookup", "", true, "Id");
            oReportColumnProps.push(colCategoryID);
            var colCategory = new ColumnProperties("OData__IDCategory", "Category", "", true, true, "Lookup", "", true, "CategoryName1");
            oReportColumnProps.push(colCategory);

            var colDepartmentID = new ColumnProperties("Departments", "Department", "", true, true, "Lookup", "", true, "_DepartmentName");
            oReportColumnProps.push(colDepartmentID);

            var colDepartmentID = new ColumnProperties("TaskLevel", "Level", "", true, true, "Lookup", "", true, "Title");
            oReportColumnProps.push(colDepartmentID);

            var colAssignedTo = new ColumnProperties("AssignedTo", "Assigned To", "", true, true, "People", "", false, "");
            oReportColumnProps.push(colAssignedTo);

            var colStatus = new ColumnProperties("Status", "Status", "", true, true, "text", "", false, "");
            oReportColumnProps.push(colStatus);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.SetReportColumnProps"); }

    }
    SetGroupByOptions() {
        try {
            oGroupByOptions = [];

            var GrpCategory = new GroupByOptions("OData__IDCategory", "Category", "-CategoryId");
            oGroupByOptions.push(GrpCategory);

            var GrpDepartment = new GroupByOptions("Departments", "Department", "Departments");
            oGroupByOptions.push(GrpDepartment);

            var GrpLevel = new GroupByOptions("TaskLevel", "Level", "TaskLevel");
            oGroupByOptions.push(GrpLevel);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.SetGroupByOptions"); }
    }
    setReportGridProps() {
        try {
            oReportGridProps = new GridProperties("gridReport", EOBConstants.ListNames.ActualTasks, oReportColumnProps, "", "", false, 5, "", false, false, false, null, null, null, ReportComponent.HideLoader, false, true, "OData__IDCategory", EOBConstants.ClassNames.SwitchTitleColor, ReportComponent.GridDataModifications, oGroupByOptions);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.setReportGridProps"); }
    }
    GridDataModifications(gridData) {
        try {
            for (var i = 0; i < gridData.length; i++) {
                if (gridData[i].Status == "Open") {
                    gridData[i].Status = "Not Started";
                }
            }
            return gridData;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.GridDataModifications"); }
    }
    _OnGroupByChange() {
        try {
            let GrpBy = BKJSShared.GetComboSelectedValueAndText("#ddlGroupBy")
            ReportComponent.DataGrid.current.ResetGroupBy(GrpBy.Value);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport._OnGroupByChange"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtEmployeeName", Type: "text" },
                { ID: "#ddStatus", Type: "combo" },
                { ID: "#RepProcessTypeFilter", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "ReportFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport._UpdateSearchIcon"); }
    }
  
    _OnResetClick() {
      //  try {
            $('#loading').show();
            $("#txtEmployeeName").val("");
            $("#ddStatus").val("All");
            $("#RepProcessTypeFilter").val(0);

            $("#ReportFilterIcon").removeClass("hvr-pulse onsearchiconchange");
            ReportComponent.setState({ ReportDT: false }, ReportComponent.InitiateGridComponent);
       // }
      //  catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtEmployeeName").val();

            var objStatus = BKJSShared.GetComboSelectedValueAndText("#ddStatus");
            var objProcessType = BKJSShared.GetComboSelectedValueAndText("#RepProcessTypeFilter");

            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "";
                FilterText = "OData__EmployeeID/OData__EmployeeName eq '" + FreeText + "'";
                FilterObject.push(FilterText);
            }
            if (objProcessType.Text != "") {
                FilterText = "";
                FilterText = "Process/ID eq '" + objProcessType.Value + "'";
                FilterObject.push(FilterText);
            }
            if (objStatus.Text != "") {
                FilterText = "";
                var strStatus = objStatus.Text;
                if (strStatus == "Not Started") {
                    strStatus = "Open";
                }
                FilterText = "Status eq '" + strStatus + "'";
                FilterObject.push(FilterText);
            }
            $('#loading').show();
            $("#ReportFilterIcon").removeClass("hvr-pulse onsearchiconchange");
            var GrpBy = document.getElementById("gridReport-ddlGroupBy");
            ReportComponent.setState({ ReportDT: false }, function () { ReportComponent.CeateNewDTWithFilter(FilterObject, GrpBy.value) });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport._OnSearchClick"); }
    }
    InitiateGridComponent() {
        try {
            let ReportDataTable = <DataTableMain GridProperties={oReportGridProps} GroupedText="OData__IDCategory" FilterText="OData__EmployeeID%2FOData__StatusE%20ne%20'Aborted'" SortText="OData__IDCategory/Id asc" GroupSortText="-CategoryId" ref={ReportComponent.DataGrid} ></DataTableMain>
            ReportComponent.setState({ ReportDT: ReportDataTable }, function () { EOBConstants.SetNewThemeColor() });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.InitiateGridComponent"); }
    }
    CeateNewDTWithFilter(FilterObject, SelectedGrpBy) {
        try {
            var counter = 0;
            var FilterString = "";
            var arrayLength = FilterObject.length;
            for (var i = 0; i < arrayLength; i++) {
                if (i > 0) {
                    FilterString += " and "
                }
                FilterString += FilterObject[i];
                counter++;
            }

            let ReportDataTable = <DataTableMain GridProperties={oReportGridProps} FilterText={FilterString} GroupedText={SelectedGrpBy} SortText="Title asc" ref={ReportComponent.DataGrid} ></DataTableMain>
            ReportComponent.setState({ ReportDT: ReportDataTable })
            // ReportComponent.DataGrid.current.CreateFilterString(FilterObject);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.CeateNewDTWithFilter"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                ReportComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.CheckAndSearch"); }
    }
    FillEmployeeAutoComplete() {
        try {
            var ColumnObject = [
                { InternalName: "OData__EmployeeName", Type: "String" },
                { InternalName: "DOJ", Type: "Date" }
            ]

            //var EmployeeColumns = ["OData__EmployeeName", "DOJ"]
            EOBShared.GetEmployeeData(ColumnObject, ReportComponent.CreateAutoComplete);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.FillEmployeeAutoComplete"); }
    }
    CreateAutoComplete() {
        try {
            BKJSShared.UIControls.autocomplete("txtEmployeeName", EOBShared._EmployeeDataObject, "OData__EmployeeName", "DOJ");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.CreateAutoComplete"); }
    }
    HideLoader() {
        try {
            EOBConstants.SetNewThemeColor();
            $('#loading').hide();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.HideLoader"); }
    }
    CreateReportGridHeader() {
        try {
            $('#loading').hide();
            let HeaderArray = [];
            let GridHeader = null;

            var objGroupBy = BKJSShared.GetComboSelectedValueAndText('#gridReport-ddlGroupBy');
            oSortedColumns = [];
            for (var i = 0; i < oReportColumnProps.length; i++) {

                var objReport = oReportColumnProps[i];
                if (objGroupBy.Value == objReport.InternalName) {
                    oSortedColumns.unshift(objReport)
                }
                else {
                    oSortedColumns.push(objReport);
                }
            }
            for (var c = 0; c < oSortedColumns.length; c++) {
                if (oSortedColumns[c].ColumnVisibility == false) {
                    continue;
                }
                GridHeader = null;
                let cWidth = oSortedColumns[c].ColumnWidth;
                var style = {
                    width: cWidth + "%"
                };
                GridHeader = <th key={"TH" + c} className="ReportColumnHeader">{oSortedColumns[c].DisplayName}</th>;
                HeaderArray.push(GridHeader);
            }
            ReportComponent.setState({ GridTableHeading: HeaderArray });
            ReportComponent.CreateReportGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.CreateReportGridHeader"); }
    }
    CreateReportGridRows() {
        try {
            var DataRows = [];
            var ReportData = ReportComponent.DataGrid.current.GetTableData();
            var objGroupBy = BKJSShared.GetComboSelectedValueAndText('#gridReport-ddlGroupBy');
            var Sortby = objGroupBy.Value;
            if (Sortby === "OData__IDCategory") {
                Sortby = "-CategoryId"
            }
            ReportData.sort(BKJSShared.dynamicSort(Sortby));
            var counter = 1;
            for (var k = 0; k < ReportData.length; k++) {

                var Row = [];
                let strRowClass = "GrpGridOddRow";
                if (counter % 2 == 0) {
                    strRowClass = "GrpGridEvenRow";
                }
                for (var c = 0; c < oSortedColumns.length; c++) {
                    if (oSortedColumns[c].ColumnVisibility == false) {
                        continue;
                    }
                    let FieldValue = TableData[k][oSortedColumns[c].InternalName];
                    if (BKJSShared.NotNullOrUndefined(oSortedColumns[c].CustomValueCheck) == true) {
                        var GridCell = oSortedColumns[c].CustomValueCheck(FieldValue)
                        Row.push(GridCell);
                    }
                    else {
                        let GridRow = null;
                        if (oSortedColumns[c].DateFormat) {
                            FieldValue = moment(FieldValue).format(oSortedColumns[c].DateFormat)
                        }
                        GridRow = <td className={strRowClass}>{FieldValue}</td>
                        if (FieldValue == null || FieldValue == undefined) {
                            GridRow = <td className={strRowClass}>{""}</td>
                        }
                        Row.push(GridRow);
                    }

                }
                let DataSingleRow = <tr id={(TableData[k]["ID"] + "Row")}> {Row}</tr>
                DataRows.push(DataSingleRow);
                counter++;
            }
            ReportComponent.setState({ GridRows: DataRows }, ReportComponent.PostGridLoad);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.CreateReportGridRows"); }
    }

    CreateReportHeaders() {

    }
    CreateReportRows() {

    }
    PostGridLoad() {
        try {
            //$('.GrpColumnHeadingRow').css({ "background-color": "" });
            $('.ReportColumnHeader').css({ "padding-left": "4px", "padding-right": "4px", "padding-top": "2px", "padding-bottom": "2px", "text-align": "left", "background": "#0e69ae", "color": "#fff" })
            //  $('.GrpGroupHeader').css({ "padding": "4px", "border": "1px solid #e4e4e4", "background": "#f7f7f7", "font-weight": "600", "color": "#000" })
            $('.GrpGridEvenRow').css({ "background": "#f7f7f7" });
            BKJSShared.HTMLTableToExcel('ReportDatagrid', "Employee Task Report.xls");
            // $('#ReportDatagrid').tableExport({ type: 'excel', escape: 'false' });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.PostGridLoad"); }

    }
    OnExportClick() {
        try {
            var nRecords = ReportComponent.DataGrid.current.GetGridRecordsCount();
            if (nRecords == 0) {
                alert('No records to export in Excel!');
                return;
            }
            ReportComponent.CreateReportGridHeader();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EOBReport.OnExportClick"); }
    }

    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Standard Tasks"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Reports} />
                </div>

                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 auto-fill-employee search">
                            <label className="ml-2px">Search</label>
                            <input type="text" id="txtEmployeeName" onKeyDown={ReportComponent.CheckAndSearch} onChange={ReportComponent._UpdateSearchIcon} className="form-control form-control-sm" placeholder="Search by Employee Name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>

                        <div className="form-group col-lg-2 col-md-6 col-sm-6"><label className="ml-2px">Status</label>
                            <select id="ddStatus" onChange={ReportComponent._UpdateSearchIcon} className="form-control form-control-sm">
                                <option value="All" key="All">All</option>
                                <option value="Not Started" key="NotStarted">Not Started</option>
                                <option value="In Progress" key="InProgress">In Progress</option>
                                <option value="Close" key="Close">Close</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {ReportComponent.state.ProcessTypeCombo} 
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Search" type="Button" id="ReportSearchbtn" className="btn btn-primary mr-2 modalBtn" onClick={ReportComponent._OnSearchClick} ><i id="ReportFilterIcon" className="fa fa-search active SwitchTitleColor"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" id="ReportRefreshbtn" className="btn btn-light mr-2" onClick={ReportComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                            <button data-toggle="tooltip" title="Export" type="Button" id="ReportExportbtn" className="btn btn-success" onClick={ReportComponent.OnExportClick} ><i className="fa fa-file-excel-o"></i></button>
                        </div>
                    </div>
                </div>
                <div>
                    {ReportComponent.state.ReportDT}
                    <table id={"ReportDatagrid"} className={"ReportDatagrid d-none"} >
                        <thead>
                            <tr className="GrpColumnHeadingRow" id={"Report-GridHeader"}>
                                {ReportComponent.state.GridTableHeading}
                            </tr>
                        </thead>
                        <tbody>
                            {ReportComponent.state.GridRows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
const dom = document.getElementById("EOBReportMain");
ReactDOM.render(
    <ReportMain />,
    dom
);

