import type { DocSet } from './types';

export const CONTACT: DocSet = {
  'en-US': {
    title: 'Contact',
    description: 'How to reach SCP List: email for questions, corrections and data requests, GitHub for bugs and translations, and what server owners need to know.',
    heading: 'Contact',
    intro: [
      'SCP List is run by one person, so email is the surest way to reach it.',
    ],
    blocks: [
      { type: 'h2', text: 'Email' },
      { type: 'p', text: 'Write to [support@scplist.kr](mailto:support@scplist.kr) with questions, corrections, requests from server owners and anything about your data. You can write in English or Korean.' },
      { type: 'h2', text: 'Bugs and ideas' },
      { type: 'p', text: 'Report bugs and suggest features in the [GitHub issues](https://github.com/horyu1234/sl-servers-frontend/issues).' },
      { type: 'h2', text: 'Translations' },
      { type: 'p', text: 'The site is translated by volunteers. The [contributing guide](https://github.com/horyu1234/sl-servers-frontend/blob/main/CONTRIBUTING.md#translations) explains how to add or fix a language.' },
      { type: 'h2', text: 'Security' },
      { type: 'p', text: 'Report security problems by email, not in a public issue.' },
      { type: 'h2', text: 'Server owners' },
      { type: 'p', text: 'Your server appears here on its own once it is in the game\'s public server list. There is nothing to register. If its page shows something wrong, email us the address of the page and what should change.' },
      { type: 'h2', text: 'About the game' },
      { type: 'p', text: 'For problems with the game, with accounts or with server verification, contact Northwood Studios. This site is not affiliated with them.' },
    ],
  },
  'ko-KR': {
    title: '문의',
    description: 'SCP List에 연락하는 방법을 안내합니다. 질문·정정·개인정보 요청은 이메일로, 버그와 번역은 GitHub로 받습니다. 서버 운영자를 위한 안내도 있습니다.',
    heading: '문의',
    intro: [
      'SCP List는 한 사람이 운영하므로 이메일이 가장 확실한 연락 방법입니다.',
    ],
    blocks: [
      { type: 'h2', text: '이메일' },
      { type: 'p', text: '질문, 정정 요청, 서버 운영자의 요청, 개인정보 관련 요청은 [support@scplist.kr](mailto:support@scplist.kr)로 보내 주세요. 한국어나 영어로 쓰시면 됩니다.' },
      { type: 'h2', text: '버그와 제안' },
      { type: 'p', text: '버그 신고와 기능 제안은 [GitHub 이슈](https://github.com/horyu1234/sl-servers-frontend/issues)에 남겨 주세요.' },
      { type: 'h2', text: '번역' },
      { type: 'p', text: '이 사이트는 자원봉사자들이 번역합니다. 언어를 추가하거나 고치는 방법은 [기여 안내](https://github.com/horyu1234/sl-servers-frontend/blob/main/CONTRIBUTING.md#translations)에 있습니다.' },
      { type: 'h2', text: '보안' },
      { type: 'p', text: '보안 문제는 공개 이슈가 아니라 이메일로 알려 주세요.' },
      { type: 'h2', text: '서버 운영자' },
      { type: 'p', text: '서버가 게임의 공개 서버 목록에 올라가면 이 사이트에도 자동으로 나타납니다. 따로 등록할 필요가 없습니다. 서버 페이지에 잘못된 내용이 있으면 페이지 주소와 고칠 내용을 이메일로 보내 주세요.' },
      { type: 'h2', text: '게임 관련 문의' },
      { type: 'p', text: '게임, 계정, 서버 인증에 관한 문제는 Northwood Studios에 문의해 주세요. 이 사이트는 Northwood Studios와 제휴 관계가 없습니다.' },
    ],
  },
};
