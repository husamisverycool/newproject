import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, useMe } from './lib/queries';
import { useRealtime } from './lib/realtime';
import { Stage } from './stage/Stage';
import { Toasts } from './components/Toasts';
import { Spinner } from './components/ios';
import { CameraHome } from './screens/CameraHome';

const Onboarding = lazy(() => import('./screens/Onboarding'));
const JoinPage = lazy(() => import('./screens/JoinPage'));
const Journal = lazy(() => import('./screens/Journal'));
const WeekView = lazy(() => import('./screens/WeekView'));
const Rewind = lazy(() => import('./screens/Rewind'));
const Calendar = lazy(() => import('./screens/Calendar'));
const ChatList = lazy(() => import('./screens/ChatList'));
const ChatThread = lazy(() => import('./screens/ChatThread'));
const PlanPage = lazy(() => import('./screens/PlanPage'));
const NewPlan = lazy(() => import('./screens/NewPlan'));
const RollComposer = lazy(() => import('./screens/RollComposer'));
const Binder = lazy(() => import('./screens/cards/Binder'));
const PackOpening = lazy(() => import('./screens/cards/PackOpening'));
const WonderPick = lazy(() => import('./screens/cards/WonderPick'));
const Trades = lazy(() => import('./screens/cards/Trades'));
const GameScreen = lazy(() => import('./screens/GameScreen'));
const Wrapped = lazy(() => import('./screens/Wrapped'));
const GroupSettings = lazy(() => import('./screens/GroupSettings'));
const MemoryPanel = lazy(() => import('./screens/MemoryPanel'));
const CreateHub = lazy(() => import('./screens/create/CreateHub'));
const Profile = lazy(() => import('./screens/Profile'));
const Likeness = lazy(() => import('./screens/Likeness'));
const Settings = lazy(() => import('./screens/Settings'));
const Paywall = lazy(() => import('./screens/Paywall'));
const Shop = lazy(() => import('./screens/Shop'));
const Notifications = lazy(() => import('./screens/Notifications'));
const NewGroup = lazy(() => import('./screens/NewGroup'));
const PostView = lazy(() => import('./screens/PostView'));

function Loading() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );
}

/** Signed-out visitors go to onboarding; the join page stays public (spec §A2). */
function Gate({ children }: { children: ReactNode }) {
  const me = useMe();
  const loc = useLocation();
  const nav = useNavigate();
  useRealtime(Boolean(me.data));
  useEffect(() => {
    if (me.isError && !loc.pathname.startsWith('/welcome') && !loc.pathname.startsWith('/j/')) nav('/welcome', { replace: true });
    if (me.data && !me.data.user.onboarded && !loc.pathname.startsWith('/welcome') && !loc.pathname.startsWith('/j/')) nav('/welcome/name', { replace: true });
  }, [me.isError, me.data, loc.pathname, nav]);
  if (me.isLoading && !loc.pathname.startsWith('/j/')) return <Loading />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/welcome/*" element={<Onboarding />} />
        <Route path="/j/:code" element={<JoinPage />} />
        <Route path="/" element={<CameraHome />} />
        <Route path="/roll" element={<RollComposer />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/calendar" element={<Calendar />} />
        <Route path="/g/:groupId/week/:weekKey" element={<WeekView />} />
        <Route path="/rewind" element={<Rewind />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:groupId" element={<ChatThread />} />
        <Route path="/plan/:planId" element={<PlanPage />} />
        <Route path="/g/:groupId/new-plan" element={<NewPlan />} />
        <Route path="/p/:postId" element={<PostView />} />
        <Route path="/g/:groupId/cards" element={<Binder />} />
        <Route path="/g/:groupId/pack/:packId" element={<PackOpening />} />
        <Route path="/g/:groupId/wonder" element={<WonderPick />} />
        <Route path="/g/:groupId/trades" element={<Trades />} />
        <Route path="/g/:groupId/game" element={<GameScreen />} />
        <Route path="/g/:groupId/wrapped" element={<Wrapped />} />
        <Route path="/g/:groupId/settings" element={<GroupSettings />} />
        <Route path="/g/:groupId/memory" element={<MemoryPanel />} />
        <Route path="/create/*" element={<CreateHub />} />
        <Route path="/me" element={<Profile />} />
        <Route path="/me/likeness" element={<Likeness />} />
        <Route path="/me/settings" element={<Settings />} />
        <Route path="/plans" element={<Paywall />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/new-group" element={<NewGroup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function useWide() {
  const q = '(min-width: 900px) and (min-height: 700px)';
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

export function App() {
  const wide = useWide();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Gate>
          {wide ? (
            <Stage>
              <AppRoutes />
              <Toasts />
            </Stage>
          ) : (
            <div className="device-full">
              <AppRoutes />
              <Toasts />
            </div>
          )}
        </Gate>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
