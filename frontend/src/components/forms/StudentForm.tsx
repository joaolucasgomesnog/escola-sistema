"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Avatar, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { BASE_URL } from "../../app/constants/baseUrl";
import { Class } from "@/interfaces/class";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
  password: z.string().min(8, { message: "Senha deve conter ao menos 8 caracteres" }),
  name: z.string().min(1, { message: "Nome é obrigatório!" }),

  phone: z.string().optional(),
  email: z.string()
  .email({ message: "E-mail inválido" })
  .or(z.literal(""))
  .optional(),
  picture: z
    .instanceof(File)
    .optional()
    .or(z.literal(null))
    .or(z.undefined()),

  birthDate: z.string().optional(),
  observation: z.string().optional(),

  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),

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
    reset,
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const cepValue = watch("address.postalCode");
  const stateValue = watch("address.state");
  const cityValue = watch("address.city")
  const streetValue = watch("address.street")
  const neighborhoodValue = watch("address.neighborhood")
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
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [classe, setClasse] = useState('');

  const [selectDiscountVisible, setSelectDiscountVisible] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<any | null>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);



  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");

      // ✅ Upload da imagem
      const pictureFile = formData.picture as File | undefined;
      let pictureUrl = null;
      if (pictureFile) {
        pictureUrl = await uploadImage(pictureFile);
      }

      const studentReponse = await fetch(`${BASE_URL}/student/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ""),
          address: formData.address || undefined,
          picture: pictureUrl,
          observation: formData.observation || null,
        }),
      });

      const studentResult = await studentReponse.json();

      if (!studentReponse.ok) {
        window.alert(studentResult.error || "Erro ao cadastrar estudante");
        return;
      }

      const studentId = studentResult.id;
      setStudentId(studentId);

      if (selectedDiscountId) await addDiscountToStudent(studentId);
      if (selectedClasses.length > 0) await confirmClasses(studentId);

      window.alert("Estudante cadastrado com sucesso!");
      reset()
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });



  const confirmClasses = async (studentId: number) => {
    const token = Cookies.get("auth_token");
    if (!token) return router.push("/sign-in");

    try {
      const response = await fetch(`${BASE_URL}/student/create-class-student`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selectedClasses,
          studentId
        })
      });

      if (!response.ok) throw new Error("Erro ao confirmar turmas");

      window.alert("Matrícula efetuada com sucesso");

    } catch (error) {
      console.error(error);
      window.alert("Erro ao confirmar turmas");
    }
  };

  const fetchDiscounts = async () => {
    setSelectDiscountVisible(true)
    const token = Cookies.get("auth_token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/discount/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar descontos do aluno.");

      const data = await response.json();
      setDiscounts(data)
    } catch (error) {
      console.error("Erro ao carregar descontos:", error);
    }
  }


  const addDiscountToStudent = async (studentId: number) => {
    const token = Cookies.get("auth_token");
    if (!token) return router.push("/sign-in");

    try {
      const response = await fetch(`${BASE_URL}/student/add-discount/${studentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discountId: Number(selectedDiscountId) })
      });

      if (!response.ok) throw new Error("Erro ao adicionar desconto");

      window.alert("Desconto adicionado com sucesso");

    } catch (error) {
      console.error(error);
      window.alert("Erro ao adicionar desconto");

    }
  };





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
    fetchDiscounts();
  }, []);


  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Cadastrar estudante</h1>

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
            <div className="flex flex-wrap gap-4">
              <InputField label="Data de Nascimento" name="birthDate" type="date" defaultValue={data?.birthDate ? data.birthDate.split("T")[0] : ""} register={register} error={errors?.birthDate} />
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

        <TextField
          label="Rua"
          {...register("address.street")}
          defaultValue={data?.address || ""}
          error={!!errors.address}
          InputLabelProps={{ shrink: !!streetValue }}
          helperText={errors.address?.message?.toString()}
          size="small"
          fullWidth
        />
        <InputField label="Número" name="address.number" register={register} error={errors?.address?.number} />
        <TextField
          label="Bairro"
          {...register("address.neighborhood")}
          defaultValue={data?.address || ""}
          error={!!errors.address}
          size="small"
          InputLabelProps={{ shrink: !!neighborhoodValue }}
          helperText={errors.address?.message?.toString()}
          fullWidth
        />
        <TextField
          label="Cidade"
          {...register("address.city")}
          defaultValue={data?.address || ""}
          error={!!errors.address}
          size="small"
          InputLabelProps={{ shrink: !!cityValue }}
          helperText={errors.address?.message?.toString()}
          fullWidth
        />
        <TextField
          label="Estado"
          {...register("address.state")}
          defaultValue={data?.address || ""}
          error={!!errors.address}
          size="small"
          InputLabelProps={{ shrink: !!stateValue }}
          helperText={errors.address?.message?.toString()}
          fullWidth
        />
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

      <Box>
        <FormControl className="w-32 " size="small">

          <InputLabel id="demo-simple-select-label">Desconto</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedDiscountId}
            onChange={(e) => {
              const selectedId = e.target.value as string;
              setSelectedDiscountId(Number(selectedId))
              setSelectedDiscount(discounts.find((discount) => discount.id === Number(selectedId)) || null);
            }}
          >
            {
              discounts?.map((discount) => (
                <MenuItem key={discount.id} value={discount.id}>{discount.code}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

      </Box>

      {
        selectedDiscount && (
          <Box key={selectedDiscount.code} display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField label="Código" value={selectedDiscount.code ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Descrição" value={selectedDiscount.description ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField label="Percentual" value={selectedDiscount.percentage ?? ""} size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" color="error" onClick={() => { setSelectedDiscountId(null); setSelectedDiscount(null); }}>
              <DeleteForeverIcon fontSize="medium" />
            </Button>
          </Box>
        )
      }


      <span className="text-xs text-gray-400 font-medium">Matrícula</span>

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
            <Box key={classe.code} display="flex" flexWrap="wrap" gap={2}>
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
              <Button variant="outlined" color="error" onClick={() => { setSelectedClasses((prev) => prev.filter((c) => c.code !== classe.code)) }}>
                <DeleteForeverIcon fontSize="medium" />
              </Button>
            </Box>
          );
        })

      }

      <TextField
        label="Observação"
        {...register("observation")}
        defaultValue={data?.observation || ""}
        multiline
        minRows={4}
        maxRows={8}
        placeholder="Escreva observações adicionais..."
        error={!!errors.observation}
        helperText={errors.observation?.message?.toString()}
        fullWidth
      />


      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default StudentForm;
