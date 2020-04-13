"use strict";
class EmailTemplateTile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            TemplateType: this.props.TemplateType,
            Subject: this.props.Subject,
            TemplateBody: this.props.TemplateBody,
            isActive: this.props.isActive,
            TemplateID:this.props.ID,
            DeleteDialog: null,
            EditDialog: null,
        }
        this.OpenEditDialog = this.OpenEditDialog.bind(this);
        this.CloseDialog = this.CloseDialog.bind(this);
        this.UpdateTile = this.UpdateTile.bind(this);
    }
    componentWillMount() {

    }
    componentDidMount() {
        let Color = BKJSShared.SetCaptionColorStyle(BKJSShared.getRGBCodeFromHex(ConfigModal.gConfigSettings.ThemeColor));
        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
        EOBConstants.SetNewThemeColor();
    }

    OpenEditDialog() {
        let Dialog = null;
        if (this.state.TemplateID) {
            Dialog = <EmailTemplateDialog isEdit={true} EditID={this.state.TemplateID} ButtonText={"Update"}  isActive={null} ModalHeading={"Edit Email Template"} HandleDataUpdate={this.UpdateTile}></EmailTemplateDialog>
        }

        this.setState({ EditDialog: Dialog });
    }
    CloseDialog() {

    }
    UpdateTile(DataObject) {
        if (DataObject) {
            var ActiveStatus = (DataObject["IsActive1"]) ? "Active" : "In Active"
             
            this.setState({ Subject: DataObject["Subject"] })
            this.setState({ TemplateBody: DataObject["EmailTemplate"] })
            this.setState({ isActive: ActiveStatus })
        }
        this.setState({ EditDialog: false });
    }
  
   
    render() {

        return (
            <div class="col-lg-4 col-md-6 email-template-main">
                <div className="col-12 email-template-bg">
                    <div className="row email-head">
                        <div className="col-10">
                            <h6 className="m-0 SwitchTitleColor">{this.state.TemplateType}</h6>
                        </div>
                        <div className="col text-right">
                            <a herf="#" className="f-16" onClick={this.OpenEditDialog} ><i className="fa fa-pencil SwitchTitleColor"></i></a>
                        </div>
                    </div>
                    <div className="row pt-2">
                        <div className="col-lg-4 col-md-5">
                            <p className="mb-2"><strong>Subject</strong></p>
                        </div>
                        <div className="col-lg-8 col-md-7">
                            <p className="mb-2">{this.state.Subject}</p>
                        </div>
                        <div className="col-lg-4 col-md-5">
                            <p className="mb-2"><strong>Status</strong></p>
                        </div>
                        <div className="col-lg-8 col-md-7">
                            <p className="mb-2">{this.state.isActive}</p>
                        </div>
                    </div>
                    <div className="row email-template-body">
                        <div className="EmailTemplateTileContainer" dangerouslySetInnerHTML={{ __html: this.state.TemplateBody }}></div>
                    </div>
                </div>
                {this.state.EditDialog}
            </div>
        );

    }
}

