/**
 * Persists record metadata (comments, attachments, timeline) in localStorage.
 * UI can swap this for MongoDB APIs without changing component contracts.
 */

export interface RecordComment {
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export interface RecordAttachment {
  name: string;
  size: string;
  type: string;
  added: string;
  dataUrl?: string;
}

export interface RecordTimelineEvent {
  action: string;
  user: string;
  time: string;
  desc: string;
}

export interface RecordMeta {
  comments: RecordComment[];
  attachments: RecordAttachment[];
  timeline: RecordTimelineEvent[];
}

const PREFIX = 'erp_record_meta_';

function storageKey(recordType: string, recordId: string): string {
  return `${PREFIX}${recordType}_${recordId}`;
}

function readMeta(recordType: string, recordId: string): RecordMeta {
  try {
    const raw = localStorage.getItem(storageKey(recordType, recordId));
    if (raw) return JSON.parse(raw) as RecordMeta;
  } catch {
    /* ignore corrupt data */
  }
  return { comments: [], attachments: [], timeline: [] };
}

function writeMeta(recordType: string, recordId: string, meta: RecordMeta): void {
  localStorage.setItem(storageKey(recordType, recordId), JSON.stringify(meta));
}

export const recordMetaService = {
  get(recordType: string, recordId: string): RecordMeta {
    return readMeta(recordType, recordId);
  },

  addComment(recordType: string, recordId: string, comment: RecordComment): RecordComment[] {
    const meta = readMeta(recordType, recordId);
    meta.comments = [...meta.comments, comment];
    meta.timeline = [
      { action: 'Comment added', user: comment.user, time: comment.time, desc: comment.text },
      ...meta.timeline,
    ];
    writeMeta(recordType, recordId, meta);
    return meta.comments;
  },

  addAttachment(recordType: string, recordId: string, attachment: RecordAttachment): RecordAttachment[] {
    const meta = readMeta(recordType, recordId);
    meta.attachments = [...meta.attachments, attachment];
    meta.timeline = [
      { action: 'File uploaded', user: 'You', time: attachment.added, desc: attachment.name },
      ...meta.timeline,
    ];
    writeMeta(recordType, recordId, meta);
    return meta.attachments;
  },

  addTimelineEvent(recordType: string, recordId: string, event: RecordTimelineEvent): RecordTimelineEvent[] {
    const meta = readMeta(recordType, recordId);
    meta.timeline = [event, ...meta.timeline];
    writeMeta(recordType, recordId, meta);
    return meta.timeline;
  },

  seedDefaults(recordType: string, recordId: string, defaults: Partial<RecordMeta>): void {
    const existing = readMeta(recordType, recordId);
    if (existing.comments.length || existing.attachments.length || existing.timeline.length) return;
    writeMeta(recordType, recordId, {
      comments: defaults.comments ?? [],
      attachments: defaults.attachments ?? [],
      timeline: defaults.timeline ?? [],
    });
  },
};

export default recordMetaService;
