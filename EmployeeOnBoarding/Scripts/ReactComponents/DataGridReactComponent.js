"use strict";
let DataGridComponenthis = null;
let nGridDataStartIndex = 1;
let nGridDataSearchStartIndex = 0;
let arHeaderArray = [];
let oCurrentViewGridData = [];
let nTotalItemsCount = 0;
let nCurrentPageNumber = 1;
let isSearchInitiated = false;
let nGreatestIDofListItems = 0;
let nCurrentGridStartIndex = 0;
let nCurrentGridLastIndex = 0;
let sAdditionalFilterInSPItems = [];
class DataGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemsPerPage: this.props.ItemsPerPage,
            listName: this.props.ListName,
            headerDefinitions: this.props.HeaderDefinitions,
            headerDisplayNames: this.props.HeaderDisplayNames,
            enableEdit: this.props.EnableEdit,
            enableDelete: this.props.EnableDelete,
            GridID: this.props.GridID,
            GridTableHeading: null,
            GridRows: null,
            minimumCharForSearch: this.props.MinimumCharForSearch,
            ModalHeading: "",
            ModalForm: null,
            ResultsString: "",
            previousDisable: true,
            nextDisable: false,
            searchField: this.props.SearchField,
            editHandle: this.props.EditHandle,
            deleteHandle: this.props.DeleteHandle,
            activeFieldInternalName: this.props.ActiveFieldInternalName,
            lookupFieldObject: this.props.LookUpFieldObject,
            afterRenderFunction: this.props.AfterRenderFunction
        };
        DataGridComponenthis = this;
        DataGridComponenthis.InitAppParameters();

        //FormComponenthis.Modal = React.createRef();
    }
    componentWillMount() {

    }
    componentDidMount() {
        DataGridComponenthis.ReCreateGrid();
    }

    InitAppParameters() {
        BKJSShared.Application.Name = "EOB";
        BKJSShared.Application.PlatForm = "SharePoint Add-in";
        BKJSShared.Application.isSPFx = false;
    }
    ReCreateGrid() {
        oCurrentViewGridData = [];
        nCurrentGridStartIndex = 0;
        arHeaderArray = [];
        DataGridComponenthis.GetSPListItemsCount();
        DataGridComponenthis.GetSPListItems();
        DataGridComponenthis.CreateGridHeader();
    }
    GetSPListItems(ItemsPerPage) {
        oCurrentViewGridData = [];
        var CurrentItemsPerPage = DataGridComponenthis.state.itemsPerPage;
        if (ItemsPerPage) {
            CurrentItemsPerPage = ItemsPerPage;
        }
        
        var nTotalNoOfPages = Math.ceil(nTotalItemsCount / CurrentItemsPerPage);
        var Columns = Object.keys(DataGridComponenthis.props.HeaderDefinitions).join(",");
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + DataGridComponenthis.state.listName + "')/items?$select=" + Columns;
        var LookUpString = "";
        if (DataGridComponenthis.state.lookupFieldObject) {
            for (var i = 0; i < DataGridComponenthis.state.lookupFieldObject.length; i++) {
                Url = Url.replace(("," + DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"]), "");
                LookUpString += ","
                LookUpString += DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"];
                LookUpString += "/" + DataGridComponenthis.state.lookupFieldObject[i]["SpecificFieldFethInternalName"];
                LookUpString += "&$expand=" + DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"] + "/" + DataGridComponenthis.state.lookupFieldObject[i]["SpecificFieldFethInternalName"];
            }
            Url = Url + LookUpString;
        }
        if (sAdditionalFilterInSPItems.length > 0) {
            sAdditionalFilterInSPItems = BKJSShared.RemoveDuplicateValuesFromArray(sAdditionalFilterInSPItems)
            var AllFilters = sAdditionalFilterInSPItems.join('')
            Url = Url + AllFilters;
        }
        Url += "&%24skiptoken=Paged%3DTRUE%26p_ID%3D" + nCurrentGridStartIndex;
        Url += "&%24top=" + CurrentItemsPerPage;
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, DataGridComponenthis._onItemGet, DataGridComponenthis._onRestCallFailure)
    }

    GetSPListItemsCount() {
        var ListTotalCountUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('" + DataGridComponenthis.state.listName + "')/ItemCount";
        BKJSShared.AjaxCall(ListTotalCountUrl, null, BKJSShared.HTTPRequestMethods.GET, false, DataGridComponenthis._onTotalItemsGet, DataGridComponenthis._onRestCallFailure)
    }

    CreateGridHeader() {
        let HeaderArray = [];
        $.each(DataGridComponenthis.props.HeaderDefinitions, function (key, value) {
            let GridHeader = null;
            let DisplayName = DataGridComponenthis.state.headerDisplayNames[key]
            if (value == "String") {
                if (key == DataGridComponenthis.state.activeFieldInternalName || key == "ID") {
                    GridHeader = <th width="5%"><a href="#" key={key} onClick={DataGridComponenthis.SortStringData}>{DisplayName}</a></th>
                }
                else {
                    GridHeader = <th ><a href="#" key={key} onClick={DataGridComponenthis.SortStringData}>{DisplayName}</a></th>
                }

            }
            else if (value == "Number") {
                if (key == DataGridComponenthis.state.activeFieldInternalName || key == "ID") {
                    GridHeader = <th width="5%"><a href="#" key={key} onClick={DataGridComponenthis.SortNumberData}>{DisplayName}</a></th>
                }
                else {
                    GridHeader = <th ><a href="#" key={key} onClick={DataGridComponenthis.SortNumberData}>{DisplayName}</a></th>
                }
                //GridHeader = <th ><a href="#" key={key} onClick={DataGridComponenthis.SortNumberData}>{DisplayName}</a></th>
            }
            HeaderArray.push(GridHeader);
        });
        if (DataGridComponenthis.props.EnableEdit) {
            var GridEditHeader = <th width="5%"><a key={"EditCategory"} >Action</a></th>;
            HeaderArray.push(GridEditHeader);
        }
        //if (DataGridComponenthis.props.EnableDelete) {
        //    var GridDeleteHeader = <th><a key={"DeleteCategory"} >Delete</a></th>
        //    HeaderArray.push(GridDeleteHeader);
        //}
        DataGridComponenthis.setState({ GridTableHeading: HeaderArray });
    }

    DONOne() {
        return false;
    }

    CreateGridRows(GridData, isSortedData, isDataFromSearch) {
        var DataRows = [];
        if (GridData.length > 0) {
            nCurrentGridStartIndex = GridData[(GridData.length - 1)]["ID"];
            nCurrentGridLastIndex = GridData[0]["ID"];
        }
        for (var k = 0; k < GridData.length; k++) {
            var Row = [];
            var DataObject = {};
            $.each(DataGridComponenthis.state.headerDefinitions, function (key, value) {
                let FieldValue = GridData[k][key];
                // if (key !== "__metadata" && key !== "Id") {
                let GridRow = null;

                if (typeof (FieldValue) == "string" || typeof (FieldValue) == "number") {
                    GridRow = <td>{FieldValue}</td>
                }
                else if (typeof (FieldValue) == "boolean") {
                    if (FieldValue) {

                        GridRow = <td className="text-center">
                            <label className="switch success">
                                <input class="success" type="checkbox" id={(GridData[k]["ID"] + "Active")} checked />
                                <span className="slider round"></span>
                            </label>
                        </td>
                    }
                    else {
                        GridRow = <td className="text-center">
                            <label className="switch success">
                                <input class="success" type="checkbox" disabled id={(GridData[k]["ID"] + "Active")} />
                                <span className="slider round"></span>
                            </label>
                        </td>
                    }
                }
                else if (typeof (FieldValue) == "object" && FieldValue !== null) {
                    if (DataGridComponenthis.state.lookupFieldObject) {
                        for (var i = 0; i < DataGridComponenthis.state.lookupFieldObject.length; i++) {
                            if ([DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"]] == key) {
                                let Value = FieldValue[DataGridComponenthis.state.lookupFieldObject[i]["SpecificFieldFethInternalName"]]
                                GridRow = <td>{Value}</td>
                            }
                        }
                    }

                }
                if (FieldValue == null) {
                    GridRow = <td>{""}</td>
                }
                Row.push(GridRow);
                DataObject[key] = FieldValue;
                // }
            });
            if (!isSortedData) {
                oCurrentViewGridData.push(DataObject);
            }
            if (DataGridComponenthis.props.EnableEdit) {
                let EditRow = <td className="text-center"><a className="icon-blue" id={(GridData[k]["ID"] + "EditRow")} onClick={DataGridComponenthis.EditRow}><i className="fa fa-pencil mr-3"></i></a> <a className="icon-red" id={(GridData[k]["ID"] + "DeleteRow")} onClick={DataGridComponenthis.DeleteRow}><i className="fa fa-trash"></i></a></td>
                Row.push(EditRow);
            }
           
            let DataSingleRow = <tr id={(GridData[k]["ID"] + "Row")}> {Row} </tr>
            DataRows.push(DataSingleRow);
        }

        DataGridComponenthis.setState({ GridRows: DataRows }, function () { DataGridComponenthis.props.AfterRenderFunction() });

        DataGridComponenthis.UpdateSearchResultsFound(GridData.length, isDataFromSearch);
        if (GridData.length < DataGridComponenthis.itemsPerPage) {
            DataGridComponenthis.setState({ nextDisable: true });
        }
        if (GridData.length == nTotalItemsCount) {
            DataGridComponenthis.setState({ nextDisable: true });
        }
        if (nTotalItemsCount > GridData.length) {
            if (nTotalItemsCount > DataGridComponenthis.state.itemsPerPage) {
                DataGridComponenthis.setState({ nextDisable: false });
            }
            else {
                DataGridComponenthis.setState({ nextDisable: true });
            }
        }
        nCurrentGridStartIndex = oCurrentViewGridData[oCurrentViewGridData.length - 1]["ID"];
        nGridDataStartIndex = oCurrentViewGridData[0]["ID"];
    }

    SortStringData(event) {
        let FieldName = "";
        $.each(DataGridComponenthis.state.headerDisplayNames, function (key, value) {
            if (value == event.currentTarget.innerText) {
                FieldName = key;
            }
        })
        var SortedData = DataGridComponenthis.DynamicSort(FieldName);
        //var SortedData = oCurrentViewGridData.sort(DataGridComponenthis.DynamicSort(FieldName));
        DataGridComponenthis.CreateGridRows(SortedData, true)
    }

    SortNumberData(event) {
        let FieldName = "";
        $.each(DataGridComponenthis.state.headerDisplayNames, function (key, value) {
            if (value == event.currentTarget.innerText) {
                FieldName = key;
            }
        })
        var SortedData = DataGridComponenthis.DynamicSort(FieldName, true);
        //var SortedData = oCurrentViewGridData.sort(DataGridComponenthis.DynamicSort(FieldName));
        DataGridComponenthis.CreateGridRows(SortedData, true)
    }

    EditRow(event) {
        //console.log(event);
        DataGridComponenthis.GetGridHeaders();
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
        console.log(DataObject);
        DataGridComponenthis.props.EditHandle(DataObject);
        //DataGridComponenthis.ShowDataInModal(DataObject,"EditItem");
    }

    ShowDataInModal(DataObject, ModalHeadingText) {

        let FormRowArray = [];
        $.each(DataObject, function (key, value) {
            if (key !== "ID") {
                var FormRow = <tr><td> {key} </td> <td> <input type="text" defaultValue={value} /> </td></tr>;
            }
            else {
                var FormRow = <tr><td> {key} </td> <td> <input type="text" value={value} readonly /> </td></tr>;
            }

            FormRowArray.push(FormRow);
        });
        var Buttons = <tr><td><input type="Button" value="Save" /> </td><input type="Button" value="Close" onClick={DataGridComponenthis.CloseModal} /> <td> </td></tr>
        FormRowArray.push(Buttons);
        DataGridComponenthis.setState({ ModalHeading: ModalHeadingText });
        DataGridComponenthis.setState({ ModalForm: FormRowArray }, function () {
            var modal = document.getElementById("myModal1");
            modal.style.display = "block";
        });
    }

    DeleteRow(event) {
        DataGridComponenthis.GetGridHeaders();
        let RowID = event.currentTarget.id;
        RowID = RowID.replace("DeleteRow", "Row")
        var TDs = $('#' + RowID).find("td")
        var DataObject = {};
        for (var i = 0; i < TDs.length; i++) {
            if (arHeaderArray[i] == "Edit" || arHeaderArray[i] == "Delete") {
                continue;
            }
            DataObject[arHeaderArray[i]] = TDs[i].innerText;
        }
        console.log(DataObject);
        DataGridComponenthis.props.DeleteHandle(DataObject);
    }

    SearchData(SearchString) {
        var Searchtext = "";
        if (SearchString == "") {
            Searchtext = $("#" + (DataGridComponenthis.state.GridID + "SearchTextBox")).val();
        }
        else {
            Searchtext = SearchString;
        }
        //var Searchtext = $("#" + (DataGridComponenthis.state.GridID + "SearchTextBox")).val();
        if (Searchtext.length >= DataGridComponenthis.props.MinimumCharForSearch) {
            isSearchInitiated = true;
            var Columns = Object.keys(DataGridComponenthis.props.HeaderDefinitions).join(",");
            if (DataGridComponenthis.state.lookupFieldObject) {
                for (var i = 0; i < DataGridComponenthis.state.lookupFieldObject.length; i++) {
                    Columns = Columns.replace(("," + DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"]), "");
                    Columns += ","
                    Columns += DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"];
                    Columns += "/" + DataGridComponenthis.state.lookupFieldObject[i]["SpecificFieldFethInternalName"];
                    Columns += "&$expand=" + DataGridComponenthis.state.lookupFieldObject[i]["FieldInternalName"];
                }
            }

            //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + DataGridComponenthis.props.ListName + "')/items?$filter=substringof('" + ($("#" + DataGridComponenthis.state.GridID + "SearchTextBox").val()) + "',Title)$select="+Columns;
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + DataGridComponenthis.props.ListName + "')/items?$select=" + Columns + "&$filter=substringof('" + ($("#" + DataGridComponenthis.state.GridID + "SearchTextBox").val()) + "'," + DataGridComponenthis.state.searchField + ")";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, DataGridComponenthis._onSearchSuccess, DataGridComponenthis._onRestCallFailure)
        }
        if (Searchtext == "") {

            DataGridComponenthis.ReCreateGrid();

        }
    }

    GetNextOrPreviousSearchData() {
        var CurrentItemsPerPage = DataGridComponenthis.state.itemsPerPage;
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + DataGridComponenthis.props.ListName + "')/items?$select=" + Columns + "&$filter=substringof('" + ($("#" + DataGridComponenthis.state.GridID + "SearchTextBox").val()) + "',Title)";
        Url += "&%24skiptoken=Paged%3DTRUE%26p_ID%3D" + nGridDataSearchStartIndex;
        Url += "&%24top=" + CurrentItemsPerPage;
    }

    ResetDataGrid() {
        oCurrentViewGridData = [];
        DataGridComponenthis.GetSPListItems();
    }

    GetGridHeaders() {
        var GridHeader = (DataGridComponenthis.state.GridID + "GridHeader");
        var THs = $("#" + GridHeader).find("th");
        for (var i = 0; i < THs.length; i++) {
            arHeaderArray.push(THs[i].innerText);
        }
    }

    DynamicSort(property, isNumber) {
        let ListItemsData
        if (isNumber) {
            ListItemsData = oCurrentViewGridData.sort(function (a, b) {
                return parseFloat(a[property]) - parseFloat(b[property]);
                // return a[property].localeCompare(b[property]);
            });
        }
        else {
            ListItemsData = oCurrentViewGridData.sort(function (a, b) {
                return a[property].localeCompare(b[property]);
            });
        }
        return ListItemsData;
        //var sortOrder = 1;
        //if (property[0] === "-") {
        //    sortOrder = -1;
        //    property = property.substr(1);
        //}
        //return function (a, b) {
        //    /* next line works with strings and numbers,
        //     * and you may want to customize it to your needs
        //     */
        //    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        //    return result * sortOrder;
        //}
    }

    CloseModal() {
        var modal = document.getElementById("myModal1");
        modal.style.display = "none";
        DataGridComponenthis.setState({ ModalHeading: null });
        DataGridComponenthis.setState({ ModalForm: null });
    }

    UpdateSearchResultsFound(ItemsCount, isDataFromSearch) {

        let TotalString = ""
        let Start = parseInt(nGridDataStartIndex);
        let End = (nGridDataStartIndex + DataGridComponenthis.state.itemsPerPage);

        if (ItemsCount <= nTotalItemsCount) {
            if (ItemsCount < DataGridComponenthis.state.itemsPerPage) {
                TotalString = "Showing " + Start + " - " + nTotalItemsCount + " from " + nTotalItemsCount + " records.";
            }
            else {
                TotalString = "Showing " + Start + " - " + End + " from " + nTotalItemsCount + " records.";
            }

            if (isDataFromSearch) {
                TotalString = "Showing " + ItemsCount + " records. Filter from " + nTotalItemsCount + " records.";
            }
        }
        //else {
        //    TotalString = "Showing " + Start + " - " + End + " from " + nTotalItemsCount + " records.";
        //}             
        DataGridComponenthis.setState({ ResultsString: TotalString });
    }

    _onSearchSuccess(data) {
        DataGridComponenthis.CreateGridRows(data.d.results, null, true);
    }

    _onItemGet(data) {
        DataGridComponenthis.CreateGridRows(data.d.results);
        console.log(data)
    }

    _onTotalItemsGet(data) {
        nTotalItemsCount = data.d.ItemCount;
    }

    _onRestCallFailure(data) {
        console.log(data)
    }

    _onItemsPerPageChange() {
        let SelectedItemsPerPage = document.getElementById(DataGridComponenthis.state.GridID + "ItemsPerPageSelect");
        SelectedItemsPerPage = SelectedItemsPerPage.value;
        oCurrentViewGridData = [];
        nCurrentGridStartIndex = 0;
        DataGridComponenthis.ReCreateGrid();
        DataGridComponenthis.setState({ itemsPerPage: SelectedItemsPerPage });
    }

    _onNextData() {

        let CurrentIndex = nCurrentGridStartIndex;
        nCurrentGridStartIndex = parseInt(nCurrentGridStartIndex) + parseInt(DataGridComponenthis.state.itemsPerPage);
        if (nCurrentGridStartIndex <= nTotalItemsCount - 1) {
            DataGridComponenthis.GetSPListItems();
            if (nCurrentGridStartIndex == nTotalItemsCount - 1) {
                DataGridComponenthis.setState({ nextDisable: true });
            }
        }
        else {
            nCurrentGridStartIndex = CurrentIndex;
        }

        if ((parseInt(nCurrentGridStartIndex) + parseInt(DataGridComponenthis.state.itemsPerPage)) == nTotalItemsCount) {
            DataGridComponenthis.setState({ nextDisable: true });
        }
        else {
            DataGridComponenthis.setState({ previousDisable: false });
        }

    }

    _onPreviousData() {

        let CurrentIndex = nCurrentGridStartIndex;
        nCurrentGridStartIndex = parseInt(nCurrentGridStartIndex) - parseInt(DataGridComponenthis.state.itemsPerPage);
        if (nCurrentGridStartIndex >= 0) {

            DataGridComponenthis.GetSPListItems();

        }
        else {
            nCurrentGridStartIndex = CurrentIndex;

        }

        if (nCurrentGridStartIndex == 0) {
            DataGridComponenthis.setState({ previousDisable: true });
        }
        else {
            DataGridComponenthis.setState({ nextDisable: false });
        }
    }

    render() {
        return (
            <div >
                <div>
                    <table className="table" id={DataGridComponenthis.props.GridID} >
                        <tbody>
                            <tr>
                                <td className="border-0 p-0">
                                    <select className="form-control form-control-sm w-auto mr-3 float-right" id={DataGridComponenthis.state.GridID + "ItemsPerPageSelect"} onChange={DataGridComponenthis._onItemsPerPageChange}>
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
                <div className="tbl-h-470">
                    <table className="table table-striped table-bordered" id={DataGridComponenthis.props.GridID} >
                        <thead>
                            <tr id={(DataGridComponenthis.state.GridID + "GridHeader")}>
                                {DataGridComponenthis.state.GridTableHeading}
                            </tr>
                        </thead>
                        <tbody>

                            {DataGridComponenthis.state.GridRows}
                        </tbody>
                    </table>
                </div>
                <table className="table" id={(DataGridComponenthis.props.GridID + "GridResults")} >
                    <tbody>
                        <tr>
                            <td className="border-0 p-0">{DataGridComponenthis.state.ResultsString}</td>
                            <td className="border-0 p-0">
                                <ul className="pagination pagination-sm float-right">
                                    <input className="page-item" disabled={DataGridComponenthis.state.previousDisable} id="Previous" type="Button" value="Previous" onClick={DataGridComponenthis._onPreviousData} />
                                    <input className="page-item" id="Next" type="Button" value="Next" disabled={DataGridComponenthis.state.nextDisable} onClick={DataGridComponenthis._onNextData} />
                                </ul>
                            </td>
                            <td className="border-0 p-0">
                                <ul className="pagination pagination-sm float-right">
                                    <li className="page-item"><a className="page-link" href="#">First</a></li>
                                    <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                                    <li className="page-item"><a className="page-link" href="#">Page 1 of 5</a></li>
                                    <li className="page-item"><a className="page-link" href="#">Next</a></li>
                                    <li className="page-item"><a className="page-link" href="#">Last</a></li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div id="myModal1" className="modalReact">
                    <div className="modal-contentReact">
                        <div>
                            <span className="closeModalReact" onClick={DataGridComponenthis.CloseModal}>&times;</span>
                            <p>{DataGridComponenthis.state.ModalHeading}</p>
                            <div>
                                <table>
                                    <tbody>
                                        {DataGridComponenthis.state.ModalForm}
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
