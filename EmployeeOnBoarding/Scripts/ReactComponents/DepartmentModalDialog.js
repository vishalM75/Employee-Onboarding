"use strict";
let DepartmentDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nDepartmentModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
class DepartmentDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            DepartmentText: "",
            isActive: "",
            AddButtonText: this.props.ButtonText,
            SaveErrorSuccessNotification: "",
            ResetOrCancelButtonText: "",
            ResetOrCancelFunction:null,
        };
        DepartmentDialogComponenthis = this;
    }
    componentDidMount() {
        try {
            var modal = document.getElementById("DepartmentDialog");
            modal.style.display = "block";
            $("#DepartmentHeadingDiv").text(DepartmentDialogComponenthis.props.ModalHeading)
            if (DepartmentDialogComponenthis.props.EditID) {
                DepartmentDialogComponenthis.GetDepartmentData()
            }
            else {
                $("#txtDepartment").val("")
                $("#chkDepartmentActive").prop('checked', true);
                DepartmentDialogComponenthis.CreatePeoplePicker();
            }
            if (BKJSShared.NotEmptyString(DepartmentDialogComponenthis.state.editID)) {
                DepartmentDialogComponenthis.setState({ ResetOrCancelButtonText: "Cancel" });
                DepartmentDialogComponenthis.setState({ ResetOrCancelFunction: DepartmentDialogComponenthis.CloseModal });
            }
            else {
                DepartmentDialogComponenthis.setState({ ResetOrCancelButtonText: "Reset" });
                DepartmentDialogComponenthis.setState({ ResetOrCancelFunction: DepartmentDialogComponenthis.Reset });
            }
            EOBConstants.SetNewThemeColor();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.componentDidMount"); }
    }
    HandleUpdate() {
        try {
            DepartmentDialogComponenthis.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.HandleUpdate"); }
    }
    UpdateEditStatus(ID) {
        try {
            nCurrentItemID = ID;
            isEdit = true;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.UpdateEditStatus"); }
    }
    CloseModal() {
        try {
            var modal = document.getElementById("DepartmentDialog");
            modal.style.display = "none";
            isEdit = false;
            nDepartmentModalCurrentEditItemID = 0;
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved = true;
            DepartmentDialogComponenthis.HandleUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.CloseModal"); }
    }
    AddUpdateDepartment() {
        try {
            BKValidationShared.CheckValidations();
            if (!BKValidationShared.isErrorFree || !BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved) { return }
            var DepartmentName = $("#txtDepartment").val();
            var nCurrentItemId = null
            if (nDepartmentModalCurrentEditItemID > 0) {
                nCurrentItemId = nDepartmentModalCurrentEditItemID;
            }
            BKSPShared.SPItems.isValueExistInColumn(DepartmentName, "OData__DepartmentName", EOBConstants.ListNames.Department, nCurrentItemId, DepartmentDialogComponenthis.SaveErrorMessage, DepartmentDialogComponenthis.SaveData)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.AddUpdateDepartment"); }
    }
    _onSave2(data) {
        try {
            console.log(data)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog._onSave2"); }
    }
    
    SaveData(EnsuredUserID) {
        try {
            let DepartmentNameTB = document.getElementById("txtDepartment");
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Department);
            let isActive = $("#chkDepartmentActive").prop('checked');
            let Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds()

            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__DepartmentName": DepartmentNameTB.value,
                "DepartmentAdminId": Responsible,
                "IsActive1": isActive
            }
            var RequestMethod = null;
            var Url = ""
            if (nDepartmentModalCurrentEditItemID > 0) {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Department + "')/Items(" + nDepartmentModalCurrentEditItemID + ")";
                RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            }
            else {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Department + "')/items"
            }

            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, DepartmentDialogComponenthis._onItemSave, DepartmentDialogComponenthis._onItemSaveFailed)
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.SaveData"); }
    }
    DeleteDepartment() {

    }
    SaveErrorMessage() {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Department with same name exist, consider changing the name.")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.SaveErrorMessage"); }
    }
    CreatePeoplePicker() {
        try {
            BKSPPeoplePickerRest.CreatePeoplePicker("userpicker", true);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.CreatePeoplePicker"); }
    }
    Reset() {
        try {
            $("#txtDepartment").val("");
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();
            BKValidationShared.ResetValidation();
            $("#chkDepartmentActive").prop('checked', true);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.Reset"); }
        
    }
    GetDepartmentData() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Department + "')/items('" + DepartmentDialogComponenthis.props.EditID + "')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, DepartmentDialogComponenthis._onDepartmentItemGet, DepartmentDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog.GetDepartmentData"); }
    }
    _onDepartmentItemGet(data) {
        try {
            $("#txtDepartment").val(data.d.OData__DepartmentName)
            $("#chkDepartmentActive").prop('checked', data.d.IsActive1);
            //DepartmentAdminId Set User Item here
            if (data.d.DepartmentAdminId) {
                var arrDepartmentAdminIDs = data.d.DepartmentAdminId.results;
                BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrDepartmentAdminIDs, "userpicker", true)
            }
            else {
                DepartmentDialogComponenthis.CreatePeoplePicker();
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog._onDepartmentItemGet"); }
    }
    _onItemSave(data) {
        try {
            var Title = "";
            if (data) {
                Title = data.d.OData__DepartmentName;
            }
            else {
                Title = $("#txtDepartment").val()
            }
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Department saved successfully.")
            DepartmentDialogComponenthis.Reset();
            DepartmentDialogComponenthis.CloseModal();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog._onItemSave"); }
    }
    _onItemSaveFailed(data) {     
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "DepartmentDialog._onItemSaveFailed"); }
    }
    render() {
        return (
            <div >
                <div id="DepartmentDialog" className="modalReact">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="DepartmentHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{DepartmentDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={DepartmentDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Department Name</label>
                                    <input type="text" id="txtDepartment"  maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="DepartmentName" placeholder="Enter Department name" />
                                </div>
                                <div className="form-group">
                                    <label>Department Admin</label>
                                    <div id="userpicker"></div>
                                </div>
                             
                                <div className="form-group">
                                    <label className="mb-1">Active/In-Active</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" readonly={false} class="success" id="chkDepartmentActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                {DepartmentDialogComponenthis.state.SaveErrorSuccessNotification}
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"btnDepartmentSave"} onClick={DepartmentDialogComponenthis.AddUpdateDepartment} value={DepartmentDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={DepartmentDialogComponenthis.state.ResetOrCancelFunction} value={DepartmentDialogComponenthis.state.ResetOrCancelButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
