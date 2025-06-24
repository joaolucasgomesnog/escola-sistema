"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams, GridSearchIcon } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, IconButton, Modal, Paper, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme"; // ou ajuste o caminho
import Table from "@/components/Table";
import PaidIcon from '@mui/icons-material/Paid';
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { getUserFromToken } from "@/lib/getUserFromToken";
import PrintIcon from '@mui/icons-material/Print';

type Fee = {
  id: number;
  description: string;
  price: number;
  dueDate: string; // ISO string
  payments: {
    id: number;
    paymentDate: string;
    value: number;
    // outros campos de pagamento, se houver
  }[];
  studentId?: number;
  createdAt?: string;
};


type Student = {
  id: number;
  studentId: string;
  name: string;
  email?: string;
  photo: string;
  phone?: string;
  grade: number;
  class: string;
  address: string;
};

const CashierPage = () => {

  const [openModal, setOpenModal] = useState(false);
const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
const [studentFees, setStudentFees] = useState<Fee[]>([]);

const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
const [paymentDescription, setPaymentDescription] = useState('');
const [paymentType, setPaymentType] = useState<'DINHEIRO' | 'PIX' | 'BOLETO' | 'CREDITO' | 'DEBITO' | 'DEPOSITO'>('DINHEIRO');
const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    const [searchFields, setSearchFields] = useState({
    nome: '',
    endereco: '',
    bairro: '',
    cidade: '',
    turma: '',
    curso: '',
    cpf: ''
  });


  
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setSearchFields((prev) => ({ ...prev, [name]: value }));
  };

const handleSearch = async () => {
  try {
    const token = Cookies.get("auth_token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    // Montar query string com os campos preenchidos
    const queryParams = new URLSearchParams();
    Object.entries(searchFields).forEach(([key, value]) => {
      if (value.trim() !== "") {
        queryParams.append(key, value.trim());
      }
    });

        // ✅ Impede busca se todos os campos estiverem vazios
    if ([...queryParams].length === 0) {
      console.warn("Nenhum campo de busca preenchido.");
      setStudents([]); // limpa resultados anteriores se quiser
      return;
    }

    const response = await fetch(`http://localhost:3030/student/search?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        Cookies.remove("auth_token");
        router.push("/sign-in");
        return;
      }

      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar estudantes");
    }

    const data = await response.json();

    const formattedStudents: Student[] = data.map((s: any) => ({
      id: s.id,
      studentId: String(s.id),
      name: s.name,
      email: s.email || "",
      photo: s.picture || "/default-avatar.png",
      phone: s.phone || "",
      grade: s.grade || 0,
      class: s.class || "",
      address: s.address
        ? `${s.address.street}, ${s.address.number} - ${s.address.neighborhood}, ${s.address.city} - ${s.address.state}`
        : "Endereço não informado",
    }));

    setStudents(formattedStudents);
  } catch (error) {
    console.error("Erro na busca de estudantes:", error);
    setError(error instanceof Error ? error.message : "Erro desconhecido");
  }
};




const fetchStudentFees = async (studentId: number) => {
  try {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const response = await fetch(`http://localhost:3030/fee/student/${studentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar mensalidades.");

    const data = await response.json();
    console.log("Dados brutos da API:", data); // Adicione este log
    
    // Verifique se os dados estão no formato esperado
    const unpaid = data.filter((f: any) => f.payments.length === 0);
    console.log("Mensalidades não pagas:", unpaid); // Adicione este log
    
    setStudentFees(unpaid);
  } catch (error) {
    console.error("Erro ao buscar mensalidades:", error);
    setStudentFees([]);
  }
};



const handleOpenPaymentModal = (studentId: number) => {
  setSelectedStudentId(studentId);
  fetchStudentFees(studentId);
  setOpenModal(true);
};

const submitPayment = async () => {
  if (!selectedFeeId || !selectedStudentId) return;

  const token = Cookies.get("auth_token");
const user = getUserFromToken();

if (user) {
  console.log("ID do usuário:", user.id);
  console.log("Função (role):", user.role);
}
  if (!token || !user) {
    router.push("/sign-in");
    return;
  }

  try {
    setSubmitting(true);

    const response = await fetch("http://localhost:3030/payment/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feeId: selectedFeeId,
        paymentType,
        description: paymentDescription,
        adminId: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao registrar pagamento");
    }

    await fetchStudentFees(selectedStudentId);
    setPaymentDescription('');
    setSelectedFeeId(null);
    alert("Pagamento registrado com sucesso!");
  } catch (err) {
    console.error(err);
    alert(err instanceof Error ? err.message : "Erro ao registrar pagamento.");
  } finally {
    setSubmitting(false);
  }
};



// useEffect(() => {
//   handleSearch();
// }, [router]);


  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Avatar src={params.row.photo} sx={{ width: 32, height: 32 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="gray">
              {params.row.class}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Telefone",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Endereço",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center gap-2 h-12">
          <IconButton color="success" onClick={() => handleOpenPaymentModal(params.row.id)}>
  <PaidIcon />
</IconButton>
          {/* {role === "admin" && (
            <FormModal table="student" type="delete" id={params.row.id} />
          )} */}
        </div>
      ),
    },
  ];

  const feeColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "description", headerName: "Descrição", flex: 1 },
{
  field: "price",
  headerName: "Valor",
  width: 100,
  renderCell: (params: GridRenderCellParams) => (
    <Box display="flex" alignItems="center" height="100%">
      <Typography variant="body2">
        R$ {Number(params.value).toFixed(2).replace('.', ',')}
      </Typography>
    </Box>
  )},
  {
    field: "dueDate",
    headerName: "Vencimento",
    width: 130,
    valueFormatter: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY");
    },
    
    
  }
];


  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Caixa</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined">Estorno</Button>
          <Button variant="outlined">
            <PrintIcon />
          </Button>
        </Box>
      </Box>
      {/* Formulário de busca */}
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" maxWidth="100%">
        <TextField label="CPF" sx={{ flex: 1 }} name="cpf" value={searchFields.cpf} onChange={handleInputChange} size="small" />
        <TextField label="Nome" sx={{ flex: 2 }} name="nome" value={searchFields.nome} onChange={handleInputChange} size="small" />
        <TextField label="Endereço" sx={{ flex: 1 }} name="endereco" value={searchFields.endereco} onChange={handleInputChange} size="small" />
        <TextField label="Bairro" sx={{ flex: 1 }} name="bairro" value={searchFields.bairro} onChange={handleInputChange} size="small" />
        <TextField label="Cidade" sx={{ flex: 1 }} name="cidade" value={searchFields.cidade} onChange={handleInputChange} size="small" />
        <TextField label="Turma" sx={{ flex: 0.5 }} name="turma" value={searchFields.turma} onChange={handleInputChange} size="small" />
        <TextField label="Curso" sx={{ flex: 1 }} name="curso" value={searchFields.curso} onChange={handleInputChange} size="small" />
        <Button variant="contained" color="primary" onClick={handleSearch} startIcon={<GridSearchIcon />}>
          Buscar
        </Button>
      </Box>
      <Table rows={students} columns={columns} />


      <Modal open={openModal} onClose={() => {setOpenModal(false);setSelectedFeeId(null);setPaymentDescription('')}}>
  <Box
    component={Paper}
    p={3}
    m="auto"
    mt={10}
    maxWidth={700}
    borderRadius={2}
    boxShadow={10}
  >
    <Typography variant="h6" mb={2}>
      Mensalidades em aberto
    </Typography>
    <DataGrid
      autoHeight
      rows={studentFees}
      columns={feeColumns}
      checkboxSelection
      disableMultipleRowSelection
       onRowClick={(params) => {
    setSelectedFeeId(params.row.id);
    setPaymentDescription(params.row.description);
  }}

    />
        <Box mt={2}>
      <Typography variant="subtitle1" gutterBottom>
        Registrar Pagamento
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="ID da mensalidade"
          type="number"
          value={selectedFeeId ?? ''}
          onChange={(e) => setSelectedFeeId(Number(e.target.value))}
          size="small"
          disabled
          sx={{flex:0.5}}
        />

        <TextField
          label="Descrição"
          value={paymentDescription}
          onChange={(e) => setPaymentDescription(e.target.value)}
          size="small"
          sx={{flex:2}}
          disabled
        />

        <TextField
          label="Forma de pagamento"
          select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
          size="small"
          SelectProps={{ native: true }}
          sx={{flex:1}}
        >
          {["DINHEIRO", "PIX", "BOLETO", "CREDITO", "DEBITO", "DEPOSITO"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </TextField>
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" color="success" onClick={submitPayment} disabled={submitting || !selectedFeeId} loading={submitting}>
          {submitting ? "Enviando..." : "Confirmar Pagamento"}
        </Button>
      </Box>
    </Box>
  </Box>
</Modal>
    </Box>
  );
};

export default CashierPage;
