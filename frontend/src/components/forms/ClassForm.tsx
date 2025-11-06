"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Course } from "../../interfaces/course";
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { BASE_URL } from "../../app/constants/baseUrl";
import { Teacher } from "@/interfaces/teacher";

dayjs.extend(utc);

const schema = z.object({
  code: z.string().min(1, { message: "Código é obrigatório!" }),
  name: z.string().min(1, { message: "Nome é obrigatório!" }),
  turno: z.string().min(1, { message: "Turno é obrigatório!" }),
  horario: z.any().optional(),
  startDate: z.string().min(1, { message: "Data de início é obrigatória!" }),
  endDate: z.string().min(1, { message: "Data de término é obrigatória!" }),
});

const weekdays = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
];


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
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)

  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [schedule, setSchedule] = useState<Record<string, string | null>>({
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  });




  const fetchCourses = async () => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`${BASE_URL}/course/getall`, {
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

  const fetchTeachers = async () => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`${BASE_URL}/teacher/getall`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro:", result.error);
        window.alert(result.error || "Erro ao buscar professores");
        return;
      }
      setTeachers(result)

    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      window.alert("Erro interno ao enviar dados");
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchTeachers()
  }, [])

  useEffect(() => {
    console.log(schedule)
    // console.log(selectedDays)
  }, [selectedDays, schedule])

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const token = Cookies.get("auth_token");

      const response = await fetch(`${BASE_URL}/class/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          courseId: selectedCourseId,
          teacherId: selectedTeacherId,
          horario: schedule
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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Cadastrar Turma" : "Atualizar Turma"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField label="Código" name="code" register={register} error={errors?.code} />
        <InputField label="Nome" name="name" register={register} error={errors?.name} />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="Turno (ex: Manhã, Tarde, Noite)" name="turno" register={register} error={errors?.turno} />
        {/* <InputField label="Horário" name="horario" register={register} error={errors?.horario} /> */}
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="Data de Início" name="startDate" type="date" register={register} error={errors?.startDate}
        />
        <InputField label="Data de Término" name="endDate" type="date" register={register} error={errors?.endDate} />
      </div>

      <Typography variant="body1">Horario</Typography>

      <FormControl className="w-56 " size="small">

        <InputLabel id="demo-simple-select-label">Dias da semana</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value=""
          onChange={(e) => {
            const selectedDay = e.target.value;
            setSelectedDays([...selectedDays, selectedDay]);
          }}
        >
          {
            weekdays?.map((day) => (
              <MenuItem key={day.key} value={day.key}>{day.label}</MenuItem>
            ))
          }
        </Select>
      </FormControl>

      <Box display="flex" flexWrap="wrap" gap={2} >
        {selectedDays?.map((day) => {
          const label = weekdays.find((d) => d.key === day)?.label;

          return (
            <Box display='flex' gap={2} key={day}>
              <TextField
                label="Dia"
                value={label ?? ""}
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ flex: 2 }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Hora"
                  value={schedule[day] ? dayjs(schedule[day]) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      const utcIso = newValue.utc().toISOString(); // formato "2025-07-06T16:00:00Z"
                      setSchedule((prev) => ({
                        ...prev,
                        [day]: utcIso,
                      }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>



            </Box>
          );
        })}
      </Box>



      <FormControl className="w-32 " size="small" fullWidth>

        <InputLabel id="demo-simple-select-label">Curso</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={(e) => {
            const selectedCode = e.target.value as string;
            const selectedCourse = courses.find((course) => course.code === selectedCode);
            if (selectedCourse?.id !== undefined) {
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

            <FormControl className="w-32 " size="small" fullWidth>

        <InputLabel id="demo-simple-select-label">Professor</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={(e) => {
            const selectedCode = e.target.value as string;
            const selectedTeacher = teachers.find((teacher) => teacher.id === Number(selectedCode));
            if (selectedTeacher?.id !== undefined) {
              setSelectedTeacherId(selectedTeacher.id);
            }

          }}
        >
          {
            teachers?.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
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
