"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginProf() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Le code secret que tu m'as donné
    if (password === "Nath88800S") {
      // Pour une vraie app, on utiliserait un cookie ou un token ici
      router.push('/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F0]">
      <div className="bg-white border-4 border-black p-10 brutal-shadow max-w-sm w-full">
        <h2 className="text-3xl font-black mb-6 uppercase text-center">Accès Professeur</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">Identifiant Unique</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full border-4 ${error ? 'border-red-500 bg-red-50' : 'border-black'} p-3 text-lg focus:outline-none focus:bg-yellow-50`}
            />
            {error && <p className="text-red-500 font-bold mt-2 text-sm">Identifiant incorrect</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white font-bold text-xl p-4 uppercase hover:-translate-y-1 transition-transform brutal-shadow"
          >
            Entrer
          </button>
        </form>
      </div>
    </main>
  );
}