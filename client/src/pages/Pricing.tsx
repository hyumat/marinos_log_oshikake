import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

interface PlanFeature {
  text: string;
  included: boolean;
  bold?: boolean;
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
  footnote?: string;
}

function PlanCard({ title, price, priceNote, description, features, buttonText, buttonHref, highlighted, footnote }: PlanCardProps) {
  return (
    <Card className={`flex flex-col ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="mt-3">
          <span className="text-3xl font-bold">{price}</span>
          {priceNote && <span className="text-muted-foreground ml-1 text-sm">{priceNote}</span>}
        </div>
        <CardDescription className="mt-2 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={`${feature.included ? '' : 'text-muted-foreground'} ${feature.bold ? 'font-medium' : ''}`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        {footnote && (
          <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>
        )}
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
  const [isYearly, setIsYearly] = useState(false);

  const freePlanFeatures: PlanFeature[] = [
    { text: '記録可能試合：10件まで', included: true, bold: true },
    { text: 'メモと費用をまとめて残せる', included: true },
    { text: '基本の集計で見返せる', included: true },
    { text: 'データエクスポート（CSV）', included: false },
  ];

  const plusPlanFeatures: PlanFeature[] = [
    { text: '記録可能試合：無制限', included: true, bold: true },
    { text: '今のシーズンをしっかり残せる', included: true },
    { text: '基本の集計で見返せる', included: true },
    { text: 'データエクスポート（CSV）', included: true },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { text: '複数シーズンをまとめて管理', included: true, bold: true },
    { text: 'CSVで書き出し（保存・共有に便利）', included: true },
    { text: '支出の内訳や推移まで見える（高度集計）', included: true },
    { text: '優先サポート', included: true },
  ];

  const plusPrice = isYearly ? '¥4,900' : '¥490';
  const plusPriceNote = isYearly ? '/年' : '/月';
  const proPrice = isYearly ? '¥9,800' : '¥980';
  const proPriceNote = isYearly ? '/年' : '/月';

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">料金プラン</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            まずはFreeでお試し。気に入ったらPlus/Proで制限を解除できます。
          </p>

          <div className="inline-flex items-center gap-3 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              月払い
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              年払い
              <span className="ml-1 text-xs text-green-600">2ヶ月分お得</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PlanCard
            title="Free"
            price="¥0"
            description="まずは気軽に始めたい方に"
            features={freePlanFeatures}
            buttonText="Freeで始める"
            buttonHref="/matches"
            footnote="※「記録可能試合」は、観戦記録（観戦済み）として保存できる件数です。"
          />
          <PlanCard
            title="Plus"
            price={plusPrice}
            priceNote={plusPriceNote}
            description="シーズンを通して記録したい方に"
            features={plusPlanFeatures}
            buttonText="Plusプランを申し込む"
            buttonHref="/upgrade?plan=plus"
          />
          <PlanCard
            title="Pro"
            price={proPrice}
            priceNote={proPriceNote}
            description="全ての試合を記録したい方に"
            features={proPlanFeatures}
            buttonText="Proプランを申し込む"
            buttonHref="/upgrade?plan=pro"
            highlighted
          />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-4">よくある質問</h2>
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            <div>
              <h3 className="font-medium mb-2">どこまでFreeで使えますか？</h3>
              <p className="text-muted-foreground">
                Freeプランでは、観戦記録（観戦済み）を<strong>10件まで</strong>保存できます。メモや費用の記録、基本の集計もお試しいただけます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">「記録可能試合」って何ですか？</h3>
              <p className="text-muted-foreground">
                観戦した試合を「観戦記録（観戦済み）」として保存できる件数のことです。予定（観戦予定）は上限に含みません。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">途中でプラン変更や解約はできますか？</h3>
              <p className="text-muted-foreground">
                いつでも変更・解約できます。（決済画面の「管理ページ」から手続きできます）
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
