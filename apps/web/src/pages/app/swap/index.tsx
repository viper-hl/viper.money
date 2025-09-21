import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpDown,
  ExternalLink,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useSwapStore } from "@/store";

// ---- Dummy token meta & pricing -------------------------------------------
const TOKENS = [
  {
    symbol: "ETH",
    name: "Ether",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "ULTRA",
    name: "Ultrasolid Token (demo)",
    address: "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
    decimals: 18,
    logo: "https://avatars.githubusercontent.com/u/141912887?s=200&v=4",
  },
] as const;

const MOCK_USD: Record<string, number> = {
  ETH: 2700,
  USDC: 1,
  USDT: 1,
  ULTRA: 2.1,
};

// ---- Local helpers ---------------------------------------------------------
const fmt = (n?: string | number, d = 6) => {
  const x = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(x)) return "0";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: d }).format(
    x
  );
};

const nowISO = () => new Date().toISOString();

// ---- Types -----------------------------------------------------------------
type SwapHistoryItem = {
  id: string;
  timeISO: string;
  tokenIn: string; // symbol
  tokenOut: string; // symbol
  amountIn: string;
  amountOut: string;
  status: "success" | "pending" | "failed";
  txHash?: string; // optional
};

export default function SwapPage() {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    slippageTolerance,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    swapTokens,
  } = useSwapStore();

  const [isSwapping, setIsSwapping] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [tempSlip, setTempSlip] = useState<number>(
    ((slippageTolerance ?? 50) as number) / 100
  );
  const [slippagePct, setSlippagePct] = useState<number>(
    ((slippageTolerance ?? 50) as number) / 100
  );
  const [history, setHistory] = useState<SwapHistoryItem[]>([]);

  // Token selector modal state
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TOKENS;
    return TOKENS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
    );
  }, [search]);

  // Local preview: if store's amountOut가 비어있으면 더미 환율로 계산
  const previewOut = useMemo(() => {
    if (amountOut) return amountOut;
    if (!tokenIn || !tokenOut) return "";
    const pin = MOCK_USD[tokenIn] ?? 0;
    const pout = MOCK_USD[tokenOut] ?? 0;
    const ain = Number(amountIn || 0);
    const gross = pout ? (ain * pin) / pout : 0;
    const impact = Math.min(3, Math.max(0.03, ain * 0.02)) / 100; // 데모용
    const fee = 0.001; // 10bps 데모
    const net = gross * (1 - impact) * (1 - fee);
    return net > 0 ? String(net) : "";
  }, [amountIn, amountOut, tokenIn, tokenOut]);

  const canSwap = useMemo(
    () =>
      Boolean(
        tokenIn && tokenOut && amountIn && Number(amountIn) > 0 && !isSwapping
      ),
    [tokenIn, tokenOut, amountIn, isSwapping]
  );

  const handleSwap = async () => {
    if (!canSwap) return;
    setIsSwapping(true);

    // Front-only demo: pretend to swap and push a history row
    const id = crypto?.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const pending: SwapHistoryItem = {
      id,
      timeISO: nowISO(),
      tokenIn: tokenIn || "?",
      tokenOut: tokenOut || "?",
      amountIn: amountIn || "0",
      amountOut: previewOut || "0",
      status: "pending",
    };
    setHistory((h) => [pending, ...h]);

    // TODO: 실제 스왑 로직 연결 (aggregator SDK/API)
    setTimeout(() => {
      setIsSwapping(false);
      setHistory((h) =>
        h.map((row) =>
          row.id === id
            ? { ...row, status: "success", txHash: "0x" + id.slice(0, 16) }
            : row
        )
      );
    }, 1100);
  };

  const rateText = useMemo(() => {
    if (!tokenIn || !tokenOut) return "--";
    const r =
      (MOCK_USD[tokenIn] ?? 0) / Math.max(MOCK_USD[tokenOut] ?? 0, 1e-9);
    return `1 ${tokenIn} ≈ ${fmt(r, 6)} ${tokenOut}`;
  }, [tokenIn, tokenOut]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-black text-white p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Swap Card */}
        <Card className="rounded-3xl border border-neutral-800/60 bg-neutral-950/60 shadow-2xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Swap</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              title="Settings"
              onClick={() => setOpenSettings(true)}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>From</span>
                <span>Balance: --</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <Input
                  placeholder="0.0"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="flex-1 bg-transparent text-right text-2xl font-semibold"
                />
                <Button
                  variant="outline"
                  className="min-w-24 cursor-pointer"
                  onClick={() => setOpenIn(true)}
                >
                  {tokenIn || "Select"}
                </Button>
              </div>
            </div>

            {/* Switch */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={swapTokens}
                className="rounded-full border border-neutral-700 bg-neutral-900 hover:border-neutral-600"
                title="토큰 맞바꾸기"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>To</span>
                <span>Balance: --</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <Input
                  placeholder="0.0"
                  value={previewOut}
                  readOnly
                  className="flex-1 bg-transparent text-right text-2xl font-semibold"
                />
                <Button
                  variant="outline"
                  className="min-w-24 cursor-pointer"
                  onClick={() => setOpenOut(true)}
                >
                  {tokenOut || "Select"}
                </Button>
              </div>
            </div>

            {/* Quote / meta */}
            {amountIn && (previewOut || amountOut) ? (
              <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span className="text-amber-400">~0.01%</span>
                </div>

                <div className="flex justify-between">
                  <span>Rate</span>
                  <span>{rateText}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage</span>
                  <span>{slippagePct}%</span>
                </div>
              </div>
            ) : null}

            <Button
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-semibold text-black"
              onClick={handleSwap}
              disabled={!canSwap}
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </Button>
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="rounded-3xl border border-neutral-800/60 bg-neutral-950/60">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">History</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistory([])}
              disabled={!history.length}
              className="cursor-pointer"
            >
              <Trash2 className="mr-1 h-4 w-4" /> Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[34%]">Time</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead className="text-right">In</TableHead>
                    <TableHead className="text-right">Out</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-neutral-500"
                      ></TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs text-neutral-400">
                          {new Date(h.timeISO).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {h.tokenIn} → {h.tokenOut}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {fmt(h.amountIn)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {fmt(h.amountOut)}
                        </TableCell>
                        <TableCell className="text-right">
                          {h.status === "success" ? (
                            <a
                              className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                              href={
                                h.txHash
                                  ? `https://etherscan.io/tx/${h.txHash}`
                                  : undefined
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              success <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : h.status === "pending" ? (
                            <span className="text-amber-400">pending</span>
                          ) : (
                            <span className="text-red-400">failed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Settings </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-neutral-400">
                Slippage tolerance(%)
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={Number.isFinite(tempSlip) ? String(tempSlip) : "0"}
                  onChange={(e) =>
                    setTempSlip(Math.max(0, Number(e.target.value)))
                  }
                  className="flex-1"
                />
                <div className="grid grid-cols-3 gap-2">
                  {[0.1, 0.5, 1].map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => setTempSlip(v)}
                      className="cursor-pointer"
                    >
                      {v}%
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setOpenSettings(false)}
                  className="cursor-pointer"
                >
                  Cancle
                </Button>
                <Button
                  onClick={() => {
                    setSlippagePct(tempSlip);
                    // @ts-ignore
                    if ((useSwapStore as any)().setSlippageTolerance) {
                      // @ts-ignore
                      (useSwapStore as any)().setSlippageTolerance(
                        Math.round(tempSlip * 100)
                      );
                    }
                    setOpenSettings(false);
                  }}
                  className="cursor-pointer"
                >
                  Confirm
                </Button>
              </div>
              <p className="text-xs text-neutral-500"></p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Token Select Dialogs */}
      <Dialog open={openIn} onOpenChange={setOpenIn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Token(From)</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
            <Search className="h-4 w-4 text-neutral-500" />
            <Input
              placeholder="심볼/주소 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent"
            />
          </div>
          <div className="max-h-80 overflow-auto rounded-xl border border-neutral-800">
            {filteredTokens.map((t) => (
              <button
                key={t.address}
                className="flex w-full items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-900 cursor-pointer"
                onClick={() => {
                  setTokenIn?.(t.symbol);
                  setOpenIn(false);
                  setSearch("");
                }}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="h-6 w-6 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-semibold">{t.symbol}</div>
                    <div className="text-[11px] text-neutral-500">{t.name}</div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {t.address.slice(0, 6)}…{t.address.slice(-4)}
                </div>
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="p-6 text-center text-sm text-neutral-500">
                No results found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openOut} onOpenChange={setOpenOut}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Token(To)</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
            <Search className="h-4 w-4 text-neutral-500" />
            <Input
              placeholder="심볼/주소 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent"
            />
          </div>
          <div className="max-h-80 overflow-auto rounded-xl border border-neutral-800">
            {filteredTokens.map((t) => (
              <button
                key={t.address}
                className="flex w-full items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-900 cursor-pointer"
                onClick={() => {
                  setTokenOut?.(t.symbol);
                  setOpenOut(false);
                  setSearch("");
                }}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="h-6 w-6 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-semibold">{t.symbol}</div>
                    <div className="text-[11px] text-neutral-500">{t.name}</div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {t.address.slice(0, 6)}…{t.address.slice(-4)}
                </div>
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="p-6 text-center text-sm text-neutral-500">
                No results found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
