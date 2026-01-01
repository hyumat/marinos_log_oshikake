import { ArrowLeft, Mail, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function Support() {
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

        <h1 className="text-3xl font-bold mb-4">お問い合わせ</h1>
        <p className="text-muted-foreground mb-8">
          ご質問・ご要望がございましたら、お気軽にお問い合わせください。
        </p>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                メールでのお問い合わせ
              </CardTitle>
              <CardDescription>
                通常1〜3営業日以内に返信いたします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:support@example.com"
                className="text-primary hover:underline font-medium"
              >
                support@example.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                よくあるご質問
              </CardTitle>
              <CardDescription>
                まずはこちらをご確認ください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Q. 無料で使えますか？</h4>
                <p className="text-sm text-muted-foreground">
                  はい、今シーズン10試合まで無料でご利用いただけます。
                  それ以上の記録や過去シーズンの閲覧にはProプランへのアップグレードが必要です。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Q. データは安全ですか？</h4>
                <p className="text-sm text-muted-foreground">
                  はい、お客様のデータは安全なサーバーに保管され、
                  適切なセキュリティ対策を実施しています。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Q. 退会したい場合は？</h4>
                <p className="text-sm text-muted-foreground">
                  設定画面から退会手続きを行うか、メールにてご連絡ください。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                各種規約
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation('/privacy')}
              >
                プライバシーポリシー
              </Button>
              <br />
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation('/terms')}
              >
                利用規約
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
