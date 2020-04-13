<%@ Page language="C#" MasterPageFile="~masterurl/default.master" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
     <meta name="WebPartPageExpansion" content="full" />


    <script src="../Scripts/SharedLib/MicrosoftAjax.js"></script>
     <%--<script type="text/javascript" src="//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js"></script>--%>

    <script type="text/javascript" src="../Scripts/SharedLib/jquery-3.4.1.min.js"></script>

    <script type="text/javascript" src="../Scripts/SharedLib/bootstrap-datepicker.js"></script>
    <%--<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.js"></script>--%>

     <SharePoint:ScriptLink Name="clientforms.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink Name="clientpeoplepicker.js" runat="server" LoadAfterUI="true" Localizable="false" />

    <SharePoint:ScriptLink ID="ScriptLink11" Name="autofill.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
   
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.6309.1208/init.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/1053/sp.res.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.runtime.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.init.js"></script>
    <%--<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>--%>
    <script type="text/javascript" src="../Scripts/SharedLib/moment.min.js"></script>
   <SharePoint:ScriptLink ID="ScriptLink4" Name="sp.core.js" runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink ID="ScriptLink6" Name="sp.userprofiles.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink ID="ScriptLink7" Name="sp.search.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
<%--<script type="text/javascript" src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
    <script type="text/javascript" src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>--%>
        <script type="text/javascript" src="../Scripts/SharedLib/react.development.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/react-dom.development.js"></script>

    <script type="text/javascript" src="../Scripts/SharedLib/prop-types.min.js"></script>
    <%--<script  type="text/javascript" src="https://unpkg.com/prop-types@15.6.2/prop-types.min.js"></script>--%>

    <script type="text/javascript" src="../Scripts/SharedLib/babel.min.js"></script>
    <%--<script type="text/javascript" src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>--%>

    <script type="text/javascript" src="../Scripts/SharedLib/apexcharts_latest.js"></script>
    <%--<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/apexcharts@latest"></script>--%>

    <script type="text/javascript" src="../Scripts/SharedLib/react-apexcharts.iife.min.js"></script>
  <%--<script type="text/javascript" src="https://unpkg.com/react-apexcharts@1.1.0/dist/react-apexcharts.iife.min.js"></script>--%>

    <script type="text/javascript" src="../Scripts/SharedLib/BKJSShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKSPShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKValidationShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/bk-peoplepickrlib.js"></script>
    <script type="text/javascript" src="../Scripts/Analytics/PageAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/Analytics/ExceptionAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/Analytics/ExceptionLogAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKSPCustomerLicense.js"></script>
    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
    <%--<link rel="Stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />--%>
    <link rel="Stylesheet" type="text/css"  href="../Content/bootstrap.min.css"  />
    <link  rel="Stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/css/datepicker.css"/>
    <link rel="Stylesheet" type="text/css" href="../Content/font-awesome.min.css" />
    <%--<link rel="Stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />--%>

    <script type="text/javascript" src="../Scripts/SharedLib/bootstrap.min.js"></script>
    <%--<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>--%>
    
    <script type="text/javascript" src="../Scripts/JS/ConfigModal.js"></script>
    <script type="text/javascript" src="../Scripts/JS/EOBConstants.js"></script>
    <script type="text/javascript" src="../Scripts/JS/EOBShared.js"></script>
    <script type="text/javascript" src="../Scripts/JS/GridShared.js"></script>
    
    <script type="text/babel" src="../Scripts/ReactComponents/MainHeaderConfig.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/LeftNavigation.js"></script>

    <script type="text/babel" src="../Scripts/ReactComponents/DeleteModalDialog.js"></script>
   
    <script type="text/babel" src="../Scripts/ReactComponents/DataGridComponent.js"></script>
     <script type="text/babel" src="../Scripts/ReactComponents/OverDueTasksByDepartment.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/MyTasks.js"></script>
   <script type="text/babel" src="../Scripts/ReactComponents/Footer.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKPeoplePickerRest.js"></script>
   
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
    <%--<WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="full" Title="loc:full" />--%>
     <div id="MainHeaderConfig">
    </div>
   
    <div id="PageTitleConfig">
    </div>
    <div id="MyTasksMain">

    </div>
    <div id="Footer">
    </div>
</asp:Content>
