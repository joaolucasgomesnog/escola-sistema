"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams, GridSearchIcon } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme"; // ou ajuste o caminho
import Table from "@/components/Table";
import PaidIcon from '@mui/icons-material/Paid';
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";





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

  const handleSearch = () => {
    // Aqui você pode usar os dados de `searchFields` para fazer uma busca na API, filtrar os dados, etc.
    console.log('Buscando com os campos:', searchFields);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = Cookies.get("auth_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:3030/student/getall", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            Cookies.remove("auth_token");
            router.push("/login");
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
        console.error("Erro ao buscar dados dos estudantes:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [router]);

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
          <IconButton color="success">
            <PaidIcon/>
          </IconButton>
          {role === "admin" && (
            <FormModal table="student" type="delete" id={params.row.id} />
          )}
        </div>
      ),
    },
  ];
  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} mt={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Caixa
        </Typography>
        {/* {role === "admin" && (
          <FormModal table="course" type="create" />
        )} */}
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
    </Box>
  );
};

export default CashierPage;
