/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {
    function post(context) {

        try {

            log.debug("rsetlet json Date", context);
            log.debug("PONUMBER", context.PONUMBER);
            log.debug("MANUFACTURER", context.MANUFACTURER);
            log.debug("GLNRECEPIENT", context.GLNRECEPIENT);
            log.debug({ "item": context.item })

            var arr_item = new Array();
            arr_item = context.item;


            var arr_detail = new Array();
            arr_detail = context.AddressDetails;

            log.debug("arr_detail", arr_detail)

            log.debug("arr_item", arr_item.length);
            var po_number = context.PONUMBER;
            var ven_manufacturer = context.MANUFACTURER;
            // var manufacturer

            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters:
                    [
                        ["type", "anyof", "PurchOrd"],
                        "AND",
                        ["number", "equalto", po_number],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns: [
                    search.createColumn({
                        name: "formulatext",
                        formula: "{vendor.altname}",
                        label: "Formula (Text)"
                    })
                ]
            });

            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug("purchaseorderSearchObj result count", searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                ven_manufacturer = result.getValue({
                    name: "formulatext",
                    formula: "{vendor.altname}",
                    label: "Formula (Text)"
                });
                return true;
            });
            log.debug("ven_manufacturer", ven_manufacturer);
            var response = new Object();

            if (searchResultCount == 0) {
                response = {
                    message: "PO Doesn't Exist in NetSuite"
                }
                return response;

            }
            else {
                response.PONUMBER = "Matched";

                if (ven_manufacturer.replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, '').toLowerCase() == context.MANUFACTURER.replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, '').toLowerCase()) {
                    log.debug("success")
                    response.MANUFACTURER = "Matched"
                    var address_details_res = new Array();
                    for (var i = 0; i < arr_detail.length; i++) {
                        var add_res = new Object();
                        add_res.sgln = arr_detail[i].sgln;
                        add_res.address = arr_detail[i].address;
                        var result_address = new Object();
                        var address;
                        var split_address;
                        var sgln;
                        log.debug("context.SGLN", context.SGLN)
                        var vendorSearchObj = search.create({
                            type: "vendor",
                            filters:
                                [
                                    ["formulatext: {altname}", "is", context.MANUFACTURER],
                                    "AND",
                                    ["address.custrecord_hrx_sgln_fld", "is", arr_detail[i].sgln]
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "address",
                                        join: "Address",
                                        label: "Address"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hrx_sgln_fld",
                                        join: "Address",
                                        label: "SGLN"
                                    })
                                ]
                        });
                        var searchResultCount = vendorSearchObj.runPaged().count;
                        log.debug("vendorSearchObj result count", searchResultCount);
                        vendorSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            split_address = result.getValue({
                                name: "address",
                                join: "Address",
                                label: "Address"
                            }).replace(/\n/g, " ");
                            address = ((result.getValue({
                                name: "address",
                                join: "Address",
                                label: "Address"
                            })).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                            sgln = result.getValue({
                                name: "custrecord_hrx_sgln_fld",
                                join: "Address",
                                label: "SGLN"
                            })
                            return true;
                        });
                        log.debug("sgln", sgln);
                        var incomingaddress = ((context.AddressDetails[i].address).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                        log.debug("incomingaddress", incomingaddress)

                        if (searchResultCount > 0) {

                            result_address.sgln = "MATCHED";

                            if (address == incomingaddress) {
                                result_address.address = "MATCHED"
                            }
                            else {
                                //Re-enable the manufacturer validation by uncommenting the below code

                                var scriptObj = runtime.getCurrentScript();
                                var address_feature = scriptObj.getParameter({ name: 'custscript_cht_hrx_re_enable_the_address' });

                                log.debug("address feature", address_feature);

                                if (address_feature == false) {
                                    result_address.address = "MATCHED"//split_address
                                }
                                else {
                                    result_address.address = split_address
                                }



                            }

                            add_res.result = result_address
                            address_details_res.push(add_res);
                            response.AddressDetails = address_details_res


                            if (context.GLNRECEPIENT == "08600035267.0.0") {
                                response.GLNRECEPIENT = "MATCHED"
                            }
                            else {
                                response.GLNRECEPIENT = "08600035267.0.0"
                            }

                        }
                        else {
                            var flag_address = false;
                            var flag_sgln = false;


                            var vendorSearchObj = search.create({
                                type: "vendor",
                                filters:
                                    [
                                        ["formulatext: {altname}", "is", ven_manufacturer],
                                        "AND",
                                        ["formulatext: {address.custrecord_hrx_sgln_fld}", "isnotempty", ""],
                                    ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "address",
                                            join: "Address",
                                            label: "Address"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_hrx_sgln_fld",
                                            join: "Address",
                                            label: "SGLN"
                                        })
                                    ]
                            });
                            var searchResultCount = vendorSearchObj.runPaged().count;
                            log.debug("vendorSearchObj result count", searchResultCount);
                            vendorSearchObj.run().each(function (result) {
                                // .run().each has a limit of 4,000 results
                                var address = ((result.getValue({
                                    name: "address",
                                    join: "Address",
                                    label: "Address"
                                })).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                                var sgln = result.getValue({
                                    name: "custrecord_hrx_sgln_fld",
                                    join: "Address",
                                    label: "SGLN"
                                })
                                if (sgln == context.AddressDetails[i].sgln) {
                                    flag_sgln = true;
                                }
                                var incomingaddress = ((context.AddressDetails[i].address).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                                log.debug("incomingaddress", incomingaddress)
                                if (address == incomingaddress) {
                                    flag_address = true
                                }
                                return true;
                            });
                            if (flag_sgln == true) {
                                result_address.sgln = "MATCHED";
                            }
                            else {
                                result_address.sgln = "SGLN NOT FOUND"
                            }
                            if (flag_address == true) {
                                result_address.address = "MATCHED"
                            }
                            else {
                                //Re-enable the manufacturer validation by uncommenting the below code
                                var scriptObj = runtime.getCurrentScript();
                                var address_feature = scriptObj.getParameter({ name: 'custscript_cht_hrx_re_enable_the_address' });

                                log.debug("address feature", address_feature);

                                if (address_feature == false) {
                                    result_address.address = "MATCHED"//split_address
                                }
                                else {
                                    result_address.address = "ADDRESS NOT FOUND"
                                }
                            }
                            add_res.result = result_address;
                            address_details_res.push(add_res);
                            response.AddressDetails = address_details_res


                            if (context.GLNRECEPIENT == "08600035267.0.0") {
                                response.GLNRECEPIENT = "MATCHED"
                            }
                            else {
                                response.GLNRECEPIENT = "08600035267.0.0"
                            }

                        }
                    }


                    var item_array = new Array();
                    for (var i = 0; i < arr_item.length; i++) {

                        var itemvalidate = new Object();

                        var ndcincoming = arr_item[i].ndc;
                        itemvalidate.ndc = arr_item[i].ndc;
                        itemvalidate.quantity = arr_item[i].quantity;





                        var purchaseorderSearchObj = search.create({
                            type: "purchaseorder",
                            filters:
                                [
                                    ["type", "anyof", "PurchOrd"],
                                    "AND",
                                    ["number", "equalto", context.PONUMBER],
                                    "AND",
                                    ["custcol_11digit_ndc", "is", ndcincoming]
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "formulatext",
                                        formula: "{item}",
                                        label: "Formula (Text)"
                                    }),
                                    search.createColumn({ name: "quantity", label: "Quantity" }),
                                    search.createColumn({ name: "custcol_11digit_ndc", label: "11 Digit NDC" })
                                ]
                        });
                        var searchResultCount = purchaseorderSearchObj.runPaged().count;
                        log.debug("purchaseorderSearchObj result count", searchResultCount);
                        purchaseorderSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results

                            var resultITEM = new Object();


                            if (arr_item[i].ndc == result.getValue({
                                name: "custcol_11digit_ndc", label: "11 Digit NDC"
                            })) {
                                resultITEM.ndc = "MATCHED"
                            }
                            else {

                                resultITEM.ndc = result.getValue({
                                    name: "custcol_11digit_ndc", label: "11 Digit NDC"
                                })

                            }

                            if (arr_item[i].quantity == result.getValue({
                                name: "quantity", label: "Quantity"
                            })) {
                                resultITEM.quantity = "MATCHED"
                            }
                            else {

                                resultITEM.quantity = result.getValue({
                                    name: "quantity", label: "Quantity"
                                })

                            }





                            itemvalidate.result = resultITEM
                            return true;
                        });

                        if (searchResultCount == 0) {
                            var resultITEM = new Object();

                            resultITEM.ndc = "NDC NOT PRESENT IN THE PO"

                            resultITEM.quantity = "NDC NOT PRESENT IN THE PO"

                            itemvalidate.result = resultITEM
                        }



                        item_array.push(itemvalidate)



                        response.item = item_array
                    }

                }

                else {

                    //Re-enable the manufacturer validation by uncommenting the below code
                    response.MANUFACTURER = "Matched"//ven_manufacturer

                    var scriptObj = runtime.getCurrentScript();
                    var name_feature = scriptObj.getParameter({ name: 'custscript_cht_hrx_reenable_name_validat' });

                    log.debug("Name feature", name_feature);

                    if (name_feature == false) {
                        response.MANUFACTURER = "Matched"//split_address
                    }
                    else {
                        response.MANUFACTURER = ven_manufacturer
                    }




                    var address_details_res = new Array();
                    for (var i = 0; i < arr_detail.length; i++) {
                        var add_res = new Object();
                        add_res.sgln = arr_detail[i].sgln;
                        add_res.address = arr_detail[i].address;
                        var result_address = new Object();
                        var flag_address = false;
                        var flag_sgln = false;


                        var vendorSearchObj = search.create({
                            type: "vendor",
                            filters:
                                [
                                    ["formulatext: {altname}", "is", ven_manufacturer],
                                    "AND",
                                    ["formulatext: {address.custrecord_hrx_sgln_fld}", "isnotempty", ""],
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "address",
                                        join: "Address",
                                        label: "Address"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hrx_sgln_fld",
                                        join: "Address",
                                        label: "SGLN"
                                    })
                                ]
                        });
                        var searchResultCount = vendorSearchObj.runPaged().count;
                        log.debug("vendorSearchObj result count", searchResultCount);
                        vendorSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            var address = ((result.getValue({
                                name: "address",
                                join: "Address",
                                label: "Address"
                            })).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                            var sgln = result.getValue({
                                name: "custrecord_hrx_sgln_fld",
                                join: "Address",
                                label: "SGLN"
                            })
                            if (sgln == context.AddressDetails[i].sgln) {
                                flag_sgln = true;
                            }
                            var incomingaddress = ((context.AddressDetails[i].address).replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '').replace(/[^a-z\d\s]+/gi, "").toLowerCase();
                            log.debug("incomingaddress", incomingaddress)
                            if (address == incomingaddress) {
                                flag_address = true
                            }
                            return true;
                        });
                        if (flag_sgln == true) {
                            result_address.sgln = "MATCHED";
                        }
                        else {
                            result_address.sgln = "SGLN NOT FOUND"
                        }
                        if (flag_address == true) {
                            result_address.address = "MATCHED"
                        }
                        else {
                            //Re-enable the manufacturer validation by uncommenting the below code

                            var scriptObj = runtime.getCurrentScript();
                            var address_feature = scriptObj.getParameter({ name: 'custscript_cht_hrx_re_enable_the_address' });

                            log.debug("address feature", address_feature);

                            if (address_feature == false) {
                                result_address.address = "MATCHED"//split_address
                            }
                            else {
                                result_address.address = "ADDRESS NOT FOUND"
                            }
                        }
                        add_res.result = result_address;
                        address_details_res.push(add_res);
                        response.AddressDetails = address_details_res

                        if (context.GLNRECEPIENT == "08600035267.0.0") {
                            response.GLNRECEPIENT = "MATCHED"
                        }
                        else {
                            response.GLNRECEPIENT = "08600035267.0.0"
                        }

                    }



                    var item_array = new Array();
                    for (var i = 0; i < arr_item.length; i++) {

                        var itemvalidate = new Object();

                        var ndcincoming = arr_item[i].ndc;


                        itemvalidate.ndc = arr_item[i].ndc;

                        itemvalidate.quantity = arr_item[i].quantity;




                        var purchaseorderSearchObj = search.create({
                            type: "purchaseorder",
                            filters:
                                [
                                    ["type", "anyof", "PurchOrd"],
                                    "AND",
                                    ["number", "equalto", context.PONUMBER],
                                    "AND",
                                    ["custcol_11digit_ndc", "is", ndcincoming]
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "formulatext",
                                        formula: "{item}",
                                        label: "Formula (Text)"
                                    }),
                                    search.createColumn({ name: "quantity", label: "Quantity" }),
                                    search.createColumn({ name: "custcol_11digit_ndc", label: "11 Digit NDC" })
                                ]
                        });
                        var searchResultCount = purchaseorderSearchObj.runPaged().count;
                        log.debug("purchaseorderSearchObj result count", searchResultCount);
                        purchaseorderSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results

                            var resultITEM = new Object();




                            if (arr_item[i].ndc == result.getValue({
                                name: "custcol_11digit_ndc", label: "11 Digit NDC"
                            })) {
                                resultITEM.ndc = "MATCHED"
                            }
                            else {

                                resultITEM.ndc = result.getValue({
                                    name: "custcol_11digit_ndc", label: "11 Digit NDC"
                                })

                            }

                            if (arr_item[i].quantity == result.getValue({
                                name: "quantity", label: "Quantity"
                            })) {
                                resultITEM.quantity = "MATCHED"
                            }
                            else {

                                resultITEM.quantity = result.getValue({
                                    name: "quantity", label: "Quantity"
                                })

                            }






                            itemvalidate.result = resultITEM
                            return true;
                        });

                        if (searchResultCount == 0) {
                            var resultITEM = new Object();

                            resultITEM.ndc = "NDC NOT PRESENT IN THE PO"
                            resultITEM.quantity = "NDC NOT PRESENT IN THE PO"

                            itemvalidate.result = resultITEM
                        }

                        item_array.push(itemvalidate)



                        response.item = item_array
                    }



                }

                return response


            }
        }
        catch (e) {
            log.debug("ex", e.message)
            response = {
                message: "Attribute Missing"
            }
            return response;

        }
    }

    /*
    purchaseorderSearchObj.id="customsearch1688395628133";
    purchaseorderSearchObj.title="Custom Transaction Search 5 (copy)";
    var newSearchId = purchaseorderSearchObj.save();
    */






    return {
        post: post
    };
});