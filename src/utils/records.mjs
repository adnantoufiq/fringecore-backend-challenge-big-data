import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data file path from .env, fallback to default
const dataFilePath = process.env.DATA_FILE_PATH
    ? path.resolve(process.env.DATA_FILE_PATH)
    : path.join(__dirname, "../../data/records.json");

const getAllRecord = () => {
    try {
        const rawData = fs.readFileSync(dataFilePath, "utf-8");
        return JSON.parse(rawData);
    } catch (err) {
        console.error(" Error reading data file:", err.message);
        throw new Error("Failed to read data file");
    }
};

export const recordExists = (id) => {
    const data = getAllRecord();
    return !!data[id];
};

export const getRecord = async (id) => {
    const data = getAllRecord();
    return new Promise((resolve, reject) => {
        if (!data[id]) return reject(new Error("Record not found"));
        setTimeout(() => resolve(data[id]), data[id]?.readDelay || 1000);
    });
};

export const updateRecord = async (id, body) => {
    const data = getAllRecord();
    const existingRecord = data[id];
    if (!existingRecord) throw new Error("Record not found");

    data[id] = { ...existingRecord, ...body };

    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), "utf-8");
                resolve(data[id]);
            } catch (err) {
                reject(new Error("Failed to write data file"));
            }
        }, existingRecord?.writeDelay || 1000);
    });
};

export const deleteRecord = async (id) => {
    const data = getAllRecord();
    delete data[id];
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), "utf-8");
                resolve(data[id]);
            } catch (err) {
                reject(new Error("Failed to write data file"));
            }
        }, 1000);
    });
};