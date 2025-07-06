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

type Assignment = {
  id: number;
  subject: string;
  class: string;
  teacher: string;
  dueDate: string;
};

const AssignmentListPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Simula busca de dados, ajuste para sua API real
    // setAssignments(assignmentsData);
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
      field: "dueDate",
      headerName: "Due Date",
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
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="assignment" type="update" data={params.row} />
              <FormModal table="assignment" type="delete" id={params.row.id} />
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
      {/* Top Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" className="hidden md:block">
          Tarefas
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
            {(role === "admin" || role === "teacher") && (
              <FormModal table="assignment" type="create" />
            )}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Table rows={assignments} columns={columns} />

      {/* Pagination */}
      <Pagination />
    </Box>
  );
};

export default AssignmentListPage;
