
"use strict";
let CategoryComponent = null;
let isDialogOpened = false;
let oCategoryColumnProps = null;
let oLookupColumnProps = null;
let oCategoryGridProps = null;
let oProcessTypeComboProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];

class CategoryMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            CategoryDialog: null,
            DeleteDialog: null,
            CategoryGrid: null,
            ProcessTypeCombo:null
        }
        CategoryComponent = this;
        CategoryComponent.DataGrid = React.createRef();
        this.SetCategoryColumnProps();
        this.setCategoryGridProps();
        CategoryComponent.SetProcessComboProps();
    }

    SetProcessComboProps() {
        try {
            oProcessTypeComboProps = new EOBShared.ComboProperties("CatProcessTypeFilter", "Process Type", "lstProcessType", "", CategoryComponent._UpdateSearchIcon, "All", "", "form-control form-control-sm", "Title");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.SetProcessComboProps"); }
    }
    componentDidMount() {
        try {
            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#CategorySearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#CategorySearchBtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor);
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                CategoryComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            var CatGrid = <DataTableMain GridProperties={oCategoryGridProps} ref={CategoryComponent.DataGrid} ></DataTableMain>
            this.setState({ CategoryGrid: CatGrid })
            var Combo = <ComboMain ComboProperties={oProcessTypeComboProps} ComboClass={"form-control form-control-sm"} LabelClass={"ml-2px"} ></ComboMain>
            this.setState({ ProcessTypeCombo: Combo })
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.componentDidMount"); }
    }
    SetCategoryColumnProps() {
        try {
            oCategoryColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", false, "");
            oCategoryColumnProps.push(colID);

            var colCategoryName = new ColumnProperties("CategoryName1", "CategoryName", "70", true, true, "Text", false, "");
            oCategoryColumnProps.push(colCategoryName);

            var colProcessType = new ColumnProperties("Process1", "Process Type", "20", true, true, "Lookup", "", true, "Title");
            oCategoryColumnProps.push(colProcessType);

            var colActive = new ColumnProperties("IsActive1", "Active", "7", true, true, "Checkbox", "");
            oCategoryColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.SetCategoryColumnProps"); }
    }
    setCategoryGridProps() {
        try {
            oCategoryGridProps = new GridProperties("gridCategory", "Category", oCategoryColumnProps, "", "", true, 10, "", true, true, false, CategoryComponent.OpenAddCategory, CategoryComponent.DeleteCategory, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.setCategoryGridProps"); }
    }
    DeleteCategory(DataObject) {
        try {
            nDeleteModalCurrentItemID = DataObject["ID"]

            var DeleteCheckListData = [];
            var ATList = BKSPShared.SPItems.ReturnLookUpValueExistInOtherListObject(EOBConstants.ListNames.ActualTasks, DataObject[" CategoryName"], "OData__IDCategoryId", "CategoryName1", "_IDCategory")
            DeleteCheckListData.push(ATList);
            var TTList = BKSPShared.SPItems.ReturnLookUpValueExistInOtherListObject(EOBConstants.ListNames.TaskTemplateDetail, DataObject[" CategoryName"], "OData__IDCategoryId", "CategoryName1", "_IDCategory")
            DeleteCheckListData.push(TTList);
            var STList = BKSPShared.SPItems.ReturnLookUpValueExistInOtherListObject(EOBConstants.ListNames.StandardTask, DataObject[" CategoryName"], "OData__IDCategoryId", "CategoryName1", "_IDCategory")
            DeleteCheckListData.push(STList);

            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Category} DeleteFunction={CategoryComponent.DeleteCategory} HandleDataUpdate={CategoryComponent.UpdateGrid} DeleteCheckData={DeleteCheckListData} ModalHeading={"Delete category"} DeleteItemID={DataObject["ID"]}></DeleteDialog >
            CategoryComponent.setState({ DeleteDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.DeleteCategory"); }
    }
    UpdateGrid() {
        try {
            CategoryComponent.DataGrid.current.ResetGridRows();
            CategoryComponent.DataGrid.current.CreateGrid();
            CategoryComponent.setState({ CategoryDialog: false });
            CategoryComponent.setState({ DeleteDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.UpdateGrid"); }
    }
    OpenAddCategory(DataObject) {
        try {
            let Dialog = null;
            let ProcessTypeId = BKJSShared.GetComboSelectedValueAndText("#CatProcessTypeFilter");
            if (DataObject["ID"]) {
                //opened component 
                nCategoryModalCurrentEditItemID = DataObject["ID"];
                Dialog = <CategoryDialog isEdit={true} EditID={DataObject["ID"]} CategoryName={DataObject["Category Name"]} ProcessTypeId={ProcessTypeId.Value} isActive={DataObject["Active"]} ModalHeading={"Edit Category"} HandleDataUpdate={CategoryComponent.UpdateGrid} ButtonText={"Update"}></CategoryDialog>
            }
            else {

                $("#chkCategoryActive").prop('checked', true);
                Dialog = <CategoryDialog isEdit={true} ProcessTypeId={ProcessTypeId.Value} ModalHeading={"Add Category"} HandleDataUpdate={CategoryComponent.UpdateGrid} ButtonText={"Save"}></CategoryDialog>
            }
            CategoryComponent.setState({ CategoryDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.OpenAddCategory"); }
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.ReturnSelectedActiveStatus"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtCategoryFilterSelect", Type: "text" },
                { ID: "#CatProcessTypeFilter", Type: "combo" },
                { ID: "#ActiveFilterSelect", Type: "combo" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "CategoryFilterIcon")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain._UpdateSearchIcon"); }
    }
    _OnResetClick() {
        try {
            $("#txtCategoryFilterSelect").val("");
            $("#ActiveFilterSelect").val(-1);
            $("#CatProcessTypeFilter").val(0);
            $("#CategoryFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            CategoryComponent.DataGrid.current.ClearFilter();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtCategoryFilterSelect").val();
            var objProcessType = BKJSShared.GetComboSelectedValueAndText("#CatProcessTypeFilter");
            var objActive = BKJSShared.GetComboSelectedValueAndText("#ActiveFilterSelect");
            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',CategoryName1)";
                FilterObject.push(FilterText);
            }
            if (objActive.Text != "") {

                FilterText = "";
                FilterText = "IsActive1 eq '" + objActive.Value + "'";
                FilterObject.push(FilterText);
            }
            if (objProcessType.Text != "") {
                FilterText = "";
                FilterText = "Process1/ID eq '" + objProcessType.Value + "'";
                FilterObject.push(FilterText);
            }
            CategoryComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "CategoryFilterIcon").removeClass("hvr-pulse onsearchiconchange")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain._OnSearchClick"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                CategoryComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryMain.CheckAndSearch"); }
    }
    render() {

        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Categories"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input onKeyDown={CategoryComponent.CheckAndSearch} onChange={CategoryComponent._UpdateSearchIcon} className="form-control form-control-sm" type="search" id="txtCategoryFilterSelect" placeholder="Search by category name" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">                           
                            {this.state.ProcessTypeCombo}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select onChange={CategoryComponent._UpdateSearchIcon} id="ActiveFilterSelect" className="form-control form-control-sm">
                                <option key={-1} value={-1}>All</option>
                                <option key={1} value={1}>Active</option>
                                <option key={0} value={0}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Search" id="CategorySearchBtn" type="Button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={CategoryComponent._OnSearchClick} ><i id="CategoryFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={CategoryComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={CategoryComponent.OpenAddCategory}><strong>+</strong> Add New Category</a>
                    </div>
                </div>

                <div>
                    {this.state.CategoryGrid}                    
                </div>
                <div>{CategoryComponent.state.CategoryDialog}{CategoryComponent.state.DeleteDialog}</div>
            </div>
        );

    }
}
const dom = document.getElementById("CategoryMain");
ReactDOM.render(
    <CategoryMain />,
    dom
);

