"use strict";
var BKSPCustomerLicense = {
    LibVersion:"1.0.0.3",
    isUseStagingWebService: true,
    LicenseUrl: "https://userinfostage.azurewebsites.net/api/UserCheck/GetUserLicenseDetails/",
    ProductIDs: {
        "EmployeeOnBoarding": "1D56418B-35FB-4BF6-92BB-22B9D1A518AC"
    },
    ProductLocalStorageKeys: {
        "EmployeeOnBoarding": "BKEOBCustomerLicense"
    },
    CurrentProductIDKey: "",
    LicenseData: {
        LicenseType: "",
        NoOfUser: 0,
        IsTrialCompleted: false,
        ExpiryDate: "",
        ActivationDate: "",
        Trail: "",
        AppVersion: "",
        Domain: "",
        CreatedBy: "",
        CreatedDate: "",
        LicenseKey: "",
        Email:""
    },
    AfterLicenseGetCallBack: null,
    InitializeData: function () {
        BKSPCustomerLicense.SetWebServiceUrl();
        //BKSPCustomerLicense. .DomainName = (_spPageContextInfo.tenantDisplayName + "." + _spPageContextInfo.webDomain)
    },
    SetWebServiceUrl: function () {
        if (!BKSPCustomerLicense.isUseStagingWebService) {
            BKSPCustomerLicense.LicenseUrl = "http://userinfostaging.azurewebsites.net/api/userinfo/IsCustomerExists/"
        }
    },
    GetUserLicenseDetails: function (ProductID, isForceCheck, CallBack) {
        try {
            BKSPCustomerLicense.AfterLicenseGetCallBack = CallBack;
            $.each(BKSPCustomerLicense.ProductIDs, function (key, value) {
                if (value == ProductID) {
                    BKSPCustomerLicense.CurrentProductIDKey = key;
                }
            });

            if (isForceCheck) {
                BKSPCustomerLicense.FetchCustomerDetailsFromDB(ProductID);
            }
            else {
                if (localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys[BKSPCustomerLicense.CurrentProductIDKey]) == null) {
                    BKSPCustomerLicense.FetchCustomerDetailsFromDB(ProductID);
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    },
    FetchCustomerDetailsFromDB: function (ProductID) {
        BKSPCustomerLicense.InitializeData()
        var Domain = (_spPageContextInfo.tenantDisplayName + "." + _spPageContextInfo.webDomain)
        $.ajax({
            url: BKSPCustomerLicense.LicenseUrl + "?PId=" + ProductID + "&Domain=" + Domain,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (data) {
                    BKSPCustomerLicense._onLicenseGetSuccess(data)
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
            }
        });
    },
    IsLicenseExpired: function () {
        var LicenseObject = JSON.parse(localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys[BKSPCustomerLicense.CurrentProductIDKey]))
        if (LicenseObject !== null) {
            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            var currDate = Date.parse(utc);
            var ExpiryDate = new Date(LicenseObject.ExpiryDate);
            ExpiryDate = new Date(ExpiryDate);
            var utcTaskDueDate = new Date(ExpiryDate).toJSON().slice(0, 10).replace(/-/g, '/');
            ExpiryDate = Date.parse(new Date(utcTaskDueDate));
            if (ExpiryDate < currDate) {
                return true
            }
            else {
                return false;
            }
        }
    },
    IsLicenseTypeFreeOrTrial: function () {
        var LicenseObject = JSON.parse(localStorage.getItem(BKSPCustomerLicense.ProductLocalStorageKeys[BKSPCustomerLicense.CurrentProductIDKey]))
        if (LicenseObject !== null) {
            if (LicenseObject.LicenseType == "Trial" || LicenseObject.LicenseType == "Free") {
                return true
            }
            else {
                return false
            }
        }

    },
    _onLicenseGetSuccess: function (data) {
        if (data) {
            BKSPCustomerLicense.LicenseData.LicenseType = data[0].LicenseType;
            BKSPCustomerLicense.LicenseData.IsTrialCompleted = data[0].IsTrialCompleted;
            BKSPCustomerLicense.LicenseData.ExpiryDate = data[0].ExpiryDate;
            BKSPCustomerLicense.LicenseData.ActivationDate = data[0].ActivationDate;
            BKSPCustomerLicense.LicenseData.AppVersion = data[0].AppVersion;
            BKSPCustomerLicense.LicenseData.Domain = data[0].Domain;
            BKSPCustomerLicense.LicenseData.Email = data[0].Email;
            BKSPCustomerLicense.LicenseData.LicenseKey = data[0].LicenseKey;
            BKSPCustomerLicense.LicenseData.CreatedBy = data[0].CreatedBy;
            BKSPCustomerLicense.LicenseData.CreatedDate = data[0].CreatedDate;
            for (var i = 0; i < data.length; i++) {
                BKSPCustomerLicense.LicenseData[data[i]["Key"]] = data[i]["Value"]
            }
            localStorage.setItem(BKSPCustomerLicense.ProductLocalStorageKeys[BKSPCustomerLicense.CurrentProductIDKey], JSON.stringify(BKSPCustomerLicense.LicenseData));
            if (BKSPCustomerLicense.AfterLicenseGetCallBack) {
                BKSPCustomerLicense.AfterLicenseGetCallBack()
            }
        }
    }
}


