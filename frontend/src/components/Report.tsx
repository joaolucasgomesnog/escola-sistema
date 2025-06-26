"client side"
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getUserFromToken } from "../lib/getUserFromToken";
import Cookies from "js-cookie";

const Report = React.forwardRef(function Report({ children }, ref) {
  
  return (
    <div ref={ref} className=" mx-auto w-[210mm] h-[297mm] px-4 py-8 ">
      <div className="flex items-center gap-8">
        <Image src='/logo.png' width={200} height={0} alt="Logo" />
        <div className="text-[7px]">
          <p>CNPJ: 00.000.000/0001-00</p>
          <p>ENDEREÇO: RUA ENOCK IGNACIO DE OLIVEIRA, 700, N. SRA DA PENHA - SERRA TALHADA, PE</p>
          <div className="flex justify-between">
            <p>TELEFONE: (00) 00000-0000 </p>
            <p>EMAIL: ESCOLA@ESCOLA.COM</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[8px]">
        <div />
        <p className="whitespace-pre">25/06/2025    |    14:22    |    LUCAS GOMES</p>
      </div>
      <div className="bg-gray-300 text-center font-semibold text-xs my-2">
        RELATÓRIO DE CAIXA
      </div>

      {children}
    </div>
  );
});

export default Report;
