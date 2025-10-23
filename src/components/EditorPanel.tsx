import React, { useMemo, useRef, useState } from "react";
import { Select, Button } from "antd";
import Editor, { loader, useMonaco } from "@monaco-editor/react";

// Optional: preload monaco to avoid first-render delay
loader.config({ monaco: undefined });

interface Props {
  initialCode?: string;
  language?: string; // e.g. 'javascript' | 'typescript' | 'python' | 'cpp'
  theme?: "vs-dark" | "light";
}

const defaultCode = `// 两数之和 - JavaScript 示例\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (map.has(need)) return [map.get(need), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2,7,11,15], 9)); // [0,1]\n`;

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
];

const EditorPanel: React.FC<Props> = ({ initialCode, language = "javascript", theme = "vs-dark" }) => {
  const monaco = useMonaco();
  const [lang, setLang] = useState<string>(language);
  const [code, setCode] = useState<string>(initialCode ?? defaultCode);

  // Resize handling (Monaco has automaticLayout option)
  const editorRef = useRef<any>(null);
  const onMount = (editor: any) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    if (lang === "javascript") {
      try {
        // Simple sandboxed execution for JS (no I/O), purely for demo
        // eslint-disable-next-line no-new-func
        const fn = new Function(code);
        fn();
      } catch (e) {
        console.error(e);
        alert(String(e));
      }
    } else {
      alert("当前仅支持在浏览器中运行 JavaScript 示例。其它语言可编辑但不执行。");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <Select
          value={lang}
          onChange={setLang}
          options={languageOptions}
          size="small"
          style={{ width: 140 }}
        />
        <Button size="small" type="primary" onClick={runCode}>
          运行
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          theme={theme}
          language={lang}
          value={code}
          onChange={(v) => setCode(v || "")}
          onMount={onMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;