// Define the type for a call record from the API
export interface Analysis {
  summary: string;
  sentiment: {
    positive: number;
    description: string;
  };
  keyTopics: string[];
  painPoints: string[];
  agentPerformance: {
    clarity: number;
    objectionHandling: number;
  };
  recommendations: string[];
}

export interface CallRecord {
    _id: string;
    cust_name: string;
    phone_number: string;
    customer_id: number | null;
    product_name?: string; 
    egress_id: string;
    started_at: string;
    ended_at: string;
    segments: string[];
    transcription: string;
    translated: string;
    analysis?: Analysis;
}