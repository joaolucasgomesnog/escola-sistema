"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

// Ícones Outlined do Material UI
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import ClassOutlined from "@mui/icons-material/ClassOutlined";
import PointOfSaleOutlined from "@mui/icons-material/PointOfSaleOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import GradeOutlined from "@mui/icons-material/GradeOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import DiscountIcon from '@mui/icons-material/Discount';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';

const menuItems = [
  {
    title: "Menu",
    items: [
      {
        icon: <HomeOutlined fontSize="small" color="action" />,
        label: "Home",
        href: `/admin`,
        visible: ["admin"],
      },
      {
        icon: <PermContactCalendarOutlinedIcon fontSize="small" color="action" />,
        label: "Administradores",
        href: "/list/admins",
        visible: ["admin"],
      },
      {
        icon: <SchoolOutlined fontSize="small" color="action" />,
        label: "Professores",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: <PeopleOutlineOutlined fontSize="small" color="action" />,
        label: "Estudantes",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: <MenuBookOutlined fontSize="small" color="action" />,
        label: "Cursos",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: <ClassOutlined fontSize="small" color="action" />,
        label: "Turmas",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: <PointOfSaleOutlined fontSize="small" color="action" />,
        label: "Caixa",
        href: "/admin/cashier",
        visible: ["admin"],
      },
      {
        icon: <DiscountIcon fontSize="small" color="action" />,
        label: "Descontos",
        href: "/list/discounts",
        visible: ["admin"],
      },
      // {
      //   icon: <QuizOutlined fontSize="small" color="action" />,
      //   label: "Provas",
      //   href: "/list/exams",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: <AssignmentOutlined fontSize="small" color="action" />,
      //   label: "Trabalhos",
      //   href: "/list/assignments",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: <GradeOutlined fontSize="small" color="action" />,
      //   label: "Notas",
      //   href: "/list/results",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: <EventAvailableOutlined fontSize="small" color="action" />,
      //   label: "Chamada",
      //   href: "/list/attendance",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: <PaymentsOutlined fontSize="small" color="action" />,
      //   label: "Pagamentos",
      //   href: "/list/payments",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: <CampaignOutlined fontSize="small" color="action" />,
      //   label: "Lembrete",
      //   href: "/list/announcements",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
    ],
  },
  {
    title: "Outros",
    items: [
      {
        icon: <SettingsOutlined fontSize="small" color="action" />,
        label: "Configurações",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <LogoutOutlined fontSize="small" color="action" />,
        label: "Sair",
        href: "/sign-in",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

type JWTPayload = {
  role: string;
};

const Menu = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      console.warn("Token não encontrado");
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      setRole(decoded.role);
    } catch (err) {
      console.error("Erro ao decodificar o token:", err);
    }
  }, []);

  if (role === null) return null;

  return (
    <div
      className="mt-4 text-sm max-h-[85vh] overflow-y-scroll"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-800 font-light my-4">
            {section.title}
          </span>
          {section.items
            .filter((item) => item.visible.includes(role))
            .map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-800 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
              >
                {item.icon}
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
