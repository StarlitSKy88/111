/**
 * ONE-MCN Referral Page · v5.4 japanese-ma-minimalism
 * 推荐链接分享页
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReferralPage() {
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [link, setLink] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (uid) setUserId(uid);
  }, []);

  async function generateCode() {
    if (!userId) {
      alert('请先登录或注册');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('http://localhost:3000/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await r.json();
      setCode(data.code);
      setLink(data.link);
      await loadStats();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    if (!userId) return;
    try {
      const r = await fetch(`http://localhost:3000/api/referral/stats?user_id=${userId}`);
      const data = await r.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (userId) loadStats();
  }, [userId]);

  return (
    <main className="min-h-screen bg-ink-bg text-ink-primary">
      <div className="max-w-3xl mx-auto px-8 py-24 md:py-32 space-y-24">
        <header className="space-y-6">
          <Link href="/dashboard" className="font-mono text-[10px] tracking-[0.15em] text-ink-tertiary uppercase hover:text-ink-primary">
            ← 返回
          </Link>
          <span className="font-mono text-[10px] tracking-[0.15em] text-vermilion uppercase">
            推荐
          </span>
          <h1 className="text-display font-mincho">推荐 ONE-MCN</h1>
          <p className="text-ink-secondary leading-loose max-w-prose">
            推荐朋友使用 ONE-MCN，你将获得 15% 佣金（前 6 个月持续返佣）。
            <br />
            朋友获得 8 折优惠。
          </p>
        </header>

        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
              你的推荐码
            </h2>
            {code ? (
              <div className="border border-ink-line p-8 space-y-3">
                <p className="font-mono text-hero text-vermilion tracking-wider">
                  {code}
                </p>
                <p className="font-mono text-xs text-ink-tertiary break-all">
                  {link}
                </p>
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(link)}
                  >
                    复制链接
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="vermilion" size="lg" onClick={generateCode} disabled={loading}>
                {loading ? '生成中…' : '生成推荐码'}
              </Button>
            )}
          </div>

          {stats && (
            <div className="space-y-8">
              <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                推荐统计
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-line border border-ink-line">
                <div className="col-span-1 bg-ink-bg p-6 space-y-2">
                  <span className="font-mono text-[10px] text-ink-tertiary uppercase">
                    总推荐数
                  </span>
                  <p className="text-title font-mincho">{stats.summary?.total_referrals || 0}</p>
                </div>
                <div className="col-span-1 bg-ink-bg p-6 space-y-2">
                  <span className="font-mono text-[10px] text-ink-tertiary uppercase">
                    已转化
                  </span>
                  <p className="text-title font-mincho">{stats.summary?.converted || 0}</p>
                </div>
                <div className="col-span-1 bg-ink-bg p-6 space-y-2">
                  <span className="font-mono text-[10px] text-ink-tertiary uppercase">
                    总收入
                  </span>
                  <p className="text-title font-mincho">¥{stats.summary?.total_revenue || 0}</p>
                </div>
                <div className="col-span-1 bg-ink-bg p-6 space-y-2">
                  <span className="font-mono text-[10px] text-ink-tertiary uppercase">
                    佣金
                  </span>
                  <p className="text-title font-mincho text-vermilion">
                    ¥{stats.summary?.total_commission || 0}
                  </p>
                </div>
              </div>

              {stats.referrals?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-secondary">
                    推荐明细
                  </h3>
                  <div className="space-y-px bg-ink-line border border-ink-line">
                    {stats.referrals.map((r: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 gap-6 p-4 bg-ink-bg text-sm">
                        <span className="col-span-4 font-mono text-[10px] text-ink-tertiary">
                          {r.referred_email}
                        </span>
                        <span className="col-span-3 text-ink-secondary">
                          {r.status}
                        </span>
                        <span className="col-span-2 text-ink-primary">
                          ¥{r.total_payment_cny || 0}
                        </span>
                        <span className="col-span-3 text-vermilion">
                          ¥{r.commission_paid_cny || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}