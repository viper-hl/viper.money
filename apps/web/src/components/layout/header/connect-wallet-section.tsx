import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ConnectWalletSection() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <Button size="lg" asChild>
        <Link to="/app/swap">
          Start Trading <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link to="/app/vault">Join Vault</Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link to="/developers">View Docs</Link>
      </Button>
    </div>
  );
}
