"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import du client

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

  // 1. Récupérer les cartes depuis Supabase
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

  // 2. Créer une carte
  const handleCreate = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase
      .from('mindmaps')
      .insert([{ code: newCode, title: "Nouvelle Pépite" }]);

    if (!error) fetchMaps();
  };

  // 3. Supprimer une carte
  const handleDelete = async (code: string) => {
    if (confirm("Supprimer définitivement cette pépite ?")) {
      const { error } = await supabase
        .from('mindmaps')
        .delete()
        .eq('code', code);
      
      if (!error) fetchMaps();
    }
  };

  // 4. Renommer une carte
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

  // Tri (côté client pour la rapidité)
  const sortedMaps = [...maps].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2">L'Index</h1>
            <p className="text-xl md:text-2xl font-bold">Base de données synchronisée.</p>
          </div>
          <button onClick={handleCreate} className="brutal-btn text-xl">+ Nouvelle Carte</button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <p className="font-bold text-gray-600 uppercase text-sm">{maps.length} carte(s)</p>
          <button onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')} className="brutal-btn-white text-sm">
            Tri : {sortBy === 'date' ? '🕒 Récent' : '🔤 Nom'}
          </button>
        </div>

        {loading ? (
          <div className="text-center font-black animate-pulse">Chargement de vos pépites...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedMaps.map((map) => (
              <div key={map.code} className="brutal-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="bg-black text-white px-3 py-1 font-bold text-sm inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-4 uppercase">
                    CODE: {map.code}
                  </div>
                  
                  {editingCode === map.code ? (
                    <div className="mb-4">
                      <input 
                        type="text" value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border-2 border-black p-2 font-bold text-xl outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveRename(map.code)} className="brutal-btn-white w-full text-xs py-1 mt-2">Valider</button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <h2 className="text-2xl font-black truncate">{map.title}</h2>
                      <p className="text-sm font-bold text-gray-400 mt-1">
                        {new Date(map.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-black/10">
                  <button onClick={() => router.push(`/map/${map.code}?role=prof`)} className="brutal-btn py-2 text-sm w-full bg-green-400 border-black">Ouvrir</button>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button onClick={() => {setEditingCode(map.code); setEditTitle(map.title)}} className="flex-1 underline">Renommer</button>
                    <button onClick={() => handleDelete(map.code)} className="flex-1 underline text-red-500">Supprimer</button>
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