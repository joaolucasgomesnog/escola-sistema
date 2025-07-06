'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { Student } from '@/interfaces/student';
import PrintIcon from '@mui/icons-material/Print';
import Add from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import StudentReport from "@/components/report/StudentReport";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Props = {
  params: { id: string };
};

const SingleStudentPage = ({ params }: Props) => {
  const { id } = params;
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  type Classe = {
    code: string;
    name: string;
    course: { name: string };
    teacher: { name: string };
    [key: string]: any;
  };

  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Classe[]>([]);

  const [newStudent, setNewStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [selectVisible, setSelectVisible] = useState<boolean>(false);


  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha do aluno - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
    },
  });


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
  renderCell: (params) => {
    const dueDate = params.row?.dueDate;
    return (
      <Typography variant="body2">
        {dueDate ? dayjs(dueDate).format("DD/MM/YYYY") : "—"}
      </Typography>
    );
  },
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
    if (student) {
      setNewStudent({
        ...student,
        id: student.id ?? 0, // fallback to 0 if undefined, adjust as needed
      });
    }
  }

  const confirmClasses = async () => {
    setSelectVisible(false)

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3030/student/create-class-student`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'POST',
        body: JSON.stringify({
          selectedClasses,
          studentId: id
        })
      });

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do aluno.");

      const data = await response.json();
      // setClasses(data)
      window.alert("matrícula efetuada com sucesso")
      fetchStudentFees(Number(id))
      console.log("retorno:", data);
    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao carregar classes:", error);
    }
  }

  const fetchClasses = async () => {
    setSelectVisible(true)
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3030/class/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do aluno.");

      const data = await response.json();
      setClasses(data)
      console.log("Classes:", data);
    } catch (error) {
      console.error("Erro ao carregar classes:", error);
    }
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

          <Button variant="outlined" onClick={handlePrint}>
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


      {/* Turmas */}
      <Box className="flex justify-between">
        <Typography variant="body1" mb={3}>Matriculas</Typography>

        {
          selectVisible ? (

            <Button color="primary" variant="contained" className="h-fit" onClick={confirmClasses}>
              Salvar
            </Button>
          ) : (

            <Button color="primary" variant="contained" className="h-fit" onClick={fetchClasses}>
              <Add fontSize="medium" />
            </Button>
          )
        }

      </Box>

      <Box className={`${selectVisible ? 'visible' : 'hidden'} mb-4`}>
        <FormControl className="w-32 " size="small">

          <InputLabel id="demo-simple-select-label">Turma</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            onChange={(e) => {
              const selectedCode = e.target.value as string;
              const selectedClasse = classes.find((classe) => classe.code === selectedCode);
              if (selectedClasse && !selectedClasses.some((c) => c.code === selectedClasse.code)) {
                setSelectedClasses([...selectedClasses, selectedClasse]);
              }
            }}
          >
            {
              classes?.map((classe) => (
                <MenuItem key={classe.code} value={classe.code}>{classe.name}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

      </Box>
      {
selectedClasses?.map((classe) => {
  const horario = classe.horario
    ? Object.entries(classe.horario)
        .filter(([_, value]) => value !== null)
        .map(([day, value]) => {
          const hora = dayjs(value as string | number | Date | null | undefined).format("HH:mm");
          const dayMap: Record<string, string> = {
            sunday: "Domingo",
            monday: "Segunda",
            tuesday: "Terça",
            wednesday: "Quarta",
            thursday: "Quinta",
            friday: "Sexta",
            saturday: "Sábado"
          };
          return `${dayMap[day] ?? day}: ${hora}`;
        })
        .join(" | ")
    : "Sem horário definido";

  return (
    <Box key={classe.code} display="flex" flexWrap="wrap" gap={2} my={2}>
      <TextField label="Curso" value={classe.name ?? ""} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 1 }}
      />
      <TextField label="Turma" value={classe.course.name ?? ""} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 1 }}
      />
      <TextField label="Professor da turma" value={classe.teacher.name ?? ""} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 1 }}
      />
      <TextField label="Horários" value={horario} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 2 }}
      />
    </Box>
  );
})

      }


{student?.classLinks.map(({ class: turma }) => {
  // Montar uma string com os dias e horários
  const horario = turma.horario
    ? Object.entries(turma.horario)
        .filter(([_, value]) => value !== null)
        .map(([day, value]) => {
          const hora = dayjs(value as string | number | Date | null | undefined).format("HH:mm");
          // Traduzir o nome do dia
          const dayMap: Record<string, string> = {
            sunday: "Domingo",
            monday: "Segunda",
            tuesday: "Terça",
            wednesday: "Quarta",
            thursday: "Quinta",
            friday: "Sexta",
            saturday: "Sábado"
          };
          return `${dayMap[day] ?? day}: ${hora}`;
        })
        .join(" | ")
    : "Sem horário definido";

  return (
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
      <TextField label="Horários" value={horario} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 2 }}
      />
    </Box>
  );
})}


      <Divider sx={{ my: 3 }} />
      <Typography variant="body1" mb={2}>Mensalidades e Pagamentos</Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={fees}
          columns={feeColumns}
          getRowId={(row) => row.id}
        />
      </Box>
      <Box sx={{ display: "none" }}>
        <StudentReport ref={printRef} student={student} fees={fees} />
      </Box>
    </Box>
  );
};

export default SingleStudentPage;
