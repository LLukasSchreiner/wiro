"use client";

interface Student {
  id: string;
  name: string;
}

interface AdminSidebarProps {
  mapCode: string;
  isLocked: boolean;
  onToggleLock: () => void;
  students: Student[];
  onExclude: (id: string) => void;
}

export default function AdminSidebar({ mapCode, isLocked, onToggleLock, students, onExclude }: AdminSidebarProps) {
  return (
    // h-full prend toute la place du conteneur parent. flex-col prépare le mode "sandwich".
    <div className="h-full w-full flex flex-col border-4 border-black bg-white brutal-shadow pointer-events-auto overflow-hidden">
      
      {/* 1. LE HAUT (Ne rétrécit jamais grâce à shrink-0) */}
      <div className="p-2 border-b-4 border-black bg-black text-white flex justify-between items-center shrink-0">
        <h2 className="text-sm font-black uppercase tracking-tight">Session</h2>
        <span className="bg-white text-black font-bold px-1 text-[10px] border-2 border-black">PRO</span>
      </div>

      {/* 2. LE MILIEU (Prend l'espace restant avec flex-1, scrolle avec overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-white min-h-0">
        
        <div className="space-y-1 text-center">
          <label className="block font-black uppercase text-[10px] mb-1 text-gray-700">Code secret</label>
          <div className="border-2 border-black p-1 text-lg font-black bg-yellow-50">{mapCode}</div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
            Élèves ({students.length})
          </h3>
          
          {students.length === 0 ? (
            <p className="font-bold text-gray-500 italic text-xs">En attente...</p>
          ) : (
            <ul className="space-y-2">
              {students.map(student => (
                <li key={student.id} className="border-2 border-black p-1.5 flex justify-between items-center group bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center font-bold text-[8px] shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-bold text-xs truncate max-w-[120px]" title={student.name}>
                      {student.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => onExclude(student.id)} 
                    className="text-[10px] font-bold text-white bg-red-500 border border-black px-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Exclure"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 3. LE BAS (Le bouton Figer, toujours visible en bas) */}
      <div className="p-2 border-t-4 border-black bg-gray-50 shrink-0">
        <button 
          onClick={onToggleLock} 
          className={`w-full font-black uppercase text-xs py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all ${
            isLocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isLocked ? "🔓 Débloquer" : "🔒 Figer"}
        </button>
      </div>

    </div>
  );
}