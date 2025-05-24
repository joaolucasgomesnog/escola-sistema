"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  cpf: z.string().min(3, { message: "Cpf must be at least 3 characters long!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "Name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  picture: z.instanceof(File, { message: "Picture is required" }),
  address: z.object({
    cep: z.string().min(1, { message: "CEP is required!" }),
    rua: z.string().min(1, { message: "Rua is required!" }),
    numero: z.string().min(1, { message: "Número is required!" }),
    neighboor: z.string().min(1, { message: "Bairro is required!" }),
    city: z.string().min(1, { message: "Cidade is required!" }),
  })
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
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((formData) => {
    const body = {
      name: formData.name,
      cpf: formData.cpf,
      phone: formData.phone,
      password: formData.password,
      picture: formData.picture,
      address: formData.address
    };
    console.log(body);
    // Aqui você pode fazer o fetch/axios.post
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar estudante</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="CPF" name="cpf" defaultValue={data?.cpf} register={register} error={errors?.cpf} />
        <InputField label="Password" name="password" type="password" defaultValue={data?.password} register={register} error={errors?.password} />
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

      <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
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
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
