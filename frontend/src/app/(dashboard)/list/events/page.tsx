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

type Event = {
  id: number;
  title: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
};

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Aqui você pode buscar dados reais, por enquanto simulo com a importação
    // setEvents(eventsData);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 2,
    },
    {
      field: "class",
      headerName: "Class",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      hideable: true,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      flex: 1,
      hideable: true,
    },
    {
      field: "endTime",
      headerName: "End Time",
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
              <FormModal table="event" type="update" data={params.row} />
              <FormModal table="event" type="delete" id={params.row.id} />
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
          Eventos
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
            {role === "admin" && <FormModal table="event" type="create" />}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Table rows={events} columns={columns} />

    </Box>
  );
};

export default EventListPage;
