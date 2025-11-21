"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams, GridSearchIcon } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { BASE_URL } from "../../../constants/baseUrl";


type ClassType = {
  id: number;
  name: string;
  code: string;
  photo: string;
  courseName?: string;
  teacherName?: string;
};

const CourseListPage = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchFields, setSearchFields] = useState({
    name: "",
    code: "",
    turno: "",
    courseName: "",
    teacherName: "",
    startDate: "",
    endDate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const queryParams = new URLSearchParams();
      Object.entries(searchFields).forEach(([key, value]) => {
        if (value.trim() !== "") {
          queryParams.append(key, value.trim());
        }
      });

      const response = await fetch(`${BASE_URL}/class/search?${queryParams.toString()}`, {
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
        throw new Error(errorData.error || "Erro ao buscar turmas");
      }

      const data = await response.json();

      const formattedClasses: ClassType[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        photo: c.teacher?.picture || "/default-avatar.png",
        courseName: c.course?.name,
        teacherName: c.teacher?.name,
        studentCount: c._count?.students ?? 0,
      }));

      setClasses(formattedClasses);
    } catch (error) {
      console.error("Erro na busca de turmas:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = Cookies.get("auth_token");

        if (!token) {
          router.push("/sign-in");
          return;
        }

        const response = await fetch(`${BASE_URL}/class/getall`, {
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
          throw new Error(errorData.error || "Erro ao buscar turmas");
        }

        const data = await response.json();

        const formattedClasses: ClassType[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          photo: c.teacher?.picture || "/default-avatar.png",
          courseName: c.course?.name,
          teacherName: c.teacher?.name,
          studentCount: c._count?.students ?? 0,
        }));

        setClasses(formattedClasses);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [router]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" gap={1} height={"100%"}>
          <Avatar src={params.row.photo} sx={{ width: 32, height: 32 }} />
          <Box flexDirection={"column"} display="flex">
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="gray">
              {params.row.courseName || "Sem curso"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "code",
      headerName: "Código",
      flex: 1,
    },
    {
      field: "teacherName",
      headerName: "Professor",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height={"100%"}>
          <Typography variant="body2">{params.value || "Não definido"}</Typography>

        </Box>
      ),
    },
    {
      field: "studentCount",
      headerName: "Quant. Alunos",
      flex: 0.5,
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center gap-2 h-12">
          <Link href={`/list/classes/${params.row.id}`}>
            <IconButton>
              <VisibilityIcon />
            </IconButton>
          </Link>
          <IconButton
            onClick={() => {
              if (confirm("Deseja excluir esta turma?"))
                fetch(`${BASE_URL}/class/delete/${params.row.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
                }).then(handleSearch);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box p={3} bgcolor="white" className="dark:bg-dark" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Turmas
        </Typography>
        {role === "admin" && (
          <FormModal table="class" type="create" />
        )}
      </Box>

      {/* Formulário de busca */}
      <Box display="flex" gap={1} alignItems="center" flexWrap={"wrap"} maxWidth="100%" mb={2}>
        <TextField label="Nome" sx={{ flex: 2 }} name="name" value={searchFields.name} onChange={handleInputChange} size="small" />
        <TextField label="Código" sx={{ flex: 0.5 }} name="code" value={searchFields.code} onChange={handleInputChange} size="small" />
        <TextField label="Turno" sx={{ flex: 0.5 }} name="turno" value={searchFields.turno} onChange={handleInputChange} size="small" />
        <TextField label="Curso" sx={{ flex: 1 }} name="courseName" value={searchFields.courseName} onChange={handleInputChange} size="small" />
        <TextField label="Professor" sx={{ flex: 1 }} name="teacherName" value={searchFields.teacherName} onChange={handleInputChange} size="small" />
        <TextField label="Data início" sx={{ flex: 1 }} name="startDate" type="date" value={searchFields.startDate} onChange={handleInputChange} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Data fim" sx={{ flex: 1 }} name="endDate" type="date" value={searchFields.endDate} onChange={handleInputChange} size="small" InputLabelProps={{ shrink: true }} />
        <Button variant="contained" color="primary" onClick={handleSearch} startIcon={<GridSearchIcon />}>
          Buscar
        </Button>
      </Box>

      <Table rows={classes} columns={columns} />
    </Box>
  );
};

export default CourseListPage;
