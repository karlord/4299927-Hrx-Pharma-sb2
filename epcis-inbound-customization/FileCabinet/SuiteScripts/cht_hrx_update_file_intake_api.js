/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 
 */
define(['N/record', 'N/search'], function (record, search) {
    function post(context) {
        try {
            log.debug("context", context);
            var ponumber = "" + context.PONUMBER;
            log.debug("ponumber", ponumber);

            var internalidId;
            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters:
                    [
                        ["type", "anyof", "PurchOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["numbertext", "is", ponumber]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug("purchaseorderSearchObj result count", searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                internalidId = result.getValue({ name: "internalid", label: "Internal ID" })
                return true;
            });

            /*
            purchaseorderSearchObj.id="customsearch1693483610974";
            purchaseorderSearchObj.title="Custom Transaction Search 5 (copy)";
            var newSearchId = purchaseorderSearchObj.save();
            */

            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type", "anyof", "ItemRcpt"],
                        "AND",
                        ["createdfrom.internalid", "anyof", internalidId],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);
            transactionSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                var intake_rec = record.load({
                    type: "itemreceipt",
                    id: result.getValue({ name: "internalid", label: "Internal ID" }),
                    isDynamic: true
                });
                intake_rec.save({ ignoreMandatoryFields: true })
                return true;
            });

        }
        catch (e) {
            log.debug("Exception occurred", e)
        }


        /*
        transactionSearchObj.id="customsearch1693224441852";
        transactionSearchObj.title="Transaction Search (copy)";
        var newSearchId = transactionSearchObj.save();
        */


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