"use strict";
let DepartmentComponenthis = null;
let isDialogOpened = false;
let isDeleteDialogOpened = false;
let sCurrentProcessType = "";
var HDefinition = {
    ID: "Number",
    OData__DepartmentName: "String",
    IsActive1: "Number"
}
var HDisplayNames = {
    ID: "ID",
    OData__DepartmentName: "Department Name",
    IsActive1: "Active"
}
class Department extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            DepartmentDialog: null,
            DeleteDialog: null,
        };
        DepartmentComponenthis = this;
        DepartmentComponenthis.DataGrid = React.createRef();
    }
    componentWillMount() {

    }
    componentDidMount() {
        DepartmentComponenthis.GetDepartmentTypes();
    }
    UpdateGrid() {
        DepartmentComponenthis.DataGrid.current.ReCreateGrid();
    }
    OpenAddDepartment(DataObject) {
        if (DataObject["ID"]) {
            //opened component 
            nDepartmentModalCurrentEditItemID = DataObject["ID"];
            $("#DepartmentAddSaveBtn").val("Edit")
            $("#DepartmentActiveChk").prop('checked', DataObject["Active"]);
            $("#DepartmentHeadingDiv").text("Edit Department")
            $("#DepartmentTxtBox").val(DataObject["Department Name"])
        }
        else {
            $("#DepartmentHeadingDiv").text("Add Department")
            $("#DepartmentActiveChk").prop('checked', true);
        }
        if (!isDialogOpened) {
            isDialogOpened = true;
            let Dialog = null;
            if (DataObject["ID"]) {

                Dialog = <DepartmentDialog isEdit={true} ModalHeading={"Edit Department"} DepartmentName={DataObject["Department Name"]} isActive={DataObject["Active"]} HandleDataUpdate={DepartmentComponenthis.UpdateGrid} ></DepartmentDialog>
            }
            else {
                Dialog = <DepartmentDialog isEdit={false} ModalHeading={"Add Department"} isActive={true} HandleDataUpdate={DepartmentComponenthis.UpdateGrid}></DepartmentDialog>
            }

            DepartmentComponenthis.setState({ DepartmentDialog: Dialog });
        }
        else {
            var modal = document.getElementById("DepartmentDialog");
            modal.style.display = "block";
        }
    }
    
    DeleteDepartment() {
        alert("DeletedFunction")
    }
    GetDepartmentTypes() {
        //var Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + EOBConstants.ListNames.ProcessType + "')/items";
        //BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestMethods.GET, false, DepartmentComponenthis._onProcessItemGet, DepartmentComponenthis._onRestCallFailure)
    }
    
    _onRestCallFailure(data) {
        console.log("Failed in getting process items.")
    }
    DeleteDepartment(DataObject) {
        nDeleteModalCurrentItemID = DataObject["ID"]
        if (!isDeleteDialogOpened) {
            isDeleteDialogOpened = true;
            let Dialog = null;
            Dialog = <DeleteDialog ListName={EOBConstants.ListNames.Department} DeleteMessage={"Test Deelete " + DataObject["ID"]} DeleteFunction={DepartmentComponenthis.DeleteDepartment} HandleDataUpdate={DepartmentComponenthis.UpdateGrid} ></DeleteDialog >
            DepartmentComponenthis.setState({ DeleteDialog: Dialog });
        }
        else {
            var modal = document.getElementById("DeleteDialog");
            modal.style.display = "block";
        }
    }
    render() {
       
        return (
            <div>
                <div>
                    <PageTitle PageHeading={"Manage Departments"} />
                </div>
                <div>
                    <div className="border-0 p-0">
                        <a herf="JavaScript:Void(0)" className="add-new" onClick={DepartmentComponenthis.OpenAddDepartment}><strong>+</strong> Add New Department</a>
                    </div>

                </div>
                <div>
                    <DataGrid ItemsPerPage={10} ListName={"Departmentlst"} HeaderDefinitions={HDefinition} HeaderDisplayNames={HDisplayNames} ActiveFieldInternalName={"Active"} GridID={"DepartmentGrid"} EnableEdit={true} EnableDelete={true} MinimumCharForSearch={1} SearchField={"OData__DepartmentName"} EditHandle={DepartmentComponenthis.OpenAddDepartment} DeleteHandle={DepartmentComponenthis.DeleteDepartment} ref={DepartmentComponenthis.DataGrid} ></DataGrid>
                </div>

                <div>
                    {DepartmentComponenthis.state.DepartmentDialog}
                    {DepartmentComponenthis.state.DeleteDialog}
                </div>
            </div>

        );

    }
}
const dom = document.getElementById("DepartmentMain");
ReactDOM.render(
    <Department />,
    dom
);  