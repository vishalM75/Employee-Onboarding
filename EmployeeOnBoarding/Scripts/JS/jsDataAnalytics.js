
var EOBDataAnalytic = {
    oExistingType: [],
    itemArray: [],
    Process: 1,
    version:'',
    oCategory: [{

        CategoryName: "Upon Notice",
        Id: 0,
        tempid: 1
    },
    {
        CategoryName: "Before Of Departure Date",
        Id: 0,
        tempid: 2
    },
    {
        CategoryName: "On Last Day",
        Id: 0,
        tempid: 3
    },
    {
        CategoryName: "After Departure",
        Id: 0,
        tempid: 4
    }],
    oStandardTask: [{

        TaskName: "Obtain & accept resignation letter.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 1,
        IDDepartment: 1

    }, {

        TaskName: "Enter employee departure date in HR system to trigger oﬀboarding checklist and alerts to key departments.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 1,
        IDDepartment: 2
    }, {

        TaskName: "Conﬁrm employee appointment with beneﬁts team.",
        TaskLevel: "HR",
        ResolutionDays: "5",
        Category: 1,
        IDDepartment: 3
    }, {

        TaskName: "Begin processing any outstanding expense reports, petty cash or other expenses.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 1,
        IDDepartment: 4
    }, {

        TaskName: "Begin processing of paid time oﬀ and/or leave balances.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 1,
        IDDepartment: 5
    }, {

        TaskName: "Begin processing any required return of signing bonus or moving/relo reimbursement.",
        TaskLevel: "HR",
        ResolutionDays: "2",
        Category: 1,
        IDDepartment: 1
    }, {

        TaskName: "Remove personal information from company-owned devices.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 2
    }, {

        TaskName: "Schedule ﬁnal manager/team lunch/happy hour with departing employee.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 3
    }, {

        TaskName: "Identify and transfer ﬁles, documents, emails, department app log-ins & other records to supervisor.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 4
    }, {

        TaskName: "Collaborate with employee on knowledge transfer list of current project status, internal & external contacts and other key information.",
        TaskLevel: "Manager",
        ResolutionDays: "10",
        Category: 2,
        IDDepartment: 5

    }, {

        TaskName: "Notify team and appropriate stakeholders of employee departure.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 1
    }, {

        TaskName: "Employee meeting with HR team to discuss beneﬁts, paid time oﬀ balances, retirement plans and employment veriﬁcation process.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 2
    }, {

        TaskName: "Return all keys, IDs, credit cards, calling cards, permits and other company property.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 3
    }, {

        TaskName: "Return all phones, computing devices and media.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 4
    }, {

        TaskName: "Provide reliable contact information (home address, phone, email address) for future correspondence (especially for payroll and W-2).",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 5
    }, {

        TaskName: "Conduct exit interviews for feedback either through online survey or in-person meeting.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 2,
        IDDepartment: 1
    }, {

        TaskName: "Ask employee to sign agreement conﬁrming removal of company data from personal services and devices .",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 3,
        IDDepartment: 2
    }, {

        TaskName: "Meet with IT to review scope of employee electronic footprint and property transfer completion.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 3,
        IDDepartment: 3
    }, {

        TaskName: "Remove all personal items from workspace.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 3,
        IDDepartment: 4

    }, {

        TaskName: "Review checklist in offboarding system with employee, verify all tasks completed.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 3,
        IDDepartment: 5
    }, {

        TaskName: "Reminder to send follow-up termination information.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 4,
        IDDepartment: 1
    }, {

        TaskName: "Notify partners .",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 4,
        IDDepartment: 2
    }, {

        TaskName: "Cancel memberships (industry), licenses, contracts.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 4,
        IDDepartment: 3
    }, {

        TaskName: "Remove from recurring meeting schedules; update org charts, company contacts, mailbox, nameplate.",
        TaskLevel: "Manager",
        ResolutionDays: "1",
        Category: 4,
        IDDepartment: 4
    }, {

        TaskName: "Review of employee feedback given at exit interview for continuous improvement.",
        TaskLevel: "HR",
        ResolutionDays: "1",
        Category: 4,
        IDDepartment: 5
    }],
    oDataAnalytics: [
        {
            AnalyticsType: "Offboarded Employee",
            Count: 0
        },
        {
            AnalyticsType: "Version",
            Count: 0
        }],
    GetDataAnalytics: function (version) {
        EOBDataAnalytic.version = version;
        var context = EOBDataAnalytic.GetClientContext();
        var oListDA = context.get_web().get_lists().getByTitle('EODataAnalytics');
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query></Query></View>');
        collListItemDa = oListDA.getItems(camlQuery);
        context.load(collListItemDa);
        context.executeQueryAsync(
            function () {
                var listItemEnumerator = collListItemDa.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    EOBDataAnalytic.oExistingType.push(oListItem.get_item('AnalyticsType').toLowerCase());
                }
                EOBDataAnalytic.CreateDataAnalytics();
            },
            function (sender, args) {
            });
    },
    CreateDataAnalytics: function () {
        var clientContext = SP.ClientContext.get_current();
        var oList = clientContext.get_web().get_lists().getByTitle('EODataAnalytics');
        var items = [];
        for (var i = 0; i < EOBDataAnalytic.oDataAnalytics.length; i++) {
            if ($.inArray(EOBDataAnalytic.oDataAnalytics[i].AnalyticsType.toLowerCase(), EOBDataAnalytic.oExistingType) == -1) {
                var itemCreateInfo = new SP.ListItemCreationInformation();
                var oListItem = oList.addItem(itemCreateInfo);
                oListItem.set_item('AnalyticsType', EOBDataAnalytic.oDataAnalytics[i].AnalyticsType);
                oListItem.set_item('Count', EOBDataAnalytic.oDataAnalytics[i].Count);
                oListItem.update();
                EOBDataAnalytic.itemArray[i] = oListItem;
                clientContext.load(EOBDataAnalytic.itemArray[i]);
            }
        }
        clientContext.executeQueryAsync(
            function () {
                try {
                    EOBDataAnalytic.VersionDataAnalytics();
                }
                catch (ex) { }
            },
            function (sender, args) {
                console.log('Error occured' + args.get_message());
            }
        );
    },
    VersionDataAnalytics: function () {
        var context = EOBDataAnalytic.GetClientContext();
        var oListDA = context.get_web().get_lists().getByTitle('EODataAnalytics');
        var id = 4;
        var listItemDA = oListDA.getItemById(id);  ///  this is for Employee Onboard Analytics.
        var domain = EOBDataAnalytic.getdomainnameForDataAnalytic();
        listItemDA.update();
        context.load(listItemDA);
        context.executeQueryAsync(
            function () {
                var dataAnalytic = {
                    TypeID: listItemDA.get_item('ID'),
                    AnaltyticsType: listItemDA.get_item('AnalyticsType') + ' - ' + EOBDataAnalytic.version,
                    Count: listItemDA.get_item('Count'),
                    CreatedBy: listItemDA.get_item('Author').get_lookupValue(),
                    ModifiedBy: listItemDA.get_item('Editor').get_lookupValue(),
                    ProductId: oAdConfigurations.objProductIds[_spPageContextInfo.webTitle],
                    Domain: domain,
                    DomainWithSubSite: _spPageContextInfo.siteServerRelativeUrl
                }
                ConfigModal.saveUpdateEODataAnalyticsOnAZ(dataAnalytic);
            },
            function (sender, args) {

            });
    },
    _onDataAnalyticsSucceeded: function (listItemDA) {
        var dataAnalytic = {
            TypeID: listItemDA.get_item('ID'),
            AnaltyticsType: listItemDA.get_item('AnalyticsType') + ' - ' + EOBDataAnalytic.version,
            Count: listItemDA.get_item('Count'),
            CreatedBy: listItemDA.get_item('Author').get_lookupValue(),
            ModifiedBy: listItemDA.get_item('Editor').get_lookupValue(),
            ProductId: oAdConfigurations.objProductIds[_spPageContextInfo.webTitle],
            Domain: domain,
            DomainWithSubSite: _spPageContextInfo.siteServerRelativeUrl
        }
        ConfigModal.saveUpdateEODataAnalyticsOnAZ(dataAnalytic);
    },
    _onDataAnalyticsFailed: function (data) {
        console.log(data)
    },
    GetClientContext: function () {
        var clientContext = new SP.ClientContext.get_current;
        return clientContext;
    },
    getdomainnameForDataAnalytic: function () {
        try {
            var domain = "";
            hosturl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
            var spHostUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
            if (spHostUrl != 'undefined') {
                domain = EOBDataAnalytic.extractDomain1(spHostUrl);
            }
            else {
                domain = EOBDataAnalytic.extractDomain1(hosturl);
                domain = domain.split(".").join("_");
                var strRemovePart = domain.split("_");
                var strToRemove = strRemovePart[0].split("-");
                var finalStrToRemove = strToRemove[1];
                domain = domain.replace("-" + finalStrToRemove, "");
                domain = domain.split("_").join(".");
            }
            return domain;
        }
        catch (e) { }
    },
    getQueryStringParameter: function (paramToRetrieve) {
        try {
            var params =
                document.URL.split("?")[1].split("&");
            var strParams = "";
            for (var i = 0; i < params.length; i = i + 1) {
                var singleParam = params[i].split("=");
                if (singleParam[0] == paramToRetrieve)
                    return singleParam[1];
            }
        }
        catch (e) { }
    },
    extractDomain1: function (url) {
        try {
            var domain;
            //find & remove protocol (http, ftp, etc.) and get domain
            if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
            }
            else {
                domain = url.split('/')[0];
            }
            //find & remove port number
            domain = domain.split(':')[0];

            return domain;
        }
        catch (e) { }
    },
    standardTaskDataAnalytics: function () {
        var context = EOBDataAnalytic.GetClientContext();
        var oList = context.get_web().get_lists().getByTitle('StandardTask');
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query></Query></View>');
        var items = oList.getItems(camlQuery);
        context.load(items);
        context.executeQueryAsync(
            function () {
                var count = 0;
                var listEnum = items.getEnumerator();
                while (listEnum.moveNext()) {
                    count++;
                }
                var oListDA = context.get_web().get_lists().getByTitle('EODataAnalytics');
                var listItemDA = oListDA.getItemById(2);  ///  this is for Standard Task Analytics.
                var domain = EOBDataAnalytic.getdomainnameForDataAnalytic();
                listItemDA.set_item('Domain', domain);
                listItemDA.set_item('Count', count);
                listItemDA.update();
                context.load(listItemDA);
                context.executeQueryAsync(
                    function () {
                        var dataAnalytic = {
                            TypeID: listItemDA.get_item('ID'),
                            AnaltyticsType: listItemDA.get_item('AnalyticsType'),
                            Count: listItemDA.get_item('Count'),
                            CreatedBy: listItemDA.get_item('Author').get_lookupValue(),
                            ModifiedBy: listItemDA.get_item('Editor').get_lookupValue(),
                            ProductId: oAdConfigurations.objProductIds[_spPageContextInfo.webTitle],
                            Domain: domain,
                            DomainWithSubSite: _spPageContextInfo.siteServerRelativeUrl
                        }
                        ConfigModal.saveUpdateEODataAnalyticsOnAZ(dataAnalytic);
                    },
                    function (sender, args) {
                    });
            }, function () {

            });
    },
    EmployeeOnboardDataAnalytics: function (process) {
        EOBDataAnalytic.Process = process;
        var context = EOBDataAnalytic.GetClientContext();
        var oList = context.get_web().get_lists().getByTitle('lstEmployeeOnboard');
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Process" LookupId="TRUE" /><Value Type="Lookup">' + EOBDataAnalytic.Process + '</Value></Eq></Where></Query></View>');
        var items = oList.getItems(camlQuery);
        context.load(items);
        context.executeQueryAsync(
            function () {
                var count = 0;
                var listEnum = items.getEnumerator();
                while (listEnum.moveNext()) {
                    count++;
                }
                var oListDA = context.get_web().get_lists().getByTitle('EODataAnalytics');
                var id = 0;
                if (EOBDataAnalytic.Process == "1") { id = 1; } else if (EOBDataAnalytic.Process == "2") { id = 3; }
                var listItemDA = oListDA.getItemById(id);  ///  this is for Employee Onboard Analytics.
                var domain = EOBDataAnalytic.getdomainnameForDataAnalytic();
                listItemDA.set_item('Domain', domain);
                listItemDA.set_item('Count', count);
                listItemDA.update();
                context.load(listItemDA);
                context.executeQueryAsync(
                    function () {
                        var dataAnalytic = {
                            TypeID: listItemDA.get_item('ID'),
                            AnaltyticsType: listItemDA.get_item('AnalyticsType'),
                            Count: listItemDA.get_item('Count'),
                            CreatedBy: listItemDA.get_item('Author').get_lookupValue(),
                            ModifiedBy: listItemDA.get_item('Editor').get_lookupValue(),
                            ProductId: oAdConfigurations.objProductIds[_spPageContextInfo.webTitle],
                            Domain: domain,
                            DomainWithSubSite: _spPageContextInfo.siteServerRelativeUrl
                        }
                        ConfigModal.saveUpdateEODataAnalyticsOnAZ(dataAnalytic);
                    },
                    function (sender, args) {
                    });
            }, function () {

            });
    }
};