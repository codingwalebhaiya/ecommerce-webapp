import express from "express";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import helmet from 'helmet';
import logger from "./utils/logger.util.js";
import compression from 'compression';
import morgan from 'morgan';
import { rateLimiter } from "./middlewares/rate-limiter.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: false,
}));
 
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);


app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true}));

app.use('/api', rateLimiter);

// Static files
app.use('/uploads', express.static('uploads'));


app.use("/api/v1", routes)

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundMiddleware)
app.use(errorMiddleware);

export default app;