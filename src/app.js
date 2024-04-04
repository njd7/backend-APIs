import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Carbon Cell API Assignment",
      version: "1.0.0",
      description:
        "API documentation for user authentication, checking secured routes, retrieving public APIs data through filtering ",
    },
    servers: [
      {
        url: "http://localhost:8000/api/v1",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// console.log("Swagger specs: ", swaggerDocs);
app.get("/", (req, res) => {
  res.send("<h1>Carbon cell assignment</h1><h2>Please go to /api-docs to assess swagger documentation</h2>");
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); // for whitelisting origins that can access backend server
app.use(express.json({ limit: "16kb" })); // to accept json data, max limit=16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser()); // to access and also set the user's browsers cookies, i.e perform CRUD operations on cookies

// routes import
import userRouter from "./routes/user.routes.js";
import miscRouter from "./routes/misc.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter); // Task 1: Implement User Authentication with JWT. Check userRoutes.
app.use("/api/v1/misc", miscRouter); // Task 2, 4, 5
// app.get("/api/v1/secured-page", verifyJWT, securedTest); // Task 4: Secure API Endpoint for Authenticated Users Only
// app.get("/api/v1/publicapis", fetchPublicAPIs); // Task 2: Create API Endpoints for Data Retrieval
// app.get("/api/v1/etherium/balance/:address", ethereumAccount); // Task 5: Retrieve Ethereum Account Balance with web3.js
export default app;
