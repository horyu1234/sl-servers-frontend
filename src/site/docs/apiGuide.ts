import type { DocSet } from './types';

// Limits and fields mirror ServerPublicV2Api and ServerAPI in sl-servers-api. Change them together.
const PLAYERS_EXAMPLE = `curl "https://api.scplist.kr/api/v2/servers/players?serverIds=12345"

[{"serverId":12345,"current":18,"max":30}]`;

const SCRIPT_EXAMPLE = `const response = await fetch('https://api.scplist.kr/api/v2/servers/players?serverIds=12345');
const [server] = await response.json();
console.log(server ? \`\${server.current}/\${server.max}\` : 'offline');`;

export const API_GUIDE: DocSet = {
  'en-US': {
    title: 'API',
    description: 'Free, read-only HTTP API for the SCP: Secret Laboratory server list: endpoints, rate limits, response fields and an example for a Discord player-count bot.',
    heading: 'API',
    intro: [
      'A free, read-only HTTP API for the current SCP: Secret Laboratory server list. It needs no key. Player counts for Discord bots are its most common use.',
    ],
    blocks: [
      { type: 'h2', text: 'Basics' },
      {
        type: 'ul',
        items: [
          'The base address is `https://api.scplist.kr`. The host `backend.scplist.kr` is for this website only, and other clients may be blocked there.',
          'Every endpoint below is a `GET` request that returns JSON.',
          'The data is refreshed once a minute, so asking more often returns the same answer.',
          'There is no key and no sign-up. Send a `User-Agent` that names your project.',
        ],
      },
      { type: 'h2', text: 'Endpoints' },
      {
        type: 'table',
        head: ['Endpoint', 'Returns', 'Limit'],
        rows: [
          ['`/api/v2/servers`', 'The online servers with their ID, name, current and maximum players. Filters: `country`, `hideEmpty`, `hideFull`, `friendlyFire`, `whitelist`, `modded`, `minPlayers`, `maxPlayers`, `minSlots`, `maxSlots`.', '10 per minute'],
          ['`/api/v2/servers/players?serverIds=1,2`', 'Current and maximum players of the servers you list. Offline servers are left out.', '20 per minute'],
          ['`/api/v2/servers/{serverId}`', 'One server in full: address, version, flags, country, players, name and mods.', '10 per minute'],
          ['`/api/v2/servers/online-count`', 'The number of online servers and the players on them.', '30 per minute'],
        ],
      },
      { type: 'p', text: 'The older `POST /api/servers` and `GET /api/servers/{serverId}` still answer, but they are deprecated and limited to 3 requests per minute.' },
      { type: 'h2', text: 'Rate limits' },
      { type: 'p', text: 'Limits are counted per IP address and per endpoint. Each response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Window-Seconds`. Past the limit the API answers `429` with a `Retry-After` header. Responses also carry `Cache-Control`, and a client that honours it stays well inside the limits.' },
      { type: 'h2', text: 'Example: a player count for a Discord bot' },
      { type: 'p', text: 'A server\'s ID is the number in the address of its page here, such as `scplist.kr/servers/12345`.' },
      { type: 'code', text: PLAYERS_EXAMPLE },
      { type: 'p', text: 'The same request in JavaScript. Ask once a minute at most, because the data does not change faster.' },
      { type: 'code', text: SCRIPT_EXAMPLE },
      { type: 'h2', text: 'Fields of a server' },
      {
        type: 'table',
        head: ['Field', 'Meaning'],
        rows: [
          ['`serverId`', 'The server\'s number. It stays the same when the name, IP address or port changes.'],
          ['`ip`, `port`', 'The address. `ip` is null once the server has been offline for more than 30 days.'],
          ['`online`', 'Whether the server is in the list right now.'],
          ['`players`', 'Current and maximum players as text, such as `18/30`.'],
          ['`version`', 'The game version.'],
          ['`friendlyFire`, `whitelist`, `modded`', 'Flags the server reports about itself.'],
          ['`isoCode`', 'The country where the server is hosted.'],
          ['`info`', 'The server name as sanitized HTML.'],
          ['`techList`', 'Mod loaders named in the server name, with their versions.'],
          ['`pastebin`', 'The Pastebin ID of the server\'s info page.'],
          ['`official`', '0 for a community server, higher for an official one.'],
          ['`distance`', 'Estimated distance from the caller in kilometres.'],
          ['`lastSeen`', 'When an offline server was last online. Null for an online server.'],
        ],
      },
      { type: 'h2', text: 'Fair use' },
      {
        type: 'ul',
        items: [
          'Use only the endpoints on this page. Others can change without notice.',
          'Traffic that ignores the limits may be blocked.',
          'For higher limits or a question about the API, email [support@scplist.kr](mailto:support@scplist.kr).',
        ],
      },
      { type: 'h2', text: 'Live reference' },
      { type: 'p', text: 'The reference below is generated from the running API, and you can try requests from this page.' },
    ],
  },
  'ko-KR': {
    title: 'API',
    description: 'SCP: Secret Laboratory 서버 목록을 무료로 읽을 수 있는 HTTP API입니다. 엔드포인트, 요청 제한, 응답 필드와 Discord 접속자 수 봇 예제를 안내합니다.',
    heading: 'API',
    intro: [
      '현재 SCP: Secret Laboratory 서버 목록을 읽을 수 있는 무료 HTTP API입니다. 키가 필요 없습니다. Discord 봇에서 접속자 수를 보여 주는 용도로 가장 많이 쓰입니다.',
    ],
    blocks: [
      { type: 'h2', text: '기본 사항' },
      {
        type: 'ul',
        items: [
          '기본 주소는 `https://api.scplist.kr`입니다. `backend.scplist.kr` 호스트는 이 웹사이트 전용이며, 다른 클라이언트는 차단될 수 있습니다.',
          '아래 엔드포인트는 모두 `GET` 요청이고 JSON으로 응답합니다.',
          '데이터는 1분마다 갱신됩니다. 더 자주 요청해도 같은 응답이 옵니다.',
          '키도 가입도 필요 없습니다. `User-Agent`에 프로젝트 이름을 넣어 주세요.',
        ],
      },
      { type: 'h2', text: '엔드포인트' },
      {
        type: 'table',
        head: ['엔드포인트', '응답', '제한'],
        rows: [
          ['`/api/v2/servers`', '온라인 서버의 ID, 이름, 현재 접속자 수와 정원. 필터: `country`, `hideEmpty`, `hideFull`, `friendlyFire`, `whitelist`, `modded`, `minPlayers`, `maxPlayers`, `minSlots`, `maxSlots`.', '분당 10회'],
          ['`/api/v2/servers/players?serverIds=1,2`', '지정한 서버들의 현재 접속자 수와 정원. 오프라인 서버는 빠집니다.', '분당 20회'],
          ['`/api/v2/servers/{serverId}`', '서버 하나의 전체 정보: 주소, 버전, 설정, 국가, 접속자, 이름, 모드.', '분당 10회'],
          ['`/api/v2/servers/online-count`', '온라인 서버 수와 전체 접속자 수.', '분당 30회'],
        ],
      },
      { type: 'p', text: '예전 엔드포인트 `POST /api/servers`와 `GET /api/servers/{serverId}`도 응답하지만, 지원 중단 예정이며 분당 3회로 제한됩니다.' },
      { type: 'h2', text: '요청 제한' },
      { type: 'p', text: '제한은 IP 주소와 엔드포인트별로 셉니다. 모든 응답에 `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Window-Seconds` 헤더가 있습니다. 제한을 넘으면 `429`와 `Retry-After` 헤더로 응답합니다. 응답의 `Cache-Control`을 따르면 제한에 걸릴 일이 거의 없습니다.' },
      { type: 'h2', text: '예제: Discord 봇에 접속자 수 표시' },
      { type: 'p', text: '서버 ID는 이 사이트의 서버 페이지 주소에 있는 숫자입니다. 예: `scplist.kr/servers/12345`.' },
      { type: 'code', text: PLAYERS_EXAMPLE },
      { type: 'p', text: '같은 요청을 JavaScript로 보내는 예입니다. 데이터가 1분마다 바뀌므로 1분에 한 번 이하로 요청하세요.' },
      { type: 'code', text: SCRIPT_EXAMPLE },
      { type: 'h2', text: '서버 필드' },
      {
        type: 'table',
        head: ['필드', '뜻'],
        rows: [
          ['`serverId`', '서버 번호. 이름, IP 주소, 포트가 바뀌어도 그대로입니다.'],
          ['`ip`, `port`', '주소. 30일 넘게 오프라인이면 `ip`는 null입니다.'],
          ['`online`', '지금 목록에 있는지 여부.'],
          ['`players`', '현재 접속자 수와 정원을 담은 문자열. 예: `18/30`.'],
          ['`version`', '게임 버전.'],
          ['`friendlyFire`, `whitelist`, `modded`', '서버가 스스로 알리는 설정.'],
          ['`isoCode`', '서버가 호스팅된 국가.'],
          ['`info`', '위험 요소를 제거한 HTML 형식의 서버 이름.'],
          ['`techList`', '서버 이름에 표시된 모드 로더와 버전.'],
          ['`pastebin`', '서버 안내 페이지의 Pastebin ID.'],
          ['`official`', '커뮤니티 서버는 0, 공식 서버는 그보다 큰 값.'],
          ['`distance`', '요청자로부터의 추정 거리(km).'],
          ['`lastSeen`', '오프라인 서버가 마지막으로 온라인이던 시각. 온라인 서버는 null입니다.'],
        ],
      },
      { type: 'h2', text: '이용 안내' },
      {
        type: 'ul',
        items: [
          '이 페이지에 있는 엔드포인트만 사용하세요. 다른 엔드포인트는 예고 없이 바뀔 수 있습니다.',
          '제한을 무시하는 트래픽은 차단될 수 있습니다.',
          '더 높은 제한이 필요하거나 API에 관한 질문이 있으면 [support@scplist.kr](mailto:support@scplist.kr)로 문의해 주세요.',
        ],
      },
      { type: 'h2', text: '실시간 레퍼런스' },
      { type: 'p', text: '아래 레퍼런스는 운영 중인 API에서 생성되며, 이 페이지에서 바로 요청을 보내 볼 수 있습니다.' },
    ],
  },
};
