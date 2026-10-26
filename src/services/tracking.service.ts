import { XApiStatement, ScormDataModel, LearningActivityResult } from '../types';

const XAPI_STORAGE_KEY = 'aegis_lms_v1_xapi_statements';
const SCORM_STORAGE_KEY = 'aegis_lms_v1_scorm_state';

class TrackingService {
  private statements: XApiStatement[] = [];
  private scormState: Record<string, ScormDataModel> = {};

  constructor() {
    try {
      const savedXapi = localStorage.getItem(XAPI_STORAGE_KEY);
      if (savedXapi) {
        this.statements = JSON.parse(savedXapi);
      }
      const savedScorm = localStorage.getItem(SCORM_STORAGE_KEY);
      if (savedScorm) {
        this.scormState = JSON.parse(savedScorm);
      }
    } catch (e) {
      console.warn('[TrackingService] Failed to load saved tracking logs:', e);
    }
  }

  // Record an xAPI statement
  public recordStatement(statement: Omit<XApiStatement, 'id' | 'timestamp'>): XApiStatement {
    const fullStatement: XApiStatement = {
      ...statement,
      id: 'stmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };

    this.statements.unshift(fullStatement);
    if (this.statements.length > 200) {
      this.statements = this.statements.slice(0, 200);
    }

    try {
      localStorage.setItem(XAPI_STORAGE_KEY, JSON.stringify(this.statements));
    } catch (e) {
      console.warn('[TrackingService] Failed to persist xAPI statement:', e);
    }

    window.dispatchEvent(new CustomEvent('aegis-xapi-statement', { detail: fullStatement }));
    return fullStatement;
  }

  // Convenience helper for common verbs
  public trackActivity(
    actorName: string,
    actorEmail: string,
    verb: 'experienced' | 'interacted' | 'answered' | 'completed' | 'passed' | 'failed',
    activityId: string,
    activityName: string,
    activityType: string,
    result?: { rawScore?: number; success?: boolean; response?: string }
  ): XApiStatement {
    const verbMap = {
      experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: 'experienced' },
      interacted: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: 'interacted with' },
      answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: 'answered' },
      completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
      passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: 'passed' },
      failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
    };

    return this.recordStatement({
      actor: {
        name: actorName,
        mbox: `mailto:${actorEmail}`,
      },
      verb: verbMap[verb],
      object: {
        id: `urn:aegis:lms:activity:${activityId}`,
        definition: {
          name: activityName,
          type: `http://adlnet.gov/expapi/activities/${activityType}`,
        },
      },
      result: result
        ? {
            score:
              result.rawScore !== undefined
                ? { raw: result.rawScore, min: 0, max: 100, scaled: result.rawScore / 100 }
                : undefined,
            success: result.success,
            completion: result.success !== undefined ? result.success : true,
            response: result.response,
          }
        : undefined,
    });
  }

  // Update SCORM Data Model for an activity/lesson
  public updateScormState(
    lessonKey: string,
    status: ScormDataModel['cmi.core.lesson_status'],
    rawScore?: number,
    suspendData?: string
  ): ScormDataModel {
    const existing = this.scormState[lessonKey] || {
      'cmi.core.lesson_status': 'not attempted',
    };

    const updated: ScormDataModel = {
      ...existing,
      'cmi.core.lesson_status': status,
      'cmi.core.score.raw': rawScore !== undefined ? rawScore : existing['cmi.core.score.raw'],
      'cmi.core.score.min': 0,
      'cmi.core.score.max': 100,
      'cmi.suspend_data': suspendData !== undefined ? suspendData : existing['cmi.suspend_data'],
      'cmi.core.session_time': new Date().toISOString(),
    };

    this.scormState[lessonKey] = updated;
    try {
      localStorage.setItem(SCORM_STORAGE_KEY, JSON.stringify(this.scormState));
    } catch (e) {
      console.warn('[TrackingService] Failed to persist SCORM state:', e);
    }

    return updated;
  }

  public getStatements(): XApiStatement[] {
    return this.statements;
  }

  public getXApiStatements(): XApiStatement[] {
    return this.statements;
  }

  public getScormState(lessonKey: string): ScormDataModel | null {
    return this.scormState[lessonKey] || null;
  }

  public getScormData(lessonKey: string = 'pilot'): ScormDataModel {
    return (
      this.scormState[lessonKey] || {
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.score.raw': 85,
        'cmi.core.score.min': 0,
        'cmi.core.score.max': 100,
        'cmi.suspend_data': '{"checkpointIndex":1,"history":["node-intro"]}',
      }
    );
  }

  public recordXApi(opts: {
    verb: 'experienced' | 'interacted' | 'answered' | 'completed' | 'passed' | 'failed' | any;
    actor: { id?: string; name: string; mbox?: string };
    object: { id: string; type?: string; name: string };
    result?: any;
  }): XApiStatement {
    const verbDisplay = typeof opts.verb === 'string' ? opts.verb : 'interacted';
    const allowedVerbs = ['experienced', 'interacted', 'answered', 'completed', 'passed', 'failed'] as const;
    const finalVerb = allowedVerbs.includes(verbDisplay as any)
      ? (verbDisplay as 'experienced' | 'interacted' | 'answered' | 'completed' | 'passed' | 'failed')
      : 'interacted';

    return this.trackActivity(
      opts.actor.name,
      opts.actor.mbox?.replace('mailto:', '') || `${opts.actor.id || 'learner'}@aegis-security.com`,
      finalVerb,
      opts.object.id,
      opts.object.name,
      opts.object.type || 'activity',
      opts.result
        ? {
            rawScore: opts.result.score,
            success: opts.result.success,
            response: opts.result.response,
          }
        : undefined
    );
  }

  public recordRolePlayCompleted(
    scenarioId: string,
    title: string,
    score: number,
    passed: boolean,
    turns: number
  ): void {
    this.trackActivity(
      'Officer Learner',
      'learner@aegis-security.com',
      passed ? 'passed' : 'completed',
      scenarioId,
      title,
      'role-play-simulation',
      { rawScore: score, success: passed, response: `Completed in ${turns} turns` }
    );

    this.updateScormState('roleplay', passed ? 'passed' : 'completed', score);
  }

  public clearLogs(): void {
    this.statements = [];
    this.scormState = {};
    localStorage.removeItem(XAPI_STORAGE_KEY);
    localStorage.removeItem(SCORM_STORAGE_KEY);
  }

  public clearTracking(): void {
    this.clearLogs();
  }
}

export const trackingService = new TrackingService();
