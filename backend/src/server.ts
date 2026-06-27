import app from "./app.js";
import dotenv from "dotenv";
import database from "./config/db.js";
import logger from "./utils/logger.util.js";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await database.connect();
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

