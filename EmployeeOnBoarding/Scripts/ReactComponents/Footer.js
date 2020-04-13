"use strict";
let FooterComponenthis = null;

class EOBFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            LicenseType: "",
            expiryDate: "",
            VersionNumber: "",
            AppVersion:this.props.AppVersion
        }
        FooterComponenthis = this;
    }
    componentDidMount() {
        var LicenseObject = localStorage.getItem("BKEOBCustomerLicense")
        if (LicenseObject !== null) {
            LicenseObject = JSON.parse(LicenseObject)
            
            var ExpiryDate = moment(LicenseObject.ExpiryDate).format("MM/DD/YYYY")
            FooterComponenthis.setState({ expiryDate: ExpiryDate });
            FooterComponenthis.setState({ VersionNumber: this.state.AppVersion });
            FooterComponenthis.setState({ LicenseType: LicenseObject.LicenseType });

        }

    }


    render() {
        return (
            <footer className="footer">
                <div className="pl-4 pr-4"><span className="m-0 pull-left">Copyright © Beyond Intranet</span>
                    <span className="pull-right"><b>&nbsp;Expiry: </b>{FooterComponenthis.state.expiryDate}</span>
                </div>
                <div className="pl-4 pr-4">
                    <span className="pull-right"><b>&nbsp;</b>({FooterComponenthis.state.VersionNumber})&nbsp;</span>
                    <span className="pull-right"><b>&nbsp; Version :</b> {FooterComponenthis.state.LicenseType}</span>
                </div>
            </footer>
        );

    }
}
var isDashBoard = BKJSShared.GetCurrentPageName();
if (isDashBoard.indexOf("Dashboard.aspx") == -1) {
    var LicenseObject = localStorage.getItem("BKEOBCustomerLicense")
    LicenseObject = JSON.parse(LicenseObject)
    const dom = document.getElementById("Footer");
    ReactDOM.render(
        <EOBFooter AppVersion={LicenseObject.AppVersion} />,
        dom
    );
}
  