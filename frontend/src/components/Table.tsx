// components/Table.tsx

"use client";

import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TableProps {
  columns: GridColDef[];
  rows: any[];
  height?: string | number;
}

const Table = ({ columns, rows, height = "75vh" }: TableProps) => {
  return (
    <Box
      height={height}
      sx={{
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#1F2A40", // ou use o tema
          borderBottom: "none",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "none",
        },
        "& .MuiCheckbox-root": {
          color: "#94e2cd !important",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default Table;
