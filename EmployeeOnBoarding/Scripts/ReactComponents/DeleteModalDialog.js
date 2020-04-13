"use strict";
let DeleteDialogComponenthis = null;
let ModalHeadingText = "";
let isEdit = false;
let nCurrentItemID = 0;
let nDeleteModalCurrentItemID = 0;
var DeleteItemCheckCounter = 0;
class DeleteDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deleteMessage: this.props.DeleteMessage,
            deleteFunction: this.props.DeleteFunction,
            handleDataUpdate: this.props.HandleDataUpdate,
            listName: this.props.ListName,
            deleteCheckData: this.props.DeleteCheckData,
            ModalHeading: this.props.ModalHeading,
            deleteItemID:this.props.DeleteItemID
        };
        DeleteItemCheckCounter = 0
        DeleteDialogComponenthis = this;
    }
    componentWillMount() {

    }
    componentDidMount() {
        var modal = document.getElementById("DeleteDialog");
        modal.style.display = "block";
        
        DeleteItemCheckCounter = 0;
        EOBConstants.SetNewThemeColor();
    }
    HandleUpdate() {
        DeleteDialogComponenthis.props.HandleDataUpdate();
    }
    UpdateEditStatus(ID) {
        nCurrentItemID = ID;
        isEdit = true;
    }
    CloseModal() {
        var modal = document.getElementById("DeleteDialog");
        modal.style.display = "none";
        
        isEdit = false;
        //nDeleteModalCurrentItemID = 0;        
        
        DeleteDialogComponenthis.props.HandleDataUpdate();
    }
  
    CheckDataBeforeDelete(ListDataPosition) {        
        if (DeleteDialogComponenthis.state.deleteCheckData) {
            var CounterPosition = null;
            if (typeof (ListDataPosition) !== "object") {
                CounterPosition = ListDataPosition
            }
            else {
                CounterPosition = 0;
            }
            var FirstItemCheck = DeleteDialogComponenthis.state.deleteCheckData[CounterPosition];
            BKSPShared.SPItems.isLookUpValueExistInOtherList(FirstItemCheck.ListName, FirstItemCheck.ValueToCheck, FirstItemCheck.ColumnInternalName, FirstItemCheck.LookupColumnInternalName, FirstItemCheck.LookUpExpandInternalName, DeleteDialogComponenthis._onValueFound, DeleteDialogComponenthis._onValueNotFound)
        }
        else {
            DeleteDialogComponenthis.DeleteItem();
        }
    }
    _onValueFound() {
        BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Warning, "Delete failed", "Item value exist in other list.")
    }
    _onValueNotFound() {
        DeleteItemCheckCounter = DeleteItemCheckCounter + 1;
        if (DeleteItemCheckCounter == DeleteDialogComponenthis.state.deleteCheckData.length) {
            DeleteDialogComponenthis.DeleteItem();
        }
        else {
            DeleteDialogComponenthis.CheckDataBeforeDelete(DeleteItemCheckCounter)
        }
        
    }
    DeleteItem() {
        let Url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + DeleteDialogComponenthis.state.listName + "')/Items(" + DeleteDialogComponenthis.state.deleteItemID + ")";
        BKJSShared.AjaxCall(Url, null, BKJSShared.HTTPRequestType.POST, BKJSShared.HTTPRequestMethods.DELETE, DeleteDialogComponenthis._onItemDeleteSuccess, DeleteDialogComponenthis._onItemDeleteFailed)
    }
    _onItemDeleteSuccess() {
        
        DeleteDialogComponenthis.CloseModal()
        DeleteDialogComponenthis.props.HandleDataUpdate();        
    }
    _onItemDeleteFailed(data) {
        if (data.status == 200) {
            BKJSShared.NotificationMessage.ShowMessage(BKJSShared.NotificationMessage.MessageTypes.Success, "Successfully deleted", "")
            DeleteDialogComponenthis.CloseModal();            
            DeleteDialogComponenthis.props.HandleDataUpdate();
            
        }
        else {
            console.log("Failed in updating item " + DeleteDialogComponenthis.state.deleteItemID)
        }
       
    }
    _onItemSave(data) {
        console.log(data);
    }
    _onItemSaveFailed(data) {
        DeleteDialogComponenthis.props.HandleDataUpdate();        
        console.log(data);
    }
    render() {
        return (




            <div id="DeleteDialog" className="modalReact">
                <div className="modal-contentReact">
                    <div>
                        <div className="row modal-head align-items-center">
                            <div id="CategoryHeadingDiv" className="col-10 SwitchTitleColor">
                                <p className="f-16 m-0 SwitchTitleColor" >{DeleteDialogComponenthis.state.ModalHeading}</p>
                            </div>
                            <div className="col-2 text-right">
                                <span className="closeModalReact SwitchTitleColor" onClick={DeleteDialogComponenthis.CloseModal}>&times;</span>
                            </div>
                        </div>
                        <div class="row modal-body">
                            <div className="col-12 text-center">
                                <p className="f-20">{"Are you sure want to delete?"}</p>
                            </div>
                        </div>
                        <div>
                            <div class="row modal-footer ">
                                <div className="col-12 text-center">
                                    <input type="Button" className="btn btn-primary SwitchTitleColor modalBtn" id={"DeleteModalBtn"} onClick={DeleteDialogComponenthis.CheckDataBeforeDelete} value="Yes" />
                                    <input type="Button" className="btn btn-light modalBtn" onClick={DeleteDialogComponenthis.CloseModal} value="No" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}
