'use client';

import React, { forwardRef } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Teacher } from '@/interfaces/teacher';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import Report from "./Report";

type Props = {
    teacher: Teacher;
};

const TeacherReport = forwardRef<HTMLDivElement, Props>(({ teacher }, ref) => {
    if (!teacher) return null;

    return (
        <Report ref={ref} title={`Ficha do Professor`}>
            <Box display="flex" justifyContent="space-between" mb={2}>


                {/* Dados Pessoais */}
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                        Dados Pessoais
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Nome:         {teacher.name}
                    </Typography>

                    <Typography variant="body2" style={{ fontSize: 10 }}>CPF: {formatCpf(teacher.cpf)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Email: {teacher.email}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Telefone: {formatPhone(teacher.phone)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Data de nascimento: {teacher.birthDate ? dayjs(teacher.birthDate).format("DD/MM/YYYY") : "—"}</Typography>


                </Box>
                <Avatar src={teacher.picture} sx={{ width: 100, height: 100 }} style={{ borderRadius: 0 }} />
            </Box>

            {/* Endereço */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Endereço
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    Rua: {teacher.address.street}
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    Número: {teacher.address.number}
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    Bairro: {teacher.address.neighborhood}
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    Cidade: {teacher.address.city}
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    Estado: {teacher.address.state}
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>
                    CEP: {teacher.address.postalCode}
                </Typography>
            </Box>
            <hr />
            {/* Observacao */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Observação
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>{teacher.observation ?? ""}</Typography>

            </Box>

            {/* Turmas */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Turmas
                </Typography>

                {teacher.Class?.length ?
                    (Array.isArray(teacher?.Class) && teacher.Class.map((turma) => (
                        <Box key={turma?.code} mb={1}>
                            <Typography variant="body2" style={{ fontSize: 10 }}>Turma: {turma?.code ?? ""}</Typography>
                            <Typography variant="body2" style={{ fontSize: 10 }}>Turma: {turma?.name ?? ""}</Typography>
                            <Typography variant="body2" style={{ fontSize: 10 }}>Curso: {turma?.course?.name ?? ""}</Typography>
                            <Typography variant="body2" style={{ fontSize: 10 }}>Professor: {turma?.turno ?? ""}</Typography>
                        </Box>
                    ))) :
                    <Typography variant="body2" style={{ fontSize: 10 }}>Nenhuma turma encontrada.</Typography>
                }
            </Box>


        </Report>
    );
});

TeacherReport.displayName = "TeacherReport";
export default TeacherReport;
