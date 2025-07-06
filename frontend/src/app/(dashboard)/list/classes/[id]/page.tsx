'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  Divider,
  TextField,
  Typography
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import PrintIcon from '@mui/icons-material/Print';
import { Class } from "@/interfaces/class";
import { Student } from "../../../../../interfaces/student";

const SingleClassPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  const [turma, setTurma] = useState<Class>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTurma, setNewTurma] = useState<Class>(null);

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha da turma - ${new Date().toLocaleDateString()}`,
  });

  useEffect(() => {
    const fetchClass = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`http://localhost:3030/class/get-by-id/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar turma");
        const data = await res.json();
        setTurma(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`http://localhost:3030/student/getall-by-class/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar alunos");
        const data = await res.json();
        console.log(data)
        setStudents(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClass();
    fetchStudents();
  }, [id]);

  const updateClass = async () => {
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`http://localhost:3030/class/update/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTurma,
          startDate: new Date(newTurma.startDate),
          endDate: new Date(newTurma.endDate)
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Erro ao atualizar turma");
      setTurma(data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;
  if (!turma) return <Typography>Turma não encontrada.</Typography>;

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Perfil da turma</Typography>
        <Button variant="outlined" onClick={handlePrint}><PrintIcon /></Button>
      </Box>

      <Box display="flex" alignItems="center" gap={2} flexDirection="column" m={6}>
        <Avatar src={turma.image} sx={{ width: 150, height: 150 }} />
        <Typography variant="h6" fontWeight="bold" color="primary">{turma.name.toUpperCase()}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Informações da turma</Typography>
        {isEditing
          ? <Button variant="contained" onClick={updateClass}>Salvar</Button>
          : <Button
            variant="outlined"
            onClick={() => {
              setIsEditing(true);
              setNewTurma({ ...turma });
            }}
          >
            Editar
          </Button>
        }
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField
          label="Nome"
          size="small"
          value={isEditing ? newTurma?.name ?? "" : turma.name ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, name: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Código"
          size="small"
          value={isEditing ? newTurma?.code ?? "" : turma.code ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, code: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Turno"
          size="small"
          value={isEditing ? newTurma?.turno ?? "" : turma.turno ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, turno: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField
          label="Horário"
          size="small"
          value={isEditing ? newTurma?.horario ?? "" : turma.horario ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, horario: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Data de início"
          size="small"
          type="date"
          value={isEditing ? newTurma?.startDate.split("T")[0] ?? "" : turma.startDate.split("T")[0] ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, startDate: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true } } // Força o label a subir
          inputProps={{ placeholder: "" } }    // Remove o mm/dd/yyyy
          sx={{ flex: 2 }}
        />
        <TextField
          label="Data de término"
          size="small"
          type="date"
          value={isEditing ? newTurma?.endDate.split("T")[0] ?? "" : turma.endDate.split("T")[0] ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, endDate: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true } } // Força o label a subir
          inputProps={{ placeholder: "" } }    // Remove o mm/dd/yyyy
          sx={{ flex: 2 }}
        />


      </Box>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1" mb={2}>Alunos matriculados</Typography>

      {students?.map((student) => (
        <Box key={student.id} display="flex" gap={2} mb={2}>
          <TextField label="Nome" value={student.name ?? ""} size="small" InputProps={{ readOnly: true }} sx={{ flex: 2 }} />
          <TextField label="CPF" value={student.cpf ?? ""} size="small" InputProps={{ readOnly: true }} sx={{ flex: 1 }} />
          <TextField
            label="Email"
            value={student.email ?? ""}
            size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 2 }}
          />
        </Box>
      ))}

      {/* <Box sx={{ display: "none" }}>
        <ClassReport ref={printRef} class={turma} students={students} />
      </Box> */}
    </Box>
  );
};

export default SingleClassPage;
