"use strict";
let BKUserInfoModalComponenthis = null;
function receiveMessage(event) {
    console.log(event.data)
    //alert("got message: " + event.data);
}
window.addEventListener('message', receiveMessage, false);
class BKUserInfoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            NotificationMessage: null,
            onSaveClose:this.props.AfterUserSave
        };
        BKUserInfoModalComponenthis = this;
        this._onUsersRestCallFailed = this._onUsersRestCallFailed.bind(this)
        this.GetLoggedInUserDetail = this.GetLoggedInUserDetail.bind(this)
        this.SaveCustomer = this.SaveCustomer.bind(this)
        this._onUserDetailFromIdSuccess = this._onUserDetailFromIdSuccess.bind(this)
        this.CloseModal = this.CloseModal.bind(this)
        this.ShowModalWithError = this.ShowModalWithError.bind(this);
    }
    componentWillMount() {

    }

    componentDidMount() {
        var modal = document.getElementById("BKUserInfoModal");
        modal.style.display = "block";
        $("#BKUserInfoModal").css("z-index", "999");
        EOBConstants.SetNewThemeColor()   
        this.GetLoggedInUserDetail();
    }
    HandleUpdate() {
        if (this.props.AfterUserSave) {
            this.props.AfterUserSave();
        }
    }
    GetLoggedInUserDetail() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUserInfoList/items?$filter=(ID eq '" + _spPageContextInfo.userId + "')"
        BKSPPeoplePicker.AjaxCall(Url, null, "Get", this._onUserDetailFromIdSuccess, this._onUsersRestCallFailed);
    }

    ReturniFrame() {
        return {
            __html: '<iframe id="resultFrame" src="https://www.beyondintranet.com/WebPanel/Test/Index1.aspx" > </iframe>'
        }
    }
    SaveCustomer() {
        BKValidationShared.CheckValidations();
        if (BKValidationShared.isErrorFree) {
            $("#BKUserInfoModal").css("z-index", "99");
            $("#loading").show();
            var UserName = $("#txtUserName").val();
            var Email = $("#txtUserEMail").val();
            var Contact = $("#txtContactNumber").val();
            var AppVersion = BKJSShared.GetQueryParameterByName("Version")
            BKSPAddUserInfo.AddNewUser(UserName, Email, AppVersion, Contact, this.CloseModal,this.ShowModalWithError)
        }        
    }
    Cancel() {
        
    }
    CloseModal() {
        $("#loading").hide();
        var modal = document.getElementById("BKUserInfoModal");
        modal.style.display = "none";
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success,"Saved succesfully.","User details has been saved successfully.",500)
        $("#loading").hide();
        BKUserInfoModalComponenthis.HandleUpdate()
      
    }
    ShowModalWithError() {
        $("#loading").hide();
        $("#AddUserFailedMsg").removeCss("d-none");
        $("#BKUserInfoModal").css("z-index", "999");
    }
    _onUserDetailFromIdSuccess(data) {
        if (data) {
            var UserName = data.d.results[0].FirstName + " " + data.d.results[0].LastName
            $("#txtUserName").val(UserName);
            $("#txtUserEMail").val(data.d.results[0].EMail);
            $("#txtContactNumber").val(data.d.results[0].WorkPhone);
            $("#txtDomain").val(BKSPAddUserInfo.DomainName);
        }
    }
    _onUsersRestCallFailed(data) {
        console.log(data)
    }
    render() {
        return (
            <div >
                <div id="BKUserInfoModal" className="modalReact">
                    <div className="modal-contentReact">
                      
                        <div className="row modal-head align-items-center">
                            <div id="UserInfoHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0 SwitchTitleColor" >User Information</p>
                            </div>
                        </div>
                        <div className="alert alert-danger d-none" id="AddUserFailedMsg" role="alert">
                            Failed in saving the user information.
                        </div>
                        <div className="row modal-body modal-form">
                            <div className="col-12">
                                <span>Please approve the following information <a href="http://www.beyondintranet.com/privacypolicy" target="_blank"  >(Privacy policy)</a> </span>
                            </div>
                            <br />
                            <br />
                            
                            <div className="col-12">
                                <div className="form-group">
                                    <label>User Name</label>
                                    <input type="text" id="txtUserName" readOnly maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="UserName" placeholder="" />
                                </div>                                
                             
                            </div>
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="text" id="txtUserEMail" readOnly maxlength="225" className="form-control form-control-sm BKValidateEmail" aria-describedby="UserEmail" placeholder="" />
                                </div>

                            </div>

                            <div className="col-12">
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input type="text" id="txtContactNumber" maxlength="225" className="form-control form-control-sm " aria-describedby="UserContacy" placeholder="" />
                                </div>

                            </div>

                            <div className="col-12 d-none">
                                <div className="form-group">
                                    <label>Domain</label>
                                    <input type="text" id="txtDomain" readOnly maxlength="225" className="form-control form-control-sm BKValidateEmptyValue" aria-describedby="Domain" placeholder="" />
                                </div>

                            </div>

                            
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <input type="Button" className="btn btn-primary modalBtn SwitchTitleColor" id="AddUserInfoSave" onClick={BKUserInfoModalComponenthis.SaveCustomer} value="OK" />
                                <input type="Button" className="btn btn-light" onClick={BKUserInfoModalComponenthis.Cancel} value="Cancel" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
