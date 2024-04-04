import { Router } from "express";
import { securedTest } from "../controllers/securedTest.controller.js";
import { fetchPublicAPIs } from "../controllers/fetchPublicAPI.controller.js";
import { ethereumAccount } from "../controllers/etherium.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints related to user authentication and authorization
 *
 * /misc/secured-page:
 *   get:
 *     summary: Get secured content
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved secured content
 *       401:
 *         description: Unauthorized access
 */
router.route("/secured-page").get(verifyJWT, securedTest);

/**
 * @swagger
 * tags:
 *   name: PublicAPI
 *   description: Endpoints for fetching public APIs
 *
 * /misc/publicapis:
 *   get:
 *     summary: Fetch public APIs
 *     tags: [PublicAPI]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter APIs by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved public APIs
 *       400:
 *         description: Bad request
 *       502:
 *         description: Failed to reach the public API server
 */
router.route("/publicapis").get(fetchPublicAPIs);

/**
 * @swagger
 * tags:
 *   name: Ethereum
 *   description: Endpoints for interacting with Ethereum blockchain
 *
 * /misc/etherium/balance/{address}:
 *   get:
 *     summary: Get Ethereum account balance
 *     tags: [Ethereum]
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum account address
 *     responses:
 *       200:
 *         description: Successfully retrieved Ethereum account balance
 *       500:
 *         description: Failed to retrieve balance from server
 */
router.route("/etherium/balance/:address").get(ethereumAccount);

export default router;
