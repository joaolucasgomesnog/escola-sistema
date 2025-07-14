"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { TextField } from "@mui/material";
import { BASE_URL } from "../../app/constants/baseUrl";


const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const schema = z.object({
  cpf: z.string()
    .min(11, { message: "CPF deve ter ao menos 11 dígitos" })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF inválido" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "Name is required!" }),

  phone: z.string().optional(),
  email: z.string()
    .email({ message: "E-mail inválido" }),
  picture: z
    .any()
    .refine(
      (file) => file instanceof File || file === undefined || file === null || file === "",
      { message: "A imagem deve ser um arquivo válido." }
    )
    .transform((file) => (file === "" ? undefined : file))
    .optional(),

  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional()
});

type Inputs = z.infer<typeof schema>;

const AdminForm = ({
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
  });

  const cepValue = watch("address.postalCode");

  useEffect(() => {
    if (cepValue) {
      checkCEP(cepValue);
    }
  }, [cepValue]);

  const checkCEP = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');

    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        window.alert("CEP não encontrado");
        return;
      }

      setValue("address.street", data.logradouro);
      setValue("address.neighborhood", data.bairro);
      setValue("address.city", data.localidade);
      setValue("address.state", data.estado);
      setValue("address.postalCode", cep)
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      window.alert("Erro ao buscar CEP");
    }
  };

  const [cpf, setCpf] = useState(data?.cpf ? formatCpf(data.cpf) : "");

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");
      const response = await fetch(`${BASE_URL}/admin/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ""), // Remove formatação
          address: formData.address || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao cadastrar administrador");
        return;
      }

      window.alert("Administrador cadastrado com sucesso!");
      console.log("Administrador criado:", result);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });


  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar administrador</h1>
      <div className="flex flex-wrap gap-4">

        <TextField label="CPF" type="text" {...register("cpf")} value={watch("cpf") || ""} inputProps={{ maxLength: 14 }} size="small" fullWidth helperText={errors?.cpf?.message}
          onChange={(e) => {
            const formatted = formatCpf(e.target.value);
            setValue("cpf", formatted);
          }}
        />

        <InputField label="Senha" name="password" type="password" defaultValue={data?.password} register={register} error={errors?.password} />
      </div>
      <div className="flex flex-wrap gap-4">
        <InputField label="Nome" name="name" defaultValue={data?.name} register={register} error={errors?.name} />
      </div>
      <span className="text-xs text-gray-400 font-medium">Contato</span>

      <div className="flex flex-wrap gap-4">
        <InputField label="Telefone" name="phone" defaultValue={data?.phone} register={register} error={errors?.phone} />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
      </div>

      <span className="text-xs text-gray-400 font-medium">Endereço</span>
      <div className="flex flex-wrap gap-4">
        <InputField label="CEP" name="address.postalCode" register={register} error={errors?.address?.postalCode} />
        <InputField label="Rua" name="address.street" register={register} error={errors?.address?.street} />
        <InputField label="Número" name="address.number" register={register} error={errors?.address?.number} />
        <InputField label="Bairro" name="address.neighborhood" register={register} error={errors?.address?.neighborhood} />
        <InputField label="Cidade" name="address.city" register={register} error={errors?.address?.city} />
        <InputField label="Estado" name="address.state" register={register} error={errors?.address?.state} />
      </div>

      {/* <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
        <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" htmlFor="picture">
          <Image src="/upload.png" alt="" width={28} height={28} />
          <span>Selecione uma foto</span>
        </label>
        <input type="file" id="picture" {...register("picture")} className="hidden" />
        {errors.picture?.message && (
          <p className="text-xs text-red-400">
            {errors.picture.message.toString()}
          </p>
        )}
      </div> */}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default AdminForm;
