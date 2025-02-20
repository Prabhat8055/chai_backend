import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { json } from "express";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //steps to do before register a user*
  //Get user details form frontend*
  //validation -not empty*
  //check if user already exist-email,name *
  //check for images,avtar*
  //upload them in cloudinary,avtar
  //create user object -in db
  //remove password and refresh token field from responce
  //check for user creation
  //return res

  //Get user details form frontend
  const { fullName, email, userName, password } = req.body;
  console.log("email", email);
  //validation -not empty
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!/@/.test(email)) {
    throw new ApiError(400, "Enter a valid email address");
  }
  //check if user already exist-email,name
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or userName already exists");
  }
  // console.log(req.files);
  //check for images,avtar
  const avtarLoacalPath = req.files?.avatar[0]?.path;
  // const coverImageLoacalPath = req.files?.coverImage[0]?.path;
  // coverImage in above line will show undefined if not send

  let coverImageLoacalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLoacalPath = req.files.coverImage[0].path;
  }

  if (!avtarLoacalPath) {
    throw new ApiError(400, "Avatar file is required1");
  }

  //upload them in cloudinary,avtar
  const avtar = await uploadOnCloudinary(avtarLoacalPath);
  const coverImage = await uploadOnCloudinary(coverImageLoacalPath);

  if (!avtar) {
    throw new ApiError(400, "Avtar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName,
  });
  //
  const createdUser = await User.findById(user._id).select(
    //Excludes the password and refreshToken fields from the response.
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponce(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req->body data
  //check in db
  //if exist login
  //else no user found with username/email
  //check password
  //access and refresh token
  //send cookie

  const { userName, email, password } = req.body;
  if (!userName || !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  //now we are accessing the methods form user(avaliable in user.models)
  // NOT User(mongoose's object).
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = generateAccessAndRefereshTokens(
    user._id
  );
  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //adding cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponce(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in successfully"
      )
    );
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
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json(new ApiResponce(200,{},"User loggedOut"));
});

export { registerUser, loginUser, logoutUser };
