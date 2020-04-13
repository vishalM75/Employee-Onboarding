"use strict";
let EmailTemplateComponent = null;
let oEmailTemplateColumnProps = null;
let oLookupColumnProps = null;
let oEmailTemplateGridProps = null;
let isDeleteDialogOpened = false;
var FilterObject = [];
class EmailTemplateMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            DepartmentDialog: null,
            DeleteDialog: null,
            EmailTemplates:null,
        }
        EmailTemplateComponent = this;
       // EmailTemplateComponent.DataGrid = React.createRef();
      //  this.SetEmailTemplateColumnProps();
       // this.setDepartmentGridProps();
        this.GetEmailTemplateItems = this.GetEmailTemplateItems.bind(this);            
        this._onItemGet = this._onItemGet.bind(this);
        this._onItemGetFailure = this._onItemGetFailure.bind(this);        
        this._OnSearchClick = this._OnSearchClick.bind(this); 
    }
    componentDidMount() {
        try {
            let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
            $("#DepartmentSearchBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            $("#DepartmentSearchBtn").attr('style', "color:" + Color + " !important");
            $(".btn-primary").css("background-color", ConfigModal.gConfigSettings.ThemeColor)
            //BKSPShared.InitSPObject();
            EOBConstants.SetNewThemeColor();
            $('input[type=search]').on('search', function () {
                EmailTemplateComponent._OnResetClick()
            });
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            setTimeout(EmailTemplateComponent.GetEmailTemplateItems, 600);
            
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.componentDidMount"); }

    }
    SetEmailTemplateColumnProps() {
        try {
            oEmailTemplateColumnProps = [];

            var colID = new ColumnProperties("ID", "ID", "3", false, true, "Number", "", false, "");
            oEmailTemplateColumnProps.push(colID);

            var colDepartmentName = new ColumnProperties("TemplateType", "Template Type", "10", true, true, "Text", "", false, "");
            oEmailTemplateColumnProps.push(colDepartmentName);

            var colDepartmentName = new ColumnProperties("Subject", "Subject", "15", true, true, "Text", "", false, "");
            oEmailTemplateColumnProps.push(colDepartmentName);

            var colActive = new ColumnProperties("EmailTemplate", "Email Template Body", "68", true, true, ReactDataGridConstants.ColumnTypes.RichText, "", false, "");
            oEmailTemplateColumnProps.push(colActive);

            var colActive = new ColumnProperties("IsActive1", "Active", "7", true, true, "Checkbox", "");
            oEmailTemplateColumnProps.push(colActive);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.SetEmailTemplateColumnProps"); }
    }
    setDepartmentGridProps() {
        try {
            oEmailTemplateGridProps = new GridProperties("EmailTemplateDataGrid", EOBConstants.ListNames.EmailTemplates, oEmailTemplateColumnProps, "", "", true, 10, "", true, false, false, EmailTemplateComponent.OpenAddEmailTemplate, null, "", "", null, null, null, EOBConstants.ClassNames.SwitchTitleColor);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.setDepartmentGridProps"); }
    }
   
    UpdateGrid() {
        try {
            EmailTemplateComponent.DataGrid.current.CreateGrid();
            EmailTemplateComponent.setState({ EmailTemplateDialog: false });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.UpdateGrid"); }
    }
    OpenAddEmailTemplate(DataObject) {
        try {
            let Dialog = null;
            if (DataObject["ID"]) {
                Dialog = <EmailTemplateDialog isEdit={true} EditID={DataObject["ID"]} ButtonText={"Update"} DepartmentName={DataObject["Template Type "]} isActive={null} ModalHeading={"Edit Email Template"} HandleDataUpdate={EmailTemplateComponent.UpdateGrid}></EmailTemplateDialog>
            }

            EmailTemplateComponent.setState({ EmailTemplateDialog: Dialog });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.OpenAddEmailTemplate"); }
    }
    CheckAndSearch(Event) {
        try {
            if (event.keyCode == '13') {
                event.preventDefault();
                EmailTemplateComponent._OnSearchClick();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.CheckAndSearch"); }
    }
    GetEmailTemplateItems(FilterString) {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items";
            if (FilterString) {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items?" + FilterString;
            }
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onItemGet, this._onItemGetFailure);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.GetEmailTemplateItems"); }
    }
    SetTilesHeight() {
        try {
            var MaxHeight = 0;
            $(".EmailTemplateTileContainer").each(function () {
                if (MaxHeight < this.offsetHeight) {
                    MaxHeight = $(this).height()
                }
            })
            //padding addition
            MaxHeight = MaxHeight + 30;
            $(".EmailTemplateTileContainer").css("height", MaxHeight + "px");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain.SetTilesHeight"); }
    }
    _UpdateSearchIcon() {
        try {
            var ControlsObject = [
                { ID: "#txtEmailTemplateNameFilter", Type: "text" }
            ]
            EOBShared.ShowHideFilterIcon(ControlsObject, "EmailTempalteFilterIcon");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain._UpdateSearchIcon"); }
    }
    _OnResetClick() {

        try {
            $("#txtEmailTemplateNameFilter").val("");
            $("#EmailTempalteFilterIcon").removeClass("hvr-pulse onsearchiconchange")
            //  EmailTemplateComponent.DataGrid.current.ClearFilter();
            EmailTemplateComponent.GetEmailTemplateItems();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain._OnResetClick"); }
    }
    _OnSearchClick() {
        try {
            var FreeText = $("#txtEmailTemplateNameFilter").val();
            var FilterText = "";
            if (FreeText != "") {
                FilterText = "$filter=substringof('" + encodeURIComponent(FreeText) + "',TemplateType)";
            }
            this.setState({ EmailTemplates: null }, function () { EmailTemplateComponent.GetEmailTemplateItems(FilterText) })

            $("#" + "EmailTempalteFilterIcon").removeClass("hvr-pulse onsearchiconchange");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain._OnSearchClick"); }
    }
    _onItemGet(data) {
        try {
            if (data) {
                var EmailTempaltesArray = []
                if (data.d.results.length > 0) {
                    for (var i = 0; i < data.d.results.length; i++) {
                        //var EmailTemplateJSX = this.ReturnEmailTemplate(data.d.results[i].TemplateType, data.d.results[i].Subject, data.d.results[i].EmailTemplate, data.d.results[i].IsActive1)
                        var ActiveStatus = (data.d.results[i].IsActive1) ? "Active" : "In Active"
                        const EmailTemplateJSX = <EmailTemplateTile TemplateType={data.d.results[i].TemplateType} Subject={data.d.results[i].Subject} TemplateBody={data.d.results[i].EmailTemplate} isActive={ActiveStatus} ID={data.d.results[i].ID}> </EmailTemplateTile>
                        EmailTempaltesArray.push(EmailTemplateJSX)
                    }
                }
                else {
                    const NoTemplatesFound = <p><strong>No records found!</strong></p>
                    EmailTempaltesArray.push(NoTemplatesFound)
                }
            }
            EmailTemplateComponent.setState({ EmailTemplates: EmailTempaltesArray }, function () { EmailTemplateComponent.SetTilesHeight() });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain._onItemGet"); }
    }
    _onItemGetFailure(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateMain._onItemGetFailure"); }
    }
    render() {

        return (
            <div>
               
                <div>
                    <MainHeaderConfig PageHeading={"Manage Email Templates"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.Masters} />
                </div>
               
                <div className="filter-main">
                    
                    <div className="row justify-content-left">
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search">
                            <label className="ml-2px">Search</label>
                            <input className="form-control form-control-sm" onKeyDown={EmailTemplateComponent.CheckAndSearch} onChange={EmailTemplateComponent._UpdateSearchIcon} type="Search" id="txtEmailTemplateNameFilter" placeholder="Search by email template type" />
                            <i className="search-icon fa fa-search"></i>
                        </div>
                        <div className="form-group col-lg-2 col-md-6 col-sm-6 search-refresh-btn">
                            <label className="d-none d-sm-block d-md-block d-lg-block">&nbsp;</label>
                            <button data-toggle="tooltip" title="Filter" id="DepartmentSearchBtn" type="button" className="btn btn-primary mr-2 modalBtn SwitchTitleColor" onClick={EmailTemplateComponent._OnSearchClick} ><i id="EmailTempalteFilterIcon" className="fa fa-search active"></i></button>
                            <button data-toggle="tooltip" title="Reset" type="Button" className="btn btn-light" onClick={EmailTemplateComponent._OnResetClick} ><i className="fa fa-refresh"></i></button>
                        </div>
                    </div>
                </div>

                <div className="tbl-bg-main">
                    <div className="row email-tempaltes-row-padding">
                        {this.state.EmailTemplates}
                    </div>
                </div>
                <div>{EmailTemplateComponent.state.EmailTemplateDialog}</div>
            </div>
        );

    }
}
const dom = document.getElementById("EmailTemplateMain");
ReactDOM.render(
    <EmailTemplateMain />,
    dom
);

