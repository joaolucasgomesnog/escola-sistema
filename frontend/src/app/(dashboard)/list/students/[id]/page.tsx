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
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";

type Props = {
  params: { id: string };
};

const SingleStudentPage = ({ params }: Props) => {
  const { id } = params;
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  const [newStudent, setNewStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
        console.log("Dados do aluno:", data);
        setStudent(data);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
    fetchStudentFees(Number(id));
  }, [id]);

  const updateStudent = async () => {
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`http://localhost:3030/student/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify(newStudent)
      })

      const data = await res.json()

      if (!res.ok) throw new Error("Erro ao atualizar aluno");
      setStudent(data)

    } catch (error) {
      console.error("Erro:", error);

    } finally {
      setIsEditing(false)
    }
  }

  const fetchStudentFees = async (studentId: number) => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3030/fee/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do aluno.");

      const data = await response.json();
      console.log("Mensalidades do aluno:", data);
      setFees(data);
    } catch (error) {
      console.error("Erro ao carregar mensalidades:", error);
    }
  };


  const feeColumns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "description", headerName: "Descrição", flex: 2 },
    {
      field: "price",
      headerName: "Valor",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">

          <Typography variant="body2">
            R$ {Number(params.value).toFixed(2).replace('.', ',')}
          </Typography>
        </Box>
      )
    },
    {
      field: "dueDate",
      headerName: "Vencimento",
      flex: 0.5,
      valueFormatter: ({ value }) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      field: "paymentDate",
      headerName: "Data do Pagamento",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<any>) => {
        const payment = params.row?.payments?.[0];
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Typography variant="body2">
              {payment?.createdAt ? dayjs(payment.createdAt).format("DD/MM/YYYY") : "—"}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "paymentType",
      headerName: "Forma de Pagamento",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<any>) => {
        const payment = params.row?.payments?.[0];
        return (
          <Box display="flex" alignItems="center" height="100%">

            <Typography variant="body2" alignSelf={"center"}>
              {payment?.paymentType ?? "—"}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "adminName",
      headerName: "Recebedor",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<any>) => {
        const payment = params.row?.payments?.[0];
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Typography variant="body2">
              {payment?.admin?.name ?? "—"}
            </Typography>
          </Box>
        );
      }
    }
  ];

  const handleEdit = () => {
    setIsEditing(true)
    setNewStudent({ ...student })
  }


  if (loading) return <Typography>Carregando...</Typography>;
  if (!student) return <Typography>Aluno não encontrado.</Typography>;

  return (
    <Box
      p={3}
      bgcolor="white"
      borderRadius={2}
      m={2}
      sx={{
        height: 'calc(100vh - 64px)', // altura total da viewport menos o header, ajuste se necessário
        overflowY: 'auto'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Perfil do aluno</Typography>
        <Box display="flex" gap={2}>

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Dados Pessoais</Typography>
        {
          isEditing ? (
            <Button variant="contained" onClick={updateStudent}>Salvar</Button>
          ) : (
            <Button variant="outlined" onClick={handleEdit}>Editar</Button>
          )
        }
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Nome"
          size="small"
          value={isEditing ? newStudent?.name ?? "" : student.name ?? ""}
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({ ...newStudent, name: e.target.value })
          }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="CPF"
          value={student.cpf ? formatCpf(student.cpf) : ""}
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Email"
          size="small"
          value={isEditing ? newStudent?.email ?? "" : student.email ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({ ...newStudent, email: e.target.value })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Telefone"
          value={
            isEditing
              ? newStudent?.phone ?? ""
              : student.phone
                ? formatPhone(student.phone)
                : ""
          }
          size="small"
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({ ...newStudent, phone: e.target.value });
          }}
          sx={{ flex: 1 }}
        />

      </Box>

      <Divider sx={{ mb: 3 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Endereço</Typography>
        {/* <Button variant="outlined">Editar</Button> */}
      </Box>
      {/* Endereço */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Rua"
          size="small"
          value={isEditing ? newStudent?.address.street ?? "" : student.address.street ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({ ...newStudent, address: { ...newStudent.address, street: e.target.value } })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />

        <TextField
          label="Bairro"
          size="small"
          value={isEditing ? newStudent?.address.neighborhood ?? "" : student.address.neighborhood ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({
              ...newStudent,
              address: {
                ...newStudent.address,
                neighborhood: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />

        <TextField
          label="Número"
          size="small"
          value={isEditing ? newStudent?.address.number ?? "" : student.address.number ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({
              ...newStudent,
              address: {
                ...newStudent.address,
                number: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 0.5 }}
        />

        <TextField
          label="Cidade"
          size="small"
          value={isEditing ? newStudent?.address.city ?? "" : student.address.city ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({
              ...newStudent,
              address: {
                ...newStudent.address,
                city: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />

        <TextField
          label="Estado"
          size="small"
          value={isEditing ? newStudent?.address.state ?? "" : student.address.state ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({
              ...newStudent,
              address: {
                ...newStudent.address,
                state: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 0.5 }}
        />

        <TextField
          label="CEP"
          size="small"
          value={isEditing ? newStudent?.address.postalCode ?? "" : student.address.postalCode ?? ""}
          onChange={(e) => {
            if (!isEditing || !newStudent) return;
            setNewStudent({
              ...newStudent,
              address: {
                ...newStudent.address,
                postalCode: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
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
          <TextField label="Curso" value={turma.course.name ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Turma" value={turma.name ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Professor da turma" value={turma.teacher.name ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
        </Box>
      ))}

      <Divider sx={{ my: 3 }} />
      <Typography variant="body1" mb={2}>Mensalidades e Pagamentos</Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={fees}
          columns={feeColumns}
          getRowId={(row) => row.id}
        />
      </Box>

    </Box>
  );
};

export default SingleStudentPage;
