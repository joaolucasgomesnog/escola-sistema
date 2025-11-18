"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { role } from "@/lib/data";

type Lesson = {
  id: number;
  subject: string;
  class: string;
  teacher: string;
};

const LessonListPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    // Aqui pode carregar os dados via fetch ou carregar o array local
    // setLessons(lessonsData);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "subject",
      headerName: "Subject Name",
      flex: 2,
    },
    {
      field: "class",
      headerName: "Class",
      flex: 1,
    },
    {
      field: "teacher",
      headerName: "Teacher",
      flex: 1,
      hideable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          {role === "admin" && (
            <>
              <FormModal table="lesson" type="update" data={params.row} />
              <FormModal table="lesson" type="delete" id={params.row.id} />
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
      className="dark:bg-dark"
      borderRadius={2}
      m={2}
      sx={{
        height: 'calc(100vh - 64px)', // altura total da viewport menos o header, ajuste se necessário
        overflowY: 'auto'
      }}
    >
      {/* Top bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" className="hidden md:block">
          Atividades
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
          alignItems="center"
          width={{ xs: "100%", md: "auto" }}
        >
          <TableSearch />
          <Box display="flex" gap={2}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="lesson" type="create" />}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Table rows={lessons} columns={columns} />

    </Box>
  );
};

export default LessonListPage;
