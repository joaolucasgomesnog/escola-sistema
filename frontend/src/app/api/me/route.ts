import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'

interface DecodedToken {
  role: string;
}

function isDecodedToken(token: any): token is DecodedToken {
  return token && typeof token.role === 'string';
}

const JWT_SECRET = process.env.JWT_SECRET


export async function GET() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido no ambiente.');
  }
  
  const token = cookies().get('auth_token')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isDecodedToken(decoded)) {
      return Response.json({ role: decoded.role });
    }

    return new Response('Invalid token payload', { status: 403 });
  } catch (err) {
    return new Response('Invalid token', { status: 401 });
  }
}
