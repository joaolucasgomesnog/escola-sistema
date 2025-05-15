// import { prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";


export default{

    async createComment(req, res) {
        const { user_id, post_id, description } = req.body;

        try {
            const comment = await prisma.comment.create({
                data: {
                    user_id,
                    post_id,
                    description,
                }
            });

            res.json(comment);
        } catch (error) {
            console.error('Error while creating comment:', error);
            res.status(500).json({ error: 'Error while creating comment' });
        }
    },

    async findCommentsByPost(req, res) {
        try {
            const { post_id } = req.params
            const comments = await prisma.comment.findMany({ where: { post_id: Number(post_id) }})
            return res.json(comments)

        } catch (error) {
            return res.json({ error })
        }
    },

    async findCommentsByUser(req, res) {
        try {
            const { id } = req.params
            const comments = await prisma.comment.findMany({ where: { user_id: Number(id) }})
            return res.json(comments)

        } catch (error) {
            return res.json({ error })
        }
    },
    async findCommentById(req, res) {
        try {
            const { id } = req.params
            const comment = await prisma.comment.findUnique({ where: { id: Number(id) }})
            return res.json(comment)

        } catch (error) {
            return res.json({ error })
        }
    },



    async updateComment(req, res) {
        try {
            const { id } = req.params

            const { description } = req.body;

            let comment = await prisma.comment.findUnique({ where: { id: Number(id) } })
            if (!comment)
                return res.status(404).json({ error: "Comment does not exist" })

            comment = await prisma.comment.update({ 
                where: { id: Number(id) }, 
                data: {
                    description,
                }
            });
            return res.json(comment)

        } catch (error) { 
            console.error(error)
            return res.status(500).json({ error: "It was not possible to update comment" }) 
        }
    },

    async deleteCommentById(req, res) {
        try {
            const { id } = req.params
            let comment = await prisma.comment.findUnique({ where: { id: Number(id) } })
            if (!comment) return res.json({ error: "Comment does not exist" })
            await prisma.comment.delete({ where: { id: Number(id) } })
            return res.json({message: "Comment deleted"})
        } catch (error) {
            return res.json({ error })
        }
    },
}