import { AnalysisHistory, TokenData } from '../types/history';

const STORAGE_KEY = 'japanese_analysis_history';

export class HistoryService {
  // 获取所有历史记录
  static getAll(): AnalysisHistory[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const histories = JSON.parse(data) as AnalysisHistory[];
      return histories.map(h => ({
        ...h,
        createdAt: new Date(h.createdAt),
        updatedAt: new Date(h.updatedAt)
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  // 保存新的分析记录
  static save(
    sentence: string,
    tokens: TokenData[],
    translation?: string,
    audioUrl?: string
  ): AnalysisHistory {
    const now = new Date();
    const newRecord: AnalysisHistory = {
      id: `analysis_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      sentence,
      tokens,
      translation,
      audioUrl,
      createdAt: now,
      updatedAt: now
    };

    const histories = this.getAll();
    histories.unshift(newRecord);
    
    // 限制最多保存100条记录
    const limitedHistories = histories.slice(0, 100);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistories));
    } catch (error) {
      console.error('Failed to save history:', error);
      // 如果存储失败，尝试清理旧记录
      const reducedHistories = histories.slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistories));
      } catch (secondError) {
        console.error('Failed to save reduced history:', secondError);
      }
    }

    return newRecord;
  }

  // 删除指定记录
  static delete(id: string): boolean {
    try {
      const histories = this.getAll();
      const filteredHistories = histories.filter(h => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistories));
      return true;
    } catch (error) {
      console.error('Failed to delete history:', error);
      return false;
    }
  }

  // 清空所有记录
  static clear(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  // 更新记录
  static update(id: string, updates: Partial<AnalysisHistory>): boolean {
    try {
      const histories = this.getAll();
      const index = histories.findIndex(h => h.id === id);
      if (index === -1) return false;

      histories[index] = {
        ...histories[index],
        ...updates,
        updatedAt: new Date()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
      return true;
    } catch (error) {
      console.error('Failed to update history:', error);
      return false;
    }
  }

  // 搜索记录
  static search(query: string): AnalysisHistory[] {
    const histories = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return histories.filter(h => 
      h.sentence.toLowerCase().includes(lowerQuery) ||
      (h.translation && h.translation.toLowerCase().includes(lowerQuery)) ||
      h.tokens.some(token => 
        token.word.toLowerCase().includes(lowerQuery) ||
        (token.furigana && token.furigana.toLowerCase().includes(lowerQuery))
      )
    );
  }
}