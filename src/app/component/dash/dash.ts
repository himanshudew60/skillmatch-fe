
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DashboardSummary {
  total_employees: number;
  available_employees: number;
  draft_for_lk_review: number;
  
  reviewed_by_lk: number;
  upskill_employees: number;
  ready_for_project_allocation: number;
  allocated_employees: number;
  total_projects: number;
  total_departments: number;
  total_skills: number;
  total_designations: number;
}

interface ProjectRequirement {
  project_id: number;
  project_name: string;
  manager_name: string | null;
  required_resources: number;
  primary_skill: string | null;
  primary_proficiency: number | string | null;
  secondary_skill: string | null;
  secondary_proficiency: number | string | null;
  tertiary_skill: string | null;
  tertiary_proficiency: number | string | null;
}

interface ProjectAllocation {
  employee_id: number;
  emp_name: string;
  project_id: number;
  project_name: string;
  start_date: string | null;
  end_date: string | null;
}

interface ProjectAllocationCount {
  project_id: number;
  project_name: string;
  allocated_employees: number;
}

interface DashboardApiData {
  employee_stats?: {
    total_emp?: number | string;
    draft_for_lk_review?: number | string;
    with_resource_manager?: number | string;
    ready_for_project_allocation?: number | string;
    upskill_employees?: number | string;
    reviewed_by_lk?: number | string;
    allocated_to_project?: number | string;
  };

  total_projects?: number | string;
  total_departments?: number | string;
  total_skills?: number | string;
  total_designations?: number | string;
  project_requirements?: ProjectRequirement[];
  allocations?: ProjectAllocation[];
  project_allocation_counts?: ProjectAllocationCount[];
}

interface DashboardResponse {
  success?: boolean;
  data?: DashboardApiData;
  message?: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface ChatResponse {
  success?: boolean;
  answer?: string;
  response?: string;
  message?: string;
  data?: {
    answer?: string;
    response?: string;
    message?: string;
  };
}

@Component({
  selector: 'app-dashboard-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dash.html',
  styleUrls: ['./dash.css']
})
export class DashboardInfo implements OnInit {
  private readonly apiBase = 'http://127.0.0.1:8000/api';

  @ViewChild('chatMessagesContainer')
  private chatMessagesContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('chatInputElement')
  private chatInputElement?: ElementRef<HTMLTextAreaElement>;

  loading = false;
  dashboardError = '';
  lastUpdated: Date | null = null;

  summary: DashboardSummary = this.emptySummary();

  projectRequirements: ProjectRequirement[] = [];
  allocations: ProjectAllocation[] = [];
  projectAllocationCounts: ProjectAllocationCount[] = [];

  chatOpen = false;
  chatInput = '';
  chatLoading = false;
  chatError = '';
  chatMessages: ChatMessage[] = [];
  private nextMessageId = 1;

  suggestedQuestions: string[] = [
    'How many employees are available?',
    'How many employees are ready for allocation?',
    'Which employees are currently allocated?',
    'Which projects need the most resources?',
    'Summarize the current project workforce.'
  ];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

 private emptySummary(): DashboardSummary {
  return {
    total_employees: 0,
    available_employees: 0,
    draft_for_lk_review: 0,
    reviewed_by_lk: 0,
    upskill_employees: 0,
    ready_for_project_allocation: 0,
    allocated_employees: 0,
    total_projects: 0,
    total_departments: 0,
    total_skills: 0,
    total_designations: 0
  };
}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  loadDashboard(): void {
    if (this.loading) return;

    this.loading = true;
    this.dashboardError = '';

    this.http.get<DashboardResponse>(
      `${this.apiBase}/ai/dash`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        console.log(response);
        
        const data = response?.data;
        const stats = data?.employee_stats;

        if (response?.success === false || !data) {
          this.dashboardError =
            response?.message || 'The dashboard API returned no data.';
          this.loading = false;
          return;
        }

        // Map the exact Laravel response to the dashboard KPI cards.
       this.summary = {
  total_employees: this.toNumber(stats?.total_emp),

  // draft_for_lk_review = Available employees
  available_employees: this.toNumber(stats?.draft_for_lk_review),
  draft_for_lk_review: this.toNumber(stats?.draft_for_lk_review),

  reviewed_by_lk: this.toNumber(stats?.reviewed_by_lk),

  upskill_employees: this.toNumber(stats?.upskill_employees),

  // with_resource_manager = Ready for project allocation
  ready_for_project_allocation: this.toNumber(
    stats?.with_resource_manager
  ),

  allocated_employees: this.toNumber(stats?.allocated_to_project),

  total_projects: this.toNumber(data.total_projects),
  total_departments: this.toNumber(data.total_departments),
  total_skills: this.toNumber(data.total_skills),
  total_designations: this.toNumber(data.total_designations)
};

        this.projectRequirements = data.project_requirements ?? [];
        this.allocations = data.allocations ?? [];
        this.projectAllocationCounts = data.project_allocation_counts ?? [];
        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: (error) => {
        console.error('Dashboard API error:', error);
        this.dashboardError =
          'Unable to load dashboard data. Check the Laravel API, authentication token, and /api/ai/dash route.';
        this.loading = false;
      }
    });
  }

  get availabilityPercent(): number {
    return this.percentage(
      this.summary.available_employees,
      this.summary.total_employees
    );
  }

  get allocationPercent(): number {
    return this.percentage(
      this.summary.allocated_employees,
      this.summary.total_employees
    );
  }
  get readyforprojectallocation(): number {
    return this.percentage(
      this.summary.ready_for_project_allocation,
      this.summary.total_employees
    );
  }

  get upskillPercent(): number {
    return this.percentage(
      this.summary.upskill_employees,
      this.summary.total_employees
    );
  }

  private percentage(value: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  get totalRequiredResources(): number {
    return this.projectRequirements.reduce(
      (total, project) => total + this.toNumber(project.required_resources),
      0
    );
  }

  get totalAllocatedFromProjects(): number {
    return this.projectAllocationCounts.reduce(
      (total, project) => total + this.toNumber(project.allocated_employees),
      0
    );
  }

  trackProject(_index: number, project: ProjectRequirement): number {
    return project.project_id;
  }

  trackAllocation(_index: number, allocation: ProjectAllocation): number {
    return allocation.employee_id * 100000 + allocation.project_id;
  }

  trackProjectCount(_index: number, project: ProjectAllocationCount): number {
    return project.project_id;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '—';

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatUpdatedAt(): string {
    if (!this.lastUpdated) return 'Not updated yet';

    return this.lastUpdated.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleChat(open?: boolean): void {
    this.chatOpen = open ?? !this.chatOpen;

    if (this.chatOpen) {
      setTimeout(() => {
        this.scrollChatToBottom();
        this.chatInputElement?.nativeElement.focus();
      });
    }
  }

  askSuggested(question: string): void {
    this.chatInput = question;
    this.sendChatMessage();
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChatMessage();
    }
  }

  sendChatMessage(): void {
    const message = this.chatInput.trim();

    if (!message || this.chatLoading) return;

    this.chatError = '';
    this.chatInput = '';

    this.chatMessages.push({
      id: this.nextMessageId++,
      role: 'user',
      content: message,
      time: this.currentTime()
    });

    this.chatLoading = true;
    this.scrollChatToBottom();

    this.http.post<ChatResponse>(
      `${this.apiBase}/ai/chat`,
      { message },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        const answer =
          response?.answer ??
          response?.response ??
          response?.data?.answer ??
          response?.data?.response ??
          response?.data?.message ??
          response?.message;

        this.chatMessages.push({
          id: this.nextMessageId++,
          role: 'assistant',
          content: answer || 'The AI returned an empty response. Please try again.',
          time: this.currentTime()
        });

        this.chatLoading = false;
        this.scrollChatToBottom();

        setTimeout(() => this.chatInputElement?.nativeElement.focus());
      },
      error: (error) => {
        console.error('AI chat API error:', error);
        this.chatLoading = false;
        this.chatError =
          'Could not get an AI response. Check the Laravel API, authentication, Groq configuration, and /api/ai/chat route.';
        this.scrollChatToBottom();
      }
    });
  }

  clearChat(): void {
    if (this.chatLoading) return;

    this.chatMessages = [];
    this.chatError = '';
    this.chatInput = '';
    this.nextMessageId = 1;
  }

  trackMessage(_index: number, message: ChatMessage): number {
    return message.id;
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      const container = this.chatMessagesContainer?.nativeElement;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  private currentTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
