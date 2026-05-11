비트코인이 어떤 방식으로 채굴되는지 자세히 아는 사람이 몇명이나 되겠어요?
Bitcoin 프로젝트의 소스 분석을 AI에게 요청하여 여러분의 궁금증을 해결해드리겠습니다.

---

**나:** 프로그램 소스 분석해줘

> **Claude:** Bitcoin Core 소스 구조를 파악해볼게요.
> **Claude:** Bitcoin Core v31.99.0 소스입니다. 주요 내용을 정리해드릴게요.

---

| 디렉토리 | 역할 |
| --- | --- |
| src/ | 메인 C++ 소스 (핵심 로직 전부) |
| test/ | Python 기반 통합/기능 테스트 |
| cmake/ | 빌드 설정 모듈 |
| ci/ | CI/CD 인프라 |
| depends/ | 의존성 관리 |
| doc/ | 문서 |

---

핵심 서브시스템 (src/ 내부)

1.합의 엔진 (consensus/)

•비트코인 프로토콜 규칙 — 절대 변경 불가한 영역

•트랜잭션 검증, 서명 확인, 스크립트 실행

2.블록체인 검증 (validation.h/cpp)

•블록/트랜잭션 검증 파이프라인

•UTXO 데이터베이스 관리

•체인 재구성(reorg) 처리

3.P2P 네트워킹 (net.h/cpp, net_processing.h/cpp)

•피어 연결/관리, 메시지 직렬화

•블록/트랜잭션 릴레이

•Compact Block (BIP 152) 지원

4.메모리풀 (txmempool.h/cpp)

•미확인 트랜잭션 캐시

•CPFP(Child-Pays-For-Parent) 수수료 계산

•패키지 검증

5.지갑 (wallet/, 83개 파일)

•UTXO 추적, 트랜잭션 생성/서명

•HD 지갑 (BIP32/44), 디스크립터 기반

•하드웨어 지갑 외부 서명 지원

6.RPC 인터페이스 (rpc/, 28개 파일)

•JSON-RPC 2.0 서버

•200개 이상의 RPC 메서드

7.Qt GUI (qt/, 250개 이상 파일)

•지갑 UI, 주소록, 트랜잭션 내역

•UTXO 코인 컨트롤

---

아키텍처 특징

•빌드 시스템: CMake (C++20 필수)

•데이터베이스: LevelDB (UTXO/블록 인덱스) + SQLite (지갑)

•멀티프로세스 모드: bitcoin-node / bitcoin-gui / bitcoin-wallet 분리 실행 (Cap'n Proto IPC)

•커널 라이브러리: 합의 로직을 독립 라이브러리로 분리하는 실험적 기능 (src/kernel/)

•인터페이스 추상화: GUI/지갑이 노드 내부를 직접 참조하지 않고 src/interfaces/를 통해 접근

---

테스트 인프라

•단위 테스트: Boost Test (150개 이상)

•기능 테스트: Python으로 실제 bitcoind 인스턴스 띄워서 RPC/P2P 테스트 (150개 이상)

•퍼즈 테스트: LibFuzzer, OSS-Fuzz 지원

•정적 분석: Clang-tidy, 린트 스크립트

---

전체 코드 규모는 약 150만 줄 이상으로 추정됩니다. 특정 컴포넌트를 더 자세히 분석해드릴까요?
**나:** 프로그램을 실행하면 어떤 순서로 진행되는지 분석해줘
> **Claude:** Bitcoin Core의 시작 흐름을 추적해볼게요. 진입점부터 읽어가겠습니다.

Bitcoin Core (bitcoind) 시작 실행 순서
1단계: main() — bitcoind.cpp:262
 MAIN_FUNCTION
  ├── MakeNodeInit()         // NodeContext 객체 생성 (node 컨텍스트 루트)
  ├── SetupEnvironment()     // 로케일, 파일 디스크립터 설정
  ├── noui_connect()         // 시그널 핸들러(UI 없는 콘솔 출력) 연결
  ├── ParseArgs()            // 커맨드라인 + bitcoin.conf 파싱
  ├── ProcessInitCommands()  // -help/-version이면 출력 후 즉시 종료
  └── AppInit()              // 실제 초기화 진입

---

2단계: AppInit() — bitcoind.cpp:168

AppInit()
  ├── InitLogging()                  // debug.log 설정
  ├── InitParameterInteraction()     // 파라미터 충돌/의존 처리
  ├── AppInitBasicSetup()            // [Step 1] 기본 설정
  │     ├── SetupNetworking()        //   소켓 초기화 (WSAStartup on Windows)
  │     └── registerSignalHandler()  //   SIGTERM, SIGINT, SIGHUP 핸들러
  ├── AppInitParameterInteraction()  // [Step 2-3] 파라미터 검증
  ├── kernel::Context 생성           // 커널 컨텍스트 (SHA256 디스패치 등)
  ├── ECC_Context 생성               // secp256k1 타원곡선 암호화 초기화
  ├── AppInitSanityChecks()          // [Step 4] 정상성 검사 (ECC 검증 등)
  ├── fork_daemon()                  // -daemon 옵션 시 백그라운드 프로세스 분리
  ├── AppInitLockDirectories()       // 데이터 디렉토리 잠금 (중복 실행 방지)
  ├── AppInitInterfaces()            // Chain/Mining 인터페이스 생성
  └── AppInitMain()                  // ★ 핵심 초기화

---

3단계: AppInitMain() — init.cpp:1426 (코드에 주석으로 Step이 명시됨)

AppInitMain()
  │
  ├── [Step 4a] 기반 인프라 시작
  │     ├── CreatePidFile()           // bitcoind.pid 파일 생성
  │     ├── StartLogging()            // 파일 로깅 시작
  │     ├── CScheduler 스레드 시작    // 1분마다 엔트로피 수집, 5분마다 디스크 검사
  │     ├── ValidationSignals 생성    // 블록/트랜잭션 이벤트 브로드캐스트 시스템
  │     ├── KernelNotifications 생성  // 셧다운 요청 등 커널 이벤트 처리
  │     ├── Wallet 인터페이스 구성    // (아직 로드는 안 함)
  │     ├── IPC 바인딩                // -ipcbind 옵션 처리 (멀티프로세스 모드)
  │     └── RegisterAllCoreRPCCommands() // 모든 RPC 명령 등록
  │
  ├── [Step 5] 지갑 DB 무결성 검증
  │     └── client->verify()          // SQLite 지갑 파일 검사
  │
  ├── [Step 6] 네트워크 초기화 (연결은 아직 안 함)
  │     ├── NetGroupManager 생성      // IP→ASN 매핑 (asmap)
  │     ├── LoadAddrman()             // peers.dat 로드 (알려진 피어 주소)
  │     ├── BanMan 생성               // banlist 로드
  │     ├── CConnman 생성             // P2P 연결 관리자 (아직 시작 안 함)
  │     ├── CBlockPolicyEstimator     // 수수료 추정기 초기화
  │     ├── 프록시 설정               // -proxy, -onion, -i2psam
  │     └── ZMQ 알림 인터페이스 등록
  │
  ├── [Step 7] 블록체인 로드
  │     └── InitAndLoadChainstate()
  │           ├── LoadChainstate()    // LevelDB 열기, UTXO 캐시 로드
  │           ├── VerifyLoadedChainstate() // 블록 헤더 인덱스 검증
  │           └── 실패 시 -reindex 제안 (GUI) 또는 자동 재시도
  │
  │     └── PeerManager::make()      // PeerManager 생성 (chainman에 연결)
  │
  ├── [Step 8] 인덱서 시작
  │     ├── TxIndex                   // -txindex
  │     ├── TxoSpenderIndex           // -txospenderindex
  │     ├── BlockFilterIndex          // -blockfilterindex (BIP 157)
  │     └── CoinStatsIndex            // -coinstatsindex
  │
  ├── [Step 9] 지갑 로드
  │     └── client->load()            // 지갑 파일 열기 및 키 로드
  │
  ├── [Step 10] 데이터 관리
  │     └── PruneAndFlush()           // -prune 모드면 오래된 블록 파일 삭제
  │
  ├── [Step 11] 백그라운드 스레드 시작 ("initload")
  │     ├── ImportBlocks()            // -loadblock 파일 가져오기
  │     ├── ActivateBestChain()       // 체인 팁까지 블록 검증/활성화
  │     ├── StartIndexBackgroundSync() // 인덱서 동기화
  │     └── LoadMempool()             // mempool.dat 로드
  │
  ├── [Step 12] 노드 네트워크 시작
  │     ├── StartMapPort()            // NAT-PMP 포트 매핑
  │     ├── TorController 시작        // -listenonion 시 Tor 제어 포트 연결
  │     ├── Discover()                // 로컬 IP 주소 탐색
  │     └── connman->Start()          // ★ P2P 네트워크 연결 시작
  │           ├── DNS 시드 조회
  │           ├── 아웃바운드 연결 개시
  │           └── 인바운드 수신 대기
  │
  └── [Step 13] 초기화 완료
        ├── SetRPCWarmupFinished()    // RPC 서버 warmup → 정상 모드 전환
        ├── uiInterface.InitMessage("Done loading")
        ├── client->start()           // 지갑 스케줄 작업 시작
        └── StartupNotify()           // -startupnotify 명령 실행

---

4단계: 이벤트 루프 (정상 운영)

main()
  └── node.shutdown_signal->wait()   // 셧다운 신호 대기 (블로킹)
      │  (SIGTERM/SIGINT 또는 RPC stop 호출 시 깨어남)
      │
      ├── Interrupt(node)            // 모든 서브시스템에 중단 신호 전파
      └── Shutdown(node)             // 역순으로 정리
            ├── connman->Stop()
            ├── DumpMempool()
            ├── FlushStateToDisk()
            └── 모든 unique_ptr 해제

---

핵심 포인트 요약

| 단계 | 무엇이 일어나는가 |
| --- | --- |
| 커맨드라인 파싱 | 설정 확정, 설정 파일 병합 |
| 암호화 초기화 | secp256k1 컨텍스트, SHA256 최적화 경로 선택 |
| DB 열기 | LevelDB(UTXO/블록인덱스), SQLite(지갑) |
| 체인 동기화 | 저장된 블록 검증 후 최선 체인 활성화 |
| 메모리풀 복원 | 이전 세션의 미확인 트랜잭션 재로드 |
| 네트워크 시작 | DNS 시드 → 피어 연결 → 블록/트랜잭션 릴레이 시작 |
| RPC 활성화 | 모든 준비 완료 후 warmup 해제 |

특정 단계를 더 깊이 분석해드릴까요?
**나:** 코인 채굴에 대한 보상을 주는 부분은 어디야?

> **Claude:** 채굴 보상은 세 단계로 나뉩니다.

---

1. 보상 금액 계산 — src/validation.cpp:1836

cpp

```
  CAmount GetBlockSubsidy(int nHeight, const Consensus::Params& consensusParams)
  {
      int halvings = nHeight / consensusParams.nSubsidyHalvingInterval;  // 210,000 블록마다
      if (halvings >= 64)
          return 0;                    // 64번 반감 후 보상 없음

      CAmount nSubsidy = 50 * COIN;   // 최초 보상: 50 BTC
      nSubsidy >>= halvings;           // 반감기마다 오른쪽 비트 시프트 (÷2)
      return nSubsidy;
  }
```

- COIN = 100,000,000 (사토시 단위) — src/consensus/amount.h:15
  - nSubsidyHalvingInterval = 210,000 — src/chainparams.cpp:84
  - 반감기: 210,000 블록 ≈ 4년마다 보상이 절반으로

| 반감 횟수 | 블록 높이 | 보상 |
| --- | --- | --- |
| 0 | 0 ~ 209,999 | 50 BTC |
| 1 | 210,000 ~ | 25 BTC |
| 2 | 420,000 ~ | 12.5 BTC |
| ... | ... | ... |
| 64+ | - | 0 BTC |

---

2. 블록 생성 시 코인베이스 트랜잭션 조립 — src/node/miner.cpp:178

채굴자가 블록을 만들 때 호출됩니다.

// 블록 보상 = 서브시디 + 블록 내 모든 트랜잭션 수수료
  const CAmount block_reward{nFees + GetBlockSubsidy(nHeight, chainparams.GetConsensus())};

coinbaseTx.vout[0].nValue = block_reward;   // 코인베이스 출력에 보상 금액 설정
  coinbaseTx.vout[0].scriptPubKey = m_options.coinbase_output_script;  // 채굴자 주소

- coinbaseTx.vin[0].prevout.SetNull() — 입력이 없는 특수 트랜잭션 (새 코인 발행)
  - 블록의 첫 번째 트랜잭션(vtx[0])이 항상 코인베이스 트랜잭션

---

3. 블록 검증 시 보상 한도 확인 — src/validation.cpp:2520~2610

다른 노드가 블록을 받았을 때 ConnectBlock() 안에서 실행됩니다.

// Step 1: 블록 내 모든 일반 트랜잭션 수수료 누적

cpp

```
  for (unsigned int i = 0; i < block.vtx.size(); i++) {
      if (!tx.IsCoinBase()) {
          nFees += txfee;   // 각 트랜잭션의 수수료 합산
      }
      UpdateCoins(tx, view, ...); // UTXO DB에 반영
  }
```

// Step 2: 코인베이스 출력이 허용 한도를 초과하면 블록 거절

cpp

```
  CAmount blockReward = nFees + GetBlockSubsidy(pindex->nHeight, params.GetConsensus());
  if (block.vtx[0]->GetValueOut() > blockReward) {
      state.Invalid(..., "bad-cb-amount",
          "coinbase pays too much");  // 컨센서스 오류 → 블록 거절
  }
```

---

4. UTXO DB에 등록 — src/validation.cpp:1996

cpp

```
  void UpdateCoins(const CTransaction& tx, CCoinsViewCache& inputs, ...) {
      if (!tx.IsCoinBase()) {
          // 일반 트랜잭션: 입력 UTXO 소모
          inputs.SpendCoin(txin.prevout, ...);
      }
      // 코인베이스 포함 모든 트랜잭션: 출력을 UTXO DB에 추가
      AddCoins(inputs, tx, nHeight);  // ← 이 시점에 새 코인이 DB에 기록됨
  }
```

---

전체 흐름 요약

채굴자
    └── CreateNewBlock()  [miner.cpp:162]
          ├── GetBlockSubsidy() + nFees  → 보상 금액 계산
          └── coinbaseTx.vout[0].nValue = block_reward  → 코인베이스 트랜잭션 생성

채굴 성공 (PoW 조건 충족) → 블록 브로드캐스트

다른 노드
    └── ConnectBlock()  [validation.cpp]
          ├── 모든 tx 수수료 합산 (nFees)
          ├── vtx[0]->GetValueOut()  **Claude:** PoW(Proof of Work)의 조건에 대해 설명할게요.

---

PoW (Proof of Work) 상세 분석

---

1. 블록 헤더 구조 — src/primitives/block.h:30

PoW의 대상은 블록 전체가 아닌 80바이트 블록 헤더입니다.

cpp

```
  class CBlockHeader {
      int32_t  nVersion;       // 4바이트: 버전
      uint256  hashPrevBlock;  // 32바이트: 이전 블록 해시
      uint256  hashMerkleRoot; // 32바이트: 트랜잭션 머클 루트
      uint32_t nTime;          // 4바이트: 타임스탬프
      uint32_t nBits;          // 4바이트: 난이도 목표값 (압축 표현)
      uint32_t nNonce;         // 4바이트: ★ 채굴자가 바꾸는 유일한 값
  };
```

---

2. 해시 계산 — src/primitives/block.cpp:14

cpp

```
  uint256 CBlockHeader::GetHash() const {
      return (HashWriter{} << *this).GetHash();  // Double SHA256
  }
```

블록 헤더 80바이트를 SHA256을 두 번 적용한 결과가 블록 해시입니다.

SHA256(SHA256(헤더 80바이트)) → 256비트 해시

---

3. PoW 조건 검증 — src/pow.cpp:161

cpp

```
  bool CheckProofOfWorkImpl(uint256 hash, unsigned int nBits, const Consensus::Params& params)
  {
      auto bnTarget{DeriveTarget(nBits, params.powLimit)};  // nBits → 256비트 목표값 변환
      if (!bnTarget) return false;

      // ★ 핵심 조건: 블록 해시 < 목표값(Target) 이어야 한다
      if (UintToArith256(hash) > *bnTarget)
          return false;

      return true;
  }
```

결론: 블록 해시가 Target보다 작아야만 유효한 블록

---

4. nBits — 난이도 목표값의 압축 표현 — src/arith_uint256.cpp:176

256비트 숫자를 4바이트에 담기 위한 부동소수점 방식입니다.

nBits = [1바이트: 지수(exponent)] [3바이트: 유효숫자(mantissa)]

예: nBits = 0x1d00ffff (비트코인 제네시스 블록)

지수   = 0x1d = 29
  mantissa = 0x00ffff

Target = 0x00ffff × 256^(29-3)
         = 0x00000000FFFF0000000000000000000000000000000000000000000000000000

즉, 해시의 앞 32비트가 0이어야 했던 것입니다.

현재 mainnet은 앞에 약 76개의 0비트가 필요합니다.

---

5. 채굴 루프 — src/rpc/mining.cpp:142

cpp

```
  // regtest용 generateblock RPC에서 볼 수 있는 채굴 루프의 본질
  while (max_tries > 0
         && block.nNonce < std::numeric_limits<uint32_t>::max()   // nNonce 최대값(약 43억) 미만
         && !CheckProofOfWork(block.GetHash(), block.nBits, ...)  // 아직 조건 미충족
         && !chainman.m_interrupt)
  {
      ++block.nNonce;   // nNonce 1씩 증가하며 반복
      --max_tries;
  }
```

nNonce = 0       → SHA256(SHA256(헤더)) = 해시A > Target? → 실패
  nNonce = 1       → SHA256(SHA256(헤더)) = 해시B > Target? → 실패
  nNonce = 2       → SHA256(SHA256(헤더)) = 해시C > Target? → 실패
  ...
  nNonce = 8,476,을  → SHA256(SHA256(헤더)) = 해시X < Target? → ★ 성공!

nNonce 공간(약 43억)이 소진되면 nTime이나 coinbase extraNonce를 바꿔 다시 시도합니다.

---

6. 난이도 조정 — src/pow.cpp:50

2016블록(≈14일)마다 자동으로 난이도가 조정됩니다.

cpp

```
  unsigned int CalculateNextWorkRequired(...) {
      int64_t nActualTimespan = 마지막블록시간 - 2016블록전시간;

      // 조정 폭 제한: 최소 1/4배 ~ 최대 4배
      if (nActualTimespan < nPowTargetTimespan/4)  nActualTimespan = nPowTargetTimespan/4;
      if (nActualTimespan > nPowTargetTimespan*4)  nActualTimespan = nPowTargetTimespan*4;

      // 새 Target = 이전Target × (실제걸린시간 / 목표시간)
      bnNew = 이전Target;
      bnNew *= nActualTimespan;
      bnNew /= nPowTargetTimespan;   // 목표: 14일 = 1,209,600초
  }
```

| 상황 | 결과 |
| --- | --- |
| 2016블록이 14일보다 빨리 채굴됨 | Target 감소 (난이도 상승) |
| 2016블록이 14일보다 늦게 채굴됨 | Target 증가 (난이도 하락) |
| 한 번에 최대 변화폭 | ×4 또는 ÷4 |

---

7. 네트워크 파라미터 — src/kernel/chainparams.cpp:96

cpp

```
  // Mainnet
  consensus.powLimit          = 0x00000000ffff...ffff;  // 절대 최대 Target (가장 쉬운 난이도)
  consensus.nPowTargetSpacing = 10 * 60;                 // 블록 목표 간격: 10분
  consensus.nPowTargetTimespan = 14 * 24 * 60 * 60;     // 조정 주기: 2주
  // DifficultyAdjustmentInterval = 14일 / 10분 = 2016 블록

  // Regtest (테스트용)
  consensus.powLimit = 0x7fff...ffff;  // 거의 항상 통과하는 매우 쉬운 난이도
```

---

전체 흐름 요약

채굴자
    ├── nNonce = 0부터 43억까지 반복
    │     └── SHA256(SHA256(헤더)) → 256비트 해시
    │           └── 해시 < Target?
    │                 ├── NO  → nNonce++ 반복
    │                 └── YES → 블록 완성, 네트워크에 전파
    │
    └── nNonce 소진 시 → coinbase extraNonce 또는 nTime 변경 후 재시도

검증 노드 (CheckBlockHeader)
    └── CheckProofOfWork(block.GetHash(), block.nBits)
          ├── nBits → Target 변환 (SetCompact)
          └── 해시 ≤ Target? → YES: 수락 / NO: "high-hash" 오류로 거절

2016블록마다
    └── GetNextWorkRequired() → CalculateNextWorkRequired()
          └── 실제 소요 시간 vs 목표 2주 비교 → Target 재조정

핵심은 SHA256을 두 번 한 결과가 nBits로 정해진 Target보다 작아야 한다는 단순한 부등식이고,
  이 Target을 조정하는 것이 난이도 조정 메커니즘입니다.