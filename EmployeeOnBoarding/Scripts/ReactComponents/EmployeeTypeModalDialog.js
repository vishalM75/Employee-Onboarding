"use strict";
let EmployeeTypeDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nEmployeeTypeModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
class EmployeeTypeDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            EmployeeTypeText: "",
            isActive: "",
            AddButtonText: this.props.ButtonText,
            SaveErrorSuccessNotification: "",
            ResetOrCancelButtonText: "",
            ResetOrCancelFunction: ""
        };
        EmployeeTypeDialogComponenthis = this;
    }

    componentDidMount() {
        try {
            var modal = document.getElementById("EmployeeTypeDialog");
            modal.style.display = "block";
            $("#EmployeeTypeHeadingDiv").text(EmployeeTypeDialogComponenthis.props.ModalHeading)
            if (EmployeeTypeDialogComponenthis.props.EditID) {
                EmployeeTypeDialogComponenthis.GetEmployeeTypeData()
            }
            else {
                $("#txtEmployeeType").val("")
                $("#chkEmployeeTypeActive").prop('checked', true);
            }
            if (BKJSShared.NotEmptyString(EmployeeTypeDialogComponenthis.state.editID)) {
                EmployeeTypeDialogComponenthis.setState({ ResetOrCancelButtonText: "Cancel" });
                EmployeeTypeDialogComponenthis.setState({ ResetOrCancelFunction: EmployeeTypeDialogComponenthis.CloseModal });
            }
            else {
                EmployeeTypeDialogComponenthis.setState({ ResetOrCancelButtonText: "Reset" });
                EmployeeTypeDialogComponenthis.setState({ ResetOrCancelFunction: EmployeeTypeDialogComponenthis.Reset });
            }
            EOBConstants.SetNewThemeColor();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.componentDidMount"); }
    }
    HandleUpdate() {
        try {
            EmployeeTypeDialogComponenthis.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.HandleUpdate"); }
    }
    UpdateEditStatus(ID) {
        try {
            nCurrentItemID = ID;
            isEdit = true;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.UpdateEditStatus"); }
    }
    GetEmployeeTypeData() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeType + "')/items('" + EmployeeTypeDialogComponenthis.props.EditID + "')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EmployeeTypeDialogComponenthis._onEmployeeItemGet, EmployeeTypeDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.GetEmployeeTypeData"); }
    }
    CloseModal() {   
        try {
            var modal = document.getElementById("EmployeeTypeDialog");
            modal.style.display = "none";
            isEdit = false;
            nEmployeeTypeModalCurrentEditItemID = 0;
            EmployeeTypeDialogComponenthis.HandleUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.CloseModal"); }
    }
    AddUpdateEmployeeType() {
        try {
            BKValidationShared.CheckValidations();
            if (!BKValidationShared.isErrorFree) { return }
            var EmployeeType = $("#txtEmployeeType").val();
            var nCurrentItemId = null
            if (nEmployeeTypeModalCurrentEditItemID > 0) {
                nCurrentItemId = nEmployeeTypeModalCurrentEditItemID;
            }
            BKSPShared.SPItems.isValueExistInColumn(EmployeeType, "OData__EmployeeType", EOBConstants.ListNames.EmployeeType, nCurrentItemId, EmployeeTypeDialogComponenthis.SaveErrorMessage, EmployeeTypeDialogComponenthis.SaveData)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.AddUpdateEmployeeType"); }
    }
    SaveData() {
        try {
            let EmployeeTypeTB = document.getElementById("txtEmployeeType");
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmployeeType);
            let isActive = $("#chkEmployeeTypeActive").prop('checked');
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__EmployeeType": EmployeeTypeTB.value,
                "IsActive1": isActive
            }
            var RequestMethod = null;
            var Url = ""
            if (nEmployeeTypeModalCurrentEditItemID > 0) {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeType + "')/Items(" + nEmployeeTypeModalCurrentEditItemID + ")";
                RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            }
            else {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmployeeType + "')/items"
            }

            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, EmployeeTypeDialogComponenthis._onItemSave, EmployeeTypeDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.SaveData"); }
    }
    SaveErrorMessage() {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Employee type with same name exist, consider changing the name.")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.SaveErrorMessage"); }
    }
    DeleteEmployeeType() {

    }
    Reset() {
        try {
            $("#txtEmployeeType").val("")
            BKValidationShared.ResetValidation();
            $("#chkEmployeeTypeActive").prop('checked', true);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog.Reset"); }
    }
    _onEmployeeItemGet(data) {
        try {
            $("#txtEmployeeType").val(data.d.OData__EmployeeType)
            $("#chkEmployeeTypeActive").prop('checked', data.d.IsActive1);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog._onEmployeeItemGet"); }
    }

    _onItemSave(data) {
        try {
            var Title = "";
            if (data) {
                Title = data.d.OData__EmployeeType;
            }
            else {
                Title = $("#txtEmployeeType").val()
            }
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Employee type saved successfully.")
            EmployeeTypeDialogComponenthis.Reset();
            EmployeeTypeDialogComponenthis.CloseModal();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog._onItemSave"); }
    }
    _onItemSaveFailed(data) {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmployeeTypeDialog._onItemSaveFailed"); }
    }
    render() {
        return (
            <div >
                <div id="EmployeeTypeDialog" className="modalReact">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="EmployeeTypeHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{EmployeeTypeDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={EmployeeTypeDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Employee Type</label>
                                    <input type="text" id="txtEmployeeType"  maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="EmployeeType" placeholder="Enter Employee Type" />
                                </div>
                                <div className="form-group">
                                    <label className="mb-1">Active/In-Active</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkEmployeeTypeActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                {EmployeeTypeDialogComponenthis.state.SaveErrorSuccessNotification}
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"EmployeeTypeAddSaveBtn"} onClick={EmployeeTypeDialogComponenthis.AddUpdateEmployeeType} value={EmployeeTypeDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={EmployeeTypeDialogComponenthis.state.ResetOrCancelFunction} value={EmployeeTypeDialogComponenthis.state.ResetOrCancelButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
