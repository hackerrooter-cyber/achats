import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, User } from "lucide-react";
import { Transaction } from "@/pages/Index";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === "material" 
                    ? "bg-primary/10" 
                    : "bg-secondary/10"
                }`}>
                  {transaction.type === "material" ? (
                    <Package className={`h-4 w-4 ${
                      transaction.type === "material" ? "text-primary" : "text-secondary"
                    }`} />
                  ) : (
                    <User className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {transaction.category && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-destructive">
                  - {transaction.amount.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.type === "material" ? "Matériel" : "Main d'œuvre"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
