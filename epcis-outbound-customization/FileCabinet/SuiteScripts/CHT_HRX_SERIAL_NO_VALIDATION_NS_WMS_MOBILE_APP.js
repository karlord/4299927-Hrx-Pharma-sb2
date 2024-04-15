/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/https', 'N/error', 'SuiteScripts/LC/lib/moment.js'], function (record, search, https, error, moment) {
    function get(context) {
           
            var headerObj = {
                name: 'Accept-Language',
                value: 'en-us',
                "x-api-key": "qwertyuiop[]1234567890zxcvbnm,./",
                "Allow": "POST, OPTIONS",
                "Content-Type": "application/json"

            };

            var postdata = new Object();
            var currentDate = moment().format(`YYYY-MM-DD`);

            postdata = {
                "serial_number": context.serial,
                "event_time": `${currentDate}:08:48.534Z`,
                "event_timezone_offset": "+00:00"
            }

            log.debug(`DEBUG postdata`, JSON.stringify(postdata));

            // log.debug("context", context);
            log.debug('Context => Params', JSON.stringify({
                serial: context.serial,
                sales_order_number: (context.sales_order.split('|')[0]) ? context.sales_order.split('|')[0].trim() : context.sales_order.split('|')[0],
                sales_order_internalId: (context.sales_order.split('|')[1]) ? context.sales_order.split('|')[1].trim() : context.sales_order.split('|')[1],
            }));

            var salesOrderId = (context.sales_order.split('|')[1]) ? context.sales_order.split('|')[1].trim() : context.sales_order.split('|')[1];

            //Double check if EPCIS was Enabled for this Order
            if(salesOrderId){
                try{

                    var soInformation = search.lookupFields({
                       type: search.Type.SALES_ORDER,
                       id: salesOrderId, 
                       columns: ['custbody_hrx_toggle_epcis', 'entity', 'tranid'],
                    });

                    log.debug(`Debug SO_INFORMATION`, soInformation);

                    if(soInformation.custbody_hrx_toggle_epcis == 'T' || soInformation.custbody_hrx_toggle_epcis === true){
                        //ENABLE WMS > SCM > EPCIS > SERIAL VALIDATION
                        log.debug(`ENABLE WMS > SCM > EPCIS > SERIAL VALIDATION`, soInformation.custbody_hrx_toggle_epcis);
                    }
                    else{
                        //DISABLE WMS > SCM > EPCIS > SERIAL VALIDATION
                        log.debug(`DISABLE WMS > SCM > EPCIS > SERIAL VALIDATION`, soInformation.custbody_hrx_toggle_epcis);
                    }

                }
                catch(e){
                    log.debug(`Unhandled Error => getting SO Info`, JSON.stringify(e));
                }
            }

            log.debug("success", "success");


            var response = https.post({
                url: 'https://epcis-test.hrxstaging.com/event/packing-events/',
                headers: headerObj,
                body: JSON.stringify(postdata),
            });

            // url: 'https://epcis-dev.hrxstaging.com/packing-events/',

            log.debug("response", response);
            log.debug("RESPONSE", response.code);
          

            if(response.code != 200)
            {
               return JSON.stringify(response.body)
            }
         
           



      
    }

    /*
    purchaseorderSearchObj.id="customsearch1688395628133";
    purchaseorderSearchObj.title="Custom Transaction Search 5 (copy)";
    var newSearchId = purchaseorderSearchObj.save();
    */






    return {
        get: get
    };
});