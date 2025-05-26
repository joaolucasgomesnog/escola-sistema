"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";

const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const schema = z.object({ 
  cpf: z.string().min(3, { message: "Cpf must be at least 3 characters long!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "Name is required!" }),

  phone: z.string().optional(),
 picture: z
  .any()
  .refine(
    (file) => file instanceof File || file === undefined || file === null || file === "",
    { message: "A imagem deve ser um arquivo válido." }
  )
  .transform((file) => (file === "" ? undefined : file))
  .optional(),

  address: z.object({
    cep: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    neighboor: z.string().optional(),
    city: z.string().optional(),
  }).optional()
});

type Inputs = z.infer<typeof schema>;

const StudentForm = ({
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

const cepValue = watch("address.cep");

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

    setValue("address.rua", data.logradouro);
    setValue("address.neighboor", data.bairro);
    setValue("address.city", data.localidade);
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    window.alert("Erro ao buscar CEP");
  }
};

const [cpf, setCpf] = useState(data?.cpf ? formatCpf(data.cpf) : "");

const onSubmit = handleSubmit(async (formData) => {
  const body = new FormData();

  body.append("name", formData.name);
  body.append("cpf", cpf.replace(/\D/g, ""));
  if (formData.phone) body.append("phone", formData.phone);
  body.append("password", formData.password);

  // if (formData.picture instanceof File) {
  //   body.append("picture", formData.picture);
  // }

  if (formData.address) {
    body.append("address", JSON.stringify(formData.address));
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/student/create", {
      method: "POST",
      body,
       headers: {
            Authorization: `Bearer ${token}`,
          },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro:", result.error);
      window.alert(result.error || "Erro ao cadastrar estudante");
      return;
    }

    window.alert("Estudante cadastrado com sucesso!");
    console.log("Estudante criado:", result);
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
    window.alert("Erro interno ao enviar dados");
  }
});


  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar estudante</h1>
      <div className="flex flex-wrap gap-4">
        
<div className="flex flex-col gap-2 w-full ">
  <label className="text-xs text-gray-500">CPF</label>
  <input
  type="text"
  {...register("cpf")}
  value={cpf}
  onChange={(e) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  }}
  maxLength={14}
  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
/>

  {errors?.cpf && (
    <p className="text-xs text-red-400">{errors.cpf.message?.toString()}</p>
  )}
</div>

        <InputField label="Senha" name="password" type="password" defaultValue={data?.password} register={register} error={errors?.password} />
      </div>
      <div className="flex flex-wrap gap-4">
        <InputField label="Nome" name="name" defaultValue={data?.name} register={register} error={errors?.name} />
      </div>
      <span className="text-xs text-gray-400 font-medium">Contato</span>

            <div className="flex flex-wrap gap-4">
        <InputField label="Telefone" name="phone" defaultValue={data?.phone} register={register} error={errors?.phone} />
      </div>

      <span className="text-xs text-gray-400 font-medium">Endereço</span>
      <div className="flex flex-wrap gap-4">
        <InputField label="CEP" name="address.cep" register={register} error={errors?.address?.cep} />
        <InputField label="Rua" name="address.rua" register={register} error={errors?.address?.rua} />
        <InputField label="Número" name="address.numero" register={register} error={errors?.address?.numero} />
        <InputField label="Bairro" name="address.neighboor" register={register} error={errors?.address?.neighboor} />
        <InputField label="Cidade" name="address.city" register={register} error={errors?.address?.city} />
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

export default StudentForm;
