
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
import { Teacher } from '@/interfaces/teacher'
import PrintIcon from '@mui/icons-material/Print';
import Add from '@mui/icons-material/Add';
// import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import TeacherReport from "@/components/report/TeacherReport";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Props = {
  params: { id: string };
};

const SingleTeacherPage = ({ params }: Props) => {

  const { id } = params;
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // const [fees, setFees] = useState([]);

  type Class = {
    code: string;
    name: string;
    course: { name: string };
    teacher?: { name: string };
    // add other properties as needed
  };

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Class[]>([]);

  const [newTeacher, setNewTeacher] = useState<Teacher | null>(null);
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
    const fetchTeacher = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3030/teacher/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,

          },
        });

        if (!res.ok) throw new Error("Erro ao buscar professor");

        const data = await res.json();
        console.log("Dados do professor:", data);
        console.log(data.Class)
        setTeacher(data);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
    // fetchTeacherFees(Number(id));
  }, [id]);

  const updateTeacher = async () => {
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`http://localhost:3030/teacher/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify(newTeacher)
      })

      const data = await res.json()

      if (!res.ok) throw new Error("Erro ao atualizar professor");
      setTeacher(data)

    } catch (error) {
      console.error("Erro:", error);

    } finally {
      setIsEditing(false)
    }
  }

  // const fetchTeacherFees = async (teacherId: number) => {
  //   const token = Cookies.get("auth_token");
  //   if (!token) {
  //     router.push("/login");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://localhost:3030/fee/teacher/${teacherId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!response.ok) throw new Error("Erro ao buscar mensalidades do professor.");

  //     const data = await response.json();
  //     console.log("Mensalidades do professor:", data);
  //     setFees(data);
  //   } catch (error) {
  //     console.error("Erro ao carregar mensalidades:", error);
  //   }
  // };


  // const feeColumns: GridColDef[] = [
  //   { field: "id", headerName: "ID", flex: 0.3 },
  //   { field: "description", headerName: "Descrição", flex: 2 },
  //   {
  //     field: "price",
  //     headerName: "Valor",
  //     flex: 0.5,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Box display="flex" alignItems="center" height="100%">

  //         <Typography variant="body2">
  //           R$ {Number(params.value).toFixed(2).replace('.', ',')}
  //         </Typography>
  //       </Box>
  //     )
  //   },
  //   {
  //     field: "dueDate",
  //     headerName: "Vencimento",
  //     flex: 0.5,
  //     valueFormatter: ({ value }) => dayjs(value).format("DD/MM/YYYY"),
  //   },
  //   {
  //     field: "paymentDate",
  //     headerName: "Data do Pagamento",
  //     flex: 0.5,
  //     renderCell: (params: GridRenderCellParams<any>) => {
  //       const payment = params.row?.payments?.[0];
  //       return (
  //         <Box display="flex" alignItems="center" height="100%">
  //           <Typography variant="body2">
  //             {payment?.createdAt ? dayjs(payment.createdAt).format("DD/MM/YYYY") : "—"}
  //           </Typography>
  //         </Box>
  //       );
  //     }
  //   },
  //   {
  //     field: "paymentType",
  //     headerName: "Forma de Pagamento",
  //     flex: 0.5,
  //     renderCell: (params: GridRenderCellParams<any>) => {
  //       const payment = params.row?.payments?.[0];
  //       return (
  //         <Box display="flex" alignItems="center" height="100%">

  //           <Typography variant="body2" alignSelf={"center"}>
  //             {payment?.paymentType ?? "—"}
  //           </Typography>
  //         </Box>
  //       );
  //     }
  //   },
  //   {
  //     field: "adminName",
  //     headerName: "Recebedor",
  //     flex: 0.5,
  //     renderCell: (params: GridRenderCellParams<any>) => {
  //       const payment = params.row?.payments?.[0];
  //       return (
  //         <Box display="flex" alignItems="center" height="100%">
  //           <Typography variant="body2">
  //             {payment?.admin?.name ?? "—"}
  //           </Typography>
  //         </Box>
  //       );
  //     }
  //   }
  // ];

  const handleEdit = () => {
    setIsEditing(true)
    if (teacher) {
      setNewTeacher(teacher as Teacher)
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
      const response = await fetch(`http://localhost:3030/class/add-teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify({
          selectedClasses,
          teacherId: id
        })
      });

      if (!response.ok) throw new Error("Erro ao confirmar turmas.");

      const data = await response.json();
      console.log("retorno:", data);
      // setClasses(data)
      window.alert("matrícula efetuada com sucesso")
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

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do professor.");

      const data = await response.json();
      setClasses(data)
      console.log("Classes:", data);
    } catch (error) {
      console.error("Erro ao carregar classes:", error);
    }
  }


  if (loading) return <Typography>Carregando...</Typography>;
  if (!teacher) return <Typography>Professor não encontrado.</Typography>;

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
        <Typography variant="h6" fontWeight="bold">Perfil do professor</Typography>
        <Box display="flex" gap={2}>

          <Button variant="outlined" onClick={handlePrint}>
            <PrintIcon />
          </Button>
        </Box>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={2} m={6}>
        <Box display="flex" alignItems="center" gap={2} flexDirection="column">
          <Avatar src={teacher.picture} sx={{ width: 150, height: 150 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">{teacher.name.toUpperCase()}</Typography>
        </Box>
      </Box>

      {/* Dados Pessoais */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Dados Pessoais</Typography>
        {
          isEditing ? (
            <Button variant="contained" onClick={updateTeacher}>Salvar</Button>
          ) : (
            <Button variant="outlined" onClick={handleEdit}>Editar</Button>
          )
        }
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField label="Nome"
          size="small"
          value={isEditing ? newTeacher?.name ?? "" : teacher.name ?? ""}
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({ ...newTeacher, name: e.target.value })
          }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="CPF"
          value={teacher.cpf ? formatCpf(teacher.cpf) : ""}
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <TextField label="Email"
          size="small"
          value={isEditing ? newTeacher?.email ?? "" : teacher.email ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({ ...newTeacher, email: e.target.value })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Telefone"
          value={
            isEditing
              ? newTeacher?.phone ?? ""
              : teacher.phone
                ? formatPhone(teacher.phone)
                : ""
          }
          size="small"
          InputProps={{ readOnly: !isEditing }}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({ ...newTeacher, phone: e.target.value });
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
          value={isEditing ? newTeacher?.address.street ?? "" : teacher.address.street ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({ ...newTeacher, address: { ...newTeacher.address, street: e.target.value } })
          }}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />

        <TextField
          label="Bairro"
          size="small"
          value={isEditing ? newTeacher?.address.neighborhood ?? "" : teacher.address.neighborhood ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({
              ...newTeacher,
              address: {
                ...newTeacher.address,
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
          value={isEditing ? newTeacher?.address.number ?? "" : teacher.address.number ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({
              ...newTeacher,
              address: {
                ...newTeacher.address,
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
          value={isEditing ? newTeacher?.address.city ?? "" : teacher.address.city ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({
              ...newTeacher,
              address: {
                ...newTeacher.address,
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
          value={isEditing ? newTeacher?.address.state ?? "" : teacher.address.state ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({
              ...newTeacher,
              address: {
                ...newTeacher.address,
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
          value={isEditing ? newTeacher?.address.postalCode ?? "" : teacher.address.postalCode ?? ""}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({
              ...newTeacher,
              address: {
                ...newTeacher.address,
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
        <Typography variant="body1" mb={3}>Turmas</Typography>

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
            value=""
            onChange={(e) => {
              const selectedCode = e.target.value;
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
{Array.isArray(teacher?.Class) && teacher.Class.map((turma) => (
  <Box key={turma?.code} display="flex" flexWrap="wrap" gap={2} mb={2}>
    <TextField label="Código Turma" value={turma?.code ?? ""} size="small"
      InputProps={{ readOnly: true }}
      sx={{ flex: 1 }}
    />
      <TextField label="Nome Turma" value={turma?.name ?? ""} size="small"
        InputProps={{ readOnly: true }}
        sx={{ flex: 1 }}
      />
    <TextField label="Curso" value={turma?.course?.name ?? ""} size="small"
      InputProps={{ readOnly: true }}
      sx={{ flex: 1 }}
    />
    <TextField label="Turno" value={turma?.turno ?? ""} size="small"
      InputProps={{ readOnly: true }}
      sx={{ flex: 1 }}
    />
  </Box>
))}


<Box sx={{ display: "none" }}>
        <TeacherReport ref={printRef} teacher={teacher} />
      </Box> 

    </Box>
  );
};

export default SingleTeacherPage;
