const Workbook = require('../../models/workbook/workbook');
const Sheet = require('../../models/workbook/sheet');
const Value = require('../../models/workbook/value');
const {checkPermission, Permission} = require('./helpers');
const error = require('../../config/error');
const mongoose = require('mongoose');

module.exports = {
    /**
     * Save workbook template, for admin (form designer).
     * TODO: Since large JSON is parsed here, it will block the event loop eventually, move this function to a sub thread/process to improve performance.
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    saveWorkbookAdmin: async (req, res, next) => {
        if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {workbook, values, sheets} = req.body;
        workbook.sheets = [];
        for (let i = 0; i < sheets.length; i++) {
            const objectId = mongoose.Types.ObjectId();
            workbook.sheets.push(objectId);
            sheets[i]._id = objectId;
        }
        try {
            const oldWorkbook = await Workbook.findOneAndUpdate(
                {name: workbook.name, groupNumber: groupNumber},
                workbook,
                {upsert: true, runValidators: true});
            const sheetOp = [];
            // remove old sheets.
            if (oldWorkbook) {
                const oldSheetIds = oldWorkbook.sheets;
                oldSheetIds.forEach(_id => sheetOp.push({deleteOne: {filter: {_id}}}));
            }
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

            let doc = await Value.findOne({groupNumber});
            if (!doc)
                doc = new Value({groupNumber, data: {}});
            if (!doc.data)
                doc.data = {};
            const data = doc.data;
            for (let catId in values) {
                const atts = values[catId];
                if (Object.keys(atts).length === 0) continue;
                if (!data[catId]) data[catId] = {};
                for (let attId in atts) {
                    data[catId][attId] = atts[attId];
                }
            }
            doc.markModified('data');
            await doc.save();

            return res.json({
                success: true, message: oldWorkbook ? 'Workbook updated.' : 'Workbook created',
                sheet: sheetResult
            });
        } catch (e) {
            next(e);
        }
    },

    getWorkbook: async (req, res, next) => {
        const name = req.params.name;
        const groupNumber = req.session.user.groupNumber;
        try {
            const workbook = await Workbook.findOne({name, groupNumber}).populate('sheets').exec();
            if (!workbook) return res.status(400).json({success: false, message: 'Workbook does not exist.'});
            const populate = [];
            let values = (await Value.findOne({groupNumber}));
            values = values ? values.data : {};
            workbook.sheets.forEach((sheet, idx) => {
                if (!sheet.row2Cat || !sheet.col2Att) return;
                const rows = populate[idx] = {};
                for (let row in sheet.row2Cat) {
                    const catId = sheet.row2Cat[row];
                    if (!values[catId]) continue;
                    if (!rows[row]) rows[row] = {};
                    for (let col in sheet.col2Att) {
                        const attId = sheet.col2Att[col];
                        if (values[catId][attId] == null) continue;
                        rows[row][col] = values[catId][attId];
                    }
                }
            });
            workbook.sheets = undefined;
            return res.json({success: true, workbook, populate});
        } catch (e) {
            next(e);
        }

    },
};
