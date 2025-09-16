'use client';

import { Button } from '@workspace/ui/components/button';
import { LogOut } from 'lucide-react';
import { useDisconnect } from 'wagmi';

export function LogoutButton() {
  const { disconnect } = useDisconnect();

  return (
    <Button variant="ghost" size="sm" onClick={() => disconnect()}>
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
