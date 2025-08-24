export type YesNoDeleteStatus = 'Y' | 'N';

export type PartyApplicationStatusTypeEnum = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export type UserType = 'ADMIN' | 'USER' | 'GUEST';

/**
 * API 응답 타입 정의
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Metadata {
  createdByName: string;
  createdAt: string;
  modifiedByName: string;
  modifiedAt: string;
  deletedByName: string;
  deletedAt: string;
}

export interface Article {
  title: string;
  contents: string;
}

export interface NoticeComment {
  id: number;
  revision: number;
  contents: string;
  status: YesNoDeleteStatus;
  noticeId: number;
  parentCommentId: number;
  metadata: Metadata;
}

export interface Notice {
  id: number;
  revision: number;
  article: Article;
  viewCount: number;
  status: YesNoDeleteStatus;
  metadata: Metadata;
}

export interface PartyApplication {
  id: number;
  revision: number;
  partyRecruit: PartyRecruit;
  resume: Resume;
  status: PartyApplicationStatusTypeEnum;
  metadata: Metadata;
}

export interface PartyRecruit {
  id: number;
  revision: number;
  userUniqueId: number;
  article: Article;
  maxMembers: number;
  status: YesNoDeleteStatus;
  metadata: Metadata;
}

export interface Resume {
  id: number;
  contents: string;
  metadata: Metadata;
}

export interface AuthToken {
  accessToken: string;
  accessRefreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginAttemptLog {
  id: number;
  userId: string;
  ipAddress: string;
  userAgent: string;
  isSucceeded: boolean;
  failureReason: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userUniqueId: number;
  type: string;
  title: string;
  message: string;
  targetType: string;
  targetId: number;
  isRead: boolean;
  readAt: string;
  metadata: Metadata;
}

export interface UserDiscordAuth {
  id: number;
  revision: number;
  userUniqueId: number;
  discordId: string;
  discordUsername: string;
  discordDiscriminator: string;
  discordGlobalName: string;
  discordEmail: string;
  discordAvatar: string;
  discordVerified: boolean;
  metadata: Metadata;
}

export interface UserReactionRecord {
  id: number;
  userUniqueId: number;
  targetType: string;
  targetId: number;
  reactionType: string;
  isDeleted: boolean;
  createdAt: string;
  deletedAt: string;
}

export interface UserReaction {
  likes: number;
  dislikes: number;
}

export interface User {
  userId: string;
  name: string;
  status: UserStatus;
  type: UserType;
  email: string;
  description: string;
  metadata: Metadata;
}

export interface ChatRoom {
  partyRecruitId: number;
  creatorId: number;
  participantCount: number;
  isActive: boolean;
  createdAt: string;
}
