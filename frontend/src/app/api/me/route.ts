// app/api/me/route.ts
import { cookies } from 'next/headers';

export async function GET() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });


  return Response.json({ role: decoded.role });
}
