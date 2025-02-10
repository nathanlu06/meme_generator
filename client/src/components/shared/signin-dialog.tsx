import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Button } from "../ui/button";
import { useLoginSuiWallet } from "@/hooks/use-login-sui-wallet";

interface SigninDialogProps {
  onSignedIn: () => void;
}

export const SigninDialog = NiceModal.create<SigninDialogProps>(
  ({ onSignedIn }) => {
    const modal = useModal();
    const { mutateAsync: loginSuiWallet, isPending } = useLoginSuiWallet();

    const handleConfirm = async () => {
      const loginSuccessful = await loginSuiWallet();
      modal.hide();
      if (loginSuccessful) {
        return onSignedIn();
      }
    };

    return (
      <Dialog open={modal.visible} onOpenChange={modal.hide}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="">Login</DialogTitle>
            <DialogDescription>
              To continue, please sign in with your wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="w-full h-12 rounded-[14px]"
              onClick={modal.hide}
            >
              Cancel
            </Button>
            <Button
              className="w-full h-12 rounded-[14px]"
              onClick={handleConfirm}
              loading={isPending}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
