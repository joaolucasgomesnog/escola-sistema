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
import { Student } from '@/interfaces/student';
import PrintIcon from '@mui/icons-material/Print';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Add from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import StudentReport from "@/components/report/StudentReport";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ModalComponent from "../../../../../components/ModalComponent";
import { Discount } from "../../../../../interfaces/discount";
import { BASE_URL } from "../../../../constants/baseUrl";
import Carne from "@/components/report/carne";

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

  const [newStudent, setNewStudent] = useState<Student | null>(null);

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
  const printCarneRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha do aluno - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
    },
  });

  const handlePrintCarne = useReactToPrint({
    contentRef: printCarneRef,
    documentTitle: `Carnê do aluno - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log("Printing completed");
    },
  });

  const fetchStudent = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/student/get/${id}`, {
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

  useEffect(() => {
    fetchStudent();
    fetchStudentFees(Number(id));
  }, [id]);

  const updateStudent = async () => {
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${BASE_URL}/student/update/${id}`, {
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
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/fee/student/${studentId}`, {
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
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/student/create-class-student`, {
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

      if (!response.ok) throw new Error("Erro ao confirmar turmas do aluno.");

      const data = await response.json();
      // setClasses(data)
      window.alert("Matrícula efetuada com sucesso")
      fetchStudentFees(Number(id))
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

      if (!response.ok) throw new Error("Erro ao buscar classes do aluno.");

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

      if (!response.ok) throw new Error("Erro ao buscar descontos do aluno.");

      const data = await response.json();
      setDiscounts(data)
    } catch (error) {
      console.error("Erro ao carregar descontos:", error);
    }
  }

  const deleteClassStudent = async () => {

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/class-student/delete/${selectdClassId}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Erro ao deletar matricula do aluno.");
      window.alert("Matrícula deletada com sucesso")
      fetchStudent()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao deletar matricula", error);
    }
  }

  const deleteDiscountFromStudent = async () => {


    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/student/delete-discount/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL
        },
        method: 'PUT',
      });

      if (!response.ok) throw new Error("Erro ao deletar desconto do aluno.");
      setOpenDiscountModal(false)
      window.alert("Desconto deletado com sucesso")
      fetchStudent()

    } catch (error) {
      setSelectedClasses([])
      console.error("Erro ao deletar desconto", error);
    }
  }

  const addDiscountToStudent = async () => {

    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {

      const response = await fetch(`${BASE_URL}/student/add-discount/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <- ESSA LINHA É ESSENCIAL

        },
        method: 'PUT',
        body: JSON.stringify({ discountId: Number(selectedDiscountId) })

      });

      if (!response.ok) throw new Error("Erro ao adicionar desconto ao aluno.");
      setOpenDiscountModal(false)

      console.log(response)

      window.alert("Desconto adicionado com sucesso")
      setSelectDiscountVisible(false)
      fetchStudent()

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

      <Box className="flex justify-between">
        <Typography variant="body1" mb={3}>Descontos</Typography>

        {
          selectDiscountVisible ? (
            <Box display='flex' gap={2} >

              <Button color="error" variant="outlined" className="h-fit" onClick={() => {
                setSelectDiscountVisible(false)
              }}>
                Cancelar
              </Button>
              <Button color="primary" variant="contained" className="h-fit" onClick={addDiscountToStudent}>
                Salvar
              </Button>

            </Box>

          ) : (

            <Button color="primary" variant="contained" className="h-fit" onClick={() => {
              if (student.discountId) {
                window.alert("Já existe desconto aplicado a esse estudante")
                return
              } else {
                fetchDiscounts()
              }
            }}>
              <Add fontSize="medium" />
            </Button>
          )
        }
      </Box>

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

      {
        student.discount && (
          <Box key={student.discount.code} display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField label="Código" value={student.discount.code ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Descrição" value={student.discount.description ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Percentual" value={student.discount.percentage ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" color="error" onClick={() => { handleOpenDiscountModal() }}>
              <DeleteForeverIcon fontSize="medium" />
            </Button>
          </Box>
        )
      }

      <Divider sx={{ mb: 3 }} />

      {/* Turmas */}
      <Box className="flex justify-between">
        <Typography variant="body1" mb={3}>Matriculas</Typography>

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
            value={classe}
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
              <TextField label="Curso" value={classe?.name ?? ""} size="small"
                InputProps={{ readOnly: true }}
                sx={{ flex: 1 }}
              />
              <TextField label="Turma" value={classe?.course?.name ?? ""} size="small"
                InputProps={{ readOnly: true }}
                sx={{ flex: 1 }}
              />
              <TextField label="Professor da turma" value={classe.teacher?.name ?? ""} size="small"
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
            <TextField label="Curso" value={turma?.course?.name ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Turma" value={turma?.name ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Professor da turma" value={turma?.teacher?.name ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Horários" value={horario} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 2 }}
            />
            <Button variant="outlined" color="error" onClick={() => { handleOpenClassModal(turma.id) }}>
              <DeleteForeverIcon fontSize="medium" />
            </Button>
          </Box>
        );
      })}

      <ModalComponent onConfirm={deleteClassStudent} open={openClassModal} handleClose={handleClose} />
      <ModalComponent onConfirm={deleteDiscountFromStudent} open={openDiscountModal} handleClose={handleClose} />

      <Divider sx={{ my: 3 }} />
      <Box className="flex justify-between" alignItems="center" display="flex" mb={2}>

        <Typography variant="body1">Mensalidades e Pagamentos</Typography>
        <Button variant="outlined" onClick={handlePrintCarne} sx={{ alignSelf: "center", gap: 1, display: "flex", alignItems: "center" }}>

          <Typography variant="body1">Imprimir carnê</Typography>
          <PrintIcon />
        </Button>
      </Box>
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
      <Box sx={{ display: "none" }}>
        <Carne ref={printCarneRef} fees={fees} student={student} />
      </Box>
    </Box>
  );
};

export default SingleStudentPage;
