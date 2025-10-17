import { getRecord, updateRecord } from "./utils/records.mjs";

const recordQueues = new Map();


async function enqueueOperation(id, operation) {
    if (!recordQueues.has(id)) {
        recordQueues.set(id, Promise.resolve());
    }

    // Chain onto the existing queue
    const lastPromise = recordQueues.get(id);

    // Create a new chained promise
    const newPromise = lastPromise
        .catch(() => {})
        .then(() => operation());

    // Update queue with new promise
    recordQueues.set(id, newPromise);

    // Wait for this operation to complete
    return newPromise.finally(() => {
        // clean up when queue finishes
        if (recordQueues.get(id) === newPromise) {
            recordQueues.delete(id);
        }
    });
}

export const processReadRequest = async (req, res) => {
    const id = req.params.id;

    try {
        const record = await enqueueOperation(id, async () => {
            try {
                const result = await getRecord(id);
                if (!result) {
                    throw new Error("Record not found");
                }
                return result;
            } catch (err) {
                throw new Error(`Failed to read record: ${err.message}`);
            }
        });

        return res.status(200).json({
            success: true,
            message: "Record fetched successfully",
            data: record,
        });
    } catch (err) {
        console.error("Error in GET /:id =>", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Internal Server Error",
        });
    }
};

export const processWriteRequest = async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    try {
        const updatedRecord = await enqueueOperation(id, async () => {
            try {
                const result = await updateRecord(id, body);
                return result;
            } catch (err) {
                throw new Error(`Failed to update record: ${err.message}`);
            }
        });

        return res.status(200).json({
            success: true,
            message: "Record updated successfully",
            data: updatedRecord,
        });
    } catch (err) {
        console.error("Error in POST /:id =>", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Internal Server Error",
        });
    }
};
