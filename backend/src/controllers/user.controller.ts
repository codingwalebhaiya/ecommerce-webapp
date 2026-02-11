//import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";


const myProfile = asyncHandler(async (req, res) => {

   // const user = await User.findById(req.user?._id).select("-password");

   const user = req.user;
   

    if (!user) {
        throw new Error("User not found");
    }

    res.json({
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });


});

export { myProfile }