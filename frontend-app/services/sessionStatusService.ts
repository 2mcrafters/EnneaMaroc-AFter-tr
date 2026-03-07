import { BaseApiService } from './baseApi';

export interface SessionStatusToggleRequest {
    status: 'active' | 'inactive';
}

export interface CourseGroupStatusRequest extends SessionStatusToggleRequest {
    course_id: number;
    group_index: number;
}

export interface CourseGroupStatus {
    index: number;
    day: string;
    time: string;
    status: 'active' | 'inactive';
}

class SessionStatusService extends BaseApiService {
    /**
     * Toggle course group status
     */
    async toggleCourseGroupStatus(courseId: number, groupIndex: number, status: 'active' | 'inactive') {
        console.log('🟡 sessionStatusService.toggleCourseGroupStatus called with:', { courseId, groupIndex, status });
        const result = await this.makeRequest(`/courses/${courseId}/groups/${groupIndex}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_id: courseId,
                group_index: groupIndex,
                status
            })
        });
        console.log('🟡 sessionStatusService.toggleCourseGroupStatus result:', result);
        return result;
    }

    /**
     * Get course groups status
     */
    async getCourseGroupsStatus(courseId: number): Promise<CourseGroupStatus[]> {
        const response = await this.makeRequest<{success: boolean; data: CourseGroupStatus[]}>(`/courses/${courseId}/groups/status`, {
            method: 'GET'
        });
        return response.data;
    }
}

export const sessionStatusService = new SessionStatusService();