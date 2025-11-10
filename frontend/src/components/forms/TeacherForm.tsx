"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BASE_URL } from "../../app/constants/baseUrl";
import { Avatar } from "@mui/material";
import { uploadImage } from "@/lib/imageFuncions";

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
  picture: z
    .instanceof(File)
    .optional()
    .or(z.literal(null))
    .or(z.undefined()),

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

const TeacherForm = ({
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);


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

      // ✅ Upload da imagem
      const pictureFile = formData.picture as File | undefined;
      let pictureUrl = null;
      if (pictureFile) {
        pictureUrl = await uploadImage(pictureFile);
      }
      const response = await fetch(`${BASE_URL}/teacher/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ""), // Remove formatação
          address: formData.address || undefined,
          picture: pictureUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao cadastrar professor");
        return;
      }

      window.alert("Professor cadastrado com sucesso!");
      console.log("Professor criado:", result);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });


  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar professor</h1>

      <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center mx-auto">

        <label
          htmlFor="picture"
          className="cursor-pointer flex items-center justify-center"
          style={{ width: 120, height: 120 }}
        >
          <Avatar
            src={imagePreview ?? undefined}
            sx={{ width: 120, height: 120 }}
          />
        </label>

        <input
          type="file"
          id="picture"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;

            setValue("picture", file, { shouldValidate: true });
            if (file) setImagePreview(URL.createObjectURL(file));
          }}
          className="hidden"
        />

        {errors.picture?.message && (
          <p className="text-xs text-red-400">{errors.picture.message.toString()}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4">

        <div className="flex flex-col gap-2 w-full ">
          <label className="text-xs text-gray-500">CPF</label>
          <input
            type="text"
            {...register("cpf")}
            value={watch("cpf") || ""}
            onChange={(e) => {
              const formatted = formatCpf(e.target.value);
              setValue("cpf", formatted);
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

export default TeacherForm;
