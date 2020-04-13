"use strict";

let nTotalItemsCount = 0;
let nCurrentPageNumber = 1;
//let nCurrentPageNumber = 0;
let nTotalPagesCount = 0;
let oCurrentViewGridData = [];
let arHeaderArray = [];
let TableData = null;
let GridColumnsCount = 0;
class DataTableMain extends React.Component {
    constructor(props) {
        super(props);
        var SortText = "", FilterText = "", GroupedText = "", GroupSortText = "";
        if (this.props.SortText) { SortText = this.props.SortText } else { SortText = "ID asc" }
        if (this.props.FilterText) { FilterText = this.props.FilterText } else { FilterText = "" }
        if (this.props.GroupedText) { GroupedText = this.props.GroupedText } else { GroupedText = "" }
        if (this.props.GroupSortText) { GroupSortText = this.props.GroupSortText } else { GroupSortText = "" }
        this.state = {
            gridProperties: this.props.GridProperties,
            GridTableHeading: null,
            GridRows: null,
            ModalHeading: "",
            ModalForm: null,
            ResultsString: "",
            FilterString: FilterText,
            GroupByField: GroupedText,
            GroupSortingBy: GroupSortText,
            FirstDisabled: false,
            PreviousDisabled: false,
            NextDisabled: false,
            LastDisabled: false,
            SortText: SortText,
            SortField: "",
            SortIconType: "",
            PaginationVisibilityClass: "",
            SortIconOn: "",
            GroupByComboOptions: []
        };

        this.InitAppParameters = this.InitAppParameters.bind(this);
        this.CreateGrid = this.CreateGrid.bind(this);
        this.UpdatePagingButtons = this.UpdatePagingButtons.bind(this);
        this.GetSPListItems = this.GetSPListItems.bind(this);
        //this.GetSPListItemsCount = this.GetSPListItemsCount.bind(this);
        this._onItemGet = this._onItemGet.bind(this);
        this.UpdateFilterState = this.UpdateFilterState.bind(this);
        this.CreateFilterString = this.CreateFilterString.bind(this);
        this.ClearFilter = this.ClearFilter.bind(this);
        this._onTotalItemsGet = this._onTotalItemsGet.bind(this);
        this._onRestCallFailure = this._onRestCallFailure.bind(this);
        this.CreateGridHeader = this.CreateGridHeader.bind(this);
        this.SortData = this.SortData.bind(this);
        this.CreateGridRows = this.CreateGridRows.bind(this);
        this.CallGridRows = this.CallGridRows.bind(this);
        this.CreateGroupedGridRows = this.CreateGroupedGridRows.bind(this);
        this.AfterGridRender = this.AfterGridRender.bind(this);
        this.ResetGroupBy = this.ResetGroupBy.bind(this);
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
        //this.CreateTableRowsAfterModifications = this.CreateTableRowsAfterModifications.bind(this);
        this.CreateGroupByoptions = this.CreateGroupByoptions.bind(this);
        this._OnGroupByChange = this._OnGroupByChange.bind(this);
        this.GetTableData = this.GetTableData.bind(this);
        this.ReCreateGroupedGridRows = this.ReCreateGroupedGridRows.bind(this);
        this.ResetGridRows = this.ResetGridRows.bind(this);
        this.SetDefaultGroupByValue = this.SetDefaultGroupByValue.bind(this);
        this.InitAppParameters();

    }
    ResetGridRows() {
        try {
            this.setState({ GridRows: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.ResetGridRows"); }
    }
    componentDidMount() {
        try {
            if (this.state.gridProperties.GroupedBy != "" && this.state.gridProperties.GroupedBy != undefined) {
                $('#divGrpByOptions').show();
                //this.setState({ GroupByField: this.state.gridProperties.GroupedBy });
                this.CreateGroupByoptions();
            }
            else {
                $('#divGrpByOptions').hide();
            }
            if (this.state.gridProperties.AllowPagination === false) {
                this.state.PaginationVisibilityClass = "d-none";
            }

            this.CreateGrid();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.componentDidMount"); }
    }

    InitAppParameters() {
        try {
            BKJSShared.Application.Name = "EOB";
            BKJSShared.Application.PlatForm = "SharePoint Add-in";
            BKJSShared.Application.isSPFx = false;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.InitAppParameters"); }
    }

    CreateGrid() {
        try {
            oCurrentViewGridData = [];
            arHeaderArray = [];

            this.GetSPListItems();
            if (this.state.gridProperties.ShowGrouping) {
                this.CreateGroupedGridHeader();
            } else {
                this.CreateGridHeader();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGrid"); }
    }

    UpdatePagingButtons() {
        try {
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

            //if(nCurrentPageNumber>0){
                if (nCurrentPageNumber - 1 >= 1) {
                    this.state.PreviousDisabled = false;
                    $("#" + PreviousPageBtn).removeClass("disabled");
                }
                else {
                    this.state.PreviousDisabled = true;
                    $("#" + PreviousPageBtn).addClass("disabled");
                }
            //} else {
            //        this.state.PreviousDisabled = true;
            //        $("#" + PreviousPageBtn).addClass("disabled");
            //    }

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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.UpdatePagingButtons"); }

    }

    GetSPListItems() {
        try {
            oCurrentViewGridData = [];
            var nPageSize = this.state.gridProperties.PageSize;
            nTotalPagesCount = Math.ceil(nTotalItemsCount / nPageSize);
            var nSkipToken = nCurrentPageNumber - 1;

            var arrCols = [];
            var arrLookup = [];
            var lCounter = 0;
            for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                var sFieldInternalName = "";
                if (!this.state.gridProperties.ColumnProps[c].isNotSPColumn) {
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


            }
            var Columns = arrCols.join("%2C");
            var strLookUps = arrLookup.join("%2C");

            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + this.state.gridProperties.ListName + "')/items?";
            if (this.state.SortText !== "") {
                Url += "$orderby=" + this.state.SortText
            }
            else {
                Url += "$orderby=ID%20desc";
            }
            Url += "&$select=" + Columns;

            Url += ""
            if (lCounter > 0) {
                Url += "&$expand=";
                Url += strLookUps;
            }
            if (this.state.FilterString !== "") {
                Url += "&$filter=" + this.state.FilterString;
            }
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onItemGet, this._onRestCallFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.GetSPListItems"); }
    }
    _onItemGet(data) {
        try {
            if (this.state.FilterString!='') {
                nCurrentPageNumber = 1;
                //nCurrentPageNumber = 0;
            }
            var GridData = data.d.results;
            nTotalItemsCount = GridData.length;
            nTotalPagesCount = Math.ceil(nTotalItemsCount / this.props.GridProperties.PageSize);
            if (this.state.gridProperties.HandleDataModifications) {
                var UpdatedData = this.state.gridProperties.HandleDataModifications(GridData);
                this.CreateTableRows(UpdatedData);
            }
            else {
                this.CreateTableRows(GridData);
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._onItemGet"); }
    }
    UpdateFilterState(FilterString) {
        try {
            this.setState({ FilterText: FilterString });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.UpdateFilterState"); }
    }

    CreateFilterString(FilterObject) {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateFilterString"); }
    }
    ResetGroupBy(GroupByColumn) {
        try {
            this.setState({ GroupByField: GroupByColumn }, this.ReCreateGroupedGridRows);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.ResetGroupBy"); }
    }
    ReCreateGroupedGridRows() {
        try {
            this.setState({ GridRows: false }, this.CreateGroupedGridRows);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.ReCreateGroupedGridRows"); }
    }
    ClearFilter() {
        try {
            this.setState({ FilterString: "" }, this.CreateGrid);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.ClearFilter"); }
    }

    _onTotalItemsGet(data) {

    }
    CreateGroupByoptions() {
        try {
            var ComboGrpByOptions = [];
            for (var i = 0; i < this.state.gridProperties.GroupByOptions.length; i++) {
                var Option = <option value={this.state.gridProperties.GroupByOptions[i].InternalName} key={"GrpOption" + i}>{this.state.gridProperties.GroupByOptions[i].DisplayName}</option>
                ComboGrpByOptions.push(Option);
            }
            this.setState({ GroupByComboOptions: ComboGrpByOptions }, this.SetDefaultGroupByValue);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGroupByoptions"); }
    }
    SetDefaultGroupByValue() {
        try {
            $("#" + this.state.gridProperties.GridName + "-ddlGroupBy").val(this.state.GroupByField);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.SetDefaultGroupByValue"); }
    }
    _onRestCallFailure(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._onRestCallFailure"); }
    }
    GetColumnSortClass(sColumnName) {
        try {
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

        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.GetColumnSortClass"); }
    }
    CreateGridHeader() {
        try {
            let HeaderArray = [];
            let GridHeader = null;

            for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {

                GridHeader = null;
                let cWidth = this.state.gridProperties.ColumnProps[c].ColumnWidth;
                let cVisibility = this.state.gridProperties.ColumnProps[c].ColumnVisibility;
                var style = {}
                if (cVisibility == false) {
                    GridHeader = <th key={"GridHeaderTitleClass" + c} className="d-none"><a className={this.state.gridProperties.GridHeaderTitleClass} href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} onClick={this.SortData}>{this.state.gridProperties.ColumnProps[c].DisplayName}</a></th>
                }
                else {
                    style = {
                        width: cWidth + "%"
                    };
                    var columnClass = this.GetColumnSortClass(this.state.gridProperties.ColumnProps[c].InternalName);
                    if (this.state.gridProperties.ColumnProps[c].AllowSorting) {
                        GridHeader = <th key={"GridHeaderTitleClass" + c} style={style} ><a className={this.state.gridProperties.GridHeaderTitleClass} href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} onClick={this.SortData} ><i className={columnClass}></i> {this.state.gridProperties.ColumnProps[c].DisplayName}</a></th>;
                    }
                    else {
                        GridHeader = <th style={style} key={"GridHeaderTitleClass" + c} ><a className={this.state.gridProperties.GridHeaderTitleClass} href="#" key={this.state.gridProperties.ColumnProps[c].InternalName} >{this.state.gridProperties.ColumnProps[c].DisplayName} </a></th>;
                    }
                }
                HeaderArray.push(GridHeader);
            }
            if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.CustomColumns)) {
                for (var c = 0; c < this.state.gridProperties.CustomColumns.length; c++) {
                    GridHeader = <th style={style} key={"GridHeaderTitleClass" + c} ><a className={this.state.gridProperties.GridHeaderTitleClass} href="#" key={this.state.gridProperties.CustomColumns[c]} >{this.state.gridProperties.CustomColumns[c]}</a></th>;
                    HeaderArray.push(GridHeader);
                }
            }

            if (!this.props.GridProperties.ShowGrouping) {
                if (this.props.GridProperties.IsEdit || this.props.GridProperties.IsDelete || this.props.GridProperties.IsView) {
                    var GridEditHeader = <th width="7%" key={"EditCategry"}><a className={this.state.gridProperties.GridHeaderTitleClass} key={"EditCategory"} >Action</a></th>;
                    HeaderArray.push(GridEditHeader);
                }
            }

            this.setState({ GridTableHeading: HeaderArray });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGridHeader"); }
    }
    CustomSortData(FieldName) {
        try {
            TableData.sort(BKJSShared.dynamicSort(FieldName));
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CustomSortData"); }
    }
    CreateGroupedGridHeader() {
        try {
            let HeaderArray = [];
            let GridHeader = null;

            for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                    continue;
                }
                GridHeader = null;
                let cWidth = this.state.gridProperties.ColumnProps[c].ColumnWidth;
                let cVisibility = this.state.gridProperties.ColumnProps[c].ColumnVisibility;
                var style = {}
                style = {
                    width: cWidth + "%"
                };
                GridHeader = <th className="GrpColumnHeader" key={"GrpColumnHeader" + c}>{this.state.gridProperties.ColumnProps[c].DisplayName}</th>;
                HeaderArray.push(GridHeader);
            }
            this.setState({ GridTableHeading: HeaderArray });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGroupedGridHeader"); }
    }
    SortData(event) {
        try {
            nCurrentPageNumber = 1;
            //nCurrentPageNumber = 0;
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
                    TableData.sort(BKJSShared.dynamicSort("-" + FieldName));
                    this.setState({ SortIconType: "desc" }, this.CreateGridHeader);
                    this.CallGridRows();
                    this.setState({ SortField: "" });

                }
                else {
                    TableData.sort(BKJSShared.dynamicSort(FieldName));
                    this.setState({ SortIconType: "asc" }, this.CreateGridHeader);
                    this.CallGridRows();
                    this.setState({ SortField: FieldName });

                }
            }
            else {
                TableData.sort(BKJSShared.dynamicSort(FieldName));
                this.setState({ SortIconType: "asc" }, this.CreateGridHeader);
                this.CallGridRows();
                this.setState({ SortField: FieldName });

            }
            this.setState({ SortIconOn: FieldName });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.SortData"); }
    }
    CreateGroupedGridRows() {
        try {
            var DataRows = [];
            TableData.sort(BKJSShared.dynamicSort(this.state.GroupSortingBy))
            var GroupedData = BKJSShared.groupBy(TableData, this.state.GroupByField);
            var RecCounter = 1;
            this.SetGridColumnsCount();
            if (TableData.length == 0) {
                let nDataSingleRow = <tr key={"grdclmnscountkey" + GridColumnsCount} id="NoRecords"><td colSpan={GridColumnsCount}><b>No records found!</b></td></tr>
                DataRows.push(nDataSingleRow);
            }
            for (let k in GroupedData) {

                if (GroupedData.hasOwnProperty(k)) {
                    var SingleRow = <tr><td colSpan={GridColumnsCount} className="GrpGroupHeader collapse-main"><a data-toggle="collapse" href={"#collapse" + RecCounter} aria-expanded="false" aria-controls="collapse1"><i class="fa fa-angle-right"></i> <i class="fa fa-angle-down"></i> {k}</a></td></tr>
                    DataRows.push(SingleRow);
                    var counter = 1;
                    for (var v = 0; v < GroupedData[k].length; v++) {
                        var Row = [];
                        let strRowClass = "GrpGridOddRow";
                        if (counter % 2 == 0) {
                            strRowClass = "GrpGridEvenRow";
                        }
                        for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                            if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                                continue;
                            }
                            let FieldValue = GroupedData[k][v][this.state.gridProperties.ColumnProps[c].InternalName];
                            if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.ColumnProps[c].CustomValueCheck) == true) {
                                var GridCell = this.state.gridProperties.ColumnProps[c].CustomValueCheck(FieldValue)
                                Row.push(GridCell);
                            }
                            else {
                                let GridCell = null;
                                if (this.state.gridProperties.ColumnProps[c].DateFormat) {
                                    FieldValue = moment(FieldValue).format(this.state.gridProperties.ColumnProps[c].DateFormat)
                                    if (FieldValue == "Invalid date") { FieldValue = ""; }
                                }
                                if (typeof (FieldValue) == "boolean") {
                                    if (FieldValue) {
                                        GridCell = <td>"Active"</td>
                                    }
                                    else {
                                        GridCell = <td></td>
                                    }
                                }
                                else {
                                    GridCell = <td>{FieldValue}</td>
                                }

                                if (FieldValue == null || FieldValue == undefined) {
                                    GridCell = <td>{""}</td>
                                }
                                Row.push(GridCell);
                            }
                        }
                        let DataSingleRow = <tr class="collapse" id={"collapse" + RecCounter}> {Row} </tr>
                        DataRows.push(DataSingleRow);
                        counter++;
                    }
                }
                RecCounter++;
            }
            this.setState({ GridRows: DataRows }, this.AfterGridRender);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGroupedGridRows"); }
    }

    CallGridRows() {
        try {
            if (this.state.gridProperties.ShowGrouping) {
                this.CreateGroupedGridRows();
            }
            else {

                this.CreateGridRows();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CallGridRows"); }
    }
    SetGridColumnsCount() {
        try {
            GridColumnsCount = 0;
            for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == true) {
                    GridColumnsCount++;
                }
            }
            if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.CustomColumns)) {
                for (var k = 0; k < this.state.gridProperties.CustomColumns.length; k++) {
                    GridColumnsCount++;
                }
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.SetGridColumnsCount"); }
    }
    CreateGridRows() {
        try {
            var nPageSize = this.state.gridProperties.PageSize;
            this.UpdatePagingButtons();
            var DataRows = [];
            this.SetGridColumnsCount()
            if (TableData.length == 0) {
                let nDataSingleRow = <tr key={"grdclmnscountkey" + GridColumnsCount} id="NoRecords"><td colSpan={GridColumnsCount + 1}><b>No records found!</b></td></tr>
                DataRows.push(nDataSingleRow);
            }
            if(nCurrentPageNumber==0 || nCurrentPageNumber==1){
                var StartIndex = ((1 - 1) * nPageSize);
                var LastIndex = 1 * nPageSize;
            }
            else{
                var StartIndex = ((nCurrentPageNumber - 1) * nPageSize);
                var LastIndex = nCurrentPageNumber * nPageSize;
            }
            if (LastIndex > TableData.length) {
                LastIndex = TableData.length;
            }
         
            for (var k = StartIndex; k < LastIndex; k++) {
                var Row = [];
                for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                    if (this.state.gridProperties.ColumnProps[c].isNotSPColumn) {
                        //if (this.state.gridProperties.ColumnProps[c].isNotSPColumn) {
                        if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.ColumnProps[c].CustomValueCheck)) {
                            var GridRow = this.state.gridProperties.ColumnProps[c].CustomValueCheck(TableData[k])
                            Row.push(GridRow);
                        }
                        else {
                            var GridRow = <p></p>
                            Row.push(GridRow);
                        }
                    }
                    else {
                        let FieldValue = TableData[k][this.state.gridProperties.ColumnProps[c].InternalName];
                        if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.ColumnProps[c].CustomValueCheck) == true) {
                            var GridRow = this.state.gridProperties.ColumnProps[c].CustomValueCheck(FieldValue)
                            Row.push(GridRow);
                        }
                        else {

                            let GridRow = null;
                            if (this.state.gridProperties.ColumnProps[c].DateFormat) {
                                FieldValue = moment(FieldValue).format(this.state.gridProperties.ColumnProps[c].DateFormat)
                                if (FieldValue == "Invalid date") { FieldValue = ""; }
                            }
                            if (typeof (FieldValue) == "boolean") {
                                if (FieldValue) {
                                    GridRow = <td className="text-center">
                                        <i className="fa fa-check grid-checkbox gridactive" data-toggle="tooltip" title="Active" ></i>
                                    </td>
                                }
                                else {
                                    GridRow = <td className="text-center">
                                        <i className="fa grid-checkbox" ></i>
                                    </td>
                                }
                            }
                            else {
                                if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                                    if (this.state.gridProperties.ColumnProps[c].DataType == "PeopleWithID") {
                                        var Id = "";
                                        if (FieldValue) {
                                            if (FieldValue.results) {
                                                Id = FieldValue.results.join(',')
                                            }
                                            GridRow = <td className="d-none">{Id}</td>
                                        }
                                    }
                                    else {
                                        GridRow = <td className="d-none">{FieldValue}</td>
                                    }

                                }
                                else {
                                    if (this.state.gridProperties.ColumnProps[c].DataType == ReactDataGridConstants.ColumnTypes.RichText) {
                                        GridRow = <td dangerouslySetInnerHTML={{ __html: FieldValue }}></td>
                                    }
                                    else if (this.state.gridProperties.ColumnProps[c].DataType == ReactDataGridConstants.ColumnTypes.Number) {
                                        GridRow = <td className="text-right">{FieldValue}</td>

                                    }
                                    else {
                                       
                                        GridRow = <td>{FieldValue}</td>
                                    }

                                }
                            }
                            if (FieldValue == null || FieldValue == undefined) {
                                if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                                    GridRow = <td className="d-none">{""}</td>
                                }
                                else {
                                    GridRow = <td>{""}</td>
                                }
                            }
                            Row.push(GridRow);
                        }
                    }
                }
                if (BKJSShared.NotNullOrUndefined(this.state.gridProperties.CustomColumns)) {
                    for (var i = 0; i < this.state.gridProperties.CustomColumns.length; i++) {
                        let ActionRow = null;
                        ActionRow = <td>{""}</td>;
                        Row.push(ActionRow);
                    }
                }

                if (this.state.gridProperties.IsEdit || this.state.gridProperties.IsDelete) {
                    let ActionRow = null;
                    if (this.state.gridProperties.IsEdit && this.state.gridProperties.IsDelete) {
                        ActionRow = <td className="text-center">
                            <a data-toggle="tooltip" title="Edit" className="icon-blue" id={(TableData[k]["ID"] + "EditRow")} onClick={this.EditRow}><i className="fa fa-pencil mr-3"></i></a>
                            <a data-toggle="tooltip" title="Delete" className="icon-red" id={(TableData[k]["ID"] + "DeleteRow")} onClick={this.DeleteRow}><i className="fa fa-trash"></i></a>
                        </td>
                    }
                    else if (this.state.gridProperties.IsEdit) {
                        if (this.state.gridProperties.isEditCheckFunction) {
                            var isShow = this.state.gridProperties.isEditCheckFunction(TableData[k])
                            if (isShow) {
                                ActionRow = <td className="text-center">
                                    <a data-toggle="tooltip" title="Edit" className="icon-blue" id={(TableData[k]["ID"] + "EditRow")} onClick={this.EditRow}><i className="fa fa-pencil mr-3"></i></a>
                                </td>
                            }
                            else {
                                ActionRow = <td></td>
                            }
                        }
                        else {
                            ActionRow = <td className="text-center">
                                <a data-toggle="tooltip" title="Edit" className="icon-blue" id={(TableData[k]["ID"] + "EditRow")} onClick={this.EditRow}><i className="fa fa-pencil mr-3"></i></a>
                            </td>
                        }

                    }
                    else if (this.state.gridProperties.IsDelete) {
                        ActionRow = <td className="text-center">
                            <a data-toggle="tooltip" title="Delete" className="icon-red" id={(TableData[k]["ID"] + "DeleteRow")} onClick={this.DeleteRow}><i className="fa fa-trash"></i></a>
                        </td>
                    }

                    Row.push(ActionRow);
                }
                let DataSingleRow = <tr key={"TblRowKey" + k} id={(TableData[k]["ID"] + "Row")}>{Row}</tr>
                DataRows.push(DataSingleRow);
            }

            //this.setState({GridRows: DataRows }, function () {this.props.AfterRenderFunction()});
            this.setState({ GridRows: DataRows }, this.AfterGridRender);
            // this.UpdateSearchResultsFound(GridData.length, isDataFromSearch);

            //nCurrentGridStartIndex = oCurrentViewGridData[oCurrentViewGridData.length - 1]["ID"];
            //nGridDataStartIndex = oCurrentViewGridData[0]["ID"];
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateGridRows"); }
    }
    CreateTableRows(GridData) {
        try {
            var DataRows = [];
            TableData = [];
            var varRowData = null;

            for (var k = 0; k < GridData.length; k++) {
                varRowData = {};
                for (var c = 0; c < this.state.gridProperties.ColumnProps.length; c++) {
                    if (this.state.gridProperties.ColumnProps[c].isNotSPColumn == true) {
                        if (this.state.gridProperties.ColumnProps[c].DataType == "CustomHTMLControl") {
                            strVal = "Test"
                        }

                        varRowData[this.state.gridProperties.ColumnProps[c].DataType] = strVal;
                    }
                    else {
                        var strVal = null;
                        let FieldValue = GridData[k][this.state.gridProperties.ColumnProps[c].InternalName];
                        if (this.state.gridProperties.ColumnProps[c].DateFormat) {
                            FieldValue = moment(FieldValue).format(this.state.gridProperties.ColumnProps[c].DateFormat)
                        }
                        if (this.state.gridProperties.ColumnProps[c].DataType == "Number") {
                            FieldValue = Number(FieldValue);
                        }
                        if (typeof (FieldValue) == "string" || typeof (FieldValue) == "number") {
                            strVal = FieldValue;
                        }
                        else if (typeof (FieldValue) == "object") {
                            if (this.state.gridProperties.ColumnProps[c].DataType == "People") {
                                strVal = "";
                                if (this.state.gridProperties.ColumnProps[c].PeopleMultiValues == true) {
                                    if (FieldValue["results"] != undefined) {
                                        strVal = Array.prototype.map.call(FieldValue["results"], function (item) { return item.Title; }).join(", ");
                                    }
                                }
                                else {
                                    if (FieldValue != undefined) {
                                        strVal = FieldValue.Title;
                                    }
                                }
                            }
                            else if (this.state.gridProperties.ColumnProps[c].DataType == "PeopleWithID") {
                                strVal = FieldValue
                            }
                        }
                        else if (typeof (FieldValue) == "boolean") {
                            if (FieldValue) {
                                strVal = true;
                            }
                            else {
                                strVal = false;
                            }
                        }
                        if (this.state.gridProperties.ColumnProps[c].IsLookup) {
                            strVal = "";
                            if (FieldValue) {
                                if (FieldValue[this.state.gridProperties.ColumnProps[c].LookupColumn] != undefined) {
                                    strVal = FieldValue[this.state.gridProperties.ColumnProps[c].LookupColumn];
                                }
                            }
                            
                        }

                        if (this.state.gridProperties.ColumnProps[c].ColumnVisibility == false) {
                            varRowData[this.state.gridProperties.ColumnProps[c].DisplayName] = strVal;
                        }
                        else {
                            varRowData[this.state.gridProperties.ColumnProps[c].InternalName] = strVal;
                        }
                    }
                }
                TableData.push(varRowData);
            }
            this.CallGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CreateTableRows"); }
    }
    AfterGridRender() {
        try {
            if (this.state.gridProperties.AfterRender) {
                this.state.gridProperties.AfterRender();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.AfterGridRender"); }
    }
    GetGridHeaders(isReturnHeaderArray) {
        try {
            var GridHeader = (this.state.gridProperties.GridName + "GridHeader");
            var THs = $("#" + GridHeader).find("th");
            for (var i = 0; i < THs.length; i++) {
                arHeaderArray.push(THs[i].innerText);
            }
            if (isReturnHeaderArray) {
                return arHeaderArray;
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.GetGridHeaders"); }
    }
    EditRow(event) {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.EditRow"); }
    }

    DeleteRow(event) {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.DeleteRow"); }
    }
    ViewRow(event) {
        try {
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
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.ViewRow"); }
    }

    _onItemsPerPageChange() {
        try {
            let SelectedItemsPerPage = document.getElementById(this.state.gridProperties.GridName + "ItemsPerPageSelect");
            this.state.gridProperties.PageSize = SelectedItemsPerPage.value;
            nCurrentPageNumber = 1;
            //nCurrentPageNumber=0;
            nTotalPagesCount = Math.ceil(nTotalItemsCount / SelectedItemsPerPage.value);
            //this.UpdatePagingButtons();
            this.CallGridRows();
            //if (this.state.StrictFilter == "") {
            //    this.setState({ FilterString: "" }, this.CreateGrid)
            //}
            //else {
            //    this.setState({ FilterString: this.state.StrictFilter }, this.CreateGrid)
            //}
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._onItemsPerPageChange"); }
    }

    CloseModal() {
        try {
            var modal = document.getElementById("myModal1");
            modal.style.display = "none";
            this.setState({ ModalHeading: null });
            this.setState({ ModalForm: null });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.CloseModal"); }
    }
    PageIndexChange(ButtonType) {
        try {
            
                if (ButtonType == "First") {
                    nCurrentPageNumber = 1;
                    //nCurrentPageNumber = 0;
                }
                if(nCurrentPageNumber>0){
                if (ButtonType == "Previous") {
                    nCurrentPageNumber = nCurrentPageNumber - 1;
                }
                if (ButtonType == "Next") {
                    nCurrentPageNumber = nCurrentPageNumber + 1;
                }
                }
                if (ButtonType == "Last") {
                    nCurrentPageNumber = nTotalPagesCount;
                }
           
            this.CallGridRows();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.PageIndexChange"); }
    }
    _OnFirstPageButtonClick() {
        try {
            this.PageIndexChange("First");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._OnFirstPageButtonClick"); }
    }
    _OnPreviousPageButtonClick() {
        try {
            this.PageIndexChange("Previous");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._OnPreviousPageButtonClick"); }
    }
    _OnNextPageButtonClick() {
        try {
            this.PageIndexChange("Next");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._OnNextPageButtonClick"); }
    }
    _OnLastPageButtonClick() {
        try {
            this.PageIndexChange("Last");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._OnLastPageButtonClick"); }
    }
    _OnGroupByChange() {
        try {
            var GrpComboId = this.state.gridProperties.GridName + "-ddlGroupBy";
            let GrpBy = BKJSShared.GetComboSelectedValueAndText("#" + GrpComboId);
            var GroupSort = "";
            for (var i = 0; i < this.state.gridProperties.GroupByOptions.length; i++) {
                if (this.state.gridProperties.GroupByOptions[i].InternalName === GrpBy.Value) {
                    GroupSort = this.state.gridProperties.GroupByOptions[i].GroupSortText;
                }
            }
            this.setState({ GroupSortingBy: GroupSort }, function () { this.ResetGroupBy(GrpBy.Value) });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent._OnGroupByChange"); }

    }
    GetGridRecordsCount() {
        try {
            if (TableData) {
                return TableData.length;
            }
            else {
                return 0;
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.GetGridRecordsCount"); }
    }
    GetTableData() {
        try {
            if (TableData) {
                return TableData;
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DataTableComponent.GetTableData"); }
    }
    render() {
        return (
            <div className="tbl-bg-main mb-70">
                <div id="divGrpByOptions" className="float-right">
                    <span className="select-text-middle">Group By</span>
                    <select onChange={this._OnGroupByChange} className="form-control form-control-sm w-auto float-right" id={this.state.gridProperties.GridName + "-ddlGroupBy"}>{this.state.GroupByComboOptions}</select>
                </div>
                <div>
                    <table className="table mb-2" id={this.state.gridProperties.GridName} >
                        <tbody>
                            <tr>
                                <td className={"border-0 p-0 text-right " + this.state.PaginationVisibilityClass}>
                                    <span className="select-text-middle">Records Per Page</span>
                                    <select className="form-control form-control-sm w-auto float-right" id={this.state.gridProperties.GridName + "ItemsPerPageSelect"} onChange={this._onItemsPerPageChange}>
                                        <option key="10" value="10">10</option>
                                        <option key="20" value="20">20</option>
                                        <option key="50" value="50">50</option>
                                        <option key="100" value="100">100</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="tbl-h-410 table-responsive-md">
                    <table className="table table-striped table-bordered mb-0" id={this.props.GridProperties.GridName + "Data"} >
                        <thead>
                            <tr key={this.state.gridProperties.GridName + "grpColumnKey"} className="GrpColumnHeadingRow" id={(this.state.gridProperties.GridName + "GridHeader")}>{this.state.GridTableHeading}</tr>
                        </thead>
                        <tbody>{this.state.GridRows}</tbody>
                    </table>
                </div>
                <table className={"table mb-0 " + this.state.PaginationVisibilityClass} id={(this.props.GridProperties.GridName + "GridResults")}>
                    <tbody>
                        <tr>
                            <td className="border-0 p-0">
                                <ul className="pagination pagination-sm float-right">
                                    <li className="page-item" id={this.state.gridProperties.GridName + "First"}><a className="page-link" href="#" disabled={true} onClick={this._OnFirstPageButtonClick}><i className="fa fa-angle-double-left"></i></a></li>
                                    <li className="page-item" id={this.state.gridProperties.GridName + "Previous"}><a className="page-link" href="#" onClick={this._OnPreviousPageButtonClick}><i className="fa fa-angle-left"></i></a></li>
                                    <li className="page-item " id={this.state.gridProperties.GridName + "Current"}><a className="page-link" href="#" >Page {nCurrentPageNumber} of {nTotalPagesCount}</a></li>
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
                                    <tbody>{this.state.ModalForm}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );

    }
}