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
