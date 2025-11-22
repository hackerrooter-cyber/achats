import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, Wallet, Users, Package, AlertTriangle, BadgeCheck, Clock4, ArrowUpRight } from "lucide-react";
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
  const budgetUsage = Number(((totalSpent / totalBudget) * 100).toFixed(1));
  const creditSuppliers = materials.filter(m => m.isCredit);
  const creditExposure = totalDebts > 0 ? Number(((totalDebts / totalBudget) * 100).toFixed(1)) : 0;
  const averagePayment = workers.length ? Math.round(totalPaidWorkers / workers.length) : 0;

  const allTransactions: Transaction[] = useMemo(() => ([
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
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())), [materials, workers]);

  const latestTransactions = useMemo(() => allTransactions.slice(0, 4), [allTransactions]);

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
    <div className="min-h-screen bg-gradient-to-b from-background via-slate-50/60 to-background text-foreground">
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Tableau de bord chantier</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Pilotez vos dépenses et vos équipes avec une vision exécutive
              </h1>
              <p className="text-muted-foreground max-w-3xl">
                Suivi consolidé des achats, paiements et dettes fournisseurs. Un résumé clair pour partager l'avancement
                financier et rassurer votre équipe comme vos partenaires.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => setExpenseDialogOpen(true)} className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Saisir une nouvelle dépense
                </Button>
                <Button onClick={() => setWorkerDialogOpen(true)} variant="outline" className="border-dashed">
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un intervenant
                </Button>
              </div>
            </div>
            <Card className="shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  Santé financière du chantier
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>Photo instantanée pour le comité de pilotage</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Budget utilisé</div>
                  <div className="font-semibold">{budgetUsage}%</div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-card/60 p-3">
                    <p className="text-muted-foreground text-xs">Versements ouvriers</p>
                    <p className="text-lg font-semibold">{totalPaidWorkers.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">Moyenne {averagePayment.toLocaleString()} FCFA / ouvrier</p>
                  </div>
                  <div className="rounded-lg border bg-card/60 p-3">
                    <p className="text-muted-foreground text-xs">Dette fournisseurs</p>
                    <p className="text-lg font-semibold">{totalDebts.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">Exposition {creditExposure}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
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

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] mb-8">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Récapitulatif express</CardTitle>
              <CardDescription>Ce qui s'est passé cette semaine sur le chantier</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  Statut général
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Suivi budgétaire sous contrôle avec <strong>{budgetUsage}%</strong> du budget engagé et une réserve de
                  {" "}
                  <strong>{remainingBudget.toLocaleString()} FCFA</strong>.
                </p>
              </div>
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock4 className="h-4 w-4 text-secondary" />
                  Flux de paiements
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {workers.length} intervenants suivis, {totalPaidWorkers.toLocaleString()} FCFA déjà réglés.
                  {" "}
                  Pensez à cadencer les prochains versements pour lisser la trésorerie.
                </p>
              </div>
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Fournisseurs à crédit
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {creditSuppliers.length} fournisseurs avec un solde ouvert. {" "}
                  <strong>{totalDebts.toLocaleString()} FCFA</strong> restent à solder.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Activité récente
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Derniers mouvements financiers saisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border bg-card/60 p-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date} · {tx.category}</p>
                  </div>
                  <span className={`font-semibold ${tx.type === "payment" ? "text-primary" : "text-secondary"}`}>
                    {tx.amount.toLocaleString()} FCFA
                  </span>
                </div>
              ))}
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

        <Card className="mt-8 border-dashed bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg">Plan d'action immédiat</CardTitle>
            <CardDescription>Suggestions pour sécuriser la trésorerie et maintenir le rythme du chantier</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Anticiper les décaissements
              </p>
              <p className="mt-2 text-muted-foreground">
                Caler les prochaines échéances fournisseurs ({totalDebts.toLocaleString()} FCFA) dans le calendrier de
                trésorerie pour éviter toute tension.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-secondary" />
                Optimiser les achats
              </p>
              <p className="mt-2 text-muted-foreground">
                Prioriser les commandes liées aux postes critiques (maçonnerie, électricité) et valider les livraisons
                avant paiement.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Communication hebdomadaire
              </p>
              <p className="mt-2 text-muted-foreground">
                Partager ce tableau de bord aux équipes terrain et au maître d'ouvrage pour valider les engagements en
                toute transparence.
              </p>
            </div>
          </CardContent>
        </Card>
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
