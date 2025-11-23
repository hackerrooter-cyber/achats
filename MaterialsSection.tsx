import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, CreditCard } from "lucide-react";
import { Material, Payment } from "@/pages/Index";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { useState } from "react";

interface MaterialsSectionProps {
  materials: Material[];
  onAddCreditPayment: (materialId: string, payment: Omit<Payment, "id">) => void;
}

export const MaterialsSection = ({ materials, onAddCreditPayment }: MaterialsSectionProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const cashMaterials = materials.filter(m => !m.isCredit);
  const creditMaterials = materials.filter(m => m.isCredit);
  const totalCash = cashMaterials.reduce((sum, m) => sum + m.amount, 0);
  const totalCreditPaid = creditMaterials.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  const totalCreditDebt = creditMaterials.reduce((sum, m) => sum + (m.amount - (m.paidAmount || 0)), 0);

  const handleOpenPaymentDialog = (material: Material) => {
    setSelectedMaterial(material);
    setPaymentDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Matériaux</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                Comptant: {totalCash.toLocaleString()} FCFA
              </Badge>
              {totalCreditDebt > 0 && (
                <Badge variant="destructive" className="text-sm">
                  Dettes: {totalCreditDebt.toLocaleString()} FCFA
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {cashMaterials.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Achats comptant</h4>
                {cashMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {material.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(material.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">
                        {material.amount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {creditMaterials.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Achats à crédit</h4>
                {creditMaterials.map((material) => {
                  const remaining = material.amount - (material.paidAmount || 0);
                  const progress = ((material.paidAmount || 0) / material.amount) * 100;

                  return (
                    <div
                      key={material.id}
                      className="border rounded-lg p-4 space-y-3 bg-muted/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-destructive/10 rounded-lg">
                            <CreditCard className="h-4 w-4 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {material.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(material.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total crédit</span>
                                <span className="font-semibold">{material.amount.toLocaleString()} FCFA</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payé</span>
                                <span className="font-semibold text-success">{(material.paidAmount || 0).toLocaleString()} FCFA</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Reste dû</span>
                                <span className="font-semibold text-destructive">{remaining.toLocaleString()} FCFA</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {remaining > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleOpenPaymentDialog(material)}
                        >
                          Rembourser
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMaterial && (
        <AddPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          workerName={selectedMaterial.name}
          remainingAmount={selectedMaterial.amount - (selectedMaterial.paidAmount || 0)}
          onAddPayment={(payment) => {
            onAddCreditPayment(selectedMaterial.id, payment);
          }}
        />
      )}
    </>
  );
};
