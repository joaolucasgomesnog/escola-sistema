"use client";

import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import FormModal from "@/components/FormModal";
import { parentsData, role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

const ParentListPage = () => {
  const columns: GridColDef[] = [
    {
      field: "info",
      headerName: "Info",
      flex: 1.5,
      renderCell: (params) => (
        <div className="flex items-center gap-4">
          <Image
            src={params.row.photo}
            alt={params.row.name}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <p className="font-semibold">{params.row.name}</p>
            <p className="text-xs text-gray-500">{params.row.email}</p>
          </div>
        </div>
      ),
    },
    {
      field: "parentId",
      headerName: "Parent ID",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Link href={`/list/parents/${params.row.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="parent" type="delete" id={params.row.id} />
          )}
        </div>
      ),
    },
  ];

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} mt={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Pais
        </Typography>
        {role === "admin" && (
          <FormModal table="parent" type="create" />
        )}
      </Box>

      <Table rows={parentsData} columns={columns} />
    </Box>
  );
};

export default ParentListPage;
