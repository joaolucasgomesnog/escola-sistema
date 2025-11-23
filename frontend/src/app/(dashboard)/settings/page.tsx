"use client";


import { formatCpf, formatPhone } from "@/lib/formatValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Box, Button, CircularProgress, FormControl, FormControlLabel, FormLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography, useColorScheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from "js-cookie";
import InputField from "@/components/InputField";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "@/app/constants/baseUrl";
import { getUserFromToken } from "@/lib/getUserFromToken";



const schema = z.object({
  oldPassword: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
  newPassword: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
});

type Inputs = z.infer<typeof schema>;

const SettingsPage = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: ""

    },
  });



  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");
      const user = getUserFromToken();
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };
      if (!token) {
        throw new Error("Token não encontrado");
      }

      if (!user) {
        window.alert("Erro interno ao identificar usuário")
        return
      }

      const url = `${BASE_URL}/login/update-password/${user.role}/${user.id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao atualizar senha");
        return;
      }

      window.alert(`Senha atualizada com sucesso!`);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });



  return (
    <Box bgcolor="white" className="dark:bg-dark" p={3}  borderRadius={2} m={2} sx={{ height: "calc(100vh - 64px)", overflowY: "auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Configurações
        </Typography>
      </Box>
      <form className="flex flex-col gap-4 mt-8" onSubmit={onSubmit}>

        <Typography variant="body1">Atualizar senha</Typography>
        <div className="flex flex-col gap-4 dark:bg-dark">

          <InputField
            label="Antiga senha"
            name="oldPassword"
            type="password"
            defaultValue={""}
            register={register}
            error={errors?.oldPassword}
          />

           <InputField
            label="Nova senha"
            name="newPassword"
            type="password"
            defaultValue={""}
            register={register}
            error={errors?.newPassword}
          />

        </div>


        <Button variant="contained" type="submit" className="self-end mt-4">
          Atualizar
        </Button>
      </form>

    </Box>
  );
};

export default SettingsPage;
