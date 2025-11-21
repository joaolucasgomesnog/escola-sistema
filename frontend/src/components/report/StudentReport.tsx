'use client';

import React, { forwardRef } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Student } from '@/interfaces/student';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import Report from "./Report";

type Props = {
    student: Student;
    fees: any[];
};

const StudentReport = forwardRef<HTMLDivElement, Props>(({ student, fees }, ref) => {
    if (!student) return null;

    return (
        <Report ref={ref} title={`Ficha do Aluno`}>
            <Box display="flex" gap={2} mb={2}>
                {/* Dados Pessoais */}
                <Avatar src={student.picture} sx={{ width: 100, height: 100 }} style={{ borderRadius: 0 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                        Dados Pessoais
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Nome: {student.name}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>CPF: {formatCpf(student.cpf)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Email: {student.email}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Telefone: {formatPhone(student.phone)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Data de nascimento: {student.birthDate ? dayjs(student.birthDate).format("DD/MM/YYYY") : "—"}</Typography>

                </Box>
            </Box>
            <hr />
            {/* Endereço */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Endereço
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Rua: {student.address.street}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Número: {student.address.number}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Bairro: {student.address.neighborhood}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Cidade: {student.address.city}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Estado: {student.address.state}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>CEP: {student.address.postalCode}</Typography>
            </Box>
            <hr />
            {/* Observacao */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Observação
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>{student.observation ?? ""}</Typography>

            </Box>
            <hr />
            {/* Matriculas */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Matriculas
                </Typography>

                {student.classLinks.length ? (
                    student.classLinks.map(({ class: turma }) => {
                        // Montar string de horários
                        const horario = turma.horario
                            ? Object.entries(turma.horario)
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
                                        saturday: "Sábado",
                                    };
                                    return `${dayMap[day] ?? day}: ${hora}`;
                                })
                                .join(" | ")
                            : "Sem horário definido";

                        return (
                            <Box key={turma.code} mb={1}>
                                <Typography variant="body2" style={{ fontSize: 10 }}>Curso: {turma?.course?.name}</Typography>
                                <Typography variant="body2" style={{ fontSize: 10 }}>Turma: {turma?.name}</Typography>
                                <Typography variant="body2" style={{ fontSize: 10 }}>Professor: {turma?.teacher?.name}</Typography>
                                <Typography variant="body2" style={{ fontSize: 10 }}>Horários: {horario}</Typography>
                            </Box>
                        );
                    })
                ) : (
                    <Typography variant="body2" style={{ fontSize: 10 }}>Nenhuma matrícula encontrada.</Typography>
                )}
            </Box>
            <hr />
            {/* Mensalidades */}
            <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Mensalidades
                </Typography>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>ID</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Descrição</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Valor</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Vencimento</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Data Pagamento</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Forma Pagamento</th>
                            <th style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>Recebido por</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees?.map((fee) => {
                            const payment = fee.payments?.[0];
                            return (
                                <tr key={fee.id}>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>{fee.id}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>{fee.description}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                                        R$ {Number(fee.price).toFixed(2).replace(".", ",")}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                                        {dayjs(fee.dueDate).format("DD/MM/YYYY")}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                                        {payment?.createdAt ? dayjs(payment.createdAt).format("DD/MM/YYYY") : "—"}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                                        {payment?.paymentType ?? "—"}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "5px", fontSize: 10 }}>
                                        {payment?.admin?.name ?? "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Box>
        </Report>
    );
});

StudentReport.displayName = "StudentReport";
export default StudentReport;
