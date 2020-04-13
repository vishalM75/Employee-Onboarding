"use strict";
//Shared libray to provide validation on controls
//Dependent on jQuery
//Element must have an ID to have vlidation enable
var BKValidationShared = {
    isErrorFree: null,
    RangeObject: [],
    ValidationElementsID: [],
    IdsToCheck: [],
    isOnkeyUpControlsErrorFree: true,
    CallBacks: {
        //Array for giving differnt callbacks for different controls
        CheckValidUrl: {}
    },
    validationClassNames: {
        //use this class names in your html or react to have validation enable.
        emailValidation: "BKValidateEmail",
        notEmptyValueValidation: "BKValidateEmptyValue",
        notANumberValueValidation: "BKValidateNoNumber",
        notInRangeValueValidation: "BKValidateInRange",
        notSpecialCharacters: "BKValidateSpecialCharacter",
        validUrl:"BKValidateURL"
    },
    validationMessages: {
        emailMessage: "Entered value is not a correct e-mail.",
        emptyValueMessage: "Required.",
        notANumberMessage: "Entered value is not a number.",
        notInRangeMessage: "Entered value is not in range.",
        notSpecialCharMessage: "Value should not contain special characters .",
        notValidUrl: "Entered value is not a correct URL."
    },
    validationMethods: {
        ValidateEmail: function (Control) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var id = Control.id + "ValidateEmail";
            BKValidationShared.ValidationElementsID.push(id);
            if (!regex.test(Control.value) && (Control.value != '')) {
                var is = $("#" + id)
                if (is.length > 0) {
                    // is.innerHTML = ""
                } else {
                    $(Control).after("<div  style='color:red;' id=" + id + ">" + BKValidationShared.validationMessages.emailMessage + "</div>")

                }
                BKValidationShared.isErrorFree = false;
            } else {
                $("#" + id).remove()
            }
        },
        ValidateSpecialChar: function (Control) {
            var NotAllowedSpecialChar = ['$', '&', '+', ',', '/', ':', ';', '=', '?', '@', '"', '<', '>', '#', '%', '{', '}', '|', '^', '[', ']', '`', '*'];
            var isSpecialCharFound = false;
            var id = Control.id + "ValidateSpecialChar";
            if (Control.value) {
                for (var i = 0; i < NotAllowedSpecialChar.length; i++) {
                    if (Control.value.indexOf(NotAllowedSpecialChar[i]) > -1) {
                        isSpecialCharFound = true;
                        break;
                    }
                }
            }
            if (isSpecialCharFound) {
                var is = $("#" + id)
                if (is.length > 0) {
                    // is.innerHTML = ""
                } else {
                    $(Control).after("<div  style='color:red;' id=" + id + ">" + BKValidationShared.validationMessages.notSpecialCharMessage + "</div>")

                }
                BKValidationShared.isErrorFree = false;
            }
            else {
                $("#" + id).remove()
            }



        },
        ValidateNotEmpty: function (Control) {
            var id = Control.id + "ValidateNotEmpty";
            BKValidationShared.ValidationElementsID.push(id);
            if (Control.value == "") {
                var is = $("#" + id)
                if (is.length > 0) {
                    // is[0].innerHTML = ""
                } else {
                    $(Control).after("<div  style='color:red;' id=" + id + ">" + BKValidationShared.validationMessages.emptyValueMessage + "</div>");
                }
                BKValidationShared.isErrorFree = false;
            } else {
                $("#" + id).remove()
            }
        },
        ValidateNumberOnly: function (Control) {
            var id = Control.id + "ValidateNumberOnly";
            BKValidationShared.ValidationElementsID.push(id);
            if (!$.isNumeric(Control.value)) {
                var is = $("#" + id)
                if (is.length > 0) {
                    // is.innerHTML = ""
                } else {
                    $(Control).after("<div style='color:red;' id=" + id + ">" + BKValidationShared.validationMessages.notANumberMessage + "</div>");
                }
                BKValidationShared.isErrorFree = false;
            } else {
                $("#" + id).remove()
            }
        },
        ValidateNumberRange: function (Control, StartRange, EndRange) {
            var id = Control.id + "ValidateNumberRange";
            BKValidationShared.ValidationElementsID.push(id);
            if (!BKValidationShared.validationMethods.CheckRange(Control.value, StartRange, EndRange)) {
                var is = $("#" + id)
                if (is.length > 0) {
                    //is.innerHTML = ""
                } else {
                    $(Control).after("<div  style='color:red;' id=" + id + ">" + BKValidationShared.validationMessages.notInRangeMessage + "</div>")
                }
                BKValidationShared.isErrorFree = false;
            } else {
                $("#" + id).remove()
            }
        },
        CheckRange: function (Value, nStart, nEnd) {
            if (Value == "") {
                return false;
            }
            if (Value >= nStart && Value <= nEnd) {
                return true;
            } else {
                return false;
            }
        },
        SetRangeOnControls: function (Control, Max, Min) {
            var RangeObject = {};
            RangeObject["Control"] = Control;
            RangeObject["Max"] = Max;
            RangeObject["Min"] = Min;
            BKValidationShared.RangeObject.push(RangeObject);
        },
        ValidateURL: function (Control) {
            var ControlValue = $("#" + Control.id).val();
            var id = Control.id + "ValidateUrl";
            BKValidationShared.ValidationElementsID.push(id);
            if (BKJSShared.NotEmptyString(ControlValue)) {
                var isValidUrl = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(ControlValue);

                if (isValidUrl) {
                    $("#" + id).remove()
                   // BKValidationShared.isOnkeyUpControlsErrorFree = true;
                }
                else {

                    var is = $("#" + id)
                    if (is.length > 0) {
                        // is[0].innerHTML = ""
                    } else {
                        $(Control).after("<div  style='color:red;' id=" + id + ">Entered value is not a valid URL.</div>");
                        BKValidationShared.isErrorFree = false;
                    }
                }
            }
            else {
                $("#" + id).remove()
             
            }            
        }
    },
    InitValidation: function () {
        $("." + BKValidationShared.validationClassNames.emailValidation).focusout(BKValidationShared.validationMethods.ValidateEmail)
        $("." + BKValidationShared.validationClassNames.notEmptyValueValidation).focusout(BKValidationShared.validationMethods.ValidateNotEmpty)
        $("." + BKValidationShared.validationClassNames.notANumberValueValidation).focusout(BKValidationShared.validationMethods.ValidateNumberOnly)
        $("." + BKValidationShared.validationClassNames.notSpecialCharacters).focusout(BKValidationShared.validationMethods.ValidateSpecialChar)
        //Call like this to provide variable range in your controls
        $("." + BKValidationShared.validationClassNames.notInRangeValueValidation).focusout(function () {
            BKValidationShared.validationMethods.ValidateNumberRange(this, 1, 100)
        })
    },
    CheckValidations: function () {
        BKValidationShared.isErrorFree = true;
        BKValidationShared.CheckNotEmptyValidation();
        BKValidationShared.CheckEmailValidation();
        BKValidationShared.CheckNotANumberValidation();
        BKValidationShared.CheckRangeValidation();
        BKValidationShared.CheckSpecialCharacterValidation();
        BKValidationShared.CheckValidUrl();
    },
    CheckNotEmptyValidation: function () {
        var Nodes = $("." + BKValidationShared.validationClassNames.notEmptyValueValidation);
        for (var i = 0; i < Nodes.length; i++) {
            let isValidate = BKValidationShared.IsElementToBeValidate(Nodes[i].id)
            if (isValidate) {
                BKValidationShared.validationMethods.ValidateNotEmpty(Nodes[i]);
            }
        }
    },
    IsElementToBeValidate: function(ElementId) {
        var IsIDToBeValidate = false;
        if (BKValidationShared.IdsToCheck.length > 0) {
            for (var k = 0; k < BKValidationShared.IdsToCheck.length; k++) {
                if (ElementId == BKValidationShared.IdsToCheck[k]) {
                    IsIDToBeValidate = true;
                    break;
                }
            }
        }
        else {
            IsIDToBeValidate = true;
        }
        return IsIDToBeValidate;
    },
    CheckEmailValidation: function () {
        var Nodes = $("." + BKValidationShared.validationClassNames.emailValidation);
        for (var i = 0; i < Nodes.length; i++) {
            BKValidationShared.validationMethods.ValidateEmail(Nodes[i]);
        }
    },
    CheckNotANumberValidation: function () {
        var Nodes = $("." + BKValidationShared.validationClassNames.notANumberValueValidation);
        for (var i = 0; i < Nodes.length; i++) {
            BKValidationShared.validationMethods.ValidateNumberOnly(Nodes[i]);
        }
    },
    CheckRangeValidation: function () {
        for (var i = 0; i < BKValidationShared.RangeObject.length; i++) {
            BKValidationShared.validationMethods.ValidateNumberRange(BKValidationShared.RangeObject[i].Control[0], BKValidationShared.RangeObject[i].Max, BKValidationShared.RangeObject[i].Min);
        }
    },
    CheckSpecialCharacterValidation: function () {
        var Nodes = $("." + BKValidationShared.validationClassNames.notSpecialCharacters);
        for (var i = 0; i < Nodes.length; i++) {
            BKValidationShared.validationMethods.ValidateSpecialChar(Nodes[i]);
        }
    },
    ResetValidation: function () {
        for (var i = 0; i < BKValidationShared.ValidationElementsID.length; i++) {
            $("#" + BKValidationShared.ValidationElementsID[i]).remove()
        }
        BKValidationShared.ValidationElementsID = [];
        BKValidationShared.IdsToCheck = [];
        BKValidationShared.isErrorFree = null;
    },
    CheckValidUrl: function () {
        var Nodes = $("." + BKValidationShared.validationClassNames.validUrl);
        for (var i = 0; i < Nodes.length; i++) {
            BKValidationShared.validationMethods.ValidateURL(Nodes[i]);
        }
    },
    //Standalone methods to be use at onKeyPress
    IndividualValidationMethods: {
        CheckSpecialChar: function (Control) {
            //use this as onkey event on your control
            var NotAllowedSpecialChar = ['$', '&', '+', ',', '/', ':', ';', '=', '?', '@', '"', '<', '>', '#', '%', '{', '}', '|', '^', '[', ']', '`', '*'];
            var ControlValue = $("#" + Control.currentTarget.id).val()
            if (ControlValue) {
                for (var i = 0; i < NotAllowedSpecialChar.length; i++) {
                    if (ControlValue.indexOf(NotAllowedSpecialChar[i]) > -1) {
                        ControlValue = ControlValue.replace(NotAllowedSpecialChar[i], "")
                        $("#" + Control.currentTarget.id).val(ControlValue)
                    }
                }
            }
        },
        CheckValidUrl: function (Control) {
            var ControlValue = $("#" + Control.currentTarget.id).val();
            var id = Control.currentTarget.id + "ValidateUrl";
            if (BKJSShared.NotEmptyString(ControlValue)) {
                var isValidUrl = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(ControlValue);

                if (isValidUrl) {
                    $("#" + id).remove()
                    BKValidationShared.isOnkeyUpControlsErrorFree = true;
                }
                else {

                    var is = $("#" + id)
                    if (is.length > 0) {
                        // is[0].innerHTML = ""
                    } else {
                        $("#" + Control.currentTarget.id).after("<div  style='color:red;' id=" + id + ">Entered value is not a valid URL.</div>");
                        BKValidationShared.isOnkeyUpControlsErrorFree = false;
                    }
                }
            }
            else {
                $("#" + id).remove()
                BKValidationShared.isOnkeyUpControlsErrorFree = true;
            }
            var CurrentControlCallBack = BKValidationShared.CallBacks.CheckValidUrl[Control.currentTarget.id]
            if (CurrentControlCallBack) {
                CurrentControlCallBack();
            }
        }
    }
};
