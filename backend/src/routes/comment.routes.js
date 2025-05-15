
import Comment from "../modules/Comment/index.js";
import { Router } from "express";

const commentRoutes = Router();

commentRoutes.post("/", Comment.createComment)
commentRoutes.get("/:postId", Comment.findCommentsByPost)
commentRoutes.get("/:id", Comment.findCommentById)
commentRoutes.get("/:userId", Comment.findCommentsByUser)
commentRoutes.put("/:id", Comment.updateComment)
commentRoutes.delete("/:id", Comment.deleteCommentById)


export {commentRoutes}