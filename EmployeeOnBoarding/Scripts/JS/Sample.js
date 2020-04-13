/// <reference path="lib/jquery-1.12.4.min.js" />
/// <reference path="lib/jquery-ui-1.10.4.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />
/// <reference path="KTMDynamic.js" />
/// <reference path="KTMPhrases.js" />
/*!
 * Copyright 2012, Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */
"use strict";
$(document).ready(function () {

    //$('.menu-item-text:contains("KTM Settings")').css('display', 'none');
    $('.ms-cui-tt:contains("Page")').css('display', 'none');
    //$('.static.menu-item:contains("KTM Settings")').css('display', 'none');
});

var KTMDateFormat = "";//needs to be set by SP or OL, 
//used in showing date on task card on kanban view
//Set Moment date format here, for example DD/MM/YYYY
var KTMDateTimeFormat = "";

var IsOLDB = false;//used to check if Outlook (SQL or MS Access)

var KTMGlobalVariable = {
    isPremiumVersion: false,
    UserHasReadOnlyPermission: false,
    Template: null,
    FiltersVisible: false,
    DetailsPaneVisible: false,
    DisplayMode: "Kanban", //Scheduler
    CurrentView: null
};
var KTMDefaultValues = {
    Responsible: null
};
var KTMFilterValues = {
    SearchValue: "",
    Projects: [],
    Responsibles: [],
    ExtraField: [],
    HighPriority: 1,
    NormalPriority: 1,
    LowPriority: 1
};

var KTMPremiumUser = { // Add Premium user here, userhash key is premium user's name and value is image src url
    userName: "Mesa",
    userHash: {
        "nes": "../img/Ktmlogo_sp.png", // not a member anymore
        "Gamma": "../img/Gamma.jpg", // sandbox
        "Safran Aircraft Engines": "../img/logo_safran.png",  //add-in
        "Middlesex Community College": "../img/MCC_NavySmall.jpg", //add-in
        "Mesa": "../img/Mesa.png", //add-in
        "ONA": "../img/ONA.png",// sandbox
        "ETAT": "../img/Ktmlogo_sp.png",// sandbox // not paid
        "Pentair": "../img/Pentair.png"// sandbox
    },
    urlHash: {
        "nes": "https://www.kalmstrom.com",
        "Gamma": "http://Hsrti.org",
        "Safran Aircraft Engines": "https://www.kalmstrom.com",
        "Middlesex Community College": "https://www.kalmstrom.com",
        "Mesa": "https://www.kalmstrom.com",
        "ONA": "https://www.kalmstrom.com",
        "ETAT": "https://www.kalmstrom.com",
        "Pentair": "https://www.Pentair.com"
    },
    boardTitleHash: {
        "nes": "",
        "Gamma": "Kanban Board",
        "Safran Aircraft Engines": "",
        "Middlesex Community College": "",
        "Mesa": "",
        "ONA": "",
        "ETAT": ""
    },
    ExcelReportHash: {
        "nes": "",
        "Gamma": "",
        "Safran Aircraft Engines": "",
        "Middlesex Community College": "",
        "Mesa": "https://appsinside.dev.mesaaz.gov/KTMExcelReport",
        "ONA": "https://kanban.ona.gov.au",
        "ETAT": "",
        "Pentair": "http://uschisap309:81"
    },
    PremiumBannerImagePath: "",
    GetImagePath: function (AlternatePath) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (KTMPremiumUser.PremiumBannerImagePath === "") {
                if (K.kalmstromShared.kNotEmptyString(AlternatePath)) {
                    KTMPremiumUser.PremiumBannerImagePath = AlternatePath;
                    if (K.kalmstromShared.FileExists(KTMPremiumUser.PremiumBannerImagePath) === false) {
                        KTMPremiumUser.PremiumBannerImagePath = KTMPremiumUser.userHash[KTMPremiumUser.userName];
                    }
                }
                else {
                    KTMPremiumUser.PremiumBannerImagePath = KTMPremiumUser.userHash[KTMPremiumUser.userName];
                }
            }
            return KTMPremiumUser.PremiumBannerImagePath;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObject.KTMPremiumUser.GetImagePath"); }
    }
};
var KTMCacheVersion = "v7_0_15";
var KTMCacheKeys = {
    Settings: "KTMSettingsCache" + KTMCacheVersion,
    Data: "KTMDataCache" + KTMCacheVersion,
    LastView: "KTMView" + KTMCacheVersion,
    DetailAccordion: "KTMdAccordion" + KTMCacheVersion,
    LaneVisible: "KTMLaneVisible" + KTMCacheVersion,
    UserLCID: "KTMUserLCID" + + KTMCacheVersion
};
var CurrSelectedTask = null;//(in development)is being used to hold current selected task, previously we were using ".selectedTask" 
var KTMCache = { //These settings are stored for each user - in the localStorage

    TasksReadTime: "",//Last read time of tasks list
    TasksLastChangeToken: "",//Used to find lastest tasks 
    Tasks: [],
    SaveToLS: function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //to avoid circuler reference in stringify
            var lis = {};
            for (var x in KTMCache.Tasks) {
                var cTask = KTMCache.Tasks[x];
                lis[cTask.ID] = cTask._LiObject;
                cTask._LiObject = null;
            }
            K.kalmstromShared.LocalStorage.Store((KTMCacheKeys.Data + KTMSharedSettings.AttachedListGUID), JSON.stringify(KTMCache));
            for (var x in KTMCache.Tasks) {
                var cTask = KTMCache.Tasks[x];
                cTask._LiObject = lis[cTask.ID];
            }
            //K.kalmstromShared.LocalStorage.Store((KTMCacheKeys.Data + KTMSharedSettings.AttachedListGUID), "");
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMCache.SaveToLS"); }
    },
    ReadFromLS: function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var SavedJSON = K.kalmstromShared.LocalStorage.Load((KTMCacheKeys.Data + KTMSharedSettings.AttachedListGUID));
            if (SavedJSON == "") { return false; }
            var SavedKTMCache = JSON.parse(SavedJSON);
            KTMCache.TasksReadTime = SavedKTMCache.TasksReadTime;
            KTMCache.TasksLastChangeToken = SavedKTMCache.TasksLastChangeToken;
            KTMCache.Tasks = [];
            for (var i = 0; i < SavedKTMCache.Tasks.length; i++) {
                var CurrTask = new KTMTask();
                //empty date is converted to object after reading from local storage

                if (typeof SavedKTMCache.Tasks[i].start_date === "object") {
                    SavedKTMCache.Tasks[i].start_date = null;
                }
                if (typeof SavedKTMCache.Tasks[i].end_date === "object") {
                    SavedKTMCache.Tasks[i].end_date = null;
                }
                CurrTask.FromSaved(SavedKTMCache.Tasks[i]);
                KTMCache.Tasks.push(CurrTask);
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "kKTM.ReadFromLS");
        }
    },
    ClearLS: function (ShowMessage) {
        //if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //commented above error mode check 
            //because this function should work even after an error has occured
            K.kalmstromShared.LocalStorage.Store((KTMCacheKeys.Data + KTMSharedSettings.AttachedListGUID), "");
            K.kalmstromShared.LocalStorage.Store("KTMFilterState", "");
            K.kalmstromShared.LocalStorage.Store(KTMCacheKeys.UserLCID + KTMSharedSettings.AttachedListGUID, "");

            if (ShowMessage === true) {
                alert(LNGCACHECLEARED().replace("[PRODUCT]", K.kalmstromShared.kApplication.name));
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMCache.ClearLS");
        }
    },
    ReadFilters: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            //Check if "search" parameter exists in URL, otherwise read filters from local storage
            var pattern = /[?&]search=/;
            if (pattern.test(window.location.href)) {
                var search = K.kalmstromShared.GetQueryParameterByName('search');
                if (search.length > 0) {
                    KTMFilterValues.SearchValue = search;
                }

                var project = K.kalmstromShared.GetQueryParameterByName('project');
                if (project.length > 0) {
                    var projectArr = project.split("|");
                    KTMFilterValues.Projects = projectArr;
                }

                var responsible = K.kalmstromShared.GetQueryParameterByName('responsible');
                if (responsible.length > 0) {
                    var responsibleArr = responsible.split("|");
                    KTMFilterValues.Responsibles = responsibleArr;
                }

                if (K.kalmstromShared.kNotEmptyString(KTMSharedSettings.ExtraFieldName)) {
                    var extrafield = K.kalmstromShared.GetQueryParameterByName('extrafield');
                    if (extrafield.length > 0) {
                        var extrafieldArr = extrafield.split("|");
                        KTMFilterValues.ExtraField = extrafieldArr;
                    }
                }

                var high = K.kalmstromShared.GetQueryParameterByName('high');
                if (high.length > 0) {
                    $("#chkHigh")[0].checked = parseInt(high);
                    KTMFilterValues.HighPriority = high == 1 ? true : false;
                }
                var normal = K.kalmstromShared.GetQueryParameterByName('normal');
                if (normal.length > 0) {
                    KTMFilterValues.NormalPriority = normal == 1 ? true : false;
                    $("#chkNormal")[0].checked = parseInt(normal);
                }
                var low = K.kalmstromShared.GetQueryParameterByName('low');
                if (low.length > 0) {
                    KTMFilterValues.LowPriority = low == 1 ? true : false;
                    $("#chkLow")[0].checked = parseInt(low);
                }
            } else {
                var SavedKTMFilterJSON = K.kalmstromShared.LocalStorage.Load("KTMFilterState");
                if (K.kalmstromShared.kNotEmptyString(SavedKTMFilterJSON)) {
                    var SavedKTMFilterCache = JSON.parse(SavedKTMFilterJSON);
                    KTMFilterValues.SearchValue = SavedKTMFilterCache.SearchValue;
                    KTMFilterValues.Projects = SavedKTMFilterCache.Projects;
                    KTMFilterValues.Responsibles = SavedKTMFilterCache.Responsibles;
                    KTMFilterValues.ExtraField = SavedKTMFilterCache.ExtraField;
                    KTMFilterValues.HighPriority = SavedKTMFilterCache.HighPriority;
                    KTMFilterValues.NormalPriority = SavedKTMFilterCache.NormalPriority;
                    KTMFilterValues.LowPriority = SavedKTMFilterCache.LowPriority;
                }
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMCache.ReadFilters");
        }
    }
};

var KTMGridSettings = {
    TabName: "",
    Visibility: true,
    AllowAdd: true,
    AllowEdit: true
};

var KTMSharedSettings = {
    OLFolders: [],
    Projects: [],
    Responsibles: [],
    Phases: [],
    Lanes: [],
    LanePros: null,
    ProjectPros: null,
    Priorities: [],
    ExtraValues: [],
    ExtraFieldName: "",
    //in a special item
    ColorAssociation: "Project",//in a special item for sharing with KTMO//"Responsible"|"Project"
    // all the below settings are stored in the OtherSettings item
    PhaseToDeleteTo: null,
    BodyLength: 110,
    AttachedListGUID: "", // Used for unique identification and for saving to local storage
    //==================Task List===================
    IsCustomTaskList: false,
    CustomTaskListGUID: "",
    CustomTaskListName: "",
    //==================Task List===================
    CacheVersion: 0, // Required to clear cache of all KTM Users
    //===============Move Task Assign tasks between multiple Kanban boards========================
    EnableMoveTask: false,
    lstMoveToSites: [],
    //===============Move Task Assign tasks between multiple Kanban boards========================
    //======================Reg==================
    RegID: "",
    RegS: 1,
    Regd: null,
    //======================Reg==================

    RegOLS: 1,
    RegDOL: null,

    //=====================Grid Settings===============
    GridSettings: [],
    //=====================Grid Settings===============
    BuiltResponsibleUpdated: "updated",
    ReadOnlyMonthView: false,
    myTasksSiteMode: 0, //0 all tasks, 1 current site
    myTasksFilterOption: 4, //4 for option "Complete"
    Category2Usage: "DueDate",// Category 2 can be used for DueDate or Extra
    TasksLists: [], //List of tasks, New field added by Kapil Patel
    LookupsUpdated: true,// v6 Upgrade lookups to site columns
    JSLinkCSRAdded: false,
    JSLinkCSRVersion: 0,
    objConnectionInfo: null,
    IsSingleVersion: false,
    ReadOnly: false,
    BrandLogo: "",//src with path for logo in setting page (set from interaction js)
    BrandAltText: "",//alt text for logo in setting page (set from interaction js)
    HasDesignPermission: true, //This is for Outlook interaction, in case of SharePoint sharing options - Used to show hide setting icon.
    IsPlatformSP: true,//true for SP, false for OL(set from interaction js)
    RegistrationStatus: 1, //Trail: 1, Registered: 2, Expire: 3, Unsubscribe: 4, InvalidKey: 5
    OpenConvertedTask: 0, //Ask: 0, Yes: 1, No: 2
    IsCheckList: false,
    IsTimeLogging: false,
    AllowEmptyResponsible: true,
    ChecklistTemplates: [],
    IsOpenHrs: true, // This extra variable needed for excel report backward compatibility
    Hours: {
        StartDay: 1, //Monday
        EndDay: 5, //Friday

        ServiceHours: true,
        ServiceHoursStartMinutes: 540,
        ServiceHoursEndMinutes: 1020,

        LunchHours: true,
        ServiceHoursLunchStartMinutes: 720,
        ServiceHoursLunchEndMinutes: 780,
        ServiceHoursLunchDuration: 60,

        FullWeekMinutes: 2400,
        FullWorkDayMinutes: 480
    },
    DefaultValues: {
        Responsible: "",
        StartDate: "",
        DueDate: "",
        Project: "",
        Priority: ""
    },
    IsSingleResponsible: true, // used to check if mutiple responsible support need to give or not
    readfromJSON: function (JsonString) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            if (!K.kalmstromShared.kNotEmptyString(JsonString)) {
                return false;
            }

            var currSettngs = JSON.parse(JsonString);
            KTMSharedSettings.ColorAssociation = currSettngs.ColorAssociation;
            KTMSharedSettings.PhaseToDeleteTo = currSettngs.PhaseToDeleteTo;
            if (typeof (currSettngs.ExtraFieldName) === "undefined") { //Handled upgrade from old name
                KTMSharedSettings.ExtraFieldName = currSettngs.ExtraField;
            }
            else {
                KTMSharedSettings.ExtraFieldName = currSettngs.ExtraFieldName;
            }
            KTMSharedSettings.BodyLength = currSettngs.BodyLength;
            if (K.kalmstromShared.kNotEmptyString(currSettngs.AttachedListGUID)) {//upgrade case of JSON will not have variable
                KTMSharedSettings.AttachedListGUID = currSettngs.AttachedListGUID;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.IsCustomTaskList)) {
                KTMSharedSettings.IsCustomTaskList = currSettngs.IsCustomTaskList;
            }
            if (K.kalmstromShared.kNotEmptyString(currSettngs.CustomTaskListGUID)) {
                KTMSharedSettings.CustomTaskListGUID = currSettngs.CustomTaskListGUID;
            }
            if (K.kalmstromShared.kNotEmptyString(currSettngs.CustomTaskListName)) {
                KTMSharedSettings.CustomTaskListName = currSettngs.CustomTaskListName;
            }
            //KTMProject objects do not have functions, so using the saved array works             
            KTMSharedSettings.Projects = [];
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.Projects)) {
                KTMSharedSettings.Projects = currSettngs.Projects;
            }
            KTMSharedSettings.ExtraValues = [];
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.ExtraValues)) {
                KTMSharedSettings.ExtraValues = currSettngs.ExtraValues;
            }
            KTMSharedSettings.Lanes = [];
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.Lanes)) {
                for (var i = 0; i < currSettngs.Lanes.length; i++) {
                    var CurrLane = new KTMLane();
                    CurrLane.FromSaved(currSettngs.Lanes[i]);
                    KTMSharedSettings.Lanes.push(CurrLane);
                }
            }
            KTMSharedSettings.Phases = [];
            var SavedPhases = currSettngs.Phases;
            if ((!K.kalmstromShared.kNotNullOrUndefined(SavedPhases)) && (K.kalmstromShared.kNotNullOrUndefined(currSettngs.BuiltInPhasesCol))) { //Handled upgrade for bad name
                SavedPhases = currSettngs.BuiltInPhasesCol;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(SavedPhases)) {
                for (var i = 0; i < SavedPhases.length; i++) {
                    var CurrPhase = new KTMPhase();
                    CurrPhase.FromSaved(SavedPhases[i]);
                    KTMSharedSettings.Phases.push(CurrPhase);
                }
            }
            KTMSharedSettings.Responsibles = [];
            var SavedResponsibles = currSettngs.Responsibles;
            if ((!K.kalmstromShared.kNotNullOrUndefined(SavedResponsibles)) && (K.kalmstromShared.kNotNullOrUndefined(currSettngs.BuiltInResponsiblesCol))) { //Handled upgrade for bad name
                SavedResponsibles = currSettngs.BuiltInResponsiblesCol;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(SavedResponsibles)) {
                for (var i = 0; i < SavedResponsibles.length; i++) {
                    var CurrResponsible = new KTMResponsible();
                    CurrResponsible.FromSaved(SavedResponsibles[i]);
                    var eRes = K.kalmstromShared.GetObjectByID(CurrResponsible.ID, KTMSharedSettings.Responsibles);
                    if (!K.kalmstromShared.kNotNullOrUndefined(eRes)) {
                        KTMSharedSettings.Responsibles.push(CurrResponsible);
                    }
                }
            }

            KTMSharedSettings.Priorities = [];
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.Priorities)) {
                KTMSharedSettings.Priorities = currSettngs.Priorities;
            }
            KTMSharedSettings.CacheVersion = currSettngs.CacheVersion;
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.EnableMoveTask)) {
                KTMSharedSettings.EnableMoveTask = currSettngs.EnableMoveTask;
            }
            KTMSharedSettings.lstMoveToSites = [];
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.lstMoveToSites)) {
                KTMSharedSettings.lstMoveToSites = currSettngs.lstMoveToSites;
            }

            KTMSharedSettings.RegID = currSettngs.RegID;
            KTMSharedSettings.RegS = currSettngs.RegS;
            KTMSharedSettings.Regd = currSettngs.Regd;
            KTMSharedSettings.RegOLS = currSettngs.RegOLS;
            KTMSharedSettings.RegDOL = currSettngs.RegDOL;
            KTMSharedSettings.OpenConvertedTask = currSettngs.OpenConvertedTask;
            KTMSharedSettings.HasDesignPermission = currSettngs.HasDesignPermission;

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.IsSingleUser)) {
                KTMSharedSettings.IsSingleVersion = currSettngs.IsSingleUser;
            } else {
                KTMSharedSettings.IsSingleVersion = false;
            }

            if (K.kalmstromShared.kNotEmptyString(currSettngs.BuiltResponsibleUpdated)) {
                KTMSharedSettings.BuiltResponsibleUpdated = currSettngs.BuiltResponsibleUpdated;
            }
            else {
                KTMSharedSettings.BuiltResponsibleUpdated = "";
            }
            KTMSharedSettings.ReadOnlyMonthView = currSettngs.ReadOnlyMonthView;
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.myTasksSiteMode)) {
                KTMSharedSettings.myTasksSiteMode = currSettngs.myTasksSiteMode;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.myTasksFilterOption)) {
                KTMSharedSettings.myTasksFilterOption = currSettngs.myTasksFilterOption;
            }
            if (K.kalmstromShared.kNotEmptyString(currSettngs.Category2Usage)) {
                KTMSharedSettings.Category2Usage = currSettngs.Category2Usage;
            }

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.LookupsUpdated)) {
                KTMSharedSettings.LookupsUpdated = currSettngs.LookupsUpdated;
            }
            else {
                KTMSharedSettings.LookupsUpdated = false;
            }

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.JSLinkCSRAdded)) {
                KTMSharedSettings.JSLinkCSRAdded = currSettngs.JSLinkCSRAdded;
            }
            else {
                KTMSharedSettings.JSLinkCSRAdded = false;
            }

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.JSLinkCSRVersion)) {
                KTMSharedSettings.JSLinkCSRVersion = currSettngs.JSLinkCSRVersion;
            }
            else {
                KTMSharedSettings.JSLinkCSRVersion = 0;
            }

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.TasksLists)) {
                KTMSharedSettings.TasksLists = currSettngs.TasksLists;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.ReadOnly)) {
                KTMSharedSettings.ReadOnly = currSettngs.ReadOnly;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.objConnectionInfo)) {
                KTMSharedSettings.objConnectionInfo = currSettngs.objConnectionInfo;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.RegistrationStatus)) {
                KTMSharedSettings.RegistrationStatus = currSettngs.RegistrationStatus;
            }
            if (!K.kalmstromShared.kNotNullOrUndefined(currSettngs.LanePros)) {
                KTMSharedSettings.LanePros = new KTMFieldPro(LNGLANE());
            }
            else {
                KTMSharedSettings.LanePros = currSettngs.LanePros;
            }
            if (!K.kalmstromShared.kNotNullOrUndefined(currSettngs.ProjectPros)) {
                KTMSharedSettings.ProjectPros = new KTMFieldPro(LNGPROJECT());
            }
            else {
                KTMSharedSettings.ProjectPros = currSettngs.ProjectPros;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.IsCheckList)) {
                KTMSharedSettings.IsCheckList = currSettngs.IsCheckList;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.IsTimeLogging)) {
                KTMSharedSettings.IsTimeLogging = currSettngs.IsTimeLogging;
            }

            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.DefaultValues)) {
                KTMSharedSettings.DefaultValues.DueDate = currSettngs.DefaultValues.DueDate;
                KTMSharedSettings.DefaultValues.Priority = currSettngs.DefaultValues.Priority;
                KTMSharedSettings.DefaultValues.Project = currSettngs.DefaultValues.Project;
                KTMSharedSettings.DefaultValues.Responsible = currSettngs.DefaultValues.Responsible;
                KTMSharedSettings.DefaultValues.StartDate = currSettngs.DefaultValues.StartDate;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.AllowEmptyResponsible)) {
                KTMSharedSettings.AllowEmptyResponsible = currSettngs.AllowEmptyResponsible;
            }
            //===============Projects validation for Color Association ===============
            if (KTMSharedSettings.Projects.length == 0 && KTMSharedSettings.Responsibles.length > 0) {
                KTMSharedSettings.ColorAssociation = "Responsible";
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.ChecklistTemplates)) {
                KTMSharedSettings.ChecklistTemplates = currSettngs.ChecklistTemplates;
                if (KTMSharedSettings.ChecklistTemplates.length > 0) {
                    //Save to local storage - for loading in kAdvancedFields
                    kAdvancedFields.checkList.SaveChecklistTemplates(KTMSharedSettings.ChecklistTemplates);
                }
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.IsSingleResponsible)) {
                KTMSharedSettings.IsSingleResponsible = currSettngs.IsSingleResponsible;
            }
            if (K.kalmstromShared.kNotNullOrUndefined(currSettngs.Hours)) {
                KTMSharedSettings.Hours = currSettngs.Hours;
            }

            // ================= Sort All Objects ======================
            KTMSharedSettings.Projects.sort(K.kalmstromShared.SortObjectsByName);
            KTMSharedSettings.Responsibles.sort(K.kalmstromShared.SortObjectsByName);
            KTMSharedSettings.Lanes.sort(kKTM.SortyBySequenceAsc);
            KTMSharedSettings.Phases.sort(kKTM.SortyBySequenceAsc);
            KTMSharedSettings.ExtraValues.sort(K.kalmstromShared.SortObjectsByName);
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.readfromJSON");
        }
    },
    ValidateDefaultSettings: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            for (var x in KTMSharedSettings.DefaultValues) {
                var Value = KTMSharedSettings.DefaultValues[x];
                if (!K.kalmstromShared.kNotEmptyString(Value)) {
                    KTMSharedSettings.DefaultValues[x] = LNGDEFAULTVALUE();
                }
                else {
                    if (Value != LNGDEFAULTVALUE() && Value != LNGEMPTY()) {
                        var currobj;
                        if (x == "Responsible") {
                            currobj = K.kalmstromShared.GetObjectByName(Value, KTMSharedSettings.Responsibles);
                        }
                        else if (x == "Project") {
                            currobj = K.kalmstromShared.GetObjectByName(Value, KTMSharedSettings.Projects);
                        }
                        else if (x == "Priority") {
                            currobj = K.kalmstromShared.GetObjectByName(Value, KTMSharedSettings.Priorities);
                        }
                        if (!K.kalmstromShared.kNotNullOrUndefined(currobj)) {
                            KTMSharedSettings.DefaultValues[x] = LNGDEFAULTVALUE();
                        }
                    }
                }
            }

        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.ValidateDefaultSettings");
        }
    },
    GetPhaseDeleteToObj: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var CurrPhase = {
            };
            for (var i = 0; i < KTMSharedSettings.Phases.length; i++) {
                CurrPhase = KTMSharedSettings.Phases[i];
                if (CurrPhase.PhaseDeletein == true) {
                    return CurrPhase;
                }
            }
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMSharedSettings.GetPhaseDeleteToObj");
        }
    },
    GetGridSettingObj: function (SettingName) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var CurrSettings = {
            };
            for (var i = 0; i < KTMSharedSettings.GridSettings.length; i++) {
                CurrSettings = KTMSharedSettings.GridSettings[i];
                if (CurrSettings.TabName == SettingName) {
                    return CurrSettings;
                }
            }
            var DefaultSettings = {
                TabName: SettingName, Visibility: true, AllowAdd: true, AllowEdit: true
            };
            if (SettingName == "aResponsibles" || SettingName == "aTasksList" || SettingName == "aWorkingHours") {
                DefaultSettings.AllowAdd = false;
                DefaultSettings.AllowEdit = false;
            }
            KTMSharedSettings.GridSettings.push(DefaultSettings);
            return DefaultSettings;
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "kKTM.GetGridSettingObj");
        }
    },
    GetDefaultStartDateTime: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var date = null;
            if (KTMSharedSettings.DefaultValues.StartDate === LNGEMPTY()) {
                //do nothing
            } else if (KTMSharedSettings.DefaultValues.StartDate === LNGDEFAULTVALUE()) {
                date = new moment().clone();
            }
            return date;
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.GetDefaultStartDateTime");
        }
    },
    GetDefaultDueDateTime: function (StartDate) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var date = null;
            if (KTMSharedSettings.DefaultValues.DueDate === LNGEMPTY()) {
                //do nothing
            } else if (KTMSharedSettings.DefaultValues.DueDate === LNGDEFAULTVALUE()) {
                date = moment(StartDate).clone().add(24, "h");

            }
            return date;
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.GetDefaultDueDateTime");
        }
    },
    GetDefaultImportance: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var Priority = 2;
            if (KTMSharedSettings.DefaultValues.Priority === LNGDEFAULTVALUE()) {
                Priority = 2;
            } else {
                var PriorityObj = K.kalmstromShared.GetObjectByName(KTMSharedSettings.DefaultValues.Priority, KTMSharedSettings.Priorities);
                if (K.kalmstromShared.kNotNullOrUndefined(PriorityObj)) {
                    Priority = PriorityObj.ID;
                }
            }
            return Priority;
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.GetDefaultImportance");
        }
    },
    GetDefaultProject: function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            var ProjectName = "";
            if (KTMSharedSettings.DefaultValues.Project === LNGEMPTY()) {
                //set no project
            } else if (KTMSharedSettings.DefaultValues.Project === LNGDEFAULTVALUE()) {
                //set first project from projects
                if (KTMSharedSettings.Projects.length > 0) {
                    ProjectName = KTMSharedSettings.Projects[0].Name;
                }
            } else if (K.kalmstromShared.kNotEmptyString(KTMSharedSettings.DefaultValues.Project)) {
                //set project from saved settings
                ProjectName = KTMSharedSettings.DefaultValues.Project;
            }
            return ProjectName;
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.GetDefaultProject");
        }
    },
    GetResponsibles: function (skipNotassigned) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (skipNotassigned !== true) {
                return KTMSharedSettings.Responsibles;
            }
            else {
                var Res = [];
                for (var i = 0; i < KTMSharedSettings.Responsibles.length; i++) {
                    if (KTMSharedSettings.Responsibles[i].Name != LNGRESPONSIBLEDEFAUTLVALUE()) {
                        Res.push(KTMSharedSettings.Responsibles[i]);
                    }
                }
                return Res;
            }
        }
        catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMGlobalObjects.KTMSharedSettings.GetResponsibles");
        }
    }
};

//**********************************************************
//These functions are meant to be used as classes
//**********************************************************

function DayLog(ISODay, Minutes, Comment) {
    var MyObj = {};
    MyObj.ISODay = ISODay;
    MyObj.Minutes = Minutes;
    MyObj.Comment = Comment;
    return MyObj;
}

function KTMCLTempate(ID, Name, Items) { // Checklist template object
    var MyObj = {};
    MyObj.ID = 0;
    MyObj.Name = Name;
    MyObj.Items = [];
    return MyObj;
}

function KTMFieldPro(Name, InternalName) {
    var MyObj = {
    };
    MyObj.Name = Name;
    MyObj.InternalName = InternalName;
    return MyObj;
}
function KTMProject(ID, Name, Color, Hide) {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    MyObj.Color = "";
    MyObj.Hide = false;
    return MyObj;
}

function KTMExtraValue(ID, Name) {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    return MyObj;
}

function KTMPriority(ID, Name) {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    return MyObj;
}
function KTMDefaultValue(ID, Name, Value) {
    var MyObj = {
    };
    MyObj.ID = ID;
    MyObj.Name = Name;
    MyObj.Value = Value;
    return MyObj;
}
function KTMResponsible(ID, Name, Color, Hide) {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    MyObj.Color = "";
    MyObj.PicPath = "";
    MyObj.Initials = "";
    MyObj.Hide = false;
    MyObj.NonKTMSPUser = false;
    MyObj.setName = function (NewName) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            MyObj.Name = NewName;
            MyObj.setInitials();
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.setName");
        }
    },
        MyObj.setInitials = function () {
            if (K.kalmstromShared.kErrorMode === true) {
                return false;
            }
            try {
                MyObj.Initials = K.kalmstromShared.GetInitials(MyObj.Name, 2);
            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.setName");
            }
        },
        MyObj.GetImageHTML = function () {
            if (K.kalmstromShared.kErrorMode === true) {
                return false;
            }
            try {
                if (KTMSharedSettings.IsPlatformSP == false || !K.kalmstromShared.kNotEmptyString(MyObj.PicPath)) {
                    if (!K.kalmstromShared.kNotEmptyString(MyObj.Initials)) {
                        MyObj.setInitials();
                    }
                    return "<div class='ResponsibleInitials' title='" + MyObj.Name + "' >" + MyObj.Initials + "</div>";
                } else {
                    return "<img class='ResponsibleImage' src='" + MyObj.PicPath + "' title='" + MyObj.Name + "'/>";
                }
            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.GetImageHTML");
            }
        },
        MyObj.GetResponsibleTable = function (IncludeOpenTasks, ShowHoverColor) {
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                var TableHTML = "<table class='ResponsibleTable'><tbody id='ResponsibleTable" + MyObj.ID + "' class ='ResponsibleTableBody'><tr>"
                if (IncludeOpenTasks == true) {
                    TableHTML = TableHTML + "<tr class ='ResponsibleExtraDropSpace' ><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td></tr>";
                }
                if (ShowHoverColor === true) {
                    TableHTML = TableHTML + "<tr class='ResponsibleRow'><td class='ResponsibleImageCell' style='width:20%'>" + MyObj.GetImageHTML() + "</td>";
                }
                else {
                    TableHTML = TableHTML + "<tr><td class='ResponsibleImageCell'>" + MyObj.GetImageHTML() + "</td>";
                }
                TableHTML = TableHTML + "<td class='ResponsibleNameCell' style='width:60%'>" + MyObj.Name + "</td>";
                if (IncludeOpenTasks == true) {
                    TableHTML = TableHTML + "<td class='ResponsibleOpenTaskCount' style='width:20%'>" + MyObj.GetOpenTasksCount() + "</td></tr>";
                    TableHTML = TableHTML + "<tr class ='ResponsibleExtraDropSpace' ><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td></tr>";
                } else {
                    TableHTML = TableHTML + "</tr>"
                }
                TableHTML = TableHTML + "</tbody></table>"
                return TableHTML;
            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.GetResponsibleTable");
            }
        },
        MyObj.GetOpenTasksCount = function () {
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                var TaskCount = 0, CurrTask = {};
                for (var i = 0; i < KTMCache.Tasks.length; i++) {
                    CurrTask = KTMCache.Tasks[i];
                    for (var x in CurrTask._Responsibles) {
                        if (CurrTask._Responsibles[x].ID == MyObj.ID) { // Tasks assigned to current responsible  ....
                            if (CurrTask.IsOpen()) { // ... that are open!
                                TaskCount++;
                            }
                        }
                    }
                }
                return TaskCount;
            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.GetOpenTasksCount");
            }
        }
    MyObj.FromSaved = function (SavedObject) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            MyObj.ID = SavedObject.ID;
            MyObj.Name = SavedObject.Name;
            MyObj.Color = SavedObject.Color;
            MyObj.NonKTMSPUser = SavedObject.NonKTMSPUser;
            MyObj.PicPath = SavedObject.PicPath;
            MyObj.setInitials();
            MyObj.Hide = SavedObject.Hide;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMResponsible.FromSaved");
        }
    }
    return MyObj;
}
function KTMLane(ID, Name, Sequence) {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    MyObj.Sequence = 0;
    MyObj.WIP = 0;
    MyObj.getSequence = function () {
        return MyObj.Sequence;
    };
    MyObj.FromSaved = function (SavedObject) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            MyObj.ID = SavedObject.ID;
            MyObj.Name = SavedObject.Name;
            MyObj.Sequence = SavedObject.Sequence;
            MyObj.WIP = SavedObject.WIP;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMLane.FromSaved");
        }
    }
    return MyObj;
}
function KTMPhase() {
    var MyObj = {
    };
    MyObj.ID = 0;
    MyObj.Name = "";
    MyObj.Hide = false;
    MyObj.Sequence = 0;
    MyObj.getSequence = function () {
        return MyObj.Sequence;
    };

    MyObj.PhaseDeletein = false;
    MyObj.WIP = 0;
    MyObj.NumberOfTaskColumns = 1;

    MyObj.FromSaved = function (SavedObject) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            MyObj.ID = SavedObject.ID;
            MyObj.Name = SavedObject.Name;
            MyObj.Hide = SavedObject.Hide;
            MyObj.Sequence = SavedObject.Sequence;
            MyObj.PhaseDeletein = SavedObject.PhaseDeletein;
            MyObj.WIP = SavedObject.WIP;
            MyObj.NumberOfTaskColumns = SavedObject.NumberOfTaskColumns;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMPhase.FromSaved");
        }
    }
    return MyObj;
}


function KTMTask() {
    if (KTMGlobalVariable.Template == null) {
        KTMGlobalVariable.Template = $("#Task1"); //document.getElementById("Task1"); // 
    }
    this.setCheckNumbers = function () {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            if (KTMSharedSettings.IsCheckList === true) {
                kAdvancedFields.checkList.fromString(this._CheckList);
                var checkListCount = "";
                if (kAdvancedFields.checkList.CheckList.length > 0) {
                    checkListCount = kAdvancedFields.checkList.getCheckedCount() + "/" + kAdvancedFields.checkList.CheckList.length;
                }
                this._LiObject.find(".kTaskCheckCounter")[0].innerText = checkListCount;
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setCheckNumbers");
        }
    },
        this.ID = 0; //Unique identifier for the task
    this.id = "";

    this.setID = function (NewID) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this.ID = this.id = NewID;
            this.htmlID = "Task" + NewID;
            this._LiObject.first(".InnerKTMFrame").attr("id", this.htmlID);
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setID");
        }
    },
        this.getID = function () {
            //replace "Task" string from ID
            if (K.kalmstromShared.kErrorMode === true) {
                return false;
            }
            try {
                var TaskID = 0;
                if (K.kalmstromShared.kNotEmptyString(this.ID)) {
                    TaskID = this.ID.toString().replace("Task", "");
                    TaskID = parseInt(TaskID) || 0;
                }
                return TaskID;

            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getID");
            }
        },

        this.htmlID = "";
    this.gethtmlID = function () {
        var htmlID = "0";
        if (K.kalmstromShared.kNotNullOrUndefined(this.ID)) {
            htmlID = this.htmlID;
        }
        return htmlID;
    }

    this.text = "";//Max 255 chars - used for the task subject
    this.setSubject = function (NewSubject) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this.text = NewSubject;
            if (this._LiObject.find(".TS").length > 0) {
                this._LiObject.find(".TS")[0].innerText = K.kalmstromShared.TruncateText(NewSubject, 35);
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setSubject"); }
    }
    this.getSubject = function () {
        return this.text;
    }

    this._Importance = 2; //1 High, 2 Normal, 3 Low
    this.setImportance = function (NewImportance) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._Importance = Number(NewImportance);
            var impTD = this._LiObject.find(".TDImportance");
            switch (this._Importance) {
                case 3:
                    impTD[0].innerHTML = "&darr;";
                    impTD.removeClass("PrioIconHigh");
                    impTD.addClass("PrioIconLow");
                    break;
                case 1:
                    impTD[0].innerText = "!";
                    impTD.removeClass("PrioIconLow");
                    impTD.addClass("PrioIconHigh");
                    break;
                default:
                    impTD[0].innerText = "";
                    impTD.removeClass("PrioIconLow");
                    impTD.removeClass("PrioIconHigh");
                    break;
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setImportance"); }
    }
    this.getImportance = function () {
        return this._Importance;
    }

    this._Body = "";//Long text
    this.setBody = function (NewBody) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._Body = NewBody;
            this._LiObject.find(".TS").attr("title", K.kalmstromShared.strip(this._Body)); // remove html from the body

        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setBody");
        }
    }
    this.getBody = function () {
        if (K.kalmstromShared.kNotEmptyString(this._Body)) { return this._Body; }
        else {
            return "";
        }
    }


    //Responsible
    this.setResponsible = function (NewResponsible) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (K.kalmstromShared.kNotNullOrUndefined(NewResponsible)) {
                this._Responsibles = [];
                if ($.isArray(NewResponsible) == false) {
                    var res = K.kalmstromShared.GetObjectByName(NewResponsible.Name, KTMSharedSettings.Responsibles);
                    //if (K.kalmstromShared.kNotNullOrUndefined(res)) {
                    this._Responsibles.push(res);
                    //}
                }
                else {
                    if (KTMSharedSettings.IsSingleResponsible === true) {
                        this._Responsibles.push(NewResponsible[0]);
                    }
                    else {
                        NewResponsible = $.unique(NewResponsible); // removes duplicate from the array
                        for (var x in NewResponsible) {
                            if (K.kalmstromShared.kNotNullOrUndefined(NewResponsible[x])) {
                                var res = K.kalmstromShared.GetObjectByName(NewResponsible[x].Name, KTMSharedSettings.Responsibles);
                                //if (K.kalmstromShared.kNotNullOrUndefined(res)) {
                                this._Responsibles.push(res);
                                //}                                
                            }
                        }
                    }
                }
                if (this._Responsibles.length == 1) {
                    this._LiObject.find(".TResponsible")[0].innerHTML = this._Responsibles[0].GetImageHTML();
                }
                else if (this._Responsibles.length > 1) {
                    this._LiObject.find(".TResponsible")[0].innerHTML = "<img class='ResponsibleImage' src='" + "../img/multiResponsibles.png" + "' title='" + this.getResponsibleName(false, true) + "'/>";
                }
                this._FirstResponsibleName = this.getResponsibleName(true);
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setResponsible");
        }
    }
    this.getReponsible = function (GetFirstIfNOtExists) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var res = [];
            if (KTMSharedSettings.IsSingleResponsible === true) {
                if (this._Responsibles.length > 0) {
                    var Responsible = K.kalmstromShared.GetObjectByName(this._Responsibles[0].Name, KTMSharedSettings.Responsibles);
                    if (K.kalmstromShared.kNotNullOrUndefined(Responsible)) {
                        res.push(Responsible);
                    }
                }
            }
            else {
                for (var x in this._Responsibles) {
                    var cRes = this._Responsibles[x];
                    var Responsible = K.kalmstromShared.GetObjectByName(cRes.Name, KTMSharedSettings.Responsibles);
                    if (K.kalmstromShared.kNotNullOrUndefined(Responsible)) {
                        res.push(Responsible);
                    }
                }
            }
            this._Responsibles = res;
            return this._Responsibles;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setResponsible");
        }
    }
    this._Responsibles = [];
    this._FirstResponsibleName = "";
    this.getResponsibleImage = function (OnlyFirst) {
        var PicPath = "NA";
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (this._Responsibles.length > 0) {
                if (OnlyFirst === true || this._Responsibles.length == 1) {
                    PicPath = this._Responsibles[0].GetImageHTML();
                }
                else {
                    PicPath = "<img class='ResponsibleImage' src='" + "../img/multiResponsibles.png" + "' title='" + this.getResponsibleName(false, true) + "'/>";
                }
            }

        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.PicPath");
        }
        return PicPath;
    };
    this.getResponsibleName = function (OnlyFirst, RemoveSaprator) {
        var ResponsibleName = "NA";
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (this._Responsibles.length > 0) {
                if (OnlyFirst === true) {
                    ResponsibleName = this._Responsibles[0].Name;
                }
                else {
                    for (var X in this._Responsibles) {
                        var Responsible = this._Responsibles[X];
                        if (X == 0) {
                            ResponsibleName = Responsible.Name;
                        }
                        else {
                            ResponsibleName = ResponsibleName + "~;" + Responsible.Name;
                        }
                    }
                }
            }
            if (RemoveSaprator === true) {
                ResponsibleName = K.kalmstromShared.replaceAll("~;", "; ", ResponsibleName);
            }

        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getResponsibleName");
        }

        return ResponsibleName;
    };
    this._ExtraValue = "";
    this.setExtraValue = function (NewValue) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (KTMSharedSettings.ExtraValues.length > 0) {
                this._ExtraValue = NewValue;
                this._LiObject.find(".TCategory2")[0].innerText = this._ExtraValue;
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setExtraValue");
        }
    };
    this.getExtraValue = function (NewValue) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._ExtraValue;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getExtraValue");
        }
    };
    this.type = "";//Class Name eg TColor1
    this.setColor = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var NewColorClass = "TColor";
            if (KTMSharedSettings.ColorAssociation === "Project") {
                if (K.kalmstromShared.kNotNullOrUndefined(this._Category1)) {
                    var Project = K.kalmstromShared.GetObjectByName(this._Category1, KTMSharedSettings.Projects);
                    if (K.kalmstromShared.kNotNullOrUndefined(Project)) {
                        NewColorClass += Project.ID;
                    }
                }
            } else {
                var Respnsible = this.getReponsible(true)[0];
                if (K.kalmstromShared.kNotNullOrUndefined(Respnsible)) {
                    NewColorClass += Respnsible.ID;
                }
            }
            //remove all other classes except "TColor" for example TColor1, TColor2            
            this._LiObject.find(".TColor").attr('class', 'TColor');
            this.type = NewColorClass;
            this._LiObject.find(".TColor").addClass(this.type);
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setColor");
        }
    };
    this._Category1 = "";// By default Project
    this.setCategory1 = function (NewCategory1) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._Category1 = NewCategory1;
            this._LiObject.find(".TCategory1")[0].innerText = this._Category1;
            this.setColor(); //Need to update the color when category changes
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setCategory1");
        }
    };
    this.getCategory1 = function () {
        return this._Category1;
    };
    this._LiObject = KTMGlobalVariable.Template.clone(); //JQuery representation of the current task
    this._PercentDone = 0;// 0 to 100
    this.setDone = function (NewPerc) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            // A number between 0 and 100
            //Convert to whole number
            NewPerc = Math.floor(NewPerc);
            this._PercentDone = NewPerc;
            var Todo = this._LiObject.find(".ms-ProgressIndicator-itemProgress");
            Todo.css({
                'width': ((this._PercentDone) + '%')
            });
            if (this._PercentDone > 0) {
                this._LiObject.find(".ms-ProgressIndicator-progressTrack").css({
                    'width': '100%'
                });
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setDone");
        }
    }
    this.getDone = function () {
        return this._PercentDone;
    }

    this._Sequence = 1;
    this.getSequence = function () {
        if (this._Sequence == 0) {
            this._Sequence = 1;
        }
        return parseFloat(this._Sequence);
    }
    this.setSequence = function (NewSequence) {
        if (NewSequence == 0) {
            NewSequence = 1;
        }
        this._Sequence = parseFloat(NewSequence);
        //if (K.kalmstromShared.kDebugMode == true) {
        //  this._LiObject.find(".ms-ProgressIndicator-progressBar")[0].innerText = this._Sequence;        
        //}
    }

    this._IsHidden = false;//Currently being used to hide filtered tasks.
    this.FromSaved = function (SavedObject) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this.setID(SavedObject.ID);
            this.setSubject(SavedObject.text);
            this.setCheckList();
            this.setImportance(SavedObject._Importance);
            this.setBody(SavedObject._Body);
            //var Responsible = K.kalmstromShared.GetObjectByName(SavedObject._ResponsibleName, KTMSharedSettings.Responsibles, true, KTMResponsible);
            var Responsibles = [];
            if (SavedObject._Responsibles.length > 0) {
                for (var x in SavedObject._Responsibles) {
                    var Responsible = K.kalmstromShared.GetObjectByName(SavedObject._Responsibles[x].Name, KTMSharedSettings.Responsibles);
                    if (K.kalmstromShared.kNotNullOrUndefined(Responsible)) {
                        Responsibles.push(Responsible);
                    }
                }
            }
            this.setResponsible(Responsibles);
            this.setCategory1(SavedObject._Category1);
            this.setDone(SavedObject._PercentDone);
            if (K.kalmstromShared.kNotNullOrUndefined(SavedObject.start_date) && !($.isEmptyObject(SavedObject.start_date))) {
                this.setStartDate(moment(SavedObject.start_date));
            }
            if (K.kalmstromShared.kNotNullOrUndefined(SavedObject.end_date) && !($.isEmptyObject(SavedObject.end_date))) {
                this.setDueDate(moment(SavedObject.end_date));
            }


            this.setExtraValue(SavedObject._ExtraValue);

            this.setCreatedDate(moment(SavedObject._CreatedDate));

            if (K.kalmstromShared.kNotNullOrUndefined(SavedObject._LastModifiedDate)) {
                this.setLastModified(moment(SavedObject._LastModifiedDate));
            }

            this.setCreatedBy(SavedObject._CreatedBy);
            this.setModifiedBy(SavedObject._ModifiedBy);
            //Once both end and start dates are set - we do the formatting again:
            //this.formatOverDue(); it was here and moved to after set phase

            this.setLane(SavedObject.LaneID);
            this.setPhase(SavedObject.PhaseID);
            this.formatOverDue();
            this.ReadOnly = SavedObject.ReadOnly;
            if (K.kalmstromShared.kNotNullOrUndefined(SavedObject.UnRead)) {
                this.UnRead = SavedObject.UnRead;
            }
            this.formatUnRead();
            this._IsHidden = false;//This variable is used for search/filter purpose.//SavedObject._IsHidden;
            this.setSequence(SavedObject._Sequence);
            this.setColor(SavedObject.type);
            this.setCheckList(SavedObject._CheckList);
            this.setTimeList(SavedObject._TimeList);
            this.setCheckNumbers();
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.FromSaved");
        }
    }

    this.LaneID = 0;
    this.setLane = function (NewLane) {
        this.LaneID = NewLane;
    }


    this.PhaseID = 1;
    this.setPhase = function (NewPhase) {
        if (NewPhase !== 0) {
            this.PhaseID = NewPhase.toString();
        }
    },
        this.IsOpen = function () {
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                if (this.PhaseID != KTMSharedSettings.GetPhaseDeleteToObj().ID) {
                    if (this.getDone() < 100) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            } catch (e) {
                K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.IsOpen");
            }
        },

        this.ReadOnly = false;
    this.UnRead = false;
    //Dates - should be stored as moment object
    this.end_date = {};
    this.start_date = {};
    this._CreatedDate = {};
    this._LastModifiedDate = {};


    this.setCreatedDate = function (NewDate) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if ((typeof NewDate) === "string") {
                this._CreatedDate = moment(NewDate)._d;
            } else {
                this._CreatedDate = NewDate;
            }
            this._CreatedDate = kKTM.FilterDate(this._CreatedDate);
            this.CreatedDateISO = this._CreatedDate.format("YYYY-MM-DD");
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setCreatedDate");
        }
    }
    this.getCreatedDate = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._CreatedDate.clone();
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getCreatedDate");
        }
    }
    this._CreatedBy = "";
    this.setCreatedBy = function (Name) {
        if (K.kalmstromShared.kErrorMode === true) {
            return false;
        }
        try {
            this._CreatedBy = Name;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setCreatedBy");
        }
    }
    this.getCreatedBy = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._CreatedBy;
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getCreatedBy");
        }
    }
    this.StartDateISO = ""; //To avoid all problems with time formats when saving to json

    this.EndDateISO = ""; //End date = due date
    this.setDueDate = function (NewDate) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (K.kalmstromShared.kNotNullOrUndefined(NewDate)) {
                var DueDate = NewDate;
                if ((typeof NewDate) === "string") {
                    DueDate = moment(NewDate)._d;//K.kalmstromShared.DatePartOfDateTime(NewDate);
                } else {
                    DueDate = NewDate;
                }
                //set 23:59:59 so that it works fine in scheduler(month view)
                if (DueDate.hour() === 0 && DueDate.minutes() === 0 && DueDate.seconds() === 0) {
                    DueDate.hour(23);
                    DueDate.minutes(59);
                    DueDate.seconds(59);
                }
                this.end_date = DueDate;
                this.EndDateISO = this.end_date.format("YYYY-MM-DD");
                this.formatOverDue();
                if (KTMSharedSettings.ExtraValues.length == 0) {
                    if (moment(this.end_date).isValid()) {
                        DueDate = "";
                        if (KTMDateFormat == "") {
                            DueDate = this.end_date.format("L");
                        } else {
                            DueDate = this.end_date.format(KTMDateFormat);
                        }
                        this._LiObject.find(".TCategory2")[0].innerText = DueDate;
                    }
                }
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setDueDate"); }
    };
    this.getDueDate = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if ($.isEmptyObject(this.end_date)) {
                if (!$.isEmptyObject(this.start_date)) {
                    this.setDueDate(KTMSharedSettings.GetDefaultDueDateTime(this.start_date)); //Always set the Due date to 24 hours after if the start date is defined.,Jayant- get GetDefaultDueDateTime has code to add 24hrs in start date
                }
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getDueDate");
        }
        return this.end_date;
    };
    this.TimeUntilDue = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {

            return moment.duration(this.getDueDate().diff(Date.now()));
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.TimeUntilDue");
        }
    };
    this.IsNotDated = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //if ($.isEmptyObject(this.end_date) && $.isEmptyObject(this.start_date)) {
            if ($.isEmptyObject(this.start_date)) {
                return true;
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.IsNotDated");
        }
        return false;
    };
    this.getEndDate = function () {
        var EndTime = moment();
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (this.IsClosed()) {
                EndTime = this.getLastModified();
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getEndDate");
        }
        return EndTime;
    };
    this.formatOverDue = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var PhaseDeletein = false;
            //check PhaseDeletein - for completed phase, overdue tasks will not be shown in red
            if (this.PhaseID > 0) {
                var phase = K.kalmstromShared.GetObjectByID(this.PhaseID, KTMSharedSettings.Phases);
                if (K.kalmstromShared.kNotNullOrUndefined(phase)) {
                    PhaseDeletein = phase.PhaseDeletein;
                }
            }
            if (this.IsOverDue() == true && PhaseDeletein == false) {
                this._LiObject.find(".InnerKTMFrame").addClass("overdueTask");
                this._LiObject.find(".TCategory2").addClass("overdueCategory2");
            }
            else {
                this._LiObject.find(".InnerKTMFrame").removeClass("overdueTask");
                this._LiObject.find(".TCategory2").removeClass("overdueCategory2");

            }

            if (this.IsOverDue() == true && PhaseDeletein == false && KTMSharedSettings.ExtraValues.length > 0) {
                this._LiObject.find(".InnerKTMFrame").addClass("overdueTask");
                this._LiObject.find(".TCategory2").removeClass("overdueCategory2");
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.formatOverDue"); }
    }
    this.formatUnRead = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (this.UnRead === true) {
                this._LiObject.find(".TS").addClass("kUnRead");
            }
            else {
                this._LiObject.find(".TS").removeClass("kUnRead");
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.formatUnRead"); }
    }


    this.start_date = {};
    this.StartDateISO = ""; //To avoid all problems with time formats when saving to json
    this.getStartDate = function () {
        return this.start_date;
    }
    this.setStartDate = function (NewDate) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (K.kalmstromShared.kNotNullOrUndefined(NewDate)) {
                this.start_date = NewDate.clone();
                this.StartDateISO = this.start_date.format("YYYY-MM-DD");
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setStartDate"); }
    }

    this._LastModifiedDate = {};
    this.LastModifiedISO = "";
    this.setLastModified = function (NewMoment) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (moment.isMoment(NewMoment)) {
                this._LastModifiedDate = NewMoment.clone();
                this.LastModifiedISO = NewMoment.format("YYYY-MM-DD");
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setLastModified"); }
    };
    this.getLastModified = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._LastModifiedDate.clone();
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getLastModified"); }
    }
    this.IsClosed = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var ClosedID = KTMSharedSettings.GetPhaseDeleteToObj().ID;
            return this.PhaseID == ClosedID;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.IsClosed"); }
    }
    this.DailyHoursLog = [];
    this.OpenHours = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //console.log("Counting time for " + this.getSubject());
            var Openhrs = Number(this.OpenTimeInMinutes() / 60).toFixed(2); //Hours since this task was created
            var DecimalSeparator = K.kalmstromShared.NumberandDateFormat.decimalseparator;
            Openhrs = Openhrs.toString().replace(".", DecimalSeparator);
            return Openhrs;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.OpenHours"); }
    };
    this.OpenTimeInMinutes = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var MinutesOpen = 0;
            if (!this.IsNotDated()) {
                var StartTime = this.getStartDate();
                var EndTime = this.getEndDate();
                var CurrLog = {};
                this.DailyHoursLog = [];
                var DaysOpen = Math.round(Number(moment.duration(EndTime.diff(StartTime.clone())).asDays()));
                for (var i = 0; i <= DaysOpen; i++) {
                    CurrLog = this.OpenTimeInMinutesDay(StartTime.clone().add(i, "days").format("YYYY-MM-DD"));
                    this.DailyHoursLog.push(CurrLog);
                    if (CurrLog.Minutes < 0) {
                        //alert(CurrLog.Minutes);
                        console.log(CurrLog.Minutes);
                    }
                }
                for (var i = 0; i < this.DailyHoursLog.length; i++) {
                    MinutesOpen += this.DailyHoursLog[i].Minutes;
                }
            }
            return MinutesOpen;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.OpenTime"); }
    },
        this.MinutesIntoDay = function (MomentDate) { //Counts the number of minutes into the day of a moment time
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                return MomentDate.hours() * 60 + MomentDate.minutes();
            } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.MinutesIntoDay"); }
        },
        this.OpenTimeInMinutesDay = function (ISODate) { //Counts the number of minutes this ticket was open during a specific day
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                var CurrLog = new DayLog(ISODate, 0, "");
                var StartDateISO = this.getStartDate().format("YYYY-MM-DD");
                var EndDateISO = this.getEndDate().format("YYYY-MM-DD");
                if (ISODate >= StartDateISO && ISODate <= EndDateISO) {
                    //The task was open this day
                    var CurrentWeekday = moment(ISODate).isoWeekday();
                    var StartDay = KTMSharedSettings.Hours.StartDay;
                    var EndDay = KTMSharedSettings.Hours.EndDay;

                    var IsServiceDay = (CurrentWeekday >= StartDay && CurrentWeekday <= EndDay) ? true : false;
                    if (StartDay > EndDay) {
                        //For the case when week start from the Friday and end on Wednesday
                        IsServiceDay = (CurrentWeekday >= StartDay || CurrentWeekday <= EndDay) ? true : false;
                    }
                    if (IsServiceDay) {
                        //This is a day in which we provide service
                        if (ISODate > StartDateISO) {
                            //This task was created earlier than the current date
                            if (ISODate < EndDay) {
                                CurrLog.Comment += "Open full day";
                                CurrLog.Minutes = KTMSharedSettings.Hours.FullWorkDayMinutes;
                                return CurrLog;
                            }
                        }
                        //This task was only open part of the current date
                        //Thus this day is the first day, the last day or both
                        var CurrTaskOpenMinute = 0, CurrTaskCloseMinute = 0;
                        if (ISODate == StartDateISO) {//First day
                            CurrTaskOpenMinute = this._VerifyMinute(this.MinutesIntoDay(this.getStartDate()));
                            CurrLog.Comment += "First day, start counting at creation time:  " + CurrTaskOpenMinute + "<br>";
                        } else {

                            CurrTaskOpenMinute = (KTMSharedSettings.Hours.ServiceHours) ? KTMSharedSettings.Hours.ServiceHoursStartMinutes : 0;
                            CurrLog.Comment += "Not first, start counting at service hours time:  " + CurrTaskOpenMinute + "<br>";
                        }

                        if (ISODate == EndDateISO) {//Last day
                            CurrTaskCloseMinute = this._VerifyMinute(this.MinutesIntoDay(this.getEndDate()));
                            CurrLog.Comment += "Last day, stop counting at last modified time: " + CurrTaskCloseMinute + "<br>";
                        } else {
                            CurrTaskCloseMinute = (KTMSharedSettings.Hours.ServiceHours) ? KTMSharedSettings.Hours.ServiceHoursEndMinutes : 1440;
                            CurrLog.Comment += "Not last day, stop counting at service hours end: " + CurrTaskCloseMinute + "<br>";
                        }

                        CurrLog.Minutes = CurrTaskCloseMinute - CurrTaskOpenMinute;
                        if (KTMSharedSettings.Hours.LunchHours) {
                            if (CurrTaskOpenMinute < KTMSharedSettings.Hours.ServiceHoursLunchStartMinutes && CurrTaskCloseMinute > KTMSharedSettings.Hours.ServiceHoursLunchEndMinutes) {
                                CurrLog.Comment += "Lunch removed";
                                //Opened before lunch and closed after lunch
                                CurrLog.Minutes = CurrLog.Minutes - KTMSharedSettings.Hours.ServiceHoursLunchDuration;
                            }
                        }
                    } else {
                        CurrLog.Comment += "Not a service day";
                    }

                } else {
                    CurrLog.Comment += "Task was not open this day";
                }
                return CurrLog;
            } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.OpenTime"); }
        },
        this._VerifyMinute = function (MinuteToCheck) {
            //Checks if a minute value occurs outside of service/lunch hours and returns the endpoint of the period instead if so
            if (K.kalmstromShared.kErrorMode === true) { return false; }
            try {
                if (KTMSharedSettings.Hours.ServiceHours) {
                    //Not 24 hour services
                    if (MinuteToCheck < KTMSharedSettings.Hours.ServiceHoursStartMinutes) {
                        //Before of service hours
                        return KTMSharedSettings.Hours.ServiceHoursStartMinutes;
                    }
                    if (MinuteToCheck > KTMSharedSettings.Hours.ServiceHoursEndMinutes) {
                        //After service hours
                        return KTMSharedSettings.Hours.ServiceHoursEndMinutes;
                    }
                }
                if (KTMSharedSettings.Hours.LunchHours) {
                    //Closed for lunch
                    if (MinuteToCheck > KTMSharedSettings.Hours.ServiceHoursLunchStartMinutes && MinuteToCheck < KTMSharedSettings.Hours.ServiceHoursLunchEndMinutes) {
                        //Task was created during lunch hours
                        return KTMSharedSettings.Hours.ServiceHoursLunchEndMinutes;
                    }
                }
                return MinuteToCheck;
            } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask._VerifyMinute"); }

        }
    this._CreatedBy = "";
    this.setCreatedBy = function (Name) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._CreatedBy = Name;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setCreatedBy"); }
    }
    this.getCreatedBy = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._CreatedBy;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getCreatedBy"); }
    };
    this._ModifiedBy = "";
    this.setModifiedBy = function (Name) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._ModifiedBy = Name;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setModifiedBy"); }
    }
    this.getModifiedBy = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._ModifiedBy;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getModifiedBy"); }
    };
    this.IsOverDue = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var defaultJSDate = moment("1970-01-02 00:00:00", "YYYY-MM-DD H:i:s");
            if (this.end_date.isSame(defaultJSDate) || this.end_date.isBefore(defaultJSDate)) {
                return false;
            }
            if (this.end_date.format("YYYY-MM-DD") < moment().format("YYYY-MM-DD")) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    };
    this.setDefaultValues = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var currDateTime = new moment().clone();
            var StartDateTime = KTMSharedSettings.GetDefaultStartDateTime();
            if (StartDateTime != "") {
                this.setStartDate(StartDateTime);
            }

            var dueDate = KTMSharedSettings.GetDefaultDueDateTime(currDateTime);
            if (K.kalmstromShared.kNotNullOrUndefined(dueDate)) {
                this.setDueDate(dueDate);
            } else {
                if (KTMSharedSettings.DefaultValues.DueDate !== LNGEMPTY()) {
                    this.setDueDate(new moment().add(86400000 * 2)); //comment by Peter - By default should be completed day after tomorrow. Comment by Jayant= set only when user do not want to set emptry from settings
                }
            }

            var Importance = KTMSharedSettings.GetDefaultImportance();
            this.setImportance(Importance);

            if (this.PhaseID == 0) {
                for (var i = 0; i < KTMSharedSettings.Phases.length; i++) {
                    var CurrPhase = KTMSharedSettings.Phases[i];
                    if (CurrPhase.Hide == false) {
                        this.setPhase(CurrPhase.ID);
                        break;
                    }
                }
            }
            if (this.LaneID == 0) {
                if (KTMSharedSettings.Lanes.length > 0) {
                    this.setLane(KTMSharedSettings.Lanes[0].ID); //Always add new items to the first lane
                }
            }

            var UnAssigned = K.kalmstromShared.GetObjectByName(KTMSharedSettings.DefaultValues.Responsible, KTMSharedSettings.Responsibles);
            if (K.kalmstromShared.kNotEmptyString(UnAssigned)) {
                this.setResponsible(UnAssigned);
            }
            else {
                this._Responsibles = [];
            }


            if (KTMSharedSettings.Projects.length > 0) {
                var ProjectName = KTMSharedSettings.GetDefaultProject();
                this.setCategory1(ProjectName);
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setDefaultValues"); }
    }
    this.ContainstText = function (TextToFind) { //Returns true or false if the task contains the text. Case insensitive
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            var FullBody = (this._Body + " " + this.text + " " + this._Category1 + " " + this._ExtraValue).toUpperCase();
            var Pos = FullBody.indexOf(TextToFind.toUpperCase());
            if (Pos == -1) {
                return false;
            } else {
                return true;
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.ContainstText"); }
    }
    this.AddToBoard = function (Sorting, AddLast) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            switch (KTMGlobalVariable.CurrentView.Name) {
                case "Kanban":
                    var PhaseDiv = this.GetPhaseDiv();
                    if (Sorting === true) {
                        //Re-sort all the tasks 
                        KTMCache.Tasks.sort(kKTM.SortyBySequenceAsc);
                        for (var i = 0; i < KTMCache.Tasks.length; i++) {
                            if (KTMCache.Tasks[i].PhaseID == this.PhaseID && KTMCache.Tasks[i].LaneID == this.LaneID) {
                                KTMCache.Tasks[i].AddToBoard();
                            }
                        }
                    } else {
                        if (kKTM.IsTaskProjectHidden(this) == false) {
                            if (AddLast == true) {
                                PhaseDiv.append(this._LiObject);
                            } else {
                                PhaseDiv.prepend(this._LiObject);
                            }
                            if (this._IsHidden === false && kKTM.IsTaskProjectHidden(this) == false) {
                                this.setVisible();
                                this.setReadOnly();
                            }
                        } else {
                            this._LiObject.hide();
                        }

                    }
                    break;
                case LNG7HABITS():
                    KTM7Habits.AddTask(this);
                    break;
                default:
                    break;
            }
            if (KTMGlobalVariable.CurrentView.Scheduler == true) {
                KTMCalendar.AddNewTask(this);
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.AddToBoard"); }
    }
    this.setReadOnly = function (NewValue) { //Gets the Phase for the current task 
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if (K.kalmstromShared.kNotNullOrUndefined(NewValue)) {
                this.ReadOnly = NewValue;
            }
            if (this.ReadOnly) {
                //disable task drag-drop
                this._LiObject.addClass('unsortable');
            } else {
                this._LiObject.removeClass('unsortable');
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setReadOnly"); }
    }
    this.GetPhaseDiv = function () { //Gets the Phase for the current task 
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //Gets the phase ul which is the parent of the task
            if (KTMSharedSettings.Lanes.length === 0) {
                return $("#Ph" + this.PhaseID);
            } else {
                return $("#Lane" + this.LaneID + " #Ph" + this.PhaseID);
            }
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.GetPhaseDiv"); }
    }
    this.getNeighbour = function (Up) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            //Direction 1 = previous/up
            //Direction 0 = next /down
            //Find the previous task LI object in the current phase

            var firstvalue = this._LiObject;
            var checkvisible_li = true;
            if (Up == true) {
                // var otherLi = this._LiObject.prev();
                while (checkvisible_li == true) {
                    var otherLi = this._LiObject.prev();
                    this._LiObject = otherLi;
                    if (otherLi[0] != null) {
                        var li_id = otherLi[0].id;
                    }
                    else {
                        otherLi = firstvalue;
                        this._LiObject = firstvalue;
                        checkvisible_li = false;
                        break;
                    }

                    if ($('#' + li_id).css('display') == 'none') {

                        checkvisible_li = true;

                    }
                    else {
                        this._LiObject = firstvalue;
                        checkvisible_li = false;
                    }
                }
            }

            else {
                // var otherLi = this._LiObject.next();
                while (checkvisible_li == true) {
                    var otherLi = this._LiObject.next();
                    this._LiObject = otherLi;
                    if (otherLi[0] != null) {
                        var li_id = otherLi[0].id;
                    }
                    else {
                        otherLi = firstvalue;
                        this._LiObject = firstvalue;
                        checkvisible_li = false;
                        break;
                    }

                    if ($('#' + li_id).css('display') == 'none') {

                        checkvisible_li = true;

                    }
                    else {
                        this._LiObject = firstvalue;
                        checkvisible_li = false;

                    }
                }
            }
            if (otherLi.length == 0) {
                return null;
            } else {
                return GetTaskByhtmlID(otherLi[0].id);
            }
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getNeighbour");
        }
    };
    this.setSelected = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            if ($(".selectedTask").length > 0) {
                $(".selectedTask").removeClass("selectedTask");//Only one can be selected
            }
            if (K.kalmstromShared.kNotNullOrUndefined(this._LiObject)) {
                this._LiObject.find(".InnerKTMFrame").addClass("selectedTask");
                CurrSelectedTask = this;
            }
            //console.log("Selected " + this.ID + " " + this.getSubject() + " " + this.getSequence());
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setSelected");
        }
    }
    this.setHidden = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._IsHidden = true;
            this._LiObject.hide(400);
            this.getEventObject().hide(400);
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setHidden"); }
    }
    this.getEventObject = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return $("#CalWrapper div[event_id='" + this.ID + "']");
        } catch (e) {
            K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.getEventObject");
        }
    }
    this.setVisible = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._IsHidden = false;

            var InnerObject = this._LiObject.find(".InnerKTMFrame");
            //Remove previous event handlers to prevent double-firing in IE
            InnerObject.off("click");
            InnerObject.off("dblclick");
            InnerObject.off("contextmenu");
            //Add them again
            InnerObject.click(kKTM._TaskClick);
            InnerObject.dblclick(kKTM._TaskDoubleClick);
            InnerObject.on("contextmenu", kKTM._RightClick);

            this._LiObject.show(400);
            this.getEventObject().show(400);
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.setVisible"); }
    }
    this._CheckList = "";
    this.getCheckList = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._CheckList;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.CheckList.GetCheckList"); }
    }
    this.setCheckList = function (CheckList) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._CheckList = CheckList;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.CheckList.setCheckList"); }
    }
    this._TimeList = "";
    this.getTimeList = function () {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            return this._TimeList;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.TimeReporting.getTimeList"); }
    }
    this.setTimeList = function (TimeList) {
        if (K.kalmstromShared.kErrorMode === true) { return false; }
        try {
            this._TimeList = TimeList;
        } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "KTMTask.TimeReporting.setTimeList"); }
    }


}


function KTMChange(ChangeType, Task) {
    var MyObj = {};
    MyObj.ChangeType = ChangeType; //New,Change,Open,Remove,MissingPermissions
    MyObj.KTMTask = Task;
    return MyObj;
}

function KTMExcelReportTask() {
    var MyObj = {};
    MyObj.ID = 0;
    MyObj.Subject = "";
    MyObj.StartDate = new Date(4501, 1, 1); // c# default date
    MyObj.DueDate = new Date(4501, 1, 1); // c# default date
    MyObj.CreatedDate = new Date(4501, 1, 1); // c# default date
    MyObj.TaskStatus = "";
    MyObj.Priority = "";
    MyObj.CompletedInPercent = 0;
    MyObj.Createdby = "";
    MyObj.PhaseCaption = "";
    MyObj.ProjectName = "";
    MyObj.LaneCaption = "";
    MyObj.ExtraField = "";
    MyObj.ResponsibleName = "";
    MyObj.TimeLogging = [];
    MyObj.TotalTime = 0;
    MyObj.OpenHrs = 0;
    return MyObj;
}
//**********************************************************

function GetTaskByID(TaskID) {
    if (K.kalmstromShared.kErrorMode === true) { return false; }
    var CurrTask = new KTMTask(), CurrPhase = new KTMPhase(), intCounter = 0, i = 0;
    try {
        for (i; i < KTMCache.Tasks.length; i += 1) {
            CurrTask = KTMCache.Tasks[i];
            if (CurrTask.ID == TaskID) {
                return CurrTask;
            }
        }
        return null;
        //window.alert("Unable to find task with ID:" + TaskID);
    }
    catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "GetTaskByID"); }
}

function GetTaskByhtmlID(htmlID) {
    if (K.kalmstromShared.kErrorMode === true) { return false; }
    var CurrTask = new KTMTask(), CurrPhase = new KTMPhase(), intCounter = 0, i = 0;
    try {
        for (i; i < KTMCache.Tasks.length; i += 1) {
            CurrTask = KTMCache.Tasks[i];
            if (CurrTask.gethtmlID() == htmlID) {
                return CurrTask;
            }
        }
        return null;
        //window.alert("Unable to find task with ID:" + TaskID);
    }
    catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "GetTaskByhtmlID"); }
}
function RemoveTaskfromKTMCache(TaskID, ClearHTML) {
    if (K.kalmstromShared.kErrorMode === true) { return false; }
    try {
        var CurrTask;
        for (var i = 0; i < KTMCache.Tasks.length; i += 1) {
            CurrTask = KTMCache.Tasks[i];
            if (CurrTask.ID == TaskID) {
                KTMCache.Tasks.splice(i, 1);
                break;
            }
        }

        if (ClearHTML === true) {
            $("#" + CurrTask.gethtmlID()).hide().remove();
            kKTM.updateHeaderCounts();
        }
    } catch (e) { K.kalmstromShared.kGlobalErrorHandler(e, "RemoveTaskfromKTMCache"); }
}
