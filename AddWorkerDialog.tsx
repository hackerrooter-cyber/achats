import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWorker: (worker: { name: string; role: string; totalAmount: number }) => void;
}

const workerRoles = [
  "Maçon",
  "Ferrailleur",
  "Électricien",
  "Plombier",
  "Peintre",
  "Menuisier",
  "Carreleur",
  "Plâtrier",
  "Couvreur",
  "Autre"
];

export const AddWorkerDialog = ({
  open,
  onOpenChange,
  onAddWorker,
}: AddWorkerDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const resetForm = () => {
    setName("");
    setRole("");
    setTotalAmount("");
  };

  const handleSubmit = () => {
    if (!name || !role || !totalAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(totalAmount);
    if (amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    onAddWorker({
      name,
      role,
      totalAmount: amount
    });

    toast({
      title: "Ouvrier ajouté",
      description: `${name} - ${role} (${amount.toLocaleString()} FCFA)`
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvel ouvrier</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel ouvrier au chantier avec le montant total convenu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="worker-name">Nom complet</Label>
            <Input
              id="worker-name"
              placeholder="Ex: Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="worker-role">Corps de métier</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un métier" />
              </SelectTrigger>
              <SelectContent>
                {workerRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="worker-amount">Montant total convenu (FCFA)</Label>
            <Input
              id="worker-amount"
              type="number"
              placeholder="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ce montant sera divisé en tranches de paiement
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Ajouter l'ouvrier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
