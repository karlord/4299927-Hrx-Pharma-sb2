/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

var PAGE_SIZE = 100;
var SEARCH_ID = 'customsearch2411';



define(['N/ui/serverWidget', 'N/search', 'N/redirect', 'N/file', 'N/https'],

    function (serverWidget, search, redirect, file, https) {
        

            function onRequest(context) {
                try {

                var form = serverWidget.createForm({

                    title: 'NetSuite Vs EPCIS',

                    hideNavBar: false

                });


                var sublist = form.addSublist({

                    id: 'custpage_table',

                    type: serverWidget.SublistType.LIST,

                    label: 'NetSuite Vs EPCIS'

                });


                sublist.addField({

                    id: 'serialno',

                    label: 'Serial Number',

                    type: serverWidget.FieldType.TEXT

                });



                sublist.addField({

                    id: 'status',

                    label: 'STATUS',

                    type: serverWidget.FieldType.TEXT

                });


                log.debug("context", context);
                var id = context.request.parameters.intakeid;

                var createdfrom = search.lookupFields({
                    type: "itemreceipt",
                    id: id,
                    columns: ['createdfrom']
                });
                log.debug("created from", createdfrom.createdfrom[0].value)

                log.debug("id", id)
                var serial_no_array = new Array();
                var customrecord_wmsts_serialentrySearchObj = search.create({
                    type: "customrecord_wmsts_serialentry",
                    filters:
                        [
                            ["custrecord_wmsts_ser_ordno", "anyof", createdfrom.createdfrom[0].value] // context.newRecord.getValue({ fieldId: "createdfrom" })]
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
                        // url: 'https://epcis-dev.hrxstaging.com/receive-events/?serial_number=' + serial_no_array[i].serial_no,
                        url: 'https://epcis-test.hrxstaging.com/event/receive-events/?serial_number=' + serial_no_array[i].serial_no,  
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

                        sublist.setSublistValue({

                            id: "serialno",

                            line: i,

                            value: "<b style='color:black;font-size:15px'>" + serial_no_array[i].serial_no + "</b>"

                        })

                        sublist.setSublistValue({

                            id: "status",

                            line: i,

                            value: "<b style='color:blue;font-size:15px'>NOT PRESENT IN REPOSITORY</b>"

                        })



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
                                    ["internalid", "anyof", id],
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


                        if (flag == true) {
                            sublist.setSublistValue({

                                id: "serialno",

                                line: i,

                                value: "<b style='color:black;font-size:15px'>" + serial_no_array[i].serial_no + "</b>"

                            })

                            sublist.setSublistValue({

                                id: "status",

                                line: i,

                                value: "<a style='color:green;font-size:15px' href='https://4299927-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=3008&deploy=1&serial=" + serial_no_array[i].serial_no + "&intakeid=" + id + "' onclick='window.open(this.href, 'new', 'popup'); return false;'>Matched</a>"

                            })


                        }
                        else {
                            sublist.setSublistValue({

                                id: "serialno",

                                line: i,

                                value: "<b style='color:black;font-size:15px'>" + serial_no_array[i].serial_no + "</b>"

                            })

                            sublist.setSublistValue({

                                id: "status",

                                line: i,

                                value: "<a style='color:red;font-size:15px' href='https://4299927-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=3008&deploy=1&serial=" + serial_no_array[i].serial_no + "&intakeid=" + id + "' target='_blank'>NOT MATCHED</a>"

                            })

                        }




                        // context.response.writePage(form);
                    }




                }
                context.response.writePage(form);
            }
            catch(e)
            {
                log.debug("exception",e)
            }
        }

        return {

            onRequest: onRequest

        };


    });
