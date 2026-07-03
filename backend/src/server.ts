
import app from './app.js';
import logger from './utils/logger.util.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';


const PORT = parseInt(env.PORT || '5000', 10);
const NODE_ENV = env.NODE_ENV || 'development';

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            logger.info(
                `Server running on http://localhost:${PORT} (${NODE_ENV})`
            );
        });
    } catch (error) {
        logger.error(error);

        process.exit(1);
    }
};

startServer();

