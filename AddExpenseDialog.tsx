import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Material, Payment, Worker } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMaterial: (material: Omit<Material, "id">) => void;
  workers: Worker[];
  onAddPayment: (workerId: string, payment: Omit<Payment, "id">) => void;
}

const materialCategories = [
  "Maçonnerie",
  "Électricité",
  "Plomberie",
  "Menuiserie",
  "Peinture",
  "Carrelage",
  "Autres"
];

export const AddExpenseDialog = ({
  open,
  onOpenChange,
  onAddMaterial,
  workers,
  onAddPayment,
}: AddExpenseDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("material");
  
  const [materialName, setMaterialName] = useState("");
  const [materialAmount, setMaterialAmount] = useState("");
  const [materialCategory, setMaterialCategory] = useState("");
  const [materialDate, setMaterialDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCredit, setIsCredit] = useState(false);
  const [initialPayment, setInitialPayment] = useState("");

  const [selectedWorker, setSelectedWorker] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const resetForm = () => {
    setMaterialName("");
    setMaterialAmount("");
    setMaterialCategory("");
    setMaterialDate(new Date().toISOString().split('T')[0]);
    setIsCredit(false);
    setInitialPayment("");
    setSelectedWorker("");
    setPaymentAmount("");
    setPaymentDescription("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmitMaterial = () => {
    if (!materialName || !materialAmount || !materialCategory) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(materialAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être un nombre positif",
        variant: "destructive"
      });
      return;
    }

    if (isCredit) {
      const initial = initialPayment ? parseFloat(initialPayment) : 0;
      if (isNaN(initial) || initial < 0) {
        toast({
          title: "Erreur",
          description: "Le versement initial doit être un nombre positif",
          variant: "destructive"
        });
        return;
      }
      if (initial > amount) {
        toast({
          title: "Erreur",
          description: "Le versement initial ne peut pas dépasser le montant total",
          variant: "destructive"
        });
        return;
      }

      onAddMaterial({
        name: materialName,
        amount,
        category: materialCategory,
        date: materialDate,
        isCredit: true,
        paidAmount: initial,
        creditPayments: initial > 0 ? [{
          id: Date.now().toString(),
          amount: initial,
          date: materialDate,
          description: "Versement initial"
        }] : []
      });

      toast({
        title: "Achat à crédit ajouté",
        description: `${materialName} - ${amount.toLocaleString()} FCFA (Versé: ${initial.toLocaleString()} FCFA)`
      });
    } else {
      onAddMaterial({
        name: materialName,
        amount,
        date: materialDate,
        category: materialCategory
      });

      toast({
        title: "Dépense ajoutée",
        description: `${materialName} - ${amount.toLocaleString()} FCFA`
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const handleSubmitPayment = () => {
    if (!selectedWorker || !paymentAmount || !paymentDescription) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const worker = workers.find(w => w.id === selectedWorker);
    if (!worker) return;

    const amount = parseFloat(paymentAmount);
    const remaining = worker.totalAmount - worker.paidAmount;

    if (amount > remaining) {
      toast({
        title: "Montant invalide",
        description: `Le montant ne peut pas dépasser le reste à payer (${remaining.toLocaleString()} FCFA)`,
        variant: "destructive"
      });
      return;
    }

    onAddPayment(selectedWorker, {
      amount,
      date: paymentDate,
      description: paymentDescription
    });

    toast({
      title: "Paiement enregistré",
      description: `${worker.name} - ${amount.toLocaleString()} FCFA`
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle dépense</DialogTitle>
          <DialogDescription>
            Ajoutez une dépense matériel ou un paiement de main d'œuvre
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="material">Matériaux</TabsTrigger>
            <TabsTrigger value="payment">Paiement ouvrier</TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="material-name">Désignation</Label>
              <Input
                id="material-name"
                placeholder="Ex: Ciment - 50 sacs"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-amount">Montant (FCFA)</Label>
                <Input
                  id="material-amount"
                  type="number"
                  placeholder="0"
                  value={materialAmount}
                  onChange={(e) => setMaterialAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-date">Date</Label>
                <Input
                  id="material-date"
                  type="date"
                  value={materialDate}
                  onChange={(e) => setMaterialDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material-category">Catégorie</Label>
              <Select value={materialCategory} onValueChange={setMaterialCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {materialCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="is-credit"
                checked={isCredit}
                onCheckedChange={(checked) => setIsCredit(checked as boolean)}
              />
              <Label htmlFor="is-credit" className="cursor-pointer">
                Achat à crédit
              </Label>
            </div>

            {isCredit && (
              <div className="space-y-2">
                <Label htmlFor="initial-payment">Versement initial (optionnel)</Label>
                <Input
                  id="initial-payment"
                  type="number"
                  placeholder="Montant du premier versement"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide si aucun versement n'est effectué aujourd'hui
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitMaterial}>
                {isCredit ? "Ajouter l'achat à crédit" : "Ajouter la dépense"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="worker-select">Ouvrier</Label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un ouvrier" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.role} (Reste: {(worker.totalAmount - worker.paidAmount).toLocaleString()} FCFA)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-description">Description</Label>
              <Input
                id="payment-description"
                placeholder="Ex: Deuxième tranche"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Montant (FCFA)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-date">Date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitPayment}>
                Enregistrer le paiement
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
