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

type Subject = {
  id: number;
  name: string;
  teachers: string[];
};

const SubjectListPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    // Aqui pode carregar os dados via fetch ou carregar o array local
    // setSubjects(subjectsData);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Subject Name",
      flex: 2,
    },
    {
      field: "teachers",
      headerName: "Teachers",
      flex: 2,
      hideable: true,
      renderCell: (params: GridRenderCellParams) => (
        <span className="hidden md:inline">{(params.value as string[]).join(", ")}</span>
      ),
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
              <FormModal table="subject" type="update" data={params.row} />
              <FormModal table="subject" type="delete" id={params.row.id} />
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} mt={0}>
      {/* Top bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" className="hidden md:block">
          Cursos
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
            {role === "admin" && <FormModal table="teacher" type="create" />}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Table rows={subjects} columns={columns} />

    </Box>
  );
};

export default SubjectListPage;
