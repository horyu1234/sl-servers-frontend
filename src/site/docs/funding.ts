import type { DocSet } from './types';

// The page the icon on every ad leads to. It says what the ads are for and how they are
// placed, so keep it in step with the slots in the app: when a page gets a second ad or an ad
// moves into the server list, this text is wrong.
//
// Google's ad policies forbid asking visitors to look at or click on ads, in any wording.
// This page explains; it never asks.
export const FUNDING: DocSet = {
  'en-US': {
    title: 'Why this site has ads',
    description: 'SCP List has shown ads since November 2026. What it costs to run the site, where the ads are placed, and what stays the same.',
    heading: 'Why this site has ads',
    intro: [
      'SCP List has shown ads since November 2026. This page explains why they are here and how they are kept out of your way.',
    ],
    blocks: [
      { type: 'h2', text: 'What the site costs' },
      { type: 'p', text: 'SCP List reads the player count of every public server once a minute and keeps every reading since September 2020. Storing that history and serving it as a server list, statistics and a public API takes servers that run around the clock. The servers used only for scplist.kr cost more than 100,000 won a month.' },
      { type: 'p', text: 'The site is run by one person and is free for everyone. The ads are here to cover that cost.' },

      { type: 'h2', text: 'How the ads are placed' },
      {
        type: 'ul',
        items: [
          'A page shows one ad at most.',
          'An ad sits between two parts of a page. It does not cover the page, pop up or follow you as you scroll, and it is never mixed into the server list.',
          'Every ad is labelled as an ad.',
          'Ads for adult content and gambling are blocked.',
        ],
      },

      { type: 'h2', text: 'What stays the same' },
      {
        type: 'ul',
        items: [
          'The server list, the statistics and the public API stay free.',
          'Server list data is not sold.',
          'Google AdSense chooses the ads. They have no effect on the order of servers, the rankings or the statistics.',
        ],
      },

      { type: 'h2', text: 'Ads and cookies' },
      { type: 'p', text: 'The ads are served by Google AdSense. In the cookie settings you choose whether they may be personalised. If you turn that off you still see ads, but they are not based on your earlier visits. The [privacy policy](/privacy) has the details.' },

      { type: 'h2', text: 'Contact' },
      { type: 'p', text: 'If an ad gets in your way or does not belong here, tell us at [support@scplist.kr](mailto:support@scplist.kr).' },
    ],
  },
  'ko-KR': {
    title: '광고를 넣게 된 이유',
    description: 'SCP List는 2026년 11월부터 광고를 보여 드리고 있습니다. 사이트 운영에 드는 비용, 광고를 넣는 방식, 그리고 달라지지 않는 것을 안내합니다.',
    heading: '광고를 넣게 된 이유',
    intro: [
      'SCP List는 2026년 11월부터 광고를 보여 드리고 있습니다. 왜 광고를 넣게 되었는지, 이용에 방해가 되지 않도록 어떻게 넣었는지 적어 둡니다.',
    ],
    blocks: [
      { type: 'h2', text: '사이트 운영에 드는 비용' },
      { type: 'p', text: 'SCP List는 모든 공개 서버의 접속자 수를 1분마다 읽고, 2020년 9월부터의 기록을 전부 보관합니다. 이 기록을 저장해 서버 목록, 통계, 공개 API로 제공하려면 서버가 24시간 돌아가야 합니다. 온전히 scplist.kr를 운영하는 데 쓰는 서버 비용만 매달 10만 원이 넘습니다.' },
      { type: 'p', text: 'SCP List는 개인이 운영하며 누구나 무료로 이용할 수 있습니다. 광고는 이 비용을 충당하기 위한 것입니다.' },

      { type: 'h2', text: '광고를 넣는 방식' },
      {
        type: 'ul',
        items: [
          '한 페이지에 광고는 많아야 하나입니다.',
          '광고는 페이지의 구역과 구역 사이에 둡니다. 화면을 덮거나, 갑자기 뜨거나, 스크롤을 따라다니지 않으며, 서버 목록 사이에 끼워 넣지도 않습니다.',
          '모든 광고에는 광고라는 표시가 붙습니다.',
          '성인물과 도박 광고는 차단해 두었습니다.',
        ],
      },

      { type: 'h2', text: '달라지지 않는 것' },
      {
        type: 'ul',
        items: [
          '서버 목록, 통계, 공개 API는 계속 무료입니다.',
          '서버 목록 데이터는 판매하지 않습니다.',
          '광고는 Google AdSense가 고릅니다. 서버의 순서나 랭킹, 통계에는 아무 영향이 없습니다.',
        ],
      },

      { type: 'h2', text: '광고와 쿠키' },
      { type: 'p', text: '광고는 Google AdSense가 게재합니다. 쿠키 설정에서 맞춤 광고를 허용할지 고를 수 있습니다. 끄더라도 광고는 보이지만, 이전 방문 기록을 바탕으로 하지 않습니다. 자세한 내용은 [개인정보처리방침](/privacy)에 있습니다.' },

      { type: 'h2', text: '문의' },
      { type: 'p', text: '광고가 이용에 방해가 되거나 이 사이트에 어울리지 않는다면 [support@scplist.kr](mailto:support@scplist.kr)로 알려 주세요.' },
    ],
  },
};
