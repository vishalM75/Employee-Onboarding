"use strict";
let MenuHeaderComponent = null;
let isThemeDialogOpened = false;
let isSettingsDialogOpened = false;

class MenuHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ThemeDialog: null,
            SettingDialog: null,
            UserInfoDialog: null,
            ActiveMenu: this.props.ActiveMenu,
            MenuItems:null
        };
        MenuHeaderComponent = this;
        ConfigModal._FunctionsAfterAdminStatusLoad.push(MenuHeaderComponent.RenderUserBasedMenu)
    }
    
    componentDidMount() {
        //MenuHeaderComponent.RenderUserBasedMenu();
       
    }

    OpenSettingsDialog() {
        MenuHeaderComponent.setState({ SettingDialog: false }, MenuHeaderComponent._OpenDialog);
    }
    RenderUserBasedMenu() {
        var UserBasedMenuItems = null;
        var isUserBelongToAnyLevel = (ConfigModal.gConfigSettings.CurrentUserLevel.length > 0) ? true : false;
        if (ConfigModal.gConfigSettings.isCurrentUserAdmin || isUserBelongToAnyLevel ||ConfigModal.gConfigSettings.isAllowAllUsers ) {
            UserBasedMenuItems = MenuHeaderComponent.ReturnMenu("SuperOrLevelAdmin")
        }
        else if (ConfigModal.gConfigSettings.isCurrentUserDepartmentAdmin) {
            UserBasedMenuItems = MenuHeaderComponent.ReturnMenu("DepartmentAdmin")
        }
        else {
            UserBasedMenuItems = MenuHeaderComponent.ReturnMenu()
        }
        MenuHeaderComponent.setState({ MenuItems: UserBasedMenuItems }, function () { $(this.props.ActiveMenu).addClass("active"); EOBConstants.SetNewThemeColor();});
    }

    _OpenDialog() {
        let Dialog = null;
        Dialog = <SettingsDialog />
        MenuHeaderComponent.setState({ SettingDialog: Dialog });
    }
    SetTheme(Control) {
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        Control.currentTarget.style.color = Color
        $('.dropdown-item:hover').css("background-color", ConfigModal.gConfigSettings.ThemeColor)
    }
    ReSetTheme(Control) {
        $('.dropdown-item').css("color", "black")
        $('.dropdown-item').css("background-color", "#e4e3e3")
    }
    SetCurrentHighlighted() {
        var url = window.location.pathname;
        var myPageName = url.substring(url.lastIndexOf('/') + 1);
        var AllMenus = $('.dropdown-item');
        for (var i = 0; i < AllMenus.length; i++) {
            var CurrentMenu = $(AllMenus[i]);
            if (CurrentMenu[0].href.lastIndexOf(myPageName) > -1) {
                $(CurrentMenu[0]).css("background-color", "#green")
                break;
            }
        }
    }
    ReturnMenu(PermissionLevel) {
        //PermissionLevel =  DepartmentAdmin, SuperOrLevelAdmin
        var MenuItems = []
        const DashBoardMenu = <li key="kDashboard" id="MenuHeaderHome" className="nav-item">  <a className="nav-link" href="Dashboard.aspx">Home</a> </li>
        MenuItems.push(DashBoardMenu)
       
        if (PermissionLevel) {
            if (PermissionLevel == "SuperOrLevelAdmin") {
                const OnBoard = <li key="Konboard" id="MenuHeaderProcess" className="nav-item dropdown">
                    <a onMouseEnter={MenuHeaderComponent.ReSetTheme} className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Process</a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="OnboardOffboard.aspx?Process=1">Onboard</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="OnboardOffboard.aspx?Process=2">Offboard</a>
                    </div>
                </li>
                MenuItems.push(OnBoard)
                const Masters = <li key="kMaster" id="MenuHeaderMasters" className="nav-item dropdown">
                    <a onMouseEnter={MenuHeaderComponent.ReSetTheme} className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Masters</a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Category.aspx">Manage Categories</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="StandardTask.aspx">Manage Standard Tasks</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="TaskTemplate.aspx">Manage Templates</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="EmployeeType.aspx">{"Manage " + ConfigModal.gConfigSettings.DisplayTextEmployee + " Types"}</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Position.aspx">Manage Positions</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Level.aspx">Manage Levels</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Department.aspx">Manage Departments</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="EmailTemplate.aspx">Manage Email Templates</a>
                        <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="#" onClick={MenuHeaderComponent.OpenSettingsDialog}>Configuration Settings</a>
                    </div>
                </li>
                MenuItems.push(Masters)
                
                const Reports = <li key="kReport" id="MenuHeaderReports" className="nav-item">
                    <a className="nav-link" href="Report.aspx">Reports</a>
                </li>
               
                MenuItems.push(Reports)
                const DataAnalyticsMenu = <li key="kDataAnal" id="MenuHeaderDataAnalytics" className="nav-item">
                    <a className="nav-link" href="DataAnalytics.aspx">Data Analytics</a>
                </li>
                MenuItems.push(DataAnalyticsMenu)
            }
            else if (PermissionLevel == "DepartmentAdmin") {
                const ReportMenu = <li key="kReportMenu" id="MenuHeaderReports" className="nav-item">
                    <a className="nav-link" href="Report.aspx">Reports</a>
                </li>
                MenuItems.push(ReportMenu)
            }        
        }
        
        //Help will be visible to all
        const HelpMenu = <li key="kHelp" id="MenuHeaderHelp" className="nav-item dropdown">
            <a onMouseEnter={MenuHeaderComponent.ReSetTheme} className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Help
                                        </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Category.aspx">Video Demonstration</a>
                <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="Category.aspx">User Manual</a>
                <a onMouseEnter={MenuHeaderComponent.SetTheme} onMouseLeave={MenuHeaderComponent.ReSetTheme} className="dropdown-item TestHover" href="https://www.beyondintranet.com/contact#focus">Contact Us</a>
            </div>
        </li>    
        MenuItems.push(HelpMenu)
        if (ConfigModal.gConfigSettings.isCurrentUserAdmin || ConfigModal.gConfigSettings.isAllowAllUsers) {
            var isLicenseExpired = BKSPCustomerLicense.IsLicenseExpired()
            var isLicenseFree = BKSPCustomerLicense.IsLicenseTypeFreeOrTrial()
            if (isLicenseExpired || isLicenseFree) {
                const BuyNow = <li key="KBuy" id="MenuHeaderBuyNow" className="nav-item">
                    <a className="nav-link" href="https://www.beyondintranet.com/employeeonboarding#VersionComparisons">Buy Now</a>
                </li>
                MenuItems.push(BuyNow)
            }            
        }
        return MenuItems;
    }
    render() {
        return (
            <div className="contaner-fluid">
                <div className="row top-menu">
                    <nav className="navbar navbar-expand-lg navbar-light menu-bg-color col-12">
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                       
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav mr-auto">
                                {MenuHeaderComponent.state.MenuItems}                                                              
                            </ul>
                        </div>
                        <div>
                            {MenuHeaderComponent.state.ThemeDialog}
                        </div>
                        <div>
                            {MenuHeaderComponent.state.SettingDialog}
                        </div>
                        <div>
                            {MenuHeaderComponent.state.UserInfoDialog}
                        </div>
                    </nav>
                </div>
            </div>


        );

    }
}
