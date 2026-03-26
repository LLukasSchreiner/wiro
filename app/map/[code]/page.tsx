"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { use, useState, useMemo, useEffect, useRef, useCallback, memo, createContext, useContext } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// Permet de faire passer l'état "isLocked" dans le canvas sans re-monter Tldraw.
// ─────────────────────────────────────────────────────────────────────────────
interface CanvasContextValue {
  isLocked: boolean;
  isProf: boolean;
}
const CanvasContext = createContext<CanvasContextValue>({ isLocked: false, isProf: false });

// ─────────────────────────────────────────────────────────────────────────────
// TLDRAW STABLE
// Ce composant est volontairement isolé et mémoïsé.
// Il ne reçoit que des props stables (mapCode, callbacks stables via useRef).
// Il ne doit JAMAIS re-rendre suite à un changement de présence Liveblocks.
// ─────────────────────────────────────────────────────────────────────────────
const StableTldraw = memo(function StableTldraw({
  mapCode,
  onEditorMount,
}: {
  mapCode: string;
  onEditorMount: (editor: Editor) => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw
        persistenceKey={`mindmap-${mapCode}`}
        onMount={onEditorMount}
      />
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// BADGE ÉTAT ÉLÈVE
// Séparé pour éviter tout couplage avec Tldraw.
// ─────────────────────────────────────────────────────────────────────────────
const StudentBadge = memo(function StudentBadge({ studentName }: { studentName: string }) {
  const { isLocked } = useContext(CanvasContext);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-[400]">
      <div
        className={`border-4 border-black px-4 py-1 brutal-shadow font-bold text-sm transition-colors ${
          isLocked ? 'bg-red-500 text-white' : 'bg-white text-black'
        }`}
      >
        {isLocked ? '🔒 ÉDITION FIGÉE' : `Élève : ${studentName}`}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// BADGE ÉTAT PROF
// ─────────────────────────────────────────────────────────────────────────────
const ProfBadge = memo(function ProfBadge() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-[400]">
      <div className="bg-white border-2 border-black px-4 py-1 brutal-shadow font-bold text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse" />
        Vue Professeur (En Ligne)
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PANEL
// Wrapper autour d'AdminSidebar qui lit les données Liveblocks.
// Il est dans le calque UI, jamais passé à Tldraw.
// ─────────────────────────────────────────────────────────────────────────────
function AdminPanel({
  mapCode,
  students,
  onToggleLock,
  onExclude,
}: {
  mapCode: string;
  students: { id: string; name: string }[];
  onToggleLock: () => void;
  onExclude: (id: string) => void;
}) {
  const { isLocked } = useContext(CanvasContext);

  return (
    <div className="absolute top-24 left-4 bottom-6 w-56 pointer-events-none z-[400]">
      <AdminSidebar
        mapCode={mapCode}
        isLocked={isLocked}
        onToggleLock={onToggleLock}
        students={students}
        onExclude={onExclude}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS CONTENT
// Orchestre Liveblocks + Tldraw. Tldraw est isolé dans StableTldraw.
// L'UI overlay est dans un calque séparé et ne touche pas les props de Tldraw.
// ─────────────────────────────────────────────────────────────────────────────
function CanvasContent({
  mapCode,
  isProf,
  studentName,
  myId,
}: {
  mapCode: string;
  isProf: boolean;
  studentName: string;
  myId: string;
}) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);

  // On garde l'éditeur dans une ref : ça évite de déclencher des re-renders
  // de StableTldraw quand l'éditeur change.
  const editorRef = useRef<Editor | null>(null);

  // Callback stable via useCallback + ref interne pour éviter de recréer
  // la fonction et de provoquer un re-render de StableTldraw.
  const handleEditorMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  // ── Présence Liveblocks ──────────────────────────────────────────────────
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    updateMyPresence({ id: myId, name: studentName, role: isProf ? 'prof' : 'student' });
  }, [updateMyPresence, myId, studentName, isProf]);

  const others = useOthers();
  const students = useMemo(
    () =>
      others
        .filter(o => o.presence?.role === 'student')
        .map(o => ({
          id: (o.presence?.id as string) || Math.random().toString(),
          name: (o.presence?.name as string) || 'Anonyme',
        })),
    [others]
  );

  // ── Events Liveblocks ────────────────────────────────────────────────────
  const broadcast = useBroadcastEvent();

  useEventListener(({ event }) => {
    const e = event as any;
    if (!e) return;

    if (e.type === 'KICK' && e.targetId === myId) {
      alert('La professeure vous a exclu de la session.');
      router.push('/');
    }
    if (e.type === 'LOCK') {
      setIsLocked(Boolean(e.isLocked));
    }
  });

  // ── Sync isLocked → Tldraw via ref (sans re-render de StableTldraw) ──────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateInstanceState({ isReadonly: isLocked && !isProf });
  }, [isLocked, isProf]);

  // ── Handlers stables ─────────────────────────────────────────────────────
  const handleKickStudent = useCallback(
    (studentId: string) => broadcast({ type: 'KICK', targetId: studentId }),
    [broadcast]
  );

  const handleToggleLock = useCallback(() => {
    setIsLocked(prev => {
      const next = !prev;
      broadcast({ type: 'LOCK', isLocked: next });
      return next;
    });
  }, [broadcast]);

  // ── Context value mémoïsé ─────────────────────────────────────────────────
  const contextValue = useMemo<CanvasContextValue>(
    () => ({ isLocked, isProf }),
    [isLocked, isProf]
  );

  return (
    <CanvasContext.Provider value={contextValue}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

        {/*
          COUCHE 1 — Tldraw
          StableTldraw est memo() + ne reçoit que des props stables.
          Il ne re-rendra JAMAIS à cause d'un changement de présence.
        */}
        <StableTldraw mapCode={mapCode} onEditorMount={handleEditorMount} />

        {/*
          COUCHE 2 — UI overlay
          pointer-events-none sur le conteneur, pointer-events-auto sur les enfants interactifs.
          z-index > celui de Tldraw UI (qui monte jusqu'à ~200).
        */}
        <div className="absolute inset-0 pointer-events-none z-[300]">

          {!isProf && <StudentBadge studentName={studentName} />}

          {isProf && (
            <>
              <ProfBadge />
              <AdminPanel
                mapCode={mapCode}
                students={students}
                onToggleLock={handleToggleLock}
                onExclude={handleKickStudent}
              />
            </>
          )}

        </div>
      </div>
    </CanvasContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CanvasPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const isProf = searchParams.get('role') === 'prof';
  const studentName = searchParams.get('name') || 'Anonyme';

  // myId est stable pour toute la durée de vie de la page
  const myId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

  const roomName = `room-${resolvedParams.code.toUpperCase()}`;

  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY as string}>
      <RoomProvider
        id={roomName}
        initialPresence={{ id: myId, name: studentName, role: isProf ? 'prof' : 'student' }}
      >
        <ClientSideSuspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0]">
              <div className="text-xl font-black uppercase border-4 border-black p-6 bg-white brutal-shadow animate-pulse">
                Connexion au réseau...
              </div>
            </div>
          }
        >
          <CanvasContent
            mapCode={resolvedParams.code.toUpperCase()}
            isProf={isProf}
            studentName={studentName}
            myId={myId}
          />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}