"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { BASE_URL } from "../../app/constants/baseUrl";
import { Class } from "@/interfaces/class";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";


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
    .email({ message: "E-mail inválido" }).optional(),
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

  const cepValue = watch("address.postalCode");
  const router = useRouter();

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

    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<Class[]>([]);
    const [selectdClassId, setSelectedClassId] = useState<number | null>(null);
    const [classe, setClasse] = useState('');

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");
      const response = await fetch(`${BASE_URL}/student/create`, {
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

    const fetchAvailableClasses = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/sign-in");
        return;
      }
  
      try {
        const response = await fetch(`${BASE_URL}/class/getallavailable/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error("Erro ao buscar classes do aluno.");
  
        const data = await response.json();
        setClasses(data)
        console.log("Classes:", data);
      } catch (error) {
        console.error("Erro ao carregar classes:", error);
      }
    }
    useEffect(() => {
      fetchAvailableClasses();
    }, []);


  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar estudante</h1>
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

            <Box className={`mb-4`}>
              <FormControl className="w-32 " size="small">
                <InputLabel id="demo-simple-select-label">Turma</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={classe}
                  onChange={(e) => {
                    const selectedCode = e.target.value as string;
                    const selectedClasse = classes.find((classe) => classe.code === selectedCode);
                    if (selectedClasse && !selectedClasses.some((c) => c.code === selectedClasse.code)) {
                      setSelectedClasses([...selectedClasses, selectedClasse]);
                    }
                  }}
                >
                  {
                    classes?.map((classe) => (
                      <MenuItem key={classe.code} value={classe.code}>{classe.name}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
      
            </Box>
            {
              selectedClasses?.map((classe) => {
                const horario = classe.horario
                  ? Object.entries(classe.horario)
                    .filter(([_, value]) => value !== null)
                    .map(([day, value]) => {
                      const hora = dayjs(value as string | number | Date | null | undefined).format("HH:mm");
                      const dayMap: Record<string, string> = {
                        sunday: "Domingo",
                        monday: "Segunda",
                        tuesday: "Terça",
                        wednesday: "Quarta",
                        thursday: "Quinta",
                        friday: "Sexta",
                        saturday: "Sábado"
                      };
                      return `${dayMap[day] ?? day}: ${hora}`;
                    })
                    .join(" | ")
                  : "Sem horário definido";
      
                return (
                  <Box key={classe.code} display="flex" flexWrap="wrap" gap={2} my={2}>
                    <TextField label="Curso" value={classe?.name ?? ""} size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField label="Turma" value={classe?.course?.name ?? ""} size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField label="Professor da turma" value={classe.teacher?.name ?? ""} size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField label="Horários" value={horario} size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ flex: 2 }}
                    />
      
                  </Box>
                );
              })
      
            }

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default StudentForm;
