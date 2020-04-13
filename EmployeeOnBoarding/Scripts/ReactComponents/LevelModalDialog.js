"use strict";
let LevelDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nLevelModalCurrentEditItemID = 0;
let nDeleteModalCurrentItemID = 0;
class LevelDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            ModalHeading: this.props.ModalHeading,
            UpdateData: this.props.HandleDataUpdate,
            editID: this.props.EditID,
            LevelText: "",
            isActive:"",
            AddButtonText: this.props.ButtonText,
            SaveErrorSuccessNotification: "",
            ResetOrCancelButtonText: "",
            ResetOrCancelFunction:""
        };
        LevelDialogComponenthis = this;
    }
    componentDidMount() {
        var modal = document.getElementById("LevelDialog");
        modal.style.display = "block";
        $("#LevelHeadingDiv").text(LevelDialogComponenthis.props.ModalHeading)
        if (LevelDialogComponenthis.props.EditID) {
            LevelDialogComponenthis.GetLevelData()
        }
        else {
            $("#txtLevel").val("")
            $("#chkLevelActive").prop('checked', true);
            LevelDialogComponenthis.CreatePeoplePicker();
        }      
        if (BKJSShared.NotEmptyString(LevelDialogComponenthis.state.editID)) {
            LevelDialogComponenthis.setState({ ResetOrCancelButtonText: "Cancel" });
            LevelDialogComponenthis.setState({ ResetOrCancelFunction: LevelDialogComponenthis.CloseModal });
        }
        else {
            LevelDialogComponenthis.setState({ ResetOrCancelButtonText: "Reset" });
            LevelDialogComponenthis.setState({ ResetOrCancelFunction: LevelDialogComponenthis.Reset });
        }
        EOBConstants.SetNewThemeColor();
    }
    HandleUpdate() {
        LevelDialogComponenthis.props.HandleDataUpdate();
    }
    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        isEdit = true;
    }
    CloseModal() {
        var modal = document.getElementById("LevelDialog");
        modal.style.display = "none";
        isEdit = false;
        nLevelModalCurrentEditItemID = 0;
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
        LevelDialogComponenthis.HandleUpdate();
        $("#btnLevelSave").val("Save");
        $("#txtLevel").val("");
        LevelDialogComponenthis.setState({ SaveErrorSuccessNotification: null })
    }
    
    AddUpdateLevel() {
        BKValidationShared.CheckValidations();
        if (!BKValidationShared.isErrorFree ) {
            return
        }
        let LevelTB = $("#txtLevel").val();
        var nCurrentItemId = null
        if (nLevelModalCurrentEditItemID > 0) {
            nCurrentItemId = nLevelModalCurrentEditItemID;
        }
        BKSPShared.SPItems.isValueExistInColumn(LevelTB, "Title", EOBConstants.ListNames.Level, nCurrentItemId, LevelDialogComponenthis.SaveErrorMessage, LevelDialogComponenthis.SaveData)               
    }
    SaveData() {
        let LevelTB = document.getElementById("txtLevel");
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Level);
        let isActive = $("#chkLevelActive").prop('checked');
        let isAllowOnOffBoard = $("#chkLevelAllowOnOffBoard").prop('checked');
        let isAllowEdit = $("#chkLevelAllowUserEdit").prop('checked');
        
        
        //let Responsible = BKSPPeoplePicker.GetSelectedUserIds();
        let Responsible = BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].GetSelectedUserIds()
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "Title": LevelTB.value,
            "ResponsibleUsersId": Responsible,
            "IsActive1": isActive,
            "AllowOnBoardOffBoard": isAllowOnOffBoard,
            "AllowUserEdit": isAllowEdit
        }
        var RequestMethod = null;
        var Url = ""
        if (nLevelModalCurrentEditItemID > 0) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/Items(" + nLevelModalCurrentEditItemID + ")";
            RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        }
        else {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/items"
        }

        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, LevelDialogComponenthis._onItemSave, LevelDialogComponenthis._onItemSaveFailed)
    }
    SaveErrorMessage() {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Save failed", "Level with same name exist, consider changing the name.")   
    }
    GetLevelData() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Level + "')/items('" + LevelDialogComponenthis.props.EditID + "')";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, LevelDialogComponenthis._onLevelItemGet, LevelDialogComponenthis._onItemSaveFailed);
    }
    CreatePeoplePicker() {
        //BKSPPeoplePicker.InitializePeoplePicker({
        //    element: "userpicker",
        //    isAllowMultipleValues: true,
        //    classuserSpan: "peoplepicker-userSpan",
        //    classtoplevel: "peoplepicker-topLevel",
        //    classhelptext: "peoplepicker-initialHelpText",
        //    classautofillcontainer: "peoplepicker-autoFillContainer",
        //    isMandatory:true
        //});
        BKSPPeoplePickerRest.CreatePeoplePicker("userpicker",true); 
    }
    UpdateTaskAignCheckStatus() {
        var isAllowOnboard = $("#chkLevelAllowOnOffBoard").prop('checked')
        if (isAllowOnboard) {
            $("#chkLevelAllowUserEdit").prop('checked', true);
            $("#chkLevelAllowUserEdit").prop('disabled', true);
        }
        else {
            $("#chkLevelAllowUserEdit").prop('checked', false);
            $("#chkLevelAllowUserEdit").prop('disabled', false);
        }        
    }
    Reset() {
        $("#txtLevel").val("")
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();
        BKValidationShared.ResetValidation();
        $("#chkLevelActive").prop('checked', true);
        $("#userpicker").val("");
        chkLevelAllowOnOffBoard
        $("#chkLevelAllowOnOffBoard").prop('checked', false);
        $("#chkLevelAllowUserEdit").prop('checked', false);
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isResolved = true;
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetFromIdToPeoplePickerData();
        BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].ResetPeoplePickerField();

    }
    _onLevelItemGet(data) {
        $("#txtLevel").val(data.d.Title)
        $("#chkLevelActive").prop('checked', data.d.IsActive1);
        $("#chkLevelAllowOnOffBoard").prop('checked', data.d.AllowOnBoardOffBoard); 
        if (data.d.AllowOnBoardOffBoard) {
            $("#chkLevelAllowUserEdit").prop('disabled', true);
        }
        $("#chkLevelAllowUserEdit").prop('checked', data.d.AllowUserEdit); 
           
        //DepartmentAdminId Set User Item here
        if (data.d.ResponsibleUsersId) {
            var arrLevelAdminIDs = data.d.ResponsibleUsersId.results;
            //BKSPPeoplePicker.CreatePeoplePickerFromUserIds(arrLevelAdminIDs, "userpicker")
            BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrLevelAdminIDs, "userpicker", true)
            BKSPPeoplePickerRest.PeoplePickerInstances["userpicker"].isAnyUserGroupSelected = true;
        }
        else {
            LevelDialogComponenthis.CreatePeoplePicker();
        }
    }
    _onItemSave(data) {
        var Title = "";
        if (data) {
            Title = data.d.Title;
        }
        else {
            Title = $("#txtLevel").val()
        }
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "", "Level " + Title + " saved successfully.")

        LevelDialogComponenthis.Reset();
        LevelDialogComponenthis.CloseModal();
    }
    _onItemSaveFailed(data) {
        console.log(data);
    }
    render() {
        return (
            <div >
                <div id="LevelDialog" className="modalReact">
                    <div className="modal-contentReact">
                        <div className="row modal-head align-items-center">
                            <div id="LevelHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">{LevelDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={LevelDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Level Name</label>
                                    <input type="text" id="txtLevel"  maxlength="15" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="LevelName" placeholder="Enter Level name" />
                                </div>
                                <div className="form-group">
                                    <label>Level Admin</label>
                                    <div id="userpicker"></div>
                                </div>
                                <div className="form-group">
                                    <label className="mb-1">Allow On-Board/ Off-Board</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" onClick={LevelDialogComponenthis.UpdateTaskAignCheckStatus} id="chkLevelAllowOnOffBoard" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                <div className="form-group">
                                    <label className="m-0">Allow task assignment</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkLevelAllowUserEdit" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                <div className="form-group">
                                    <label className="m-0">Active/In-Active</label><br />
                                    <label class="switch success ">
                                        <input type="checkbox" class="success" id="chkLevelActive" />
                                        <span class="slider round ChangeSpanBackground"></span></label>
                                </div>
                                {LevelDialogComponenthis.state.SaveErrorSuccessNotification}
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id={"btnLevelSave"} onClick={LevelDialogComponenthis.AddUpdateLevel} value={LevelDialogComponenthis.state.AddButtonText} />
                                <input type="Button" className="btn btn-light" onClick={LevelDialogComponenthis.state.ResetOrCancelFunction} value={LevelDialogComponenthis.state.ResetOrCancelButtonText}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
