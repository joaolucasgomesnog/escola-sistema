import React from "react";
import dayjs from "dayjs";
import { Student } from "@/interfaces/student";
import { formatCpf } from "@/lib/formatValues";

type CarneProps = {
  fees: any[];
  student?: Student;
};


const Carne = React.forwardRef<HTMLDivElement, CarneProps>(({ fees, student }, ref) => {
  if (!fees || fees.length === 0) return null;

  // Filtrar somente mensalidades NÃO pagas
  const unpaidFees = fees.filter((fee) => !fee.payments || fee.payments.length === 0);

  if (unpaidFees.length === 0) return null;

  return (
    <div ref={ref} className="w-[210mm] px-0 py-0">
      <style>{`
        @media print {
          @page {
            margin: 5mm;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
      {unpaidFees.map((fee, index) => (
        <div
          key={fee.id}
          className={`flex gap-1 h-[75mm] ${(index + 1) % 4 === 0 ? "page-break" : "border-b border-black "} p-2`}
        >
          {/* Via do Estudante */}
          <div className="w-1/3 border border-black p-2 flex flex-col">
            <img src="/logo.png" alt="Logo" className="h-8 mb-1 object-contain" />
            <div className="flex justify-center items-center w-auto border-b border-t border-black mb-1 mt-1 -mx-2 bg-gray-300">
              <p className="text-xs font-semibold">VIA DO ESTUDANTE</p>
            </div>

            {/* Campo Aluno */}
            <div className="relative mt-2">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Aluno</div>
              <div className="border border-black p-1">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                  {student?.name ?? "Nome do Aluno"}</p>
              </div>
            </div>

            {/* Campo CPF */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">CPF</div>
              <div className="border border-black p-1">
                <p className="text-xs">{student?.cpf ? formatCpf(student?.cpf) : "CPF"}</p>
              </div>
            </div>

            {/* Campo Descrição */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Descrição</div>
              <div className="border border-black p-1">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                  {fee.description}</p>
              </div>
            </div>

            {/* Campo Valor */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Valor</div>
              <div className="border border-black p-1">
                <p className="text-xs">R$ {Number(fee.price).toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            {/* Campo Vencimento */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Vencimento</div>
              <div className="border border-black p-1">
                <p className="text-xs">{fee.dueDate ? dayjs(fee.dueDate).format("DD/MM/YYYY") : "—"}</p>
              </div>
            </div>

            {/* Campo Endereço */}
            {/* <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Endereço</div>
              <div className="border border-black p-1 text-xs">
                <p>{student?.address?.street ?? ""}, {student?.address?.number ?? ""}</p>
                <p>{student?.address?.neighborhood ?? ""}</p>
                <p>{student?.address?.city ?? ""} - {student?.address?.state ?? ""}</p>
                <p>CEP: {student?.address?.postalCode ?? ""}</p>
              </div>
            </div> */}
          </div>

          {/* Via da Escola */}
          <div className="w-2/3 border border-black p-2 flex flex-col">
            <img src="/logo.png" alt="Logo" className="h-8 mb-1 object-contain" />
            <div className="flex justify-center items-center w-auto border-b border-t border-black mb-1 mt-1 -mx-2 bg-gray-300">
              <p className="text-xs font-semibold">VIA DA ESCOLA</p>
            </div>

            {/* Campo Aluno */}
            <div className="relative mt-2">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Aluno</div>
              <div className="border border-black p-1">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                  {student?.name ?? "Nome do Aluno"}</p>
              </div>
            </div>

            {/* Campo CPF */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">CPF</div>
              <div className="border border-black p-1">
                <p className="text-xs">{student?.cpf ? formatCpf(student?.cpf) : "CPF"}</p>
              </div>
            </div>
            {/* Campo Endereço */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Endereço</div>
              <div className="border border-black p-1 text-xs">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {student?.address?.street ?? ""}, {student?.address?.number ?? ""} - {student?.address?.neighborhood ?? ""} - {student?.address?.city ?? ""} - {student?.address?.state ?? ""}
                </p>
              </div>
            </div>

            {/* Campo Descrição */}
            <div className="relative mt-3">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Descrição</div>
              <div className="border border-black p-1">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                  {fee.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              {/* Campo Valor */}
              <div className="relative w-1/2 mr-2">
                <div className="absolute -top-2 left-2 bg-white px-1 -py-2 text-[9px] z-10">Valor</div>
                <div className="border border-black p-1 flex w-full">
                  <p className="text-xs">R$ {Number(fee.price).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              {/* Campo Vencimento */}
              <div className="relative w-1/2">
                <div className="absolute -top-2 left-2 bg-white px-1 text-[9px] z-10">Vencimento</div>
                <div className="border border-black p-1 flex w-full">
                  <p className="text-xs">{fee.dueDate ? dayjs(fee.dueDate).format("DD/MM/YYYY") : "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
Carne.displayName = "Carne";

export default Carne;
