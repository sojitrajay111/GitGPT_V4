import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkEmoji from "remark-emoji";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  oneDark, 
  oneLight,
  materialLight,
  materialDark,
  atomDark,
  
  darcula
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  ClipboardIcon, 
  CheckIcon,
  CodeBracketIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { Tooltip } from "@mui/material";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

// Supported syntax highlighting themes
const syntaxThemes = {
  'One Dark': oneDark,
  'One Light': oneLight,
  'Material Dark': materialDark,
  'Material Light': materialLight,
  'Atom Dark': atomDark,
  // 'GitHub': github,
  'Darcula': darcula
};

const Mermaid = ({ chart, darkMode }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.initialize({ 
          startOnLoad: true,
          theme: darkMode ? 'dark' : 'default',
          securityLevel: 'loose'
        });
        mermaid.render("mermaid-diagram", chart, (svgCode) => {
          ref.current.innerHTML = svgCode;
        });
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        ref.current.innerHTML = `<div class="text-red-500 p-2">Mermaid diagram error: ${error.message}</div>`;
      }
    }
  }, [chart, darkMode]);

  return (
    <div 
      ref={ref} 
      className={`overflow-x-auto my-4 p-4 rounded-lg border ${
        darkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}
    />
  );
};

const MarkdownRenderer = ({ 
  content, 
  darkMode = false,
  syntaxTheme = 'One Dark'
}) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [showRawCode, setShowRawCode] = useState({});
  const codeBlockRefs = useRef({});

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleRawCode = (id) => {
    setShowRawCode(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSyntaxTheme = () => {
    return syntaxThemes[syntaxTheme] || 
          (darkMode ? oneDark : oneLight);
  };

  return (
    <div className={`prose prose-sm max-w-none ${
      darkMode 
        ? 'text-gray-200 prose-invert' 
        : 'text-gray-900'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold my-4 border-b pb-2 border-gray-300 dark:border-gray-700">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold my-3 border-b pb-1 border-gray-200 dark:border-gray-700">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold my-2">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1">
              {children}
            </li>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`
              border-l-4 pl-4 italic my-4
              ${darkMode 
                ? 'border-blue-400 bg-gray-800 text-gray-300' 
                : 'border-blue-500 bg-blue-50 text-gray-700'
              }
            `}>
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={`
              ${darkMode 
                ? 'bg-gray-700 text-gray-200' 
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className={`
              px-4 py-2 font-semibold text-left border-b
              ${darkMode 
                ? 'border-gray-600' 
                : 'border-gray-300'
              }
            `}>
              {children}
            </th>
          ),
          tr: ({ children }) => (
            <tr className={`
              ${darkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-50'
              }
            `}>
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className={`
              px-4 py-2 border-b
              ${darkMode 
                ? 'border-gray-700' 
                : 'border-gray-200'
              }
            `}>
              {children}
            </td>
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const id = Math.random().toString(36).substr(2, 8);

            if (!inline && match) {
              if (match[1] === "mermaid") {
                return <Mermaid chart={codeString} darkMode={darkMode} />;
              }

              return (
                <div className={`relative group my-4 rounded-lg overflow-hidden border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className={`
                    flex justify-between items-center px-3 py-1 text-xs
                    ${darkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    <span>{match[1]}</span>
                    <div className="flex space-x-2">
                      <Tooltip title={showRawCode[id] ? "Show rendered" : "Show raw code"}>
                        <button
                          onClick={() => toggleRawCode(id)}
                          className="p-1 rounded hover:bg-gray-600/20"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip title="Copy code">
                        <button
                          onClick={() => handleCopy(codeString, id)}
                          className="p-1 rounded hover:bg-gray-600/20"
                        >
                          {copiedCode === id ? (
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ClipboardIcon className="w-4 h-4" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {showRawCode[id] ? (
                    <pre className={`
                      p-4 m-0 overflow-x-auto text-sm font-mono
                      ${darkMode 
                        ? 'bg-gray-900 text-gray-300' 
                        : 'bg-white text-gray-800'
                      }
                    `}>
                      {codeString}
                    </pre>
                  ) : (
                    <SyntaxHighlighter
                      style={getSyntaxTheme()}
                      language={match[1]}
                      PreTag="div"
                      className="m-0 text-sm"
                      showLineNumbers
                      wrapLines
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  )}
                </div>
              );
            }

            return (
              <code className={`
                px-1.5 py-0.5 rounded text-sm font-mono
                ${darkMode 
                  ? 'bg-gray-700 text-gray-200' 
                  : 'bg-gray-100 text-gray-800'
                }
              `} {...props}>
                {children}
              </code>
            );
          },
          img: ({ node, ...props }) => (
            <div className="my-4 flex flex-col items-center">
              <img
                {...props}
                className={`
                  rounded-lg max-w-full cursor-zoom-in border
                  ${darkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                  }
                `}
                onClick={() => window.open(props.src, "_blank")}
              />
              {props.alt && (
                <p className={`
                  text-sm mt-2 text-center italic
                  ${darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
                  }
                `}>
                  {props.alt}
                </p>
              )}
            </div>
          ),
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              className={`
                text-blue-600 dark:text-blue-400 hover:underline
                ${props.href?.startsWith('#') ? 'no-underline' : ''}
              `}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          hr: () => (
            <hr className={`
              my-6 border-t
              ${darkMode 
                ? 'border-gray-700' 
                : 'border-gray-300'
              }
            `} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;