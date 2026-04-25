# SCP: SL 서버 목록

SCP: Secret Laboratory 서버 정보를 표시하고 관리하기 위한 프론트엔드 애플리케이션입니다.

> **참고:** 이 프로젝트는 최근에 비공개 소스에서 오픈 소스로 전환되었습니다. 프로젝트 개선 및 확장을 위한 여러분의 기여를 환영합니다!

[English Document](./README.md)

## 기능

- 상세한 통계 및 정보가 포함된 서버 목록
- 서버 위치의 대화형 지도 보기
- 통계 분석 및 그래프
- 광범위한 국제화를 통한 다국어 지원
- 데스크톱 및 모바일 디바이스를 위한, 반응형 디자인

## 시작하기

### 사전 요구 사항

- Node.js (LTS 버전 권장)
- pnpm

### 설치

```bash
# 저장소 복제
git clone https://github.com/yourusername/scp-sl-server-list.git
cd scp-sl-server-list

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm start
```

애플리케이션은 기본적으로 3185 포트에서 시작됩니다.

### 프로덕션 빌드

```bash
pnpm build
```

## 기여하기

기여는 환영합니다! 자세한 내용은 [기여 가이드](./CONTRIBUTING.ko.md)를 확인하세요.

### 번역

이 프로젝트는 다양한 언어를 지원합니다. 이전에는 번역이 별도의 저장소에서 관리되었습니다.

- 번역 파일은 `src/i18n/locale/*.json`에 위치합니다
- 각 언어 파일의 이름은 IETF 언어 태그를 따릅니다. 코드 목록은 [이 링크](http://www.lingoes.net/en/translator/langcode.htm)에서 확인하세요.
- `src/data/language.json` 파일은 UTF-8(BOM 없음)으로 인코딩되어야 합니다.
- `src/i18n/locale/*.json` 파일은 UTF-8(BOM 포함)으로 인코딩되어야 합니다.

번역에 기여하려면:
1. 이 저장소를 포크합니다
2. 번역 작업을 위한 새 브랜치를 생성합니다
3. `src/i18n/locale/`에서 번역 파일을 업데이트하거나 추가합니다
4. 번역에 기여할 때는 `src/data/language.json`도 업데이트하는 것을 잊지 마세요
5. 풀 리퀘스트를 제출합니다

번역에 관해 질문이 있으시면 다음으로 연락하세요: Discord 사용자 이름: horyu

## 향후 계획

- UI/UX 개선
- 성능 최적화
- 더 많은 데이터 시각화 옵션 추가

## 기술 스택

- React 19
- Vite (빌드 도구, Create React App 대체)
- Vitest (테스트 러너)
- 상태 관리를 위한 Redux Toolkit
- React Router 7
- 국제화를 위한 i18next
- 지도를 위한 Leaflet
- 데이터 시각화를 위한 Highcharts
- Bootstrap 5 (react-bootstrap, bootswatch 사용)

## 공급망 보안

공급망 공격 위험을 줄이기 위해 [`package.json`](./package.json)의 모든
직접 의존성은 **정확한 버전으로 고정(pinning)** 되어 있습니다 (`^`, `~`
등의 범위 접두사를 사용하지 않습니다). 이 정책으로 `pnpm install`은
어디서 실행해도 동일한 의존성 그래프를 만들고, 업스트림 메인테이너가
(혹은 탈취된 계정이) 새 설치 환경에 악성 버전을 조용히 주입하는 것을
막습니다.

이는 `pnpm-lock.yaml`로 보강됩니다. lockfile은 모든 전이 패키지의
SHA-512 무결성 해시를 저장하므로, 변조된 tarball은 설치 자체가
실패합니다.

의존성을 업데이트할 때는:

1. 의도한 패키지만 명시적으로 업데이트합니다 (예: `pnpm update <pkg>`).
   범위가 없는 `pnpm update`는 사용하지 마세요.
2. 새 릴리스 노트/changelog를 먼저 검토합니다.
3. `package.json`과 갱신된 `pnpm-lock.yaml`을 함께 커밋합니다.
4. 직접 의존성은 계속 고정 상태(`^`/`~` 없음)로 유지합니다. 전이
   의존성은 lockfile이 관리합니다.

## 라이선스

이 프로젝트는 AGPL 라이선스 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.