"use strict";
var EOBConstants = {
    DefaultSettings: {
        PageSize: "10"
    },
    ListNames: {
        Category: "Category",
        ProcessType: "lstProcessType",
        Department: "Departmentlst",
        Position: "Positionlst",
        EmployeeType: "EmployeeTypelst",
        Configurations: "Configurations",
        Settings: "Settings",
        ActualTasks: "ActualTasks",
        EmployeeOnBoard: "lstEmployeeOnboard",
        Level: "Levellst",
        TaskTemplateMaster: "TaskTemplateMaster",
        TaskTemplateDetail: "TaskTemplate",
        StandardTask: "StandardTask",
        EmailTemplates: "EmailTemplates",
        PageAnalytics: "Page Analytics",
        UserAnalytics: "User Analytics",
        UserConfig: "UserConfig",
        UserPermissions: "UserPermission"
    },
    MenuNames: {
        //Home is Dashboard
        Home: "#MenuHeaderHome",
        Masters: "#MenuHeaderMasters",
        Reports: "#MenuHeaderReports",
        Process: "#MenuHeaderProcess",
        Help: '#MenuHeaderHelp',
        DataAnalytics: '#MenuHeaderDataAnalytics'
    },
    ProcessNames: {
        OnBoard: "Onboarding",
        OffBoard: "Offboarding",
    },
    ClassNames: {
        SwitchTitleColor:"SwitchTitleColor"
    },
    EOBThemeElements: [
        { ClassName: ".table thead tr", CssProperty: ["background-color"] },
        { ClassName: ".table thead tr th a", CssProperty: ["background-color"] },
        //{ ClassName: ".add-new strong", CssProperty: ["color", "border-color"] },
        { ClassName: ".EOBSaveUpdateBtn", CssProperty: ["background-color"] },
        { ClassName: ".EOBConfigSaveUpdateBtn", CssProperty: ["background-color"] },
        { ClassName: ".switch.toggle-on span", CssProperty: ["background-color"] },
        { ClassName: ".btn-primary", CssProperty: ["border-color"] }, 
        { ClassName: ".btn-primary", CssProperty: ["background-color"] }, 
        //{ ClassName: ".top-menu ul .nav-item.active a", CssProperty: ["border-color"] },
        { ClassName: ".top-menu ul li .dropdown-menu a:focus ", CssProperty: ["background-color"] },
        { ClassName: ".dropdown-toggle", CssProperty: ["border-color"] },
        { ClassName: ".nav-item", CssProperty: ["border-color"] },
        { ClassName: ".nav-link", CssProperty: ["border-color"] },
        //{ ClassName: ".page-name", CssProperty: ["color"] },     
        { ClassName: "#DepartmentSearchBtn", CssProperty: ["background-color"] },
        { ClassName: ".modal-head", CssProperty: ["background-color"] },
        { ClassName: ".modalBtn", CssProperty: ["background-color"] },
        { ClassName: ".collapse-main a i", CssProperty: ["background-color"] },
        { ClassName: "fa-angle-right", CssProperty: ["color"] },
        { ClassName: "fa-angle-left", CssProperty: ["color"] },        
        { ClassName: ".menu-icon", CssProperty: ["background-color"] },
        { ClassName: ".email-head", CssProperty: ["background-color"] } 
        
        //{ ClassName: ".tab-menu .nav-item .nav-link.active", CssProperty: ["background-color"] }
    ],  
    SetNewThemeColor: function () {
        for (var i = 0; i < EOBConstants.EOBThemeElements.length; i++) {
            var StyleObject = {}
            if (EOBConstants.EOBThemeElements[i]["ClassName"].indexOf("#") > -1) {
                $(EOBConstants.EOBThemeElements[i]["ClassName"]).attr('style', "background-color:" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            }
            else {
                if (EOBConstants.EOBThemeElements[i]["ClassName"].indexOf(' ') > -1) {
                    for (var k = 0; k < EOBConstants.EOBThemeElements[i]["CssProperty"].length; k++) {
                        $(EOBConstants.EOBThemeElements[i]["ClassName"]).attr('style', EOBConstants.EOBThemeElements[i]["CssProperty"][k] + ":" + ConfigModal.gConfigSettings.ThemeColor + " !important");
                    }
                }
                else {
                    for (var k = 0; k < EOBConstants.EOBThemeElements[i]["CssProperty"].length; k++) {
                        StyleObject[EOBConstants.EOBThemeElements[i]["CssProperty"][k]] = ConfigModal.gConfigSettings.ThemeColor;
                        
                    }
                    $(EOBConstants.EOBThemeElements[i]["ClassName"]).css(StyleObject);
                }                
            }
        }
        setTimeout(EOBConstants.SetDarkOrLightColor, 50);
               
    },
    SetDarkOrLightColor: function () {
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        $('.SwitchTitleColor').css('color', Color);
    }

};
