import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  totalMaterials: number;
  totalPaidWorkers: number;
}

export const BudgetOverview = ({
  totalBudget,
  totalSpent,
  totalMaterials,
  totalPaidWorkers,
}: BudgetOverviewProps) => {
  const budgetPercentage = (totalSpent / totalBudget) * 100;
  const materialsPercentage = (totalMaterials / totalSpent) * 100;
  const workersPercentage = (totalPaidWorkers / totalSpent) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue d'ensemble du budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget utilisé</span>
            <span className="font-medium">
              {totalSpent.toLocaleString()} FCFA / {totalBudget.toLocaleString()} FCFA
            </span>
          </div>
          <Progress value={budgetPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {budgetPercentage.toFixed(1)}% du budget total
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Matériaux</span>
              <span className="font-medium text-primary">
                {totalMaterials.toLocaleString()} FCFA
              </span>
            </div>
            <Progress value={materialsPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {materialsPercentage.toFixed(1)}% des dépenses
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Main d'œuvre</span>
              <span className="font-medium text-secondary">
                {totalPaidWorkers.toLocaleString()} FCFA
              </span>
            </div>
            <Progress value={workersPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {workersPercentage.toFixed(1)}% des dépenses
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
