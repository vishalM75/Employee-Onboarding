"use strict";
let PageTitleComponent = null;

class PageTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageHeading: this.props.PageHeading
        };
        PageTitleComponent = this;
    }
    componentWillMount() {

    }
    componentDidMount() {
    }

    render() {
        return (
            <div className="contaner-fluid mb-4">
                <div className="row page-title align-items-center">
                    <div className="col-12">
                        <h1>{PageTitleComponent.state.pageHeading}</h1>
                    </div>
                </div>
            </div>
        );

    }
}
