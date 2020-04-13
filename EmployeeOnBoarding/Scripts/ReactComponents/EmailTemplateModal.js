"use strict";
let EmailTemplateDialogComponent = null;
let ModalHeadingText = "";
let isEdit = false;
let nDeleteModalCurrentItemID = 0;
var ETBodyEditor = null;
class EmailTemplateDialog extends React.Component {
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
            ResetOrCancelButtonText: "Cancel"            
        };
        EmailTemplateDialogComponent = this;    
    }
    componentDidMount() {
        try {
            var modal = document.getElementById("EmailTemplateDialog");
            modal.style.display = "block";

            $(".modal-contentReact").css("width", "740px");
            $("#ETHeadingDiv").text(EmailTemplateDialogComponent.props.ModalHeading)
            EmailTemplateDialogComponent.CreateEditor()
            if (EmailTemplateDialogComponent.props.EditID) {
                EmailTemplateDialogComponent.GetEmailTemplateData()
            }
            EOBConstants.SetNewThemeColor();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.componentDidMount"); }
    }
    CreateEditor() {
        try {
            ETBodyEditor = CKEDITOR.replace('editor', {
                extraAllowedContent: 'style;*[id,rel](*){*}',
                removeButtons: 'About,Anchor',
            });
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.CreateEditor"); }
    }
    HandleUpdate() {
        try {
            var CurrentEmailTempalteData = EmailTemplateDialogComponent.ReturnEmailTempalteObject();
            EmailTemplateDialogComponent.props.HandleDataUpdate(CurrentEmailTempalteData);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.HandleUpdate"); }
    }
   
    CloseModal() {
        try {
            var modal = document.getElementById("EmailTemplateDialog");
            modal.style.display = "none";
            isEdit = false;
            EmailTemplateDialogComponent.HandleUpdate();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.CloseModal"); }
    }
    AddUpdateEmailTemplate() {
        try {
            BKValidationShared.CheckValidations();
            var Body = CKEDITOR.instances.editor.getData();
            var isBodyHavingContent = (Body.length > 0) ? true : false;
            if (isBodyHavingContent) { $("#BodyNotEmptyError").addClass("d-none") }
            else { $("#BodyNotEmptyError").removeClass("d-none") }
            if (!BKValidationShared.isErrorFree || !isBodyHavingContent) { return }
            var TemplateType = $("#txtEmailTemplate").val();
            BKSPShared.SPItems.isValueExistInColumn(TemplateType, "TemplateType", EOBConstants.ListNames.EmailTemplates, EmailTemplateDialogComponent.state.editID, EmailTemplateDialogComponent.SaveErrorMessage, EmailTemplateDialogComponent.SaveData);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.CreateEditor"); }
    }
    _onSave2(data) {
        try {
            console.log(data);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog._onSave2"); }
    }
    ReturnEmailTempalteObject() {
        try {
            let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.EmailTemplates);
            var TemplateType = $("#txtEmailTemplate").val();
            var Subject = $("#txtETSubject").val();
            let isActive = $("#chkEmailTemplateActive").prop('checked');
            var Body = CKEDITOR.instances.editor.getData();
            var SaveData = {
                __metadata: { 'type': ListTypeName },
                "TemplateType": TemplateType,
                "Subject": Subject,
                "EmailTemplate": Body,
                "IsActive1": isActive
            }
            return SaveData;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.ReturnEmailTempalteObject"); }

    }
    SaveData() {                
        try {
            var SaveData = EmailTemplateDialogComponent.ReturnEmailTempalteObject();
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/Items(" + EmailTemplateDialogComponent.state.editID + ")";
            var RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
            BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, EmailTemplateDialogComponent._onItemSave, EmailTemplateDialogComponent._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.SaveData"); }
    }
   
    SaveErrorMessage() {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Email template type with same name exist, consider changing the name.");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.SaveErrorMessage"); }
    }
        
    GetEmailTemplateData() {
        try {
            var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items('" + EmailTemplateDialogComponent.props.EditID + "')";
            BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, EmailTemplateDialogComponent._onEmailTemplateItemGet, EmailTemplateDialogComponent._onItemSaveFailed);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog.GetEmailTemplateData"); }
    }
    _onEmailTemplateItemGet(data) {     
        try {
            var Body = data.d.EmailTemplate
            $("#txtETSubject").val(data.d.Subject)
            $("#txtEmailTemplate").val(data.d.TemplateType);
            $("#chkEmailTemplateActive").prop("checked", data.d.IsActive1);
            CKEDITOR.instances.editor.setData(Body);
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog._onEmailTemplateItemGet"); }
    }
    _onItemSave(data) {
        try {
            var Title = $("#txtEmailTemplate").val();

            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Email template " + Title + " saved successfully.");
            EmailTemplateDialogComponent.CloseModal();
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog._onItemSave"); }
    }
    _onItemSaveFailed(data) {
        try {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed.", "");
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "EmailTemplateDialog._onItemSaveFailed"); }
    }
    render() {
        return (
            <div >
                <div id="EmailTemplateDialog" className="modalReact pt-2">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="ETHeadingDiv " className="col-10">
                                <p className="f-16 m-0 SwitchTitleColor">{EmailTemplateDialogComponent.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={EmailTemplateDialogComponent.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Template Type</label>
                                    <input type="text" id="txtEmailTemplate" readOnly maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="ETTypeName" placeholder="Enter Template type name" />
                                </div>
                              
                                <div className="form-group">
                                    <label>Template Subject</label >
                                        <input type="text" className="form-control form-control-sm BKValidateEmptyValue" id="txtETSubject" />                                       
                                </div>
                                <div className="form-group">
                                    <label className="mb-1">Active/In-Active</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkEmailTemplateActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                <div className="form-group">
                                    <label>Template Body</label >
                                    <textarea name="content" id="editor" >This is some sample content.</textarea>
                                    <div className="d-none fontColorRed" id="BodyNotEmptyError">Template must have a body.</div>
                                </div>
                                {EmailTemplateDialogComponent.state.SaveErrorSuccessNotification}
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id="btnETSave" onClick={EmailTemplateDialogComponent.AddUpdateEmailTemplate} value={EmailTemplateDialogComponent.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={EmailTemplateDialogComponent.CloseModal} value={EmailTemplateDialogComponent.state.ResetOrCancelButtonText} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
