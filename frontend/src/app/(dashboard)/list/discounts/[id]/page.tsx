'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Decimal from 'decimal.js';

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Discount } from "../../../../../interfaces/discount";
import { BASE_URL } from "../../../../constants/baseUrl";

interface SingleDiscountPageProps {
  params: { id: string };
}

const SingleDiscountPage = ({ params }: SingleDiscountPageProps) => {
  const { id } = params;
  const router = useRouter();

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newDiscount, setNewDiscount] = useState<Discount | undefined>(undefined);

  const studentColumns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "cpf", headerName: "CPF", flex: 2 },
    { field: "phone", headerName: "Telefone", flex: 2 },
    
  ];
  useEffect(() => {
    const fetchDiscount = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/sign-in");

      try {
        const res = await fetch(`${BASE_URL}/discount/get/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar desconto");
        const data = await res.json();
        console.log(data)
        setDiscount(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id]);

  const updateDiscount = async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${BASE_URL}/discount/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newDiscount,
          percentage: parseFloat(String(newDiscount?.percentage ?? 0)),
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar desconto");
      const updated = await res.json();
      setDiscount(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

    if (loading) return (
      <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Box>)
  if (!discount) return <Typography>Desconto não encontrado.</Typography>;

  return (
    <Box p={3} className="dark:bg-dark" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Perfil do desconto</Typography>
        {isEditing
          ? <Button variant="contained" onClick={updateDiscount}>Salvar</Button>
          : <Button
            variant="outlined"
            onClick={() => {
              setIsEditing(true);
              setNewDiscount({ ...discount });
            }}
          >
            Editar
          </Button>
        }
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField
          label="Código"
          size="small"
          value={isEditing ? newDiscount?.code ?? "" : discount.code}
          onChange={(e) => isEditing && setNewDiscount({ ...newDiscount!, code: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Descrição"
          size="small"
          value={isEditing ? newDiscount?.description ?? "" : discount.description}
          onChange={(e) => isEditing && setNewDiscount({ ...newDiscount!, description: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />

        <TextField
          label="Percentual (%)"
          size="small"
          type="text"
          value={isEditing ? String(newDiscount?.percentage) ?? "" : String(discount.percentage)}
          onChange={(e) => {
            if (!isEditing) return;

            let value = e.target.value;

            // Remove tudo que não for número ou ponto
            value = value.replace(/[^0-9.]/g, "");

            // Garante que só o primeiro ponto seja mantido
            const parts = value.split(".");
            if (parts.length > 2) {
              value = parts[0] + "." + parts.slice(1).join(""); // remove pontos extras
            }

            setNewDiscount({ ...newDiscount!, percentage: parseFloat(value) });
          }}
          InputProps={{ readOnly: !isEditing }}
          inputProps={{ maxLength: 6 }}
          sx={{ flex: 2 }}
        />

      </Box>
      <Divider sx={{mb:4}} />
      <Typography sx={{mb:2}} >Estudantes com esse desconto</Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={discount?.students}
          columns={studentColumns}
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default SingleDiscountPage;
