'use client';

import React, { forwardRef } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Admin } from '@/interfaces/admin';
import dayjs from 'dayjs';
import { formatCpf, formatPhone } from "@/lib/formatValues";
import Report from "./Report";

type Props = {
    admin: Admin;
    fees: any[];
};

const AdminReport = forwardRef<HTMLDivElement, Props>(({ admin, fees }, ref) => {
    if (!admin) return null;

    return (
        <Report ref={ref} title={`Ficha do Adminstrador`}>
            <Box display="flex" gap={2} mb={2}>
                {/* Dados Pessoais */}
                <Avatar src={admin.picture} sx={{ width: 100, height: 100 }} style={{ borderRadius: 0 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                        Dados Pessoais
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Nome: {admin.name}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>CPF: {formatCpf(admin.cpf)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Email: {admin.email}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Telefone: {formatPhone(admin.phone)}</Typography>
                    <Typography variant="body2" style={{ fontSize: 10 }}>Data de nascimento: {admin.birthDate ? dayjs(admin.birthDate).format("DD/MM/YYYY") : "—"}</Typography>
                </Box>
            </Box>
            <hr />
            {/* Endereço */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Endereço
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Rua: {admin.address.street}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Número: {admin.address.number}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Bairro: {admin.address.neighborhood}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Cidade: {admin.address.city}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>Estado: {admin.address.state}</Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>CEP: {admin.address.postalCode}</Typography>
            </Box>
            <hr />
            {/* Observacao */}
            <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom style={{ fontSize: 10 }}>
                    Observação
                </Typography>
                <Typography variant="body2" style={{ fontSize: 10 }}>{admin.observation ?? ""}</Typography>

            </Box>
        </Report>
    );
});

AdminReport.displayName = "AdminReport";
export default AdminReport;
