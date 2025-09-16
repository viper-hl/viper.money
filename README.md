# 🐍 viper

**Hyperliquid Spot Orderbook Router for EVM DEX Aggregators + LST Vault**

**hyper + VIP →** 고액 스테이킹자만 누리던 혜택과 오더북 기반의 **더 나은 가격/체결 경험**을 풀(pool) 구조로 확장해 **다수 유저가 공유**할 수 있게 합니다.
viper는 **EVM의 DEX Aggregator가 Hyperliquid의 spot 오더북을 라우팅**하도록 돕는 **Router/Wrapper + Core Swap Agent**를 제공하고, 선택적으로 **HYPE 스테이킹 LST(Vault)** 를 통해 수익을 투명 분배합니다.
목표는 **EVM↔Hyper spot 간 시세 괴리(arb 마진) 축소** 및 **일반 사용자의 체감 가격 개선**입니다.

---

## ✨ TL;DR

- **3요소 아키텍처**

  1. **HyperCore Swap Agent**: 페어별 **서브어카운트**로 입금 감지→즉시 스왑→재전송
  2. **HyperEVM Router/Wrapper**(corewriter 기반): `getQuote`/`swapExactIn` 제공 → **Aggregator가 쉽게 통합**
  3. **Viper Vault(LST)**: **HYPE 스테이킹 + 스왑 수익 일부 공유**(선택)

- **사용자 이득 우선**: 프로토콜 캡쳐 수수료(bps)에 \*\*상한(cap)\*\*을 두고, 초과분은 **가격 개선으로 환원**
- **개발자 친화**: ABI/이벤트/예제, `/api/docs` 제공(스웨거), Quote TTL/슬리피지/부분체결 정책 명확화

---

## 🚀 빠른 시작

### 1) 사전 요구사항

- **Node.js** LTS(권장 v18+ / v20+)
- **pnpm**
- **PostgreSQL 17**
- (선택) **HyperEVM RPC** 엔드포인트, 테스트 지갑

#### pnpm 설치

```bash
npm install -g pnpm
# 또는
curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm --version
```

#### PostgreSQL 설치

**macOS(Homebrew)**

```bash
brew install postgresql@17
brew services start postgresql@17
psql postgres
```

**Windows**

- [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 설치 후 비밀번호 설정

### 2) 데이터베이스 설정

```sql
CREATE DATABASE viper;
CREATE USER viper_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE viper TO viper_user;
\c viper
```

### 3) 프로젝트 설정

#### 환경 변수 템플릿 복사

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

#### (권장) 환경 변수 예시

> 실제 키/주소는 상황에 맞게 교체하세요. 절대 저장소에 커밋하지 마세요.

**`apps/api/.env`**

```env
# 서버
NODE_ENV=development
PORT=4000

# DB 접속(둘 중 하나 방식 사용)
DATABASE_URL=postgresql://viper_user:your_password@localhost:5432/viper
# 또는 TypeORM 개별 설정 사용 시:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=viper_user
# DB_PASS=your_password
# DB_NAME=viper

# HyperEVM / Router
HYPER_EVM_RPC_URL=https://<your-hyperevm-rpc>
ROUTER_ADDRESS=0xYourRouterAddress    # 배포 후 입력
VAULT_ADDRESS=0xYourVaultAddress      # (선택) 배포 후 입력
EXECUTOR_PRIVATE_KEY=0x...            # 실행/서명용(보관 주의)

# Quote/실행 파라미터(예시 기본값)
QUOTE_TTL_MS=3000                     # quote 유효시간(ms)
DEFAULT_SLIPPAGE_BPS=50               # 0.50%
MAX_IMPACT_BPS=100                    # 1.00% (체결 충격 상한)
ALLOW_PARTIAL_FILL=false
PAIR_ALLOWLIST=USDC,BTC,ETH           # 지원 페어 토큰 심볼(예시)

# Swagger
SWAGGER_ENABLE=true
```

**`apps/web/.env`**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_CHAIN_ID=XXXX            # HyperEVM 체인ID (배포 후 기입)
NEXT_PUBLIC_ROUTER_ADDRESS=0xYourRouterAddress
# (선택) WalletConnect/Wagmi 등 사용 시
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

#### 의존성 설치 & 빌드

```bash
pnpm install
pnpm build
# 또는 개별
pnpm --filter api build
pnpm --filter web build
```

### 4) 애플리케이션 실행

#### 개발 모드

```bash
pnpm dev
# 또는
pnpm --filter api dev    # 포트 4000
pnpm --filter web dev    # 포트 3000
```

#### 프로덕션 모드

```bash
pnpm build
pnpm start
```

### 5) 데이터베이스 초기 세팅

> ⚠️ **최초 1회만** 수행하고, 이후에는 비활성화 하세요.

`apps/api/src/app.module.ts` TypeORM 설정:

```ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    // ...
    synchronize: true, // ⭐ 최초 실행 시에만 true
    // autoLoadEntities: true, 등
  }),
  inject: [ConfigService],
});
```

- `synchronize: true`는 엔티티 기준으로 스키마를 자동 생성/수정합니다.
- **프로덕션에서는 절대 사용하지 마세요.** 초기 테이블 생성 후에는 `false`로 변경하세요.

### 6) 접속 확인

- **웹**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:4000](http://localhost:4000)
- **API 문서(Swagger)**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 📁 프로젝트 구조

```
viper.money/
├── apps/
│   ├── api/                    # NestJS 백엔드 (Quote Cache/Orchestrator/Indexer)
│   │   ├── src/
│   │   └── package.json
│   └── web/                    # Next.js 프론트엔드 (Landing/Swap/Vault/Profile/Developers)
│       ├── app/
│       ├── components/
│       └── package.json
├── packages/
│   ├── ui/                     # 공통 UI 컴포넌트 (shadcn/ui)
│   ├── eslint-config/
│   └── typescript-config/
└── docs/
    ├── PRD.md                  # (v0.2) Aggregator-first 개정본
    └── INTEGRATION.md          # (선택) 통합 가이드/예제 모음
```

---

## 🎯 핵심 기능

### 1) **HyperEVM Router/Wrapper (스마트컨트랙트)**

- corewriter 응용. **DEX Aggregator 친화적 인터페이스** 제공
- 표준형 메서드(요약):

```solidity
function getQuote(
  address tokenIn,
  address tokenOut,
  uint256 amountIn
) external view returns (
  uint256 amountOut,
  uint32  feeBps,      // 프로토콜 캡쳐 상한
  uint64  validUntil,  // 만료 타임스탬프
  bytes32 quoteId
);

function swapExactIn(
  bytes32 quoteId,
  uint256 amountIn,
  uint256 minAmountOut,
  address receiver,
  bool allowPartialFill
) external payable returns (uint256 amountOut);
```

- **정책**: Quote TTL, 슬리피지 상한, 부분체결 허용 여부를 매개변수로 **거의-원자적 실행** UX 제공
- **이벤트 예시**: `QuoteCreated`, `SwapExecuted`, `SwapPartiallyFilled`, `SwapReverted`, `FeeCaptured`, `Rebalance`

### 2) **HyperCore Swap Agent**

- **페어별 서브어카운트**로 입금 감지 → 정책(IOC/TWAP, 가격 상한, 부분체결 등)에 따라 **즉시 스왑** → **재전송**
- **재고/리스크 관리**: 페어별 체결 충격 상한/최대 체결량/재고 한도, 자동 리밸런싱

### 3) **Viper Vault (LST, 선택)**

- **HYPE 스테이킹 → stHYPE 민팅**
- 수익 원천: (a) 스테이킹 리워드 (b) 스왑 실행 캡쳐 수익 일부 (c) (존재 시) 메이커 리베이트
- **자동화**: Deposit/Withdraw & Stake/Unstake를 corewriter로 처리, 분배 투명화

---

## 🧩 Aggregator 통합 가이드 (요약)

1. **Router 주소/체인ID** 확인
2. **`getQuote`** 호출 → `(amountOut, feeBps, validUntil, quoteId)` 수신
3. Quote 유효시간 내에 **`swapExactIn`** 실행 (`minAmountOut`/`allowPartialFill` 정책 적용)
4. 체결 성공 시 **receiver**가 `tokenOut` 수령

**TypeScript 예시**

```ts
import { Contract, Wallet, JsonRpcProvider } from "ethers";
import RouterABI from "./abi/ViperRouter.json";

const provider = new JsonRpcProvider(process.env.HYPER_EVM_RPC_URL!);
const signer = new Wallet(process.env.EXECUTOR_PRIVATE_KEY!, provider);
const router = new Contract(process.env.ROUTER_ADDRESS!, RouterABI, signer);

const amountIn = BigInt("1000000"); // 1e6(토큰 소수점 기준 예시)
const q = await router.getQuote(tokenIn, tokenOut, amountIn);

if (Date.now() / 1000 > Number(q.validUntil)) throw new Error("QUOTE_EXPIRED");

const minOut = (q.amountOut * 995n) / 1000n; // 0.5% 슬리피지 예시
const tx = await router.swapExactIn(
  q.quoteId,
  amountIn,
  minOut,
  receiver,
  false,
);
const rc = await tx.wait();
console.log("SwapExecuted:", rc?.transactionHash);
```

> 상세 통합 문서는 `/api/docs` 및 `docs/INTEGRATION.md`(선택)에 정리합니다.

---

## 🖥 페이지 구성

1. **Landing**: 핵심 가치(“Aggregator에게 더 좋은 가격”), 3요소 아키텍처, CTA
2. **Swap**: 데모용 스왑 UI(가격 비교, 예상 슬리피지, 체결 내역)
3. **Vault**: 누적 스테이킹/수익, 내 지분/분배, stake/unstake, claim
4. **Profile**: 지갑별 참여 이력, 보상 내역
5. **Developers**: ABI/이벤트/예제/상태 페이지 링크

---

## 🛠 기술 스택

**Frontend**

- Next.js 15(App Router), Tailwind CSS 4, shadcn/ui
- Zustand(전역 상태), TanStack Query(서버 상태), Axios

**Backend**

- NestJS 11
- TypeORM + PostgreSQL 17
- (모듈) Quote Cache/Simulator, Execution Orchestrator, Indexer(API/Swagger)

**Blockchain**

- **HyperEVM + corewriter 기반 Router/Wrapper**
- **HyperCore** 서브어카운트 기반 Swap Agent

**기타**

- Turbo Monorepo, ESLint + Prettier, TypeScript

---

## 📈 수수료/수익 모델(요약)

- **프로토콜 캡쳐 bps 상한** 설정(예: `0 ~ X bps`)
- 상한을 넘어선 가격 개선분은 **모두 사용자 가격에 반영**
- 수익 귀속: 프로토콜/운영자/Vault(거버넌스 파라미터로 조정)

---

## 🔒 보안·리스크·정책

- **Quote TTL** 짧게 유지(예: 2–5초), 만료 시 실행 불가
- **슬리피지/가격 상한** 엄격 적용, 초과 시 전체 revert(또는 부분체결 허용 시 잔량 revert)
- **재고/충격 한도** 초과 시 페어 일시 제한 및 자동 리밸런싱
- **키 보관**: `EXECUTOR_PRIVATE_KEY`는 안전한 비밀 관리(예: Vault/Secret Manager)

---

## 🐛 문제 해결

1. **포트 충돌**

   ```bash
   lsof -i :3000
   lsof -i :4000
   kill -9 <PID>
   ```

2. **DB 연결 실패**

   - PostgreSQL 서비스 실행/접속 정보(.env) 확인
   - 사용자/DB 생성 여부 확인

3. **테이블 미생성**

   ```bash
   # app.module.ts에서 synchronize: true (최초 1회)
   pnpm --filter api dev
   ```

4. **엔티티 오류**

   - `apps/api/src/` 엔티티 파일 존재 여부
   - `autoLoadEntities: true` 확인

5. **스왑 실행 오류(예시)**

   - `QUOTE_EXPIRED`: TTL 초과 → 새 quote 요청
   - `SLIPPAGE_EXCEEDED`: `minAmountOut` 재설정
   - `INVENTORY_LIMIT`: 한도 완화 대기 또는 소액 분할

---

## 🧭 아키텍처(요약)

```
Aggregator ↔ Viper Router (HyperEVM, SC)
                │  getQuote()/swapExactIn()
                ▼
         corewriter Bridge
                ▼
        HyperCore Swap Agent
      (pair-scoped subaccounts)
                │  IOC/TWAP fills
                ▼
          Receiver (tokenOut)
                │
          Events/Accounting → Indexer/DB → Vault Distribution
```

---

## 🌟 브랜드

- **마스코트**: 귀여운 뱀 🐍
- **브랜드 색상**: 네온 그린(#4EF08A)
- **네이밍**: _hyper_ + _VIP_ → VIP 경험을 다수 유저가 공유

---

## 📞 지원

문제가 발생하거나 제안이 있다면 **Issues**에 등록해주세요.
통합 파트너(Aggregator) 문의는 별도 채널로 안내드립니다.

---

**Made with 🐍 by viper Team**
