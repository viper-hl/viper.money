# **PRD – viper**

## 1. 프로젝트 개요

- **프로젝트명**: viper

- **네이밍 의미**: _hyper_ + _VIP_ → 고액 스테이킹자만 누릴 수 있던 혜택을 풀(pool) 구조로 확장하여 VIP 경험을 다수 유저가 공유할 수 있게 한다는 뜻.

- **목표**:

  - Hyperliquid의 _hype staking_ 시스템의 높은 진입장벽을 낮추고, 여러 스테이커가 하나의 vault 계정에 모여 수수료 할인 혜택을 공유.
  - vault 계정을 통해 swap 주문을 대행, 사용자에게 더 저렴한 수수료 환경을 제공.
  - viper는 중간에서 차익 수수료를 수취하고, 이를 스테이커들에게 비율대로 분배.
  - staking 자체의 이자도 자동 분배.
  - HyperEVM 상에서 corewriter를 응용한 스마트컨트랙트 래핑을 통해 Hyperliquid 생태계 확장에 기여.

- **마스코트**: 귀여운 뱀

- **브랜드 색상**: 살짝 네온빛이 도는 초록색 (#4EF08A 근사치)

---

## 2. 주요 기능

### (1) Vault 시스템

- 다수의 사용자가 hype 코인을 공동 스테이킹 → 하나의 vault 계정에서 수수료 할인 혜택 획득.
- 스테이킹 수익 및 vault 수수료 차익을 비율에 따라 분배.
- staking/un-staking 및 분배 내역은 투명하게 기록.

### (2) Swap 모듈

- 사용자가 swap을 요청하면 vault 계정이 대행 주문 실행.
- HyperCore Swap 모듈을 viper에서 랩핑하여 호출.
- 사용자 입장에서는 낮은 수수료로 거래 가능.
- viper는 vault 계정의 fee discount와 실제 수수료율 차이를 수익화.

### (3) 수익 분배

- **스테이킹 이자**: Hyperliquid의 staking reward를 vault 참여자에게 분배.
- **차익 수수료**: swap 대행을 통한 fee discount 차익을 vault 참여자에게 비율대로 분배.

### (4) 사용자 인증

- 별도 회원가입 없음.
- 지갑 연결을 통한 식별 및 참여.

---

## 3. 페이지 구성

1. **Landing Page (Home)**

   - viper 소개 및 핵심 가치 (VIP 경험 공유)
   - vault 참여/스왑 기능 안내
   - CTA: “Connect Wallet”, “Join Vault”

2. **Swap Page**

   - vault 계정을 통한 대행 swap UI
   - 현재 수수료율 및 할인율 표시
   - 예상 슬리피지 및 체결내역 확인

3. **Vault Page**

   - vault 총 스테이킹 수량, 달성한 할인율, 누적 수익
   - 내 지분/수익 현황 (staking, 차익 분배, 이자 분배)
   - staking / unstaking 기능

4. **Profile Page**

   - 지갑별 참여 이력 조회
   - vault 보유 지분, 예상 분배 수익 표시
   - claim 가능한 보상 내역

---

## 4. 기술 스택

- **Frontend**: Next.js, Tailwind CSS 4, shadcn, Zustand, TanStack Query, Axios
- **Backend**: Nest.js
- **Database**: PostgreSQL 17
- **Blockchain**: HyperEVM + Corewriter 기반 스마트컨트랙트
- **기타**: Turbo Monorepo

---

## 5. 기대 효과

- **사용자 입장**:

  - 고액 스테이킹 없이도 낮은 수수료 혜택을 누림.
  - 수수료 차익 및 staking reward를 분배받아 추가 수익.

- **Hyperliquid 생태계 입장**:

  - HyperEVM 상에서 swap 모듈 래핑 제공 → 생태계 확장.
  - 더 많은 사용자가 hype staking 및 swap 기능에 참여.

- **서비스 운영자 입장**:

  - 수수료 차익 일부를 수익화.
  - viper 브랜드 확립 (Web3 + 귀여운 뱀 마스코트).

---

## 6. TODO (파트별)

### Frontend

- [ ] Landing, Swap, Vault, Profile UI 구현
- [ ] Wallet connect 기능 (HyperEVM 지갑 지원)
- [ ] 수익/지분 실시간 반영 대시보드

### Backend

- [ ] Vault 참여/해지 API
- [ ] 분배 로직 구현 (staking 이자 + 수수료 차익)
- [ ] PostgreSQL DB 스키마 설계 (Vault, User, Swap 기록)
- [ ] Hyperliquid API 연동

### Smart Contract

- [ ] Corewriter 기반 HyperCore Swap 모듈 래핑 컨트랙트 작성
- [ ] Vault 관리 스마트컨트랙트 (입금/출금/분배)
- [ ] 이벤트 로그 → 백엔드 연동
