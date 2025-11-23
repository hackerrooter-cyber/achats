import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Worker, Payment } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: Worker;
  workerName?: string;
  remainingAmount?: number;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
}

export const AddPaymentDialog = ({
  open,
  onOpenChange,
  worker,
  workerName,
  remainingAmount,
  onAddPayment,
}: AddPaymentDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const displayName = workerName || worker?.name || "";
  const displayRole = worker?.role;
  const remaining = remainingAmount ?? (worker ? worker.totalAmount - worker.paidAmount : 0);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = () => {
    if (!amount || !description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amount);

    if (paymentAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    if (paymentAmount > remaining) {
      toast({
        title: "Montant invalide",
        description: `Le montant ne peut pas dépasser le reste à payer (${remaining.toLocaleString()} FCFA)`,
        variant: "destructive"
      });
      return;
    }

    onAddPayment({
      amount: paymentAmount,
      date,
      description
    });

    toast({
      title: "Paiement enregistré",
      description: `${paymentAmount.toLocaleString()} FCFA versés pour ${displayName}`
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau paiement</DialogTitle>
          <DialogDescription>
            Enregistrez un paiement pour {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{displayName}</p>
              {displayRole && <Badge variant="outline" className="mt-1">{displayRole}</Badge>}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reste à payer</p>
              <p className="text-lg font-bold text-warning">
                {remaining.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-description">Description</Label>
            <Input
              id="payment-description"
              placeholder="Ex: Deuxième tranche"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Montant (FCFA)</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={remaining}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Enregistrer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
