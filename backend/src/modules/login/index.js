import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET

export default {

  async login(req, res) {
      try {
        const { cpf, password } = req.body;
        
        const admin = await prisma.admin.findUnique({where: {cpf}})
        const teacher = await prisma.teacher.findUnique({where: {cpf}})
        const student = await prisma.student.findUnique({where: {cpf}})
        
        let payload;
        let user = admin || teacher || student

        if(admin){
          payload = {adminId: admin.id, role: 'admin', user:{name:admin.name, phone: admin.phone, picture:admin.picture}}
        }else if(teacher){
          payload = {teacherId: teacher.id, role: 'teacher', user:{name:teacher.name, phone: teacher.phone, picture:teacher.picture}}
        }else if(student){
          payload = {studentId: student.id, role: 'student', user:{name:student.name, phone: student.phone, picture:student.picture}}
        }else{
          return res.status(404).json({error: "usuario nao cadastrado"})
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password)
  
        if(!passwordMatch){
          return res.status(401).json({error: "cpf ou senha invalidos"})
        }
        
        const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'})
  
        return res.status(200).json({ token, currentRole: payload.role, message: 'login successfull' });

      } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro interno ao fazer login" });
      }
    },
  
}