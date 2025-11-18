'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import PrintIcon from '@mui/icons-material/Print';
import { Class } from "@/interfaces/class";
import { Student } from "../../../../../interfaces/student";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BASE_URL } from "../../../../constants/baseUrl";

dayjs.extend(utc);

const weekdays = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
];

interface SingleClassPageProps {
  params: { id: string };
}

const SingleClassPage = ({ params }: SingleClassPageProps) => {
  const { id } = params;
  const router = useRouter();

  const [turma, setTurma] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTurma, setNewTurma] = useState<Partial<Class>>({});
  const [schedule, setSchedule] = useState<Record<string, string>>({});


  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha da turma - ${new Date().toLocaleDateString()}`,
  });

  useEffect(() => {
    const fetchClass = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/sign-in");

      try {
        const res = await fetch(`${BASE_URL}/class/get-by-id/${id}`, {
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
      if (!token) return router.push("/sign-in");

      try {
        const res = await fetch(`${BASE_URL}/student/getall-by-class/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar alunos");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClass();
    fetchStudents();
  }, [id]);

  const updateClass = async () => {
    if (!newTurma) {
      console.error("newTurma is null");
      return;
    }

    if (!newTurma.startDate || !newTurma.endDate) {
      alert("Preencha as datas");
      return;
    }

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${BASE_URL}/class/update/${id}`, {
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

  const studentColumns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "cpf", headerName: "CPF", flex: 1 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "phone", headerName: "Telefone", flex: 1 },

  ];

  if (loading) return (
    <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Box>)
  if (!turma) return <Typography>Turma não encontrada.</Typography>;

  return (
    <Box p={3} bgcolor="white" className="dark:bg-dark" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
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
        <TextField
          label="Data de início"
          size="small"
          type="date"
          value={
            isEditing
              ? newTurma?.startDate?.split("T")[0] ?? ""
              : turma.startDate.split("T")[0] ?? ""
          }
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, startDate: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }} // Força o label a subir
          inputProps={{ placeholder: "" }}    // Remove o mm/dd/yyyy
          sx={{ flex: 2 }}
        />
        <TextField
          label="Data de término"
          size="small"
          type="date"
          value={isEditing ? newTurma?.endDate?.split("T")[0] ?? "" : turma.endDate.split("T")[0] ?? ""}
          onChange={(e) => isEditing && setNewTurma({ ...newTurma, endDate: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }} // Força o label a subir
          inputProps={{ placeholder: "" }}    // Remove o mm/dd/yyyy
          sx={{ flex: 2 }}
        />
      </Box>
      <Typography variant="body1">Horarios</Typography>


      <Box display="flex" flexWrap="wrap" flexDirection='column' gap={2} my={4}>

        {Object.entries(turma?.horario ?? {})
          .filter(([_, timeValue]) => timeValue !== null)
          .map(([dayKey, timeValue]) => {
            const label = weekdays.find((d) => d.key === dayKey)?.label;

            return (
              <Box key={dayKey} display="flex" gap={2} mb={1}>
                <TextField
                  label="Dia"
                  value={label ?? ""}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ width: 200 }}

                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Hora"
                    value={dayjs(timeValue as string)}
                    onChange={(newValue) => {
                      if (newValue) {
                        const utcIso = dayjs(newValue).utc().toISOString();
                        setSchedule((prev) => ({
                          ...prev,
                          [dayKey]: utcIso,
                        }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            );
          })}





      </Box>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1" mb={2}>Alunos matriculados</Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={students}
          columns={studentColumns}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* <Box sx={{ display: "none" }}>
        <ClassReport ref={printRef} class={turma} students={students} />
      </Box> */}
    </Box>
  );
};

export default SingleClassPage;
