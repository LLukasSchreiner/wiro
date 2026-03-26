"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { use, useState, useMemo, useEffect } from 'react';
// 1. On importe "Editor" en plus de Tldraw
import { Tldraw, Editor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import AdminSidebar from '@/components/AdminSidebar';

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useOthers,
  useBroadcastEvent,
  useEventListener,
  useUpdateMyPresence
} from "@liveblocks/react/suspense";

function CanvasContent({ mapCode, isProf, studentName, myId }: { mapCode: string, isProf: boolean, studentName: string, myId: string }) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  const updateMyPresence = useUpdateMyPresence();
  
  useEffect(() => {
    updateMyPresence({ id: myId, name: studentName, role: isProf ? 'prof' : 'student' });
  }, [updateMyPresence, myId, studentName, isProf]);

  const others = useOthers();
  const students = others
    .filter(other => other.presence?.role === 'student')
    .map(other => ({
      id: (other.presence?.id as string) || Math.random().toString(),
      name: (other.presence?.name as string) || "Anonyme",
    }));

  const broadcast = useBroadcastEvent();

  useEventListener(({ event }) => {
    const e = event as any;
    if (!e) return;

    if (e.type === "KICK" && e.targetId === myId) {
      alert("La professeure vous a exclu de la session.");
      router.push('/');
    }
    if (e.type === "LOCK") {
      setIsLocked(Boolean(e.isLocked));
    }
  });

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isReadonly: isLocked && !isProf });
    }
  }, [isLocked, isProf, editor]);

  const handleKickStudent = (studentId: string) => {
    broadcast({ type: "KICK", targetId: studentId });
  };

  const handleToggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    broadcast({ type: "LOCK", isLocked: newState });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      
      {/* 1. LE MOTEUR TLDRAW (Pur, sans composants injectés) */}
      <Tldraw 
        persistenceKey={`mindmap-${mapCode}`}
        onMount={setEditor} 
      />

      {/* 2. NOTRE CALQUE D'INTERFACE (Superposé par-dessus) */}
      <div className="absolute inset-0 pointer-events-none z-[300]">
        
        {/* Vue Élève */}
        {!isProf && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
             <div className={`border-4 border-black px-4 py-1 brutal-shadow font-bold text-sm transition-colors ${isLocked ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
               {isLocked ? "🔒 ÉDITION FIGÉE" : `Élève : ${studentName}`}
             </div>
          </div>
        )}

        {/* Vue Prof */}
        {isProf && (
          <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className="bg-white border-2 border-black px-4 py-1 brutal-shadow font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></span>
                Vue Professeur (En Ligne)
              </div>
            </div>

            <AdminSidebar 
              mapCode={mapCode} 
              isLocked={isLocked}
              onToggleLock={handleToggleLock}
              students={students}
              onExclude={handleKickStudent}
            />
          </>
        )}
      </div>

    </div>
  );
}

export default function CanvasPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const isProf = searchParams.get('role') === 'prof';
  const studentName = searchParams.get('name') || "Anonyme";
  
  const myId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  
  const roomName = `room-${resolvedParams.code.toUpperCase()}`;

  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY as string}>
      <RoomProvider 
        id={roomName} 
        initialPresence={{ id: myId, name: studentName, role: isProf ? 'prof' : 'student' }}
      >
        <ClientSideSuspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0]">
            <div className="text-xl font-black uppercase border-4 border-black p-6 bg-white brutal-shadow animate-pulse">
              Connexion au réseau...
            </div>
          </div>
        }>
          <CanvasContent mapCode={resolvedParams.code.toUpperCase()} isProf={isProf} studentName={studentName} myId={myId} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}