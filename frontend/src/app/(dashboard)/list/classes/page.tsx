"use client";

import { useEffect, useState } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { role } from "@/lib/data";

type Class = {
  id: number;
  name: string;
  capacity: number;
  grade: number;
  supervisor: string;
};

const ClassListPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3030/class/getall", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Erro ao buscar turmas:", error.message);
          return;
        }

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };

    fetchClasses();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome da Turma",
      flex: 1,
    },
    {
      field: "capacity",
      headerName: "Capacidade",
      flex: 1,
    },
    {
      field: "grade",
      headerName: "Série",
      flex: 1,
    },
    {
      field: "supervisor",
      headerName: "Supervisor",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          {role === "admin" && (
            <>
              <FormModal table="class" type="update" data={params.row} />
              <FormModal table="class" type="delete" id={params.row.id} />
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} mt={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Turmas
        </Typography>
        {role === "admin" && (
          <FormModal table="class" type="create" />
        )}
      </Box>

      <Table rows={classes} columns={columns} />
    </Box>
  );
};

export default ClassListPage;
