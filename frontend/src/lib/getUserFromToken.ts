import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

type JwtPayload = {
  adminId?: number;
  teacherId?: number;
  studentId?: number;
  role: "admin" | "teacher" | "student";
  user: {
    name: string;
    phone: string;
    picture: string;
  };
  exp?: number;
  iat?: number;
};

export const getUserFromToken = (): { id: number; role: string } | null => {
  const token = Cookies.get("auth_token");

  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.role === "admin" && decoded.adminId) {
      return { id: decoded.adminId, role: "admin" };
    }
    if (decoded.role === "teacher" && decoded.teacherId) {
      return { id: decoded.teacherId, role: "teacher" };
    }
    if (decoded.role === "student" && decoded.studentId) {
      return { id: decoded.studentId, role: "student" };
    }

    return null;
  } catch (error) {
    console.error("Erro ao decodificar token JWT:", error);
    return null;
  }
};
