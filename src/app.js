import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); // for whitelisting origins that can access backend server
app.use(express.json({ limit: "16kb" })); // to accept json data, max limit=16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser()); // to access and also set the user's browsers cookies, i.e perform CRUD operations on cookies

// routes import
import userRouter from "./routes/user.routes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { securedTest } from "./controllers/securedTest.controller.js";
import { fetchPublicAPIs } from "./controllers/fetchPublicAPI.controller.js";
import { ethereumAccount } from "./controllers/etherium.controller.js";

// routes declaration
app.use("/api/v1/users", userRouter); // Task 1: Implement User Authentication with JWT. Check userRoutes.

app.get("/secured-page", verifyJWT, securedTest); // Task 4: Secure API Endpoint for Authenticated Users Only
app.get("/publicapis", fetchPublicAPIs); // Task 2: Create API Endpoints for Data Retrieval
app.get("/etherium/balance/:address", ethereumAccount); // Task 5: Retrieve Ethereum Account Balance with web3.js
export default app;
