"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import Cookies from "js-cookie";
import NumberFormat from "react-number-format";
import { useState } from "react";
import { TextField } from "@mui/material";
import { BASE_URL } from "../../app/constants/baseUrl";

const formatValue = (value: string) => {
  const numeric = value.replace(/\D/g, '').padStart(3, '0'); // Garante pelo menos 3 dígitos
  const integerPart = numeric.slice(0, -2);
  const decimalPart = numeric.slice(-2);

  // Remove zeros à esquerda do inteiro para evitar "000.123"
  const cleanedInteger = integerPart.replace(/^0+/, '') || '0';

  // Aplica ponto como separador de milhar
  const formattedInteger = cleanedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `R$${formattedInteger},${decimalPart}`;
};


const schema = z.object({
  name: z.string().min(1, { message: "Nome do curso é obrigatório!" }),
  code: z.string().min(1, { message: "Código do curso é obrigatório!" }),
  registrationFeeValue: z
    .string()
    .min(1, { message: "Valor da taxa de matrícula é obrigatório!" }),
  monthlyFeeValue: z
    .string()
    .min(1, { message: "Valor da mensalidade é obrigatório!" }),
});

type Inputs = z.infer<typeof schema>;

const CourseForm = ({
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
    control,
    watch
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    mode: "onChange", //

  });

  const [registrationFeeValue, setRegistrationFeeValue] = useState(
    data?.registrationFeeValue ? formatValue(data.registrationFeeValue.toString()) : ""
  );
  const [monthlyFeeValue, setMonthlyFeeValue] = useState(
    data?.monthlyFeeValue ? formatValue(data.monthlyFeeValue.toString()) : ""
  );

  const onSubmit = handleSubmit(async (formData) => {

    try {
      console.log(formData)

      const token = Cookies.get("auth_token");

      const response = await fetch(`${BASE_URL}/course/${type}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          registrationFeeValue: formData.registrationFeeValue.replace(/[^0-9,]/g, '').replace(',', '.'),
          monthlyFeeValue: formData.monthlyFeeValue.replace(/[^0-9,]/g, '').replace(',', '.')
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao cadastrar curso");
        return;
      }

      window.alert(
        type === "create"
          ? "Curso cadastrado com sucesso!"
          : "Curso atualizado com sucesso!"
      );
      console.log("Curso salvo:", result);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>

      <h1 className="text-xl font-semibold">
        {type === "create" ? "Cadastrar curso" : "Atualizar curso"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Nome"
          name="name"
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Código"
          name="code"
          register={register}
          error={errors?.code}
        />
      </div>

      <div className="flex flex-wrap gap-4">

        <TextField label="Taxa de matrícula" type="text" {...register("registrationFeeValue")} value={watch("registrationFeeValue") || ""} inputProps={{ maxLength: 14 }} size="small" fullWidth helperText={errors?.registrationFeeValue?.message}
          onChange={(e) => {
            const formatted = formatValue(e.target.value);
            setValue("registrationFeeValue", formatted);
          }}
        />

        <TextField label="Valor mensalidade" type="text" {...register("monthlyFeeValue")} value={watch("monthlyFeeValue") || ""} inputProps={{ maxLength: 14 }} size="small" fullWidth helperText={errors?.monthlyFeeValue?.message}
          onChange={(e) => {
            const formatted = formatValue(e.target.value);
            setValue("monthlyFeeValue", formatted);
          }}
        />


      </div>
      

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md" >
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default CourseForm;
