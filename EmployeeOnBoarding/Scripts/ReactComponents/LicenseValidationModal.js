"use strict";
let LicenseValidationModalComponent = null;
class LicenseValidationModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Type: "",
            OnCancel: this.props.OnCancel,
        };
        LicenseValidationModalComponent = this;
        this.Cancel = this.Cancel.bind(this);
    }
    componentDidMount() {
        var isExist = JSON.parse(localStorage.getItem("BKEOBCustomerLicense"));
        if (BKJSShared.NotNullOrUndefined(isExist)) {
            LicenseValidationModalComponent.setState({ Type: isExist.LicenseType });
        }
        var modal = document.getElementById("LicenseModal");
        modal.style.display = "block";
        $("#LicenseModal").css("z-index", "999");
        EOBConstants.SetNewThemeColor()
    }
    Cancel() {
        $("#loading").hide();
        var modal = document.getElementById("LicenseModal");
        modal.style.display = "none";
        this.props.OnCancel()
    }
    BuyNow() {
        window.open("https://www.beyondintranet.com/employeeonboarding#VersionComparisons", "_blank")
    }
    render() {
        return (
            <div>
                <div id="LicenseModal" className="modalReact pt-3">
                    <div className="modal-contentReact">
                        <div className="row modal-body">
                            <div className="col-12 text-center p-0 mt-2">
                                <a className="d-block" href="https://www.beyondintranet.com/employeeonboarding#VersionComparisons" target='_blank'><img className="img-fluid" src="../images/your_license_has_expired.jpg" /> </a>
                                {LicenseValidationModalComponent.state.Type == 'Trial' ?
                                    <p className="f-18 f-w-medium mt-4">You have reached the maximum limit of onboarding new employees or your '{LicenseValidationModalComponent.state.Type}' license has expired and must be updated. <a href='http://www.beyondintranet.com/employeeonboarding#VersionComparisons' target='_blank' className="text-primary">update license</a> to continue using this product.</p>

                                    : <p className="f-18 f-w-medium mt-4">Your license has expired and must be updated. <a href='http://www.beyondintranet.com/employeeonboarding#VersionComparisons' target='_blank' className="text-primary">update license</a> to continue using this product.</p>
                                }
                                    </div>
                        </div>
                        <div className="row modal-footer">
                            <div className="col-12 text-center">
                                <button className="btn btn-primary mr-2 btn-sm" onClick={LicenseValidationModalComponent.BuyNow}> Buy Now</button>
                                <button className="btn btn-light btn-sm" onClick={LicenseValidationModalComponent.Cancel} > Cancel </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
