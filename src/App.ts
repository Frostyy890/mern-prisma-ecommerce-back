import express from "express";
import cookieParser from "cookie-parser";
import configuration from "./config/configuration";
import { AppRoutes } from "./routes/AppRoutes";
import Logger from "./middlewares/Logger";
import { connectToDB } from "./config/db";
import ErrorHandler from "./middlewares/ErrorHandler";
import { HttpException } from "./utils/HttpExceptions";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Middlewares
app.use(Logger);

//Routes
app.use("/api", AppRoutes);
//Handling not existing routes
app.use((_req, _res, next) => {
  next(new HttpException(404, "Route not found"));
});
//Error handling
app.use(ErrorHandler);

const initializeApp = async () => {
  try {
    const { port } = configuration.app;
    app.listen(port, () => {
      console.log(`[server]: server is running at http://localhost:${port}/api`);
    });
    await connectToDB();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

initializeApp();
