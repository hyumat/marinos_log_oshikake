import { useState } from "react";
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
  const [isYearly, setIsYearly] = useState(false);

  const freePlanFeatures: PlanFeature[] = [
    { text: '記録可能試合: 10件', included: true },
    { text: '費用記録（交通費・チケット・飲食・その他）', included: true },
    { text: '勝敗・費用の集計表示', included: true },
    { text: '公式試合データの自動取得', included: true },
    { text: 'データエクスポート（CSV）', included: false },
  ];

  const plusPlanFeatures: PlanFeature[] = [
    { text: '記録可能試合: 30件', included: true },
    { text: '費用記録（交通費・チケット・飲食・その他）', included: true },
    { text: '勝敗・費用の集計表示', included: true },
    { text: '公式試合データの自動取得', included: true },
    { text: 'データエクスポート（CSV）', included: true },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { text: '記録可能試合: 無制限', included: true },
    { text: '費用記録（交通費・チケット・飲食・その他）', included: true },
    { text: '勝敗・費用の集計表示', included: true },
    { text: '公式試合データの自動取得', included: true },
    { text: 'データエクスポート（CSV）', included: true },
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
            おしかけログはFreeプランで始められます。より多くの試合を記録したい方には有料プランをご用意しています。
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
          />
          <PlanCard
            title="Plus"
            price={plusPrice}
            priceNote={plusPriceNote}
            description="シーズンを通して記録したい方に"
            features={plusPlanFeatures}
            buttonText="Plusプランを申し込む"
            buttonHref="/upgrade"
          />
          <PlanCard
            title="Pro"
            price={proPrice}
            priceNote={proPriceNote}
            description="全ての試合を記録したい方に"
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
              <h3 className="font-medium mb-2">FreeプランからPlus/Proプランへの切り替えは？</h3>
              <p className="text-muted-foreground">
                いつでもアップグレードできます。Freeプランで記録したデータはそのまま引き継がれます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">有料プランを解約したらどうなりますか？</h3>
              <p className="text-muted-foreground">
                解約後も記録したデータは保持されます。ただし、Freeプランの制限（10件まで）が適用されます。
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
