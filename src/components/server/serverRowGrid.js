// Shared by ServerRow, ServerListHeader and ServerListSkeleton so the columns
// always line up. The address and full country name need 1440px: any narrower
// and they squeeze the server name, which matters more for picking a server.
export const SERVER_ROW_GRID =
  'grid-cols-[minmax(0,1fr)_72px_132px_112px_88px_16px] min-[1440px]:grid-cols-[minmax(0,1fr)_132px_156px_150px_128px_88px_16px]';
