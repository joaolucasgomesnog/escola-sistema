
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
import { Teacher } from '@/interfaces/teacher'
import PrintIcon from '@mui/icons-material/Print';
import Add from '@mui/icons-material/Add';
// import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatDate, formatPhone } from "@/lib/formatValues";
import TeacherReport from "@/components/report/TeacherReport";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { GridDeleteForeverIcon } from "@mui/x-data-grid";
import { BASE_URL } from "../../../../constants/baseUrl";
import { uploadImage } from "@/lib/imageFuncions";

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
    turno: string;
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

  const [classe, setClasse] = useState('');

  const [selectdClassId, setSelectedClassId] = useState<number | null>(null);

  const [open, setOpen] = useState(false);

  // --- ESTADOS PARA IMAGEM ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newPictureFile, setNewPictureFile] = useState<File | null>(null);

  // quando carregar o professor, já deixa a imagem de preview
  useEffect(() => {
    if (teacher?.picture) {
      setImagePreview(teacher.picture);
    }
  }, [teacher]);


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const handleOpen = async (classId: number) => {
    setOpen(true)
    setSelectedClassId(classId)
  };

  const handleClose = () => setOpen(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha do aluno - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
    },
  });

  const fetchTeacher = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/teacher/get/${id}`, {
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
  useEffect(() => {

    fetchTeacher();
    // fetchTeacherFees(Number(id));
  }, [id]);

  const updateTeacher = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) return;

      let newPictureUrl = teacher?.picture ?? null;

      // ✅ Se mudou a foto, subir para o servidor
      if (newPictureFile) {
        newPictureUrl = await uploadImage(newPictureFile);
      }

      const updatedData = {
        ...newTeacher,
        picture: newPictureUrl, // <- atualiza a foto
      };

      const res = await fetch(`${BASE_URL}/teacher/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(updatedData) // ✅ CORRIGIDO - enviar updatedData que contém a foto
      })

      const data = await res.json()

      if (!res.ok) throw new Error("Erro ao atualizar professor");

      setTeacher(data)
      setIsEditing(false)

    } catch (error) {
      console.error("Erro:", error);
      window.alert("Erro ao atualizar professor.");
    }
  }

  // const fetchTeacherFees = async (teacherId: number) => {
  //   const token = Cookies.get("auth_token");
  //   if (!token) {
  //     router.push("/sign-in");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${BASE_URL}/fee/teacher/${teacherId}`, {
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
    setIsEditing(true);
    if (teacher) {
      setNewTeacher({
        ...teacher,
        phone: teacher.phone ?? "", // evita undefined
        id: teacher.id ?? 0,
      });
    }
  };

  const confirmClasses = async () => {
    setSelectVisible(false)

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/class/add-teacher`, {
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
      fetchTeacher()
      console.log("retorno:", data);
      // setClasses(data)
      window.alert("matrícula efetuada com sucesso")
    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao carregar classes:", error);
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

      if (!response.ok) throw new Error("Erro ao buscar mensalidades do professor.");

      const data = await response.json();
      setClasses(data)
      console.log("Classes:", data);
    } catch (error) {
      console.error("Erro ao carregar classes:", error);
    }
  }

  const deleteClassTeacher = async () => {


    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      if (!selectdClassId) {
        setOpen(false)
        return
      }

      const response = await fetch(`${BASE_URL}/class/delete-teacher/${selectdClassId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',

      });

      if (!response.ok) throw new Error("Erro ao deletar matricula do aluno.");
      setOpen(false)


      window.alert("matrícula deletada com sucesso")
      fetchTeacher()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao deletar matricula", error);
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
  if (!teacher) return <Typography>Professor não encontrado.</Typography>;

  return (
    <Box
      p={3}
      bgcolor="white"
      className="dark:bg-dark"
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

      <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center mx-auto">

        <label
          htmlFor="picture"
          className="cursor-pointer flex items-center justify-center"
          style={{ width: 150, height: 150 }}
        >
          <Avatar
            src={imagePreview ?? undefined}
            sx={{ width: 150, height: 150 }}
          />
        </label>

        <input
          id="picture"
          type="file"
          accept="image/*"
          className="hidden disabled:cursor-none"
          disabled={!isEditing}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setNewPictureFile(file);
            if (file) setImagePreview(URL.createObjectURL(file));
          }}
        />

      </div>

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
        <TextField
          label="Data de nascimento"
          type="date"
          value={isEditing ? formatDate(newTeacher?.birthDate) : formatDate(teacher.birthDate)}
          size="small"
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => {
            if (!isEditing || !newTeacher) return;
            setNewTeacher({ ...newTeacher, birthDate: e.target.value })
          }}
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

      <TextField
        label="Observação"
        multiline
        value={isEditing ? newTeacher?.observation ?? "" : teacher.observation ?? ""}
        minRows={4}
        maxRows={8}
        fullWidth
        onChange={(e) => {
          if (!isEditing || !newTeacher) return;
          setNewTeacher({
            ...newTeacher,
            observation: e.target.value
          });
        }}
        InputProps={{ readOnly: !isEditing }}
        sx={{ flex: 1 }}
      />

      <Divider sx={{ mb: 3 }} />


      {/* Turmas */}
      <Box className="flex justify-between">
        <Typography variant="body1" mb={3}>Turmas</Typography>

        {
          selectVisible ? (

            <Box display='flex' gap={2} >

              <Button color="error" variant="outlined" className="h-fit" onClick={() => {
                setSelectedClasses([])
                setClasse('')
                setSelectVisible(false)
              }}>
                Cancelar
              </Button>
              <Button color="primary" variant="contained" className="h-fit" onClick={confirmClasses}>
                Salvar
              </Button>

            </Box>
          ) : (

            <Button color="primary" variant="contained" className="h-fit" onClick={fetchAvailableClasses}>
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
          <Button variant="outlined" color="error" onClick={() => { handleOpen(turma?.id) }}>
            <GridDeleteForeverIcon fontSize="medium" />
          </Button>
        </Box>
      ))}
      {selectedClasses.map((turma) => (
        <Box key={turma.code} display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField label="Código Turma" value={turma.code ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Nome Turma" value={turma.name ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Curso" value={turma.course?.name ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField label="Turno" value={turma?.turno ?? ""} size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          {/* Adicione outros campos se necessário */}
        </Box>
      ))}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Esta ação não poderá ser desfeita
          </Typography>
          <Box sx={{ mt: 2 }} display='flex' gap={2}>
            <Button variant="contained" color="primary" onClick={handleClose}>
              Cancelar
            </Button>
            {/* <Button variant="contained" color="error" > */}
            <Button variant="contained" color="error" onClick={() => { deleteClassTeacher() }}>
              Confirmar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Box sx={{ display: "none" }}>
        <TeacherReport ref={printRef} teacher={teacher} />
      </Box>

    </Box>
  );
};

export default SingleTeacherPage;
