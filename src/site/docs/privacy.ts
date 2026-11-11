import type { DocSet } from './types';

// When what the site collects or loads changes, change this page in the same pull request,
// together with the cookie banner texts in index.html.
export const PRIVACY: DocSet = {
  'en-US': {
    title: 'Privacy policy',
    description: 'What scplist.kr collects when you use it, which cookies and third-party services it uses, how advertising works and what choices you have.',
    heading: 'Privacy policy',
    intro: [
      'This policy explains what scplist.kr collects when you use it, why, and what choices you have. Last updated: 11 November 2026.',
    ],
    blocks: [
      { type: 'h2', text: 'Who is responsible' },
      { type: 'p', text: 'scplist.kr is run by Hyunoh Ryu (Horyu), an individual in South Korea. Contact: [support@scplist.kr](mailto:support@scplist.kr).' },

      { type: 'h2', text: 'What we collect' },
      { type: 'h3', text: 'Server logs' },
      { type: 'p', text: 'When your browser loads the site or calls our API, our server and our network provider, Cloudflare, process your IP address, the address you requested and your browser\'s user agent. We use this to deliver the site, limit abuse and find faults, and we do not use it to identify you.' },
      { type: 'h3', text: 'Approximate location' },
      { type: 'p', text: 'To sort servers by distance, our API estimates your approximate location from your IP address with the GeoLite2 database, on our own server. The estimate is kept in memory for up to three days and is not stored permanently.' },
      { type: 'h3', text: 'Preferences' },
      { type: 'p', text: 'Your language, your distance unit and your cookie choices are saved in your browser so the site works the same on your next visit. If you allow functional cookies, the site also remembers your server filters, sort order, list or grid view and the notices you dismissed.' },
      { type: 'h3', text: 'Support chat' },
      { type: 'p', text: 'If you allow functional cookies, the MineTalk support chat is loaded. MineTalk receives the pages you visit, basic details of your device and what you write in the chat, so that we can answer you.' },
      { type: 'h3', text: 'Analytics and error reports' },
      { type: 'p', text: 'If you allow analytics cookies, three services are loaded: Google Analytics, through Google Tag Manager, to count visits and pages; Microsoft Clarity to study how pages are used, including session replays; and Sentry to report errors and slow pages, including replays of sessions in which something broke. We use this only to fix bugs and improve the site.' },

      { type: 'h2', text: 'Advertising' },
      { type: 'p', text: 'To pay for its servers, the site shows ads served by Google AdSense. [Why this site has ads](/about/funding) explains where they are placed. On a page with an ad, Google and its partners use cookies and similar identifiers to serve and measure the ad, to limit how often you see it and to prevent fraud.' },
      { type: 'p', text: 'If you allow personalised ads in the cookie settings, Google may also show ads based on your earlier visits to this site and to other websites. If you do not, the ads are based on the page you are viewing and your approximate location.' },
      { type: 'p', text: 'Visitors in the European Economic Area, the United Kingdom and Switzerland are also asked by Google\'s own consent message, and ads there follow that answer as well.' },
      { type: 'p', text: 'You can turn off personalised ads in [Google\'s Ads Settings](https://adssettings.google.com), or opt out of personalised ads from many companies at [aboutads.info](https://www.aboutads.info/choices). Google explains how it uses data from sites that use its services at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).' },
      { type: 'p', text: 'We do not accept ads for adult content or gambling.' },

      { type: 'h2', text: 'Services that receive data' },
      {
        type: 'table',
        head: ['Service', 'Purpose', 'When'],
        rows: [
          ['Cloudflare', 'Hosting, network and security', 'Always'],
          ['GitHub Pages', 'Country flag images', 'When a page shows flags'],
          ['Pastebin', 'A server\'s own info page, embedded on its page here', 'When you open a server that has one'],
          ['CARTO', 'Map tiles', 'When you open the server map'],
          ['MineTalk', 'Support chat', 'With functional cookies'],
          ['Google Analytics and Tag Manager', 'Visit statistics', 'With analytics cookies'],
          ['Microsoft Clarity', 'Usage research and session replays', 'With analytics cookies'],
          ['Sentry', 'Error and performance reports', 'With analytics cookies'],
          ['Google AdSense', 'Advertising', 'On pages that show an ad'],
        ],
      },

      { type: 'h2', text: 'Your choices' },
      {
        type: 'ul',
        items: [
          'Change your cookie choices at any time with the cookie icon in the bottom-left corner of the page.',
          'Clear this site\'s cookies and storage in your browser to reset everything.',
          'Ask what we hold about you, or ask us to delete it, at [support@scplist.kr](mailto:support@scplist.kr). The site has no accounts, so beyond server logs we usually hold nothing that identifies you.',
        ],
      },

      { type: 'h2', text: 'Game server data' },
      { type: 'p', text: 'The server list shows what server operators publish through the game\'s official server list: server names, IP addresses, ports and player counts. It holds no data about players. If you run a server and something about it is wrong here, email [support@scplist.kr](mailto:support@scplist.kr).' },

      { type: 'h2', text: 'Changes' },
      { type: 'p', text: 'When this policy changes, the date at the top changes with it.' },
    ],
  },
  'ko-KR': {
    title: '개인정보처리방침',
    description: 'scplist.kr를 이용할 때 수집되는 정보, 사용하는 쿠키와 외부 서비스, 광고 방식, 이용자가 선택할 수 있는 사항을 안내합니다.',
    heading: '개인정보처리방침',
    intro: [
      'scplist.kr를 이용할 때 무엇이 수집되는지, 왜 수집하는지, 어떤 선택을 할 수 있는지 설명합니다. 최종 수정일: 2026년 11월 11일.',
    ],
    blocks: [
      { type: 'h2', text: '운영자' },
      { type: 'p', text: 'scplist.kr는 한국의 개인 Hyunoh Ryu(Horyu)가 운영합니다. 연락처: [support@scplist.kr](mailto:support@scplist.kr).' },

      { type: 'h2', text: '수집하는 정보' },
      { type: 'h3', text: '서버 로그' },
      { type: 'p', text: '브라우저가 사이트를 불러오거나 API를 호출하면, 이 사이트의 서버와 네트워크 제공자인 Cloudflare가 IP 주소, 요청한 주소, 브라우저의 User-Agent를 처리합니다. 사이트 제공, 남용 방지, 장애 확인에 사용하며 이용자를 식별하는 데는 쓰지 않습니다.' },
      { type: 'h3', text: '대략적인 위치' },
      { type: 'p', text: '서버를 거리순으로 정렬하기 위해 API가 IP 주소로 대략적인 위치를 추정합니다. 추정은 이 사이트의 서버에 있는 GeoLite2 데이터베이스로 합니다. 결과는 최대 3일 동안 메모리에만 두고 영구 저장하지 않습니다.' },
      { type: 'h3', text: '환경 설정' },
      { type: 'p', text: '언어, 거리 단위, 쿠키 선택은 다음 방문 때도 같게 보이도록 브라우저에 저장합니다. 기능 쿠키를 허용하면 서버 필터, 정렬 순서, 목록·격자 보기, 닫은 공지도 기억합니다.' },
      { type: 'h3', text: '지원 채팅' },
      { type: 'p', text: '기능 쿠키를 허용하면 MineTalk 지원 채팅을 불러옵니다. 답변을 위해 MineTalk가 방문한 페이지, 기기의 기본 정보, 채팅에 쓴 내용을 받습니다.' },
      { type: 'h3', text: '분석과 오류 보고' },
      { type: 'p', text: '분석 쿠키를 허용하면 세 가지 서비스를 불러옵니다. Google Analytics(Google Tag Manager 경유)는 방문과 페이지 수를 셉니다. Microsoft Clarity는 페이지 이용 방식을 조사하며 세션 리플레이를 포함합니다. Sentry는 오류와 느린 페이지를 보고하며, 문제가 생긴 세션의 리플레이를 포함합니다. 버그 수정과 사이트 개선에만 사용합니다.' },

      { type: 'h2', text: '광고' },
      { type: 'p', text: '서버 비용을 충당하기 위해 Google AdSense 광고를 보여 드립니다. 광고를 넣는 위치는 [광고를 넣게 된 이유](/about/funding)에 정리했습니다. 광고가 있는 페이지에서는 Google과 그 파트너가 쿠키와 유사한 식별자를 사용해 광고를 게재하고 측정하며, 같은 광고가 너무 자주 나오지 않게 하고 부정 사용을 막습니다.' },
      { type: 'p', text: '쿠키 설정에서 맞춤 광고를 허용하면 Google이 이 사이트나 다른 웹사이트를 방문한 기록을 바탕으로 광고를 보여 줄 수 있습니다. 허용하지 않으면 보고 있는 페이지의 내용과 대략적인 위치를 기준으로 광고가 나옵니다.' },
      { type: 'p', text: '유럽경제지역, 영국, 스위스에서 접속하면 Google의 동의 안내가 따로 표시되며, 그 지역의 광고는 그 선택도 함께 따릅니다.' },
      { type: 'p', text: '맞춤 광고는 [Google 광고 설정](https://adssettings.google.com)에서 끌 수 있고, 여러 업체의 맞춤 광고는 [aboutads.info](https://www.aboutads.info/choices)에서 거부할 수 있습니다. Google이 자사 서비스를 사용하는 사이트의 데이터를 어떻게 쓰는지는 [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites)에 나와 있습니다.' },
      { type: 'p', text: '성인물과 도박 광고는 받지 않습니다.' },

      { type: 'h2', text: '정보를 받는 서비스' },
      {
        type: 'table',
        head: ['서비스', '목적', '시점'],
        rows: [
          ['Cloudflare', '호스팅, 네트워크, 보안', '항상'],
          ['GitHub Pages', '국기 이미지', '국기가 있는 페이지를 볼 때'],
          ['Pastebin', '서버 페이지에 삽입되는 서버 자체 안내문', '안내문이 있는 서버를 열 때'],
          ['CARTO', '지도 타일', '서버 지도를 열 때'],
          ['MineTalk', '지원 채팅', '기능 쿠키 허용 시'],
          ['Google Analytics, Tag Manager', '방문 통계', '분석 쿠키 허용 시'],
          ['Microsoft Clarity', '이용 방식 조사, 세션 리플레이', '분석 쿠키 허용 시'],
          ['Sentry', '오류·성능 보고', '분석 쿠키 허용 시'],
          ['Google AdSense', '광고', '광고가 있는 페이지를 볼 때'],
        ],
      },

      { type: 'h2', text: '선택할 수 있는 사항' },
      {
        type: 'ul',
        items: [
          '페이지 왼쪽 아래의 쿠키 아이콘으로 언제든 쿠키 선택을 바꿀 수 있습니다.',
          '브라우저에서 이 사이트의 쿠키와 저장소를 지우면 모두 초기화됩니다.',
          '보관 중인 정보의 확인이나 삭제는 [support@scplist.kr](mailto:support@scplist.kr)로 요청할 수 있습니다. 계정 기능이 없어서, 서버 로그 외에는 이용자를 식별할 정보를 보통 갖고 있지 않습니다.',
        ],
      },

      { type: 'h2', text: '게임 서버 데이터' },
      { type: 'p', text: '서버 목록에는 서버 운영자가 게임의 공식 서버 목록에 공개한 정보가 나옵니다. 서버 이름, IP 주소, 포트, 접속자 수입니다. 플레이어에 관한 정보는 없습니다. 운영 중인 서버의 정보가 잘못 나온다면 [support@scplist.kr](mailto:support@scplist.kr)로 알려 주세요.' },

      { type: 'h2', text: '변경' },
      { type: 'p', text: '이 방침이 바뀌면 위의 날짜도 함께 바뀝니다.' },
    ],
  },
};
