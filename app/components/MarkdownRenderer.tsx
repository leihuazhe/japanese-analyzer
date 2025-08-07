import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Components} from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({content}) => {
    const customComponents: Components = {
        // 代码块
        code: ({className, children}) => {
            const inline = !className;

            return inline ? (
                <code
                    className="bg-neutral-100 dark:bg-neutral-800 text-pink-600 px-1 py-0.5 rounded font-mono text-sm">
                    {children}
                </code>
            ) : (
                <pre
                    className="bg-zinc-900 text-white rounded-md p-4 overflow-x-auto text-sm leading-relaxed font-mono my-4 border border-zinc-700">
          <code className={className}>{children}</code>
        </pre>
            );
        },

        // 段落
        p: ({children}) => (
            <p className="my-3 leading-7 text-base text-gray-800 dark:text-gray-200">
                {children}
            </p>
        ),

        // 强调（粗体）
        strong: ({children}) => (
            <strong className="text-primary font-semibold dark:text-yellow-300">
                {children}
            </strong>
        ),

        // 斜体
        em: ({children}) => (
            <em className="italic text-orange-600 dark:text-orange-400">
                {children}
            </em>
        ),

        // 无序列表
        ul: ({children}) => (
            <ul className="list-disc pl-6 my-3 text-base text-gray-800 dark:text-gray-200">
                {children}
            </ul>
        ),

        // 有序列表
        ol: ({children}) => (
            <ol className="list-decimal pl-6 my-3 text-base text-gray-800 dark:text-gray-200">
                {children}
            </ol>
        ),

        // 列表项
        li: ({children}) => (
            <li className="mb-1 marker:text-gray-600 dark:marker:text-gray-400">{children}</li>
        ),

        // 标题优化（可根据需要加锚点、交互等）
        h1: ({children}) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                {children}
            </h1>
        ),
        h2: ({children}) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3 text-gray-900 dark:text-white">
                {children}
            </h2>
        ),
        h3: ({children}) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
                {children}
            </h3>
        ),
    };

    return (
        <div
            className="prose prose-zinc dark:prose-invert max-w-none border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm bg-white dark:bg-zinc-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
