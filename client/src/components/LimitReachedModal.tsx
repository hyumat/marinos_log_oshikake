import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LimitReachedModalProps {
  open: boolean;
  onClose: () => void;
  seasonYear: number;
  limit: number;
}

export function LimitReachedModal({ open, onClose, seasonYear, limit }: LimitReachedModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onClose();
    setLocation("/upgrade");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>記録上限に達しました</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {seasonYear}シーズンの無料プランでは、観戦記録は{limit}件までです。
            </p>
            <p>
              Proプランにアップグレードすると、無制限に記録できます。
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={handleUpgrade}>
            Proプランを見る
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
