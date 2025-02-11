const asyncHandler = (requsetHandeler) => {
  (req, res, next) => {
    Promise.resolve(requsetHandeler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

// const exampleFunction = () => {};
//   //higher order function
// const exampleFunction = (func) => () => {};
// const exampleFunction = (func) => async () => {};

//try catch example:-

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
