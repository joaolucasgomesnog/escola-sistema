"use client";

import { use, useEffect, useRef, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams, GridSearchIcon } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, IconButton, Modal, Paper, TextField, Typography, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
import Report from "@/components/report/Report";
import { useReactToPrint } from 'react-to-print'

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

type FilterFormData = {
  startDate: Date | null;
  endDate: Date | null;
  adminId: string;
  paymentType: string;
};

type ChargeBackFormData = {
  paymentId: string;
};

const FilterModal = ({
  onSubmit,
  open,
  onClose,
  adminList,
}: {
  onSubmit: (data: FilterFormData) => void;
  open: boolean;
  onClose: () => void;
  adminList: { id: number; name: string }[];
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<FilterFormData>({
    defaultValues: {
      startDate: null,
      endDate: null,
      adminId: "",
      paymentType: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const submitAndClose = (data: FilterFormData) => {
    onSubmit(data);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component={Paper}
        p={3}
        m="auto"
        mt={10}
        maxWidth={500}
        borderRadius={2}
        boxShadow={10}
      >
        <Typography variant="h6" mb={2}>
          Filtrar relatório
        </Typography>

        <form onSubmit={handleSubmit(submitAndClose)}>
          <Box display="flex" flexDirection="column" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Data Inicial"
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) => setValue("startDate", date ? date.toDate() : null)}
                slotProps={{ textField: { size: "small" } }}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Data fim"
                value={endDate ? dayjs(endDate) : null}
                onChange={(date) => setValue("endDate", date ? date.toDate() : null)}
                slotProps={{ textField: { size: "small" } }}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>

            <TextField
              label="Administrador"
              select
              {...register("adminId")}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              {adminList.map((admin) => (
                <MenuItem key={admin.id} value={admin.id}>
                  {admin.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Forma de pagamento" select {...register("paymentType")} size="small">
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="DINHEIRO">DINHEIRO</MenuItem>
              <MenuItem value="PIX">PIX</MenuItem>
              <MenuItem value="BOLETO">BOLETO</MenuItem>
              <MenuItem value="CREDITO">CREDITO</MenuItem>
              <MenuItem value="DEBITO">DEBITO</MenuItem>
              <MenuItem value="DEPOSITO">DEPOSITO</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary">
              OK
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

const ChargeBackModal = ({
  onSubmit,
  open,
  onClose,
}: {
  onSubmit: (data: ChargeBackFormData) => void;
  open: boolean;
  onClose: () => void;
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<ChargeBackFormData>({
    defaultValues: {
      paymentId: "",
    },
  });


  const submitAndClose = (data: ChargeBackFormData) => {
    onSubmit(data);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component={Paper}
        p={3}
        m="auto"
        mt={10}
        maxWidth={500}
        borderRadius={2}
        boxShadow={10}
      >
        <Typography variant="h6" mb={2}>
          Realizar estorno
        </Typography>

        <form onSubmit={handleSubmit(submitAndClose)}>
          <Box display="flex" flexDirection="column" gap={2}>


            <TextField
              label="ID do pagamento"
              {...register("paymentId")}
              size="small"
              type="number"
            >
            </TextField>

            <Button type="submit" variant="contained" color="primary">
              OK
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};


const CashierPage = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [adminList, setAdminList] = useState<any[]>([]);
  const [reportFilters, setReportFilters] = useState<FilterFormData | null>(null);

  const [chargeBackModalOpen, setChargeBackModalOpen] = useState(false);

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

  const [payments, setPayments] = useState<any[]>([]);
  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = async () => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch("http://localhost:3030/admin/allnames", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar lista de administradores");

      const data = await response.json();
      console.log("Dados brutos da API:", data); // Adicione este log
      setAdminList(data);
    } catch (error) {
      console.error("Erro ao buscar lista de administradores:", error);
    }
  };


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
      )
    },
    {
      field: "dueDate",
      headerName: "Vencimento",
      width: 130,
      valueFormatter: ({ value }) => {
        return dayjs(value).format("DD/MM/YYYY");
      },


    }
  ];

  const printRef = useRef(null)

  const reactPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Relatório de Caixa - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
      setReportFilters(null);
      setFilterKey(prev => prev + 1); // Força recriação do modal
    },
  });



  const handlePrint = async (filters: FilterFormData) => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const queryParams = new URLSearchParams();

      if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString());
      if (filters.adminId) queryParams.append("adminId", filters.adminId);
      if (filters.paymentType) queryParams.append("paymentType", filters.paymentType);

      const url = `http://localhost:3030/payment/report?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar pagamentos");

      const data = await response.json();
      setPayments(data);

      // Salva os filtros para o cabeçalho
      setReportFilters(filters);

      setTimeout(() => {
        reactPrint();
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    }
  };

    const handleChargeBack = async (filters: ChargeBackFormData) => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      if (filters.paymentId) {
        const response = await fetch(`http://localhost:3030/payment/chargeback/${filters.paymentId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erro ao realizar estorno");

        const data = await response.json();
        alert("Estorno realizado com sucesso!");
      }
      setChargeBackModalOpen(false); 

    } catch (error) {
      console.error("Erro ao estornar pagamento:", error);
    }
  };


  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2}>

      <Box className="hidden">
        <Report ref={printRef} title="Relatório de Caixa">
          <Box>
            {reportFilters && (
              <Box mb={2} display="flex" flexDirection="row" justifyContent={"space-between"} alignItems="center" gap={1}>
                <Typography variant="body2" fontSize={10}>
                  {reportFilters.startDate ? `Data inicial: ${dayjs(reportFilters.startDate).format("DD/MM/YYYY")}` : "Data inicial: __/__/____"}
                </Typography>
                <Typography variant="body2" fontSize={10}>
                  {reportFilters.endDate ? `Data final: ${dayjs(reportFilters.endDate).format("DD/MM/YYYY")}` : "Data final: __/__/____"}
                </Typography>
                <Typography variant="body2" fontSize={10}>
                  {reportFilters.adminId ? `Recebedor: ${adminList.find((a) => String(a.id) === String(reportFilters.adminId))?.name || "ID " + reportFilters.adminId}` : "Recebedor: -----------"}
                </Typography>
                <Typography variant="body2" fontSize={10}>
                  {reportFilters.paymentType ? `Forma de pagamento: ${reportFilters.paymentType}` : "Forma de pagamento: -----------"}
                </Typography>
              </Box>
            )}
            {/* <Typography variant="h6" mb={2}>Pagamentos Recebidos</Typography> */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>ID</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Data/Hora</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Aluno</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Descrição</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Valor</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Forma Pagamento</th>
                  <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Recebido por</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (

                  <tr key={p.id}>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {p.id || "N/A"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {dayjs(p.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {p.fee?.student?.name || "N/A"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {p.fee?.description || "N/A"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      R$ {Number(p.fee?.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {p.paymentType}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                      {p.admin?.name || "N/A"}
                    </td>
                  </tr>
                ))}

                {/* Linha de total monetário */}
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      border: "1px solid #ddd",
                      padding: "5px",
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Total recebido
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "5px",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    R$ {payments.reduce((sum, p) => sum + Number(p.fee?.price || 0), 0).toFixed(2).replace(".", ",")}
                  </td>
                  <td colSpan={2} style={{ border: "1px solid #ddd", padding: "5px" }}></td>
                </tr>

                {/* Linha de total quantitativo */}
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      border: "1px solid #ddd",
                      padding: "5px",
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Total de mensalidades recebidas: {payments.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Report>



      </Box>


      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Caixa</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={() => setChargeBackModalOpen(true)}>Estorno</Button>
          <Button variant="outlined" onClick={() => setFilterModalOpen(true)}>
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

      <FilterModal
        key={filterKey}
        onSubmit={(filters) => {
          handlePrint(filters);
          setFilterModalOpen(false);
        }}
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        adminList={adminList}
      />

      <ChargeBackModal
        key={filterKey}
        onSubmit={(filters) => {
          handleChargeBack(filters);
          setChargeBackModalOpen(false);
        }}
        open={chargeBackModalOpen}
        onClose={() => setChargeBackModalOpen(false)}
      />


      <Modal open={openModal} onClose={() => { setOpenModal(false); setSelectedFeeId(null); setPaymentDescription('') }}>
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
                sx={{ flex: 0.5 }}
              />

              <TextField
                label="Descrição"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                size="small"
                sx={{ flex: 2 }}
                disabled
              />

              <TextField
                label="Forma de pagamento"
                select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
                size="small"
                SelectProps={{ native: true }}
                sx={{ flex: 1 }}
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
