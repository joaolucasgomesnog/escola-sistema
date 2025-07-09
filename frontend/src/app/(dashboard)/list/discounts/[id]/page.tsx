'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  TextField,
  Typography
} from "@mui/material";

interface Discount {
  id: number;
  code: string;
  description: string;
  percentage: number;
}

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

  useEffect(() => {
    const fetchDiscount = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`http://localhost:3030/discount/get/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar desconto");
        const data = await res.json();
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
      const res = await fetch(`http://localhost:3030/discount/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newDiscount,
          percentage: Number(newDiscount?.percentage),
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

  if (loading) return <Typography>Carregando...</Typography>;
  if (!discount) return <Typography>Desconto não encontrado.</Typography>;

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
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
          label="Percentual"
          size="small"
          value={isEditing ? newDiscount?.percentage ?? "" : discount.percentage*100}
          onChange={(e) => isEditing && setNewDiscount({ ...newDiscount!, percentage: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          inputProps={{ maxLength: 5 }}

          sx={{ flex: 2 }}
        />




      </Box>
    </Box>
  );
};

export default SingleDiscountPage;
