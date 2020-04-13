let OnboardOffboardComponent = null;
let isDialogOpened = false;
let oOnOffBoardColumnProps = null;
let oLookupColumnProps = null;
let oOnOffBoardGridProps = null;
let oPositionComboProps = null;
let oDepartmentComboProps = null;
let oEmployeeTypeComboProps = null;
let isDeleteDialogOpened = false;
let strProcess = "1";
let arrAllActualTasks = [];

var FilterObject = {
    "OData__TaskName": ""
}
class OnboardOffboardMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            OnOffBoardDialog: null,
            ProcessTypeOptions: null,
            CategoryOptions: null,
            DepartmentOptions: null,
            DeleteDialog: null,
            OnBoardGrid: null,
            DepartmentCombo: null,
            EmployeeListCount: 0,
            LicenseValidationModal: null
        }
        OnboardOffboardComponent = this;
        strProcess = OnboardOffboardComponent.getUrlParameter('Process');
        OnboardOffboardComponent.DataGrid = React.createRef();
    }

    componentDidMount() {
       
        $('#loading').hide();

        ConfigModal._onUserAdminStatusLoadCallBack = OnboardOffboardComponent.InitializeProperties;
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        $("#btnSearchOnOffboard").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        $("#btnSearchOnOffboard").attr('style', "color:" + Color + " !important");
        $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor);
        EOBConstants.SetNewThemeColor();
        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
        //OnboardOffboardComponent.GetActualTaskDetails();
    }

    InitializeProperties() {
        //Grid methods
        OnboardOffboardComponent.GetEmployeeOnboardListData();
        OnboardOffboardComponent.SetOnOffBoardColumnProps();
        OnboardOffboardComponent.setOnOffBoardGridProps();
        OnboardOffboardComponent.SetOnOffBoardComboProps();

        var Obj = OnboardOffboardComponent.SetProcessData();
        let DepartmentCombo = <ComboMain ComboProperties={oDepartmentComboProps} ></ComboMain>
        OnboardOffboardComponent.setState({ DepartmentCombo: DepartmentCombo });
        let PositionCombo = <ComboMain ComboProperties={oPositionComboProps}  ></ComboMain>
        OnboardOffboardComponent.setState({ PositionCombo: PositionCombo });
        let ECombo = <ComboMain ComboProperties={oEmployeeTypeComboProps}  ></ComboMain>
        OnboardOffboardComponent.setState({ EmployeeCombo: ECombo });
        let Grid = <DataTableMain GridProperties={oOnOffBoardGridProps} SortText="ID desc" FilterText={Obj.initialFilterText} ref={OnboardOffboardComponent.DataGrid} ></DataTableMain >

        OnboardOffboardComponent.setState({ OnBoardGrid: Grid });
        EOBConstants.SetNewThemeColor();
    }

    getUrlParameter(process) {
        process = process.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + process + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    SetOnOffBoardComboProps() {
        oPositionComboProps = new EOBShared.ComboProperties("OnOffBoardPositionFilter", "Position", "Positionlst", "", OnboardOffboardComponent._UpdateSearchIcon, "All", "", "", "OData__PositionName");
        oDepartmentComboProps = new EOBShared.ComboProperties("OnOffBoardDepartmentFilter", "Department", "Departmentlst", "", OnboardOffboardComponent._UpdateSearchIcon, "All", "", "", "OData__DepartmentName");
        oEmployeeTypeComboProps = new EOBShared.ComboProperties("OnOffBoardEmployeeTypeFilter", ConfigModal.gConfigSettings.DisplayTextEmployee + " Type", "EmployeeTypelst", "", OnboardOffboardComponent._UpdateSearchIcon, "All", "", "", "OData__EmployeeType");
    }

    SetOnOffBoardColumnProps() {
        oOnOffBoardColumnProps = [];

        let colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
        oOnOffBoardColumnProps.push(colID);

        let colName = new ColumnProperties("OData__EmployeeName", ConfigModal.gConfigSettings.DisplayTextEmployee + " Name", "", true, true, "Text", "", false, "");
        oOnOffBoardColumnProps.push(colName);
        let dtColumnHeading = "";
        if (strProcess == "1") {
            dtColumnHeading = "Date Of Joining";
        }
        else {
            dtColumnHeading = "Date Of Relieving";
        }

        let colDOJ = new ColumnProperties("DOJ", dtColumnHeading, "", true, true, "Date", "MM/DD/YYYY", false, "");
        oOnOffBoardColumnProps.push(colDOJ);

        let colPosition = new ColumnProperties("OData__Position", "Position", "", true, true, "Lookup", "", true, "_PositionName");
        oOnOffBoardColumnProps.push(colPosition);

        let colProcessType = new ColumnProperties("Process", "Process", "", false, true, "Lookup", "", true, "Title");
        oOnOffBoardColumnProps.push(colProcessType);

        let colDepartment = new ColumnProperties("OData__Department", "Department", "", true, true, "Lookup", "", true, "_DepartmentName");
        oOnOffBoardColumnProps.push(colDepartment);

        let colEmployeeType = new ColumnProperties("OData__EmployeeType", ConfigModal.gConfigSettings.DisplayTextEmployee + " Type", "", true, true, "Lookup", "", true, "_EmployeeType");
        oOnOffBoardColumnProps.push(colEmployeeType);

        let colManager = new ColumnProperties("OData__Manager", "Manager", "", true, true, "People", "", false, "");
        oOnOffBoardColumnProps.push(colManager);

        let colStatus = new ColumnProperties("OData__StatusE", "Status", "", true, true, "Text", "", false, "");
        oOnOffBoardColumnProps.push(colStatus);
    }

    setOnOffBoardGridProps() {
        // Super Admin
        let CustomColumns = [];
        CustomColumns.push("Task Status");
        if (ConfigModal.gConfigSettings.isAllowAllUsers == true) {
            oOnOffBoardGridProps = new GridProperties("gridOnOffBoard", "lstEmployeeOnboard", oOnOffBoardColumnProps, "", "", true, 10, "", true, false, false, OnboardOffboardComponent.OpenAddOnOffBoard, OnboardOffboardComponent.DeleteOnOffBoard, "", OnboardOffboardComponent.GetActualTaskDetails, false, null, null, EOBConstants.ClassNames.SwitchTitleColor, OnboardOffboardComponent.BindCustomizedGridData, false, false, CustomColumns);
        }
        else if (ConfigModal.gConfigSettings.isCurrentUserAdmin == true) {
            oOnOffBoardGridProps = new GridProperties("gridOnOffBoard", "lstEmployeeOnboard", oOnOffBoardColumnProps, "", "", true, 10, "", true, false, false, OnboardOffboardComponent.OpenAddOnOffBoard, OnboardOffboardComponent.DeleteOnOffBoard, "", OnboardOffboardComponent.GetActualTaskDetails, false, null, null, EOBConstants.ClassNames.SwitchTitleColor, OnboardOffboardComponent.BindCustomizedGridData, false, false, CustomColumns);
        }
        else {
            let isShowAddbutton = false;
            if (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) {
                for (var i = 0; i < ConfigModal.gConfigSettings.CurrentUserLevel.length; i++) {
                    if (ConfigModal.gConfigSettings.CurrentUserLevel[0].isAllowEdit) {

                        break;
                    }
                }
                for (var i = 0; i < ConfigModal.gConfigSettings.CurrentUserLevel.length; i++) {
                    if (ConfigModal.gConfigSettings.CurrentUserLevel[0].isAllowOnBoard) {
                        isShowAddbutton = true;
                        break;
                    }
                }
            }
            if (isShowAddbutton == false) {
                let divAddNewButton = document.getElementById("divAddNewButton");
                divAddNewButton.style.display = "none";
            }
            else { divAddNewButton.style.display = "block"; }
            oOnOffBoardGridProps = new GridProperties("gridOnOffBoard", "lstEmployeeOnboard", oOnOffBoardColumnProps, "", "", true, 10, "", true, false, false, OnboardOffboardComponent.OpenAddOnOffBoard, OnboardOffboardComponent.DeleteOnOffBoard, "", OnboardOffboardComponent.GetActualTaskDetails, false, null, null, EOBConstants.ClassNames.SwitchTitleColor, OnboardOffboardComponent.BindCustomizedGridData, false, false, CustomColumns);
        }
    }

    DeleteOnOffBoard(DataObject) {

        let Dialog = null;
        Dialog = <DeleteDialog ListName={EOBConstants.ListNames.EmployeeOnBoard} DeleteMessage={"Deleted " + DataObject["ID"]} DeleteFunction={OnboardOffboardComponent.DeleteOnOffBoard} HandleDataUpdate={OnboardOffboardComponent.UpdateGrid} ModalHeading={"Delete " + ConfigModal.gConfigSettings.DisplayTextEmployee} DeleteItemID={DataObject["ID"]}></DeleteDialog >

    }

    _UpdateSearchIcon() {
        var ControlsObject = [
            { ID: "#txtSearchBoxOnOffBoard", Type: "text" },
            { ID: "#OnOffBoardDepartmentFilter", Type: "combo" },
            { ID: "#OnOffBoardPositionFilter", Type: "combo" },
            { ID: "#OnOffBoardEmployeeTypeFilter", Type: "combo" },
            { ID: "#OnOffBoardStatusFilter", Type: "combo" },
        ]
        EOBShared.ShowHideFilterIcon(ControlsObject, "OnBoardFilterIcon")
    }

    UpdateGrid() {
        OnboardOffboardComponent.DataGrid.current.CreateGrid();
        OnboardOffboardComponent.setState({ OnOffBoardDialog: false });
        OnboardOffboardComponent.setState({ DeleteDialog: false });
    }

    OpenAddOnOffBoard(DataObject) {
        var strAction
        OnboardOffboardComponent.GetEmployeeOnboardListData();
        if (DataObject["Action"] != "Edit") {
            var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
            if (BKJSShared.NotNullOrUndefined(isExist)) {
                OnboardOffboardComponent.OpenValidationModal();
            }
            else {
                BKSPCustomerLicense.GetUserLicenseDetails(BKSPCustomerLicense.ProductIDs.EmployeeOnBoarding, true, OnboardOffboardComponent.OpenValidationModal);
                OnboardOffboardComponent.OpenValidationModal();
            }
            // if (BKSPCustomerLicense.IsLicenseExpired() == false && OnboardOffboardComponent.state.EmployeeListCount < isExist.Users) {
            if (BKSPCustomerLicense.IsLicenseExpired() == false) {
                var isShowModal = false;
                if (isExist.LicenseType == "Enterprise") {
                    isShowModal = true;
                }
                else if (OnboardOffboardComponent.state.EmployeeListCount < isExist.Users) {
                    isShowModal = true;
                }

                if (isShowModal) {
                    let Dialog = null;
                    var intItemID = 0;

                    if (DataObject["ID"] != null) {
                        intItemID = DataObject["ID"];
                        strAction = DataObject["Action"];
                    }
                    if (strAction == "" || strAction == undefined)
                        strAction = "Add";
                    Dialog = <OnboardOffboardModalDialog ItemId={intItemID} Action={strAction} Process={strProcess} HandleDataUpdate={OnboardOffboardComponent.UpdateGrid}></OnboardOffboardModalDialog>
                    OnboardOffboardComponent.setState({ OnOffBoardDialog: Dialog });
                    return;
                }
            }
        }
        else {
            let Dialog = null;
            var intItemID = 0;

            if (DataObject["ID"] != null) {
                intItemID = DataObject["ID"];
                strAction = DataObject["Action"];
            }

            Dialog = <OnboardOffboardModalDialog ItemId={intItemID} Action={strAction} Process={strProcess} HandleDataUpdate={OnboardOffboardComponent.UpdateGrid}></OnboardOffboardModalDialog>
            OnboardOffboardComponent.setState({ OnOffBoardDialog: Dialog });
            return;
        }
    }

    _OnResetClick() {
        $("#txtSearchBoxOnOffBoard").val("");
        $("#OnOffBoardStatusFilter").val("Open");
        $("#OnOffBoardPositionFilter").val(0);
        $("#OnOffBoardDepartmentFilter").val(0);
        $("#OnOffBoardEmployeeTypeFilter").val(0);
        $("#OnBoardFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        OnboardOffboardComponent.DataGrid.current.ClearFilter();
        var FilterText = "";
        FilterObject = [];
        if (strProcess != "") {
            FilterText = "";
            FilterText = "Process/ID eq '" + strProcess + "' and OData__StatusE eq 'Open'";
            FilterObject.push(FilterText);
        }
        OnboardOffboardComponent.DataGrid.current.CreateFilterString(FilterObject);

    }

    _OnSearchClick() {
        var FreeText = $("#txtSearchBoxOnOffBoard").val();
        var objPosition = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardPositionFilter");
        var objDepartment = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardDepartmentFilter");
        var objStatus = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardStatusFilter");
        var objEmployeeType = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardEmployeeTypeFilter");

        var FilterText = "";
        FilterObject = [];
        if (FreeText != "") {
            FilterText = "substringof('" + FreeText + "',OData__EmployeeName)";
            FilterObject.push(FilterText);
        }
        if (objStatus.Text != "") {
            if (objStatus.Text != "Onboarded" && objStatus.Text != "Offboarded") {
                FilterText = "";
                FilterText = "OData__StatusE eq '" + objStatus.Value + "'";
                FilterObject.push(FilterText);
            }
        }
        if (strProcess != "") {
            FilterText = "";
            FilterText = "Process/ID eq '" + strProcess + "'";
            FilterObject.push(FilterText);
        }
        if (objDepartment.Text != "") {
            FilterText = "";
            FilterText = "OData__DepartmentId/ID eq '" + objDepartment.Value + "'";
            FilterObject.push(FilterText);
        }
        if (objEmployeeType.Text != "") {
            FilterText = "";
            FilterText = "substringof('" + objEmployeeType.Value + "',OData__EmployeeTypeId)";
            FilterObject.push(FilterText);
        }
        if (objPosition.Text != "") {
            FilterText = "";
            FilterText = "OData__PositionId/ID eq '" + objPosition.Value + "'";
            FilterObject.push(FilterText);
        }
        OnboardOffboardComponent.DataGrid.current.CreateFilterString(FilterObject);
        $("#OnBoardFilterIcon").removeClass("hvr-pulse onsearchiconchange");
    }

    CheckAndSearch(Event) {
        if (event.keyCode == '13') {
            event.preventDefault();
            OnboardOffboardComponent._OnSearchClick();
        }
    }

    BindCustomizedGridData(GridData) {
        for (var k = 0; k < GridData.length; k++) {
            if (GridData[k]["OData__StatusE"] == "Open")
                GridData[k]["OData__StatusE"] = "In Progress";
        }
        return GridData;
    }

    SetProcessData() {
        let PageHeading = "";
        let btnAddHeadingText = "";
        let Statustxt = "";
        if (strProcess == "1") {
            PageHeading = "Onboarding";
            btnAddHeadingText = "Onboard";
            Statustxt = "Onboarded";
        }
        else {
            PageHeading = "Offboarding";
            btnAddHeadingText = "Offboard";
            Statustxt = "Offboarded";
        }
        let initialFilterText = "Process/ID eq '" + strProcess + "' and OData__StatusE eq 'Open'";
        var ProcessData = {
            PageHeading: PageHeading,
            btnAddHeadingText: btnAddHeadingText,
            initialFilterText: initialFilterText,
            Statustxt: Statustxt
        }
        return ProcessData;
    }

    SetTaskStatusColumn(arrAllActualTasks) {
        var table = document.getElementById("gridOnOffBoardData");
        var objStatus = BKJSShared.GetComboSelectedValueAndText("#OnOffBoardStatusFilter");
        var arrDataToDelete = [];
        for (var i = 1; i < table.rows.length; i++) {
            let empId = table.rows[i].cells[0].innerHTML;
            let totalCount = OnboardOffboardComponent.FilterTasksByEmployeeID(empId, arrAllActualTasks, "All");
            let inProgressCount = OnboardOffboardComponent.FilterTasksByEmployeeID(empId, arrAllActualTasks, "InProgress");
            let closeCount = totalCount - inProgressCount;
            if (closeCount != totalCount) {
                table.rows[i].cells[9].innerHTML = inProgressCount + " of " + totalCount + " Remaining";
                table.rows[i].cells[9].className = "status-light-blue";
                arrDataToDelete.push(empId);
            }
            else {
                if (totalCount != 0) {
                    table.rows[i].cells[9].innerHTML = "Completed";
                    table.rows[i].cells[9].className = "status-light-green";
                    if (strProcess == "2")
                        table.rows[i].cells[8].innerHTML = "Offboared";
                    else
                        table.rows[i].cells[8].innerHTML = "Onboared";
                }
            }
        }

        if (objStatus.Text == "Onboarded" || objStatus.Text == "Offboarded") {
            if (arrDataToDelete.length > 0) {
                for (var k = 0; k < arrDataToDelete.length; k++) {
                    for (var j = 1; j < table.rows.length; j++) {
                        if (table.rows[j].cells[0].innerHTML == arrDataToDelete[k]) {
                            // Delete row
                            //table.rows[j].className == "d-none";
                            var id = table.rows[j].cells[0].innerHTML + "Row"
                            $("#" + id).addClass("d-none");
                            break;
                        }
                    }
                }
            }
        }
        else {
            for (var a = 1; a < table.rows.length; a++) {
                var id = table.rows[a].cells[0].innerHTML + "Row";
                $("#" + id).removeClass("d-none");
            }
        }
    }



    GetActualTaskDetails() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?";
        Url += "$select=ID%2COData__EmployeeIDId%2CStatus";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnboardOffboardComponent.FillActualTaskDataInGridSuccess, OnboardOffboardComponent.FillActualTaskDataInGridFailure);
    }

    FillActualTaskDataInGridSuccess(data) {
        // Get all actual tasks and save in actualtasks array
        arrAllActualTasks = [];
        if (data.d.results.length > 0)
            arrAllActualTasks = data.d.results;
        OnboardOffboardComponent.SetTaskStatusColumn(arrAllActualTasks);
        //for (var i = 0; i < oAllRows.length; i++) {
        //    let EmployeeID = oAllRows[i]["OData__EmployeeIDId"];
        //    let arrTasksByLevelIDS = OnOffboardModalComponent.FilterTasksByEmployeeID(EmployeeID, oAllRows);
        //    //let oAllListContents = {};
        //    //oAllListContents.ActualTaskId = oAllRows[i].ID;
        //    //oAllListContents.EmployeeID = oAllRows[i]["OData__EmployeeIDId"];
        //    //oAllListContents.Status = oAllRows[i]["Status"];
        //    //arrAllActualTasks.push(oAllListContents);
        //}
    }

    FillActualTaskDataInGridFailure(data) {
        console.log("FillActualTaskDataInGrid Fail");
    }

    FilterTasksByEmployeeID(empId, oAllRows, Type) {
        let ListItemsFilterData = [];
        if (Type == "All") {
            ListItemsFilterData = oAllRows.filter(function (el) {
                return el.OData__EmployeeIDId == empId;
            });
        }
        if (Type == "InProgress") {
            ListItemsFilterData = oAllRows.filter(function (el) {
                return el.OData__EmployeeIDId == empId && el.Status != "Close";
            });
        }
        return ListItemsFilterData.length;
    }

    //OpenValidationModal() {
    //    var item = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
    //    if (BKSPCustomerLicense.IsLicenseExpired() || OnboardOffboardComponent.state.EmployeeListCount >= item.Users) {
    //        if (item.LicenseType == "Trial" || OnboardOffboardComponent.state.EmployeeListCount >= item.Users) {
    //            let Dialog = null;
    //            var strAction = "Add";
    //            Dialog = <LicenseValidationModal Action={strAction} OnCancel={OnboardOffboardComponent.HandleNoUserCheck}></LicenseValidationModal>
    //            OnboardOffboardComponent.setState({ LicenseValidationModal: Dialog });
    //            return;
    //        }
    //        else if (item.LicenseType == "Enterprise" && BKSPCustomerLicense.IsLicenseExpired()) {
    //            let Dialog = null;
    //            var strAction = "Add";
    //            Dialog = <LicenseValidationModal Action={strAction} OnCancel={OnboardOffboardComponent.HandleNoUserCheck}></LicenseValidationModal>
    //            OnboardOffboardComponent.setState({ LicenseValidationModal: Dialog });
    //            return;
    //        }
    //    }

    //}
    OpenValidationModal() {
        var item = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKSPCustomerLicense.IsLicenseExpired() || OnboardOffboardComponent.state.EmployeeListCount >= item.Users) {
            let Dialog = null;
            Dialog = <LicenseValidationModal OnCancel={OnboardOffboardComponent.HandleNoUserCheck}></LicenseValidationModal>
            OnboardOffboardComponent.setState({ LicenseValidationModal: Dialog });
            return;
        }
    }

    HandleNoUserCheck() {
        OnboardOffboardComponent.setState({ LicenseValidationModal: false });
    }

    GetEmployeeOnboardListData() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/ItemCount";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OnboardOffboardComponent._onEmployeeListSucess, OnboardOffboardComponent._onRestCallFailure);
    }

    _onEmployeeListSucess(data) {
        OnboardOffboardComponent.setState({ EmployeeListCount: data.d.ItemCount })
    }

    _onRestCallFailure(data) {
        console.log(data)
    }

    render() {
        var Obj = OnboardOffboardComponent.SetProcessData();
        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage " + ConfigModal.gConfigSettings.DisplayTextEmployee + " " + Obj.PageHeading} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Process} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input className="form-control form-control-sm" onKeyDown={OnboardOffboardComponent.CheckAndSearch} onChange={OnboardOffboardComponent._UpdateSearchIcon} type="TextBox" id="txtSearchBoxOnOffBoard" placeholder="Search by name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {OnboardOffboardComponent.state.DepartmentCombo}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {OnboardOffboardComponent.state.PositionCombo}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {OnboardOffboardComponent.state.EmployeeCombo}
                        </div>
                        <div className="form-group col-lg-1 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={OnboardOffboardComponent._UpdateSearchIcon} key="Status" id="OnOffBoardStatusFilter" defaultValue={"Open"} className="form-control form-control-sm">
                                <option value={0}>All</option>
                                <option value={"Open"}>In Progress</option>
                                <option value={Obj.Statustxt}>{Obj.Statustxt}</option>
                                <option value={"Aborted"}>Aborted</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button type="Button" id="btnSearchOnOffboard" data-toggle="tooltip" title="Search" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={OnboardOffboardComponent._OnSearchClick} ><i id="OnBoardFilterIcon" className="fa fa-search active"></i></button>
                            <button type="Button" data-toggle="tooltip" title="Filter" className="btn btn-light" onClick={OnboardOffboardComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>

                    </div>
                </div>

                <div id="divAddNewButton">
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={OnboardOffboardComponent.OpenAddOnOffBoard}><strong>+</strong> {Obj.btnAddHeadingText + " New " + ConfigModal.gConfigSettings.DisplayTextEmployee} </a>
                    </div>
                </div>

                <div>{OnboardOffboardComponent.state.OnBoardGrid}</div>
                <div>{OnboardOffboardComponent.state.OnOffBoardDialog}{OnboardOffboardComponent.state.DeleteDialog} {OnboardOffboardComponent.state.LicenseValidationModal}</div>
            </div>
        );

    }

}
const dom = document.getElementById("divOnOffBoardMain");
ReactDOM.render(
    <OnboardOffboardMain />,
    dom
);

