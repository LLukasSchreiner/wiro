"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface MindMap {
  code: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMaps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mindmaps')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMaps(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const handleCreate = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase
      .from('mindmaps')
      .insert([{ code: newCode, title: "Nouvelle Pépite" }]);

    if (!error) fetchMaps();
  };

  const handleDelete = async (code: string) => {
    if (confirm("Supprimer définitivement cette pépite ?")) {
      const { error } = await supabase
        .from('mindmaps')
        .delete()
        .eq('code', code);
      
      if (!error) fetchMaps();
    }
  };

  const saveRename = async (code: string) => {
    const { error } = await supabase
      .from('mindmaps')
      .update({ title: editTitle })
      .eq('code', code);

    if (!error) {
      setEditingCode(null);
      fetchMaps();
    }
  };

  const sortedMaps = [...maps].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    // AJOUT : La classe bg-animated-grid pour le fond mouvant
    <div className="min-h-screen bg-animated-grid p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête avec TES textes modifiés + animation d'apparition */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-4 border-black pb-8 animate-pop-in">
          <div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2">Vos Mindmaps</h1>
            <p className="text-xl md:text-2xl font-bold bg-white inline-block px-2 border-2 border-black -rotate-1">
              Retrouvez toutes vos mindmaps ici
            </p>
          </div>
          <button 
            onClick={handleCreate} 
            className="brutal-btn text-xl hover:scale-105 transition-transform"
          >
            + Nouvelle Carte
          </button>
        </div>

        <div className="flex justify-between items-center mb-8 bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pop-in" style={{ animationDelay: '100ms' }}>
          <p className="font-bold text-black uppercase text-sm">{maps.length} carte(s)</p>
          <button onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')} className="font-bold text-sm hover:underline">
            Tri : {sortBy === 'date' ? '🕒 Récent' : '🔤 Nom'}
          </button>
        </div>

        {loading ? (
          <div className="text-center font-black text-2xl animate-pulse bg-white border-4 border-black p-8 brutal-shadow">
            Chargement de vos pépites...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedMaps.map((map, index) => (
              <div 
                key={map.code} 
                // AJOUT : Animation en cascade (animationDelay) et effet de survol brutal (hover:-translate-y-2)
                className="brutal-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-2 hover:-rotate-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white animate-pop-in"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div>
                  <div className="bg-yellow-300 text-black px-3 py-1 font-black text-sm inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4 uppercase">
                    CODE: {map.code}
                  </div>
                  
                  {editingCode === map.code ? (
                    <div className="mb-4">
                      <input 
                        type="text" value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border-4 border-black p-2 font-bold text-xl outline-none bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        autoFocus
                      />
                      <button onClick={() => saveRename(map.code)} className="w-full mt-2 bg-black text-white font-bold py-2 border-2 border-black hover:bg-white hover:text-black transition-colors">
                        VALIDER
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <h2 className="text-3xl font-black truncate">{map.title}</h2>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        {new Date(map.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t-4 border-black">
                  <button 
                    onClick={() => router.push(`/map/${map.code}?role=prof`)} 
                    className="w-full py-3 font-black uppercase tracking-wide bg-green-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-green-500"
                  >
                    Ouvrir le tableau
                  </button>
                  <div className="flex gap-2 text-xs font-bold mt-2">
                    <button onClick={() => {setEditingCode(map.code); setEditTitle(map.title)}} className="flex-1 border-2 border-black py-1 hover:bg-blue-100 transition-colors">RENOMMER</button>
                    <button onClick={() => handleDelete(map.code)} className="flex-1 border-2 border-black py-1 hover:bg-red-100 text-red-600 transition-colors">SUPPRIMER</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}