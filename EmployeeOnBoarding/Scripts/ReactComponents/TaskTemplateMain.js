"use strict";
let TaskTemplateComponent = null;
let isDialogOpened = false;
let oTaskTemplateColumnProps = null;
let oLookupColumnProps = null;
let oTaskTemplateGridProps = null;
let isDeleteDialogOpened = false;
let FilterObject = [];
class TaskTemplateMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            TaskTemplateDialog: null,
            DeleteDialog: null,
            ProcessTypeCombo: null,
            DataTable:null
        }
        TaskTemplateComponent = this;
        TaskTemplateComponent.DataGrid = React.createRef();
        TaskTemplateComponent.SetTaskTemplateColumnProps();
        TaskTemplateComponent.setTaskTemplateGridProps();
      
    }
    componentWillMount() {
        
    }
    componentDidMount() {
        setTimeout(() => {
            $('#loading').hide();
            EOBConstants.SetNewThemeColor();
            TaskTemplateComponent.SetCombo();

            $('input[type=search]').on('search', function () {
                TaskTemplateComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            var DT = <DataTableMain GridProperties={oTaskTemplateGridProps} ref={TaskTemplateComponent.DataGrid}></DataTableMain>
            TaskTemplateComponent.setState({ DataTable: DT })
        }, 5)
       
    }

    SetTaskTemplateColumnProps() {
        oTaskTemplateColumnProps = [];

        var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", false, "");
        oTaskTemplateColumnProps.push(colID);

        var colTaskTemplateName = new ColumnProperties("OData__TaskTemplateName", "Template Name", "80", true, true, "Text", false, "");
        oTaskTemplateColumnProps.push(colTaskTemplateName);

        let colProcessType = new ColumnProperties("ProcessType", "Process", "10", true, true, "Lookup", "", true, "Title");
        oTaskTemplateColumnProps.push(colProcessType);

        var colActive = new ColumnProperties("IsActive1", "Active", "5", true, true, "Checkbox", "");
        oTaskTemplateColumnProps.push(colActive);
    }

    setTaskTemplateGridProps() {
        oTaskTemplateGridProps = new GridProperties("gridTaskTemplate", "TaskTemplateMaster", oTaskTemplateColumnProps, "", "", true, 5, "", true, true, false, TaskTemplateComponent.OpenAddTaskTemplate, "", "", null, null, null,null, EOBConstants.ClassNames.SwitchTitleColor);
    }

    _UpdateSearchIcon() {
        var ControlsObject = [
            { ID: "#TaskTemplateGridSearchTextBox", Type: "text" },
            { ID: "#ActiveFilterSelect", Type: "combo" },
            { ID: "#TaskTemplateProcessTypeFilter", Type: "combo" }
        ];
        EOBShared.ShowHideFilterIcon(ControlsObject, "TaskTemplateFilterIcon")
    }

    UpdateGrid() {
        TaskTemplateComponent.DataGrid.current.CreateGrid();
        TaskTemplateComponent.setState({ TaskTemplateDialog: false });
    }
    OpenAddTaskTemplate(DataObject) {
        if (DataObject["ID"]) {
            //opened component 
            nTaskTemplateModalCurrentEditItemID = DataObject["ID"];
            $("#TaskTemplateAddSaveBtn").val("Edit")
            $("#TaskTemplateTxtBox").val(DataObject["Task Template Name "])
            $("#TaskTemplateHeadingDiv").text("Edit Task Template")
            $("#TaskTemplateActiveChk").prop('checked', DataObject["Active "]);
        }
        else {
            $("#TaskTemplateHeadingDiv").text("Add Task Template")
            $("#TaskTemplateActiveChk").prop('checked', true);
        }
        //if (!isDialogOpened) {
        isDialogOpened = true;
        let Dialog = null;
        if (DataObject["ID"]) {
            Dialog = <TaskTemplateDialog isEdit={true} TaskTemplateName={DataObject["Task Template Name"]} isActive={DataObject["Active"]} ItemId={nTaskTemplateModalCurrentEditItemID} ModalHeading={"Edit Task Template"} HandleDataUpdate={TaskTemplateComponent.UpdateGrid}></TaskTemplateDialog>
        }
        else {

            Dialog = <TaskTemplateDialog isEdit={false} ModalHeading={"Add Task Template"} isActive={true} HandleDataUpdate={TaskTemplateComponent.UpdateGrid}></TaskTemplateDialog>
        }

        TaskTemplateComponent.setState({ TaskTemplateDialog: Dialog });
        //}
        //else {
        //    var modal = document.getElementById("TaskTemplateDialog");
        //    modal.style.display = "block";
        //    $("#TaskTemplateAddSaveBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        //}
    }

    ReturnSelectedActiveStatus() {
        let SelectedActive = document.getElementById("ActiveFilterSelect");
        SelectedActive = SelectedActive.value;
        var nCurrentActiveID = 0;
        nCurrentActiveID = $("#ActiveFilterSelect").children(":selected").attr("id");
        nCurrentActiveID = nCurrentActiveID.replace(SelectedActive, "");
        nCurrentActiveID = parseInt(nCurrentActiveID);

        let ActiveObject = {}
        ActiveObject["Id"] = nCurrentActiveID
        ActiveObject["value"] = SelectedActive
        return ActiveObject;
    }
    _OnResetClick() {
        $("#TaskTemplateGridSearchTextBox").val("");
        $("#ActiveFilterSelect").val("All");
        $("#TaskTemplateFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        $("#TaskTemplateProcessTypeFilter").val(0);
        TaskTemplateComponent.DataGrid.current.ClearFilter();
    }
    _OnSearchClick() {
        var FreeText = $("#TaskTemplateGridSearchTextBox").val();
        var Active = TaskTemplateComponent.ReturnSelectedActiveStatus();
        var objProcessType = BKJSShared.GetComboSelectedValueAndText("#TaskTemplateProcessTypeFilter");
        var FilterText = "";
        FilterObject = [];
        if (FreeText != "") {
            FilterText = "substringof('" + FreeText + "',OData__TaskTemplateName)";
            FilterObject.push(FilterText);
        }
        if (Active.value != "All") {
            FilterText = "";
            FilterText = "IsActive1 eq " + Active.Id;
            FilterObject.push(FilterText);
        }
        if (objProcessType.Text != "") {
            FilterText = "";
            FilterText = "ProcessTypeId/ID eq '" + objProcessType.Value + "'";
            FilterObject.push(FilterText);
        }
        TaskTemplateComponent.DataGrid.current.CreateFilterString(FilterObject);
        $("#" + "TaskTemplateFilterIcon").removeClass("hvr-pulse onsearchiconchange");
    }
    CheckAndSearch(Event) {
        if (event.keyCode == '13') {
            event.preventDefault();
            TaskTemplateComponent._OnSearchClick();
        }
    }
    SetCombo() {
        var oProcessTypeComboProps = new EOBShared.ComboProperties("TaskTemplateProcessTypeFilter", "Process Type", "lstProcessType", "", TaskTemplateComponent._UpdateSearchIcon, "All", "", "", "Title", "");
        var varProcess=<ComboMain ComboProperties={oProcessTypeComboProps}  ></ComboMain>
        TaskTemplateComponent.setState({ ProcessTypeCombo: varProcess });
    }
    render() {
        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Manage Task Template"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
                <div className="filter-main">
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input className="form-control form-control-sm" type="Search" id="TaskTemplateGridSearchTextBox" onKeyDown={TaskTemplateComponent.CheckAndSearch} placeholder="Search by template name" onChange={TaskTemplateComponent._UpdateSearchIcon}/>
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            <label className="ml-2px">Status</label>
                            <select id="ActiveFilterSelect" className="form-control form-control-sm" onChange={TaskTemplateComponent._UpdateSearchIcon}>
                                <option id={"ActiveAll"}>All</option>
                                <option id={"Active1"}>Active</option>
                                <option id={"InActive0"}>InActive</option>
                            </select>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6">
                            {TaskTemplateComponent.state.ProcessTypeCombo}
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button type="Button" data-toggle="tooltip" title="Search" id="TaskTemplateSearchBtn" defaultValue="Search" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={TaskTemplateComponent._OnSearchClick}><i id="TaskTemplateFilterIcon" className="fa fa-search active"></i></button>
                            <button type="Button" data-toggle="tooltip" title="Reset" id="TaskTemplateRefresh" className="btn btn-light" onClick={TaskTemplateComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>

                    </div>
                </div>

                <div>
                    <div className="add-new-main">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={TaskTemplateComponent.OpenAddTaskTemplate}><strong>+</strong> Add New Template</a>
                    </div>
                </div>

                <div>                    
                    {TaskTemplateComponent.state.DataTable}
                </div>
                <div>
                    {TaskTemplateComponent.state.TaskTemplateDialog}
                    {TaskTemplateComponent.state.DeleteDialog}
                </div>
            </div>
        );

    }
}
const dom = document.getElementById("TaskTemplateMain");
ReactDOM.render(
    <TaskTemplateMain />,
    dom
);

