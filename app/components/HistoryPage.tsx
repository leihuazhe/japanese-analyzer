'use client';

import {useState, useEffect} from 'react';
import {FaSearch, FaTrash, FaDownload, FaVolumeUp, FaArrowLeft, FaHistory} from 'react-icons/fa';
import {HistoryService} from '../services/historyService';
import {ExportService} from '../services/exportService';
import {AnalysisHistory} from '../types/history';
import {getPosClass, posChineseMap, containsKanji, generateFuriganaParts} from '../utils/helpers';
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

interface HistoryPageProps {
    onBack: () => void;
}

// 定义可能的格式类型
type ExportFormat = 'png' | 'jpeg' | 'txt' | 'json';
interface ExportOptions {
    includeAudio: boolean;
    includeTranslation: boolean;
    format: ExportFormat; // 使用定义的类型
}

export default function HistoryPage({onBack}: HistoryPageProps) {
    const [histories, setHistories] = useState<AnalysisHistory[]>([]);
    const [filteredHistories, setFilteredHistories] = useState<AnalysisHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        includeAudio: false,
        includeTranslation: true,
        format: 'png'
    });

    // 加载历史记录
    useEffect(() => {
        loadHistories();
    }, []);

    // 搜索过滤
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredHistories(histories);
        } else {
            const filtered = HistoryService.search(searchQuery);
            setFilteredHistories(filtered);
        }
    }, [searchQuery, histories]);

    const loadHistories = () => {
        const data = HistoryService.getAll();
        setHistories(data);
    };

    const handleDelete = (id: string) => {
        if (confirm('确定要删除这条记录吗？')) {
            HistoryService.delete(id);
            loadHistories();
            if (selectedHistory?.id === id) {
                setSelectedHistory(null);
            }
        }
    };

    const handleClearAll = () => {
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            HistoryService.clear();
            loadHistories();
            setSelectedHistory(null);
        }
    };

    const handleExport = async () => {
        if (!selectedHistory) return;

        try {
            switch (exportOptions.format) {
                case 'png':
                case 'jpeg':
                    await ExportService.exportAsImage(selectedHistory, exportOptions);
                    break;
                case 'txt':
                    ExportService.exportAsText(selectedHistory, exportOptions);
                    break;
                case 'json':
                    ExportService.exportAsJson(selectedHistory);
                    break;
            }
            setShowExportModal(false);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请重试');
        }
    };

    const playAudio = (audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
            console.error('音频播放失败:', error);
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* 头部 */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="material-icon-button material-ripple w-10 h-10 text-gray-600 dark:text-gray-400"
                                title="返回"
                            >
                                <FaArrowLeft/>
                            </button>
                            <div className="flex items-center space-x-2">
                                <FaHistory className="text-primary-600 dark:text-primary-400"/>
                                <h1 className="md-typescale-headline-medium text-gray-800 dark:text-gray-100">
                                    分析历史记录
                                </h1>
                            </div>
                        </div>

                        {histories.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="material-outlined-button material-button-base material-ripple px-4 py-2 text-red-600 border-red-300 hover:bg-red-50"
                                title="清空所有记录"
                            >
                                <FaTrash className="w-4 h-4 mr-2"/>
                                清空全部
                            </button>
                        )}
                    </div>

                    {/* 搜索框 */}
                    <div className="mt-4 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="搜索句子、翻译或词汇..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {filteredHistories.length === 0 ? (
                    <div className="text-center py-12">
                        <FaHistory className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4"/>
                        <h3 className="md-typescale-headline-small text-gray-500 dark:text-gray-400 mb-2">
                            {searchQuery ? '没有找到匹配的记录' : '暂无历史记录'}
                        </h3>
                        <p className="md-typescale-body-medium text-gray-400 dark:text-gray-500">
                            {searchQuery ? '尝试使用其他关键词搜索' : '开始分析日语句子后，记录将显示在这里'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 历史记录列表 */}
                        <div className="space-y-4">
                            <h2 className="md-typescale-title-large text-gray-800 dark:text-gray-100 mb-4">
                                记录列表 ({filteredHistories.length})
                            </h2>

                            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {filteredHistories.map((history) => (
                                    <div
                                        key={history.id}
                                        className={`premium-card cursor-pointer transition-all duration-200 ${
                                            selectedHistory?.id === history.id
                                                ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'hover:shadow-md'
                                        }`}
                                        onClick={() => setSelectedHistory(history)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="md-typescale-body-large text-gray-800 dark:text-gray-100 font-medium truncate">
                                                    {history.sentence}
                                                </p>
                                                {history.translation && (
                                                    <p className="md-typescale-body-small text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {history.translation}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                {history.audioUrl && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAudio(history.audioUrl!);
                                                        }}
                                                        className="material-icon-button material-ripple w-8 h-8 text-blue-600 hover:bg-blue-100"
                                                        title="播放音频"
                                                    >
                                                        <FaVolumeUp className="w-3 h-3"/>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(history.id);
                                                    }}
                                                    className="material-icon-button material-ripple w-8 h-8 text-red-600 hover:bg-red-100"
                                                    title="删除记录"
                                                >
                                                    <FaTrash className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                            <span>{history.tokens.length} 个词汇</span>
                                            <span>{history.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 详细内容 */}
                        <div className="lg:sticky lg:top-24 lg:h-fit">
                            {selectedHistory ? (
                                <div className="premium-card">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="md-typescale-title-large text-gray-800 dark:text-gray-100">
                                            详细分析
                                        </h2>
                                        <button
                                            onClick={() => setShowExportModal(true)}
                                            className="material-filled-tonal-button material-button-base material-ripple px-4 py-2"
                                            title="导出"
                                        >
                                            <FaDownload className="w-4 h-4 mr-2"/>
                                            导出
                                        </button>
                                    </div>

                                    {/* 原句 */}
                                    <div className="mb-6">
                                        <h3 className="md-typescale-title-medium text-gray-700 dark:text-gray-300 mb-2">
                                            原句
                                        </h3>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="md-typescale-body-large text-gray-800 dark:text-gray-100 japanese-text">
                                                {selectedHistory.sentence}
                                            </p>
                                            {selectedHistory.audioUrl && (
                                                <button
                                                    onClick={() => playAudio(selectedHistory.audioUrl!)}
                                                    className="mt-2 material-outlined-button material-button-base material-ripple px-3 py-1 text-sm"
                                                >
                                                    <FaVolumeUp className="w-3 h-3 mr-1"/>
                                                    播放
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 词汇分析 */}
                                    <div className="mb-6">
                                        <h3 className="md-typescale-title-medium text-gray-700 dark:text-gray-300 mb-2">
                                            词汇分析
                                        </h3>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <div className="text-gray-800 dark:text-gray-100 leading-loose">
                                                {selectedHistory.tokens.map((token, index) => {
                                                    if (token.pos === '改行') {
                                                        return <br key={index}/>;
                                                    }

                                                    return (
                                                        <span key={index}
                                                              className="word-unit-wrapper tooltip inline-block mr-2 mb-2">
                              <span className={`word-token ${getPosClass(token.pos)} px-2 py-1 rounded text-sm`}>
                                {token.furigana && token.furigana !== token.word && containsKanji(token.word) && token.pos !== '記号'
                                    ? generateFuriganaParts(token.word, token.furigana).map((part, i) =>
                                        part.ruby ? (
                                            <ruby key={i}>
                                                {part.base}
                                                <rt>{part.ruby}</rt>
                                            </ruby>
                                        ) : (
                                            <span key={i}>{part.base}</span>
                                        )
                                    )
                                    : token.word}
                              </span>
                              <span className="tooltiptext">
                                {posChineseMap[token.pos.split('-')[0]] || posChineseMap['default']}
                              </span>
                            </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 翻译 */}
                                    {selectedHistory.translation && (
                                        <div className="mb-6">
                                            <h3 className="md-typescale-title-medium text-gray-700 dark:text-gray-300 mb-2">
                                                翻译
                                            </h3>
                                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                <div className="md-typescale-body-medium text-gray-800 dark:text-gray-100">
                                                    <MarkdownRenderer content={selectedHistory.translation} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 时间信息 */}
                                    <div
                                        className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <p>创建时间：{selectedHistory.createdAt.toLocaleString()}</p>
                                        {selectedHistory.updatedAt.getTime() !== selectedHistory.createdAt.getTime() && (
                                            <p>更新时间：{selectedHistory.updatedAt.toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="premium-card text-center py-12">
                                    <FaHistory className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4"/>
                                    <p className="md-typescale-body-medium text-gray-500 dark:text-gray-400">
                                        选择一条记录查看详细内容
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 导出模态框 */}
            {showExportModal && selectedHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
                        <div className="p-6">
                            <h3 className="md-typescale-title-large text-gray-800 dark:text-gray-100 mb-4">
                                导出选项
                            </h3>

                            <div className="space-y-4">
                                {/* 格式选择 */}
                                <div>
                                    <label
                                        className="block md-typescale-body-medium text-gray-700 dark:text-gray-300 mb-2">
                                        导出格式
                                    </label>
                                    <select
                                        value={exportOptions.format}
                                        onChange={(e) => setExportOptions(prev => ({
                                            ...prev,
                                            format: e.target.value as ExportFormat
                                        }))}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="png">PNG 图片</option>
                                        <option value="jpeg">JPEG 图片</option>
                                        <option value="txt">文本文件</option>
                                        <option value="json">JSON 数据</option>
                                    </select>
                                </div>

                                {/* 选项 */}
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeTranslation}
                                            onChange={(e) => setExportOptions(prev => ({
                                                ...prev,
                                                includeTranslation: e.target.checked
                                            }))}
                                            className="mr-2"
                                        />
                                        <span className="md-typescale-body-medium text-gray-700 dark:text-gray-300">
                      包含翻译
                    </span>
                                    </label>

                                    {selectedHistory.audioUrl && (
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeAudio}
                                                onChange={(e) => setExportOptions(prev => ({
                                                    ...prev,
                                                    includeAudio: e.target.checked
                                                }))}
                                                className="mr-2"
                                            />
                                            <span className="md-typescale-body-medium text-gray-700 dark:text-gray-300">
                        包含音频信息
                      </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="material-outlined-button material-button-base material-ripple px-4 py-2"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="material-filled-button material-button-base material-ripple px-4 py-2"
                                >
                                    <FaDownload className="w-4 h-4 mr-2"/>
                                    导出
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}