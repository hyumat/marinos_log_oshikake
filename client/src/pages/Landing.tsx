import React, { useMemo, useState } from "react";

/**
 * LP: Marinos Away Log V2
 * - Single-file React component (Tailwind CSS assumed)
 * - No external UI libs required
 * - Replace CTA hrefs, images, and brand colors as needed
 */
export default function LandingPageMarinosAwayLogV2() {
  const [year, setYear] = useState<number>(2025);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const statsPreview = useMemo(() => {
    // LP用のダミー。実データ接続後は不要。
    const presets: Record<number, { watch: number; win: number; draw: number; loss: number; unknown: number; total: number }> =
      {
        2024: { watch: 6, win: 2, draw: 2, loss: 2, unknown: 0, total: 71200 },
        2025: { watch: 7, win: 3, draw: 2, loss: 1, unknown: 1, total: 84200 },
        2026: { watch: 1, win: 0, draw: 0, loss: 0, unknown: 1, total: 9800 },
      };
    const p = presets[year] ?? presets[2025];
    const avg = p.watch > 0 ? Math.round(p.total / p.watch) : 0;
    return { ...p, avg };
  }, [year]);

  const faq = [
    {
      q: "公式データが取れないことはありますか？",
      a: "あります。公式サイトの構造変更に備え、JSON-LD（構造化データ）を最優先にし、取れない場合は複数のHTMLセレクタでフォールバックします。失敗時は同期ログに記録し、アプリが落ちない設計です。",
    },
    {
      q: "オフラインでも見られますか？",
      a: "過去データはDBに保存されるため、閲覧は可能です（同期はオンライン時に実行）。PWA化やキャッシュ戦略は拡張ポイントとして想定しています。",
    },
    {
      q: "費用は何を記録できますか？",
      a: "MVPでは「費用合計（交通・チケット・飲食などをまとめて）」とメモを記録できます。次の段階でカテゴリ内訳（交通/チケット/飲食…）にも拡張できます。",
    },
    {
      q: "マリノス以外のチームにも使えますか？",
      a: "現時点では横浜F・マリノスを前提に最適化しています。将来的にチーム切り替え対応も可能です（取得元と判定ロジックの一般化）。",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-28 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <span className="text-sm font-semibold">M</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Marinos Away Log</div>
              <div className="text-xs text-slate-500">V2</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              機能
            </a>
            <a href="#how" className="text-sm text-slate-600 hover:text-slate-900">
              使い方
            </a>
            <a href="#stats" className="text-sm text-slate-600 hover:text-slate-900">
              集計
            </a>
            <a href="#roadmap" className="text-sm text-slate-600 hover:text-slate-900">
              ロードマップ
            </a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Replace with your routes/links */}
            <a
              href="#"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex"
            >
              GitHub
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              使ってみる
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:pb-16 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              公式試合データ × 観戦ログ × 費用集計
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
              観戦の思い出と出費を、
              <span className="text-slate-900">ちゃんと“資産”</span>に。
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
              Jリーグなどの公式試合情報を取り込み、観戦した試合だけを記録。交通費・チケット代などの費用を蓄積し、
              今季の勝敗と支出を自動で集計します。
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                デモを見る
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                できることを見る
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              <MiniStat label="観戦ログ" value="試合に紐付け" />
              <MiniStat label="費用" value="合計・平均" />
              <MiniStat label="集計" value="勝分敗" />
            </div>

            <p className="mt-4 text-xs text-slate-500">
              ※観戦ログ・費用はあなたのDBに保存。公式情報は公開情報を参照します。
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">今季の集計（例）</div>
                <div className="text-xs text-slate-500">2025</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <KpiCard title="観戦試合数" value={`${statsPreview.watch} 試合`} sub="観戦ログの登録数" />
                <KpiCard
                  title="戦績"
                  value={`${statsPreview.win}勝 ${statsPreview.draw}分 ${statsPreview.loss}敗`}
                  sub={`未確定 ${statsPreview.unknown}`}
                />
                <KpiCard title="費用合計" value={`¥${statsPreview.total.toLocaleString()}`} sub="交通・チケット・飲食など" />
                <KpiCard
                  title="平均/試合"
                  value={`¥${statsPreview.avg.toLocaleString()}`}
                  sub="合計 / 観戦試合数"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">最新の観戦ログ（例）</div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">登録済</span>
                </div>
                <div className="mt-3 text-sm text-slate-700">
                  <div className="font-medium">明治安田J1 第1節</div>
                  <div className="mt-1 text-slate-500">2025/02/15 14:03 ・ 日産スタジアム</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-semibold">横浜FM 2 - 1 ○○○</div>
                    <div className="text-slate-700">¥12,400</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                <div className="text-sm">
                  <div className="font-semibold">観戦記録を、もっと簡単に。</div>
                  <div className="text-xs text-white/70">試合を選んで、費用とメモを入力するだけ</div>
                </div>
                <div className="hidden text-xs text-white/70 sm:block">PWA / Mobile-first</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-3xl bg-slate-900/10 blur-2xl md:block" />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <SectionHeader
            eyebrow="課題"
            title="観戦の記録、散らばってませんか？"
            desc="メモ・SNS・家計簿に分散した情報を、公式試合データに紐づけて一箇所へ。"
          />
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="記録が散らばる"
              desc="どの試合を観たか、いつ・どこで・何が起きたかが追いにくい。"
              icon="🗂️"
            />
            <FeatureCard
              title="出費が見えない"
              desc="交通費・チケット・飲食…今季いくら使ったか分からない。"
              icon="💸"
            />
            <FeatureCard
              title="振り返りが大変"
              desc="今季の勝敗やアウェイ成績をまとめて見たい。"
              icon="📈"
            />
            <FeatureCard
              title="公式情報とのズレ"
              desc="試合日時・会場・結果が手入力だとズレやすい。"
              icon="🧾"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <SectionHeader
            eyebrow="解決"
            title="公式データに紐づく観戦ログ"
            desc="公式試合情報を“土台”にして、観戦記録と費用を積み上げ、集計する。"
          />
          <div className="md:col-span-2 grid gap-4">
            <BigFeature
              title="① 公式試合データを自動取得"
              desc="日程・会場・結果などを取り込み、記録の土台に。サイト構造の変化に備え、JSON-LD優先＋フォールバックで安定化。"
              bullets={["大会/節（第◯節・MD◯）を保持", "会場・対戦カード・結果を確定", "失敗時はログに残して安全に"]}
            />
            <BigFeature
              title="② 観戦した試合だけ記録"
              desc="試合詳細から、観戦日時・費用・メモを保存。編集・削除も簡単。"
              bullets={["観戦日時（watchedAt）", "費用合計（costTotal）", "メモ（memo）"]}
            />
            <BigFeature
              title="③ 戦績と費用を自動集計"
              desc="観戦ログ×公式結果から、勝分敗と支出を期間別に集計。"
              bullets={["観戦試合数", "勝・分・敗・未確定", "費用合計 / 平均（次で内訳も）"]}
            />
          </div>
        </div>
      </section>

      {/* How to */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">使い方</div>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">3ステップで完了</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                “同期→記録→集計”の流れだけ。観戦のたびに、資産が積み上がります。
              </p>
            </div>

            <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
              <StepCard
                step="1"
                title="同期"
                desc="公式試合を取り込み、一覧を作る。"
                pill="fetchOfficial"
              />
              <StepCard
                step="2"
                title="観戦ログ"
                desc="観た試合に費用とメモを追加。"
                pill="userMatches"
              />
              <StepCard
                step="3"
                title="集計"
                desc="勝敗と出費を期間別に確認。"
                pill="stats"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats preview */}
      <section id="stats" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <SectionHeader
            eyebrow="集計"
            title="今季の“観戦”が、数字で見える"
            desc="勝敗と支出が一目で分かると、次の観戦計画も立てやすい。"
          />
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">集計プレビュー</div>
                <div className="text-xs text-slate-500">※デモ表示（実装後はあなたのデータが入ります）</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">年</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Metric title="観戦試合数" value={`${statsPreview.watch}`} suffix="試合" hint="観戦ログに登録した試合" />
              <Metric
                title="戦績"
                value={`${statsPreview.win}-${statsPreview.draw}-${statsPreview.loss}`}
                suffix=""
                hint={`勝-分-敗（未確定 ${statsPreview.unknown}）`}
              />
              <Metric title="費用合計" value={`¥${statsPreview.total.toLocaleString()}`} suffix="" hint="費用合計（MVPは合計のみ）" />
              <Metric title="平均/試合" value={`¥${statsPreview.avg.toLocaleString()}`} suffix="" hint="費用合計 / 観戦試合数" />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold">次の拡張（V2以降）</div>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2">費用内訳（交通/チケット/飲食…）</div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">月別支出・勝率推移グラフ</div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">スタジアム別の回数/費用</div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">対戦相手別の戦績</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">ロードマップ</div>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">MVP → 拡張</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                最初に「記録と集計が成立する」状態を作り、その後に内訳や可視化を追加します。
              </p>
            </div>

            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <RoadmapCard
                tag="MVP"
                title="集計を完成させる"
                items={[
                  "Stats API（観戦数/勝分敗/費用合計/平均）",
                  "Statsページ（年フィルタ・エラー/空表示）",
                  "実データで統合テスト",
                ]}
              />
              <RoadmapCard
                tag="Next"
                title="“振り返り”を強化"
                items={[
                  "費用内訳（カテゴリ）",
                  "グラフ/チャート",
                  "スタジアム別・相手別の集計",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <SectionHeader
            eyebrow="データ"
            title="プライバシーと運用"
            desc="観戦ログと費用はあなたのデータ。公式情報は公開情報を参照します。"
          />
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
            <InfoCard
              title="データ保存"
              desc="観戦ログ・費用はDBに保存。アプリ側は“見せる”役に徹します。"
              icon="🔐"
            />
            <InfoCard
              title="同期の安全性"
              desc="取得失敗時も落ちずにログへ記録。原因追跡ができます。"
              icon="🧰"
            />
            <InfoCard
              title="公式情報"
              desc="JSON-LDを優先し、サイト構造変化に備えたフォールバックで取得します。"
              icon="🧾"
            />
            <InfoCard
              title="モバイル最優先"
              desc="スマホで“サッと記録”。PWA化・オフライン体験も拡張可能です。"
              icon="📱"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <SectionHeader eyebrow="FAQ" title="よくある質問" desc="導入前の不安を解消します。" />
          <div className="md:col-span-2 space-y-3">
            {faq.map((item, idx) => {
              const open = activeFaq === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFaq(open ? null : idx)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{item.q}</div>
                      <div
                        className={[
                          "mt-2 text-sm leading-relaxed text-slate-600 transition-all duration-200",
                          open ? "max-h-96 opacity-100" : "max-h-0 overflow-hidden opacity-0",
                        ].join(" ")}
                      >
                        {item.a}
                      </div>
                    </div>
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <span className="text-sm">{open ? "−" : "+"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pb-20">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Ready?</div>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">今季の観戦を、ちゃんと残そう。</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                公式データに紐づけて記録するから、あとで振り返りやすい。費用と結果を集計して、観戦の“履歴”を資産に。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                使ってみる
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/10"
              >
                GitHubを見る
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} Marinos Away Log</div>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-slate-700">
              機能
            </a>
            <a href="#how" className="hover:text-slate-700">
              使い方
            </a>
            <a href="#faq" className="hover:text-slate-700">
              FAQ
            </a>
          </div>
        </footer>
      </section>
    </div>
  );
}

/* ---------- UI Parts ---------- */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function KpiCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
          <span className="text-base">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function BigFeature({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:p-7">
      <div className="text-base font-bold">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-5 w-5 rounded-full bg-slate-900/10 text-center text-xs leading-5 text-slate-900">
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ step, title, desc, pill }: { step: string; title: string; desc: string; pill: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white">
          <span className="text-sm font-semibold">{step}</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{pill}</span>
      </div>
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</div>
    </div>
  );
}

function Metric({ title, value, suffix, hint }: { title: string; value: string; suffix: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {suffix ? <div className="text-sm font-semibold text-slate-500">{suffix}</div> : null}
      </div>
      <div className="mt-2 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function RoadmapCard({ tag, title, items }: { tag: string; title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{tag}</span>
        <span className="text-xs text-slate-500">Roadmap</span>
      </div>
      <div className="mt-3 text-base font-bold">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-5 w-5 rounded-full bg-slate-900/10 text-center text-xs leading-5 text-slate-900">
              →
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
          <span className="text-base">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}
