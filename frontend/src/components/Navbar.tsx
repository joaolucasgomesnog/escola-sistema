"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { Avatar, Skeleton } from "@mui/material";

type UserData = {
  name: string;
  role: string;
  picture?: string;
};

const Navbar = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const token = Cookies.get("auth_token");
        
        if (!token) {
          console.warn("Token não encontrado");
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        
        // Verifica se o token contém as informações necessárias
        if (decoded.user && decoded.role) {
          setUserData({
            name: decoded.user.name || "Usuário",
            role: decoded.role,
            picture: decoded.user.picture || "/avatar.png"
          });
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Função para formatar a role para exibição
  const formatRole = (role: string) => {
    const rolesMap: Record<string, string> = {
      admin: "Administrador",
      teacher: "Professor",
      student: "Estudante",
      parent: "Responsável"
    };
    return rolesMap[role] || role;
  };

  return (
    <div className='flex items-center justify-between p-4 bg-white shadow-sm'>

      
      {/* ICONS AND USER */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors'>
          <Image src="/message.png" alt="Mensagens" width={16} height={16}/>
        </div>
        
        <div className='bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative hover:bg-gray-200 transition-colors'>
          <Image src="/announcement.png" alt="Notificações" width={16} height={16}/>
          <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>1</div>
        </div>
        
        {loading ? (
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="flex flex-col gap-1">
              <Skeleton variant="text" width={80} height={12} />
              <Skeleton variant="text" width={60} height={10} />
            </div>
          </div>
        ) : userData ? (
          <div className="flex items-center gap-3">
            <div className='flex flex-col text-right'>
              <span className="text-xs leading-3 font-medium">
                {userData.name}
              </span>
              <span className="text-[10px] text-gray-500">
                {formatRole(userData.role)}
              </span>
            </div>
            <Avatar
              src={userData.picture} 
               sx={{ width: 32, height: 32 }}
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Usuário não autenticado
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;