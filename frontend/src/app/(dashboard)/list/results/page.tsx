"use client";

import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { role } from "@/lib/data";
import { tokens } from "../../../../../theme";

type Result = {
  id: number;
  subject: string;
  class: string;
  teacher: string;
  student: string;
  type: "exam" | "assignment";
  date: string;
  score: number;
};

const ResultListPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3030/result/getall", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao buscar resultados:", errorData.error);
          return;
        }

        const data = await response.json();

        const formattedResults: Result[] = data.map((r: any) => ({
          id: r.id,
          subject: r.subject,
          class: r.class,
          teacher: r.teacher,
          student: r.student,
          type: r.type,
          date: r.date,
          score: r.score,
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error("Erro ao buscar dados dos resultados:", error);
      }
    };

    fetchResults();
  }, []);

  const columns: GridColDef[] = [
    { field: "subject", headerName: "Disciplina", flex: 1 },
    { field: "student", headerName: "Estudante", flex: 1 },
    { field: "score", headerName: "Nota", flex: 1 },
    { field: "teacher", headerName: "Professor", flex: 1 },
    { field: "class", headerName: "Turma", flex: 1 },
    { field: "date", headerName: "Data", flex: 1 },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="result" type="update" data={params.row} />
              <FormModal table="result" type="delete" id={params.row.id} />
            </>
          )}
        </Box>
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
          Notas
        </Typography>
        {(role === "admin" || role === "teacher") && (
          <FormModal table="result" type="create" />
        )}
      </Box>

      <Table rows={results} columns={columns} />
    </Box>
  );
};

export default ResultListPage;
