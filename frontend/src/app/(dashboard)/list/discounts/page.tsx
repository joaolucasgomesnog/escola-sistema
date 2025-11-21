"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { role } from "@/lib/data";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from "next/link";
import { BASE_URL } from "../../../constants/baseUrl";

type Discount = {
  id: number;
  code: string;
  description: string;
  percentage: number;
};

const DiscountListPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiscounts = async () => {
    try {
      const token = Cookies.get("auth_token");

      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/discount/getall`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove("auth_token");
          router.push("/sign-in");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar descontos");
      }

      const data = await response.json();
      console.log(data);



      setDiscounts(data);
    } catch (error) {
      console.error("Erro ao buscar dados dos descontos:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchDiscounts();
  }, [router]);

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "Código",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Descrição",
      flex: 2,
    },
    {
      field: "percentage",
      headerName: "Percentual (%)",
      flex: 1,
      valueGetter: (value) => {
        if (!value) { return null }
        return `${value}%`
      }
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center gap-2 h-12">
          <Link href={`/list/discounts/${params.row.id}`}>
            <IconButton>
              <VisibilityIcon />
            </IconButton>
          </Link>
          <IconButton
            onClick={() => {
              if (confirm("Deseja excluir este desconto?"))
                fetch(`${BASE_URL}/discount/delete/${params.row.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
                }).then(() => fetchDiscounts());
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </div>
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
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Descontos
        </Typography>
        {role === "admin" && (
          <FormModal table="discount" type="create" />
        )}
      </Box>

      <Table rows={discounts} columns={columns} />
    </Box>
  );
};

export default DiscountListPage;
