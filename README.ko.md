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

- React
- 상태 관리를 위한 Redux
- 국제화를 위한 i18next
- 지도를 위한 Leaflet
- 데이터 시각화를 위한 Highcharts
- 스타일링을 위한 Bootstrap/Bootswatch

## 라이선스

이 프로젝트는 AGPL 라이선스 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.