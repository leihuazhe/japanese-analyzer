import { AnalysisHistory, ExportOptions } from '../types/history';
import { getPosClass, posChineseMap } from '../utils/helpers';

export class ExportService {
  // 导出为图片
  static async exportAsImage(
    history: AnalysisHistory,
    options: ExportOptions
  ): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建画布上下文');

    // 设置画布尺寸
    canvas.width = 800;
    canvas.height = 600;

    // 设置背景
    ctx.fillStyle = '#f7f2fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 设置字体
    ctx.font = '24px "Noto Sans CJK SC", sans-serif';
    ctx.fillStyle = '#1d1b20';

    let y = 50;
    const lineHeight = 40;
    const margin = 40;

    // 标题
    ctx.font = 'bold 28px "Noto Sans CJK SC", sans-serif';
    ctx.fillText('日语句子分析', margin, y);
    y += lineHeight * 1.5;

    // 原句
    ctx.font = '20px "Noto Sans CJK SC", sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('原句：', margin, y);
    ctx.fillText(history.sentence, margin + 60, y);
    y += lineHeight;

    // 词汇分析
    y += 20;
    ctx.fillStyle = '#1d1b20';
    ctx.fillText('词汇分析：', margin, y);
    y += lineHeight;

    // 绘制词汇
    ctx.font = '16px "Noto Sans CJK SC", sans-serif';
    let x = margin;
    const maxWidth = canvas.width - margin * 2;

    for (const token of history.tokens) {
      if (token.pos === '改行') {
        y += lineHeight;
        x = margin;
        continue;
      }

      const text = `${token.word}(${posChineseMap[token.pos.split('-')[0]] || '未知'})`;
      const textWidth = ctx.measureText(text).width + 20;

      if (x + textWidth > maxWidth) {
        y += lineHeight;
        x = margin;
      }

      // 绘制词汇背景
      const posClass = getPosClass(token.pos);
      ctx.fillStyle = this.getPosColor(posClass);
      ctx.fillRect(x, y - 20, textWidth, 25);

      // 绘制词汇文本
      ctx.fillStyle = '#000';
      ctx.fillText(text, x + 5, y);

      x += textWidth + 10;
    }

    // 翻译
    if (options.includeTranslation && history.translation) {
      y += lineHeight * 2;
      ctx.fillStyle = '#1d1b20';
      ctx.font = '18px "Noto Sans CJK SC", sans-serif';
      ctx.fillText('翻译：', margin, y);
      y += lineHeight;
      
      // 处理长文本换行
      const words = history.translation.split('');
      let line = '';
      const maxCharsPerLine = 35;
      
      for (const char of words) {
        if (line.length >= maxCharsPerLine && char === ' ') {
          ctx.fillText(line, margin, y);
          y += lineHeight;
          line = '';
        } else {
          line += char;
        }
      }
      if (line) {
        ctx.fillText(line, margin, y);
      }
    }

    // 时间戳
    y += lineHeight * 2;
    ctx.font = '12px "Noto Sans CJK SC", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`生成时间：${history.createdAt.toLocaleString()}`, margin, y);

    // 下载图片
    const link = document.createElement('a');
    link.download = `japanese_analysis_${history.id}.${options.format}`;
    link.href = canvas.toDataURL(`image/${options.format}`, 0.9);
    link.click();
  }

  // 导出为文本
  static exportAsText(history: AnalysisHistory, options: ExportOptions): void {
    let content = '日语句子分析\n';
    content += '='.repeat(20) + '\n\n';
    content += `原句：${history.sentence}\n\n`;
    
    content += '词汇分析：\n';
    content += '-'.repeat(10) + '\n';
    
    for (const token of history.tokens) {
      if (token.pos === '改行') {
        content += '\n';
        continue;
      }
      
      content += `${token.word} - ${posChineseMap[token.pos.split('-')[0]] || '未知'}`;
      if (token.furigana && token.furigana !== token.word) {
        content += ` (${token.furigana})`;
      }
      if (token.romaji) {
        content += ` [${token.romaji}]`;
      }
      content += '\n';
    }

    if (options.includeTranslation && history.translation) {
      content += '\n翻译：\n';
      content += '-'.repeat(10) + '\n';
      content += history.translation + '\n';
    }

    content += `\n生成时间：${history.createdAt.toLocaleString()}\n`;

    // 下载文本文件
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `japanese_analysis_${history.id}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  // 导出为JSON
  static exportAsJson(history: AnalysisHistory): void {
    const jsonData = {
      ...history,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json;charset=utf-8' 
    });
    const link = document.createElement('a');
    link.download = `japanese_analysis_${history.id}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  // 获取词性对应的颜色
  private static getPosColor(posClass: string): string {
    const colorMap: Record<string, string> = {
      'pos-名詞': '#89CFF0',
      'pos-動詞': '#77DD77',
      'pos-形容詞': '#FFB347',
      'pos-副詞': '#C3B1E1',
      'pos-助詞': '#FF6961',
      'pos-助動詞': '#FF8FAB',
      'pos-接続詞': '#D2B48C',
      'pos-感動詞': '#AEC6CF',
      'pos-連体詞': '#7FFFD4',
      'pos-代名詞': '#ADD8E6',
      'pos-形状詞': '#FDFD96',
      'pos-記号': '#B2BEB5',
      'pos-接頭辞': '#DCDCDC',
      'pos-接尾辞': '#E6E6FA',
      'pos-フィラー': '#F5F5F5',
      'pos-その他': '#C0C0C0',
      'pos-default': '#E0E0E0'
    };
    return colorMap[posClass] || '#E0E0E0';
  }
}