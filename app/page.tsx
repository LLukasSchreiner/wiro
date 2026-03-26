"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  // C'est cette ligne qui a dû sauter et qui causait l'erreur !
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      router.push(`/map/${code.toUpperCase()}?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 border-b-4 border-black bg-white flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <span className="bg-black text-white font-black px-3 py-1 text-2xl border-2 border-black">Wiro</span>
        </div>
        <button onClick={() => router.push('/login-nath')} className="font-black uppercase text-sm border-b-2 border-black hover:pb-1 transition-all cursor-pointer">
          professeur
        </button>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-12 mt-20">
        <div className="inline-block border-2 border-black px-6 py-1 font-black uppercase text-sm bg-white -rotate-1 brutal-shadow">
          N° 1 — Cartes Mentales en ligne
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter">
          Créez votre <br /> 
          <span className="bg-black text-white px-6 py-2 inline-block rotate-1 mt-4 mb-4 brutal-shadow">Carte Mentale.</span>
        </h1>

        <p className="text-xl font-bold max-w-lg mx-auto leading-tight italic">
          Une appli de mindmap pour les enseignants. Rangez vos stylos, sortez vos souris. 
        </p>

        {/* Formulaire */}
        <div className="brutal-card max-w-md mx-auto text-left mt-12">
          <form className="space-y-6" onSubmit={handleJoin}>
            <div>
              <label className="block font-black uppercase text-xs mb-2">Code de session</label>
              <input 
                className="brutal-input" 
                placeholder="Ex: ALPHA-1" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block font-black uppercase text-xs mb-2">Ton Nom / Prénom</label>
              <input 
                className="brutal-input" 
                placeholder="Jean D." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="brutal-btn w-full text-xl py-4 mt-2">
              Ouvrir la mindmap
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}