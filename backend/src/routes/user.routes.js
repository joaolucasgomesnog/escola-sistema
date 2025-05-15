
import user from "../modules/User/index.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/", user.createUser)
userRoutes.post("/check", user.checkUserAlreadyExists)
userRoutes.get("/list", user.findAllUsers)
userRoutes.get("/list/filter", user.filterAllUsers)
// userRoutes.get("/list/id", user.fidUserIdByEmail)
userRoutes.get("/:id", user.findUserById)
userRoutes.get("/:id/followers", user.getFollowers)
userRoutes.get("/:id/followings", user.getFollowings)

userRoutes.get("/:visitor_id/:user_id/following_status", user.getFollowingStatus)
userRoutes.put("/:visitor_id/:user_id/unfollow", user.unfollow)
userRoutes.put("/:visitor_id/:user_id/follow", user.follow)
userRoutes.get("/username/:username", user.findUserByUsername)
userRoutes.get("/email/:email", user.findUserByEmail)
userRoutes.put("/:id", user.updateUser)
userRoutes.put("/update_tokens/:id", user.updateUserTokens)
userRoutes.delete("/delete_token/:id", user.deleteUserToken)
userRoutes.delete("/:id", user.deleteUserById)

userRoutes.get("/contact/list/:user_id", user.getContactListByUserId)
userRoutes.put("/contact/:user_id", user.setContactToUser)


export {userRoutes}