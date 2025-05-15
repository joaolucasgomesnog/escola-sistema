
import { prisma } from "../../lib/prisma.js";
import Notification from '../Notification/index.js'

export default {

    async createPost(req, res) {
        const { user_id, description, media_url } = req.body
        try {
            const post = await prisma.post.create({
                data: {
                    userId:user_id,
                    description,
                    media_url,
                }
            })
            res.json(post)
        } catch (error) {
            console.error('Erro while creating post', error)
            res.status(500).json({ error: 'Erro while creating post' })
        }

    },
    async deletePost(req, res) {
        const { id } = req.params
        const post_id = parseInt(id)
        try {

            const deleted_post = await prisma.post.delete({
                where: {
                    id: post_id
                }
            })
            res.json(deleted_post)
        } catch (error) {
            console.error('Erro while creating post', error)
            res.status(500).json({ erro: 'Erro while deleting post', error })
        }

    },
    async updatePost(req, res) {
        const { id } = req.params
        const { description } = req.body
        const post_id = parseInt(id)

        try {
            const updated_post = await prisma.post.update({
                where: {
                    id: post_id,

                },
                data: {
                    description,
                }
            })
            res.json(updated_post)
        } catch (error) {
            console.error('Erro while creating post', error)
            res.status(500).json({ erro: 'Erro while updating post', error })
        }


    },
    async getFeed(req, res) {
        const { user_id, page} = req.params; // Supondo que o ID do usuário vem dos parâmetros da requisição

        try {
            const all_posts = await prisma.post.findMany({
                skip: (Number(page)-1)*10,
                take: 10,
                include: {
                    User: {
                        select: {
                            username: true,
                            profile_pic_url: true,
                            name: true,
                        },
                    },
                    like: {
                        where: {
                            user_id: user_id,
                        },
                    },
                    comment: {
                        include:{
                            user:{
                                select:{
                                    username:true,
                                    name:true,
                                    profile_pic_url:true
                                }
                            }
                        }
                    }
                },
            });


            res.json(all_posts);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            res.status(500).json({ erro: 'Erro ao buscar posts', error });
        }
    },
    async getPostsByUser(req, res) {
        const { user_id, visitor_id, page } = req.params; // Supondo que o ID do usuário vem dos parâmetros da requisição

        try {
            const all_posts = await prisma.post.findMany({
                skip: (Number(page)-1)*10,
                take: 10,
                where:{
                    userId: user_id
                },
                include: {
                    User: {
                        select: {
                            username: true,
                            profile_pic_url: true,
                            name: true,
                        },
                    },
                    like: {
                        where: {
                            user_id: visitor_id,
                        },
                    },
                    comment: {
                        include:{
                            user:{
                                select:{
                                    username:true,
                                    name:true,
                                    profile_pic_url:true
                                }
                            }
                        }
                    }
                },
            });


            res.json(all_posts);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            res.status(500).json({ erro: 'Erro ao buscar posts', error });
        }
    },
    async getAllPostsById(req, res) {
        const { id } = req.params
        const post_id = parseInt(id)
        try {
            const allPosts = await prisma.post.findMany({
                where: {
                    id: post_id
                }
            })
            res.json(allPosts)
        } catch (error) {
            console.error('Erro while creating post', error)
            res.status(500).json({ erro: 'Erro while updating post', error })
        }
    },
    async likePost(req, res) {
        const { user_id, post_id } = req.params;

        try {
            // Cria o like
            const like = await prisma.like.create({
                data: {
                    post_id,
                    user_id,
                },
            });

            if (like) {
                // Busca o post atual para obter o valor de count_likes
                const post = await prisma.post.findUnique({
                    where: {
                        id: post_id,
                    },
                    select: {
                        count_likes: true, // Busca apenas o campo count_likes
                    },
                });

                // Atualiza o campo count_likes
                const updated_post = await prisma.post.update({
                    where: {
                        id: post_id,
                    },
                    data: {
                        count_likes: post.count_likes + 1, // Incrementa o valor atual de count_likes
                    },
                });

                //pega o id do dono do post para criar a notificação
                const postOwner = await prisma.post.findUnique({
                    where: {id: post_id},
                    select: {
                        userId: true,
                    }
                })

                const newNotification = await Notification.createNotification("like", postOwner.userId, user_id, post_id )
                
                console.log(newNotification)
                res.json(updated_post);

            }
        } catch (error) {
            console.error('Erro ao criar like e atualizar o post:', error);
            res.status(500).json({ erro: 'Erro ao atualizar o post', error });
        }
    },

    async dislikePost(req, res) {
        const { user_id, post_id } = req.params;

        try {
            // Cria o like
            const like = await prisma.like.delete({
                where: {
                    user_id_post_id: {
                      user_id: user_id, // o ID do usuário
                      post_id: post_id // o ID do post
                    },
                }
            });

            if (like) {
                // Busca o post atual para obter o valor de count_likes
                const post = await prisma.post.findUnique({
                    where: {
                        id: post_id,
                    },
                    select: {
                        count_likes: true, // Busca apenas o campo count_likes
                    },
                });

                // Atualiza o campo count_likes
                const updated_post = await prisma.post.update({
                    where: {
                        id: post_id,
                    },
                    data: {
                        count_likes: post.count_likes - 1, // Incrementa o valor atual de count_likes
                    },
                });

                res.json(updated_post);
            }
        } catch (error) {
            console.error('Erro ao criar like e atualizar o post:', error);
            res.status(500).json({ erro: 'Erro ao atualizar o post', error });
        }
    },

    async commentPost(req, res) {
        const { user_id, post_id } = req.params;
        const { description } = req.body;
        try {
            // Cria o comment
            const comment = await prisma.comment.create({
                data: {
                    post_id: post_id,
                    user_id: user_id,
                    description,
                },
            });

            if (comment) {
                // Busca o post atual para obter o valor de count_comments
                const post = await prisma.post.findUnique({
                    where: {
                        id: post_id,
                    },
                    select: {
                        count_comments: true, // Busca apenas o campo count_comments
                    },
                });

                // Atualiza o campo count_comments
                const updated_post = await prisma.post.update({
                    where: {
                        id: post_id,
                    },
                    data: {
                        count_comments: post.count_comments + 1, // Incrementa o valor atual de count_comments
                    },
                });

                //pega o id do dono do post para salvar a notificação
                const postOwner = await prisma.post.findUnique({
                    where: {id: post_id},
                    select: {
                        userId: true,
                    }
                })

                const newNotification = await Notification.createNotification("comment", postOwner.userId, user_id, post_id )
                console.log(newNotification)

 
                res.json(updated_post);
            }
        } catch (error) {
            console.error('Erro ao criar comment e atualizar o post:', error);
            res.status(500).json({ erro: 'Erro ao atualizar o post', error });
        }
    },

    async sharePost(req, res) {
        const { user_id, post_id } = req.params;
        try {
            // Cria o comment
            const share = await prisma.share.create({
                data: {
                    post_id: post_id,
                    user_id: user_id,
                },
            });

            if (share) {
                // Busca o post atual para obter o valor de count_shares
                const post = await prisma.post.findUnique({
                    where: {
                        id: post_id,
                    },
                    select: {
                        count_shares: true, // Busca apenas o campo count_shares
                    },
                });

                // Atualiza o campo count_shares
                const updated_post = await prisma.post.update({
                    where: {
                        id: post_id,
                    },
                    data: {
                        count_shares: post.count_shares + 1, // Incrementa o valor atual de count_comments
                    },
                });

                res.json(updated_post);
            }
        } catch (error) {
            console.error('Erro ao arquivar compartilhamento e atualizar o post:', error);
            res.status(500).json({ erro: 'Erro ao atualizar o post', error });
        }
    },


    async getPostById(req, res){
        try {
            const { post_id } = req.params

            const post = await prisma.post.findUnique({
                where: { id: post_id }
            })

            if(!post){
                return res.status(404).json({error: "O post não existe"})
            }

            res.status(200).json(post)

        } catch (error) {
            res.json({error: "Error while getting post"})
            console.log("Erro no get post by id", error)
        }
    }
}
