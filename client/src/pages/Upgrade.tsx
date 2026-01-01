import { ArrowLeft, Check, Sparkles, Infinity, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function Upgrade() {
  const [, setLocation] = useLocation();

  const freeFeatures = [
    '今シーズンの観戦記録（10件まで）',
    '試合予定・結果の閲覧',
    '基本的な集計機能',
  ];

  const proFeatures = [
    '観戦記録 無制限',
    '複数シーズン対応',
    '過去シーズンの記録・閲覧',
    '詳細な集計・分析（予定）',
    'CSVエクスポート（予定）',
    '優先サポート',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => setLocation('/matches')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          マッチログに戻る
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            もっと観戦を楽しむために
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Proプランで、すべての観戦記録を無制限に。
            過去シーズンも含めて、あなたの観戦履歴をまとめて管理できます。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>無料プラン</CardTitle>
              <CardDescription>まずは試してみる</CardDescription>
              <div className="pt-4">
                <span className="text-3xl font-bold">¥0</span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6"
                disabled
              >
                現在のプラン
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">おすすめ</span>
              </div>
              <CardTitle>Proプラン</CardTitle>
              <CardDescription>すべての機能を解放</CardDescription>
              <div className="pt-4">
                <span className="text-3xl font-bold">準備中</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                disabled
              >
                近日公開予定
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-6">Proでできること</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Infinity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">無制限の記録</h3>
              <p className="text-sm text-muted-foreground text-center">
                何試合でも記録可能。制限を気にせず使えます。
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">複数シーズン</h3>
              <p className="text-sm text-muted-foreground text-center">
                過去の記録も未来の予定も、すべて一元管理。
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">データエクスポート</h3>
              <p className="text-sm text-muted-foreground text-center">
                CSVやPDFで、あなたのデータを持ち出せます。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            ご不明な点がございましたら、
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => setLocation('/support')}
            >
              お問い合わせ
            </Button>
            までご連絡ください。
          </p>
        </div>
      </div>
    </div>
  );
}
