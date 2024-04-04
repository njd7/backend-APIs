import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const securedTest = asyncHandler(async (_, res) => {
  return res.status(200).json(new ApiResponse(200, {}, "Congrats! You have access to secured content!"));
});

export { securedTest };
