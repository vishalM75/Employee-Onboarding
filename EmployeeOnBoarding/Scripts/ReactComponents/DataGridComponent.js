"use strict";

let nTotalItemsCount = 0;
let nCurrentPageNumber = 1;
let nTotalPagesCount = 0;
let oCurrentViewGridData = [];
let arHeaderArray = [];

class DataGridMain extends React.Component {
    constructor(props) {
        super(props);
        var SortText = "", FilterText = "";
        if (this.props.SortText) { SortText = this.props.SortText } else { SortText = "ID asc" }
        if (this.props.FilterText) { FilterText = this.props.FilterText } else { FilterText = "" }
        this.state = {
            gridProperties: this.props.GridProperties,
            GridTableHeading: null,
            GridRows: null,
            ModalHeading: "",
            ModalForm: null,
            ResultsString: "",
            FilterString: FilterText,
            FirstDisabled: false,
            PreviousDisabled: false,
            NextDisabled: false,
            LastDisabled: false,
            SortText: SortText,
            SortField: "",
            SortIconType: "",
            SortIconOn: "",
            PaginationVisibilityClass: "",
            SortIconOn: ""
        };

        this.InitAppParameters = this.InitAppParameters.bind(this);
        this.CreateGrid = this.CreateGrid.bind(this);
        this.UpdatePagingButtons = this.UpdatePagingButtons.bind(this);
        this.GetSPListItems = this.GetSPListItems.bind(this);
        this.GetSPListItemsCount = this.GetSPListItemsCount.bind(this);
        this._onItemGet = this._onItemGet.bind(this);
        this.UpdateFilterState = this.UpdateFilterState.bind(this);
        this.CreateFilterString = this.CreateFilterString.bind(this);
        this.ClearFilter = this.ClearFilter.bind(this);
        this._onTotalItemsGet = this._onTotalItemsGet.bind(this);
        this._onRestCallFailure = this._onRestCallFailure.bind(this);
        this.CreateGridHeader = this.CreateGridHeader.bind(this);
        this.SortData = this.SortData.bind(this);
        this.CreateGridRows = this.CreateGridRows.bind(this);
        this.ResetFilterString = this.ResetFilterString.bind(this);
        this.GetGridHeaders = this.GetGridHeaders.bind(this);
        this.EditRow = this.EditRow.bind(this);
        this.GetColumnSortClass = this.GetColumnSortClass.bind(this);
        this._onItemsPerPageChange = this._onItemsPerPageChange.bind(this);
        this.CloseModal = this.CloseModal.bind(this);
        this.PageIndexChange = this.PageIndexChange.bind(this);
        this.DeleteRow = this.DeleteRow.bind(this);
        this._OnFirstPageButtonClick = this._OnFirstPageButtonClick.bind(this);
        this._OnPreviousPageButtonClick = this._OnPreviousPageButtonClick.bind(this);
        this._OnNextPageButtonClick = this._OnNextPageButtonClick.bind(this);
        this._OnLastPageButtonClick = this._OnLastPageButtonClick.bind(this);
        this.InitAppParameters();
    }

    componentWillMount() {
        if (this.state.gridProperties.AllowPagination === false) {
            this.state.PaginationVisibilityClass = "d-none";
        }
        this.CreateGrid();
    }
    ResetGridRows() {
        this.setState({ GridRows: false });
    }
    componentDidMount() {
       

    }

    InitAppParameters() {
        BKJSShared.Application.Name = "EOB";
        BKJSShared.Application.PlatForm = "SharePoint Add-in";
        BKJSShared.Application.isSPFx = false;
    }

    CreateGrid() {
        oCurrentViewGridData = [];
        arHeaderArray = [];

        this.GetSPListItemsCount();
        this.GetSPListItems();
        this.CreateGridHeader();
        this.UpdatePagingButtons();
    }

    UpdatePagingButtons() {
        var FirstPageBtn = this.state.gridProperties.GridName + "First";
        var PreviousPageBtn = this.state.gridProperties.GridName + "Previous";
        var CurrentPageBtn = this.state.gridProperties.GridName + "Current";
        var NextPageBtn = this.state.gridProperties.GridName + "Next";
        var LastPageBtn = this.state.gridProperties.GridName + "Last";
        if (nCurrentPageNumber > 1) {
            this.state.FirstDisabled = false;
            $("#" + FirstPageBtn).removeClass("disabled");

        }
        else {
            this.state.FirstDisabled = true;
            $("#" + FirstPageBtn).addClass("disabled");
        }

        if (nCurrentPageNumber - 1 >= 1) {
            this.state.PreviousDisabled = false;
            $("#" + PreviousPageBtn).removeClass("disabled");
        }
        else {
            this.state.PreviousDisabled = true;
            $("#" + PreviousPageBtn).addClass("disabled");
        }

        if (nCurrentPageNumber + 1 <= nTotalPagesCount) {
            this.state.NextDisabled = false;
            $("#" + NextPageBtn).removeClass("disabled");
        }
        else {
            this.state.NextDisabled = true;
            $("#" + NextPageBtn).addClass("disabled");
        }

        if (nCurrentPageNumber < nTotalPagesCount) {
            this.state.LastDisabled = false;
            $("#" + LastPageBtn).removeClass("disabled");
        }
        else {
            this.state.LastDisabled = true;
            $("#" + LastPageBtn).addClass("disabled");
        }
    }

    GetSPListItems() {
        oCurrentViewGridData = [];
        var nPageSize = this.state.gridProperties.PageSize;
        nTotalPagesCount = Math.ceil(nTotalItemsCount / nPageSize);
        var nSkipToken = nCurrentPageNumber - 1;

        var arrCols = [];
        var arrLookup = [];
        var lCounter = 0;
        for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
            var sFieldInternalName = "";
            if (this.state.gridProperties.ColumnProps[c].DataType == "People") {
                sFieldInternalName = sFieldInternalName.concat(this.state.gridProperties.ColumnProps[c].InternalName, "%2FTitle");
                arrLookup.push(sFieldInternalName);
                lCounter++;
            }
            else if (this.state.gridProperties.ColumnProps[c].DataType == "Lookup") {
                sFieldInternalName = sFieldInternalName.concat(this.state.gridProperties.ColumnProps[c].InternalName, "%2F", this.state.gridProperties.ColumnProps[c].LookupColumn);
                arrLookup.push(sFieldInternalName);
                lCounter++;
            }
            else {
                sFieldInternalName = this.state.gridProperties.ColumnProps[c].InternalName;
            }
            arrCols.push(sFieldInternalName);
        }
        var Columns = arrCols.join("%2C");
        var strLookUps = arrLookup.join("%2C");

        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + this.state.gridProperties.ListName + "')/items?";
        if (this.state.SortText !== "") {
            Url += "$orderby=" + this.state.SortText;
        }
        Url += "&$skiptoken=Paged%3DTRUE%26p_ID%3D" + nSkipToken;
        Url += "&$top=" + nPageSize;
        Url += "&$select=" + Columns;
        if (this.state.gridProperties.IncludeAttachments) {
            Url += "%2CAttachments%2CAttachmentFiles"
        }
        Url += ""
        if (lCounter > 0) {
            Url += "&$expand=";
            if (this.state.gridProperties.IncludeAttachments) {
                Url += "AttachmentFiles%2C";
            }
            Url += strLookUps;
        }
        if (this.state.FilterString !== "") {
            Url += "&$filter=" + this.state.FilterString;
        }
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onItemGet, this._onRestCallFailure)
    }

    GetSPListItemsCount() {
        var ListTotalCountUrl = "";
        if (this.state.gridProperties.FilterText != "") {
            ListTotalCountUrl = _spPageContextInfo.webAbsoluteUrl + "/_vti_bin/listdata.svc/'" + this.state.gridProperties.ListName + "'/$count?&$filter=" + this.state.gridProperties.FilterText;
        }
        else {
            ListTotalCountUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('" + this.state.gridProperties.ListName + "')/ItemCount";
        }
        BKJSShared.AjaxCall(ListTotalCountUrl, null, BKJSShared.HTTPRequestMethods.GET, false, this._onTotalItemsGet, this._onRestCallFailure)
    }

    _onItemGet(data) {
        this.CreateGridRows(data.d.results);
        console.log(data)
    }

    UpdateFilterState(FilterString) {
        this.setState({ FilterText: FilterString })
    }

    CreateFilterString(FilterObject) {
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
        this.setState({ FilterString: FilterString }, this.CreateGrid);
    }

    ClearFilter() {
        this.setState({ FilterString: "" }, this.CreateGrid)
    }

    _onTotalItemsGet(data) {
        nTotalItemsCount = data.d.ItemCount;
        nTotalPagesCount = Math.ceil(nTotalItemsCount / this.props.GridProperties.PageSize);
    }

    _onRestCallFailure(data) {
        console.log(data)
    }
    GetColumnSortClass(sColumnName) {
        var sClass = "fa fa-sort";
        if (this.state.SortIconOn == sColumnName) {
            if (this.state.SortIconType == "asc") {
                sClass = "fa fa-caret-up";
            }
            else {
                sClass = "fa fa-caret-down"
            }
        }
        return sClass;
    }
    CreateGridHeader() {
        let HeaderArray = [];
        let GridHeader = null;
        if (this.state.gridProperties.IncludeAttachments) {
            GridHeader = <th><i class="fa fa-paperclip"></i></th>;
            HeaderArray.push(GridHeader);
        }
        for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
            GridHeader = null;
            let cWidth = this.state.gridProperties.ColumnProps[c].ColumnWidth;
            let cVisibility = this.state.gridProperties.ColumnProps[c].ColumnVisibility;
            var style = {}
            if (cVisibility == false) {
                GridHeader = <th className="d-none"><a href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} onClick={this.SortData}>{this.state.gridProperties.ColumnProps[c].DisplayName}</a></th>
            }
            else {
                style = {
                    width: cWidth + "%"
                };
                var columnClass = this.GetColumnSortClass(this.state.gridProperties.ColumnProps[c].InternalName);
                if (this.state.gridProperties.ColumnProps[c].AllowSorting) {
                    GridHeader = <th style={style} ><a href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} onClick={this.SortData} >{this.state.gridProperties.ColumnProps[c].DisplayName} <i className={columnClass}></i></a></th>;
                }
                else {
                    GridHeader = <th style={style} ><a href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} >{this.state.gridProperties.ColumnProps[c].DisplayName} </a></th>;
                }
            }
            HeaderArray.push(GridHeader);
        }
        if (this.props.GridProperties.IsEdit || this.props.GridProperties.IsDelete || this.props.GridProperties.IsView) {
            var GridEditHeader = <th width="7%"><a key={"EditCategory"} >Action</a></th>;
            HeaderArray.push(GridEditHeader);
        }
        this.setState({ GridTableHeading: HeaderArray });
    }
    SortData(event) {
        nCurrentPageNumber = 1;
        let FieldName = "";
        for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
            var DisplayName = this.state.gridProperties.ColumnProps[c].DisplayName;
            if (DisplayName.trim() == event.currentTarget.innerText.trim()) {
                FieldName = this.state.gridProperties.ColumnProps[c].InternalName;
                break;
            }
        }
        if (this.state.SortField != "") {

            if (this.state.SortField.trim() == FieldName.trim()) {
                this.setState({ SortText: FieldName + "%20desc" }, this.CreateGrid)
                this.setState({ SortField: "" });
                this.setState({ SortIconType: "desc" });
            }
            else {
                this.setState({ SortText: FieldName + " asc" }, this.CreateGrid)
                this.setState({ SortField: FieldName });
                this.setState({ SortIconType: "asc" });
            }
        }
        else {
            this.setState({ SortText: FieldName + " asc" }, this.CreateGrid)
            this.setState({ SortField: FieldName });
            this.setState({ SortIconType: "asc" });
        }
        this.setState({ SortIconOn: FieldName });
    }

    CreateGridRows(GridData) {
        var DataRows = [];

        for (var k = 0; k < GridData.length; k++) {
            var Row = [];
            var DataObject = {};
            var HasAttachments = false;
            if (this.state.gridProperties.IncludeAttachments) {
                if (GridData[k].AttachmentFiles.results.length > 0) {
                    HasAttachments = true;
                    GridRow = <td> <i className="fa fa-paperclip"></i></td>

                }
                else {
                    GridRow = <td> {""}</td>
                }
                Row.push(GridRow);
            }

            for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {

                let FieldValue = GridData[k][this.state.gridProperties.ColumnProps[c].InternalName];
                //if (GridData[k][this.state.gridProperties.ColumnProps[c].CustomValueCheck] !== null) {
                if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.ColumnProps[c].CustomValueCheck) == true) {
                    var GridRow = this.state.gridProperties.ColumnProps[c].CustomValueCheck(FieldValue)
                    //GridRow = <td>{GridRow}</td>
                    Row.push(GridRow);
                    DataObject[this.state.gridProperties.ColumnProps[c].InternalName] = FieldValue;
                }
                else {

                    // if (key !== "__metadata" && key !== "Id") {
                    let GridRow = null;
                    if (this.state.gridProperties.ColumnProps[c].DateFormat) {
                        FieldValue = moment(FieldValue).format(this.state.gridProperties.ColumnProps[c].DateFormat)
                    }
                    if (typeof (FieldValue) == "string" || typeof (FieldValue) == "number") {
                        if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                            GridRow = <td className="d-none">{FieldValue}</td>
                        }
                        else {
                            if (c == 1 && HasAttachments == true) {
                                GridRow = <td>{FieldValue}</td>
                            }
                            else {
                                GridRow = <td>{FieldValue}</td>
                            }
                        }
                    }
                    else if (typeof (FieldValue) == "object") {
                        if (this.state.gridProperties.ColumnProps[c].DataType == "People") {
                            if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == true) {
                                
                                if (FieldValue["results"] != undefined) {
                                    let strUsers = Array.prototype.map.call(FieldValue["results"], function (item) { return item.Title; }).join(", ");
                                   // let strUsers = FieldValue["results"].join(",");
                                    GridRow = <td>{strUsers}</td>
                                }
                                else {
                                    GridRow = <td></td>
                                }
                            }
                            else {
                                if (FieldValue["results"] != undefined) {
                                    GridRow = <td className="d-none">{FieldValue["results"][0].Title}</td>
                                }
                                else {
                                    GridRow = <td className="d-none"></td>
                                }
                            }
                        }
                    }
                    else if (typeof (FieldValue) == "boolean") {
                        if (FieldValue) {

                            GridRow = <td className="text-center">
                                <i class="fa fa-check-square grid-checkbox"  ></i>
                            </td>
                        }
                        else {
                            GridRow = <td className="text-center">
                                <i class="fa fa-square grid-checkbox" ></i>
                            </td>
                        }
                    }
                    if (this.state.gridProperties.ColumnProps[c].IsLookup) {
                        if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                            GridRow = <td className="d-none">{FieldValue[this.state.gridProperties.ColumnProps[c].LookupColumn]}</td>
                        }
                        else {
                            GridRow = <td>{FieldValue[this.state.gridProperties.ColumnProps[c].LookupColumn]}</td>
                        }
                    }
                    if (FieldValue == null) {
                        if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                            GridRow = <td className="d-none">{""}</td>
                        }
                        else {
                            GridRow = <td>{""}</td>
                        }
                    }
                    Row.push(GridRow);
                    DataObject[this.state.gridProperties.ColumnProps[c].InternalName] = FieldValue;
                    // }
                }
            }
            if (this.state.gridProperties.IsEdit && this.state.gridProperties.IsDelete) {
                let EditRow = <td className="text-center">

                    <a className="icon-blue" id={(GridData[k]["ID"] + "EditRow")} onClick={this.EditRow}><i className="fa fa-pencil mr-3"></i></a>
                    <a className="icon-red" id={(GridData[k]["ID"] + "DeleteRow")} onClick={this.DeleteRow}><i className="fa fa-trash"></i></a></td>

                Row.push(EditRow);
            }
            let DataSingleRow = <tr id={(GridData[k]["ID"] + "Row")}> {Row} </tr>
            DataRows.push(DataSingleRow);
        }
        //this.setState({ GridRows: DataRows }, function () { this.props.AfterRenderFunction() });
        this.setState({ GridRows: DataRows }, this.ResetFilterString);
        // this.UpdateSearchResultsFound(GridData.length, isDataFromSearch);

        //nCurrentGridStartIndex = oCurrentViewGridData[oCurrentViewGridData.length - 1]["ID"];
        //nGridDataStartIndex = oCurrentViewGridData[0]["ID"];
    }
    ResetFilterString() {
        //this.setState({ FilterString: "" })
        // this.setState({ SortText: "" })
    }
    GetGridHeaders() {
        var GridHeader = (this.state.gridProperties.GridName + "GridHeader");
        var THs = $("#" + GridHeader).find("th");
        for (var i = 0; i < THs.length; i++) {
            arHeaderArray.push(THs[i].innerText);
        }
    }
    EditRow(event) {
        //console.log(event);
        this.GetGridHeaders();
        let RowID = event.currentTarget.id;
        RowID = RowID.replace("EditRow", "Row")
        var TDs = $('#' + RowID).find("td")
        var DataObject = {};

        for (var i = 0; i < TDs.length; i++) {
            if (arHeaderArray[i] == "Edit" || arHeaderArray[i] == "Delete") {
                continue;
            }
            var isCHeckBOxElement = $(TDs[i]).find("input[type=checkbox]")
            if (isCHeckBOxElement.length > 0) {
                var isCheckBox = $(TDs[i]).find("input:checked")
                if (isCheckBox.length > 0) {
                    DataObject[arHeaderArray[i]] = true;
                }
                else {
                    DataObject[arHeaderArray[i]] = false;
                }
            }
            else {
                DataObject[arHeaderArray[i]] = TDs[i].innerText;
            }

        }
        DataObject["Action"] = "Edit";
        console.log(DataObject);
        this.state.gridProperties.EditEventHandler(DataObject);
        //this.ShowDataInModal(DataObject,"EditItem");
    }

    DeleteRow(event) {
        this.GetGridHeaders();
        let RowID = event.currentTarget.id;
        RowID = RowID.replace("DeleteRow", "Row")
        var TDs = $('#' + RowID).find("td")
        var DataObject = {};
        DataObject["Action"] = "Delete";
        for (var i = 0; i < TDs.length; i++) {
            if (arHeaderArray[i] == "Edit" || arHeaderArray[i] == "Delete") {
                continue;
            }
            DataObject[arHeaderArray[i]] = TDs[i].innerText;
        }
        console.log(DataObject);
        this.state.gridProperties.DeleteEventHandler(DataObject);
    }
    ViewRow(event) {
        this.GetGridHeaders();
        let RowID = event.currentTarget.id;
        RowID = RowID.replace("ViewRow", "Row")
        var TDs = $('#' + RowID).find("td")
        var DataObject = {};
        DataObject["Action"] = "View";
        for (var i = 0; i < TDs.length; i++) {
            if (arHeaderArray[i] == "Edit" || arHeaderArray[i] == "View") {
                continue;
            }
            DataObject[arHeaderArray[i]] = TDs[i].innerText;
        }
        console.log(DataObject);
        this.state.gridProperties.DeleteEventHandler(DataObject);
    }

    _onItemsPerPageChange() {
        let SelectedItemsPerPage = document.getElementById(this.state.gridProperties.GridName + "ItemsPerPageSelect");
        this.state.gridProperties.PageSize = SelectedItemsPerPage.value;
        nCurrentPageNumber = 1;
        this.CreateGrid();
        //if (this.state.StrictFilter == "") {
        //    this.setState({ FilterString: "" }, this.CreateGrid)
        //}
        //else {
        //    this.setState({ FilterString: this.state.StrictFilter }, this.CreateGrid)
        //}

    }

    CloseModal() {
        var modal = document.getElementById("myModal1");
        modal.style.display = "none";
        this.setState({ ModalHeading: null });
        this.setState({ ModalForm: null });
    }
    PageIndexChange(ButtonType) {
        if (ButtonType == "First") {
            nCurrentPageNumber = 1;
        }
        if (ButtonType == "Previous") {
            nCurrentPageNumber = nCurrentPageNumber - 1;
        }
        if (ButtonType == "Next") {
            nCurrentPageNumber = nCurrentPageNumber + 1;
        }
        if (ButtonType == "Last") {
            nCurrentPageNumber = nTotalPagesCount;
        }
        this.CreateGrid();
    }
    _OnFirstPageButtonClick() {
        this.PageIndexChange("First");
    }
    _OnPreviousPageButtonClick() {
        this.PageIndexChange("Previous");
    }
    _OnNextPageButtonClick() {
        this.PageIndexChange("Next");
    }
    _OnLastPageButtonClick() {
        this.PageIndexChange("Last");
    }
    render() {
        return (
            <div className="tbl-bg-main mb-70">
                <div >
                    <table className="table mb-2" id={this.state.gridProperties.GridName} >
                        <tbody>
                            <tr>
                                <td className={"border-0 p-0 text-right " + this.state.PaginationVisibilityClass}>
                                    <span className="pr-2 align-middle">Records Per Page</span>
                                    <select className="form-control form-control-sm w-auto float-right" id={this.state.gridProperties.GridName + "ItemsPerPageSelect"} onChange={this._onItemsPerPageChange}>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="tbl-h-410 table-responsive-md">
                    <table className="table table-striped table-bordered mb-0" id={this.props.GridProperties.GridName} >
                        <thead>
                            <tr id={(this.state.gridProperties.GridName + "GridHeader")}>
                                {this.state.GridTableHeading}
                            </tr>
                        </thead>
                        <tbody>

                            {this.state.GridRows}
                        </tbody>
                    </table>
                </div>
                <table className={"table mb-0 " + this.state.PaginationVisibilityClass} id={(this.props.GridProperties.GridName + "GridResults")} >
                    <tbody>
                        <tr>
                            <td className="border-0 p-0">
                                <ul className="pagination pagination-sm float-right">
                                    <li className="page-item" id={this.state.gridProperties.GridName + "First"}><a className="page-link" href="#" disabled={true} onClick={this._OnFirstPageButtonClick}><i className="fa fa-angle-double-left"></i></a></li>
                                    <li className="page-item" id={this.state.gridProperties.GridName + "Previous"}><a className="page-link" href="#" onClick={this._OnPreviousPageButtonClick}><i className="fa fa-angle-left"></i></a></li>
                                    <li className="page-item " id={this.state.gridProperties.GridName + "Current"}><a className="page-link" href="#" >Page  {nCurrentPageNumber}  of {nTotalPagesCount}</a></li>
                                    <li className="page-item" id={this.state.gridProperties.GridName + "Next"}><a className="page-link" href="#" onClick={this._OnNextPageButtonClick} ><i className="fa fa-angle-right"></i></a></li>
                                    <li className="page-item" id={this.state.gridProperties.GridName + "Last"}><a className="page-link" href="#" onClick={this._OnLastPageButtonClick}><i className="fa fa-angle-double-right"></i></a></li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div id="myModal1" className="modalReact">
                    <div className="modal-contentReact">
                        <div>
                            <span className="closeModalReact" onClick={this.CloseModal}>&times;</span>
                            <p>{this.state.ModalHeading}</p>
                            <div>
                                <table>
                                    <tbody>
                                        {this.state.ModalForm}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );

    }
}