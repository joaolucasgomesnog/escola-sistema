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

const StudentListPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const theme = useTheme();
const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3030/student/getall", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao buscar estudantes:", errorData.error);
          return;
        }

        const data = await response.json();

        const formattedStudents: Student[] = data.map((s: any) => ({
          id: s.id,
          studentId: String(s.id),
          name: s.name,
          email: "",
          photo: s.picture || "/default-avatar.png",
          phone: s.phone,
          grade: 0,
          class: "",
          address: `${s.address.street}, ${s.address.number} - ${s.address.neighborhood}, ${s.address.city} - ${s.address.state}`,
        }));

        setStudents(formattedStudents);
      } catch (error) {
        console.error("Erro ao buscar dados dos estudantes:", error);
      }
    };

    fetchStudents();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
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
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
         <div className="flex items-center gap-2 h-12">
          <Link href={`/list/students/${params.row.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
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
          Estudantes
        </Typography>
        {role === "admin" && (
          <FormModal table="student" type="create" />
        )}
      </Box>

      <Table rows={students} columns={columns} />
    </Box>
  );
};

export default StudentListPage;
