"use strict";
let MainHeaderComponent = null;
class MainHeaderConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageHeading: this.props.PageHeading,
            LogoTargetType: "self",
            LogoPath: "",
            UserInfoModal: null,
            ProductTitle: "",
            LoggedINInitials:""
        };
        MainHeaderComponent = this;
        BKJSShared.Application.Name = "EmployeeOnBoarding"
        BKJSShared.Application.isSPAddin = true;        
    }
    componentDidMount() {
        ConfigModal.GetGlobalSettings(MainHeaderComponent._onThemeSettingsLoad,true);
        var MyPicUrl = _spPageContextInfo.webAbsoluteUrl + "/_layouts/15/userphoto.aspx?size=S&accountname=" + _spPageContextInfo.userLoginName
        $('#CurrentLoggedInUserPic').attr('src', MyPicUrl);       
    } 
    _OnUserExistSuccess(data) {
     
            if (data == 0) {
                //Open Dialog
                let dialog = null;
                dialog = <BKUserInfoModal />
                MainHeaderComponent.setState({ UserInfoModal: dialog }, function () { $("#loading").hide(); });
            }
            else {
              //  MainHeaderComponent.InitializeSettings()
            }
       
    }
    InitializeSettings(data) {
        ConfigModal.GetGlobalSettings(MainHeaderComponent._onThemeSettingsLoad);
    }
    _onThemeSettingsLoad() {
        if (ConfigModal.gConfigSettings.CustomLogoUrl) {
            $("#EOBLogoLink").attr("href", ConfigModal.gConfigSettings.CustomLogoUrl)
            if (ConfigModal.gConfigSettings.isOpenLogoUrlInNewTab) {
                $("#EOBLogoLink").attr("target", "_blank");
            }
            else {
                $("#EOBLogoLink").attr("target", "_self");
            }
          
        }
        MainHeaderComponent.setState({ ProductTitle: ConfigModal.gConfigSettings.OnBoardText });
        if (ConfigModal.gConfigSettings.LogoUrl) {
            $("#EOBMainLogo").attr("src", ConfigModal.gConfigSettings.LogoUrl);
        }
        else {
            
            $("#EOBMainLogo").attr("src", "../images/bi_logo.png");
        }
       
        var tmpImg = new Image();
        tmpImg.src = $('#EOBMainLogo').attr('src');
        tmpImg.onload = function () {
            // Run onload code.
            var SizeObject = BKJSShared.CalculateAspectRatio($('#EOBMainLogo').prop('naturalWidth'), $('#EOBMainLogo').prop('naturalHeight'), ConfigModal.iDefaultLogoWidth, ConfigModal.iDefaultLogoHeight);
            //$(".img1").attr('height', SizeObject.height);
            $("#EOBMainLogo").width(parseInt(SizeObject.width) + "px");           
        };
        //BKSPAddUserInfo.CheckIsUserExist(MainHeaderComponent._OnUserExistSuccess)
    }
    
    render() {
        return (
            <div>
                <div className="contaner-fluid">
                    <div className="row align-items-center header-main">
                        <div className="col-3 logo">
                            <a id="EOBLogoLink"  target={this.state.LogoTargetType}><img role="Logo" id="EOBMainLogo" alt="EOBLogo"  /></a>
                        </div>
                        <div className="col-6 text-center page-title">
                            <p><span className="page-title-logo"><img role="employee onboarding" alt="Employee Onboarding" src="../images/employee-onboarding-logo.png" /> </span><span>{MainHeaderComponent.state.ProductTitle}</span> / <span className="page-name">{MainHeaderComponent.state.pageHeading}</span></p>
                        </div>
                        <div className="col-3 text-right">
                            <p className="m-0"><span className="user-img"> <img className="main-header-img" role="User Image" id="CurrentLoggedInUserPic" alt={this.state.LoggedINInitials} src="../images/user_img.png" /> </span><strong>Welcome </strong>{_spPageContextInfo.userDisplayName}</p>
                        </div>
                    </div>
                </div>
                {this.state.UserInfoModal}
            </div>
        );
    }
}
