(function () {

  var myFunctions = {};

  myFunctions.serialNumberValidation = function () {

    //alert('statedate :'+JSON.stringify(statedata));

    console.log("success");

    var statedata = mobile.getRecordFromState();

    console.log("statdata", statedata)

    var serial = mobile.getValueFromPage("serialScan_enterSerialTxt");

    var selectedSO = document.getElementById("serialScan_dynamicSO").innerText;
    console.log(selectedSO); // log output


    var serialObj = {
      "serial": serial,
      "sales_order_no": selectedSO,
    }

    var customRestletScriptId = 'customscript_cht_hrx_ns_wms_mobiel_app_s'; // RESTlet's Script ID
    var customRestletDeploymentId = 'customdeploy_cht_hrx_ns_wms_mobiel_app_s';// RESTlet's Deployment ID
    var customxhrResponseData = '';
    var customURL = '/app/site/hosting/restlet.nl?script='+customRestletScriptId+'&deploy='+customRestletDeploymentId+"&serial="+serial+"&sales_order="+selectedSO; //Bind the URL with the script and deployment id's
    
    var serialObjTxt = JSON.stringify(serialObj);
    console.log('Standard dataTxt :: ', serialObjTxt);

    var customxhr = new XMLHttpRequest(); 
        customxhr.open("GET", customURL, false);
        customxhr.setRequestHeader("Content-Type", "application/json");
        customxhr.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                customxhrResponseData = JSON.parse(customxhr.responseText);
                var dataObj = new Object();
                dataObj = JSON.parse(customxhrResponseData)
                console.log('customURL: customxhrResponseData: ',(JSON.parse(dataObj)).message);

                alert("Serial Number "+ serial+ " " + (JSON.parse(dataObj)).message);
                mobile.setValueInPage("serialScan_enterSerialTxt", "");

            }
        }
        customxhr.send(serialObjTxt);// Gets the updated State as a response from the custom RESTlet

   


  }


  return myFunctions;

}())
