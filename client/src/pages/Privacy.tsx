import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Privacy() {
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

        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">最終更新日: 2026年1月1日</p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">はじめに</h2>
            <p>
              「おしかけログ」（以下「本サービス」）は、お客様のプライバシーを尊重し、
              個人情報の保護に努めています。本プライバシーポリシーは、本サービスが
              お客様から収集する情報、その使用方法、および保護方法について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">収集する情報</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">1. アカウント情報</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>メールアドレス</li>
              <li>ログイン方法（Google、Apple等）に応じたID情報</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2. 観戦記録</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>観戦した試合の情報</li>
              <li>費用データ（交通費、チケット代、飲食代、その他）</li>
              <li>メモ・感想</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3. 利用状況</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>サービスの利用履歴</li>
              <li>アクセスログ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">情報の利用目的</h2>
            <p>収集した情報は、以下の目的で使用します：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>本サービスの提供・運営</li>
              <li>お客様の観戦記録の管理・集計</li>
              <li>サービスの改善・新機能の開発</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">情報の共有</h2>
            <p>お客様の個人情報は、以下の場合を除き第三者に提供しません：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>お客様の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">データの保管</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>データは安全なサーバーに保管されます</li>
              <li>適切なセキュリティ対策を実施しています</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">お客様の権利</h2>
            <p>お客様は以下の権利を有します：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>自己の個人情報へのアクセス</li>
              <li>個人情報の訂正・削除の請求</li>
              <li>サービスの利用停止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">お問い合わせ</h2>
            <p>
              プライバシーに関するお問い合わせは、
              <a href="/support" className="text-primary hover:underline">お問い合わせページ</a>
              よりご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">変更について</h2>
            <p>
              本ポリシーは予告なく変更される場合があります。
              重要な変更がある場合は、本サービス内でお知らせします。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
