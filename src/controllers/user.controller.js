import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    // console.log("Generated refresh token: ", refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generation refresh and access tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  // validation for not empty
  // console.log("username: ", username);
  // console.log("email: ", email);
  // console.log("fullName: ", fullName);
  // console.log("password: ", password);
  if ([username, email, fullName, password].some((field) => !field || field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  // Check for existing user

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new ApiError(400, "User already exists! [username/email already in use]");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user!");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User created Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Take username and password from frontend
  // validation - both username and password are provided
  // Check if username (lowercase) exists
  // Check if password is correct
  // Generate refresh and access token
  // return response

  const { username, email, password } = req.body;
  // console.log("Username: ", username, email, password);

  if ((!username && !email) || !password) {
    // throw error when both username and email are not provided or when password is not provided
    throw new ApiError(400, "Provide both username/email and password");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist");
  }

  const validPassword = await existingUser.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate refresh and access tokens

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id);

  const user = await User.findById(existingUser._id).select("-password -refreshToken");

  // prepare cookies

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: user, accessToken, refreshToken }, "Login successful!"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // returned response from DB will have new updated values
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // receive refreshToken from FE
  // check if valid
  // if YES, generate new access and refresh token
  try {
    const refreshTokenFE = req.cookies?.refreshToken || req.body.refreshToken;

    // console.log("Refresh Token from cookies: \n", refreshTokenFE, "\n\n");
    if (!refreshTokenFE) {
      throw new ApiError(401, "Unauthorized request");
    }

    // console.log("Check");

    const decodedRefreshTokenFE = jwt.verify(refreshTokenFE, process.env.REFRESH_TOKEN_SECRET);

    if (!decodedRefreshTokenFE) {
      throw new ApiError(401, "Invalid refresh token 1");
    }

    const user = await User.findById(decodedRefreshTokenFE?._id).select("-password");
    // console.log("User: \n\n", user);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token 2");
    }

    if (refreshTokenFE !== user?.refreshToken) {
      // console.log(refreshTokenFE, "\n\n", user?.refreshToken);
      throw new ApiError(401, "Invalid refresh token 3");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    //
    // console.log("Refresh token in user after: \n\n", user.refreshToken);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // console.log("User after refreshing access and refresh token: \n\n", user);
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token 4");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Fetched current user successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, email },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Account details updated"));
});

// here in this implementation, upon updating password, user does NOT get logged out from previous session automatically
const updatePassword = asyncHandler(async (req, res) => {
  // take old and new password from FE
  // check if old password is correct
  // update password

  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const isValidPassword = await user.isPasswordCorrect(oldPassword);

    if (!isValidPassword) {
      throw new ApiError(401, "Incorrect old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password updated"));
  } catch (error) {
    throw new ApiError(401, "Invalid credentials");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  updatePassword,
};
