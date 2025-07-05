"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Course } from "../../interfaces/course";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const schema = z.object({
  code: z.string().min(1, { message: "Código é obrigatório!" }),
  name: z.string().min(1, { message: "Nome é obrigatório!" }),
  turno: z.string().min(1, { message: "Turno é obrigatório!" }),
  horario: z.any().optional(),
  startDate: z.string().min(1, { message: "Data de início é obrigatória!" }),
  endDate: z.string().min(1, { message: "Data de término é obrigatória!" }),
});

type Inputs = z.infer<typeof schema>;

const ClassForm = ({
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
      name: data?.name || "",
      turno: data?.turno || "",
      horario: data?.horario || "",
      startDate: data?.startDate ? data.startDate.split("T")[0] : "",
      endDate: data?.endDate ? data.endDate.split("T")[0] : "",
    },
  });

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<Course>(null)

  const fetchCourses = async () => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`http://localhost:3030/course/getall`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao buscar courses");
        return;
      }
      setCourses(result)

    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`http://localhost:3030/class/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          courseId: selectedCourseId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao salvar turma");
        return;
      }

      window.alert(
        type === "create"
          ? "Turma cadastrada com sucesso!"
          : "Turma atualizada com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Cadastrar Turma" : "Atualizar Turma"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField label="Código" name="code" register={register} error={errors?.code} />
        <InputField label="Nome" name="name" register={register} error={errors?.name} />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="Turno (ex: Manhã, Tarde, Noite)" name="turno" register={register} error={errors?.turno} />
        <InputField label="Horário" name="horario" register={register} error={errors?.horario} />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="Data de Início" name="startDate" type="date" register={register} error={errors?.startDate}
        />
        <InputField label="Data de Término" name="endDate" type="date" register={register} error={errors?.endDate} />
      </div>

      <FormControl className="w-32 " size="small" fullWidth>

        <InputLabel id="demo-simple-select-label">Curso</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={(e) => {
            const selectedCode = e.target.value as string;
            const selectedCourse = courses.find((course) => course.code === selectedCode);
            if (selectedCourse) {
              setSelectedCourseId(selectedCourse.id);
            }
          }}
        >
          {
            courses?.map((course) => (
              <MenuItem key={course.code} value={course.code}>{course.name}</MenuItem>
            ))
          }
        </Select>
      </FormControl>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
        {type === "create" ? "Cadastrar" : "Atualizar"}
      </button>
    </form>
  );
};

export default ClassForm;
