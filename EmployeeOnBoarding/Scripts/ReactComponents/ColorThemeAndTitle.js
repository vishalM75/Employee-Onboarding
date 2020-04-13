"use strict";
let ThemeDialogComponenthis = null;
let ModalHeadingText = "";
let sCategoryHeadingString = ""
let gThemeColorHexCode = ""
let gOnBoardText = ""
let gOffBoardText = ""
class ColorThemeDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ModalHeading: this.props.ModalHeading
        };

        ThemeDialogComponenthis = this;
        //ThemeDialogComponenthis.SetNewThemeColor()
    }
    componentWillMount() {

    }
    componentDidMount() {
        var modal = document.getElementById("ThemeDialog");
        modal.style.display = "block";
        //Call function to add design on buttons
        ThemeDialogComponenthis.SetTextInElements();
    }
    HandleUpdate() {
        // CategoryDialogComponenthis.props.HandleDataUpdate();
    }
    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        isEdit = true;
    }
    CloseModal() {
        var modal = document.getElementById("ThemeDialog");
        modal.style.display = "none";
        isEdit = false;
        EOBConstants.SetNewThemeColor();
        ThemeDialogComponenthis.HandleUpdate()
        BKValidationShared.ResetValidation();
    }

    UpdateThemeAndTitle() {
        BKValidationShared.IdsToCheck.push("OnBoardTitleTxtBox");
        BKValidationShared.IdsToCheck.push("OffBoardTitleTxtBox");
        BKValidationShared.CheckValidations();
        if (!BKValidationShared.isErrorFree) { return }
        ConfigModal.gConfigSettings.ThemeColor = document.getElementById("ColorTxtBox");
        ConfigModal.gConfigSettings.ThemeColor = ConfigModal.gConfigSettings.ThemeColor.value;
        gOnBoardText = document.getElementById("OnBoardTitleTxtBox");
        gOffBoardText = document.getElementById("OffBoardTitleTxtBox");
        let ListTypeName = BKJSShared.GetItemTypeForListName(EOBConstants.ListNames.Configurations);
        var SaveData = {
            __metadata: { 'type': ListTypeName },
            "OnboardTitle": gOnBoardText.value,
            "OffboardTitle": gOffBoardText.value,
            "ThemeColor": ConfigModal.gConfigSettings.ThemeColor 
        }
        var RequestMethod = null;
        var Url = ""
        Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.Configurations + "')/Items(1)";
        RequestMethod = BKJSShared.HTTPRequestMethods.MERGE;
        BKJSShared.AjaxCall(Url, SaveData, BKJSShared.HTTPRequestType.POST, RequestMethod, ThemeDialogComponenthis._onItemSave, ThemeDialogComponenthis._onRestFailed)
    }
    SetNewThemeColor() {
        //$('.table thead tr').css("background-color", ColorHexCode.value)
        for (var i = 0; i < EOBConstants.EOBThemeElements.length; i++) {
            $(EOBConstants.EOBThemeElements[i]["ClassName"]).attr('style', EOBConstants.EOBThemeElements[i]["CssProperty"] + ":" + ConfigModal.gConfigSettings.ThemeColor + " !important");
            //$(EOBThemeElements[i]["ClassName"]).css(EOBThemeElements[i]["CssProperty"], (ColorHexCode.value ) )
        }
    }
    SetTextInElements() {
        $("#ColorTxtBox").val(ConfigModal.gConfigSettings.ThemeColor)
        $("#OnBoardTitleTxtBox").val(gOnBoardText)
        $("#OffBoardTitleTxtBox").val(gOffBoardText)
    }
    _onItemSave(data) {
        ThemeDialogComponenthis.SetNewThemeColor();
        ThemeDialogComponenthis.CloseModal();
    }
    _onItemGet(data) {
        gOffBoardText = data.d.OffboardTitle
        gOnBoardText = data.dOnboardTitle
        ConfigModal.gConfigSettings.ThemeColor = data.d.ThemeColor;
        ThemeDialogComponenthis.SetNewThemeColor();
        console.log(data)
    }
    _onRestFailed(data) {
        console.log(data);
    }
    render() {
        return (
            <div >
                <div id="ThemeDialog" className="modalReact">
                    <div className="modal-contentReact col-md-6 col-sm-8">
                        <div className="row modal-head align-items-center">

                            <div className="col-2 text-right">
                                <span className="closeModalReact" onClick={ThemeDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div class="modal-form">
                            <div className="form-group">
                                <label>Choose Color</label>
                                <input type="Color" id="ColorTxtBox" className="form-control" aria-describedby="colorName" />
                            </div>
                            <div className="form-group">
                                <label>Onboard Title</label>
                                <input type="text" id="OnBoardTitleTxtBox" className="form-control BKValidateEmptyValue" aria-describedby="colorName" />
                            </div>
                            <div className="form-group">
                                <label>OffBoard Title</label>
                                <input type="text" id="OffBoardTitleTxtBox" className="form-control BKValidateEmptyValue" aria-describedby="colorName" />
                            </div>
                            <div className="text-center">
                                <input type="Button" className="btn btn-primary" id={"ColorSaveBtn"} onClick={ThemeDialogComponenthis.UpdateThemeAndTitle} value={"Change"} />
                                <input type="Button" className="btn btn-light" onClick={ThemeDialogComponenthis.CloseModal} value="Cancel" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


