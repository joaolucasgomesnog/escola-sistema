import post from "../modules/Post/index.js";
import { Router } from "express";

const postRoutes = Router()

postRoutes.post('/', post.createPost)
postRoutes.delete('/:id', post.deletePost)
postRoutes.put('/:id', post.updatePost)
postRoutes.get('/:user_id/feed/page/:page', post.getFeed)
postRoutes.get('/list/:id', post.getAllPostsById)
postRoutes.get('/:user_id/:visitor_id/list/page/:page', post.getPostsByUser)

postRoutes.get('/:post_id', post.getPostById)

postRoutes.put('/:post_id/:user_id/like', post.likePost)
postRoutes.put('/:post_id/:user_id/dislike', post.dislikePost)
postRoutes.put('/:post_id/:user_id/comment', post.commentPost)

export { postRoutes }