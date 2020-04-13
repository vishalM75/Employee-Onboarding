"use strict";
let LeftNavigationComponent = null;
class Leftnavigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        LeftNavigationComponent = this;
    }
    componentWillMount() {

    }
    componentDidMount() {

    }
    render() {
        return (
            <div>
                <div id="demo" className="sidebar sidebar-sticky sidebar-bg collapse show">
                    <div className="sidebar-body">
                        <div className="row mt-4">
                            <div className="col-12">
                                <h6 className="sidebar-heading">Filters</h6>
                            </div>
                            <div className="col-12">
                                <div className="form-group input-with-icon">
                                    <label>From Date</label>
                                    <input type="text" id="dtFromPicker" className="form-control form-control-sm" />
                                    <div className="input-icon">
                                        <a herf="#"><i className="fa fa-calendar"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group input-with-icon">
                                    <label>To Date</label>
                                    <input type="text" id="dtToPicker" className="form-control form-control-sm" />
                                    <div className="input-icon">
                                        <a herf="#"><i className="fa fa-calendar"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Process</label>
                                    <select id="ddDashBoardProcess" onChange={DashboardComponent._UpdateSearchIcon} class="form-control form-control-sm">
                                        <option></option>
                                        <option>Onboarding</option>
                                        <option>Offboarding</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Employee</label>
                                    <input type="text" id="txtEmployeeName" onChange={DashboardComponent._UpdateSearchIcon} className="form-control form-control-sm" />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Assigned To</label>
                                    <div id="userpicker"></div>

                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group">
                                    <label>Department</label>
                                    <select id="ddDepartments" onChange={DashboardComponent._UpdateSearchIcon} class="form-control form-control-sm">
                                        {this.state.DepartmentOptions}
                                    </select>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group big-check-box mt-2">
                                    <div className="custom-control custom-checkbox">
                                        <input id="chkMyTask" type="checkbox" onChange={DashboardComponent._UpdateSearchIcon} className="custom-control-input" />
                                        <label className="custom-control-label" for="chkMyTask">My Task</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group mt-4">
                                    <button type="Button" className="btn btn-primary btn-sm mw-auto mr-2 modalBtn" onClick={this.FilterGridTasks}><i id="dashboardFilterIcon" className="fa fa-search active SwitchTitleColor"></i></button>
                                    <button type="Button" className="btn btn-light btn-sm mw-auto"><i className="fa fa-refresh"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
