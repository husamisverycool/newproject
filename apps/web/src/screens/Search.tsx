import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ios, spec } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useActiveGroup, useMe } from '../lib/queries';
import { haptic } from '../lib/feedback';
import type { MeResponse, Post } from '../lib/types';
import { Icon } from '../components/Icon';
import { Row, Screen, Section, Spinner, Switch } from '../components/ios';
import s from './search.module.css';

/**
 * Searching the group archive (spec §L): Google's Ask Photos is opt-in [V], adapted as "opt-in group
 * search by caption and self-tags only" [S] — no face matching (spec §S self-tagging only). The screen
 * is the stock UISearchController [HIG]: a search field with Cancel, results as the Photos grid
 * (3 columns, 2 pt gaps), "No Results" when nothing matches. Until you turn search on, the field
 * offers the switch (the opt-in is the searcher's, as in Ask Photos); results are only photos you can
 * already see in the group.
 */
export default function Search() {
  const nav = useNavigate();
  const me = useMe();
  const { group } = useActiveGroup();
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const on = Boolean(me.data?.user.settings.searchOptIn);

  useEffect(() => {
    const t = setTimeout(() => setTerm(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    if (on) input.current?.focus();
  }, [on]);

  const results = useQuery({
    queryKey: ['search', group?.id, term],
    queryFn: () => api.get<{ posts: Post[] }>(`/groups/${group!.id}/search?q=${encodeURIComponent(term)}`),
    enabled: Boolean(group && on && term),
  });

  const turnOn = async (v: boolean) => {
    haptic('light');
    queryClient.setQueryData<MeResponse>(['me'], (d) => (d ? { ...d, user: { ...d.user, settings: { ...d.user.settings, searchOptIn: v } } } : d));
    await api.patch('/me', { settings: { searchOptIn: v } });
    void queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const posts = results.data?.posts ?? [];
  return (
    <Screen grouped>
      <div className={s.bar}>
        <label className={s.field}>
          <Icon name="searchGlass" size={17} strokeWidth={2.4} />
          <input ref={input} value={q} placeholder={ios.search} onChange={(e) => setQ(e.target.value)} disabled={!on} enterKeyHint="search" />
          {q && (
            <button className={s.clear} onClick={() => setQ('')} aria-label={ios.remove}>
              <Icon name="close" size={10} strokeWidth={3.4} />
            </button>
          )}
        </label>
        <button className="ios-bar-btn" onClick={() => nav(-1)}>
          {ios.cancel}
        </button>
      </div>
      <div className={s.scroll}>
        {!on ? (
          <Section footer={spec.searchFooter}>
            <Row icon={<Icon name="searchGlass" size={18} strokeWidth={2.4} />} iconBg="var(--sys-gray)" sepInset={57} title={spec.searchCaptions} accessory={<Switch on={on} label={spec.searchCaptions} onChange={(v) => void turnOn(v)} />} />
          </Section>
        ) : !term ? null : results.isLoading ? (
          <div className={s.center}>
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div className={s.center}>
            <b className={s.none}>{ios.noResults}</b>
          </div>
        ) : (
          <Section header={group?.name}>
            <div className={s.grid}>
              {posts.map((p) => (
                <button key={p.id} onClick={() => nav(`/p/${p.id}`)} aria-label={p.caption ?? p.user.name}>
                  <img src={p.media.thumb ?? p.media.main} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </Section>
        )}
        {on && (
          <Section footer={spec.searchFooter}>
            <Row title={spec.searchCaptions} accessory={<Switch on={on} label={spec.searchCaptions} onChange={(v) => void turnOn(v)} />} />
          </Section>
        )}
      </div>
    </Screen>
  );
}
