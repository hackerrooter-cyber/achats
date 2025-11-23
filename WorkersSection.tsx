import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Worker, Payment } from "@/pages/Index";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface WorkersSectionProps {
  workers: Worker[];
  onAddPayment: (workerId: string, payment: Omit<Payment, "id">) => void;
}

export const WorkersSection = ({ workers, onAddPayment }: WorkersSectionProps) => {
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleAddPayment = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      setPaymentDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Main d'œuvre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workers.map((worker) => {
            const percentage = (worker.paidAmount / worker.totalAmount) * 100;
            const remaining = worker.totalAmount - worker.paidAmount;
            const isExpanded = expandedWorker === worker.id;

            return (
              <div key={worker.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{worker.name}</h4>
                      <Badge variant="outline">{worker.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {worker.paidAmount.toLocaleString()} FCFA / {worker.totalAmount.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPayment(worker.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Payer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedWorker(isExpanded ? null : worker.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% versé</span>
                    <span className="font-medium text-warning">
                      Reste: {remaining.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {isExpanded && worker.payments.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <h5 className="text-sm font-medium">Historique des paiements</h5>
                    {worker.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className="font-semibold text-success">
                          {payment.amount.toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedWorker && (
        <AddPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          worker={selectedWorker}
          onAddPayment={(payment) => onAddPayment(selectedWorker.id, payment)}
        />
      )}
    </>
  );
};
