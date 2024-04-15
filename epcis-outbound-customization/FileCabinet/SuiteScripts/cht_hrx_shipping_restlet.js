/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'], function (record, search) {
    function get(context) {

        var createdFromidArray = new Array();

        var NS_IF_ID = new Array();

        var customer_idArray = new Array();

        var postdata_array = new Array();

        var state_licence_number;
        var seller_licence_number;

        var itemfulfillmentSearchObj = search.create({
            type: "itemfulfillment",
            filters:
                [
                    ["type", "anyof", "ItemShip"],
                    "AND",
                    ["internalid", "anyof", "15230966"],
                    "AND",
                    ["custbody_cht_hrx_shipping_event_create", "is", "F"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "internalid",
                        join: "createdFrom",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "customerMain",
                        label: "Internal ID"
                    }),
                    search.createColumn({ name: "custbody_statelicensenumber", label: "State License Number" }),
                    search.createColumn({ name: "custbody_herculesstate", label: "Hercules State License Number" }),

                ]
        });
        var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
        log.debug("itemfulfillmentSearchObj result count", searchResultCount);
        itemfulfillmentSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            NS_IF_ID.push(result.getValue({ name: "internalid", label: "Internal ID" }))
            createdFromidArray.push(result.getValue({
                name: "internalid",
                join: "createdFrom",
                label: "Internal ID"
            }))
            customer_idArray.push(result.getValue({
                name: "internalid",
                join: "customerMain",
                label: "Internal ID"
            }))
            state_licence_number = result.getValue({ name: "custbody_statelicensenumber", label: "State License Number" });
            seller_licence_number = result.getValue({ name: "custbody_herculesstate", label: "Hercules State License Number" })
            return true;
        });

        /*
        itemfulfillmentSearchObj.id="customsearch1698667801212";
        itemfulfillmentSearchObj.title="Custom Transaction Search 9 (copy)";
        var newSearchId = itemfulfillmentSearchObj.save();


        */


        log.debug("createdFromid", createdFromidArray)

        log.debug("customer_id", customer_idArray);

        log.debug("NS_IF_ID", NS_IF_ID)


        for (var i = 0; i < NS_IF_ID.length; i++) {





            var createdFromid = createdFromidArray[i];
            var customer_id = customer_idArray[i];
            var serialno_array = new Array();
            var serial_no;

            var customrecord_wmsts_serialentrySearchObj = search.create({
                type: "customrecord_wmsts_serialentry",
                filters:
                    [
                        ["custrecord_wmsts_ser_ordno", "anyof", createdFromid]
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



            var addressdetail_obj = new Object();

            var addressdetail_objlist = new Array();

            var destinationListobj = new Object();

            var destinationList = new Array();

            var hrx_id = '';



            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", customer_id]
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
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "{entityid}",
                            label: "Formula (Text)"
                        })
                    ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count", searchResultCount);
            customerSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results

                hrx_id = result.getValue({
                    name: "formulatext",
                    formula: "{entityid}",
                    label: "Formula (Text)"
                });

                addressdetail_obj.name = result.getValue({
                    name: "addressee",
                    join: "Address",
                    label: "Addressee"
                })


                addressdetail_obj.sgln = result.getValue({
                    name: "custrecord_hrx_sgln_fld",
                    join: "Address",
                    label: "SGLN"
                })


                addressdetail_obj.city = result.getValue({
                    name: "city",
                    join: "Address",
                    label: "City"
                })

                destinationListobj.recipient_sgln = result.getValue({
                    name: "custrecord_hrx_sgln_fld",
                    join: "Address",
                    label: "SGLN"
                });

                destinationListobj.recipient_type = "owning_party";

                destinationList.push(destinationListobj)




                addressdetail_obj.state = result.getValue({
                    name: "state",
                    join: "Address",
                    label: "State/Province"
                })


                addressdetail_obj.zipcode = result.getValue({
                    name: "zipcode",
                    join: "Address",
                    label: "Zip Code"
                });

                addressdetail_obj.countryCode = result.getValue({
                    name: "countrycode",
                    join: "Address",
                    label: "Country Code"
                });

                addressdetail_obj.address = result.getValue({
                    name: "address",
                    join: "Address",
                    label: "Address"

                });

                addressdetail_objlist.push(addressdetail_obj)
                return true;
            });

            /*
            customerSearchObj.id="customsearch1696849548018";
            customerSearchObj.title="Customer Search (copy)";
            var newSearchId = customerSearchObj.save();
            */


            log.debug("addressdetail_objlist", addressdetail_objlist);
            log.debug("destinationList", destinationList);


            var today = new Date();

            log.debug("today", today)

            var sscc_array = new Array();


            var customrecord_pacejet_package_infoSearchObj = search.create({
                type: "customrecord_pacejet_package_info",
                filters:
                    [
                        ["custrecord_pacejet_package_sscc", "isnotempty", ""],
                        "AND",
                        ["custrecord_pacejet_transaction_link", "anyof", NS_IF_ID[i]]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "scriptid", label: "Script ID" }),
                        search.createColumn({ name: "custrecord_pacejet_transaction_link", label: "PJ Package Transaction Link" }),
                        search.createColumn({ name: "custrecord_pacejet_package_id", label: "Package ID" }),
                        search.createColumn({ name: "custrecord_pacejet_package_contents", label: "Contents" }),
                        search.createColumn({ name: "custrecord_pacejet_package_tracking", label: "Tracking Number" }),
                        search.createColumn({ name: "custrecord_pacejet_package_tracking_link", label: "Tracking Link" }),
                        search.createColumn({ name: "custrecord_pacejet_package_weight", label: "Weight" }),
                        search.createColumn({ name: "custrecord_pacejet_package_sscc", label: "SSCC" })
                    ]
            });
            var searchResultCount = customrecord_pacejet_package_infoSearchObj.runPaged().count;
            log.debug("customrecord_pacejet_package_infoSearchObj result count", searchResultCount);
            customrecord_pacejet_package_infoSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                sscc_array.push(result.getValue({ name: "custrecord_pacejet_package_sscc", label: "SSCC" }))
                return true;
            });

            var invoicenum;
            var pedigree_Number_ = new Array();

            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["custbody_related_fulfillments", "anyof", NS_IF_ID[i]],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({
                            name: "name",
                            join: "CUSTRECORD_PEDIGREE_INVOICE_REF",
                            label: "Name"
                        })
                    ]
            });
            var searchResultCount = invoiceSearchObj.runPaged().count;
            log.debug("invoiceSearchObj result count", searchResultCount);
            invoiceSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                invoicenum = result.getValue({ name: "tranid", label: "Document Number" });
                pedigree_Number = result.getValue(search.createColumn({
                    name: "name",
                    join: "CUSTRECORD_PEDIGREE_INVOICE_REF",
                    label: "Name"
                }));
                pedigree_Number_.push(pedigree_Number)
                return true;
            });
            log.debug("pedigree_Number_", pedigree_Number_);

            /*
            invoiceSearchObj.id="customsearch1704796798931";
            invoiceSearchObj.title="Transaction Search FILE CREATION API (copy)";
            var newSearchId = invoiceSearchObj.save();
            */
            /*
            invoiceSearchObj.id="customsearch1698922395049";
            invoiceSearchObj.title="Custom Transaction Search 10 (copy)";
            var newSearchId = invoiceSearchObj.save();
            */

            /*
            customrecord_pacejet_package_infoSearchObj.id="customsearch1698839990587";
            customrecord_pacejet_package_infoSearchObj.title="Pacejet Package Info Search (copy)";
            var newSearchId = customrecord_pacejet_package_infoSearchObj.save();
            */



            var dataTime = new Date();

            log.debug("dateTime", dataTime);
            postdata = {
                "NS_IF_ID": NS_IF_ID,
                "serial_number": serialno_array,
                "sscc": sscc_array,
                "hrx_number": hrx_id,
                "buyer_licence_number": state_licence_number,
                "seller_licence_number": seller_licence_number,
                "invoicenum": invoicenum,
                "pedigree_Number": pedigree_Number_,
                "event_time": dataTime,
                "event_timezone_offset": "+00:00",
                "sourceList": [
                    {

                        "source_sgln": "",
                        "source_type": "owning_party"
                    },

                    {
                        "source_sgln": "",

                        "source_type": "location"
                    }
                ],

                "destinationList": destinationList/* [

                {
                    "recipient_sgln": sgln,
                    "recipient_type": "owning_party"
                }

            ]*/,
                "addressDetails": addressdetail_objlist

            }

            postdata_array.push(postdata)

        }
        log.debug("response", postdata_array)



        return JSON.stringify(postdata_array)
    }


    function post(context) {
        log.debug("context", context);

        var response_body = context;

        log.debug("response", response_body[0].NS_IF_ID)

        var if_rec = record.load({ type: "itemfulfillment", id: response_body[0].NS_IF_ID, isDynamic: true })

        if_rec.setValue("custbody_cht_hrx_shipping_event_create", true);

        if_rec.save({ ignoreMandatoryFields: true });









    }

    /*
    purchaseorderSearchObj.id="customsearch1688395628133";
    purchaseorderSearchObj.title="Custom Transaction Search 5 (copy)";
    var newSearchId = purchaseorderSearchObj.save();
    */






    return {
        get: get,
        post: post
    };
});