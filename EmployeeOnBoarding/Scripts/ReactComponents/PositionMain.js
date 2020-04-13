"use strict";
let PositionComponent = null;
let isDialogOpened = false;
let oPositionColumnProps = null;
let oLookupColumnProps = null;
let oPositionGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];
class PositionMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            PositionDialog: null,
            DeleteDialog: null,
            DataGrid:null
        }
        PositionComponent = this;
        PositionComponent.DataGrid = React.createRef();
        this.SetPositionColumnProps();
        this.setPositionGridProps();
    }

    componentDidMount() {      
        try {
            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#PositionSearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#PositionSearchBtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor)
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                PositionComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            var DataTable = <DataTableMain GridProperties={oPositionGridProps} ref={PositionComponent.DataGrid} ></DataTableMain>
            PositionComponent.setState({ DataGrid: DataTable})
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.componentDidMount"); }
    }

    SetPositionColumnProps() {
        try {
            oPositionColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", false, "");
            oPositionColumnProps.push(colID);

            var colPosition = new ColumnProperties("OData__PositionName", "Position", "70", true, true, "Text", false, "");
            oPositionColumnProps.push(colPosition);

            var colActive = new ColumnProperties("IsActive1", "Active", "7", true, true, "Checkbox", "");
            oPositionColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.SetPositionColumnProps"); }
    }

    setPositionGridProps() {
        try {
            oPositionGridProps = new GridProperties("gridPosition", "Positionlst", oPositionColumnProps, "", "", true, 10, "", true, true, false, PositionComponent.OpenAddPosition, PositionComponent.DeletePosition, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.setPositionGridProps"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                PositionComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.CheckAndSearch"); }
    }
    DeletePosition(DataObject) {
        try {
            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Position} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={PositionComponent.DeletePosition} HandleDataUpdate={PositionComponent.UpdateGrid} ModalHeading={"Delete position"} DeleteItemID={DataObject["ID"]}></DeleteDialog >
            PositionComponent.setState({ DeleteDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.DeletePosition"); }
    }
    UpdateGrid() {
        try {
            PositionComponent.DataGrid.current.CreateGrid();
            PositionComponent.setState({ PositionDialog: false });
            PositionComponent.setState({ DeleteDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.UpdateGrid"); }
    }
    OpenAddPosition(DataObject) {
        try {
            let Dialog = null;
            if (DataObject["ID"]) {
                //opened component 
                nPositionModalCurrentEditItemID = DataObject["ID"];
                Dialog = <PositionDialog isEdit={true} EditID={DataObject["ID"]} ButtonText={"Update"} ModalHeading={"Edit Position"} HandleDataUpdate={PositionComponent.UpdateGrid}></PositionDialog>
            }
            else {
                $("#chkPositionActive").prop('checked', true);
                Dialog = <PositionDialog isEdit={false} ButtonText={"Save"} ModalHeading={"Add Position"} isActive={true} HandleDataUpdate={PositionComponent.UpdateGrid}></PositionDialog>
            }

            PositionComponent.setState({ PositionDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain.OpenAddPosition"); }
    }
    _OnResetClick() {
        try {
            $("#txtPositionFilterSelect").val("");
            $("#ActiveFilterSelect").val(-1);
            $("#PositionFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            PositionComponent.DataGrid.current.ClearFilter();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtPositionFilterSelect").val();
            var Active = BKJSShared.GetComboSelectedValueAndText("#ActiveFilterSelect");
            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',OData__PositionName)";
                FilterObject.push(FilterText);
            }
            if (Active.Text != "") {
                FilterText = "";
                FilterText = "IsActive1 eq " + Active.Value;
                FilterObject.push(FilterText);
            }
            PositionComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "PositionFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain._OnSearchClick"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtPositionFilterSelect", Type: "text" },
                { ID: "#ActiveFilterSelect", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "PositionFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionMain._UpdateSearchIcon"); }
    }
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Positions"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input onKeyDown={PositionComponent.CheckAndSearch} onChange={PositionComponent._UpdateSearchIcon} className="form-control form-control-sm" type="Search" id="txtPositionFilterSelect" placeholder="Search by position name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>

                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={PositionComponent._UpdateSearchIcon} id="ActiveFilterSelect" className="form-control form-control-sm">
                                <option value={-1}>All</option>
                                <option value={1}>Active</option>
                                <option value={0}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Filter" id="PositionSearchBtn" type="Button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={PositionComponent._OnSearchClick} ><i id="PositionFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={PositionComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={PositionComponent.OpenAddPosition}><strong>+</strong> Add New Position</a>
                    </div>
                </div>

                <div>                    
                    {PositionComponent.state.DataGrid}
                </div>
                <div>
                    {PositionComponent.state.PositionDialog}
                    {PositionComponent.state.DeleteDialog}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("PositionMain");
ReactDOM.render(
    <PositionMain />,
    dom
);

