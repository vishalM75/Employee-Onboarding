"use strict";
let SettingComponenthis = null;
let ModalHeadingText = "";
let sCategoryHeadingString = ""
let isValidLogoFileType = true;
let gOnBoardText = ""
let gOffBoardText = ""
var ConfigSettingsTabIdArray = ["tabPersonalize","tabSettings"]
class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ModalHeading: this.props.ModalHeading,         
        };       
        SettingComponenthis = this;
        //SettingComponenthis.SetNewThemeColor()
    }
    componentWillMount() {

    }
    componentDidMount() {
        var modal = document.getElementById("SettingDialog");
        modal.style.display = "block";
        $(".EOBConfigSaveUpdateBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        SettingComponenthis.GetConfigSettings()
        BKSPShared.SPFiles.libraryName = "Logo Image";        
        if (ConfigModal.gConfigSettings.LogoUrl) {
            $("#EOBMainLogoView").attr("src", ConfigModal.gConfigSettings.LogoUrl);
        }
        BKValidationShared.CallBacks.CheckValidUrl["TxtLogoUrl"] = SettingComponenthis.EnableNewTabControl;
        
        $('a[data-toggle="tab"]').on('click', function (e) {
            var target = $(e.target).parent() // activated tab
            var CurrentTabID = target.attr("id")
            if (BKJSShared.NotNullOrUndefined(CurrentTabID)) {
                EOBShared.SetTabsTextAndBackGroundColor(ConfigSettingsTabIdArray, CurrentTabID);
            }
        });
        EOBConstants.SetNewThemeColor();
        EOBShared.SetTabsTextAndBackGroundColor(ConfigSettingsTabIdArray, ConfigSettingsTabIdArray[0]);
    }    
    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        isEdit = true;
    }
    CloseModal() {
        var modal = document.getElementById("SettingDialog");
        modal.style.display = "none";
        isEdit = false;
        BKValidationShared.ResetValidation();
        BKSPPeoplePickerRest.PeoplePickerInstances["ConfigUserPicker"].ResetFromIdToPeoplePickerData();
    }
    GetConfigSettings() {
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Settings + "')/Items(1)";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.GET, null, SettingComponenthis._onConfigItemGet, SettingComponenthis._onRestFailed)
    }
    UpdateSettings() {
       
        BKValidationShared.CheckValidations();
        if (!BKValidationShared.isErrorFree || !BKValidationShared.isOnkeyUpControlsErrorFree) { return }
        let CurrentColor = document.getElementById("ColorTxtBox");
        ConfigModal.gConfigSettings.ThemeColor = CurrentColor.value;
        ConfigModal.gConfigSettings.OnBoardText = document.getElementById("OnBoardTitleTxtBox");
        ConfigModal.gConfigSettings.OnBoardText = ConfigModal.gConfigSettings.OnBoardText.value;
        ConfigModal.gConfigSettings.OffBoardText = document.getElementById("OffBoardTitleTxtBox");
        ConfigModal.gConfigSettings.OffBoardText = ConfigModal.gConfigSettings.OffBoardText.value;
        
        let RetentionPeriod = document.getElementById("TxtBxRetentionPeriod");
        let isStatus = $("#ChkBxConfigStatus").prop('checked');
        let drpDueDateBasedOn = $("#drpDueDateBasedOn").val()
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Settings);
        //let ConfigResponsible = BKSPPeoplePicker.GetSelectedUserIds();
        let ConfigResponsible = BKSPPeoplePickerRest.PeoplePickerInstances["ConfigUserPicker"].GetSelectedUserIds()
        let HeadingText = $("#HeadingText").val();
        let LogoUrl = $("#TxtLogoUrl").val();
     
        ConfigModal.gConfigSettings.CustomLogoUrl = LogoUrl
        let isOpenInNewTab = $("#chkOpenInNewTab").prop('checked');
        
        
        ConfigModal.gConfigSettings.isOpenLogoUrlInNewTab = isOpenInNewTab;
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "AdminUsersId": ConfigResponsible,
            "OnboardTitle": ConfigModal.gConfigSettings.OnBoardText,
            "OffboardTitle": ConfigModal.gConfigSettings.OffBoardText,
            "ThemeColor": ConfigModal.gConfigSettings.ThemeColor,
            "AnalyticsRetentionPeriod": RetentionPeriod.value,
            "EmailNotificationStatus": isStatus,
            "DueDateBasedOn": drpDueDateBasedOn,
            "DisplayTextEmployee": HeadingText,
            "LogoUrl": LogoUrl,
            "IsOpenInNewTab": isOpenInNewTab
        }
        var RequestMethod = null;
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Settings + "')/Items(1)";
        RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, SettingComponenthis._onItemSave, SettingComponenthis._onRestFailed)
        var fileInput = jQuery('#ConfigUploadLogoFile');
        BKSPShared.SPFiles.UploadFile(fileInput[0].files[0], ConfigModal.GetLogoImagePath)
        //UploadLogo(fileInput[0].files[0]);
       
    }
    EnableNewTabControl() {
        var Url = $("#TxtLogoUrl").val()
        if (BKJSShared.NotEmptyString(Url)) {
            $("#chkOpenInNewTab").attr("disabled", false);
        }
        else {
            $("#chkOpenInNewTab").prop('checked', false); 
            $("#chkOpenInNewTab").attr("disabled", true);
        }        
    }
    SetTextInElements() {
        $("#ColorTxtBox").val(ConfigModal.gConfigSettings.ThemeColor)
        $("#OnBoardTitleTxtBox").val(gOnBoardText)
        $("#OffBoardTitleTxtBox").val(gOffBoardText)
    }
    _onItemSave(data) {
        //SettingComponenthis.SetNewThemeColor();
        EOBConstants.SetNewThemeColor();
        $(".EOBConfigSaveUpdateBtn").attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
        if (ConfigModal.gConfigSettings.CustomLogoUrl) {
            $("#EOBLogoLink").attr("href", ConfigModal.gConfigSettings.CustomLogoUrl)
        }
        if (ConfigModal.gConfigSettings.isOpenLogoUrlInNewTab) {
            $("#EOBLogoLink").attr("target", "_blank");
        }
        else {
            $("#EOBLogoLink").attr("target", "_self");
        }
       
       // $('.dropdown-item').css("color", "black")
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "Successfully saved", "Configuration saved successfully.")   
        //ConfigModal.GetLogoImagePath();
        SettingComponenthis.CloseModal();
        location.reload(true);
    }
    CreatePeoplePicker() {      
        BKSPPeoplePickerRest.CreatePeoplePicker("ConfigUserPicker", true);       
    }
    GoToCustomField(Control) {
        var CurrentControlId = Control.currentTarget.id;
        var isOnBoard = (CurrentControlId == "CustomFieldOnBoard") ? true : false;
        var FieldCUrl = (isOnBoard) ? (_spPageContextInfo.webAbsoluteUrl + "/Lists/EmployeeCustomFieldsOnBoard/AllItems.aspx") : (_spPageContextInfo.webAbsoluteUrl + "/Lists/EmployeeCustomFieldsOffBoard/AllItems.aspx")
        window.open(FieldCUrl, '_blank');
    }
    isValidFileType() {
        var ext = $('#ConfigUploadLogoFile').val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
            alert('Invalid Logo extension, please select image format only.');
            $('#ConfigUploadLogoFile').val("");
            isValidLogoFileType = false
        }
        else {
            isValidLogoFileType = true;
        }
    }
    _onConfigItemGet(data) {       
           
        $("#ChkBxConfigStatus").prop('checked', data.d.EmailNotificationStatus);
        $("#ColorTxtBox").val(data.d.ThemeColor)
        $("#TxtBxRetentionPeriod").val(data.d.AnalyticsRetentionPeriod)
        $("#OnBoardTitleTxtBox").val(data.d.OnboardTitle)
        $("#OffBoardTitleTxtBox").val(data.d.OffboardTitle)
        $("#drpDueDateBasedOn").val(data.d.DueDateBasedOn)
        $("#TxtLogoUrl").val(data.d.LogoUrl)
        if (BKJSShared.NotEmptyString(data.d.LogoUrl)) {
            $("#chkOpenInNewTab").attr("disabled", false);
        }
        else {
            $("#chkOpenInNewTab").attr("disabled", true);
        }
        $("#chkOpenInNewTab").prop('checked', data.d.IsOpenInNewTab);   
        $("#HeadingText").val(data.d.DisplayTextEmployee);
        if (data.d.AdminUsersId) {
            var arrAdminAdminIDs = data.d.AdminUsersId.results;
            //BKSPPeoplePicker.CreatePeoplePickerFromUserIds(arrAdminAdminIDs, "ConfigUserPicker")
            BKSPPeoplePickerRest.CreatePeoplePickerEdit(arrAdminAdminIDs, "ConfigUserPicker", true)
        }
        else {
            SettingComponenthis.CreatePeoplePicker();
        }        
    }
    _onRestFailed(data) {
        console.log(data);
    }
    render() {
        return (
            <div >
                
                <div id="SettingDialog" className="modalReact pt-3">
                    <div className="modal-contentReact col-lg-5 col-md-8 col-sm-10">
                        <div className="row modal-head align-items-center">
                            <div id="CategoryHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0">Configuration Settings</p>                            
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={SettingComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div className="row modal-body modal-form">
                            <ul className="tab-menu nav nav-tabs mb-2" role="tablist">
                                <li id="tabPersonalize" className="nav-item">
                                    <a className="nav-link active" data-toggle="tab" href="#personalize">Personalize</a>
                                </li>
                                <li id="tabSettings" className="nav-item">
                                    <a className="nav-link" data-toggle="tab" href="#settings">Settings</a>
                                </li>
                            </ul>
                            <div className="tab-content col-12 p-0">
                                <div id="personalize" className="tab-pane active">
                                    <div className="col-12 mb-3">
                                        <div className="row section">
                                            <div className="col-12">
                                                <p className="section-heading">Color theme and Logo</p>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Company Logo</label>
                                                    <input type="file" accept=".png,.jpg,.jpeg" onChange={SettingComponenthis.isValidFileType} id="ConfigUploadLogoFile" className="form-control-file" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Choose Color</label>
                                                    <input type="Color" id="ColorTxtBox" className="form-control form-control-sm b-dashed" aria-describedby="colorName" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Logo Url</label>
                                                    <input type="text" onKeyUp={BKValidationShared.IndividualValidationMethods.CheckValidUrl}  id="TxtLogoUrl" className="form-control-file validateUrl" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label className="mb-2">Open logo url in new tab</label><br />                                                  
                                                    <label className="switch switch-lg"><input type="checkbox" id="chkOpenInNewTab" className="success "/><span class="slider round"></span></label>
                                                </div>
                                            </div>
                                            <div className="col-3 logo form-group">
                                                <label>Existing Logo:</label>
                                             <img role="Logo" id="EOBMainLogoView" alt="Logo" src="../images/bi_logo.png" /> 
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row section mb-3">
                                            <div className="col-12">
                                                <p className="section-heading">Title</p>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Product title</label>
                                                    <input type="text" id="OnBoardTitleTxtBox" maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12 d-none">
                                                <div className="form-group">
                                                    <label>Offboard title</label>
                                                    <input type="text" id="OffBoardTitleTxtBox" maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="form-group">
                                                    <label>Display text for Employee</label>
                                                    <input type="text" id="HeadingText" className="form-control form-control-sm" maxlength="225" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="settings" className="tab-pane fade">
                                    <div className="col-12">
                                        <div className="row section mb-3">
                                            <div className="col-12">
                                                <p className="section-heading">Data Analytics Settings</p>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-inline">                                                    
                                                    <label className="mr-2">Analytics Retention Period (in days):</label>
                                                    <input type="number" min="1" id="TxtBxRetentionPeriod" className="form-control  BKValidateNoNumber"  />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row section mb-3">
                                            <div className="col-12">
                                                <p className="section-heading">User Settings</p>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-inline">
                                                    <label className="mr-2">Admin Users </label>
                                                    <div className="SettingConfigUserPicker col-lg-5 col-md-8 col-12 pl-0" id="ConfigUserPicker">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row section mb-3">
                                            <div className="col-12">
                                                <p className="section-heading">Email Notification Settings</p>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-inline">
                                                    <label className="mr-2">Status:</label>
                                                    <label className="switch switch-lg">
                                                        <input type="checkbox" id="ChkBxConfigStatus" className="success BKValidateEmptyValue" />
                                                        <span className="slider round"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row section">
                                            <div className="col-12">
                                                <p className="section-heading">Other Settings</p>
                                            </div>
                                            <div className="col-12 form-group">
                                                <label className="mb-3">Add New Fields:</label>
                                                <div className="form-inline mb-3">
                                                    <label className="mr-2">Onboard</label>
                                                    <button className="btn btn-primary btn-sm mr-2 modalBtn SwitchTitleColor" type="button" data-toggle="collapse" data-target="#on-boarding" aria-expanded="false" aria-controls="collapseOne">Add</button>
                                                    <label className="mr-2">Offboard</label>
                                                    <button className="btn btn-primary btn-sm modalBtn SwitchTitleColor" type="button" data-toggle="collapse" data-target="#off-boarding" aria-expanded="false" aria-controls="collapseTwo">Add</button>
                                                </div>
                                            </div>
                                            <div className="col-12 mt-2">
                                                <div className="collapse" id="on-boarding">
                                                    <div className="card card-body">
                                                        <p>Only following type of columns is supported with no 'Additional Column Settings'</p>
                                                        <ul>
                                                            <li>Single line of text</li>
                                                            <li>Number</li>
                                                            <li>Date</li>
                                                            <li>Choice (dropdown only)</li>
                                                        </ul>
                                                        <p>Note: Column marked as mandatory will not be supported.</p>
                                                        <p className="text-center mb-0"><button type="Button" className="btn btn-primary btn-sm modalBtn SwitchTitleColor" id="CustomFieldOnBoard" onClick={SettingComponenthis.GoToCustomField}>Proceed</button></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 mt-2">
                                                <div className="collapse" id="off-boarding">
                                                    <div className="card card-body mb-2">
                                                        <p>Only following type of columns is supported with no 'Additional Column Settings'</p>
                                                        <ul>
                                                            <li>Single line of text</li>
                                                            <li>Number</li>
                                                            <li>Date</li>
                                                            <li>Choice (dropdown only)</li>
                                                        </ul>
                                                        <p>Note: Column marked as mandatory will not be supported.</p>
                                                        <p className="text-center mb-0"><button type="Button" id="CustomFieldOffBoard" onClick={SettingComponenthis.GoToCustomField} className="btn btn-primary btn-sm modalBtn SwitchTitleColor">Proceed</button></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-inline">
                                                    <label className="mr-2">Task Due date calculate based on:</label>
                                                    <select id="drpDueDateBasedOn" className="form-control form-control-sm">
                                                        <option value="1">Onboard/Offboard Start Date</option>
                                                        <option value="2">Joining/Relieving Date</option>                                                      
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary EOBConfigSaveUpdateBtn modalBtn SwitchTitleColor" id={"ConfigSaveBtn"} onClick={SettingComponenthis.UpdateSettings} value={"Save"} />
                                <input type="Button" className="btn btn-light" onClick={SettingComponenthis.CloseModal} value="Cancel" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


