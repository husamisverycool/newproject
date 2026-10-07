import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { demo, locket } from '@app/shared';
import { api } from '../lib/api';
import { queryClient } from '../lib/queries';
import { Avatar, NavBar, Row, Screen, Section, Spinner } from '../components/ios';

/**
 * [DEMO] Phone entry for the demo build: pick a seeded person to view the app as (the same switch
 * the desktop stage offers). A stock iOS list [HIG]. Only works when the server runs in demo mode.
 */
export default function DemoLogin() {
  const nav = useNavigate();
  const users = useQuery({ queryKey: ['demo-users'], queryFn: () => api.get<{ users: { id: string; name: string; avatar: string | null }[] }>('/demo/users') });
  const pick = async (id: string) => {
    await api.post('/demo/login', { userId: id });
    await queryClient.invalidateQueries();
    nav('/', { replace: true });
  };
  return (
    <Screen grouped dark>
      <NavBar title={demo.name} />
      {users.isLoading ? (
        <Spinner />
      ) : (
        <Section header={demo.viewAs}>
          {(users.data?.users ?? []).map((u) => (
            <Row key={u.id} icon={<Avatar user={u} size={34} />} title={u.name} onClick={() => void pick(u.id)} sepInset={62} />
          ))}
        </Section>
      )}
      <Section>
        <Row title={locket.setUp} link onClick={() => nav('/welcome')} chevron={false} />
      </Section>
    </Screen>
  );
}
