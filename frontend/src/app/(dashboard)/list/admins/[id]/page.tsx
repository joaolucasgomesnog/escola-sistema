'use client';

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { Admin } from '@/interfaces/admin';
import PrintIcon from '@mui/icons-material/Print';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Add from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import AdminReport from "@/components/report/AdminReport";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ModalComponent from "../../../../../components/ModalComponent";
import { Discount } from "../../../../../interfaces/discount";
import { BASE_URL } from "../../../../constants/baseUrl";

type Props = {
  params: { id: string };
};

const SingleAdminPage = ({ params }: Props) => {
  const { id } = params;
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  type Classe = {
    code: string;
    name: string;
    course: { name: string };
    teacher: { name: string };
    [key: string]: any;
  };

  const [newAdmin, setNewAdmin] = useState<Admin | null>(null);

  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Classe[]>([]);
  const [selectdClassId, setSelectedClassId] = useState<number | null>(null);
  const [classe, setClasse] = useState('');
  
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  
  const [selectVisible, setSelectVisible] = useState<boolean>(false);
  const [selectDiscountVisible, setSelectDiscountVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [openClassModal, setOpenClassModal] = useState<boolean>(false);
  const [openDiscountModal, setOpenDiscountModal] = useState<boolean>(false);

  const handleOpenClassModal = async (classId: number) => {
    setOpenClassModal(true)
    setSelectedClassId(classId)
  };
  const handleOpenDiscountModal = async () => {
    setOpenDiscountModal(true)
  };

  const handleClose = () => {
    setOpenClassModal(false)
  }

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha do Adminstrador - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
    },
  });

  const fetchAdmin = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,

        },
      });

      if (!res.ok) throw new Error("Erro ao buscar Adminstrador");

      const data = await res.json();
      setAdmin(data);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchAdminFees(Number(id));
  }, [id]);

  const updateAdmin = async () => {
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${BASE_URL}/admin/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify(newAdmin)
      })

      const data = await res.json()

      if (!res.ok) throw new Error("Erro ao atualizar Adminstrador");
      setAdmin(data)

    } catch (error) {
      console.error("Erro:", error);

    } finally {
      setIsEditing(false)
    }
  }

  const fetchAdminFees = async (adminId: number) => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/fee/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do Adminstrador.");

      const data = await response.json();
      console.log("Mensalidades do Adminstrador:", data);
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
          <Box display="flex" alignItems="center" height="100%">
            <Typography variant="body2">
              {dueDate ? dayjs(dueDate).format("DD/MM/YYYY") : "—"}
            </Typography>
          </Box>
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
    if (admin) {
      setNewAdmin({
        ...admin,
        id: admin.id ?? 0, // fallback to 0 if undefined, adjust as needed
      });
    }
  }

  const confirmClasses = async () => {
    setSelectVisible(false)

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/admin/create-class-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'POST',
        body: JSON.stringify({
          selectedClasses,
          adminId: id
        })
      });

      if (!response.ok) throw new Error("Erro ao confirmar turmas do Adminstrador.");

      const data = await response.json();
      // setClasses(data)
      window.alert("Matrícula efetuada com sucesso")
      fetchAdminFees(Number(id))
    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao confirmar turmas:", error);
    }
  }

  const fetchAvailableClasses = async () => {
    setSelectVisible(true)
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/class/getallavailable/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar classes do Adminstrador.");

      const data = await response.json();
      setClasses(data)
      console.log("Classes:", data);
    } catch (error) {
      console.error("Erro ao carregar classes:", error);
    }
  }

  const fetchDiscounts = async () => {
    setSelectDiscountVisible(true)
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/discount/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar descontos do Adminstrador.");

      const data = await response.json();
      setDiscounts(data)
    } catch (error) {
      console.error("Erro ao carregar descontos:", error);
    }
  }

  const deleteClassAdmin = async () => {

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/class-admin/delete/${selectdClassId}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Erro ao deletar matricula do Adminstrador.");
      window.alert("Matrícula deletada com sucesso")
      fetchAdmin()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao deletar matricula", error);
    }
  }

  const deleteDiscountFromAdmin = async () => {


    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/admin/delete-discount/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL
        },
        method: 'PUT',
      });

      if (!response.ok) throw new Error("Erro ao deletar desconto do Adminstrador.");
      setOpenDiscountModal(false)
      window.alert("Desconto deletado com sucesso")
      fetchAdmin()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao deletar desconto", error);
    }
  }

  const addDiscountToAdmin = async () => {

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/admin/add-discount/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify({ discountId: Number(selectedDiscountId) })

      });

      if (!response.ok) throw new Error("Erro ao adicionar desconto ao Adminstrador.");
      setOpenDiscountModal(false)

      console.log(response)

      window.alert("Desconto adicionado com sucesso")
      setSelectDiscountVisible(false)
      fetchAdmin()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao adicionar desconto", error);
    }
  }


    if (loading) return (
      <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Box>)
  if (!admin) return <Typography>Aluno não encontrado.</Typography>;

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
        <Typography variant="h6" fontWeight="bold">Perfil do Adminstrador</Typography>
        <Box display="flex" gap={2}>

          <Button variant="outlined" onClick={handlePrint}>
            <PrintIcon />
          </Button>
        </Box>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={2} m={6}>
        <Box display="flex" alignItems="center" gap={2} flexDirection="column">
          <Avatar src={admin.picture} sx={{ width: 150, height: 150 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">{admin.name.toUpperCase()}</Typography>
        </Box>
      </Box>

      {/* Dados Pessoais */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Dados Pessoais</Typography>
        {
          isEditing ? (
            <Button variant="contained" onClick={updateAdmin}>Salvar</Button>
          ) : (
            <Button variant="outlined" onClick={handleEdit}>Editar</Button>
          )
        }
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Nome"
          size="small"
          value={isEditing ? newAdmin?.name ?? "" : admin.name ?? ""}
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({ ...newAdmin, name: e.target.value })
          }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="CPF"
          value={admin.cpf ? formatCpf(admin.cpf) : ""}
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Email"
          size="small"
          value={isEditing ? newAdmin?.email ?? "" : admin.email ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({ ...newAdmin, email: e.target.value })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Telefone"
          value={
            isEditing
              ? newAdmin?.phone ?? ""
              : admin.phone
                ? formatPhone(admin.phone)
                : ""
          }
          size="small"
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({ ...newAdmin, phone: e.target.value });
          }}
          sx={{ flex: 1 }}
        />

      </Box>

      <Divider sx={{ mb: 3 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Endereço</Typography>
      </Box>
      {/* Endereço */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Rua"
          size="small"
          value={isEditing ? newAdmin?.address.street ?? "" : admin.address.street ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({ ...newAdmin, address: { ...newAdmin.address, street: e.target.value } })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />

        <TextField
          label="Bairro"
          size="small"
          value={isEditing ? newAdmin?.address.neighborhood ?? "" : admin.address.neighborhood ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({
              ...newAdmin,
              address: {
                ...newAdmin.address,
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
          value={isEditing ? newAdmin?.address.number ?? "" : admin.address.number ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({
              ...newAdmin,
              address: {
                ...newAdmin.address,
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
          value={isEditing ? newAdmin?.address.city ?? "" : admin.address.city ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({
              ...newAdmin,
              address: {
                ...newAdmin.address,
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
          value={isEditing ? newAdmin?.address.state ?? "" : admin.address.state ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({
              ...newAdmin,
              address: {
                ...newAdmin.address,
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
          value={isEditing ? newAdmin?.address.postalCode ?? "" : admin.address.postalCode ?? ""}
          onChange={(e) => {
            if (!isEditing || !newAdmin) return;
            setNewAdmin({
              ...newAdmin,
              address: {
                ...newAdmin.address,
                postalCode: e.target.value
              }
            });
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />


      <Box className={`${selectDiscountVisible ? 'visible' : 'hidden'} mb-4`}>
        <FormControl className="w-32 " size="small">

          <InputLabel id="demo-simple-select-label">Desconto</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            // value={discount}
            onChange={(e) => {
              const selectedId = e.target.value as string;
              setSelectedDiscountId(Number(selectedId))
            }}
          >
            {
              discounts?.map((discount) => (
                <MenuItem key={discount.id} value={discount.id}>{discount.code}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

      </Box>

      <Box sx={{ display: "none" }}>
        <AdminReport ref={printRef} admin={admin} fees={fees} />
      </Box>
    </Box>
  );
};

export default SingleAdminPage;
