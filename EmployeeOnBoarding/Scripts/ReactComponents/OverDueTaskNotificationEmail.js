"use strict";
var gReminderData = {
    AllOpenTasks: null,
    GroupedTasks: {},
    EmailTemplateData: null,
    PendingEmailTemplateData: null,
    SentEmailLCount: 0,
    SPUsersInfo:null
}
class OverDueTasksNotificationEmails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            afterEmailSent: this.props.HandleAfterEmailSent,        
            closeHandle:this.props.CloseDialogHandle
        };
        this.CloseModal = this.CloseModal.bind(this)
        this.HandleUpdate = this.HandleUpdate.bind(this)
        this.StartSendingEmails = this.StartSendingEmails.bind(this);
        this.SortTasksByAssignedTo = this.SortTasksByAssignedTo.bind(this);
        this.GetAllOpenTasks = this.GetAllOpenTasks.bind(this)
        this.isTaskDue = this.isTaskDue.bind(this)
        this._onGetAllOpenTasksSuccess = this._onGetAllOpenTasksSuccess.bind(this)        
        this.GetTaskNotificationTemplateType = this.GetTaskNotificationTemplateType.bind(this)
        this._onEmailTemplateGet = this._onEmailTemplateGet.bind(this)
        this.SendOverDueMails = this.SendOverDueMails.bind(this)
        this.ReturnEmailObject = this.ReturnEmailObject.bind(this)
        this._AfterEmailSend = this._AfterEmailSend.bind(this)
        this._onRestCallFailure = this._onRestCallFailure.bind(this)
        this.GetSPUsersInfo = this.GetSPUsersInfo.bind(this)
        this._onSPUsersGet = this._onSPUsersGet.bind(this)
        this.ReturnUserEmailFromID = this.ReturnUserEmailFromID.bind(this)
        if (Object.keys(BKSPShared.UsersAndGroups.SPGroupsUsersRest).length == 0) {
            BKSPShared.UsersAndGroups.GetAllSPGroupsAndUsersByRest()      
        }
        
    }
    componentWillMount() {

    }
 
    componentDidMount() {
        var modal = document.getElementById("SendTaskReminderDialog");
        modal.style.display = "block";    
        $("#rdoOverDueTask").prop('checked', true);
        EOBConstants.SetNewThemeColor()
        
    }
    HandleUpdate() {
        gReminderData.AllOpenTasks = null
        gReminderData.GroupedTasks = {};
        this.props.HandleAfterEmailSent();
    }
  
    CloseModal() {
        var modal = document.getElementById("SendTaskReminderDialog");
        modal.style.display = "none";
        gReminderData.AllOpenTasks = null
        gReminderData.GroupedTasks = {};
        this.props.CloseDialogHandle()
    }
    GetAllOpenTasks() {
        var isOverDueTask = $("#rdoOverDueTask").prop('checked');
        var isPendingTask = $("#rdoPendingTask").prop('checked');
        var Url = ""
        if (isOverDueTask) {
            
            //dDueTo = moment(dDueTo).format("YYYY-MM-DDT00:00:00.000") + "Z"
            var CurrentDateString = moment().format("YYYY-MM-DDT00:00:00.000") + "Z"
            
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$select=OData__EmployeeID%2FOData__StatusE%2CID%2CProcessId%2CAssignedToId%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus%2COData__IDCategory%2FCategoryName1&$expand=OData__EmployeeID%2FOData__StatusE%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2COData__IDCategory%2FCategoryName1&$filter=(Status%20ne%20%27Close%27)  and (OData__EmployeeID%2FOData__StatusE%20ne%20'Aborted') and (DueDate lt datetime'" + CurrentDateString + "')";//
        }
        if (isPendingTask) {
            Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$select=OData__EmployeeID%2FOData__StatusE%2CID%2CProcessId%2CAssignedToId%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus%2COData__IDCategory%2FCategoryName1&$expand=OData__EmployeeID%2FOData__StatusE%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2COData__IDCategory%2FCategoryName1&$filter=(Status%20ne%20%27Close%27)  and (OData__EmployeeID%2FOData__StatusE%20ne%20'Aborted')";//
        }
       
        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ActualTasks + "')/items?$select=ID%2CProcessId%2CAssignedToId%2COData__EmployeeIDId%2CIDDepartment%2CDueDate%2CTitle%2COData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2CStatus%2COData__IDCategory%2FCategoryName1&$expand=OData__EmployeeID%2F_EmployeeName%2CDepartments%2F_DepartmentName%2CAssignedTo%2FTitle%2COData__IDCategory%2FCategoryName1&$filter=(Status%20ne%20%27Close%27)";//
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onGetAllOpenTasksSuccess, this._onRestCallFailure);
    }
    GetSPUsersInfo() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUsers"
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onSPUsersGet, this._onRestCallFailure);
    }
    isTaskDue(TaskDueDate) {
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        var currDate = Date.parse(utc);
        var TaskDueDate = new Date(TaskDueDate);
        TaskDueDate = new Date(TaskDueDate);
        var utcTaskDueDate = new Date(TaskDueDate).toJSON().slice(0, 10).replace(/-/g, '/');
        TaskDueDate = Date.parse(new Date(utcTaskDueDate));
        if (TaskDueDate < currDate) {
            return true
        }
        else {
            return false;
        }
    }
    SortTasksByAssignedTo() {
        var TasksByAssignedTo = {}
        for (var i = 0; i < gReminderData.AllOpenTasks.length; i++) {
            //var isDue = this.isTaskDue(gReminderData.AllOpenTasks[i].DueDate)
            //if (isDue) {
                var CurrentTaskAssignedId = gReminderData.AllOpenTasks[i].AssignedToId.results
                for (var j = 0; j < CurrentTaskAssignedId.length; j++) {
                    //var CurrentItem = TasksByAssignedTo[CurrentTaskAssignedId[j]
                    if (TasksByAssignedTo[CurrentTaskAssignedId[j]] == undefined) {
                        var ItemArr = [gReminderData.AllOpenTasks[i]];
                        TasksByAssignedTo[CurrentTaskAssignedId[j]] = ItemArr
                    }
                    else {
                        var CurrentTaskArray = TasksByAssignedTo[CurrentTaskAssignedId[j]];
                        CurrentTaskArray.push(gReminderData.AllOpenTasks[i])
                        TasksByAssignedTo[CurrentTaskAssignedId[j]] = CurrentTaskArray
                    }
                }    
           // }            
        }
        gReminderData.GroupedTasks = TasksByAssignedTo
        this.GetTaskNotificationTemplateType()        
    }
    StartSendingEmails() {
        $("#SendTaskReminderDialog").addClass("d-none")
        this.GetAllOpenTasks();
    }
    GetTaskNotificationTemplateType() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.EmailTemplates + "')/items?$filter=((ID eq '9') or (ID eq '10'))&$orderby=ID asc";//
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onEmailTemplateGet, this._onRestCallFailure);
    }
    ReturnEmailObject(TaskItems, AssignedToID) {
        var isOverDueTask = $("#rdoOverDueTask").prop('checked');
        var Body = (isOverDueTask == true) ? (gReminderData.EmailTemplateData.EmailTemplate) : (gReminderData.PendingEmailTemplateData.EmailTemplate)
        var Subject = (isOverDueTask == true) ? (gReminderData.EmailTemplateData.Subject) : (gReminderData.PendingEmailTemplateData.Subject)
        //var Body = gReminderData.EmailTemplateData.EmailTemplate;
        var AssignedToName = ""
       
        for (var i = 0; i < TaskItems[0].AssignedToId.results.length; i++) {
            for (var l = 0; l < TaskItems[0].AssignedToId.results.length; l++) {
                if (TaskItems[0].AssignedToId.results[l] == AssignedToID) {
                    AssignedToName = TaskItems[0].AssignedTo.results[l].Title
                   
                    break;
                }
            }
        }
        Body = Body.replace("#AssignedToName#", AssignedToName)
        Body = Body.replace("#OBTitle#", ConfigModal.gConfigSettings.DisplayTextEmployee)
        Body = Body.replace("#OnboardingTitle#", ConfigModal.gConfigSettings.DisplayTextEmployee)
        var RowsString = ""
        for (var i = 0; i < TaskItems.length; i++) {
            var ProcessType = (TaskItems[i].ProcessId == 1) ?"Onboarding":"Offboarding"
            var Row = "<tr style='border-bottom:gray;border-bottom-style:solid;border-bottom-width:1px;height:30px;'>"
            Row += "<td>" + TaskItems[i].OData__EmployeeID._EmployeeName + "</td>"
            Row += "<td>" + TaskItems[i].Title + "</td>"
            Row += "<td>" + TaskItems[i].OData__IDCategory.CategoryName1 + "</td>"
            Row += "<td>" + ProcessType + "</td>"
            Row += "<td>" + moment(TaskItems[i].DueDate).format("MM/DD/YYYY") + "</td>"
            Row += "</tr>"
            RowsString += Row
        }
        Body = Body.replace("#TasksRows#", RowsString)
        var MyTasksUrl = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
        Body = Body.replace("#MyTasksUrl%23", MyTasksUrl)
        var EmailObject = {
            To: AssignedToID,
            From: "Employee Onboarding team",
            Body: Body,
            Subject: Subject
        }
        return EmailObject;
    }
    ReturnUserEmailFromID(AssignedToID) {
        var UserEmail = []
        var isEmailFound = false;
        for (var i = 0; i < gReminderData.SPUsersInfo.length; i++) {
            if (gReminderData.SPUsersInfo[i].Id == AssignedToID) {
                if (gReminderData.SPUsersInfo[i].UserPrincipalName) {
                    UserEmail.push(gReminderData.SPUsersInfo[i].UserPrincipalName);
                    isEmailFound = true;
                }
                break;
            }
        }
        if (!isEmailFound) {
            //for (var k = 0; k < BKSPShared.UserData.length; k++) {
            //    if (BKSPShared.UserData[k].GroupID == AssignedToID) {
            //        //BKSPShared.UserData[1].LoginName.split("|")[2]
            //        UserEmail.push(BKSPShared.UserData[k].LoginName.split("|")[2]);
            //    }
            //}
            var GroupUsers = BKSPShared.UsersAndGroups.SPGroupsUsersRest[AssignedToID]
            for (var k = 0; k < GroupUsers.d.results.length; k++) {
               // if (BKSPShared.UserData[k].GroupID == AssignedToID) {
                    //BKSPShared.UserData[1].LoginName.split("|")[2]
                UserEmail.push(GroupUsers.d.results[k].LoginName.split("|")[2]);
                //}
            }
        }
        return UserEmail
    }
    SendOverDueMails() {
      
        if (Object.keys(gReminderData.GroupedTasks).length > 0) {
            for (var key in gReminderData.GroupedTasks) {
                
                var ToEmail = (this.ReturnUserEmailFromID(key))
                if (ToEmail.length > 0) {
                 //   for (var l = 0; l < ToEmail.length;l++) {
                        var CurrentAssignedToTasks = gReminderData.GroupedTasks[key];
                        var EmailObject = this.ReturnEmailObject(CurrentAssignedToTasks, key)
                        BKSPShared.SPEMail.SendEMail(_spPageContextInfo.userEmail, ToEmail, EmailObject.Body, EmailObject.Subject, this._AfterEmailSend, this._onRestCallFailure)
                   // }
                    
                }
            }
        }
        else {
            this.props.CloseDialogHandle()
        }
    }
    _AfterEmailSend() {
        gReminderData.SentEmailLCount = gReminderData.SentEmailLCount + 1
        if (gReminderData.SentEmailLCount == Object.keys(gReminderData.GroupedTasks).length) {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "Task notification email sent successfully.", "", 1100)
            this.props.CloseDialogHandle()
        }
    }
    _onGetAllOpenTasksSuccess(data) {
        gReminderData.AllOpenTasks = data.d.results
        this.SortTasksByAssignedTo()
    }
    _onEmailTemplateGet(data) {
        gReminderData.EmailTemplateData = data.d.results[0]
        gReminderData.PendingEmailTemplateData = data.d.results[1]
        this.GetSPUsersInfo()        
    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    _onSPUsersGet(data) {
        gReminderData.SPUsersInfo = data.d.results
        this.SendOverDueMails()
    }
    render() {
        return (
            <div id="SendTaskReminderDialog" className="modalReact">
                <div className="modal-contentReact col-lg-4 col-md-6">
                    <div>
                        <div className="row modal-head align-items-center">
                            <div id="SREHeadingDiv" className="col-10 SwitchTitleColor">
                                <h4 className="f-16 m-0 SwitchTitleColor" >Send task notification email</h4>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={this.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div class="row modal-body notification-email-modal">
                            <div className="col-12 mt-2 p-0">
                                <div className="form-group mb-0">
                                    <label className="send-label">Send email notification for:</label>
                                </div>
                                <div className="custom-control custom-radio custom-control-inline border-bottom-0">
                                    <input type="radio" id="rdoOverDueTask" name="rdoOver" className="custom-control-input" value="rdoOverDueT" />
                                    <label className="custom-control-label" htmlFor="rdoOverDueTask">All overdue tasks</label>
                                </div>
                                <div className="custom-control custom-radio custom-control-inline border-top-0">
                                    <input type="radio" id="rdoPendingTask" name="rdoOver" className="custom-control-input" value="rdoPendingT" />
                                    <label className="custom-control-label" htmlFor="rdoPendingTask">All pending tasks</label>
                                </div>                             
                            </div>
                            <div className="col-12 text-center mb-2 mt-4">
                                <h4 className="f-16">{"Are you sure want to send task notification email?"}</h4>
                            </div>
                        </div>
                        <div>
                            <div class="row modal-footer ">
                                <div className="col-12 text-center">
                                    <input type="Button" className="btn btn-primary SwitchTitleColor modalBtn" id={"SREModalBtn"} onClick={this.StartSendingEmails} value="Send" />
                                    <input type="Button" className="btn btn-light modalBtn" onClick={this.CloseModal} value="Close" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}
