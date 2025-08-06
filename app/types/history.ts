export interface AnalysisHistory {
  id: string;
  sentence: string;
  tokens: TokenData[];
  translation?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenData {
  word: string;
  pos: string;
  furigana?: string;
  romaji?: string;
}

export interface ExportOptions {
  includeAudio: boolean;
  includeTranslation: boolean;
  format: 'png' | 'jpeg' | 'txt' | 'json';
}