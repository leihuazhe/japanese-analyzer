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
  // console.log('SaveButton props:', { sentence, tokensLength: tokens.length });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // 用于显示保存状态或错误信息


  const handleSave = async () => {
    if (!sentence || !tokens.length) return;

    setIsSaving(true);
    try {
      const savedRecord = HistoryService.save(sentence, tokens, translation, audioUrl);
      // 成功保存
      if (savedRecord) {
        setIsSaved(true);
        setSaveMessage('已保存');
        onSaved?.(savedRecord.id);
        // 2秒后重置状态
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage(null);
        }, 2000);
      } else {
        // 因重复而未保存
        setIsSaved(true);
        setSaveMessage('该句子已存在');
        // 可以选择在这里显示一个短暂的提示，或者让按钮保持原样
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage(null);
        }, 2000); // 2秒后清除提示
      }
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
              isSaved // 成功保存时显示绿色
                  ? 'bg-green-600 hover:bg-green-700'
                  : (saveMessage === '该句子已存在' || saveMessage === '保存失败' // 重复或失败时显示橙色或红色
                      ? 'bg-orange-500 hover:bg-orange-600' // 示例颜色，你可以选择红色
                      : 'bg-blue-600 hover:bg-blue-700') // 默认蓝色
          }`}
          title={isSaved ? '已保存' : (saveMessage || '保存分析结果')} // 标题显示消息
      >
        {isSaving ? (
            <>
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              保存中...
            </>
        ) : saveMessage ? ( // 显示保存消息（已保存，已存在，失败）
            <>
              {isSaved ? <FaCheck className="w-4 h-4 mr-2" /> : null} {/* 只有成功保存才显示对勾 */}
              {saveMessage}
            </>
        ) : ( // 默认状态
            <>
              <FaSave className="w-4 h-4 mr-2" />
              保存
            </>
        )}
      </button>
  );
}