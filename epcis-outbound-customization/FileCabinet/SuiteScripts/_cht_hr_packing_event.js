/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * Task          Date                Author                                         Remarks
 * DT-0000      23 AUG 2023        RAVI BHUSHAN                                 packing event API
*/
define(['N/record', 'N/https', 'N/search','N/error'],

    function (record, https, search,error) {



        function afterSubmit(context) {


            var oldRecord = context.oldRecord;

            var record_so = record.load({ type: "itemfulfillment", id: context.newRecord.id, isDynamic: true });

            var status_old = oldRecord.getValue("status")

            var status = record_so.getValue({ fieldId: "status" });

            log.debug("status_old", status_old)

            log.debug("status", status)

            log.debug("status", status);

            var headerObj = {
                name: 'Accept-Language',
                value: 'en-us',
                "x-api-key": "qwertyuiop[]1234567890zxcvbnm,./",
                "Allow": "POST, OPTIONS",
                "Content-Type": "application/json"

            };

            var postdata = new Object();

            postdata = {
                "event_time": "2022-12-22T13:08:48.534Z",
                "event_timezone_offset": "+00:00"
            }
            log.debug('context.newRecord.getValue({ fieldId: "createdfrom" })',record_so.getValue({ fieldId: "createdfrom" }))

            var customrecord_wmsts_serialentrySearchObj = search.create({
                type: "customrecord_wmsts_serialentry",
                filters:
                    [
                        ["custrecord_wmsts_ser_ordno", "anyof",record_so.getValue({ fieldId: "createdfrom" })]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "id", label: "ID" }),
                        search.createColumn({ name: "scriptid", label: "Script ID" })
                    ]
            });
            var searchResultCount = customrecord_wmsts_serialentrySearchObj.runPaged().count;
            log.debug("customrecord_wmsts_serialentrySearchObj result count", searchResultCount);
            customrecord_wmsts_serialentrySearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                var serial_no = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })
                var response = https.post({
                    url: 'https://epcis-dev-aca.nicemeadow-f558521d.eastus.azurecontainerapps.io/packing-events/?serial_number=EV5KB2ZZIETTFI',// + serial_no,
                    headers: headerObj,
                    body: JSON.stringify(postdata),

                    


                });

                log.debug("response", response) 

             

               
                return false;

                
            });













        }
     


        return {
            afterSubmit: afterSubmit,
         

        }
    }
)