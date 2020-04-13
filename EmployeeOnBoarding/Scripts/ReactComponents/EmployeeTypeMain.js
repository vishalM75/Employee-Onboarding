"use strict";
let EmployeeTypeComponent = null;
let isDialogOpened = false;
let oEmployeeTypeColumnProps = null;
let oLookupColumnProps = null;
let oEmployeeTypeGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];
class EmployeeTypeMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            EmployeeTypeDialog: null,
            DeleteDialog: null,
            EmployeeTypeGrid:null
        }
        EmployeeTypeComponent = this;
        EmployeeTypeComponent.DataGrid = React.createRef();
        this.SetEmployeeTypeColumnProps();
        this.setEmployeeTypeGridProps();
    }
    componentDidMount() {
        try {
            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#EmployeeTypeSearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#EmployeeTypeSearchBtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor)
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                EmployeeTypeComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            var DT = <DataTableMain GridProperties={oEmployeeTypeGridProps} ref={EmployeeTypeComponent.DataGrid} ></DataTableMain>
            EmployeeTypeComponent.setState({ EmployeeTypeGrid: DT})
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.componentDidMount"); }
    }
    
    SetEmployeeTypeColumnProps() {
        try {
            oEmployeeTypeColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", false, "");
            oEmployeeTypeColumnProps.push(colID);

            var colEmployeeType = new ColumnProperties("OData__EmployeeType", "Employee Type", "70", true, true, "Text", false, "");
            oEmployeeTypeColumnProps.push(colEmployeeType);

            var colActive = new ColumnProperties("IsActive1", "Active", "7", true, true, "Checkbox", "");
            oEmployeeTypeColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.SetEmployeeTypeColumnProps"); }
    }

    setEmployeeTypeGridProps() {
        try {
            oEmployeeTypeGridProps = new GridProperties("gridEmployeeType", "EmployeeTypelst", oEmployeeTypeColumnProps, "", "", true, 10, "", true, true, false, EmployeeTypeComponent.OpenAddEmployeeType, EmployeeTypeComponent.DeleteEmployeeType, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.setEmployeeTypeGridProps"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                EmployeeTypeComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.CheckAndSearch"); }
    }
    DeleteEmployeeType(DataObject) {
        try {
            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.EmployeeType} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={EmployeeTypeComponent.DeleteEmployeeType} HandleDataUpdate={EmployeeTypeComponent.UpdateGrid} ModalHeading={"Delete employee type"} DeleteItemID={DataObject["ID"]}></DeleteDialog >
            EmployeeTypeComponent.setState({ DeleteDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.DeleteEmployeeType"); }
    }
    UpdateGrid() {
        try {
            EmployeeTypeComponent.DataGrid.current.CreateGrid();
            EmployeeTypeComponent.setState({ EmployeeTypeDialog: false });
            EmployeeTypeComponent.setState({ DeleteDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.UpdateGrid"); }
    }
    OpenAddEmployeeType(DataObject) {
        try {
            let Dialog = null;
            if (DataObject["ID"]) {
                //opened component 
                nEmployeeTypeModalCurrentEditItemID = DataObject["ID"];

                Dialog = <EmployeeTypeDialog isEdit={true} EditID={DataObject["ID"]} ButtonText={"Update"} ModalHeading={"Edit Employee type"} HandleDataUpdate={EmployeeTypeComponent.UpdateGrid}> </EmployeeTypeDialog>
            }
            else {
                $("#chkEmployeeTypeActive").prop('checked', true);
                Dialog = <EmployeeTypeDialog isEdit={false} ButtonText={"Save"} ModalHeading={"Add Employee type"} isActive={true} HandleDataUpdate={EmployeeTypeComponent.UpdateGrid}></EmployeeTypeDialog>
            }

            EmployeeTypeComponent.setState({ EmployeeTypeDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.OpenAddEmployeeType"); }
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain.ReturnSelectedActiveStatus"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtEmployeeTypeFilterSelect", Type: "text" },
                { ID: "#ActiveFilterSelect", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "EmployeeFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain._UpdateSearchIcon"); }
    }
    _OnResetClick() {
        try {
            $("#txtEmployeeTypeFilterSelect").val("");
            $("#ActiveFilterSelect").val(-1);
            $("#EmployeeFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            EmployeeTypeComponent.DataGrid.current.ClearFilter();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtEmployeeTypeFilterSelect").val();
            var Active = BKJSShared.GetComboSelectedValueAndText("#ActiveFilterSelect");
            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',OData__EmployeeType)";
                FilterObject.push(FilterText);
            }
            if (Active.Text != "") {
                FilterText = "";
                FilterText = "IsActive1 eq " + Active.Value;
                FilterObject.push(FilterText);
            }
            EmployeeTypeComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "EmployeeFilterIcon").removeClass("hvr-pulse onsearchiconchange"); 
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeMain._OnSearchClick"); }
    }
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage EmployeeTypes"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input onKeyDown={EmployeeTypeComponent.CheckAndSearch} onChange={EmployeeTypeComponent._UpdateSearchIcon} className="form-control form-control-sm" type="Search" id="txtEmployeeTypeFilterSelect" placeholder="Search by employee type" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={EmployeeTypeComponent._UpdateSearchIcon} id="ActiveFilterSelect" className="form-control form-control-sm">
                                <option value={-1}>All</option>
                                <option value={1}>Active</option>
                                <option value={0}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Search" id="EmployeeTypeSearchBtn" type="Button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={EmployeeTypeComponent._OnSearchClick} ><i id="EmployeeFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={EmployeeTypeComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={EmployeeTypeComponent.OpenAddEmployeeType}><strong>+</strong> Add New Employee type</a>
                    </div>
                </div>

                <div>
                    {this.state.EmployeeTypeGrid}                    
                </div>
                <div>
                    {EmployeeTypeComponent.state.EmployeeTypeDialog}
                    {EmployeeTypeComponent.state.DeleteDialog}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("EmployeeTypeMain");
ReactDOM.render(
    <EmployeeTypeMain />,
    dom
);

