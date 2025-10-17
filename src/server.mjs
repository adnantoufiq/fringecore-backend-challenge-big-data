import express from "express";
import dotenv from "dotenv";
import { processReadRequest, processWriteRequest } from "./handler.mjs";
import {
    validateRecordExists,
    validateWriteBody,
} from "./utils/middleware.mjs";

dotenv.config(); 

const app = express();

app.use(express.json());

app.get("/:id", validateRecordExists, processReadRequest);
app.post("/:id", validateRecordExists, validateWriteBody, processWriteRequest);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
