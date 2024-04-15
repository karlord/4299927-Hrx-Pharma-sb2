/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * Task          Date                Author                                         Remarks
 * DT-0000      16/08/200          RAVI BHUSHAN                             Script Under Progress
*/
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/error'],

    function (record, search, serverWidget, https, error) {



        function afterSubmit(context) {

            try {


                if (context.type != "delete") {
                    var id = context.newRecord.id;
                    var serial_no_array = new Array();
                    var customrecord_wmsts_serialentrySearchObj = search.create({
                        type: "customrecord_wmsts_serialentry",
                        filters:
                            [
                                ["custrecord_wmsts_ser_ordno", "anyof", context.newRecord.getValue({ fieldId: "createdfrom" })]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),
                                search.createColumn({ name: "id", label: "ID" }),
                                search.createColumn({ name: "scriptid", label: "Script ID" }),
                                search.createColumn({ name: "custrecord_wmsts_ser_item", label: "Serial Item" }),
                                search.createColumn({ name: "custrecord_wmsts_ser_qty", label: "Quantity" })
                            ]
                    });
                    var searchResultCount = customrecord_wmsts_serialentrySearchObj.runPaged().count;
                    log.debug("customrecord_wmsts_serialentrySearchObj result count", searchResultCount);
                    customrecord_wmsts_serialentrySearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results

                        var serial_no_object = new Object();

                        serial_no_object.serial_no = result.getValue({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        });

                        serial_no_object.ndc = result.getValue({
                            name: "custrecord_wmsts_ser_item", label: "Serial Item"
                        });
                        serial_no_object.quantity = result.getValue({ name: "custrecord_wmsts_ser_qty", label: "Quantity" })
                        serial_no_array.push(serial_no_object)
                        return true;
                    });
                    log.debug("serial_no", serial_no_array)
                    /*
                    customrecord_wmsse_serialentrySearchObj.id="customsearch1692275968243";
                    customrecord_wmsse_serialentrySearchObj.title="WMS TS Serial Entry Search (copy)";
                    var newSearchId = customrecord_wmsse_serialentrySearchObj.save();
                    */

                    for (var i = 0; i < serial_no_array.length; i++) {

                        var headerObj = {
                            name: 'Accept-Language',
                            value: 'en-us',
                            "x-api-key": "qwertyuiop[]1234567890zxcvbnm,./",
                            "Allow": "POST, OPTIONS",
                            "Content-Type": "application/json"

                        };
                        var response = https.get({
                            url: 'https://epcis-dev.hrxstaging.com/event/receive-events/?serial_number=' + serial_no_array[i].serial_no,
                            headers: headerObj
                        });
                        log.debug("response", response)


                        var json_incoming_data = JSON.parse(response.body).data;

                        if (json_incoming_data == "" || json_incoming_data == null) {
                            // var error_body = error.create({
                            //     name: 'ERROR',
                            //     message: 'Serial Number not found in EPCIS repository',
                            //     notifyOff: false
                            // });

                            // throw error_body;

                        }
                        else {


                            log.debug("json_incoming_data", json_incoming_data)

                            var json_intake_date = new Object();


                            var itemreceiptSearchObj = search.create({
                                type: "itemreceipt",
                                filters:
                                    [
                                        ["type", "anyof", "ItemRcpt"],
                                        "AND",
                                        ["internalid", "anyof", context.newRecord.id],
                                        "AND",
                                        ["shipping", "is", "F"],
                                        "AND",
                                        ["formulatext: {item}", "isnotempty", ""],
                                        "AND",
                                        ["item", "anyof", serial_no_array[i].ndc],
                                    ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "formulatext",
                                            formula: "{name}",
                                            label: "Formula (Text)"
                                        }),
                                        search.createColumn({
                                            name: "custitem_11digitndc",
                                            join: "item",
                                            label: "11-Digit NDC"
                                        }),
                                        search.createColumn({
                                            name: "formulatext1",
                                            formula: "{inventorydetail.inventorynumber}",
                                            label: "Formula (Text)"
                                        }),
                                        search.createColumn({
                                            name: "formulatext2",
                                            formula: "{inventorydetail.binnumber}",
                                            label: "Formula (Text)"
                                        }),
                                        search.createColumn({
                                            name: "expirationdate",
                                            join: "inventoryDetail",
                                            label: "Expiration Date"
                                        }),

                                        search.createColumn({ name: "item", label: "Item" }),
                                        search.createColumn({ name: "custbody_ir_seller_addr", label: "Seller Address" }),
                                        search.createColumn({ name: "custbody_ir_shipper_address", label: "Shipper Address" }),
                                        search.createColumn({ name: "quantity", label: "Quantity" })
                                    ]
                            });
                            var searchResultCount = itemreceiptSearchObj.runPaged().count;
                            log.debug("itemreceiptSearchObj result count", searchResultCount);
                            itemreceiptSearchObj.run().each(function (result) {
                                // .run().each has a limit of 4,000 results
                                // json_intake_date.manufacturer = result.getValue({
                                //     name: "formulatext",
                                //     formula: "{name}",
                                //     label: "Formula (Text)"
                                // })
                                json_intake_date.item_expiration_date = result.getValue({
                                    name: "expirationdate",
                                    join: "inventoryDetail",
                                    label: "Expiration Date"
                                })

                                json_intake_date.ndc = result.getValue({
                                    name: "custitem_11digitndc",
                                    join: "item",
                                    label: "11-Digit NDC"
                                });

                                json_intake_date.quantity = serial_no_array[i].quantity;

                            });



                            log.debug("json_intake_date", json_intake_date);

                            log.debug("json_incoming_data", json_incoming_data);

                            var flag = true;
                            var result_post = new Object();
                            if (Object.keys(json_incoming_data).length == Object.keys(json_intake_date).length) {
                                for (key in json_intake_date) {
                                    if (json_intake_date[key] == json_incoming_data[key]) {
                                        result_post[key] = "Matched";
                                        continue;
                                    }
                                    else {
                                        flag = false;
                                        result_post[key] = json_intake_date[key]
                                        log.debug("key", key)

                                    }
                                }
                            }
                            else {
                                flag = false;
                            }
                            log.debug("flag", flag);
                            log.debug("result_post", result_post);

                            if (flag) {
                                var rec_intake = record.load({ type: "itemreceipt", id: context.newRecord.id, isDynamic: true });

                                rec_intake.setValue({ fieldId: "custbody_cht_hrx_epcis_matched", value: "MATCHED" });
                                rec_intake.save({ ignoreMandatoryField: true })

                            }
                            else {
                                var rec_intake = record.load({ type: "itemreceipt", id: context.newRecord.id, isDynamic: true });

                                rec_intake.setValue({ fieldId: "custbody_cht_hrx_epcis_matched", value: "NOT MATCHED" });

                                rec_intake.save({ ignoreMandatoryField: true })

                            }


                            var dataTime = new Date();

                            log.debug("dateTime", dataTime);

                            var postdata = new Object();



                            postdata.serial_number = serial_no_array[i].serial_no

                            postdata.event_time = dataTime;

                            postdata.event_timezone_offset = "+00:00";

                            postdata.result = JSON.stringify(result_post);

                            postdata.status = flag;

                            postdata.bizLocation = "0860003.52670.0";


                            log.debug("stringify(postdata)", postdata)

                            var headerObj1 = {
                                name: 'Accept-Language',
                                value: 'en-us',
                                "x-api-key": "qwertyuiop[]1234567890zxcvbnm,./",
                                "Allow": "POST, OPTIONS",
                                "Content-Type": "application/json",


                            };

                            // var postdata1 = {
                            //     "serial_number":"EV5KB2ZZIETTFI",
                            //     "event_time": "2022-12-22T13:08:48.534Z",
                            //     "event_timezone_offset": "+00:00",
                            //     "result": {
                            //         "item_expiration_date": "27-Feb-2025",
                            //         "manufacturer": "Camber",
                            //         "ndc": "31722070490",
                            //         "quantity": "24"
                            //     },
                            //     "status": "false"
                            // }

                            var response = https.post({
                                // url: 'https://epcis-dev.hrxstaging.com/event/create-events/',
                                url: 'https://epcis-test.hrxstaging.com/event/create-events/',
                                headers: headerObj1,
                                body: JSON.stringify(postdata),


                            });

                            log.debug("message", response)


                        }

                    }
                }

            }
            catch (e) {
                log.debug("exception", e)
            }
        }


        function beforeLoad(context) {

            try {

                var id = context.newRecord.id;

                var status = context.newRecord.getValue("custbody_cht_hrx_epcis_matched")

                var form = context.form;

                var field = form.addField({
                    id: 'custpage_textfield',
                    type: serverWidget.FieldType.URL,
                    label: 'NS Vs EPCIS Results',


                });


                field.linkText = status;

                field.defaultValue = "https://4299927-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2749&deploy=1&intakeid=" + id


                form.insertField({
                    field: field,
                    nextfield: 'custbody_cht_hrx_epcis_matched'
                });
            }
            catch (e) {
                log.debug("exception occurred", e)
            }
        }


        return {
            afterSubmit: afterSubmit,
            beforeLoad: beforeLoad

        }
    }
)