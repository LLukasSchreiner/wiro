"use client";

interface Student {
  id: string;
  name: string;
}

interface AdminSidebarProps {
  mapCode: string;
  isLocked: boolean;
  onToggleLock: () => void;
  students: Student[]; // <-- La vraie liste !
  onExclude: (id: string) => void; // <-- La vraie action d'exclusion
}

export default function AdminSidebar({ mapCode, isLocked, onToggleLock, students, onExclude }: AdminSidebarProps) {
  return (
    <div className="absolute left-4 top-20 w-60 h-200 flex flex-col brutal-shadow bg-white border-4 border-black pointer-events-auto">
      
      <div className="p-2 border-b-4 border-black bg-black text-white flex justify-between items-center shrink-0">
        <h2 className="text-sm font-black uppercase tracking-tight">Classe</h2>
        <span className="bg-white text-black font-bold px-1 text-[10px] border-2 border-black">B.</span>
      </div>

      <div className="flex-grow p-3 space-y-4 overflow-y-auto min-h-0">
        <div className="text-center shrink-0">
          <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Code</div>
          <div className="border-2 border-black p-1 text-lg font-black bg-yellow-50">{mapCode}</div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
            Élèves ({students.length})
          </h3>
          
          <ul className="space-y-1">
            {students.length === 0 ? (
              <li className="text-[10px] font-bold text-gray-500 italic text-center py-2">Aucun élève</li>
            ) : (
              students.map(student => (
                <li key={student.id} className="border-2 border-black p-1.5 flex justify-between items-center group bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-4 h-4 rounded-full bg-yellow-300 border border-black flex items-center justify-center font-bold text-[8px] shrink-0 uppercase">
                      {student.name.charAt(0)}
                    </span>
                    <span className="font-bold text-xs truncate">{student.name}</span>
                  </div>
                  <button 
                    onClick={() => onExclude(student.id)} 
                    className="text-[10px] font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Exclure l'élève"
                  >
                    X
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Bouton Figer / Débloquer */}
      <div className="p-2 border-t-4 border-black bg-gray-50 shrink-0 pointer-events-auto">
        <button 
          onClick={onToggleLock} 
          className={`w-full border-2 border-black font-black uppercase text-xs py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
            isLocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isLocked ? "Débloquer" : "Figer"}
        </button>
      </div>
    </div>
  );
}