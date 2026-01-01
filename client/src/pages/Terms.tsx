import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          トップに戻る
        </Button>

        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">最終更新日: 2026年1月1日</p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第1条（適用）</h2>
            <p>
              本規約は、「おしかけログ」（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第2条（サービス内容）</h2>
            <p>本サービスは、サッカー観戦の記録・費用管理を支援するWebアプリケーションです。</p>
            <p className="mt-2">主な機能：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>試合予定・結果の閲覧</li>
              <li>観戦記録の登録・管理</li>
              <li>費用の記録・集計</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第3条（アカウント）</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>ユーザーは正確な情報を登録する必要があります</li>
              <li>アカウント情報の管理はユーザーの責任とします</li>
              <li>不正利用が判明した場合、アカウントを停止する場合があります</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第4条（禁止事項）</h2>
            <p>以下の行為を禁止します：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>法令に違反する行為</li>
              <li>他のユーザーへの迷惑行為</li>
              <li>サービスの運営を妨害する行為</li>
              <li>不正アクセス</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第5条（料金プラン）</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">無料プラン</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>今シーズンの観戦記録：10件まで</li>
              <li>基本的な集計機能</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Proプラン（有料）</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>観戦記録：無制限</li>
              <li>複数シーズン対応</li>
              <li>拡張機能</li>
            </ul>

            <p className="mt-2">料金・支払い方法は別途定めるものとします。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第6条（知的財産権）</h2>
            <p>
              本サービスに関する知的財産権は運営者に帰属します。
              ユーザーが登録した観戦記録データの権利はユーザーに帰属します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第7条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>本サービスは現状有姿で提供されます</li>
              <li>試合情報の正確性について保証しません</li>
              <li>サービスの中断・停止による損害について責任を負いません</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第8条（サービスの変更・終了）</h2>
            <p>
              運営者は、事前の通知なくサービスの内容を変更、または終了することがあります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第9条（退会）</h2>
            <p>
              ユーザーは、所定の手続きにより退会できます。
              退会時、登録データは削除されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第10条（準拠法・管轄）</h2>
            <p>
              本規約は日本法に準拠し、紛争が生じた場合は東京地方裁判所を
              第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">お問い合わせ</h2>
            <p>
              本規約に関するお問い合わせは、
              <a href="/support" className="text-primary hover:underline">お問い合わせページ</a>
              よりご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
