"use strict";
let CategoryDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nCategoryModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
let oProcessTypeModalComboProps = null;
class CategoryDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            CategoryText: "",
            isActive: "",
            ProcessTypeId: this.props.ProcessTypeId,
            AddButtonText: this.props.ButtonText,
            SaveErrorSuccessNotification: null,
            ResetOrCancelFunction: null,
            ResetOrCancelButtonText: "",
            ComboProcessType:null,
        };
        
        CategoryDialogComponenthis = this;
        
        CategoryDialogComponenthis.SetProcessComboProps();
    }

    SetProcessComboProps() {
        try {
            oProcessTypeModalComboProps = new EOBShared.ComboProperties("CatMProcessTypeSelect", "Process Type", "lstProcessType", "", "", "", "", "", "Title");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.SetProcessComboProps"); }
    }
    componentDidMount() {
        try {
            var modal = document.getElementById("CategoryDialog");
            modal.style.display = "block";
            const ProcessType = <ComboMain ComboProperties={oProcessTypeModalComboProps}></ComboMain>
            CategoryDialogComponenthis.setState({ ComboProcessType: ProcessType }, function () {
                $("#CategoryHeadingDiv").text(CategoryDialogComponenthis.props.ModalHeading)
                if (CategoryDialogComponenthis.props.EditID) {
                    CategoryDialogComponenthis.GetCategoryData()
                }
                else {
                    $("#txtDepartment").val("")
                    $("#chkCategoryActive").prop('checked', true);
                }
                if (BKJSShared.NotEmptyString(CategoryDialogComponenthis.state.editID)) {
                    CategoryDialogComponenthis.setState({ ResetOrCancelButtonText: "Cancel" });
                    CategoryDialogComponenthis.setState({ ResetOrCancelFunction: CategoryDialogComponenthis.CloseModal });
                }
                else {
                    CategoryDialogComponenthis.setState({ ResetOrCancelButtonText: "Reset" });
                    CategoryDialogComponenthis.setState({ ResetOrCancelFunction: CategoryDialogComponenthis.Reset });
                }
            });
            

           

            EOBConstants.SetNewThemeColor()
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.componentDidMount"); }
    }
    HandleUpdate() {
        try {
            CategoryDialogComponenthis.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.HandleUpdate"); }
    }
    UpdateEditStatus(ID) {
        try {
            nCurrentItemID = ID;
            isEdit = true;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.HandleUpdate"); }
    }
    CloseModal() {
        try {
            var modal = document.getElementById("CategoryDialog");
            modal.style.display = "none";
            isEdit = false;
            nCategoryModalCurrentEditItemID = 0;
            CategoryDialogComponenthis.HandleUpdate()
            $("#CategoryAddSaveBtn").val("Save")
            $("#txtCategory").val("")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.CloseModal"); }
    }
    AddUpdateCategory() {
        try {
            BKValidationShared.CheckValidations();
            var ProcessObject = BKJSShared.GetComboSelectedValueAndText("#CatMProcessTypeSelect")
            if (ProcessObject["Text"] == "") { return }
            if (!BKValidationShared.isErrorFree) { return }
            let CategoryNameValue = $("#txtCategory").val();
            var nCurrentItemId = null
            if (nCategoryModalCurrentEditItemID > 0) {
                nCurrentItemId = nCategoryModalCurrentEditItemID;
            }
            BKSPShared.SPItems.isValueExistInColumn(CategoryNameValue, "CategoryName1", EOBConstants.ListNames.Category, nCurrentItemId, CategoryDialogComponenthis.SaveErrorMessage, CategoryDialogComponenthis.SaveDate)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.AddUpdateCategory"); }
    }
    SaveDate() {
        try {
            let CategoryNameTB = document.getElementById("txtCategory");
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Category);
            let SelectedProcessType = BKJSShared.GetComboSelectedValueAndText("#CatMProcessTypeSelect");
            let isActive = $("#chkCategoryActive").prop('checked');
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "CategoryName1": CategoryNameTB.value,
                "Process1Id": parseInt(SelectedProcessType.Value),
                "IsActive1": isActive
            }
            var RequestMethod = null;
            var Url = ""

            if (nCategoryModalCurrentEditItemID > 0) {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Category + "')/Items(" + nCategoryModalCurrentEditItemID + ")";
                RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            }
            else {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Category + "')/items"
            }

            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, CategoryDialogComponenthis._onItemSave, CategoryDialogComponenthis._onItemSaveFailed)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.SaveDate"); } 
    }
    SaveErrorMessage() {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Category with same name exist, consider changing the name.")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.SaveErrorMessage"); } 

    }
    DeleteCategory() {

    }
    GetCategoryData() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Category + "')/items?$select=ID%2CCategoryName1%2CIsActive1%2CProcess1%2FTitle%2CProcess1%2FID";
            Url += "&$expand=Process1%2FTitle%2CProcess1%2FID";
            Url += "&$filter=ID eq " + CategoryDialogComponenthis.state.editID;
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, CategoryDialogComponenthis._onCategoryItemGet, CategoryDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.GetCategoryData"); } 
    }
    
    Reset() {
        try {
            $("#txtCategory").val("")
            CategoryDialogComponenthis.setState({ SaveErrorSuccessNotification: null })
            BKValidationShared.ResetValidation();
            $("#chkCategoryActive").prop('checked', true);
            $("#CatMProcessTypeSelect").val(1);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal.Reset"); } 
    }
    _onCategoryItemGet(data) {
        try {
            $("#txtCategory").val(data.d.results[0].CategoryName1)
            $("#chkCategoryActive").prop('checked', data.d.results[0].IsActive1);
            if (data.d.results[0]["Process1"].Title != null) {
                $("#CatMProcessTypeSelect").val(data.d.results[0]["Process1"].ID);
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal._onCategoryItemGet"); } 
    }
    _onItemSave(data) {
        try {
            var Title = "";
            if (data) {
                Title = data.d.CategoryName1;
            }
            else {
                Title = $("#txtCategory").val()
            }
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Category saved successfully.");
            CategoryDialogComponenthis.Reset();
            CategoryDialogComponenthis.CloseModal();
           
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal._onItemSave"); } 
    }
    _onItemSaveFailed(data) {  
        try {
            console.log()
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "CategoryModal._onItemSaveFailed"); } 
    }
    render() {
        return (
            <div >
                <div id="CategoryDialog" className="modalReact">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="CategoryHeadingDiv" className="col-10 SwitchTitleColor">
                                <p  className="f-16 m-0 SwitchTitleColor" >{CategoryDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={CategoryDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Category Name</label>
                                    <input type="text" id="txtCategory" maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="CategoryName" placeholder="Enter Category name" />
                                </div>
                                <div className="form-group">
                                    {this.state.ComboProcessType}                                    
                                </div>
                                <div className="form-group">
                                    <label className="mb-1">Active/In-Active</label><br/>
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkCategoryActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                            </div>
                            {CategoryDialogComponenthis.state.SaveErrorSuccessNotification}
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"CategoryAddSaveBtn"} onClick={CategoryDialogComponenthis.AddUpdateCategory} value={CategoryDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={CategoryDialogComponenthis.state.ResetOrCancelFunction} value={CategoryDialogComponenthis.state.ResetOrCancelButtonText} />
                            </div>                            
                        </div>
                       
                    </div>
                </div>
            </div>
        );
    }
}
