"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../../../theme"; // ou ajuste o caminho
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../constants/baseUrl";

type Payment = {
  id: number;
  courseId: string;
  name: string;
  photo: string;
  phone?: string;
  code: string;
};

const PaymentListPage = () => {
  const [payment, setPayments] = useState<Payment[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = Cookies.get("auth_token");

        if (!token) {
          router.push("/sign-in");
          return;
        }

        const response = await fetch(`${BASE_URL}/course/getall`, {
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
          throw new Error(errorData.error || "Erro ao buscar estudantes");
        }

        const data = await response.json();
        console.log(data)

        const formattedPayments: Payment[] = data.map((s: any) => ({
          id: s.id,
          courseId: String(s.id),
          name: s.name,
          code: s.code,
          photo: s.picture || "/default-avatar.png",
        }));

        setPayments(formattedPayments);
      } catch (error) {
        console.error("Erro ao buscar dados dos estudantes:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Avatar src={params.row.photo} sx={{ width: 32, height: 32 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="gray">
              {params.row.class}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "code",
      headerName: "Código",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "Ações",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center gap-2 h-12">
          <Link href={`/list/payment/${params.row.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="course" type="delete" id={params.row.id} />
          )}
        </div>
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
          Pagamentos
        </Typography>
        {role === "admin" && (
          <FormModal table="course" type="create" />
        )}
      </Box>

      <Table rows={payment} columns={columns} />
    </Box>
  );
};

export default PaymentListPage;
