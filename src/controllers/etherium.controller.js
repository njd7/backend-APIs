import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Web3 from "web3";

const web3 = new Web3(process.env.INFURA_ENDPOINT);

const ethereumAccount = asyncHandler(async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await web3.eth.getBalance(address);
    // console.log("Here");

    // Convert balance from Wei to Ether
    const etherBalance = web3.utils.fromWei(balance, "ether");
    return res
      .status(200)
      .json(
        new ApiResponse(200, { balance: etherBalance }, "Etherium account balance fetched successfully!")
      );
  } catch (error) {
    throw new ApiError(500, `Failed to retrieve balance from server \n ${error}`, error);
  }
});

export { ethereumAccount };
