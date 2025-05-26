"use client";

import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import FormModal from "@/components/FormModal";
import { parentsData, role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { GridColDef } from "@mui/x-data-grid";
import { Avatar, Box, Typography } from "@mui/material";

const ParentListPage = () => {
  const columns: GridColDef[] = [
    {
      field: "info",
      headerName: "Info",
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Avatar src={params.row.photo} sx={{ width: 32, height: 32 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
          </Box>
        </Box>
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
