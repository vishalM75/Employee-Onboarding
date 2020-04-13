function ColumnProperties(InternalName, DisplayName, ColumnWidth, ColumnVisibility, AllowSorting, DataType, DateFormat, IsLookup, LookupColumn, ValueCheckFunction, PeopleMultiValues, isNotSPColumn ) {
    if (!PeopleMultiValues) { PeopleMultiValues = true };
    var MyObj = {};
    MyObj.InternalName = InternalName;
    MyObj.DisplayName = DisplayName;
    MyObj.ColumnWidth = ColumnWidth;
    MyObj.DataType = DataType;
    MyObj.IsLookup = IsLookup;
    MyObj.LookupColumn = LookupColumn;
    MyObj.DateFormat = DateFormat;
    MyObj.ColumnVisibility = ColumnVisibility;
    MyObj.AllowSorting = AllowSorting;
    MyObj.CustomValueCheck = ValueCheckFunction;
    MyObj.PeopleMultiValues = PeopleMultiValues;
    if (BKJSShared.NotNullOrUndefined(isNotSPColumn)) {
        MyObj.isNotSPColumn = isNotSPColumn;        
    }
    else {
        MyObj.isNotSPColumn = false;    
    }
  
    return MyObj;
}
function LookupColumnProperties(InternalName, DisplayName, ColumnWidth, ColumnVisibility, AllowSorting, DataType, DataFormat) {
    var MyObj = {};
    MyObj.InternalName = InternalName;
    MyObj.DisplayName = DisplayName;
    MyObj.ColumnWidth = ColumnWidth;
    MyObj.DataType = DataType;
    return MyObj;
}
function GroupByOptions(InternalName, DisplayName) {
    var MyObj = {};
    MyObj.InternalName = InternalName;
    MyObj.DisplayName = DisplayName;
    return MyObj;
}
function GridProperties(GridName, ListName, ColumnProps, FilterText, SortText, AllowPagination, PageSize, ClassRules, IsEdit, IsDelete, IsView, EditEventHandler, DeleteEventHandler, LinkEventHandler, AfterRender, IncludeAttachments, ShowGrouping, GroupedBy, HeaderTitleClass, HandleDataModifications, GroupByOptions, isEditCheckFunction,CustomColumns) {
    var MyObj = {};
    MyObj.GridName = GridName;
    MyObj.ListName = ListName;
    MyObj.ColumnProps = ColumnProps;
    MyObj.FilterText = FilterText;
    MyObj.SortText = SortText;
    MyObj.AllowPagination = AllowPagination;
    MyObj.PageSize = PageSize;
    MyObj.ClassRules = ClassRules;
    MyObj.IsEdit = IsEdit;
    MyObj.IsDelete = IsDelete;
    MyObj.IsView = IsView;
    MyObj.EditEventHandler = EditEventHandler;
    MyObj.DeleteEventHandler = DeleteEventHandler;
    MyObj.LinkEventHandler = LinkEventHandler;
    MyObj.AfterRender = AfterRender;
    MyObj.IncludeAttachments = IncludeAttachments;
    MyObj.ShowGrouping = ShowGrouping;
    MyObj.GroupedBy = GroupedBy;
    MyObj.HandleDataModifications = HandleDataModifications;
    MyObj.GridHeaderTitleClass = HeaderTitleClass;
    MyObj.GroupByOptions = GroupByOptions;
    MyObj.CustomColumns = CustomColumns;
    if (BKJSShared.NotNullOrUndefined(isEditCheckFunction)) {
        MyObj.isEditCheckFunction = isEditCheckFunction;
    }
    return MyObj;
}

var ReactDataGridConstants = {
    ColumnTypes : {
        Text: "Text",
        RichText: "RichText",
        Boolean: "Boolean",
        User: "User",
        CustomHTMLControl: "CustomHTMLControl",
        Number:"Number"
    }
}

