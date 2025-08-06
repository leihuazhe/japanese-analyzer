'use client';

import { useState } from 'react';
import { FaSave, FaCheck } from 'react-icons/fa';
import { HistoryService } from '../services/historyService';
import { TokenData } from '../types/history';

interface SaveButtonProps {
  sentence: string;
  tokens: TokenData[];
  translation?: string;
  audioUrl?: string;
  onSaved?: (id: string) => void;
}

export default function SaveButton({
  sentence,
  tokens,
  translation,
  audioUrl,
  onSaved
}: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!sentence || !tokens.length) return;

    setIsSaving(true);
    try {
      const savedRecord = HistoryService.save(sentence, tokens, translation, audioUrl);
      setIsSaved(true);
      onSaved?.(savedRecord.id);
      
      // 2秒后重置状态
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || !sentence || !tokens.length}
      className={`material-filled-button material-button-base material-ripple px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
        isSaved 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      title={isSaved ? '已保存' : '保存分析结果'}
    >
      {isSaving ? (
        <>
          <div className="loading-spinner w-4 h-4 mr-2"></div>
          保存中...
        </>
      ) : isSaved ? (
        <>
          <FaCheck className="w-4 h-4 mr-2" />
          已保存
        </>
      ) : (
        <>
          <FaSave className="w-4 h-4 mr-2" />
          保存
        </>
      )}
    </button>
  );
}