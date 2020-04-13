"use strict";

let StandardTaskComponent = null;
let isDialogOpened = false;
let oStandardTaskColumnProps = null;
let oLookupColumnProps = null;
let oStandardTaskGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = {
    "OData__TaskName": ""

}
class StandardTaskMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            StandardTaskDialog: null,
            ProcessTypeOptions: null,
            CategoryOptions: null,
            DepartmentOptions: null,
            DeleteDialog: null,
            StandardTasksDT: null,
            LicenseValidationModal: null,
            DepartmentComponent: null,
            CategoryCombo: null,
            ProcessTypeCombo: null,
            EmployeeListCount: 0
        }

        StandardTaskComponent = this;
        StandardTaskComponent.DataGrid = React.createRef();
        StandardTaskComponent.CategoryCombo = React.createRef();
        StandardTaskComponent.SetStandardTaskColumnProps();
        StandardTaskComponent.setStandardTaskGridProps();
    }
    componentDidMount() {
        StandardTaskComponent.GetEmployeeOnboardListData();
        try {
            setTimeout(() => {
                StandardTaskComponent.InitiateGridComponent();
                StandardTaskComponent.SetComboComponents();
                EOBConstants.SetNewThemeColor();

                $('input[type=search]').on('search', function () {
                    StandardTaskComponent._OnResetClick()
                });
                $('#loading').hide();

                let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
                $("#StandardTaskSearchbtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
                $("#StandardTaskSearchbtn").attr('style', "color:" + Color + " !important");
                $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor);
                EOBConstants.SetNewThemeColor();
                $('input[type=search]').on('search', function () {
                    CategoryComponent._OnResetClick()
                });
                $(document).ready(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }, 5)

        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.componentDidMount"); }
    }
    groupBy(data, key) {
        try {
            return data.reduce(function (acc, item) {
                (acc[item[key]] = acc[item[key]] || []).push(item);
                return acc;
            }, {});
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.groupBy"); }
    }

    SetStandardTaskColumnProps() {
        try {
            oStandardTaskColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
            oStandardTaskColumnProps.push(colID);

            var colStandardTaskName = new ColumnProperties("OData__TaskName", "Task Name", "25", true, true, "Text", "", false, "");
            oStandardTaskColumnProps.push(colStandardTaskName);

            var colTaskLevel = new ColumnProperties("TaskLevel", "Task Level", "", true, true, "Lookup", "", true, "Title", null, true);
            oStandardTaskColumnProps.push(colTaskLevel);

            var colProcessType = new ColumnProperties("ProcessType", "Process Type", "", true, true, "Lookup", "", true, "Title");
            oStandardTaskColumnProps.push(colProcessType);

            var colTaskType = new ColumnProperties("TaskType1", "Task Type", "", false, true, "Text", "", false, "");
            oStandardTaskColumnProps.push(colTaskType);

            var colTaskFlow = new ColumnProperties("TaskFlow", "Task Flow", "", false, true, "Text", "", false, "");
            oStandardTaskColumnProps.push(colTaskFlow);

            var colAssgnTo = new ColumnProperties("OData__AssignedTo", "Assigned To", "", true, true, "People", "", false, "");
            oStandardTaskColumnProps.push(colAssgnTo);

            var colTaskDepartment = new ColumnProperties("TaskDepartment", "Task Department", "", true, true, "Lookup", "", true, "OData__DepartmentName");
            oStandardTaskColumnProps.push(colTaskDepartment);

            var colResolutionDays = new ColumnProperties("OData__ResolutionDays", "Resolution Days", "", true, true, "Number", "", false, "");
            oStandardTaskColumnProps.push(colResolutionDays);

            var colCategory = new ColumnProperties("OData__IDCategory", "Category", "", true, true, "Lookup", "", true, "CategoryName1");
            oStandardTaskColumnProps.push(colCategory);

            var colActive = new ColumnProperties("IsActive1", "Active", "8", true, true, "Checkbox", "");
            oStandardTaskColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.SetStandardTaskColumnProps"); }

    }
    setStandardTaskGridProps() {
        try {
            oStandardTaskGridProps = new GridProperties("gridStandardTask", "StandardTask", oStandardTaskColumnProps, "", "", true, 10, "", true, true, false, StandardTaskComponent.OpenAddStandardTask, StandardTaskComponent.DeleteStandardTask, "", "", false, false, "", EOBConstants.ClassNames.SwitchTitleColor, StandardTaskComponent.ModifyData);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.setStandardTaskGridProps"); }
    }
    ModifyData(DataTobeModify) {
        try {
            return DataTobeModify;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.ModifyData"); }
    }
    DeleteStandardTask(DataObject) {
        try {
            //nDeleteModalCurrentItemID = DataObject["ID"]
            //if (!isDeleteDialogOpened) {
            //   isDeleteDialogOpened = true;
            let Dialog = null;

            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.StandardTask} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={StandardTaskComponent.DeleteStandardTask} HandleDataUpdate={StandardTaskComponent.UpdateGrid} ModalHeading={"Delete standard task"} DeleteItemID={DataObject["ID"]}></DeleteDialog >

            StandardTaskComponent.setState({ DeleteDialog: Dialog });
            //}
            //else {
            //    var modal = document.getElementById("DeleteDialog");
            //    modal.style.display = "block";
            //    $("#DeleteModalBtn").attr('style', "background-color:" + gThemeColorHexCode + " !important");
            //}
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.DeleteStandardTask"); }
    }
    UpdateGrid() {
        try {
            StandardTaskComponent.DataGrid.current.ResetGridRows();
            StandardTaskComponent.DataGrid.current.CreateGrid();
            StandardTaskComponent.setState({ StandardTaskDialog: false });
            StandardTaskComponent.setState({ DeleteDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.UpdateGrid"); }
    }

    OpenAddStandardTask(DataObject) {
        StandardTaskComponent.GetEmployeeOnboardListData();
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));

        if (BKJSShared.NotNullOrUndefined(isExist)) {
            StandardTaskComponent.OpenValidationModal();
        }
        else {
            BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, StandardTaskComponent.OpenValidationModal);
            //StandardTaskComponent.OpenValidationModal();
        }
        if (BKSPCustomerLicense.IsLicenseExpired() == false) {
            var isShowModal = false;
            if (isExist.LicenseType == "Enterprise") {
                isShowModal = true;
            }
            else if (StandardTaskComponent.state.EmployeeListCount < isExist.Users) {
                isShowModal = true;
            }
            try {
                if (isShowModal) {
                    $('#loading').show();
                    let Dialog = null;
                    var intItemID = 0;

                    var strAction
                    if (DataObject["ID"] != null) {
                        intItemID = DataObject["ID"];
                        strAction = DataObject["Action"];
                    }
                    else {
                        strAction = "Add";
                    }

                    Dialog = <StandardTaskDialog Action={strAction} ItemId={intItemID} HandleDataUpdate={StandardTaskComponent.UpdateGrid}></StandardTaskDialog>
                    StandardTaskComponent.setState({ StandardTaskDialog: Dialog });
                    return;
                }

            }
            catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.OpenAddStandardTask"); }
        }
    }

    OpenValidationModal() {
        var item = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKSPCustomerLicense.IsLicenseExpired() || StandardTaskComponent.state.EmployeeListCount >= item.Users) {
            let Dialog = null;
            Dialog = <LicenseValidationModal OnCancel={StandardTaskComponent.HandleNoUserCheck}></LicenseValidationModal>
            StandardTaskComponent.setState({ LicenseValidationModal: Dialog });
            return;
        }


    }
    GetEmployeeOnboardListData() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/ItemCount";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, StandardTaskComponent._onEmployeeListSucess, StandardTaskComponent._onRestCallFailure);
    }
    _onEmployeeListSucess(data) {
        StandardTaskComponent.setState({ EmployeeListCount: data.d.ItemCount })
    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    HandleNoUserCheck() {
        StandardTaskComponent.setState({ LicenseValidationModal: false });
    }
    _UpdateSearchIcon(event) {
        try {
            var ControlsObject = [
                { ID: "#StandardTaskGridSearchTextBox", Type: "text" },
                { ID: "#ActiveFilterSelect", Type: "combo" },
                { ID: "#STProcessTypeFilter", Type: "combo" },
                { ID: "#STDepartmentFilter", Type: "combo" },
                { ID: "#STCategoryFilter", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "StandardTaskFilterIcon")

            var strFilterString = "";
            if (event.target.id == "STProcessTypeFilter") {
                if (event.target.value == "0") {
                    strFilterString = "Process1/ID eq '1' or Process1/ID eq'2' and (IsActive1 eq '1')";
                    StandardTaskComponent.CategoryCombo.current.ResetFilter(strFilterString);
                }
                else if (event.target.value == "1") {
                    strFilterString = "Process1/ID eq '1' and (IsActive1 eq '1')";
                    StandardTaskComponent.CategoryCombo.current.ResetFilter(strFilterString);
                }
                else if (event.target.value == "2") {
                    strFilterString = "Process1/ID eq '2' and (IsActive1 eq '1')";
                    StandardTaskComponent.CategoryCombo.current.ResetFilter(strFilterString);
                }
            }
          
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain._UpdateSearchIcon"); }
    }
    _OnResetClick() {
        try {
            $("#StandardTaskGridSearchTextBox").val("");
            $("#ActiveFilterSelect").val(-1);
            $("#STProcessTypeFilter").val(0);
            $("#STDepartmentFilter").val(0);
            //$("#STCategoryFilter").val(0);
            var strFilterString = "Process1/ID eq '1' or Process1/ID eq'2'";
            StandardTaskComponent.CategoryCombo.current.ResetFilter(strFilterString);

            $("#StandardTaskFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            StandardTaskComponent.DataGrid.current.ClearFilter();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#StandardTaskGridSearchTextBox").val();
            var objProcessType = BKJSShared.GetComboSelectedValueAndText("#STProcessTypeFilter");
            var objDepartment = BKJSShared.GetComboSelectedValueAndText("#STDepartmentFilter");
            var objActive = BKJSShared.GetComboSelectedValueAndText("#ActiveFilterSelect");
            var objCategory = BKJSShared.GetComboSelectedValueAndText("#STCategoryFilter");

            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',OData__TaskName)";
                FilterObject.push(FilterText);
            }
            if (objActive.Text != "") {
                FilterText = "";
                FilterText = "IsActive1 eq " + objActive.Value;
                FilterObject.push(FilterText);
            }
            if (objProcessType.Text != "") {
                FilterText = "";
                FilterText = "ProcessTypeId/ID eq '" + objProcessType.Value + "'";
                FilterObject.push(FilterText);
            }
            if (objDepartment.Text != "") {
                FilterText = "";
                FilterText = "TaskDepartmentId/ID eq '" + objDepartment.Value + "'";
                FilterObject.push(FilterText);
            }
            if (objCategory.Text != "") {
                FilterText = "";
                FilterText = "OData__IDCategory/ID eq '" + objProcessType.Value + "'";
                FilterObject.push(FilterText);
            }

            StandardTaskComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "StandardTaskFilterIcon").removeClass("hvr-pulse onsearchiconchange");

        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain._OnSearchClick"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                StandardTaskComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.CheckAndSearch"); }
    }
    InitiateGridComponent() {
        try {
            let StandardTasksDataTable = <DataTableMain GridProperties={oStandardTaskGridProps} SortText="ID desc" ref={StandardTaskComponent.DataGrid} ></DataTableMain>
            StandardTaskComponent.setState({ StandardTasksDT: StandardTasksDataTable });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "StandardTaskMain.InitiateGridComponent"); }
    }
    SetComboComponents() {
        var ActiveFilterString = "IsActive1 eq '1'";
        var oDepartmentComboProps = new EOBShared.ComboProperties("STDepartmentFilter", "Department", "Departmentlst", "", StandardTaskComponent._UpdateSearchIcon, "All", "", "", "OData__DepartmentName", "", ActiveFilterString);
        var varDepartmentComponent = <ComboMain ComboProperties={oDepartmentComboProps} ></ComboMain>
        StandardTaskComponent.setState({ DepartmentComponent: varDepartmentComponent });

        var strFilterString = "Process1/ID eq '1' or Process1/ID eq'2' and (IsActive1 eq '1')";
        var oCategoryComboProps = new EOBShared.ComboProperties("STCategoryFilter", "Category", "Category", "", StandardTaskComponent._UpdateSearchIcon, "All", "", "", "CategoryName1", "", strFilterString);
        var varCategoryComboProps = <ComboMain ComboProperties={oCategoryComboProps} ref={StandardTaskComponent.CategoryCombo} ></ComboMain>
        StandardTaskComponent.setState({ CategoryCombo: varCategoryComboProps });

        var oProcessTypeComboProps = new EOBShared.ComboProperties("STProcessTypeFilter", "Process Type", "lstProcessType", "", StandardTaskComponent._UpdateSearchIcon, "All", "", "", "Title", "");
        var varProcessTypeCombo = <ComboMain ComboProperties={oProcessTypeComboProps} ></ComboMain>
        StandardTaskComponent.setState({ ProcessTypeCombo: varProcessTypeCombo });
    }
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Standard Tasks"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input onKeyDown={StandardTaskComponent.CheckAndSearch} className="form-control form-control-sm" onChange={StandardTaskComponent._UpdateSearchIcon} type="Search" id="StandardTaskGridSearchTextBox" placeholder="Search By Task Name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {StandardTaskComponent.state.DepartmentComponent}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {StandardTaskComponent.state.ProcessTypeCombo}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {StandardTaskComponent.state.CategoryCombo}
                        </div>

                        <div className="form-group col-lg-1 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={StandardTaskComponent._UpdateSearchIcon} id="ActiveFilterSelect" className="form-control form-control-sm">
                                <option value="-1">All</option>
                                <option value={1}>Active</option>
                                <option value={0}>InActive</option>
                            </select>
                        </div>

                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button type="Button" data-toggle="tooltip" title="Search" id="StandardTaskSearchbtn" className="btn btn-primary mr-2 modalBtn" onClick={StandardTaskComponent._OnSearchClick} ><i id="StandardTaskFilterIcon" className="fa fa-search active SwitchTitleColor"></i></button>
                            <button type="Button" data-toggle="tooltip" title="Reset" id="StandardTaskRefreshbtn" className="btn btn-light" onClick={StandardTaskComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>

                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={StandardTaskComponent.OpenAddStandardTask}><strong>+</strong> Add New Standard Task</a>
                    </div>
                </div>

                <div>
                    {StandardTaskComponent.state.StandardTasksDT}
                </div>
                <div>
                    {StandardTaskComponent.state.StandardTaskDialog}
                    {StandardTaskComponent.state.DeleteDialog}
                    {StandardTaskComponent.state.LicenseValidationModal}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("StandardTaskMain");
ReactDOM.render(
    <StandardTaskMain />,
    dom
);

