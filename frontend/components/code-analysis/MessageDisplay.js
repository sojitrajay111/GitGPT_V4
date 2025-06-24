"use client";

import React from "react";
import { Bot, User, Github, UploadCloud, GitPullRequest, Copy } from "lucide-react"; // Added Copy icon
import MarkdownRenderer from "@/components/code-analysis/AiResponse";

// Helper function to parse AI response for code blocks
const parseAiCodeResponse = (aiResponseText) => {
    if (typeof aiResponseText !== "string") return [];
    const codeBlocks = [];
    const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(aiResponseText)) !== null) {
        const content = match[1].trim();
        // Attempt to extract file path from the first line if it looks like a comment
        let filePath = 'untitled';
        const firstLine = content.split('\n')[0];
        if (firstLine.startsWith('//') || firstLine.startsWith('#')) {
            filePath = firstLine.substring(2).trim() || 'untitled';
            // Remove the file path line from the content if it was detected
            const contentWithoutPath = content.substring(firstLine.length).trim();
            codeBlocks.push({ filePath, content: contentWithoutPath });
        } else {
            codeBlocks.push({ filePath, content });
        }
    }
    return codeBlocks;
};

const MessageDisplay = React.memo(({ msg }) => {
    const isUser = msg.sender === "user";
    const isAI = msg.sender === "ai";
    const isSystem = msg.sender === "system";

    const codeBlocksFromAi = isAI ? parseAiCodeResponse(msg.text) : [];

    const copyToClipboard = (text) => {
        // Use document.execCommand('copy') for better iframe compatibility
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            // Optional: Add a temporary visual feedback, like a "Copied!" tooltip
            console.log('Code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    return (
        // Changed overall alignment: user messages now justify-start (left), AI/System justify-end (right)
        <div className={`flex w-full mb-6 ${isUser ? "justify-start" : "justify-end"}`}>
            {/* Container for Avatar + Message Bubble for alignment */}
            <div className={`flex ${isUser ? "flex-row" : "flex-row-reverse"} items-start w-full`}>
                {/* Avatar Area */}
                <div className={`flex-shrink-0 ${isUser ? "mr-4" : "ml-4"}`}>
                    {isUser ? (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
                            {/* You can replace this with an actual user avatar if available */}
                            {msg.sender === "user" ? "You" : ""}
                        </div>
                    ) : isAI ? (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                            <Bot size={20} className="text-gray-400" />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                            <Github size={20} className="text-amber-400" />
                        </div>
                    )}
                </div>

                {/* Message Bubble */}
                <div
                    className={`flex-1 rounded-lg p-3 text-sm leading-relaxed
            ${isUser
                            ? "bg-gray-700 text-gray-100" // User message: Gray background, subtle border
                            : isAI
                                ? "bg-gray-800 text-gray-100" // AI message: same as user
                                : "bg-gray-800 text-amber-50 border border-gray-600" // System message: subtle border for distinction
                        }
            ${isSystem && msg.isError
                            ? "bg-red-900  text-red-50 border-red-700" // Error system message: distinct red
                            : ""
                        }`}
                >
                    {/* Sender & Timestamp */}
                    <div className={`flex items-center mb-1.5 ${isUser ? "justify-start" : "justify-end"}`}>
                        <span className={`font-medium text-xs ${isUser ? "text-gray-300" : "text-gray-300"}`}>
                            {isUser ? "You" : isAI ? "Assistant" : "System"}
                        </span>
                        {msg.createdAt && (
                            <span
                                className={`ml-2 text-xs opacity-70 ${isUser ? "text-gray-400" : "text-gray-400"
                                    }`}
                            >
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </div>

                    {/* Message Content */}
                    {/* <div className="text-gray-100 break-words">
            {isAI ? (
              <MarkdownRenderer content={msg.text} darkMode={true} />
            ) : (
              msg.text
            )}
          </div> */}
                    <div className="text-gray-100 break-words">
                        {isAI ? (
                            <div className="w-full max-w-[600px] mx-auto">
                                <MarkdownRenderer content={msg.text} darkMode={true} />
                            </div>
                        ) : (
                            msg.text
                        )}
                    </div>

                    {isSystem && msg.prUrl && (
                        <a
                            href={msg.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-blue-400 hover:text-blue-300 underline font-medium transition-colors duration-200 text-xs"
                        >
                            View Pull Request{" "}
                            <GitPullRequest size={14} className="inline ml-1" />
                        </a>
                    )}

                    {/* Extracted Code Blocks (for AI messages) */}
                    {codeBlocksFromAi.length > 0 && (
                        <details className="mt-3 ml-7 bg-gray-900 p-2 rounded-lg border max-w-[600px] border-gray-700 text-gray-200 w-full">
                            <summary className="cursor-pointer text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center">
                                <UploadCloud size={14} className="mr-1.5" /> View Extracted Code
                            </summary>
                            <div className="mt-2 space-y-2">
                                {codeBlocksFromAi.map((block, index) => (
                                    <div key={index} className="bg-gray-800 rounded-md overflow-hidden border border-gray-700"> {/* Container for each code block */}
                                        <div className="flex justify-between items-center bg-gray-700 px-3 py-2 text-gray-400 text-xs font-mono border-b border-gray-600">
                                            <span>{block.filePath}</span>
                                            <button
                                                onClick={() => copyToClipboard(block.content)}
                                                className="flex items-center text-gray-400 hover:text-gray-200 px-2 py-1 rounded-md transition-colors"
                                                title="Copy code"
                                            >
                                                <Copy size={12} className="mr-1" /> Copy
                                            </button>
                                        </div>
                                        <pre className="p-2 bg-black text-gray-100 text-xs overflow-x-auto whitespace-pre-wrap break-words w-full max-w-full relative">
                                            <code className="grid grid-cols-[auto,1fr] gap-x-2"> {/* Using grid for line numbers */}
                                                {block.content.split('\n').map((line, lineIndex) => (
                                                    <React.Fragment key={lineIndex}>
                                                        <span className="text-gray-500 text-right select-none">{lineIndex + 1}</span> {/* Line number */}
                                                        <span>{line}</span> {/* Code line */}
                                                    </React.Fragment>
                                                ))}
                                            </code>
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MessageDisplay;
