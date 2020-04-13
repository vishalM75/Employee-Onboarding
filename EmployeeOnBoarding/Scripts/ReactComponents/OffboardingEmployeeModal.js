"use strict";
let OffboardingEmployeeModalComponent = null;
let offboardReportColumnProps = null;
let oOffboardGridProps = null;
let offboardedEmployeeId = null;

class OffboardingEmployeeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Itemid: this.props.ItemId,
            UpdateData: this.props.HandleDataUpdate,
            ModalHeading: "My Offboarding",
            TaskGrid: null,
            GridRows: null,
            OffboardEmpTasksDT: null
        };
        OffboardingEmployeeModalComponent = this;
        OffboardingEmployeeModalComponent.DataGrid = React.createRef();
        OffboardingEmployeeModalComponent.SetOffboardColumnProps();
        OffboardingEmployeeModalComponent.setOffboardGridProps();
    }

    componentDidMount() {
        try {
            OffboardingEmployeeModalComponent.InitializeSettings();

            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#OffboardEmployeeTaskSearchbtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#OffboardEmployeeTaskSearchbtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor);
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                CategoryComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.componentDidMount"); }
    }
    
    InitializeGridComponent() {
        try {
            let FilterText = "OData__EmployeeID eq " + offboardedEmployeeId;
            let OffboardEmpTasksDataTable = <DataTableMain GridProperties={oOffboardGridProps} FilterText={FilterText} ref={OffboardingEmployeeModalComponent.DataGrid} ></DataTableMain>
            OffboardingEmployeeModalComponent.setState({ OffboardEmpTasksDT: OffboardEmpTasksDataTable }, function () { EOBConstants.SetNewThemeColor() });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.InitializeGridComponent"); }
    }

    _OnResetClick() {
        try {
            $("#OffboardEmployeeGridSearchTextBox").val("");
            OffboardingEmployeeModalComponent._OnSearchClick();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._OnResetClick"); }
    }
    InitializeSettings() {
        try {
            var modal = document.getElementById("OffboardingEmployeeModal");
            modal.style.display = "block";

            OffboardingEmployeeModalComponent.GetEmployeeData();
            OffboardingEmployeeModalComponent.InitializeGridComponent();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.InitializeSettings"); }
    }

    GetEmployeeData() {
        try {
            var Url = ""
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeOnBoard + "')/items?$orderby=ID asc&$select=ID%2COData__EmployeeName%2CDOJ%2COData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle%2COData__StatusE%2COData__EmployeeNumber&$expand=OData__Position%2F_PositionName%2CProcess%2FTitle%2COData__Department%2F_DepartmentName%2COData__EmployeeType%2F_EmployeeType%2COData__Manager%2FTitle&$filter=OffBoardEmployeeID eq '" + _spPageContextInfo.userId + "' and Process/ID eq '2' ";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, OffboardingEmployeeModalComponent._onEmployeeItemGet, OffboardingEmployeeModalComponent._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.GetEmployeeData"); }
    }

    _onEmployeeItemGet(data) {
        try {
            offboardedEmployeeId = data.d.results[0].ID;
            var Name = data.d.results[0].OData__EmployeeName;
            if (Name != null) {
                $("#lblEmployeeName").text(Name);
            }
            else {
                $("#lblEmployeeName").text("");
            }

            var Manager = data.d.results[0].OData__Manager.results[0].Title;
            if (Manager != null) {
                $("#lblManager").text(Manager);
            }
            else {
                $("#lblManager").text("");
            }

            var Department = data.d.results[0].OData__Department._DepartmentName;
            if (Department != null) {
                $("#lblDepartment").text(Department);
            }
            else {
                $("#lblDepartment").text("");
            }

            var RelievingDate = moment(data.d.results[0].DOJ).format("MM/DD/YYYY");
            if (RelievingDate != null) {
                $("#lblRelievingDate").text(RelievingDate);
            }
            else {
                $("#lblRelievingDate").text("");
            }

            var EmployeeNumber = data.d.results[0].OData__EmployeeNumber;
            if (EmployeeNumber != null) {
                $("#lblEmployeeID").text(EmployeeNumber);
            }
            else {
                $("#lblEmployeeID").text("");
            }


            var Position = data.d.results[0].OData__Position._PositionName;
            if (Position != null) {
                $("#lblPosition").text(Position);
            }
            else {
                $("#lblPosition").text(Position);
            }


            var EmployeeType = data.d.results[0].OData__EmployeeType._EmployeeType;
            if (EmployeeType != null) {
                $("#lblEmployeeType").text(EmployeeType);
            }
            else {
                $("#lblEmployeeType").text("");
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._onEmployeeItemGet"); }

    }
    _onItemSaveFailed(data) {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._onItemSaveFailed"); }
    }
    SetOffboardColumnProps() {
        try {
            offboardReportColumnProps = [];

            var colEmployee = new ColumnProperties("OData__EmployeeID", "Employee Name", "", false, true, "Lookup", "", true, "_EmployeeName");
            offboardReportColumnProps.push(colEmployee);

            var colTitle = new ColumnProperties("Title", "Task Name", 27, true, true, "text", "", false, "");
            offboardReportColumnProps.push(colTitle);


            var colDepartmentID = new ColumnProperties("Departments", "Department", "", true, true, "Lookup", "", true, "_DepartmentName");
            offboardReportColumnProps.push(colDepartmentID);

            var colAssignedTo = new ColumnProperties("AssignedTo", "Assigned To", "", true, true, "People", "", false, "");
            offboardReportColumnProps.push(colAssignedTo);

            var colStartDate = new ColumnProperties("StartDate", "Start Date", "", true, true, "text", "MM/DD/YYYY", false, "", null);
            offboardReportColumnProps.push(colStartDate);

            var colEndDate = new ColumnProperties("TaskEndDate", "End Date", "", true, true, "text", "MM/DD/YYYY", false, "", null);
            offboardReportColumnProps.push(colEndDate);

            var colActivity = new ColumnProperties("DueDate", "Due Date", "", true, true, "text", "MM/DD/YYYY", false, "", OffboardingEmployeeModalComponent._isDueDateExceed);
            offboardReportColumnProps.push(colActivity);

            var colCategoryID = new ColumnProperties("OData__IDCategory", "CategoryId", "", false, true, "Lookup", "", true, "Id");
            offboardReportColumnProps.push(colCategoryID);

            var colCategory = new ColumnProperties("OData__IDCategory", "Category", "", true, true, "Lookup", "", true, "CategoryName1");
            offboardReportColumnProps.push(colCategory);

            var colStatus = new ColumnProperties("Status", "Status", "", true, true, "text", "", false, "");
            offboardReportColumnProps.push(colStatus);

            //var colRemark = new ColumnProperties("Remark", "Remark", "", true, true, "text", "", false, "");
            //offboardReportColumnProps.push(colRemark);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.SetOffboardColumnProps"); }

    }
    setOffboardGridProps() {
        try {
            //let FilterText = "OData__EmployeeID eq " + offboardedEmployeeId;
            oOffboardGridProps = new GridProperties("gridOffboardEmp", EOBConstants.ListNames.ActualTasks, offboardReportColumnProps, "", "", true, 10, "", false, false, false, null, null, null, OffboardingEmployeeModalComponent.HideLoader, false, false, false, EOBConstants.ClassNames.SwitchTitleColor, OffboardingEmployeeModalComponent.GridDataModifications, false);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.setOffboardGridProps"); }
    }
    GridDataModifications(gridData) {
        try {
            for (var i = 0; i < gridData.length; i++) {
                if (gridData[i].Status == "Open") {
                    gridData[i].Status = "Not Started";
                }
            }
            return gridData;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.GridDataModifications"); }
    }
    HideLoader() {
        try {
            EOBConstants.SetNewThemeColor();
            $('#loading').hide();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.HideLoader"); }
    }
    CloseModal() {
        try {
            var modal = document.getElementById("OffboardingEmployeeModal");
            modal.style.display = "none";
            OffboardingEmployeeModalComponent.HandleUpdate();
            OffboardingEmployeeModalComponent._OnResetClick();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.CloseModal"); }
    }
    HandleUpdate() {
        try {
            OffboardingEmployeeModalComponent.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.HandleUpdate"); }
    }
   
    _isDueDateExceed(FieldValue) {
        try {
            if (FieldValue == "Invalid date") {
                var EmptyDate = <td> </td>
                return EmptyDate;
            }
            var CurrentDate = new Date();
            var CurrentDateString = CurrentDate.getDate() + "/" + (CurrentDate.getMonth() + 1) + "/" + CurrentDate.getFullYear()
            var DueDate = moment(FieldValue, 'DD/MM/YYYY');
            var TodayDate = moment(CurrentDate, "DD/MM/YYYY");
            //var isDateDue = (TodayDate > DueDate) ? true : false
            var CurrentDate1 = new Date(CurrentDate.getFullYear(), (CurrentDate.getMonth() + 1), CurrentDate.getDate(), 0, 0, 0);
            var DueDate1 = new Date(DueDate.year(), (DueDate.month() + 1), DueDate.date(), 0, 0, 0);
            var isDateDUe1 = moment(CurrentDate1).isAfter(DueDate1, 'day');
            var isDateDue = moment(TodayDate._i).isAfter(DueDate._i, 'day');
            var DueDateTD = null;
            //css class is not reflecting so currently doing through this way
            var OverDueBorderStyle = {
                color: "#ea0b0b"
            };
            if (isDateDUe1) {
                // date is past
                DueDateTD = <td style={OverDueBorderStyle}>{FieldValue}</td>
            } else {
                // date is future
                DueDateTD = <td>{FieldValue}</td>
            }
            return DueDateTD;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._isDueDateExceed"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                OffboardingEmployeeModalComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent.CheckAndSearch"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#OffboardEmployeeGridSearchTextBox").val();

            var FilterText = "";
            FilterObject = [];
            if (FreeText != "") {
                FilterText = "substringof('" + encodeURIComponent(FreeText) + "',Title)";
                FilterObject.push(FilterText);
            }

            FilterText = "";
            //FilterText = "OData__EmployeeID/ID eq " + _spPageContextInfo.userId;
            FilterText = "OData__EmployeeID eq " + offboardedEmployeeId;
            FilterObject.push(FilterText);

            OffboardingEmployeeModalComponent.DataGrid.current.CreateFilterString(FilterObject);
            $("#" + "OffboardEmployeeTaskFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._OnSearchClick"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#OffboardEmployeeGridSearchTextBox", Type: "text" },

            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "OffboardEmployeeTaskFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "OffboardingEmployeeModalComponent._UpdateSearchIcon"); }
    }
    render() {
        return (
            <div id="OffboardingEmployeeModal" className="modalReact pt-2">
                <div className="modal-contentReact col-lg-9 col-md-10">
                    <div className="row modal-head align-items-center">
                        <div id="OffboardedEmployeeTaskHeadingDiv" className="col-10">
                            <p className="f-16 m-0 SwitchTitleColor">{OffboardingEmployeeModalComponent.state.ModalHeading}</p>
                        </div>
                        <div className="col-2 text-right">
                            <span className="closeModalReact SwitchTitleColor" onClick={OffboardingEmployeeModalComponent.CloseModal}>&times;</span>
                        </div>
                    </div>
                    <div className="row modal-body modal-form">
                        <div className="col-12">
                                

                            <div className="row section mb-2">
                                <div className="col-md-3 col-sm-6 col-12 search">
                                    <div className="form-group m-0">
                                        <input onKeyDown={OffboardingEmployeeModalComponent.CheckAndSearch} className="form-control form-control-sm" onChange={OffboardingEmployeeModalComponent._UpdateSearchIcon} type="Search" id="OffboardEmployeeGridSearchTextBox" placeholder="Search By Task Name" />
                                        <i className="search-icon fa fa-search modal-search-icon"></i>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12 modal-search-btn pl-0">
                                    <button type="Button" data-toggle="tooltip" title="Search" id="OffboardEmployeeTaskSearchbtn" className="btn btn-primary mr-2 modalBtn" onClick={OffboardingEmployeeModalComponent._OnSearchClick} ><i id="OffboardEmployeeTaskFilterIcon" className="fa fa-search active SwitchTitleColor"></i></button>
                                    <button type="Button" data-toggle="tooltip" title="Reset" id="OffboardEmployeeTaskRefreshbtn" className="btn btn-light" onClick={OffboardingEmployeeModalComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                                </div>
                            </div>
                            
                            <div className="row section">                          
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group">
                                        <label ><strong>Name:</strong></label>
                                        <p id="lblEmployeeName" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group">
                                        <label ><strong>Manager:</strong></label>
                                        <p id="lblManager" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group">
                                        <label ><strong>Department:</strong></label>
                                        <p id="lblDepartment" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group input-with-icon">
                                        <label ><strong>Date of Relieving:</strong></label>
                                        <p id="lblRelievingDate" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group">
                                        <label><strong>Employee Number:</strong></label>
                                        <p id="lblEmployeeID" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 col-12">
                                    <div className="form-group">
                                        <label><strong>Position:</strong></label>
                                        <p id="lblPosition" className="font-weight-normal"></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label><strong>Employee Type:</strong></label>
                                        <p id="lblEmployeeType" className="font-weight-normal"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {OffboardingEmployeeModalComponent.state.OffboardEmpTasksDT}
                    </div>
                    <div className="row modal-footer align-items-center">
                 
                    </div>
                </div>

            </div>
        );
    }
}

