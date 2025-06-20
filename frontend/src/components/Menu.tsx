"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Professores",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Estudantes",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Cursos",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Turmas",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Caixa",
        href: "/admin/cashier",
        visible: ["admin"],
      },
      {
        icon: "/exam.png",
        label: "Provas",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Trabalhos",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Notas",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Chamada",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Pagamentos",
        href: "/list/payments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Lembtere",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Perfil",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Configurações",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Sair",
        href: "/sign-in",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

type JWTPayload = {
  role: string;
  // outros campos se quiser (sub, exp, etc.)
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

  if (role === null) return null; // ou "loading..."

  return (
    <div
      className="mt-4 text-sm max-h-[85vh] overflow-y-scroll"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
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
                <Image src={item.icon} alt="" width={20} height={20} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;


