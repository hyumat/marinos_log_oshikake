import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  buttonHref: string;
  highlighted?: boolean;
}

function PlanCard({ title, price, priceNote, description, features, buttonText, buttonHref, highlighted }: PlanCardProps) {
  return (
    <Card className={`flex flex-col ${highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {priceNote && <span className="text-muted-foreground ml-1">{priceNote}</span>}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href={buttonHref} className="w-full">
          <Button className="w-full" variant={highlighted ? 'default' : 'outline'}>
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Pricing() {
  const freePlanFeatures: PlanFeature[] = [
    { text: '今シーズンの観戦記録（10件まで）', included: true },
    { text: '費用記録（交通費・チケット・飲食・その他）', included: true },
    { text: '勝敗・費用の集計表示', included: true },
    { text: '公式試合データの自動取得', included: true },
    { text: '過去シーズンの記録', included: false },
    { text: '無制限の観戦記録', included: false },
    { text: 'データエクスポート（CSV）', included: false },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { text: '今シーズンの観戦記録（無制限）', included: true },
    { text: '費用記録（交通費・チケット・飲食・その他）', included: true },
    { text: '勝敗・費用の集計表示', included: true },
    { text: '公式試合データの自動取得', included: true },
    { text: '過去シーズンの記録（全期間）', included: true },
    { text: '無制限の観戦記録', included: true },
    { text: 'データエクスポート（CSV）', included: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">料金プラン</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            おしかけログは無料で始められます。より多くの記録を残したい方にはProプランをご用意しています。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PlanCard
            title="無料プラン"
            price="¥0"
            description="まずは気軽に始めたい方に"
            features={freePlanFeatures}
            buttonText="無料で始める"
            buttonHref="/matches"
          />
          <PlanCard
            title="Proプラン"
            price="¥480"
            priceNote="/月"
            description="全ての機能を使いたい方に"
            features={proPlanFeatures}
            buttonText="Proプランを申し込む"
            buttonHref="/upgrade"
            highlighted
          />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-4">よくある質問</h2>
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            <div>
              <h3 className="font-medium mb-2">無料プランから有料プランへの切り替えは？</h3>
              <p className="text-muted-foreground">
                いつでもProプランにアップグレードできます。無料プランで記録したデータはそのまま引き継がれます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Proプランを解約したらどうなりますか？</h3>
              <p className="text-muted-foreground">
                解約後も記録したデータは保持されます。ただし、無料プランの制限（今シーズン10件まで）が適用されます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">支払い方法は？</h3>
              <p className="text-muted-foreground">
                クレジットカード（Visa、Mastercard、JCB、American Express）でお支払いいただけます。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="ghost">トップページに戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
