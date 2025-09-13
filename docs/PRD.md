# PRD – viper (v0.2, Aggregator-First 개정본)

## 1. 프로젝트 개요

- **프로젝트명**: viper
- **네이밍 의미**: *hyper* + *VIP* → VIP 수준의 가격·체결 경험을 다수 사용자에게 확장.
- **브랜드**: 마스코트—귀여운 뱀, 메인 컬러—네온 그린(#4EF08A 근사치)

### 1.1 미션(개정)

- **EVM의 DEX Aggregator가 Hyperliquid의 spot 오더북을 원활히 라우팅**하도록 **Router/Wrapper + Core Swap Agent**를 제공한다.
- EVM과 Hyper spot 간 **가격 괴리/기회비용을 최소화**하고, 기존 **아비트라지 유저가 취하던 이익을 가격 개선** 형태로 일반 사용자에게 환원한다.
- 선택적으로 **Vault(LST)** 를 통해 프로토콜 수익 일부를 스테이커와 **투명하게 공유**한다.

### 1.2 핵심 가치

- **더 좋은 가격**: 오더북 기반 가격·체결로 AMM 단독 대비 유리한 경우를 적극 라우팅.
- **접근성**: Aggregator가 바로 붙일 수 있는 **간단한 인터페이스**.
- **투명성**: quote·슬리피지·수수료 구조를 온체인/오프체인에서 가시화.
- **협력적 생태계 확장**: HyperEVM–HyperCore 간 유틸리티 확대.

---

## 2. 제품 아키텍처

### 2.1 구성요소 (3-레그)

1. **HyperCore Swap Agent (오프체인 실행 로직 + Core 계정)**
- **페어별 서브어카운트** 다중 생성(예: `BTC/USDC: subA, subB…`)하여 **병렬 처리·리스크 격리**.
- **입금 감지 → 즉시 스왑 → 재전송** 파이프라인.
- **주문 정책**:
    - **IOC**(즉시체결) 기본, **TWAP**(대량/저영향) 옵션.
    - **가격 한도**(limit/impact cap), **부분체결 허용 여부**, **유효시간**.
- **재고/리밸런싱**:
    - 양측 재고 불균형 시 반대 방향 미니-TWAP 또는 외부 라우트로 **자동 리밸런싱**.
    - 재고·위험 한도 초과 시 신규 quote **일시 제한**.
1. **HyperEVM Router/Wrapper (스마트컨트랙트, corewriter 연동)**
- **표준 인터페이스(권장 초안)**
    
    ```solidity
    function getQuote(
      address tokenIn,
      address tokenOut,
      uint256 amountIn
    )
    external view
    returns (
      uint256 amountOut,     // 예상 수령량(수수료 반영)
      uint32  feeBps,        // 프로토콜 캡쳐 bps (상한)
      uint64  validUntil,    // quote 만료 시각
      bytes32 quoteId        // 실행 시 참조
    );
    
    function swapExactIn(
      bytes32 quoteId,
      uint256 amountIn,
      uint256 minAmountOut,
      address receiver,
      bool allowPartialFill // 부분체결 허용 여부
    )
    external payable returns (uint256 amountOut);
    
    ```
    
- **특징**
    - corewriter를 통해 **HyperCore Swap Agent에 실행 명령**.
    - **거의-원자적 실행** UX: 만료·슬리피지·부분체결 정책을 엄격 적용.
    - **Permit(2612)/Permit2** 지원(가스·승인 UX 개선).
    - **이벤트**: `QuoteCreated`, `SwapExecuted`, `SwapPartiallyFilled`, `SwapReverted`, `FeeCaptured`, `Rebalance` 등.
1. **Viper Vault (선택)**
- **HYPE 스테이킹 LST(stHYPE)** 발행(1:1 누적형), 수익 원천:
    - (a) Hyper staking reward
    - (b) 스왑 실행 차익(프로토콜 fee 캡쳐분 일부)
    - (c) 메이커 리베이트(존재 시)
- **자동화**: Deposit/Withdraw/Stake/Unstake를 corewriter로 **원클릭**.
- **분배**: 주기적 claim 또는 auto-compound(옵션).

### 2.2 데이터·서비스 계층

- **Quote Cache & Simulator**
    - 오더북 스냅샷, 수수료, 충돌 위험(동시성) 반영해 **ms~초 단위**로 `getQuote` 결과 예측.
    - **유효시간(validUntil)** 짧게 설정(예: 2–5초)으로 stale quote 방지.
- **Execution Orchestrator**
    - 페어·서브어카운트별 **동시성 큐**, 재시도·부분체결 처리.
- **Risk/Limit Manager**
    - 페어별 **최대 체결가 변동, 최대 충격 bps, 최대 체결량** 등 정책.
- **Accounting**
    - 수익·수수료·분배·재고·실패 로그 **불변 원장** 기록(PostgreSQL + 이벤트 인덱서).

---

## 3. 사용자 및 통합 플로우

### 3.1 Aggregator 라우팅 플로우(권장)

1. Aggregator → `getQuote(tokenIn, tokenOut, amountIn)` 호출
2. viper Router → `amountOut/feeBps/validUntil/quoteId` 반환
3. Aggregator → 사용자 주문에서 viper 루트 선택 시 `swapExactIn(...)` 실행
4. Router → corewriter → HyperCore Swap Agent 실행
5. 체결 성공 시 **`receiver`*로 `tokenOut` 전송, 이벤트 발생
6. 실패/만료/슬리피지 초과 시 **전체 revert**(또는 부분체결 허용 시 부분 체결 후 잔량 revert)

### 3.2 Direct-Deposit 모드(보조)

- 특정 파트너/OTC 상황: **서브어카운트 입금 감지 → 스왑 → 지정 주소 반환**의 **비원자적** 경로.
- 주의: Aggregator와의 일반 통합에는 **Router 모드 권장**.

---

## 4. 주요 기능

### 4.1 Swap 모듈 (개정)

- **HyperCore Swap Agent**는 **서브어카운트 단위**로 운용.
- **입금되는 즉시** 설정된 정책(IOC/TWAP, 가격 상한, 부분체결 등)으로 스왑, **지정 주소**로 재전송.
- **HyperEVM Router**가 상부에서 **quote/실행/정산**을 통합 관리.

### 4.2 Vault 시스템 (보완)

- 다수 사용자가 **HYPE 스테이킹** 참여 → **stHYPE** 수령.
- 스테이킹 이자 + 스왑 수익 일부 **비율 분배**.
- staking/un-staking/분배는 **온체인 이벤트로 투명 공개**.

### 4.3 수익 분배/수수료 모델 (개정)

- **프로토콜 캡쳐 bps**: `0 ~ X bps` **상한** 설정(기본값 보수적).
- 캡쳐 상한을 초과하는 가격 개선분은 **전부 사용자 가격으로 환원**.
- **Vault 공유율**: 캡쳐분의 일부를 Vault에 귀속(거버넌스 파라미터).

### 4.4 개발자 경험(DX)

- **ABI + 예제 스니펫 + SDK(@viper/router-sdk)**
- **테스트넷 배포** 주소, 체인ID, Faucet 안내.
- **Diagnostics**: `getHealth()`, `getPairStatus()`, `getInventoryState()` 뷰 함수.

---

## 5. 페이지 구성 (개정)

1. **Landing**
    - “**Aggregator에게 더 좋은 가격**을” — 핵심 가치 및 구조(3요소) 소개
    - CTA: “Connect Wallet”, “Join Vault”, “View Docs”
2. **Swap**
    - End-user 데모용(가격 비교, 예상 슬리피지, 체결내역)
3. **Vault**
    - 누적 스테이킹/수익, 내 지분/분배, stake/unstake, claim
4. **Profile**
    - 지갑별 참여 이력, 보상 내역
5. **Developers(신규)**
    - ABI, 예제, 이벤트, 통합 가이드, 요금정책, 상태 페이지 링크

---

## 6. 기술 스택 (유지 + 보완)

- **Frontend**: Next.js, Tailwind CSS 4, shadcn, Zustand, TanStack Query, Axios
- **Backend**: Nest.js (Quote Cache, Orchestrator, Indexer API)
- **DB**: PostgreSQL 17 (스왑, quote, 분배, 재고, 이벤트 인덱스)
- **Blockchain**: **HyperEVM + corewriter 연동 컨트랙트**, HyperCore 계정(서브어카운트)
- **Repo**: Turbo Monorepo
- **SDK**: `@viper/router-sdk` (TS)

---

## 7. 보안/리스크/장애 대응

- **Quote 만료(validUntil)** 짧게(예: 2–5초). 만료 시 실행 거부.
- **슬리피지/가격 상한** 강제. 초과 시 전체 revert(또는 allowPartialFill=true일 때 부분체결).
- **재고 한도** 초과 시 해당 페어 일시 비활성화 및 재밸런싱 큐 처리.
- **권한·롤**: Router 관리자(파라미터), Fee 수취지갑, Vault 분배자(자동·신뢰 최소화).
- **메트릭**: 실패율, 부분체결률, 리밸런싱 비용, 사용자 체감 가격 개선 bps.
- **모니터링**: 체결 지연, 오더북 급변, 동시성 충돌 알림.

---

## 8. 성공 지표(KPI)

- Aggregator **통합 수** / 활성 통합 수
- **라우팅 체결량(USD)**, 평균 **가격 개선(bps)**
- **실패율/부분체결율**(목표 하방)
- Vault **TVL**, 분배 APR(정보 제공용)

---

## 9. 오픈 파라미터(거버넌스/운영상)

- 프로토콜 fee **caps (bps)**
- 페어별 **최대 체결량**, **충격 한도**, **부분체결 허용** 기본값
- Vault **수익 공유율** 및 분배 주기

---

## 10. TODO (파트별)

### Smart Contract

- [ ]  **Router/Wrapper**: `getQuote`, `swapExactIn`, `Permit(2612)/Permit2` 지원
- [ ]  **이벤트/에러 코드** 표준화, 체인링크 등 외부 의존 X(초기)
- [ ]  **Vault(stHYPE)**: 민팅/소각, 수익 집계·분배 로직, 안전장치(긴급 정지)

### Backend

- [ ]  **Quote Cache/Simulator**: 오더북 스냅샷·수수료·동시성 반영
- [ ]  **Execution Orchestrator**: 페어/서브어카운트 큐, 재시도/리밸런싱
- [ ]  **Indexer**: 온체인 이벤트 → DB 동기화, 정산 리포트
- [ ]  **Partner API**: 상태/메트릭·헬스체크 엔드포인트

### Frontend

- [ ]  Landing/Swap/Vault/Profile/Developers 페이지
- [ ]  WalletConnect(HyperEVM)
- [ ]  가격 개선·분배 현황 대시보드

### Integrations

- [ ]  SDK/문서화: 1inch/ParaSwap/Odos 스타일 **플러그인 가이드**
- [ ]  테스트넷 파트너 PoC

---

## 11. 예시 인터페이스(요약)

```solidity
// View: 견적
getQuote(tokenIn, tokenOut, amountIn)
 -> (amountOut, feeBps, validUntil, quoteId)

// Execute: 원자적(또는 부분체결 허용) 실행
swapExactIn(quoteId, amountIn, minAmountOut, receiver, allowPartialFill)
 -> amountOut

// Vault(LST)
depositHYPE(amount) -> mint stHYPE
withdrawHYPE(shares) -> burn stHYPE
claimRewards() -> HYPE or stHYPE

```

---

## 12. 열린 이슈(Assumptions & Risks)

- **HyperEVM↔Core 트랜잭션 원자성**: corewriter 호출과 체결 확정의 타이밍을 어떻게 UX 상 **원자성에 가깝게** 보장할지(만료·슬리피지로 통제).
- **메이커/리베이트 가용성**: 정책 변화 시 캡쳐·분배 구조 재조정 필요.
- **대형 체결의 충격 관리**: TWAP·부분체결 전략의 기본값 튜닝.
- **재고 리밸런싱 비용**: 빈도/임계값·외부 유동성 활용 정책 수립.

---

### 간단 아키텍처(텍스트 다이어그램)

```
Aggregator ↔ Viper Router (HyperEVM, SC)
                │  getQuote()/swapExactIn()
                ▼
         Corewriter Bridge
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
