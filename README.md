# 🐍 viper

**Hyperliquid 기반 공동 스테이킹 및 수수료 할인 플랫폼**

hyper + VIP -> 고액 스테이킹자만 누릴 수 있던 혜택을 풀(pool) 구조로 확장하여 VIP 경험을 다수 유저가 공유할 수 있게 한다.  
viper는 Hyperliquid의 hype staking 시스템의 높은 진입장벽을 낮추고, 여러 스테이커가 하나의 vault 계정에 모여 수수료 할인 혜택을 공유할 수 있는 플랫폼입니다. vault 계정을 통해 swap 주문을 대행하여 사용자에게 더 저렴한 수수료 환경을 제공하며, 차익 수수료와 스테이킹 이자를 참여자들에게 비율대로 분배합니다.

## 🚀 빠른 시작

### 1. 사전 요구사항

#### pnpm 설치

```bash
# npm을 통해 pnpm 설치
npm install -g pnpm

# 또는 curl을 통해 설치
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 설치 확인
pnpm --version
```

#### PostgreSQL 설치

**macOS (Homebrew 사용):**

```bash
# PostgreSQL 설치
brew install postgresql@17

# PostgreSQL 서비스 시작
brew services start postgresql@17

# PostgreSQL 접속 (기본 사용자로)
psql postgres
```

**Windows:**

- [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 설치 프로그램 다운로드
- 설치 과정에서 비밀번호 설정

### 2. 데이터베이스 설정

PostgreSQL에 접속한 후 데이터베이스를 생성합니다:

```sql
-- 데이터베이스 생성
CREATE DATABASE viper;

-- 사용자 생성 (선택사항)
CREATE USER viper_user WITH ENCRYPTED PASSWORD 'your_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE viper TO viper_user;

-- 접속 확인
\c viper
```

### 3. 프로젝트 설정

#### 환경 변수 설정

`apps/api`와 `apps/web/` 각 폴더안의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하여 환경 변수를 설정합니다.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

#### 의존성 설치

```bash
# 모든 패키지 설치
pnpm install
```

#### 프로젝트 빌드

```bash
# 전체 프로젝트 빌드
pnpm build

# 개별 앱 빌드
pnpm --filter api build
pnpm --filter web build
```

### 4. 애플리케이션 실행

#### 개발 모드로 실행

```bash
# 전체 애플리케이션 실행 (백엔드 + 프론트엔드)
pnpm dev

# 개별 실행
pnpm --filter api dev    # 백엔드만 실행 (포트 4000)
pnpm --filter web dev    # 프론트엔드만 실행 (포트 3000)
```

#### 프로덕션 모드로 실행

```bash
# 빌드 후 실행
pnpm build
pnpm start
```

#### 데이터베이스 초기 세팅

**⚠️ 중요: 최초 실행 시에만 수행**

처음 프로젝트를 실행할 때 데이터베이스 테이블을 자동으로 생성하기 위해 `synchronize: true` 설정을 활성화해야 합니다.

`apps/api/src/app.module.ts` 파일에서 TypeORM 설정을 다음과 같이 수정합니다:

```typescript
// apps/api/src/app.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    ...
    synchronize: true, // ⭐ 최초 실행 시 true로 설정
  }),
  inject: [ConfigService],
}),
```

**📝 주의사항:**

- `synchronize: true`는 엔티티 정의를 기반으로 데이터베이스 스키마를 자동으로 생성/수정합니다
- **프로덕션 환경에서는 절대 사용하지 마세요** (데이터 손실 위험)
- 테이블이 생성된 후에는 `synchronize: false`로 변경해야합니다.

### 5. 접속 확인

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000
- **API 문서**: http://localhost:4000/api/docs (Swagger)

## 📁 프로젝트 구조

```
viper.money/
├── apps/
│   ├── api/                    # NestJS 백엔드
│   │   ├── src/
│   │   └── package.json
│   └── web/                   # Next.js 프론트엔드
│       ├── app/
│       ├── components/        # 공통 컴포넌트
│       └── package.json
├── packages/
│   ├── ui/                    # 공통 UI 컴포넌트 (shadcn/ui)
│   ├── eslint-config/         # ESLint 설정
│   └── typescript-config/     # TypeScript 설정
└── docs/
    └── PRD.md                 # 프로젝트 요구사항 문서
```

## 🎯 주요 기능

### 1. Vault 시스템

- 다수의 사용자가 hype 코인을 공동 스테이킹하여 하나의 vault 계정에서 수수료 할인 혜택 획득
- 스테이킹 수익 및 vault 수수료 차익을 비율에 따라 분배
- staking/un-staking 및 분배 내역 투명 기록

### 2. Swap 모듈

- 사용자 swap 요청 시 vault 계정이 대행 주문 실행
- HyperCore Swap 모듈을 viper에서 래핑하여 호출
- 낮은 수수료로 거래 가능
- vault 계정의 fee discount와 실제 수수료율 차이를 수익화

### 3. 수익 분배

- **스테이킹 이자**: Hyperliquid의 staking reward를 vault 참여자에게 분배
- **차익 수수료**: swap 대행을 통한 fee discount 차익을 vault 참여자에게 비율대로 분배

### 4. 지갑 연결 인증

- 별도 회원가입 없이 지갑 연결을 통한 식별 및 참여
- HyperEVM 지갑 지원

## 📄 페이지 구성

1. **Landing Page (Home)**

   - viper 소개 및 핵심 가치 (VIP 경험 공유)
   - vault 참여/스왑 기능 안내
   - CTA: "Connect Wallet", "Join Vault"

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

## 🛠 기술 스택

**Frontend**

- Next.js 15 with App Router
- Tailwind CSS 4
- shadcn/ui
- Zustand (전역 상태 관리)
- TanStack Query (서버 상태 관리)
- Axios (API 호출)

**Backend**

- NestJS 11
- TypeORM
- PostgreSQL 17
- Passport (인증)

**Blockchain**

- HyperEVM + Corewriter 기반 스마트컨트랙트

**기타**

- Turbo Monorepo
- ESLint + Prettier
- TypeScript

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌 오류**

   ```bash
   # 사용 중인 포트 확인
   lsof -i :3000
   lsof -i :4000

   # 프로세스 종료
   kill -9 <PID>
   ```

2. **데이터베이스 연결 오류**

   - PostgreSQL 서비스가 실행 중인지 확인
   - `.env` 파일의 데이터베이스 설정 확인
   - 데이터베이스와 사용자가 생성되었는지 확인

3. **테이블이 생성되지 않는 경우**

   ```bash
   # app.module.ts에서 synchronize: true 설정 확인
   # 백엔드 재시작
   pnpm --filter api dev
   ```

4. **엔티티 관련 오류**

   - `apps/api/src/` 폴더에 엔티티 파일들이 있는지 확인
   - TypeORM의 `autoLoadEntities: true` 설정이 활성화되어 있는지 확인

## 🌟 브랜드 정보

- **마스코트**: 귀여운 뱀 🐍
- **브랜드 색상**: 살짝 네온빛이 도는 초록색 (#4EF08A)
- **네이밍 의미**: _hyper_ + _VIP_ → 고액 스테이킹자만 누릴 수 있던 혜택을 풀(pool) 구조로 확장하여 VIP 경험을 다수 유저가 공유

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.

---

**Made with 🐍 by viper Team**
