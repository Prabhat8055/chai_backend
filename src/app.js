import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//use cors as a middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

//for limit json file data limit to 16kb
app.use(express.json({ limit: "16kb" }));

//for url configurations
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// for storing ststic files in public folder
app.use(express.static("public"));

//for accessing cookies from user browser

app.use(express.cookieParser());

export default app;
