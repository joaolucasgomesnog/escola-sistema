'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography
} from "@mui/material";
import { Student } from '@/interfaces/student';
import PrintIcon from '@mui/icons-material/Print';

type Props = {
  params: { id: string };
};

const SingleStudentPage = ({ params }: Props) => {
  const { id } = params;
  const router = useRouter();
const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3030/student/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar aluno");

        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) return <Typography>Carregando...</Typography>;
  if (!student) return <Typography>Aluno não encontrado.</Typography>;

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Perfil do aluno</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined">Editar</Button>
          <Button variant="outlined">
            <PrintIcon />
          </Button>
        </Box>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={2} m={6}>
        <Box display="flex" alignItems="center" gap={2} flexDirection="column">
          <Avatar src={student.picture} sx={{ width: 150, height: 150 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">{student.name.toUpperCase()}</Typography>
        </Box>
      </Box>

      {/* Dados Pessoais */}
      <Typography variant="body1" mb={3}>Dados Pessoais</Typography>

      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Nome" value={student.name} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 2 }}
        />
        <TextField label="CPF" value={student.cpf} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Email" value={student.email} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Telefone" value={student.phone} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1" mb={3}>Endereço</Typography>

      {/* Endereço */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Rua" value={student.address.street} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 2 }}
        />
        <TextField label="Bairro" value={student.address.neighborhood} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Número" value={student.address.number} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 0.5 }}
        />
        <TextField label="Cidade" value={student.address.city} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Estado" value={student.address.state} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 0.5 }}
        />
        <TextField label="CEP" value={student.address.postalCode} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Curso
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField label="Curso" value={student.course.name} size="small" fullWidth
          InputProps={{ readOnly: true }}
          sx={{ flex:1 }}
        />
      </Box> */}

      {/* Turmas */}
      <Typography variant="body1" mb={3}>Matriculas</Typography>
      {student?.classLinks.map(({ class: turma }) => (
        <Box key={turma.code} display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField label="Turma" value={turma.name} size="small" fullWidth
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Professor da turma" value={turma.teacher.name} size="small" fullWidth
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default SingleStudentPage;
