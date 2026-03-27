export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // 모든 시스템 인텐트 진입을 메인 페이지로 유도하여 파라미터 처리를 단순화함
  return '/';
}