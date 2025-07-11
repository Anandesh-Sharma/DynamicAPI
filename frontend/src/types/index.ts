// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum TeamMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  ARCHIVED = 'ARCHIVED'
}

export enum ProjectPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEAM_ONLY = 'TEAM_ONLY'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_COMMENT = 'TASK_COMMENT',
  PROJECT_INVITE = 'PROJECT_INVITE',
  MENTION = 'MENTION',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER'
}

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  ownedProjects?: Project[];
  ownedTeams?: Team[];
  assignedTasks?: Task[];
  teamMembers?: TeamMember[];
}

// Team interfaces
export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: User;
  members: TeamMember[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  user: User;
  team: Team;
}

// Project interfaces
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  privacy: ProjectPrivacy;
  ownerId: string;
  teamId?: string;
  owner: User;
  team?: Team;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
}

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  position: number;
  assigneeId?: string;
  creatorId: string;
  projectId: string;
  parentId?: string;
  assignee?: User;
  creator: User;
  project: Project;
  parent?: Task;
  subtasks: Task[];
  comments: Comment[];
  attachments: Attachment[];
  dependencies: TaskDependency[];
  dependents: TaskDependency[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    subtasks: number;
  };
}

export interface TaskDependency {
  id: string;
  dependentId: string;
  dependsOnId: string;
  dependent: Task;
  dependsOn: Task;
}

// Comment interface
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  taskId: string;
  author: User;
  task: Task;
  createdAt: string;
  updatedAt: string;
}

// Attachment interface
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  taskId: string;
  uploadedBy: string;
  task: Task;
  uploader: User;
  createdAt: string;
}

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  entityId?: string;
  entityType?: string;
  user: User;
  createdAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Form interfaces
export interface CreateProjectData {
  name: string;
  description?: string;
  status?: ProjectStatus;
  privacy?: ProjectPrivacy;
  teamId?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  privacy?: ProjectPrivacy;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
  parentId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface InviteTeamMemberData {
  email: string;
  role?: TeamMemberRole;
}

// UI State interfaces
export interface ViewMode {
  type: 'list' | 'board' | 'calendar' | 'timeline';
}

export interface FilterState {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  projectId?: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
  searchQuery?: string;
}

export interface SortState {
  field: 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Drag and Drop interfaces
export interface DraggedTask {
  id: string;
  status: TaskStatus;
  position: number;
}

export interface DropResult {
  taskId: string;
  sourceStatus: TaskStatus;
  destinationStatus: TaskStatus;
  newPosition: number;
}