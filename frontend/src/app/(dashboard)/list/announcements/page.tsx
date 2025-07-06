"use client";

import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";

type Announcement = {
  id: number;
  title: string;
  class: string;
  date: string;
};

const AnnouncementListPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Simular fetch, aqui você pode adaptar para sua API real
    const fetchAnnouncements = async () => {
      // Caso tenha API, faça fetch aqui e setAnnouncements
      // Por enquanto, deixo array vazio ou você pode importar de algum mock
      // setAnnouncements(announcementsData);
    };

    fetchAnnouncements();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Título",
      flex: 2,
    },
    {
      field: "class",
      headerName: "Turma",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Data",
      flex: 1,
      hideable: true,
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
              <FormModal table="announcement" type="update" data={params.row} />
              <FormModal table="announcement" type="delete" id={params.row.id} />
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
          Lembretes
        </Typography>
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} alignItems="center">
          <TableSearch />
          <Box display="flex" gap={2}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filtrar" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Ordenar" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="announcement" type="create" />}
          </Box>
        </Box>
      </Box>

      <Table rows={announcements} columns={columns} />
      {/* Se quiser usar paginação, pode adicionar Pagination aqui */}
    </Box>
  );
};

export default AnnouncementListPage;
