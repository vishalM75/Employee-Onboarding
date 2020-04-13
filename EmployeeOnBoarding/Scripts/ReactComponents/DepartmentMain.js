"use strict";
let DepartmentComponent = null;
let isDialogOpened = false;
let oDepartmentColumnProps = null;
let oLookupColumnProps = null;
let oDepartmentGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];
class DepartmentMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            DepartmentDialog: null,
            DeleteDialog: null,
            DataTable:null
        }
        DepartmentComponent = this;
        DepartmentComponent.DataGrid = React.createRef();
        this.SetDepartmentColumnProps();
        this.setDepartmentGridProps();
    }
    componentDidMount() {
        try {
            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#DepartmentSearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#DepartmentSearchBtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor)
            BKSPShared.InitSPObject();
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                DepartmentComponent._OnResetClick();
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            var DT = <DataTableMain GridProperties={oDepartmentGridProps} ref={DepartmentComponent.DataGrid} ></DataTableMain>
            DepartmentComponent.setState({ DataTable:DT})
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.componentDidMount"); }
    }
    SetDepartmentColumnProps() {
        try {
            oDepartmentColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
            oDepartmentColumnProps.push(colID);

            var colDepartmentName = new ColumnProperties("OData__DepartmentName", "Department Name", "65", true, true, "Text", "", false, "");
            oDepartmentColumnProps.push(colDepartmentName);

            var colDepartmentName = new ColumnProperties("DepartmentAdmin", "Department Admin", "20", true, false, "People", "", false, "");
            oDepartmentColumnProps.push(colDepartmentName);

            var colActive = new ColumnProperties("IsActive1", "Active", "8", true, true, "Checkbox", "", false, "");
            oDepartmentColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.SetDepartmentColumnProps"); }
    }
    setDepartmentGridProps() {
        try {
            oDepartmentGridProps = new GridProperties("gridDepartment", "Departmentlst", oDepartmentColumnProps, "", "", true, 10, "", true, true, false, DepartmentComponent.OpenAddDepartment, DepartmentComponent.DeleteDepartment, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.setDepartmentGridProps"); }
    }
    DeleteDepartment(DataObject) {
        try {
            nDeleteModalCurrentItemID = DataObject["ID"]

            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Department} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={DepartmentComponent.DeleteDepartment} HandleDataUpdate={DepartmentComponent.UpdateGrid} ModalHeading={"Delete department"} DeleteItemID={DataObject["ID"]}></DeleteDialog >
            DepartmentComponent.setState({ DeleteDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.DeleteDepartment"); }
    }
    UpdateGrid() {
        try {
            DepartmentComponent.DataGrid.current.CreateGrid();
            DepartmentComponent.setState({ DepartmentDialog: false });
            DepartmentComponent.setState({ DeleteDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.UpdateGrid"); }
    }
    OpenAddDepartment(DataObject) {
        try {
            let Dialog = null;
            if (DataObject["ID"]) {
                //opened component 
                nDepartmentModalCurrentEditItemID = DataObject["ID"];
                Dialog = <DepartmentDialog isEdit={true} EditID={DataObject["ID"]} ButtonText={"Update"} DepartmentName={DataObject["Department Name "]} isActive={DataObject["Active"]} ModalHeading={"Edit Department"} HandleDataUpdate={DepartmentComponent.UpdateGrid}></DepartmentDialog>
            }
            else {
                $("#chkDepartmentActive").prop('checked', true);
                Dialog = <DepartmentDialog isEdit={false} ButtonText={"Save"} ModalHeading={"Add Department"} isActive={true} HandleDataUpdate={DepartmentComponent.UpdateGrid}></DepartmentDialog>
            }
            DepartmentComponent.setState({ DepartmentDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.OpenAddDepartment"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                DepartmentComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.CheckAndSearch"); }
    }
    
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtDepartmentNameFilter", Type: "text" },
                { ID: "#cmbActiveFilterSelect", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "DepartmentFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain.CheckAndSearch"); }
    }
    _OnResetClick() {
        try {
            $("#txtDepartmentNameFilter").val("");
            $("#cmbActiveFilterSelect").val("-1");
            $("#DepartmentFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            DepartmentComponent.DataGrid.current.ClearFilter();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtDepartmentNameFilter").val();
            var Active = BKJSShared.GetComboSelectedValueAndText("#cmbActiveFilterSelect");
            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {

                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',OData__DepartmentName)";
                FilterObject.push(FilterText);
            }
            if (Active.Text != "") {
                FilterText = "";
                FilterText = "IsActive1 eq " + Active.Value;
                FilterObject.push(FilterText);
            }
            DepartmentComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "DepartmentFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentMain._OnSearchClick"); }
    }
    
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Departments"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input className="form-control form-control-sm" onKeyDown={DepartmentComponent.CheckAndSearch} onChange={DepartmentComponent._UpdateSearchIcon} type="Search" id="txtDepartmentNameFilter" placeholder="Search by department name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={DepartmentComponent._UpdateSearchIcon} id="cmbActiveFilterSelect" className="form-control form-control-sm">
                                <option value={-1}>All</option>
                                <option value={1}>Active</option>
                                <option value={0}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Filter" id="DepartmentSearchBtn" type="button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={DepartmentComponent._OnSearchClick} ><i id="DepartmentFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={DepartmentComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={DepartmentComponent.OpenAddDepartment}><strong>+</strong> Add New Department</a>
                    </div>
                </div>

                <div>                    
                    {DepartmentComponent.state.DataTable}
                </div>
                <div>
                    {DepartmentComponent.state.DepartmentDialog}
                    {DepartmentComponent.state.DeleteDialog}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("DepartmentMain");
ReactDOM.render(
    <DepartmentMain />,
    dom
);

