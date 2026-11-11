import type { DocSet } from './types';

export const ABOUT: DocSet = {
  'en-US': {
    title: 'About',
    description: 'SCP List is an independent server list and statistics site for SCP: Secret Laboratory, running since 2020. Who runs it, where its data comes from and how it is paid for.',
    heading: 'About SCP List',
    intro: [
      'SCP List (scplist.kr) is an independent server browser and statistics site for SCP: Secret Laboratory. It has recorded the player count of every public server once a minute since September 2020.',
    ],
    blocks: [
      { type: 'h2', text: 'What you can do here' },
      {
        type: 'ul',
        items: [
          '[Find a server](/) by country, player count, friendly fire, whitelist or mods, sorted by players, distance or the in-game order.',
          'Open a server to see its player history, the hours it is usually busy, its record and its rank.',
          'Compare [countries](/countries), browse the [rankings](/rankings) and follow the [player statistics](/stats) of the whole game.',
          'See how each [game update](/versions) moved player numbers and how fast servers switched to it.',
          'Read the [monthly and yearly reports](/reports) and the [all-time records](/records).',
          'Build your own tools on the [public API](/api).',
        ],
      },
      { type: 'h2', text: 'Where the data comes from' },
      { type: 'p', text: 'The server list comes from the official server list service of Northwood Studios, the developer of the game. We read it once a minute and keep every reading. [How the data works](/about/data) explains what is collected and what the numbers mean.' },
      { type: 'h2', text: 'Who runs it' },
      { type: 'p', text: 'The site is built and run by Hyunoh Ryu (Horyu), an individual developer in South Korea. It is not affiliated with Northwood Studios. SCP: Secret Laboratory is a game by Northwood Studios.' },
      { type: 'p', text: 'The code of the site is open source under the AGPL-3.0 license on [GitHub](https://github.com/horyu1234/sl-servers-frontend). Players translated it into more than 25 languages; their names are on the [credits page](/credit).' },
      { type: 'h2', text: 'How it is paid for' },
      { type: 'p', text: 'The server list, the statistics and the public API are free and stay free. To cover the cost of its servers, the site shows a small number of ads; [why this site has ads](/about/funding) explains how. Server list data is never sold.' },
      { type: 'h2', text: 'Contact' },
      { type: 'p', text: 'Questions and corrections go to [support@scplist.kr](mailto:support@scplist.kr). More ways to reach us are on the [contact page](/contact).' },
    ],
  },
  'ko-KR': {
    title: '소개',
    description: 'SCP List는 2020년부터 운영 중인 SCP: Secret Laboratory 서버 목록·통계 사이트입니다. 운영자, 데이터 출처, 운영 비용을 안내합니다.',
    heading: 'SCP List 소개',
    intro: [
      'SCP List(scplist.kr)는 SCP: Secret Laboratory의 서버 목록과 통계를 보여 주는 독립 사이트입니다. 2020년 9월부터 모든 공개 서버의 접속자 수를 1분마다 기록하고 있습니다.',
    ],
    blocks: [
      { type: 'h2', text: '할 수 있는 일' },
      {
        type: 'ul',
        items: [
          '국가, 접속자 수, 아군 공격, 화이트리스트, 모드 여부로 [서버를 찾고](/) 접속자, 거리, 게임 내 순서로 정렬할 수 있습니다.',
          '서버를 열면 접속자 기록, 붐비는 시간대, 최고 기록, 순위를 볼 수 있습니다.',
          '[국가](/countries)를 비교하고, [랭킹](/rankings)을 살펴보고, 게임 전체의 [접속자 통계](/stats)를 확인할 수 있습니다.',
          '[게임 업데이트](/versions)마다 접속자가 어떻게 달라졌는지, 서버들이 얼마나 빨리 옮겨 갔는지 볼 수 있습니다.',
          '[월간·연간 리포트](/reports)와 [역대 기록](/records)을 읽을 수 있습니다.',
          '[공개 API](/api)로 직접 도구를 만들 수 있습니다.',
        ],
      },
      { type: 'h2', text: '데이터 출처' },
      { type: 'p', text: '서버 목록은 게임 개발사 Northwood Studios의 공식 서버 목록 서비스에서 가져옵니다. 1분마다 읽어서 모든 값을 보관합니다. 무엇을 수집하고 각 수치가 무엇을 뜻하는지는 [데이터 안내](/about/data)에 정리했습니다.' },
      { type: 'h2', text: '운영자' },
      { type: 'p', text: '이 사이트는 한국의 개인 개발자 Hyunoh Ryu(Horyu)가 만들고 운영합니다. Northwood Studios와는 제휴 관계가 없습니다. SCP: Secret Laboratory는 Northwood Studios의 게임입니다.' },
      { type: 'p', text: '사이트 코드는 AGPL-3.0 라이선스로 [GitHub](https://github.com/horyu1234/sl-servers-frontend)에 공개되어 있습니다. 25개가 넘는 언어 번역은 플레이어들이 기여했고, 기여자 이름은 [크레딧 페이지](/credit)에 있습니다.' },
      { type: 'h2', text: '운영 비용' },
      { type: 'p', text: '서버 목록, 통계, 공개 API는 무료이며 앞으로도 무료입니다. 서버 비용을 충당하기 위해 소수의 광고를 보여 드리며, 자세한 내용은 [광고를 넣게 된 이유](/about/funding)에 있습니다. 서버 목록 데이터는 판매하지 않습니다.' },
      { type: 'h2', text: '문의' },
      { type: 'p', text: '질문과 정정 요청은 [support@scplist.kr](mailto:support@scplist.kr)로 보내 주세요. 다른 연락 방법은 [문의 페이지](/contact)에 있습니다.' },
    ],
  },
};
