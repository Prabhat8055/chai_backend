import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

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
  const { fullname, email, userName, password } = req.body;
  console.log("email", email);
  //validation -not empty
  if (
    [fullname, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!/@/.test(email)) {
    throw new ApiError(400, "Enter a valid email address");
  }
  //check if user already exist-email,name
  const existedUser = User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //check for images,avtar
  const avtarLoacalPath = req.files?.avtar[0]?.path;
  const coverImageLoacalPath = req.files?.coverImage[0]?.path;
  if (!avtarLoacalPath) {
    throw new ApiError(400, "Avtar file is required1");
  }

  //upload them in cloudinary,avtar
  const avtar = await uploadOnCloudinary(avtarLoacalPath);
  const coverImage = await uploadOnCloudinary(coverImageLoacalPath);

  if (!avtar) {
    throw new ApiError(400, "Avtar file is required1");
  }

  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //
  const createdUser = await User.findById(user._id).select(
    //Excludes the password and refreshToken fields from the response.
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponce(200,createdUser,"User Registered Successfully")
  )


});

export { registerUser };
