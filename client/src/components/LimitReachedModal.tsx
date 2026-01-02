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

  const handleUpgradePlus = () => {
    onClose();
    setLocation("/upgrade?plan=plus");
  };

  const handleUpgradePro = () => {
    onClose();
    setLocation("/upgrade?plan=pro");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>記録可能試合の上限に達しました</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Freeプランでは、観戦記録（観戦済み）を{limit}件まで保存できます。
            </p>
            <p>
              続けて記録するには、PlusまたはProをご利用ください。
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            あとで
          </Button>
          <Button variant="outline" onClick={handleUpgradePlus}>
            Plusで続ける
          </Button>
          <Button onClick={handleUpgradePro}>
            Proで続ける
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
