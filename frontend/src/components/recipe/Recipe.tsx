import Image from "next/image";
import React, { ForwardedRef, useEffect, useState } from "react";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { formatCpf } from "@/lib/formatValues";

type RecipeProps = {
  children?: React.ReactNode;
  student?: any;
  payment?: any;
  fee?: any;
};

const Recipe = React.forwardRef<HTMLDivElement, RecipeProps>(({ children, student, payment, fee }, ref) => {
  const [user, setUser] = useState<any>(null);

  const now = new Date();
  const formattedDate = now.toLocaleDateString("pt-BR");
  const formattedTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const fetchedUser = getUserFromToken();
    setUser(fetchedUser);
  }, []);


  function maskCpfWithFormat(cpf: string): string {
  // Remove qualquer caractere não numérico
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return "N/A";

  // Mantém os 3 primeiros e os 2 últimos
  const first = digits.substring(0, 3);
  const last = digits.substring(9, 11);

  return `${first}.***.***-${last}`;
}

  return (
    <div
      ref={ref}
      className="mx-0 w-[80mm] px-2 py-2 border gap-3 flex flex-col"
    >
      <style>{`
        @media print {
          @page {
            margin: 0mm;
          }
        }
      `}</style>
      <div className="flex items-center gap-3 flex-col text-center">
        <Image src="/logo_black.png" width={180} height={0} alt="Logo" />
        <div className="text-[9px] font-bold">
          <p>CNPJ: 35.030.958/0001-00</p>
          <p>ENDEREÇO: RUA ENOCK IGNÁCIO DE OLIVEIRA, 949 - NOSSA SENHORA DA PENHA - SERRA TALHADA - PE</p>
          <div className="flex justify-between">
            <p>TELEFONE: (87) 9 9983-1241</p>
            <p>EMAIL: ESCOLA@ESCOLA.COM</p>
          </div>
        </div>
      </div>
      <div className=" text-center font-bold text-xs my-2 border-black border-y-2">
        {"COMPROVANTE DE PAGAMENTO"}
      </div>
      <div>
        <p className=" text-[10px] font-bold">DADOS DO ESTUDANTE</p>
        <p className=" text-[10px] font-semibold">
          CPF: {student?.cpf ? maskCpfWithFormat(student?.cpf) : "N/A"}
        </p>
        <p className=" text-[10px] font-semibold">
          NOME: {student?.name ? student.name.toUpperCase() : "N/A"}
        </p>
      </div>
      <div>
        <p className=" text-[10px] font-bold">ITEM PAGO</p>
        <p className=" text-[10px] font-semibold">
          ID TAXA: {fee?.id ? String(fee.id).toUpperCase() : "N/A"}
        </p>
        <p className=" text-[10px] font-semibold">
          DESCRIÇÃO: {fee?.description ? fee.description.toUpperCase() : "N/A"}
        </p>
        <p className=" text-[10px]  font-semibold">
          VENCIMENTO: {fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString("pt-BR") : "N/A"}
        </p>
        <p className=" text-[10px]  font-semibold">
          VALOR: R$ {fee?.price ? fee.price.toFixed(2).replace(".", ",") : "N/A"}
        </p>
      </div>
      <div>
        <p className=" text-[10px] font-bold">DADOS DO PAGAMENTO</p>
        <p className=" text-[10px]  font-semibold">
          ID PAGAMENTO: {payment?.id ? String(payment.id).toUpperCase() : "N/A"}
        </p>
        <p className=" text-[10px]  font-semibold">
          RECEBEDOR: {user?.name ? user.name.toUpperCase() : ""}
        </p>
        <p className=" text-[10px]  font-semibold">
          FORMA DE PAGAMENTO: {payment?.paymentType ? payment.paymentType.toUpperCase() : ""}
        </p>
        <p className=" text-[10px]  font-semibold">
          DATA E HORA: {formattedDate} {formattedTime}
        </p>
      </div>
    </div>
  );
});

export default Recipe;
Recipe.displayName = "Recipe";