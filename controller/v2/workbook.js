const Workbook = require('../../models/workbook/workbook');
const Sheet = require('../../models/workbook/sheet');
const Value = require('../../models/workbook/value');
const {checkPermission, Permission} = require('./helpers');
const error = require('../../config/error');

module.exports = {
    saveWorkbookAdmin: async (req, res, next) => {
        if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {workbook, values, sheets} = req.body;
        try {
            const oldWorkbook = await Workbook.findOneAndUpdate(
                {name: workbook.name, groupNumber: groupNumber},
                workbook,
                {upsert: true, runValidators: true});
            const sheetOp = [];
            sheets.forEach(sheet => {
                sheetOp.push({
                    updateOne: {
                        filter: {_id: sheet._id},
                        update: sheet,
                        upsert: true,
                    }
                })
            });
            const sheetResult = await Sheet.bulkWrite(sheetOp);
            const valueUpdate = {groupNumber};
            const projection = {};
            for (let catId in values) {
                const atts = values[catId];
                if (Object.keys(atts) === 0) continue;

                for (let attId in atts) {
                    valueUpdate['data.' + catId + '.' + attId] = atts[attId];
                    projection['data.' + catId + '.' + attId] = 1;
                }
            }
            await Value.findOneAndUpdate(
                {groupNumber},
                valueUpdate,
                {upsert: true, runValidators: false, strict: false});

            // await Value.findOne({groupNumber}, projection);
            // const found = (await Value.findOne({groupNumber})).data;
            // const result = {};
            // for (let catId in values) {
            //     const atts = values[catId];
            //     if (Object.keys(atts).length === 0) continue;
            //     result[catId] = {};
            //     for (let attId in atts) {
            //         result[catId][attId] = found[catId][catId];
            //     }
            // }


            return res.json({
                success: true, message: oldWorkbook ? 'Workbook updated.' : 'Workbook created',
                sheet: sheetResult
            });
        } catch (e) {
            next(e);
        }


    }
};
