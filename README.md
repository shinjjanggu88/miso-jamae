# 👑 개그지왕 (King of Jokes)

> **"피식 웃음 한 번으로 만드는 하루의 가치"**  
> AI 및 오픈 데이터 기반 숏폼 퀴즈 플랫폼 & 숏 콘텐츠 커뮤니티

<br/>

## 📌 Project Overview (프로젝트 개요)

* **팀명:** 미소자매 (Miso Sisters)
* **서비스명:** 개그지왕 (King of Jokes)
* **비전:** 숏폼 콘텐츠 시대에 맞춘 '초단기 몰입형 퀴즈 게임'을 통한 유저 락인(Lock-in) 및 숏 콘텐츠 광고 플랫폼 구축

<br/>

## 🚨 Problem (문제 정의)

1. **초단기 도파민 수요 급증:** 긴 영상이나 복잡한 게임보다 10초 이내에 직관적인 재미를 주는 콘텐츠 소비 선호
2. **기존 유머 커뮤니티의 피로도 상승:** 자극적이거나 혐오 표현이 섞인 콘텐츠에 대한 피로감 및 린(Lean)한 숏퀴즈형 플랫폼의 부재
3. **한국적 말장난 데이터의 파편화:** 수많은 언어유희(아재개그) 데이터가 통합 관리되지 못하고 흩어져 있음

<br/>

## 💡 Solution (해결 방안)

외부 Open API 및 데이터 파이프라인 연동 기반의 **숏퀴즈 & 랭킹 커뮤니티**

* **1초 퀴즈 인터랙션:** `질문` ➔ `정답 확인` ➔ `즉각적 보상(포인트)`으로 이어지는 초간단 루프 구현
* **게이미피케이션(Gamification):** 정답을 맞출 때마다 포인트를 획득해 '오늘의 개그지왕' 왕좌를 다투는 실시간 랭킹 시스템
* **개념적 완결성:** UX 중심의 정교한 UI 설계 (중앙 정렬 중심의 시선 집중 레이아웃)

<br/>

## 🛠 Tech Stack (기술 스펙)

### Frontend & API
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Environment & DevOps
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

* **Architecture:** Stop-uncle RESTful Open API Integration
* **Client Storage:** Web LocalStorage API (Auth, Score, Favorites)
* **Dev Tools:** AI Agent Engine (Ollama / OpenCode System)

<br/>

## ⚙️ Product Architecture (제품 및 주요 기능)

[ FRONTEND ]                  [ BACKEND & DATA ]              [ USER ENGAGEMENT ]
Vanilla JS / Tailwind CSS ─── Fetch API (Stop-uncle) ─── LocalStorage & User Auth
│                              │                              │
▼                              ▼                              ▼
정교한 UI Center alignment     비동기 데이터 렌더링           개그지왕 실시간 랭킹
(알겠어요/다음 버튼 정렬)     및 클라이언트 데이터 파싱      (Gamification Point System)


1. **스마트 퀴즈 엔진 (Quiz Engine)**
   * Stop-uncle Open API 연동을 통한 비동기(Async) 데이터 파싱 및 로딩 실패 방지 예외 처리
   * 정답 확인 UI의 완벽한 센터링 배치로 직관적인 모바일/PC UX 제공
2. **게이미피케이션 랭킹 시스템 (Ranking System)**
   * 유저 랭킹: 퀴즈 정답 획득 포인트 기반의 **'명예의 전당 (King of Jokes 1~3위)'**
   * 콘텐츠 랭킹: 유저 '좋아요' 기반 **레전드 개그 TOP 10** 선정
3. **유저 인증 및 맞춤 데이터 (Authentication & Storage)**
   * 클라이언트 측 경량 인증 시스템 구축 및 데이터 영속성(LocalStorage) 유지

<br/>

## 🎯 Market Analysis & Target (시장 및 타겟)

* **SOM (수용 가능한 유효 시장):** 1020 학생 및 3040 직장인 중 출퇴근/쉬는 시간에 가볍게 스마트폰을 사용하는 숏폼 이용자
* **핵심 타겟:**
  * **MZ세대:** 가벼운 유머와 병맛 B급 감성을 소비하고 챌린지 형태로 공유하는 유저
  * **직장인:** 짧은 휴식 시간 동안 소소한 스낵 콘텐츠를 찾는 유저

<br/>

## 💰 Business Model (수익 모델 & 창업 전략)

1. **숏 인터스티셜(Interstitial) 보상형 광고 (메인 수익원)**
   * 퀴즈 10회 풀이 시 또는 포인트 2배 적립 시 3초 숏폼 광고 노출 (Google AdSense / Unity Ads)
2. **기업 B2B 제휴 마케팅 (스폰서드 퀴즈)**
   * 브랜드명이나 신제품 특징을 아재개그 퀴즈로 출제하는 '브랜드 퀴즈 광고' 상품  
   *(예: "바나나가 웃으면? 바나킥!" ➔ 브랜드 쿠폰 지급)*
3. **굿즈 및 IP 확장**
   * '개그지왕' 1위 유저 전용 디지털 칭호 및 캐릭터 IP 굿즈 상점 연동

<br/>

## 🚀 Roadmap & Future Vision (향후 로드맵)

- [x] **Phase 1 (MVP 개발 - 완료)**
  - [x] API 연동, UI 정렬 개선, 기본 로그인 및 랭킹 시스템 구축
- [ ] **Phase 2 (서비스 확장)**
  - [ ] AI (Gemini / Ollama) 기반 '실시간 AI 아재개그 생성기' 도입으로 데이터 무한 확장
- [ ] **Phase 3 (모바일 앱 전환 및 수익화)**
  - [ ] PWA (Progressive Web App) 적용 및 앱스토어 출시, 보상형 광고 탑재
     
## 회고록
프로젝트 회고] 아재개그 퀴즈 서비스 '개그지왕' 개발 및 시연 후기
"사용자 피드백을 통해 본 생성형 AI 개발(Vibe Coding)의 시사점: 명확한 요구사항 정의와 검증 프로세스의 중요성"

1. 프로젝트 개요
프로젝트명: 개그지왕

서비스 정의: 사용자 참여형 아재개그 퀴즈 웹 서비스

개발 방식: 생성형 AI 도구를 활용한 신속한 프로토타이핑 개발 (Vibe Coding)

2. 시연 및 피드백을 통한 문제점 분석 (Problem)
프로젝트 시연 및 최종 발표 과정에서 사용자 경험(UX) 및 기능적 완성도 측면의 주요 개선 과제 3가지를 도출하였습니다.

🛠️ ① [기획 및 UI] 콘텐츠 노출 방식에 따른 몰입도 저하
현상: 퀴즈 목록 페이지에서 문제와 정답이 동시에 리스트 형태로 노출되었습니다.

원인 및 결과: 퀴즈 서비스의 핵심 요소인 추론과 재미 요소가 반감되었으며, 사용자가 정답을 단순히 암기하여 입력하는 구조적 한계가 발생했습니다.

🛠️ ② [기능 아키텍처] 인증 시스템 처리 방식의 한계
현상: 로그인 기능을 서버 및 데이터베이스 연동 없이 클라이언트 단의 localStorage를 활용하여 임시 구현했습니다.

원인 및 결과: 세션 지속성 및 사용자 상태 관리가 이루어지지 않아, 로그인 이후의 후속 기능과 연동되지 않는 기능적 결함이 나타났습니다.

🛠️ ③ [UX/UI] 인터랙션 피드백의 직관성 부족
현상: 정답 입력 후 채점 결과에 대한 시각적/청각적 피드백이 미흡했습니다.

원인 및 결과: 사용자가 자신의 입력 결과(정답/오답)를 직관적으로 인식하기 어려워, 전반적인 서비스 이용 편의성이 저하되었습니다.

3. 개인적 회고 및 시사점 (Lesson Learned)
이번 프로젝트는 생성형 AI를 활용한 개발 방식에서 개발자가 갖춰야 할 핵심 역량과 로직 검증의 중요성을 깊이 있게 성찰하는 계기가 되었습니다.

💡 1. AI 기반 개발에 있어 구체적인 프롬프트 작성의 중요성
AI 도구에 의존하되 예외 처리나 세부 유저 플로우를 명확히 정의하지 않은 채 단순한 명령을 전달할 경우, 완성도가 떨어진 임시 코드가 생성되는 현상을 확인했습니다.

시사점: 생성형 AI를 효율적으로 활용하기 위해서는 단순 지시를 넘어 데이터 흐름, 예외 상황, UX 연출 조건 등을 구체적으로 명시하는 정교한 프롬프트 작성 역량이 필수적임을 깨달았습니다.

💡 2. 체계적인 기능 테스트(QA)의 필수성
화면 레이아웃 구현 수준에 만족하고 전체 유저 시나리오에 대한 단위 테스트 및 통합 테스트를 충분히 거치지 않은 점이 시연 과정의 오류로 이어졌습니다.

시사점: AI가 생성한 코드일수록 실제 데이터 처리 과정과 예외 케이스를 직접 검증하는 QA(Quality Assurance) 프로세스가 개발 주기에 반드시 포함되어야 함을 확인했습니다.

4. 향후 개선 계획 (Next Step)
퀴즈 인터페이스 리팩토링: 정답 노출 구조를 개선하여 단일 문항 단위의 카드형 UI 및 인터랙티브 퀴즈 흐름 도입

인증 시스템 고도화: localStorage 구조를 폐기하고 Firebase/Supabase 기반의 백엔드 인증 체계 구축

사용자 피드백 UI 강화: 정답 및 오답 판정 시 명확한 팝업, 애니메이션 등 시각적 피드백 시스템 적용

AI 활용 프로세스 표준화: 프롬프트 작성 시 [목적 - 조건 - 예외 처리 - UI 출력] 구조를 의무화하고 배포 전 기능 검증 체크리스트 도입

📝 총평
이번 프로젝트 시연에서 수집된 피드백은 단순한 오류 확인을 넘어, 사용자 관점에서의 서비스 설계와 AI 도구를 주도적으로 제어하는 개발 프로세스의 중요성을 체득하는 계기가 되었습니다. 도출된 과제들을 바탕으로 지속적인 리팩토링을 진행하여 완성도 높은 서비스로 고도화할 예정입니다.
