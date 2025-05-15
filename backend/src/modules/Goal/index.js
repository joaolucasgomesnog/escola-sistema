import { prisma } from "../../lib/prisma.js"

export default {
    async createGoal(req, res){
        const { user_id, title, description } = req.body
        
        try {
            const goal = await prisma.goal.create({
                data: {
                    user_id,
                    title,
                    description,
                }
            })
            return res.json(goal)
        } catch (error) {
            console.error('Erro while creating goal', error)
            res.status(500).json({error: 'Erro while creating goal'})        
        }
    },
    async getAllGoalsByUser(req, res){
        const {user_id} = req.body

        try {
            const goals = await prisma.goal.findMany({
                where: {
                    user_id: Number(user_id)
                }
            })
            return res.json(goals)
        } catch (error) {
            console.error('Erro while getting all goals', error)
            res.status(500).json({error: 'Erro while getting all goals'})
        }
    },
    async updateGoal(req, res){
        const {id , title, description, status} = req.body
        
        try {
            const goal = await prisma.goal.update({
                where: { id: Number(id) }, 
                data: {
                    title,
                    description,
                    status,
                }

            })
            return res.json(goal)
        } catch (error) {
            console.error('Erro while updating goal', error)
            res.status(500).json({error: 'Erro while updating goal'})  
        }
    },
    async deleteGoalById(req, res){
        const {id} = req.body
        
        try {
            const goal = await prisma.goal.delete({
                where: { id: Number(id) }
            })
            return res.json(goal)
        } catch (error) {
            console.error('Erro while deleting goal', error)
            res.status(500).json({error: 'Erro while deleting goal'})  
        }
    },
    async deleteAllGoalsByUser(req, res){
        const {user_id} = req.body
        try {
            const goals = await prisma.goal.deleteMany({
                where: {
                    user_id: Number(user_id)
                }
            })
            return res.json(goals)
        } catch (error) {
            console.error('Erro while deleting all goals', error)
            res.status(500).json({error: 'Erro while deleting all goals'})  
        }
    },
}