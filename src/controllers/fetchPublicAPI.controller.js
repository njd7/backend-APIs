import { PUBLIC_API } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fetchPublicAPIs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  let { page = 1, limit = 10 } = req.query;

  // Edge cases handling:

  // if page<0 or limit<0, throws an error [Bad Request]
  // if page==0, return the contents of first page i.e., page=1
  // if limit==0, return no data
  // if limit > total entries, return all the entries. Ignore page number and don't throw an error

  if (page === 0) page = 1;
  if (page < 0 || limit < 0) {
    throw new ApiError(400, "Bad Request");
  }
  if (limit === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No data as limit=0"));
  }

  try {
    const response = await fetch(PUBLIC_API);
    const data = await response.json();
    const { entries } = data;

    let maxEntries = entries.length;
    let maxPages = Math.ceil(maxEntries / limit);

    // Edge cases handling: if limit exceeds max entries or page exceeds max pages
    if (limit > maxEntries) {
      page = 1;
      limit = maxEntries;
    } else if (page > maxPages) {
      page = maxPages;
    }

    let limitedEntries;
    if (!category) {
      limitedEntries = entries.filter((entry, index) => {
        return index >= (page - 1) * limit && index < page * limit;
      });

      return res.status(200).json(new ApiResponse(200, limitedEntries, "APIs fetched successfully!"));
    }

    // fetched based on category through query parameter
    const filteredEntries = entries.filter((entry) => {
      return entry["Category"].toLowerCase().includes(category.toLowerCase());
    });

    maxEntries = filteredEntries.length;
    maxPages = Math.ceil(maxEntries / limit);

    // Edge cases handling: if limit exceeds max entries or page exceeds max pages
    if (limit > maxEntries) {
      page = 1;
      limit = maxEntries;
    } else if (page > maxPages) {
      page = maxPages;
    }

    limitedEntries = filteredEntries.filter((entry, index) => {
      return index >= (page - 1) * limit && index < page * limit;
    });

    return res
      .status(200)
      .json(new ApiResponse(200, limitedEntries, "Category based public API entries successfully fetched!"));
  } catch (error) {
    throw new ApiError(502, "Failed to reach the public API server");
  }
});

export { fetchPublicAPIs };
