"use strict";
let LevelComponent = null;
let isDialogOpened = false;
let oLevelColumnProps = null;
let oLookupColumnProps = null;
let oLevelGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];
class LevelMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            LevelDialog: null,
            DeleteDialog: null,
            DataTable:null
        }
        LevelComponent = this;
        LevelComponent.DataGrid = React.createRef();
        this.SetLevelColumnProps();
        this.setLevelGridProps();
    }
    componentWillMount() {

    }
    componentDidMount() {
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        $("#LevelSearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        $("#LevelSearchBtn").attr('style', "color:" + Color + " !important");
        $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor)
        EOBConstants.SetNewThemeColor();
        $('input[type=search]').on('search', function () {
            LevelComponent._OnResetClick()
        });
        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
        var DT = <DataTableMain GridProperties={oLevelGridProps} ref={LevelComponent.DataGrid} ></DataTableMain>
        LevelComponent.setState({ DataTable:DT})
    }
    SetLevelColumnProps() {
        oLevelColumnProps = [];

        var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
        oLevelColumnProps.push(colID);

        var colLevel = new ColumnProperties("Title", "Level Name", "65", true, true, "Text", "", false, "");
        oLevelColumnProps.push(colLevel);

        var colLevel = new ColumnProperties("ResponsibleUsers", "Level Admin", "20", true, false, "People", "", false, "");
        oLevelColumnProps.push(colLevel);

        var colActive = new ColumnProperties("IsActive1", "Active", "8", true, true, "Checkbox", "", false, "");
        oLevelColumnProps.push(colActive);
    }
    setLevelGridProps() {
        oLevelGridProps = new GridProperties("gridLevel", "Levellst", oLevelColumnProps, "", "", true, 10, "", true, true, false, LevelComponent.OpenAddLevel, LevelComponent.DeleteLevel, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
    }
    DeleteLevel(DataObject) {
       
            let Dialog = null;
        Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Level} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={LevelComponent.DeleteLevel} HandleDataUpdate={LevelComponent.UpdateGrid} ModalHeading={"Delete level"} DeleteItemID={DataObject["ID"]}></DeleteDialog >
            LevelComponent.setState({ DeleteDialog: Dialog });
      
            
    }
    UpdateGrid() {
        LevelComponent.DataGrid.current.CreateGrid();
        LevelComponent.setState({ LevelDialog: false });
        LevelComponent.setState({ DeleteDialog: false });
    }
    OpenAddLevel(DataObject) {
        let Dialog = null;
        if (DataObject["ID"]) {
            //opened component 
            nLevelModalCurrentEditItemID = DataObject["ID"];
            Dialog = <LevelDialog isEdit={true} EditID={DataObject["ID"]} ButtonText={"Update"} ModalHeading={"Edit Level"} HandleDataUpdate={LevelComponent.UpdateGrid}></LevelDialog>
        }
        else {
            
            Dialog = <LevelDialog isEdit={false} ButtonText={"Save"} ModalHeading={"Add Level"} HandleDataUpdate={LevelComponent.UpdateGrid}></LevelDialog>
        }       
        LevelComponent.setState({ LevelDialog: Dialog });

    }
    ReturnSelectedActiveStatus() {
        let SelectedActive = document.getElementById("cmbActiveFilterSelect");
        SelectedActive = SelectedActive.value;
        var nCurrentActiveID = 0;
        nCurrentActiveID = $("#cmbActiveFilterSelect").children(":selected").attr("id");
        nCurrentActiveID = nCurrentActiveID.replace(SelectedActive, "");
        nCurrentActiveID = parseInt(nCurrentActiveID);

        let ActiveObject = {}
        ActiveObject["Id"] = nCurrentActiveID
        ActiveObject["Value"] = SelectedActive
        return ActiveObject;
    }
    CheckAndSearch(Event) {
        if (event.keyCode == '13') {
            event.preventDefault();
            LevelComponent._OnSearchClick();
        }
    }
    _OnResetClick() {
        $("#txtLevelFilter").val("");
        $("#cmbActiveFilterSelect").val("-1");
        $("#LevelFilterIcon").removeClass("hvr-pulse onsearchiconchange")
        LevelComponent.DataGrid.current.ClearFilter();
    }
    _OnSearchClick() {
        var FreeText = $("#txtLevelFilter").val();
        var Active = BKJSShared.GetComboSelectedValueAndText("#cmbActiveFilterSelect");
        var FilterText = "";
        FilterObject = [];
        if (FreeText != "") {

            FilterText = "substringof('" + encodeURIComponent(FreeText) + "',Title)";
            FilterObject.push(FilterText);
        }
        if (Active.Text != "") {
            FilterText = "";
            FilterText = "IsActive1 eq " + Active.Value;
            FilterObject.push(FilterText);
        }
        LevelComponent.DataGrid.current.CreateFilterString(FilterObject);
        $("#" + "LevelFilterIcon").removeClass("hvr-pulse onsearchiconchange");
    }
    _UpdateSearchIcon() {
        var ControlsObject = [
            { ID: "#txtLevelFilter", Type: "text" },
            { ID: "#cmbActiveFilterSelect", Type: "combo" }
        ]
        EOBShared.ShowHideFilterIcon(ControlsObject, "LevelFilterIcon")
    }
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Levels"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input onKeyDown={LevelComponent.CheckAndSearch} onChange={LevelComponent._UpdateSearchIcon} className="form-control form-control-sm" type="Search" id="txtLevelFilter" placeholder="Search by level name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={LevelComponent._UpdateSearchIcon} id="cmbActiveFilterSelect" className="form-control form-control-sm">
                                <option value={-1}>All</option>
                                <option value={1}>Active</option>
                                <option value={0}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Filter" id="LevelSearchBtn" type="Button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={LevelComponent._OnSearchClick} ><i id="LevelFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={LevelComponent._OnResetClick} ><i id="LevelFilterIcon" className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={LevelComponent.OpenAddLevel}><strong>+</strong> Add New Level</a>
                    </div>
                </div>

                <div>                    
                    {LevelComponent.state.DataTable}
                </div>
                <div>
                    {LevelComponent.state.LevelDialog}
                    {LevelComponent.state.DeleteDialog}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("LevelMain");
ReactDOM.render(
    <LevelMain />,
    dom
);

