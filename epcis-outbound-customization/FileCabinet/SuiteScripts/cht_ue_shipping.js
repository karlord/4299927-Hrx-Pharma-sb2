/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * Task            Date                Author                                          Remarks
 * DT-0000      23 AUG 2023         RAVI BHUSHAN                                 shipping event API
*/
define(['N/record', 'N/https', 'N/search'],

    function (record, https, search) {



        function afterSubmit(context) {


            var oldRecord = context.oldRecord;

            var record_so = record.load({ type: "itemfulfillment", id: context.newRecord.id, isDynamic: true });

            var status_old = oldRecord.getValue("status")

            var status = record_so.getValue({ fieldId: "status" });



            log.debug("status", status);
            if (status_old != "Shipped" && status == "Shipped") {
                var headerObj = {
                    name: 'Accept-Language',
                    value: 'en-us',
                    "x-api-key": "qwertyuiop[]1234567890zxcvbnm,./",
                    "Allow": "POST, OPTIONS",
                    "Content-Type": "application/json"

                };

                var postdata = new Object();
                var name = oldRecord.getValue({ fieldId: "entity" });

               
                /*
                customerSearchObj.id="customsearch1695811666363";
                customerSearchObj.title="Custom Customer Search (copy)";
                var newSearchId = customerSearchObj.save();
                */



                var serialno_array = new Array();
                var serial_no;

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
                            search.createColumn({ name: "custrecord_wmsts_ser_no", label: "SERIAL NO" })
                        ]
                });
                var searchResultCount = customrecord_wmsts_serialentrySearchObj.runPaged().count;
                log.debug("customrecord_wmsts_serialentrySearchObj result count", searchResultCount);
                customrecord_wmsts_serialentrySearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    serial_no = result.getValue({ name: "custrecord_wmsts_ser_no", label: "SERIAL NO" });

                    serialno_array.push(serial_no)

                    log.debug("SERIAL NUMBER", serial_no)


                   
                    return true;
                });


                var sgln, address, city, state, zipcode, countryCode, name_addresse

                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["internalid", "anyof", name]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_hrx_sgln_fld",
                                join: "Address",
                                label: "SGLN"
                            }),
                            search.createColumn({
                                name: "address",
                                join: "Address",
                                label: "Address"
                            }),
                            search.createColumn({
                                name: "city",
                                join: "Address",
                                label: "City"
                            }),
                            search.createColumn({
                                name: "state",
                                join: "Address",
                                label: "State/Province"
                            }),
                            search.createColumn({
                                name: "zipcode",
                                join: "Address",
                                label: "Zip Code"
                            }),
                            search.createColumn({
                                name: "countrycode",
                                join: "Address",
                                label: "Country Code"
                            }),
                            search.createColumn({
                                name: "address",
                                join: "Address",
                                label: "Address"
                            }),
                            search.createColumn({
                                name: "addressee",
                                join: "Address",
                                label: "Addressee"
                            })
                        ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);
                customerSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results

                    name_addresse = result.getValue({
                        name: "addressee",
                        join: "Address",
                        label: "Addressee"
                    })


                    sgln = result.getValue({
                        name: "custrecord_hrx_sgln_fld",
                        join: "Address",
                        label: "SGLN"
                    })


                    city = result.getValue({
                        name: "city",
                        join: "Address",
                        label: "City"
                    })


                    state = result.getValue({
                        name: "state",
                        join: "Address",
                        label: "State/Province"
                    })


                    zipcode = result.getValue({
                        name: "zipcode",
                        join: "Address",
                        label: "Zip Code"
                    });

                    countryCode = result.getValue({
                        name: "countrycode",
                        join: "Address",
                        label: "Country Code"
                    });

                    address = result.getValue({
                        name: "address",
                        join: "Address",
                        label: "Address"

                    })
                    return true;
                });

                /*
                customerSearchObj.id="customsearch1696849548018";
                customerSearchObj.title="Customer Search (copy)";
                var newSearchId = customerSearchObj.save();
                */



                postdata = {
                    "serial_number": serialno_array,
                    "event_time": "2022-12-22T13:08:48.534Z",
                    "event_timezone_offset": "+00:00",
                    "sourceList": [
                        {

                            "source_sgln": "0368462.70030.0",
                            "source_type": "owning_party"
                        },

                        {
                            "source_sgln": "0368462.70031.0",

                            "source_type": "location"
                        }
                    ],

                    "destinationList": [

                        {
                            "recipient_sgln": sgln,
                            "recipient_type": "owning_party"
                        }

                    ],
                    "addressDetails":
                        [
                            {
                                "name": name_addresse,
                                "streetAddressOne": address,
                                "city": city,
                                "state": state,
                                "postalCode": zipcode,
                                "countryCode": countryCode
                            }

                        ]
                }

                var response = https.post({
                    url: 'https://epcis-dev.hrxstaging.com/shipping-events/',
                    headers: headerObj,
                    body: JSON.stringify(postdata),


                });

                log.debug("response", response)
            }













        }


        return {
            afterSubmit: afterSubmit,

        }
    }
)