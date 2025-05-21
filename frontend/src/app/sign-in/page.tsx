'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";


const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const LoginPage = () => {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

const handleLogin = async () => {
  try {
    const rawCpf = cpf.replace(/\D/g, ''); // remove a formatação

    const response = await fetch('http://localhost:3030/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf: rawCpf, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Erro ao fazer login');
      return;
    }

    // Aqui você pode salvar o token no localStorage ou cookies se desejar
    localStorage.setItem('token', data.token);

    // Redireciona para o painel admin
    router.push('/admin');
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm -mt-10">
          <img
            alt="Your Company"
            src="/logo.png"
            className="mx-auto h-12 w-auto"
          />
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label htmlFor="cpf" className="block text-sm/6 font-medium text-gray-900">
                CPF
              </label>
              <div className="mt-2">
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  required
                  maxLength={14}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Senha
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
