'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import Performance from "@/components/Performance";
import { Avatar, Button, Icon, TextField, Typography } from "@mui/material";
// import {EditIcon} from '@mui/icons-material'
import Image from "next/image";
import Link from "next/link";

import {Student} from '@/interfaces/student'


type Props = {
  params: { id: string };
};


const SingleStudentPage = ({ params }: Props) => {
  const { id } = params;
  const router = useRouter();
  const [student, setStudent] = useState<Student>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const token = Cookies.get("auth_token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!id) return;

      try {
        const response = await fetch(`http://localhost:3030/student/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar aluno");
        }

        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!student) return <div>Aluno não encontrado.</div>;

  return (
    <div className="flex flex-row justify-around py-10 w-[70%] ">

      <div className="flex flex-col items-center space-y-3">
        <Avatar src={student.picture} sx={{ width: 120, height: 120 }} />
        <Typography variant="subtitle1" >{student.name}</Typography>
        <Button variant="outlined">Editar </Button>      
      </div>

      <div className="space-y-3 max-w-2xl w-full">
        <div className="flex justify-between gap-8">
          <div className="w-full">
            <TextField id='name' disabled label='Nome' variant="outlined" size="small" value={student.name} sx={{ width: '100%' }} />
          </div>
          <div className="w-[30%]">
            <TextField id='cpf' disabled label='CPF' variant="outlined" size="small" value={student.cpf} sx={{ width: '100%' }} />
          </div>

        </div>

        <div className="flex justify-between gap-8">
          <div className="w-full">
            <TextField id='email' disabled label='Email' variant="outlined" size="small" value={student.emai} sx={{ width: '100%' }} />
          </div>
          <div className="w-[30%]">
            <TextField id='phone' disabled label='Telefone' variant="outlined" size="small" value={student.phone} sx={{ width: '100%' }} />
          </div>

        </div>

        <hr />

        <Typography variant="h6">Endereço</Typography>

        <div className="flex justify-between gap-6">
          <div className="w-full">
            <TextField id='street' disabled label='Rua' variant="outlined" size="small" value={student.address.street} sx={{ width: '100%' }} />
          </div>
          <div className="">
            <TextField id='neighborhood' disabled label='Bairro' variant="outlined" size="small" value={student.address.neighborhood} sx={{ width: '100%' }} />
          </div>
          <div className="w-[15%]">
            <TextField id='number' disabled label='Número' variant="outlined" size="small" value={student.address.number} sx={{ width: '100%' }} />
          </div>

        </div>

        <div className="flex justify-between gap-6">
          <div className="w-full">
            <TextField id='city' disabled label='Cidade' variant="outlined" size="small" value={student.address.city} sx={{ width: '100%' }} />
          </div>
          <div className="w-[45%]">
            <TextField id='state' disabled label='Estado' variant="outlined" size="small" value={student.address.state} sx={{ width: '100%' }} />
          </div>
          <div className="w-[35%]">
            <TextField id='postalCode' disabled label='CEP' variant="outlined" size="small" value={student.address.postalCode} sx={{ width: '100%' }} />
          </div>

        </div>

        <hr />

        <Typography variant="h6">Matrícula</Typography>

        <div className="flex justify-between gap-6">
          <div className="w-[30%]">
            <TextField id='course-name' disabled label='Curso' variant="outlined" size="small" value={student.course.name} sx={{ width: '100%' }} />
          </div>


        </div>

        <Typography variant="body1">Turmas</Typography>

        {
          student?.classLinks.map(({ class: turma }: any) => (
            <div key={turma.code} className="flex gap-6">

              <div className="">
                <TextField id='class-name' disabled label='Turma' variant="outlined" size="small" value={turma.name} sx={{ width: '100%' }} />
              </div>
              <div className="">
                <TextField id='teacher-name' disabled label='Professor da turma' variant="outlined" size="small" value={turma.teacher.name} sx={{ width: '100%' }} />
              </div>

            </div>

          ))
        }


      </div>


    </div>
  );
};



export default SingleStudentPage;
