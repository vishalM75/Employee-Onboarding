//SP.SOD.executeOrDelayUntilScriptLoaded(LoadCustomFields, "sp.js");

var allCustomFields = [];
var allCustomFieldsName = [];
var detailsID = 0;
var lstCustomFields = "";
var ipAddress = "";
var cfLocation = "";

function LoadCustomFields() {
    var Process = "1";
    if (Process == null || Process == "" || Process == undefined) {
        Process = 1;
    }
    if (Process == "1")
        lstCustomFields = "EmployeeCustomFieldsOnBoard";
    else
        lstCustomFields = "EmployeeCustomFieldsOffBoard";
    LoadEmployeeCustomFieldsControls();
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function LoadEmployeeCustomFieldsControls() {
    var clientContext = new SP.ClientContext.get_current();
    var web = clientContext.get_web();
    var list = web.get_lists().getByTitle(lstCustomFields);
    this.listFields = list.get_fields();
    clientContext.load(this.listFields);
    clientContext.executeQueryAsync(Function.createDelegate(this,
        this.onListFieldsQuerySucceeded), Function.createDelegate(this,
            this.onListFieldsQueryFailed));
}

function onListFieldsQuerySucceeded() {
    var fieldEnumerator = listFields.getEnumerator();
    var customFieldsHtml = '';
    var countField = 0;
    allCustomFields = [];
    allCustomFieldsName = [];
    while (fieldEnumerator.moveNext()) {
        var oField = fieldEnumerator.get_current();
        var schema = oField.get_schemaXml();
        if (schema.indexOf('SourceID="http://schemas.microsoft.com/sharepoint/v3"') == -1) {
            if (oField.get_internalName() != "EmployeeID") {
                var htmlFtype = '';
                var optionHtml = '';
                var fType = oField.get_fieldTypeKind();
                if (fType == SP.FieldType.choice) {
                    var choices = oField.get_choices();
                    console.log(choices[0]);
                    var comboValues = [];
                    for (var i = 0; i < choices.length; i++) {
                        optionHtml = <option value={choices[i]}>{choices[i]}</option>;
                        comboValues.push(optionHtml);
                    }
                    var choiceFormat = oField.get_editFormat();
                    /*if (choiceFormat == 0) {*///ddl
                    htmlFtype = <div style="width:25%;float:left;padding-bottom:10px;"><label style="font-size:16px;color:#000000;font-weight: lighter;">{oField.get_title()}</label><br /><div class="input-control select input-inner-text"><select id={oField.get_internalName()}>{comboValues}</select></div></div>;
                    //}
                    //else if (choiceFormat == 1) { //radio buttons
                    //    htmlFtype = '<select id="' + oField.get_internalName() + '">' +
                    //        '<option> Select</option >' +
                    //        '<option value="HR" title="HR">HR</option>' +
                    //        '<option value="Manager" title="Manager">Manager</option></select>';
                    //}
                    //else {//checkboxes 
                    //}
                }
                else {
                    htmlFtype = GetFieldType(fType, oField.get_title(), oField.get_internalName());
                }
                if (htmlFtype != "") {
                    customFieldsHtml = customFieldsHtml + htmlFtype;
                    allCustomFields[countField] = oField.get_internalName();
                    allCustomFieldsName[countField] = oField.get_title();
                    countField = countField + 1;
                }
            }
        }
    }
    if (customFieldsHtml != "")
        customFieldsHtml = <hr style='border: 0;height: 1px;background-color: lightgray;' /> + customFieldsHtml;
    //$('#divEmployeeCustomFields').html(customFieldsHtml);
    OnOffboardModalComponent.setState({ sEmployeeCustomFields: customFieldsHtml });
    var x = document.getElementById("divEmployeeCustomFields").querySelectorAll(".datetime");
    var i;
    for (i = 0; i < x.length; i++) {
        var ctrlId = x[i].id;
        $("#" + ctrlId).datepicker();
    }
}

function onListFieldsQueryFailed() { }

function GetFieldType(fType, title, name) {
    var fthtml = '';
    switch (fType) {
        case SP.FieldType.text:
            console.log("text");
            fthtml = '<div style="width:25%;float:left;padding-bottom:10px;"><label style="font-size:16px;color:#000000;font-weight: lighter;">' + title + '</label><br/><div class="input-control text input-inner-text"><input name="txt' + name + '" id="' + name + '" type="text" class="text" placeholder="' + title + '" /></div></div>';
            break;
        case SP.FieldType.number:
            console.log("number");
            fthtml = '<div style="width:25%;float:left;padding-bottom:10px;"><label style="font-size:16px;color:#000000;font-weight: lighter;">' + title + '</label><br/><div class="input-control text input-inner-text"><input name="num' + name + '" id="' + name + '" type="text" class="text" placeholder="' + title + '"  onkeypress="return isNumber(event)"/></div></div>';
            break;
        case SP.FieldType.dateTime:
            console.log("dateTime");
            fthtml = '<div style="width:25%;float:left;padding-bottom:10px;"><label style="font-size:16px;color:#000000;font-weight: lighter;">' + title + '</label><br/><div class="input-control text input-inner-text"><input name="dt' + name + '" id="' + name + '" type="text" class="datetime" placeholder="' + title + '"  readonly="true"/></div></div>';
            break;
        //case SP.FieldType.choice:
        //    console.log("choice");
        //    fthtml = '<div class="input-control select full-size input-inner-text"><input name="ch' + countField + '" id="ctmEmpField' + countField + '" type="text"  placeholder="' + title + '"  readonly="true"/></div>';
        //    break;
    }
    return fthtml;
}

function fn_InsertCustomFields(vEditID) {
    console.log("Inserting customFields start");
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item("EmployeeID", vEditID);
    oListItem.set_item("Title", "");
    if (allCustomFields.length != 0) {
        for (var i = 0; i < allCustomFields.length; i++) {
            if ($("#" + allCustomFields[i]).val() != "")
                oListItem.set_item(allCustomFields[i], $("#" + allCustomFields[i]).val());
            else
                oListItem.set_item(allCustomFields[i], null);
            if (allCustomFields[i] == "IP_x0020_Address") {
                ipAddress = $("#" + allCustomFields[i]).val();
            }
            if (allCustomFields[i] == "Location") {
                cfLocation = $("#" + allCustomFields[i]).val();
            }
        }
    }
    oListItem.update();
    clientContext.load(oListItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededInsertCustomFields), Function.createDelegate(this, this.onQueryFailedMaster));
}

function onQuerySucceededInsertCustomFields() {
    console.log("Insert in Customfields success.");
}

function onQueryFailedMaster(sender, args) {
    console.log("Insert in Customfields failed.");
}

function GetSetEmployeeCustomFieldValues(eID) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + eID + '</Value></Eq></Where></Query></View>');
    this.collListItem1 = oList.getItems(camlQuery);
    clientContext.load(collListItem1);
    clientContext.executeQueryAsync(
        function () {
            var listItemEnumerator = collListItem1.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var oListItem = listItemEnumerator.get_current();
                var cusID = oListItem.get_item('ID');
                SetEmployeeCustomFieldValues(cusID);
            }
        },
        function (sender, args) {
            console.log("Error in getting customfield values");
        });
}

function SetEmployeeCustomFieldValues(eCusID) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var listItem = oList.getItemById(eCusID);
    clientContext.load(listItem);
    clientContext.executeQueryAsync(
        function () {
            for (var i = 0; i < allCustomFields.length; i++) {
                if ($('#' + allCustomFields[i]).hasClass("datetime")) {
                    if (listItem.get_item(allCustomFields[i]))
                        $('#' + allCustomFields[i]).val(moment(listItem.get_item(allCustomFields[i])).format('MM/DD/YYYY'));
                    else
                        $('#' + allCustomFields[i]).val("");
                }
                else {
                    $('#' + allCustomFields[i]).val(listItem.get_item(allCustomFields[i]));
                }
                if (allCustomFields[i] == "IP_x0020_Address") {
                    ipAddress = listItem.get_item(allCustomFields[i]);
                }
                if (allCustomFields[i] == "Location") {
                    cfLocation = listItem.get_item(allCustomFields[i]);
                }
            }
        },
        function (sender, args) {
            console.log("Error in getting customfield values");
        });
}

function UpdateEmployeeCustomFieldsDetail(vIDEmployee) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + vIDEmployee + '</Value></Eq></Where></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
        function () {
            var listItemEnumerator = collListItem.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var oListItem = listItemEnumerator.get_current();
                var cusID = oListItem.get_item('ID');
                finalUpdateCustomFieldDetail(cusID, vIDEmployee);
            }
        },
        function (sender, args) {
            console.log("Error in getting customfield values");
        });
}

function finalUpdateCustomFieldDetail(fuid, vsIDEmployee) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    this.oListItem = oList.getItemById(fuid);
    if (allCustomFields.length != 0) {
        oListItem.set_item("EmployeeID", vsIDEmployee);
        oListItem.set_item("Title", "");
        for (var i = 0; i < allCustomFields.length; i++) {
            if ($("#" + allCustomFields[i]).val() != "")
                oListItem.set_item(allCustomFields[i], $("#" + allCustomFields[i]).val());
            else
                oListItem.set_item(allCustomFields[i], null);
            if (allCustomFields[i] == "IP_x0020_Address") {
                ipAddress = $("#" + allCustomFields[i]).val();
            }
            if (allCustomFields[i] == "Location") {
                cfLocation = $("#" + allCustomFields[i]).val();
            }
        }
    }
    oListItem.update();
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySuccessdedUpdateEmployeeCustomFieldsDetail), Function.createDelegate(this, this.onQueryFailedMaster));
}

function onQuerySuccessdedUpdateEmployeeCustomFieldsDetail() {
    console.log("onQuerySuccessdedUpdateEmployeeCustomFieldsDetail");
}

function LoadEmployeeCustomFieldsDetails(ID) {
    detailsID = ID;
    var clientContext = new SP.ClientContext.get_current();
    var web = clientContext.get_web();
    var list = web.get_lists().getByTitle(lstCustomFields);
    this.listFields = list.get_fields();
    clientContext.load(this.listFields);
    clientContext.executeQueryAsync(Function.createDelegate(this,
        this.onLoadEmployeeCustomFieldsDetailsSucceeded), Function.createDelegate(this,
            this.onListFieldsQueryFailed));
}

function onLoadEmployeeCustomFieldsDetailsSucceeded() {
    var fieldEnumerator = listFields.getEnumerator();
    var customFieldsHtml = '';
    var countField = 0;
    allCustomFieldsDetail = [];
    while (fieldEnumerator.moveNext()) {
        var oField = fieldEnumerator.get_current();
        var schema = oField.get_schemaXml();
        if (schema.indexOf('SourceID="http://schemas.microsoft.com/sharepoint/v3"') == -1) {
            if (oField.get_internalName() != "EmployeeID") {
                var fType = oField.get_fieldTypeKind();
                var htmlFtype = GetFieldTypeForDetails(fType, oField.get_title(), oField.get_internalName());
                if (htmlFtype != "") {
                    customFieldsHtml = customFieldsHtml + htmlFtype;
                    allCustomFields[countField] = oField.get_internalName();
                    //allCustomFieldsName[countField] = oField.get_title();
                    countField = countField + 1;
                }
            }
        }
    }
    if (customFieldsHtml != "")
        customFieldsHtml = "<hr style='border: 0;height: 1px;background-color: lightgray;' />" + customFieldsHtml;
    OnOffboardModalComponent.setState({ sEmployeeCustomFields: customFieldsHtml });
    //$('#divEmployeeCustomFields').html(customFieldsHtml);
    GetEmployeeCustomFieldValues(detailsID);
    //$('#divEmployeeCustomFields').html(customFieldsHtml);
    //var x = document.getElementById("divEmployeeCustomFields").querySelectorAll(".datetime");
    //var i;
    //for (i = 0; i < x.length; i++) {
    //    var ctrlId = x[i].id;
    //    $("#" + ctrlId).datepicker();
    //}
}

function GetFieldTypeForDetails(fType, title, name) {
    var fthtml = '';
    switch (fType) {
        case SP.FieldType.text:
            console.log("text");
            fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;" name="spn' + name + '" id="' + name + '"  class="text" /></div>';
            break;
        case SP.FieldType.number:
            console.log("number");
            fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;"  name="spn' + name + '" id="' + name + '"  class="text" /></div>';
            break;
        case SP.FieldType.dateTime:
            console.log("dateTime");
            fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;"  name="spn' + name + '" id="' + name + '"  class="datetime" /></div>';
            break;
        case SP.FieldType.choice:
            console.log("choice");
            fthtml = '<div style="width:15%;float:left;padding-bottom:10px;padding-top:10px;"><div class="lbl-category-name">' + title + '</div><br/><span style="padding-top:10px;padding-left:8px;" name="spn' + name + '" id="' + name + '"  class="text" /></div>';
            break;
    }
    return fthtml;
}

function GetEmployeeCustomFieldValues(dID) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="EmployeeID" /><Value Type="Number">' + dID + '</Value></Eq></Where></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
        function () {
            var listItemEnumerator = collListItem.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var oListItem = listItemEnumerator.get_current();
                var cusID = oListItem.get_item('ID');
                SetEmployeeCustomFieldValuesDetails(cusID);
            }
        },
        function (sender, args) {
            console.log("Error in getting customfield values");
        });
}

function SetEmployeeCustomFieldValuesDetails(sCusID) {
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(lstCustomFields);
    var listItem = oList.getItemById(sCusID);
    clientContext.load(listItem);
    clientContext.executeQueryAsync(
        function () {
            $("#divEmployeeCustomFields").show();
            for (var i = 0; i < allCustomFields.length; i++) {
                if ($('#' + allCustomFields[i]).hasClass("datetime")) {
                    if (listItem.get_item(allCustomFields[i]))
                        $('#' + allCustomFields[i]).html(moment(listItem.get_item(allCustomFields[i])).format('MM/DD/YYYY'));
                    else
                        $('#' + allCustomFields[i]).val("");
                }
                else {
                    $('#' + allCustomFields[i]).html(listItem.get_item(allCustomFields[i]));
                }
                if (allCustomFields[i] == "IP_x0020_Address") {
                    ipAddress = listItem.get_item(allCustomFields[i]);
                }
                if (allCustomFields[i] == "Location") {
                    cfLocation = listItem.get_item(allCustomFields[i]);
                }
            }
        },
        function (sender, args) {
            console.log("Error in getting customfield values");
        });
}

function getChoices() {
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    // Get task list
    var testList = web.get_lists().getByTitle("TestChoice");//列表名

    // Get Priority field (choice field)
    var choiceField = context.castTo(testList.get_fields().getByInternalNameOrTitle("TestChoice"),//栏名
        SP.FieldChoice);
    context.load(choiceField);
    // Call server
    context.executeQueryAsync(Function.createDelegate(this, onSuccessMethod),
        Function.createDelegate(this, onFailureMethod));

    function onSuccessMethod(sender, args) {
        // Get string arry of possible choices (but NOT fill-in choices)
        var choices = choiceField.get_choices();
        console.log(choices[0]);//得到的是一个数组。那么我们就可以这么写 
        for (var i = 0; i < choices.length; i++) {
            var optionHtml = "<option value='" + choices[i] + "'>" + choices[i] + "</option>";
            $('#Test select').append(optionHtml);
        }

        //var myoption = choices.join(",");
        //var selectOptions = new Array;
        //selectOptions = myoption.split(",");
        //for (var i = 0; i < selectOptions.length; i++) {

        //var optionHtml = "<option value='" + selectOptions[i] + "'>" + selectOptions[i] + "</option>";
        //$('#Test select').append(optionHtml);
        //}
    }

    function onFailureMethod(sender, args) {
        console.log("oh oh!");
    }

}
