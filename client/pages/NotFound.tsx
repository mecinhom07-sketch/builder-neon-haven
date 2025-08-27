import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-restaurant-orange/10 to-restaurant-warm/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl mb-4">🍔</div>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
          <CardDescription>
            Ops! Esta página não existe no nosso cardápio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full restaurant-gradient">
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Página Anterior
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
