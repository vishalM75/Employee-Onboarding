"use strict";
let PositionDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nPositionModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
class PositionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            PositionText: "",
            isActive: "",
            AddButtonText: this.props.ButtonText,
            SaveErrorSuccessNotification: ""
        };
        PositionDialogComponenthis = this;
    }

    componentDidMount() {
        try {
            var modal = document.getElementById("PositionDialog");
            modal.style.display = "block";
            $("#PositionHeadingDiv").text(PositionDialogComponenthis.props.ModalHeading)
            if (PositionDialogComponenthis.props.EditID) {
                PositionDialogComponenthis.GetPositionData()
            }
            else {
                $("#txtPosition").val("")
                $("#chkPositionActive").prop('checked', true);
            }
            if (BKJSShared.NotEmptyString(PositionDialogComponenthis.state.editID)) {
                PositionDialogComponenthis.setState({ ResetOrCancelButtonText: "Cancel" });
                PositionDialogComponenthis.setState({ ResetOrCancelFunction: PositionDialogComponenthis.CloseModal });
            }
            else {
                PositionDialogComponenthis.setState({ ResetOrCancelButtonText: "Reset" });
                PositionDialogComponenthis.setState({ ResetOrCancelFunction: PositionDialogComponenthis.Reset });
            }
            EOBConstants.SetNewThemeColor();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.componentDidMount"); }
    }
    HandleUpdate() {
        try {
            PositionDialogComponenthis.props.HandleDataUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.HandleUpdate"); }
    }
    UpdateEditStatus(ID) {
        try {
            nCurrentItemID = ID;
            isEdit = true;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.UpdateEditStatus"); }
    }
    GetPositionData() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Position + "')/items('" + PositionDialogComponenthis.props.EditID + "')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, PositionDialogComponenthis._onPositionItemGet, PositionDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.GetPositionData"); }
    }
    CloseModal() {
        try {
            var modal = document.getElementById("PositionDialog");
            modal.style.display = "none";
            isEdit = false;
            nPositionModalCurrentEditItemID = 0;
            PositionDialogComponenthis.HandleUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.CloseModal"); }
    }
    AddUpdatePosition() {
        try {
            BKValidationShared.CheckValidations();
            if (!BKValidationShared.isErrorFree) { return }
            var Position = $("#txtPosition").val();
            var nCurrentItemId = null
            if (nPositionModalCurrentEditItemID > 0) {
                nCurrentItemId = nPositionModalCurrentEditItemID;
            }
            BKSPShared.SPItems.isValueExistInColumn(Position, "OData__PositionName", EOBConstants.ListNames.Position, nCurrentItemId, PositionDialogComponenthis.SaveErrorMessage, PositionDialogComponenthis.SaveData);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.AddUpdatePosition"); }
    }
    SaveData() {
        try {
            let PositionTB = document.getElementById("txtPosition");
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Position);
            let isActive = $("#chkPositionActive").prop('checked');
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "OData__PositionName": PositionTB.value,
                "IsActive1": isActive
            }
            var RequestMethod = null;
            var Url = ""
            if (nPositionModalCurrentEditItemID > 0) {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Position + "')/Items(" + nPositionModalCurrentEditItemID + ")";
                RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            }
            else {
                Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Position + "')/items"
            }

            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, PositionDialogComponenthis._onItemSave, PositionDialogComponenthis._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.SaveData"); }
    }
    SaveErrorMessage() {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Position with same name exist, consider changing the name.")
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.SaveErrorMessage"); }
    }
    DeletePosition() {

    }
    Reset() {
        try {
            $("#txtPosition").val("")
            BKValidationShared.ResetValidation();
            $("#chkPositionActive").prop('checked', true);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog.Reset"); }
    }
    _onPositionItemGet(data) {
        try {
            $("#txtPosition").val(data.d.OData__PositionName)
            $("#chkPositionActive").prop('checked', data.d.IsActive1);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog._onPositionItemGet"); }
    }

    _onItemSave(data) {
        try {
            var Title = "";
            if (data) {
                Title = data.d.OData__PositionName;
            }
            else {
                Title = $("#txtPosition").val()
            }
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Position saved successfully.")
            PositionDialogComponenthis.Reset();
            PositionDialogComponenthis.CloseModal();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog._onItemSave"); }
    }
    _onItemSaveFailed(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "PositionDialog._onItemSaveFailed"); }
    }
    render() {
        return (
            <div >
                <div id="PositionDialog" className="modalReact">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="PositionHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{PositionDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={PositionDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Position Name</label>
                                    <input type="text" id="txtPosition" maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="Position" placeholder="Enter Position Name" />
                                </div>
                                <div className="form-group">
                                    <label className="mb-1">Active/In-Active</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkPositionActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                {PositionDialogComponenthis.state.SaveErrorSuccessNotification}
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"PositionAddSaveBtn"} onClick={PositionDialogComponenthis.AddUpdatePosition} value={PositionDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={PositionDialogComponenthis.state.ResetOrCancelFunction} value={PositionDialogComponenthis.state.ResetOrCancelButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
