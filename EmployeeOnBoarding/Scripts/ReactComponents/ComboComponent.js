"use strict";

let nTotalItemsCount = 0;
let nCurrentPageNumber = 1;
let nTotalPagesCount = 0;
let oCurrentViewGridData = [];
let arHeaderArray = [];
var optionsArray1 = []
class ComboMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comboProperties: this.props.ComboProperties,
            FilterString: ""
        };
        // this.setState({ FilterString: this.props.ComboProperties.FilterString });
        this.GetData = this.GetData.bind(this);
        this.ResetFilter = this.ResetFilter.bind(this);
        this.DataGetFailure = this.DataGetFailure.bind(this);
        this.FillValuesInCombo = this.FillValuesInCombo.bind(this);
        this._OnChange = this._OnChange.bind(this);
    }
    componentDidMount() {
        this.GetData("");
        if (this.state.comboProperties.ComboClass !== "") {
            $("#" + this.state.comboProperties.ComboId).addClass(this.state.comboProperties.ComboClass)
        }
    }
    GetData(strNewFilter) {

        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + this.state.comboProperties.ListName + "')/items";
        if (strNewFilter == "") {
            if (this.state.comboProperties.FilterString != undefined && this.state.comboProperties.FilterString != "") {
                Url = Url + "?&$filter=" + this.state.comboProperties.FilterString;
            }
        }
        else {
            Url = Url + "?&$filter=" + strNewFilter;
        }
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this.FillValuesInCombo, this.DataGetFailure)
    }
    DataGetFailure(data) {
        console.log(data);
    }
    ResetFilter(strFilter) {
        this.GetData(strFilter);
    }
    FillValuesInCombo(data) {

        var comboValues = [];
        var comboValuesHTML = ""
        $('#' + this.state.comboProperties.ComboId)
            .find('option')
            .remove()
            .end();

        if (this.state.comboProperties.FirstValueText != "") {
            var FirstValue = '<option value="0">' + this.state.comboProperties.FirstValueText + '</option>'
            $("#" + this.state.comboProperties.ComboId).append(FirstValue);
        }
        for (var k = 0; k < data.d.results.length; k++) {
            comboValuesHTML = '<option value="' + data.d.results[k]["ID"] + '">' + data.d.results[k][this.state.comboProperties.ColumnName] + "</option>"
            $("#" + this.state.comboProperties.ComboId).append(comboValuesHTML)
        }
        if (this.props.ComboProperties.SucessCallback) {
            this.props.ComboProperties.SucessCallback();
        }
    }
    _OnChange() {
        if (this.props.ComboProperties.OnChangeEvent) {
            this.props.ComboProperties.OnChangeEvent();
        }
    }
    render() {
        return (
            <div >
                <label className="ml-2px">{this.state.comboProperties.LableText}</label>
                <select multiple={false} onChange={this.props.ComboProperties.OnChangeEvent} id={this.state.comboProperties.ComboId} className="form-control form-control-sm">
                </select>
            </div>
        );

    }
}