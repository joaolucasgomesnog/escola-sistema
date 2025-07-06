"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme"; // ou ajuste o caminho
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { formatPhone } from "@/lib/formatValues";

type Teacher = {
  id: number;
  teacherId: string;
  name: string;
  email?: string;
  photo: string;
  phone?: string;
  grade: number;
  class: string;
  address: string;
};

const TeacherListPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = Cookies.get("auth_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:3030/teacher/getall", {
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
          throw new Error(errorData.error || "Erro ao buscar professores");
        }

        const data = await response.json();

        const formattedTeachers: Teacher[] = data.map((s: any) => ({
          id: s.id,
          teacherId: String(s.id),
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

        setTeachers(formattedTeachers);
      } catch (error) {
        console.error("Erro ao buscar dados dos professores:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
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
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%">
        <Typography variant="body2">
          {params.value ? formatPhone(params.value) : "Não informado"}
        </Typography>
        </Box>
      ),
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
          <Link href={`/list/teachers/${params.row.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="teacher" type="delete" id={params.row.id} />
          )}
        </div>
      ),
    },
  ];

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Professores
        </Typography>
        {role === "admin" && (
          <FormModal table="teacher" type="create" />
        )}
      </Box>

      <Table rows={teachers} columns={columns} />
    </Box>
  );
};

export default TeacherListPage;
