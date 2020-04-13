<%@ Page Language="C#" MasterPageFile="~masterurl/default.master" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="viewport" content="width=device-width, initial-scale=0, shrink-to-fit=no">
    <meta name="WebPartPageExpansion" content="full" />
     
    <%--<script type="text/javascript" src="//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js"></script>--%>
    <script src="../Scripts/SharedLib/MicrosoftAjax.js"></script>
    <link rel="Stylesheet" type="text/css" href="../Content/toastr.css" />

    <script type="text/javascript" src="../Scripts/SharedLib/jquery-3.4.1.min.js"></script>

    
  <script type="text/javascript" src="../Scripts/SharedLib/toastr.min.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.6309.1208/init.js"></script>

    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/1053/sp.res.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.runtime.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.js"></script>
    <script type="text/javascript" src="https://static.sharepointonline.com/bld/_layouts/15/16.0.9005.1219/sp.init.js"></script>


    <SharePoint:ScriptLink Name="clientforms.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink Name="clientpeoplepicker.js" runat="server" LoadAfterUI="true" Localizable="false" />

    <script type="text/javascript" src="../Scripts/SharedLib/moment.min.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/react.development.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/react-dom.development.js"></script>
    <script  type="text/javascript" src="../Scripts/SharedLib/babel.min.js"></script>

    <script type="text/javascript" src="../Scripts/SharedLib/BKJSShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKSPShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKValidationShared.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKPeoplePickerRest.js"></script>
    <script  type="text/javascript" src="../Scripts/SharedLib/prop-types.min.js"></script>
   
    <script type="text/javascript" src="../Scripts/SharedLib/apexcharts_latest.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/react-apexcharts.iife.min.js"></script>
   
    <script type="text/javascript" src="../Scripts/Analytics/PageAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/Analytics/ExceptionAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/Analytics/ExceptionLogAnalytics.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKSPCustomerLicense.js"></script>
    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <link rel="Stylesheet" type="text/css"  href="../Content/bootstrap.min.css"  />
    <%--<link rel="Stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />--%>
    

    <link rel="Stylesheet" type="text/css" href="../Content/font-awesome.min.css" />
    <%--<link rel="Stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />--%>

    <script type="text/javascript" src="../Scripts/SharedLib/popper.min.js"></script>
    <%--<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>--%>
    
    <script type="text/javascript" src="../Scripts/SharedLib/bootstrap.min.js"></script>
    <%--<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>--%>

    <script type="text/javascript" src="../Scripts/JS/ConfigModal.js"></script>
    <script type="text/javascript" src="../Scripts/JS/EOBConstants.js"></script>
    <script type="text/babel" src="../Scripts/JS/EOBShared.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/ConfigurationSettings.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/MainHeaderConfig.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/MenuHeaderConfig.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/DataAnalyticsComponent.js"></script>
    <script type="text/javascript" src="../Scripts/SharedLib/BKUserConfig.js"></script>
    <script type="text/babel" src="../Scripts/ReactComponents/Footer.js"></script>
    
</asp:Content>

<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <%--<WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="full" Title="loc:full" />--%>
    <div id="MainHeaderConfig">
    </div>
    <div id="MenuHeaderConfig">
    </div>
    <div id="PageTitleConfig">
    </div>
    <div id="DataAnalyticsMain">
    </div>
    <div id="Footer">
    </div>
     <div id="loading">
         
        <img id="loading-image" src="../Images/loader.gif" alt="Loading..." />
    </div>
</asp:Content>
