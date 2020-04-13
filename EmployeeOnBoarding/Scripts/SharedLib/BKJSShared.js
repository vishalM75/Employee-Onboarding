"use strict";

var BKJSShared = {
    JSLibraryVersion: "1.0.5",
    Application: {
        Name: "",
        Version: "",
        PlatForm: "",
        Environment: "",
        isSPFx: false,
        isSPAddin: false,
        hostweburl: "",
        appweburl: ""
    },

    HTTPRequestMethods: {
        MERGE: "MERGE",
        DELETE: "DELETE"
    },
    HTTPRequestType: {
        POST: "POST",
        GET: "GET",
        MERGE: "MERGE",
        PUT: "PUT",
        DELETE: "DELETE"
    },
    ErrorMode: false,
    RequestDigestValue: "",
    RequestDigestSuccessCallback: null,
    AjaxCall: function (url, dataObject, type, XHttpMethodString, success, failure, isRemoveHeaders) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            var headers = null;
            if (!isRemoveHeaders) {
                headers = {
                    'Accept': 'application/json;odata=verbose',
                    'Content-type': 'application/json;odata=verbose',
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                }
            }

            if (XHttpMethodString) {
                headers["IF-MATCH"] = "*";
                headers["X-HTTP-Method"] = XHttpMethodString;
            }
            if (BKJSShared.Application.isSPFx) {
                headers["X-RequestDigest"] = BKJSShared.RequestDigestValue
            }

            var AjaxObject = {
                dataType: "json",
                url: url,
                type: type,
                async: false,
                headers: headers,
                success: function (data) {
                    success(data);
                },
                error: function (data) {
                    failure(data);
                }
            }

            if (dataObject) {
                AjaxObject["data"] = JSON.stringify(dataObject)
            }

            $.ajax(AjaxObject);

        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.AjaxCall"); }
    },

    getFormDigest: function (successCalBack) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            //in SPFx some security issue in updating data through rest, reported issue of request digest unavailability. trying this methiod to explicitly get request digest and then give with rest
            BKJSShared.RequestDigestSuccessCallback = successCalBack;
            var Url = BKSPShared.SiteAbsoluteURL + "/_api/contextinfo";
            BKJSShared.AjaxCall(Url, null, "POST", BKJSShared._getFormDigestSuccess, BKJSShared._getFormDigestError)
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.getFormDigest"); }
    },
    _getFormDigestSuccess: function (data) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            BKJSShared.RequestDigestValue = data.FormDigestValue
            BKJSShared.RequestDigestSuccessCallback();
        } catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared._getFormDigestSuccess"); }
    },
    _getFormDigestError: function (data) {
        alert(data.responseText)
    },
    GlobalErrorHandler: function (e, strFunction, AdditionalMessage) {
        var strMessage = "ERROR:\n",
            strQuestion = "",
            ContactEmail = "",
            LineNumber = 0,
            ErrorFile = "",
            ErrorMessage = "";
        strMessage +=
            "Release: " +
            BKJSShared.Application.Name +
            "v: " +
            BKJSShared.Application.Version +
            "\n\n";
        strMessage += "**************\n\r";
        strMessage += "Function: " + strFunction + "\n\r";

        if (e !== null && e !== undefined) {
            if (e.lineNo !== undefined) {
                strMessage += "Line: " + e.lineNo + "\n\r";
                LineNumber = e.lineNo;
            }
            if (e.name !== undefined) {
                strMessage += "Name: " + e.name + "\n\r";
            }
            if (e.message !== undefined) {
                strMessage += "Message: " + e.message + "\n\r";
                ErrorMessage = e.message;
            }

            try {
                if (e.stack !== undefined) {
                    var ParentErrorLine = e.stack.split("\n")[1].split("(")[1];
                    var UrlParts = ParentErrorLine.split(".js");
                    ErrorFile = UrlParts[0] + ".js";
                    if (LineNumber === 0) {
                        LineNumber = UrlParts[1].replace(":", "").replace(")", "");
                    }
                    strMessage += "Error JS: " + ErrorFile + "\n\r";
                }
            } catch (e) {
                console.log("kGlobalErrorHandler failed");
            }
        }
        strMessage += "**************\n";
        console.log(strMessage);
       // alert(strMessage);
       // BKJSShared.ErrorMode = true;
    },
    NotNullOrUndefined: function (varToCheck) {
        if (varToCheck === null) {
            return false;
        } else {
            if (varToCheck === undefined) {
                return false;
            }
        }
        return true;
    },
    NotEmptyString: function (varToCheck) {
        if (BKJSShared.NotNullOrUndefined(varToCheck) === true) {
            if (varToCheck != "") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    //ReturnMaxNumberFromArray: function (Array) {
    //    if (BKJSShared.NotNullOrUndefined(Array)) {
    //        return Math.max(...Array);
    //    }
    //},
    GetQueryParameterByName: function (name) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(window.location.href);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.GetQueryParameterByName"); }
    },
    GetObjectByID: function (ObjectID, ObjectArray) {
        if (BKJSShared.ErrorMode === true) { return false; }
        var CurrObject = {}, i = 0;
        try {
            for (i; i < ObjectArray.length; i += 1) {
                CurrObject = ObjectArray[i];
                if (CurrObject.ID == parseInt(ObjectID)) {
                    return CurrObject;
                }
            }
            return null;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.GetObjectByID"); }
    },
    RemoveDuplicateValuesFromArray: function (Array) {
        var result = [];
        $.each(Array, function (i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;

    },
    exportTableToExcel: function (tableID, filename) {
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename ? filename + '.xls' : 'excel_data.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if (navigator.msSaveOrOpenBlob) {
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    },
    RemoveValueFromArray: function (Array, ValueToRemove) {
        var RectifiedArray = [];
        for (var i = 0; i < Array.length; i++) {
            if (Array[i] !== ValueToRemove) {
                RectifiedArray.push(Array[i]);
            }
        }
        return RectifiedArray;
        //return jQuery.grep(Array, function (value) {
        //    return value != ValueToRemove;
        //});
    },
    GetItemTypeForListName: function (ListName) {
        if (BKJSShared.NotEmptyString(ListName)) {
            var _metadata = "SP.Data." + ListName.charAt(0).toUpperCase() + ListName.split(" ").join("").slice(1) + "ListItem";
            _metadata = encodeURIComponent(_metadata);
            return _metadata;
        }
        //if (BKJSShared.NotEmptyString(ListName)) {
        //    ListName = encodeURIComponent(ListName);
        //    return "SP.Data." + ListName.charAt(0).toUpperCase() + ListName.split(" ").join("").slice(1) + "ListItem";
            
        //}
    },
    GetComboSelectedValueAndText: function (ComboId) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            var strSelectedText = $(ComboId + " option:selected").text();
            var strSelectedValue = $(ComboId).val();
            var objSelected = {}
            if (strSelectedText == "Select" || strSelectedText == "All") {
                objSelected["Value"] = 0;
                objSelected["Text"] = "";
            }
            else {
                objSelected["Value"] = strSelectedValue;
                objSelected["Text"] = strSelectedText
            }
            return objSelected;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.GetComboSelectedIdValue"); }
    },
    dynamicSort: function (property) {
        try {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                // next line works with strings and numbers, 
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            }
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.dynamicSort"); }
    },
    sortByMultipleKey: function (keys) {
        return function (a, b) {
            if (keys.length == 0) return 0; // force to equal if keys run out
            key = keys[0]; // take out the first key
            if (a[key] < b[key]) return -1; // will be 1 if DESC
            else if (a[key] > b[key]) return 1; // will be -1 if DESC
            else return sortByMultipleKey(keys.slice(1))(a, b);
        }
    },
    groupBy: function (objectArray, property) {
        return objectArray.reduce(function (acc, obj) {
            var key = obj[property];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});
    },
    SetCaptionColorStyle: function (RGBColorCode) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            //Returns black or white font color based on background color provided
            var r = 0, g = 0, b = 0, Parts = [], strResult = "", strColor = "", yiq = 0;
            Parts = RGBColorCode.split(',');
            r = parseInt(Parts[0], 10);
            g = parseInt(Parts[1], 10);
            b = parseInt(Parts[2], 10);
            yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            strColor = (yiq >= 128) ? 'Black' : 'White';
            return strColor;
        }
        catch (e) { BKJSShared.GlobalErrorHandler(e, "BKJSShared.SetCaptionColorStyle"); }
    },
    getRGBCodeFromHex: function (HexColorCode) {
        if (BKJSShared.ErrorMode === true) { return false; }
        try {
            var RGB = BKJSShared.hexToR(HexColorCode);
            RGB = RGB + "," + BKJSShared.hexToG(HexColorCode);
            RGB = RGB + "," + BKJSShared.hexToB(HexColorCode);
            //Returning RGB color code string
            return RGB;
        }
        catch (e) {
            BKJSShared.BKJSShared(e, "BKJSShared.getRGBCodeFromHex");
        }
    },
    hexToR: function (h) {
        return parseInt((BKJSShared.cutHex(h)).substring(0, 2), 16)
    },
    hexToG: function (h) {
        return parseInt((BKJSShared.cutHex(h)).substring(2, 4), 16)
    },
    hexToB: function (h) {
        return parseInt((BKJSShared.cutHex(h)).substring(4, 6), 16)
    },
    cutHex: function (h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    },
    CalculateAspectRatio: function (srcWidth, srcHeight, maxWidth, maxHeight) {
        if (srcWidth && srcHeight) {
            var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
            return { width: srcWidth * ratio, height: srcHeight * ratio };
        }
    },
    GetHostWebUrlFromCurrentAppWeb: function () {
        var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
        appWebUrl = appWebUrl.replace(appWebUrl.substring(appWebUrl.indexOf("-"), appWebUrl.indexOf(".")), "");
        return appWebUrl;
    },
    SetHostAndAppWebUrl: function () {
        if (BKJSShared.Application.isSPAddin) {
            BKJSShared.Application.appweburl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
            BKJSShared.Application.hostweburl = _spPageContextInfo.siteAbsoluteUrl.replace(_spPageContextInfo.siteAbsoluteUrl.substring(_spPageContextInfo.siteAbsoluteUrl.indexOf("-"), _spPageContextInfo.siteAbsoluteUrl.indexOf(".")), "");
        }
    },
    ActivateTab: function (tab) {
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    },
    NotificationMessage: {
        //dependent on toastr.js and toastr.css
        MessageTypes: {
            Warning: "warning",
            Success: "success"
        },
        ShowMessage: function (MessageType, MessageHeading, MessageDescription, ShowDuration) {
            var Duration = "300"
            if (ShowDuration) {
                Duration = ShowDuration
            }
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": true,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": true,
                "showDuration": Duration,
                "hideDuration": "1000",
                "timeOut": "3000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            }
            toastr[MessageType](MessageDescription, MessageHeading)
        }
    },
    UIControls: {
        autocomplete: function (inputElementID, DataObjectArray, PrimaryPropertyName, SecondaryPropertyName) {
            inputElementID = document.getElementById(inputElementID);
            var currentFocus;
            inputElementID.addEventListener("input", function (e) {
                var a, b, i, val = this.value;
                closeAllLists();
                if (!val) { return false; }
                currentFocus = -1;
                a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");
                this.parentNode.appendChild(a);
                for (i = 0; i < DataObjectArray.length; i++) {
                    if (DataObjectArray[i][PrimaryPropertyName].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                        b = document.createElement("DIV");

                        b.innerHTML = "<strong>" + DataObjectArray[i][PrimaryPropertyName].substr(0, val.length) + "</strong>";
                        b.innerHTML += DataObjectArray[i][PrimaryPropertyName].substr(val.length);
                        if (SecondaryPropertyName) {
                            b.innerHTML += '</br><small>' + DataObjectArray[i][SecondaryPropertyName] + '</small>';
                        }
                        b.innerHTML += "<input type='hidden' value='" + DataObjectArray[i][PrimaryPropertyName] + "'>";
                        b.addEventListener("click", function (e) {
                            inputElementID.value = this.getElementsByTagName("input")[0].value;
                            closeAllLists();
                        });
                        a.appendChild(b);
                    }
                }
            });

            inputElementID.addEventListener("keydown", function (e) {
                var x = document.getElementById(this.id + "autocomplete-list");
                if (x) x = x.getElementsByTagName("div");
                if (e.keyCode == 40) {
                    currentFocus++;
                    addActive(x);
                } else if (e.keyCode == 38) { //up
                    currentFocus--;
                    addActive(x);
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if (currentFocus > -1) {
                        if (x) x[currentFocus].click();
                    }
                }
            });
            function addActive(x) {
                if (!x) return false;
                removeActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                x[currentFocus].classList.add("autocomplete-active");
            }
            function removeActive(x) {
                for (var i = 0; i < x.length; i++) {
                    x[i].classList.remove("autocomplete-active");
                }
            }
            function closeAllLists(elmnt) {
                var x = document.getElementsByClassName("autocomplete-items");
                for (var i = 0; i < x.length; i++) {
                    if (elmnt != x[i] && elmnt != inputElementID) {
                        x[i].parentNode.removeChild(x[i]);
                    }
                }
            }
            document.addEventListener("click", function (e) {
                closeAllLists(e.target);
            });
        }
    },
    HTMLTableToExcel: function (TableId, FileName) {
        try {

            
            var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
            var textRange; var j = 0;
            var tab = document.getElementById(TableId); // id of table


            for (j = 0; j < tab.rows.length; j++) {
                tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
                //tab_text=tab_text+"</tr>";
            }

            tab_text = tab_text + "</table>";
            tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
            tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
            tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            var sa;
            var exceltoprow = '<table border="1">';

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
            {
                txtArea1.document.open("txt/html", "replace");
                txtArea1.document.write(tab_text);
                txtArea1.document.close();
                txtArea1.focus();
                sa = txtArea1.document.execCommand("SaveAs", true, FileName);
            }
            else {                //other browser not tested on IE 11
                var ExpType = 'excel';
                var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:" + ExpType + "' xmlns='http://www.w3.org/TR/REC-html40'>";
                excelFile += "<head>";
                excelFile += "<!--[if gte mso 9]>";
                excelFile += "<xml>";
                excelFile += "<x:ExcelWorkbook>";
                excelFile += "<x:ExcelWorksheets>";
                excelFile += "<x:ExcelWorksheet>";
                excelFile += "<x:Name>";
                excelFile += "{worksheet}";
                excelFile += "</x:Name>";
                excelFile += "<x:WorksheetOptions>";
                excelFile += "<x:DisplayGridlines/>";
                excelFile += "</x:WorksheetOptions>";
                excelFile += "</x:ExcelWorksheet>";
                excelFile += "</x:ExcelWorksheets>";
                excelFile += "</x:ExcelWorkbook>";
                excelFile += "</xml>";
                excelFile += "<![endif]-->";
                excelFile += "</head>";
                excelFile += "<body>";
                excelFile += tab_text;
                excelFile += "</body>";
                excelFile += "</html>";
                var blob = new Blob([excelFile], { type: "text/plain" });
                if (navigator.msSaveOrOpenBlob) {
                    // Works for Internet Explorer and Microsoft Edge
                    navigator.msSaveOrOpenBlob(blob, "download.xls");
                }
                else {
                    var blob1 = new Blob([excelFile], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                    saveAs(blob1, FileName);
                }
            }
            
        }
        catch (e) { console.log("Line: " + e.lineNo + " Error: " + e.message); }
    },
    GetCurrentPageName: function () {
        var url = window.location.pathname;
        var PageName = url.substring(url.lastIndexOf('/') + 1);  
        return PageName;
    }
};

