import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";


export default async function autenticateToken(req, res, next){
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]
  
  const SECRET_KEY = process.env.JWT_SECRET;

  if(!token){
    return res.status(401).json({error: "Token nao fornecido"})
  }

  console.log("token", token)

  const tokenInBlackList = await prisma.blackListToken.findUnique({where: {token}})

  if(tokenInBlackList){
    return res.status(403).json({error: "Token invalido - está na blacklist"})
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if(err){
      console.log(err)
      return res.status(403).json({error: "Token invalido"})
    }

    req.userId = decoded.userId
    req.role = decoded.role

    next()
  })
}