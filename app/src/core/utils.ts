type TriggerEventMessage = {
  event_metadata: {
    event_id: string;
    event_type: string;
    created_at: string;
    cloud_id: string;
    folder_id: string;
  }
  details: {
    trigger_id: string;
    payload: string;
  }
}

export type TriggerEvent = TriggerEventMessage & {
  messages: TriggerEventMessage[]
}

export function triggerEventMessage(obj: any): obj is TriggerEventMessage {
  return obj && typeof obj === 'object' && 'event_metadata' in obj && 'details' in obj;
}

export function isTriggerEvent(obj: any): obj is TriggerEvent {
  return obj &&
    typeof obj === 'object' &&
    triggerEventMessage(obj) &&
    'messages' in obj &&
    Array.isArray(obj.messages) &&
    obj.messages.every(triggerEventMessage);
}