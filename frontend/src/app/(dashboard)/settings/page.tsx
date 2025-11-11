"use client";


import { formatCpf, formatPhone } from "@/lib/formatValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Box, Button, CircularProgress, FormControl, FormControlLabel, FormLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography, useColorScheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from "js-cookie";
import InputField from "@/components/InputField";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { BASE_URL } from "@/app/constants/baseUrl";



const schema = z.object({
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
});

type Inputs = z.infer<typeof schema>;

const SettingsPage = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",

    },
  });

  const { mode, setMode } = useColorScheme();



  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");

      const payload = {
        password: formData.password,
      };
      if (!token) {
        throw new Error("Token não encontrado");
      }
      const decoded: any = jwtDecode(token);

      if (!decoded.personId) {
        throw new Error("Token não contém personId");
      }

      const personId = String(decoded.personId); // <-- usa diretamente

      const url = `${BASE_URL}/person/update/${personId}`;

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
        window.alert(result.error || "Erro ao salvar usuário");
        return;
      }

      window.alert(`Usuário atualizado com sucesso!`);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });



  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} sx={{ height: "calc(100vh - 64px)", overflowY: "auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Configurações
        </Typography>
      </Box>
      <form className="flex flex-col gap-4 mt-8" onSubmit={onSubmit}>

        <Typography variant="body1">Senha</Typography>
        <div className="flex flex-row gap-4">

          <InputField
            label="Senha"
            name="password"
            type="password"
            defaultValue={""}
            register={register}
            error={errors?.password}
          />

          {/* Nome e CNH */}

        </div>

        <Typography variant="body1">Tema</Typography>

        <FormControl>
          <RadioGroup
            aria-labelledby="demo-theme-toggle"
            name="theme-toggle"
            row
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as 'system' | 'light' | 'dark')
            }
          >
            <FormControlLabel value="system" control={<Radio />} label="Sistema" />
            <FormControlLabel value="light" control={<Radio />} label="Claro" />
            <FormControlLabel value="dark" control={<Radio />} label="Escuro" />
          </RadioGroup>
        </FormControl>

        <Button variant="contained" type="submit" className="self-end mt-4">
          Atualizar
        </Button>
      </form>

    </Box>
  );
};

export default SettingsPage;
