"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from "js-cookie";
import { TextField } from "@mui/material";

const schema = z.object({
  code: z.string().min(1, { message: "Código é obrigatório!" }),
  description: z.string().min(1, { message: "Descrição é obrigatória!" }),
  percentage: z
    .string()
    .min(1, { message: "Percentual é obrigatório!" })
    .refine((val) => {
      const parsed = parseFloat(val.replace(",", "."));
      return !isNaN(parsed) && parsed >= 0 && parsed <= 100;
    }, { message: "Percentual deve estar entre 0 e 100" }),
});

type Inputs = z.infer<typeof schema>;

const DiscountForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      code: data?.code || "",
      description: data?.description || "",
      percentage: data?.percentage ? String(data.percentage * 100) : "", // Exibe como 15, não 0.15
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`http://localhost:3030/discount/${type}`, {
        method: type === "create" ? "POST" : "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          percentage: parseFloat(formData.percentage.replace(",", ".")), // Converte 15 → 0.15
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao salvar desconto");
        return;
      }

      window.alert(
        type === "create"
          ? "Desconto cadastrado com sucesso!"
          : "Desconto atualizado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Cadastrar desconto" : "Atualizar desconto"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <TextField
          label="Código"
          type="text"
          size="small"
          fullWidth
          {...register("code")}
          error={!!errors.code}
          helperText={errors.code?.message}
        />

        <TextField
          label="Descrição"
          type="text"
          size="small"
          fullWidth
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
        />

        <TextField
          label="Percentual (%)"
          type="text"
          size="small"
          fullWidth
          inputProps={{ maxLength: 6 }}
          value={watch("percentage") || ""}
          error={!!errors.percentage}
          helperText={errors.percentage?.message}
          {...register("percentage")}
          onChange={(e) => {
            // Permite ponto ou vírgula como separador decimal
            const val = e.target.value.replace(/[^\d.,]/g, "");
            setValue("percentage", val);
          }}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md"
      >
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default DiscountForm;
