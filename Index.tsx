import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, Wallet, Users, Package } from "lucide-react";
import { BudgetOverview } from "@/components/BudgetOverview";
import { WorkersSection } from "@/components/WorkersSection";
import { MaterialsSection } from "@/components/MaterialsSection";
import { TransactionHistory } from "@/components/TransactionHistory";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddWorkerDialog } from "@/components/AddWorkerDialog";

export interface Worker {
  id: string;
  name: string;
  role: string;
  totalAmount: number;
  paidAmount: number;
  payments: Payment[];
}

export interface Material {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  isCredit?: boolean;
  paidAmount?: number;
  creditPayments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export interface Transaction {
  id: string;
  type: "material" | "payment";
  description: string;
  amount: number;
  date: string;
  category?: string;
}

const Index = () => {
  const [totalBudget] = useState(500000);
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: "1",
      name: "Jean Dupont",
      role: "Maçon",
      totalAmount: 45000,
      paidAmount: 15000,
      payments: [
        { id: "p1", amount: 15000, date: "2024-01-15", description: "Première tranche" }
      ]
    },
    {
      id: "2",
      name: "Marie Laurent",
      role: "Électricienne",
      totalAmount: 28000,
      paidAmount: 10000,
      payments: [
        { id: "p2", amount: 10000, date: "2024-01-20", description: "Acompte" }
      ]
    }
  ]);
  
  const [materials, setMaterials] = useState<Material[]>([
    { id: "1", name: "Ciment - 50 sacs", amount: 3500, date: "2024-01-10", category: "Maçonnerie" },
    { id: "2", name: "Câbles électriques", amount: 1200, date: "2024-01-12", category: "Électricité" },
    { id: "3", name: "Peinture intérieure", amount: 2800, date: "2024-01-18", category: "Finitions" },
    { id: "4", name: "Briques - 1000 unités", amount: 85000, date: "2024-01-22", category: "Maçonnerie", isCredit: true, paidAmount: 30000, creditPayments: [
      { id: "cp1", amount: 30000, date: "2024-01-22", description: "Premier versement" }
    ] }
  ]);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);

  const totalPaidWorkers = workers.reduce((sum, w) => sum + w.paidAmount, 0);
  const totalMaterials = materials.reduce((sum, m) => sum + (m.isCredit ? (m.paidAmount || 0) : m.amount), 0);
  const totalDebts = materials.reduce((sum, m) => sum + (m.isCredit ? (m.amount - (m.paidAmount || 0)) : 0), 0);
  const totalSpent = totalPaidWorkers + totalMaterials;
  const remainingBudget = totalBudget - totalSpent;

  const allTransactions: Transaction[] = [
    ...materials.flatMap(m => {
      if (m.isCredit && m.creditPayments && m.creditPayments.length > 0) {
        // Pour les achats à crédit, on crée une transaction pour chaque paiement
        return m.creditPayments.map(p => ({
          id: p.id,
          type: "material" as const,
          description: `${m.name} - ${p.description}`,
          amount: p.amount,
          date: p.date,
          category: m.category
        }));
      } else if (!m.isCredit) {
        // Pour les achats comptant, une seule transaction
        return [{
          id: m.id,
          type: "material" as const,
          description: m.name,
          amount: m.amount,
          date: m.date,
          category: m.category
        }];
      }
      return [];
    }),
    ...workers.flatMap(w => 
      w.payments.map(p => ({
        id: p.id,
        type: "payment" as const,
        description: `${w.name} - ${p.description}`,
        amount: p.amount,
        date: p.date,
        category: w.role
      }))
    )
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddMaterial = (material: Omit<Material, "id">) => {
    const newMaterial = { 
      ...material, 
      id: Date.now().toString(),
      paidAmount: material.isCredit ? (material.paidAmount || 0) : undefined,
      creditPayments: material.isCredit ? (material.creditPayments || []) : undefined
    };
    setMaterials([...materials, newMaterial]);
  };

  const handleAddCreditPayment = (materialId: string, payment: Omit<Payment, "id">) => {
    setMaterials(materials.map(m => {
      if (m.id === materialId && m.isCredit) {
        return {
          ...m,
          paidAmount: (m.paidAmount || 0) + payment.amount,
          creditPayments: [...(m.creditPayments || []), { ...payment, id: Date.now().toString() }]
        };
      }
      return m;
    }));
  };

  const handleAddPayment = (workerId: string, payment: Omit<Payment, "id">) => {
    setWorkers(workers.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          paidAmount: w.paidAmount + payment.amount,
          payments: [...w.payments, { ...payment, id: Date.now().toString() }]
        };
      }
      return w;
    }));
  };

  const handleAddWorker = (worker: Omit<Worker, "id" | "paidAmount" | "payments">) => {
    const newWorker: Worker = {
      ...worker,
      id: Date.now().toString(),
      paidAmount: 0,
      payments: []
    };
    setWorkers([...workers, newWorker]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion de Chantier</h1>
              <p className="text-muted-foreground mt-1">Suivi budgétaire et dépenses</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setWorkerDialogOpen(true)} variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Nouvel ouvrier
              </Button>
              <Button onClick={() => setExpenseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle dépense
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalBudget.toLocaleString()} FCFA
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépensé</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {totalSpent.toLocaleString()} FCFA
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reste</CardTitle>
              <Wallet className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {remainingBudget.toLocaleString()} FCFA
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisation</CardTitle>
              <Package className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {((totalSpent / totalBudget) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mb-8">
          <BudgetOverview 
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            totalMaterials={totalMaterials}
            totalPaidWorkers={totalPaidWorkers}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <WorkersSection workers={workers} onAddPayment={handleAddPayment} />
          <MaterialsSection materials={materials} onAddCreditPayment={handleAddCreditPayment} />
        </div>

        <TransactionHistory transactions={allTransactions} />
      </div>

      <AddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onAddMaterial={handleAddMaterial}
        workers={workers}
        onAddPayment={handleAddPayment}
      />

      <AddWorkerDialog
        open={workerDialogOpen}
        onOpenChange={setWorkerDialogOpen}
        onAddWorker={handleAddWorker}
      />
    </div>
  );
};

export default Index;
