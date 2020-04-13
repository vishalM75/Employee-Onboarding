/// <reference path="taskupdatemodal.js" />
"use strict";
let DataAnalyticsComponent = null;

class DataAnalyticsMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            BarChart: null,
            PageBarChart: null,
            UserTable: [],
            PageTable: [],
            FromDate: "",
            ToDate: "",
            ThemeColor: "",
            LoginUser: "",
        }
        DataAnalyticsComponent = this;
    }
    componentDidMount() {
        var today = new Date();
        var PreviousDate = new Date();
        PreviousDate.setDate(PreviousDate.getDate() - ConfigModal.gConfigSettings.AnalyticsRetentionPeriod);
        DataAnalyticsComponent.setState({ FromDate: PreviousDate, ToDate: today });  
        setTimeout(() => {
            this.GetUserChartData();
            this.GetPageChartData();
        }, 250);
        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip({
                trigger: 'hover'
            })
        });
    }
    GetUserChartData() {
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.UserAnalytics + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onUserBarChartValueSucess, this._onRestCallFailure);
    }
    GetPageChartData() {
        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.PageAnalytics + "')/items?$filter=AuthorId eq " + _spPageContextInfo.userId;
        var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.PageAnalytics + "')/items";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, this._onPageBarChartValueSucess, this._onRestCallFailure);
    }
    _onUserBarChartValueSucess(data) {
        if (data.d.results.length > 0) {
            var OptionsArray = [];
            var series = [];
            var dataArray = [];
            var counts = [];
            var DistinctDomain = {}
            for (var i = 0; i < data.d.results.length; i++) {
               //var CurrentDomain = data.d.results[i].Domain;
                var CurrentDomain = data.d.results[i].Title;
                if (CurrentDomain) {
                    if (DistinctDomain[CurrentDomain] == undefined) {
                        DistinctDomain[CurrentDomain] = 1;
                    }
                    else {
                        var CurrentCount = DistinctDomain[CurrentDomain]
                        DistinctDomain[CurrentDomain] = CurrentCount + 1
                    }
                }
            }
            dataArray = Object.values(DistinctDomain);
            OptionsArray = Object.keys(DistinctDomain)

            for (let [key, value] of Object.entries(DistinctDomain)) {
                var strobj = {
                    user: key,
                    hit: value
                }
                counts.push(strobj)
            }
            DataAnalyticsComponent.UserTable = counts;
            var optionObj = {
                plotOptions: {
                    bar: {
                        distributed: true
                    }
                },
                chart: {
                    id: "basic-bar",
                    toolbar: {
                        show: false,
                    },
                },
                xaxis: {
                    categories: OptionsArray.slice(0, 5)
                },
                tooltip: {
                    theme: 'dark',
                    x: {
                        show: false
                    },
                    y: {
                        title: {
                            formatter: function (val, opt) {
                                return opt.w.globals.labels[opt.dataPointIndex] 
                            },
                        }
                    }
                }
            }
            var obj = {
                name: "series-1",
                data: dataArray.slice(0, 5)
            }
            series.push(obj)
            const Chart = <div><ReactApexChart options={optionObj} series={series} type="bar" width="100%" /></div>
            DataAnalyticsComponent.setState({ BarChart: Chart })
        }
    }

    _onPageBarChartValueSucess(data) {
        if (data.d.results.length > 0) {
            var pageOptionsArray = [];
            var pageSeries = [];
            var pagedataArray = [];
            var counts = [];
            var DistinctPageDomain = {}
            for (var i = 0; i < data.d.results.length; i++) {
                var CurrentUrl = data.d.results[i].PageUrl;
                if (CurrentUrl) {
                    if (DistinctPageDomain[CurrentUrl] == undefined) {
                        DistinctPageDomain[CurrentUrl] = 1;
                    }
                    else {
                        var CurrentCount = DistinctPageDomain[CurrentUrl]
                        DistinctPageDomain[CurrentUrl] = CurrentCount + 1
                    }
                }
            }
            
            var AllKeys = Object.keys(DistinctPageDomain);
            var DAPageKey = _spPageContextInfo.webServerRelativeUrl + "/Pages/DataAnalytics.aspx"
            var isDAFound = false;
            for (var l = 0; l < AllKeys.length; l++) {
                var Page = AllKeys[l].split('Pages/')
                var PageName = Page[1].split(".");

                if (PageName[0].indexOf("DataAnalytics") > -1) {
                    isDAFound = true;
                    var CCount = DistinctPageDomain[DAPageKey] 
                    if (CCount) {
                        DistinctPageDomain[DAPageKey] = CCount + 1
                    }                   
                    break;
                }                
            }
            if (!isDAFound) {
               
                DistinctPageDomain[DAPageKey] = 1
                }
            
            pagedataArray = Object.values(DistinctPageDomain);
            //pageOptionsArray = Object.keys(DistinctPageDomain);
            for (let [key, value] of Object.entries(DistinctPageDomain)) {
                var s = key.split('Pages/')
                var d = s[1].split(".");
                pageOptionsArray.push(d[0]);              
                var strobj = {
                    url: d[0],//key,
                    hit: value
                }
                counts.push(strobj)
            }

            DataAnalyticsComponent.PageTable = counts;
            var optionObj = {
                plotOptions: {
                    bar: {
                        distributed: true
                    }
                },
                chart: {
                    id: "basic-bar",
                    toolbar: {
                        show: false,
                    },

                },
                xaxis: {
                    categories: pageOptionsArray.slice(0, 5)
                },
                 tooltip: {
                    theme: 'dark',
                    x: {
                        show: false
                    },
                    y: {
                        title: {
                            formatter: function (val, opt) {
                                return opt.w.globals.labels[opt.dataPointIndex] 
                            },
                        }
                    }
                }
            }
            var obj = {
                name: "series-1",
                data: pagedataArray.slice(0, 5)
            }
            pageSeries.push(obj)
            const Chart = <div><ReactApexChart options={optionObj} series={pageSeries} type="bar" width="100%" /></div>
            DataAnalyticsComponent.setState({ PageBarChart: Chart }, function () { $("#loading").addClass("d-none") })
        }
    }
    _onRestCallFailure(data) {
        console.log(data)
    }
    TableData() {
        return DataAnalyticsComponent.UserTable.map((item, index) => {
            return (
                <tr key={index}>
                    <td >{item.user}</td>
                    <td className="text-right">{item.hit}</td>
                </tr>
            )
        })
    }
    render() {
        return (
            <div>
                <div>
                    <MainHeaderConfig PageHeading={"Data Analytics"} />
                </div>
                <div>
                    <MenuHeader ActiveMenu={EOBConstants.MenuNames.DataAnalytics} />
                </div>
                <div >
                    <div className="filter-main">
                        <div className="row justify-content-left">
                            <div className="col-6">
                                <label><strong>Analytics Dashboard</strong></label>
                            </div>
                            <div className="col-6 text-right">
                                <label className="mr-3"><strong>From:</strong> {moment(DataAnalyticsComponent.state.FromDate).format('LL')}</label>
                                <label><strong>To:</strong> {moment(DataAnalyticsComponent.state.ToDate).format('LL')} <a herf="#" className="info-icon" data-toggle="tooltip" title="To set the duration go to Data Analytics Settings >>Analytics Retention Period under Configuration Settings."><i className="fa fa-info"></i></a></label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="tbl-bg-main mb-70">
                            <div className="row analaytics">
                                <div className="col-lg-6 col-md-12">
                                    <div className="graph-bg-main">
                                        <div className="graph-heading">Page Analaytics</div>
                                        <div className="mixed-chart col-12">
                                            {DataAnalyticsComponent.state.PageBarChart}
                                        </div>
                                        <div className="p-3 tbl-small">
                                            <div className="table-responsive-xl">
                                                <table className="table table-striped table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th className="SwitchTitleColor">Pages</th>
                                                            <th className="text-right SwitchTitleColor">Hits</th>
                                                        </tr>
                                                    </thead>
                                                    {DataAnalyticsComponent.PageTable != null ?
                                                        <tbody >

                                                            {DataAnalyticsComponent.PageTable.map((page, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td > {page.url}</td>
                                                                        <td className="text-right">{page.hit}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                            }
                                                        </tbody>
                                                        : null}
                                                </table>
                                            </div>
                                            {DataAnalyticsComponent.UserTable == null ? <b>No records found!</b> : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12">
                                    <div className="graph-bg-main">
                                        <div className="graph-heading">User Analaytics</div>
                                        <div className="mixed-chart col-12">
                                            {DataAnalyticsComponent.state.BarChart}
                                        </div>
                                        <div className="p-3 tbl-small">
                                            <div className="table-responsive-xl">
                                                <table className="table table-striped table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th className="SwitchTitleColor">Users</th>
                                                            <th className="text-right SwitchTitleColor">Count</th>
                                                        </tr>
                                                    </thead>
                                                    {DataAnalyticsComponent.UserTable != null ?
                                                        <tbody >
                                                            {DataAnalyticsComponent.UserTable.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td >{item.user}</td>
                                                                        <td className="text-right">{item.hit}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                            }
                                                        </tbody>
                                                        : null}
                                                </table>
                                            </div>
                                            {DataAnalyticsComponent.UserTable == null ? <b>No records found!</b> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const dom = document.getElementById("DataAnalyticsMain");
ReactDOM.render(
    <DataAnalyticsMain />,
    dom
);

