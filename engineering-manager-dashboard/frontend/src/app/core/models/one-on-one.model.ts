export interface OneOnOne {
  id: string;
  employeeId: string;
  meetingDate: string;
  discussionNotes: string | null;
  concerns: string | null;
  careerDiscussion: string | null;
  actionItems: string[] | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateOneOnOneRequest = Omit<OneOnOne, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOneOnOneRequest = Partial<CreateOneOnOneRequest>;
