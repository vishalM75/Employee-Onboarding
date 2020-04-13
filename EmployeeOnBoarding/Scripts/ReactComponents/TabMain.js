"use strict";
let TabMainComponent = null;
let arrLevelIds = [];
let sModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nStandardTaskModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
let oGridData = null;
let oDependentTasks = [];
let GridRows = [];
let DataRows = [];
let LevelTitles = [];
let TaskTemplateDetailTaskIds = [];
let TaskTemplateDetailIds = [];
let taskProp = [];
class TabMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Action: this.props.Action,
            ItemId: this.props.ItemId,
            UpdateData: this.props.HandleDataUpdate,
            isActive: this.props.isActive,
            ProcessTypeOptions: null,
            LevelTabs: null,
            LevelIDs: null,
            GridRows: null,
            rGridRows: null,
            sFilterText: "",
            gridHeader: null
        };
        TabMainComponent = this;
    }

    componentWillMount() {
        if (TabMainComponent.props.Action == "Edit") {
            TabMainComponent.GetTaskTemplateDetailTasks();
        }
    }

    componentDidMount() {
        TabMainComponent.GetLevels();
    }

    GetLevels() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TabMainComponent._FillLevels, TabMainComponent._onLevelDataGetFailure)
    }

    _onLevelDataGetFailure(data) {
        console.log("Failed in getting process items.");
    }

    _FillLevels(data) {
        var LevelTabs = [];
        var LevelIDs = [];
        LevelTitles = [];
        for (var k = 0; k < data.d.results.length; k++) {
            let LevelID = data.d.results[k]["ID"];
            let LevelTitle = data.d.results[k]["Title"];
            let activeClassName = "nav-link";
            if (k == 0)
                activeClassName = "nav-link active";
            let Option = <li className="nav-item"><a className={activeClassName} data-toggle="tab" href={"#" + LevelTitle}>{LevelTitle}</a></li>;
            LevelTabs.push(Option);
            LevelIDs.push(LevelID);
            LevelTitles.push(LevelTitle);
        }
        TabMainComponent.setState({ LevelTabs: LevelTabs });
        arrLevelIds = LevelIDs;
        TabMainComponent.GetTaskGrids();
    }

    GetTaskGrids() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.StandardTask + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TabMainComponent._FillTaskGrids, TabMainComponent._onTaskGridFailure)
    }

    _FillTaskGrids(data) {
        let LevelIDs = arrLevelIds;
        let containsLevelIds = [];
        let arrgridheader = [];
        for (var k = 0; k < LevelIDs.length; k++) {
            let LevelID = LevelIDs[k];
            let levelWiseTask = [];
            let checkAllId = "checkAllId" + LevelID;
            let activeClassName = "tab-pane";
            if (k == 0)
                activeClassName = "tab-pane active";
            GridRows = data.d.results;
            var arrTasksByLevelIDS = TabMainComponent.FilterTasksByLevelID(LevelID)
            GridRows = arrTasksByLevelIDS;
            TabMainComponent.CreateStandardGridRows();
            let rowgridheader = <div id={LevelTitles[k]} className={activeClassName}>
                <table className="table table-striped table-bordered mb-0">
                    <thead>
                        <tr>
                            <th><label htmlFor={checkAllId}>Name</label>
                            </th>
                            <th>
                                Category
                                </th>
                            <th>Type
                                </th>
                        </tr>
                    </thead>
                    <tbody>{DataRows}</tbody>
                </table>
            </div>
            arrgridheader.push(rowgridheader);
        }
        TabMainComponent.setState({ gridHeader: arrgridheader });
    }

    CreateStandardGridRows() {

        DataRows = [];
        for (var k = 0; k < GridRows.length; k++) {
            var Row = [];
            var DataObject = {};
            var nTaskId = GridRows[k]["ID"];
            var GridRow = <td className="d-none">{nTaskId}</td>;
            Row.push(GridRow);

            var FieldValue = GridRows[k]["OData__TaskName"];
            let isTaskSelected = false;
            let isChecked = false;
            if (TabMainComponent.props.Action == "Edit") {
                isTaskSelected = TabMainComponent.IsContainsTasks(nTaskId);
                taskProp = isTaskSelected.split("_");
                let dtId = taskProp[1];
                if (taskProp[1] == "0")
                    dtId = "";
                else
                    dtId = "dtId_" + taskProp[1];
                if (taskProp[0] == "true")
                    isChecked = true;
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{""}</label></div></td>
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name={dtId} id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{FieldValue}</label></div></td>
                }
            }
            else {
                if (FieldValue == null) {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{""}</label></div></td>
                }
                else {
                    GridRow = <td><div className="custom-control custom-checkbox mr-sm-2"><input type="checkbox" className="custom-control-input" name="" id={"st" + nTaskId} value="0" defaultChecked={isChecked} /><label className="custom-control-label" htmlFor={"st" + nTaskId}>{FieldValue}</label></div></td>
                }
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["OData__IDCategory"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{FieldValue["CategoryName1"]}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["TaskType1"]
            if (FieldValue == null) {
                GridRow = <td>{""}</td>
            }
            else {
                GridRow = <td>{FieldValue}</td>
            }
            Row.push(GridRow);

            FieldValue = GridRows[k]["TaskLevelId"]
            let style = {
                display: "none"
            };
            if (FieldValue == null) {
                GridRow = <td style={style}>{""}</td>
            }
            else {
                GridRow = <td style={style}>{FieldValue}</td>
            }
            Row.push(GridRow);
            let DataSingleRow = <tr id={(nTaskId + "dRow")}>{Row}</tr>
            DataRows.push(DataSingleRow);
        }
    }

    FilterTasksByLevelID(LevelID) {
        var ListItemsFilterData = GridRows.filter(function (el) {
            return el.TaskLevelId == LevelID
        });
        return ListItemsFilterData;
    }

    _onTaskGridFailure(data) {
        console.log("Failed in getting process items.")
    }

    HandleUpdate() {
        TabMainComponent.props.HandleDataUpdate();
    }

    GetTaskTemplateDetailTasks() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.TaskTemplateDetail + "')/items?$filter=OData__IDTaskTemplateId eq " + TabMainComponent.state.ItemId;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, TabMainComponent._GetTaskTemplateDetailTasksSuccess, TabMainComponent._GetTaskTemplateDetailTasksFailure)
    }

    _GetTaskTemplateDetailTasksSuccess(data) {
        let Taskid = 0;
        let Detailid = 0;

        for (var k = 0; k < data.d.results.length; k++) {
            Taskid = data.d.results[k]["OData__IDStandardTaskId"];
            Detailid = data.d.results[k]["ID"];
            TaskTemplateDetailTaskIds.push(Taskid);
            TaskTemplateDetailIds.push(Detailid);
        }
    }

    _GetTaskTemplateDetailTasksFailure() {
        console.log("Failed in getting process items.")
    }

    IsContainsTasks(nTaskId) {
        let isTaskfound = false;
        for (var jj = 0; jj < TaskTemplateDetailTaskIds.length; jj++) {
            if (TaskTemplateDetailTaskIds[jj] == nTaskId) {
                isTaskfound = true;
                return isTaskfound + "_" + TaskTemplateDetailIds[jj];
            }
        }
        return isTaskfound + "_" + "0";
    }

    render() {
        return (
            <div>
                <div className="row modal-body modal-form pt-0">
                    <div className="col-12">
                        <div className="row section p-2">
                            <ul className="tab-menu nav nav-tabs mb-2" role="tablist">
                                {TabMainComponent.state.LevelTabs}
                            </ul>
                            <div className="tab-content col-12 p-0 modal-h-175">
                                {TabMainComponent.state.gridHeader}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
