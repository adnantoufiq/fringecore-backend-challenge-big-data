import { getRecord, updateRecord } from "./utils/records.mjs";

export const processReadRequest = async (req, res) => {
    const record = await getRecord(req.params.id);

    return res.status(200).json(record);
};

export const processWriteRequest = async (req, res) => {
    const updatedRecord = await updateRecord(req.params.id, req.body);

    return res.status(200).json(updatedRecord);
};
