/**
 * Get encouragement message based on match score
 * Shared utility to avoid code duplication
 */
export function getEncouragementMessage(score: number): string {
  if (score < 50) {
    return "사람마다 느끼는 맛이 달라요. 당신의 표현도 정답이에요!";
} else if (score < 75) {
    return "좋은 시도예요! 점점 더 섬세하게 느끼고 계시네요!";
} else if (score < 90) {
    return "훌륭해요!  감각이 정말 좋으세요!";
} else {
    return "로스터와 비슷하게 느끼셨네요! 감각이 정말 좋으세요!";
}
}

/**
 * Get achievement message
 */
export function getAchievementMessage(count: number): string {
  if (count === 1) {
    return "새로운 성취를 달성했습니다!";
}
  return `${count}개의 새로운 성취를 달성했습니다!`;
}

/**
 * Get error messages for common scenarios
 */
export const ErrorMessages = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요",
  SAVE_FAILED: "저장에 실패했습니다. 다시 시도해주세요",
  LOAD_FAILED: "데이터를 불러올 수 없습니다",
  AUTH_REQUIRED: "로그인이 필요합니다",
  INVALID_DATA: "올바르지 않은 데이터입니다",
  PERMISSION_DENIED: "권한이 없습니다",
  NOT_FOUND: "찾을 수 없습니다",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다"
} as const;

/**
 * Get success messages
 */
export const SuccessMessages = {
  SAVED: "저장되었습니다",
  UPDATED: "업데이트되었습니다",
  DELETED: "삭제되었습니다",
  COPIED: "복사되었습니다",
  COMPLETED: "완료되었습니다",
  SENT: "전송되었습니다"
} as const;