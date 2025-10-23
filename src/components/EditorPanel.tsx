import React, { useRef, useState } from "react";
import { Select, Button } from "antd";
// 新增：Tabs、Tag、Input 用于测试结果与输入编辑
import { Tabs, Tag, Input, Segmented } from "antd";
import Editor, { loader } from "@monaco-editor/react";

loader.config({ monaco: undefined });

interface Props {
  initialCode?: string;
  language?: string;
  theme?: "vs-dark" | "light";
}

interface RunCase {
  name: string;
  input: string; // 用例的输入片段（会在运行前注入）
  output: string;
  timeMs?: number | null;
  passed?: boolean | null;
  expected?: string; // 期望输出，用于判定是否通过
  error?: string | null; // 报错信息（静态检查/编译错误/运行异常）
}
interface RunResult {
  passed: boolean | null; // 所有用例整体是否通过
  timeMs: number | null; // 总耗时（所有用例）
  cases: RunCase[];
}

const defaultCode = `// 两数之和 - TypeScript 示例\nfunction twoSum(nums: number[], target: number): [number, number] | [] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (map.has(need)) return [map.get(need)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2,7,11,15], 9)); // [0,1]\n`;

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
];

const EditorPanel: React.FC<Props> = ({ initialCode, language = "typescript", theme = "vs-dark" }) => {
  const [lang, setLang] = useState<string>(language);
  const [code, setCode] = useState<string>(initialCode ?? defaultCode);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [outputHeight, setOutputHeight] = useState<number>(164);
  const [dragging, setDragging] = useState<boolean>(false);
  const splitterHeight = 6;

  // 测试结果状态：默认两个用例以贴近原型
  const [result, setResult] = useState<RunResult>({
    passed: null,
    timeMs: null,
    cases: [
      { name: "Case 1", input: "", output: "", timeMs: null, passed: null, expected: "", error: null },
      { name: "Case 2", input: "", output: "", timeMs: null, passed: null, expected: "", error: null },
    ],
  });
  const [activeCaseKey, setActiveCaseKey] = useState<string>("Case 1");
  // 视图状态：测试用例 / 测试结果
  const [viewMode, setViewMode] = useState<"cases" | "results">("cases");

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onMount = (editor: any) => {
    editorRef.current = editor;
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const minEditor = 80;
      const minOutput = 100;
      let editorH = e.clientY - rect.top;
      editorH = Math.max(minEditor, Math.min(rect.height - splitterHeight - minOutput, editorH));
      const newOutput = rect.height - editorH - splitterHeight;
      setOutputHeight(newOutput);
    };
    const onMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const formatCode = async () => {
    const editor = editorRef.current;
    try {
      await editor?.getAction?.("editor.action.formatDocument")?.run?.();
    } catch {}
  };

  const clearOutput = () => {
    setOutputs([]);
    setResult((prev) => ({
      passed: null,
      timeMs: null,
      cases: prev.cases.map((c) => ({ ...c, output: "", timeMs: null, passed: null, error: null })),
    }));
  };

  // 更新当前用例的输入片段
  const updateActiveCaseInput = (value: string) => {
    setResult((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => (c.name === activeCaseKey ? { ...c, input: value } : c)),
    }));
  };
  // 新增：更新当前用例的期望输出
  const updateActiveCaseExpected = (value: string) => {
    setResult((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => (c.name === activeCaseKey ? { ...c, expected: value } : c)),
    }));
  };

  // Tabs 可编辑卡片：新增/删除用例
  const onEditTabs = (targetKey: any, action: "add" | "remove") => {
    if (action === "add") {
      setResult((prev) => {
        const nextIdx = prev.cases.length + 1;
        const name = `Case ${nextIdx}`;
        return {
          ...prev,
          cases: [...prev.cases, { name, input: "", output: "", timeMs: null, passed: null, expected: "", error: null }],
        };
      });
      setActiveCaseKey((prev) => `Case ${result.cases.length + 1}`);
    } else if (action === "remove") {
      setResult((prev) => {
        const filtered = prev.cases.filter((c) => c.name !== targetKey);
        const newActive = filtered.length ? filtered[0].name : "Case 1";
        setActiveCaseKey(newActive);
        return { ...prev, cases: filtered };
      });
    }
  };

  const runCode = async () => {
    const ts = await import("typescript");
    const startAll = performance.now();
    let anyFailed = false;
    const updatedCases: RunCase[] = [];

    // 逐用例运行
    for (const c of (result.cases.length ? result.cases : [{ name: "Case 1", input: "", output: "" }])) {
      const origLog = console.log;
      const caseLines: string[] = [];
      console.log = (...args: any[]) => {
        const text = args
          .map((a) => {
            try { return typeof a === "string" ? a : JSON.stringify(a); } catch { return String(a); }
          })
          .join(" ");
        caseLines.push(text);
        origLog(...args);
      };

      const start = performance.now();
      let casePassed: boolean | null = null;
      let errorText: string | null = null;
      try {
        const combined = `${c.input ? c.input + "\n" : ""}${code}`;
        if (lang === "javascript") {
          const sf = ts.createSourceFile("input.js", combined, ts.ScriptTarget.ES2018, true, ts.ScriptKind.JS);
          const bareMsgs: string[] = [];
          const visit = (node: any) => {
            if (ts.isExpressionStatement(node) && ts.isIdentifier(node.expression)) {
              const pos = sf.getLineAndCharacterOfPosition(node.expression.getStart(sf));
              bareMsgs.push(`input.js:${pos.line + 1}:${pos.character + 1} 发现独立标识符 '${node.expression.text}'`);
            }
            ts.forEachChild(node, visit);
          };
          visit(sf);
          if (bareMsgs.length) {
            errorText = ["静态检查（已阻止执行）：", ...bareMsgs].join("\n");
            casePassed = false;
          } else {
            // eslint-disable-next-line no-new-func
            const fn = new Function(combined);
            fn();
            casePassed = true;
          }
        } else if (lang === "typescript") {
          const sfPre = ts.createSourceFile("input.ts", combined, ts.ScriptTarget.ES2018, true, ts.ScriptKind.TS);
          const bareMsgsTS: string[] = [];
          const visitPre = (node: any) => {
            if (ts.isExpressionStatement(node) && ts.isIdentifier(node.expression)) {
              const pos = sfPre.getLineAndCharacterOfPosition(node.expression.getStart(sfPre));
              bareMsgsTS.push(`input.ts:${pos.line + 1}:${pos.character + 1} 发现独立标识符 '${node.expression.text}'`);
            }
            ts.forEachChild(node, visitPre);
          };
          visitPre(sfPre);
          if (bareMsgsTS.length) {
            errorText = ["静态检查（已阻止执行）：", ...bareMsgsTS].join("\n");
            casePassed = false;
          } else {
            const resultTS = ts.transpileModule(combined, {
              compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ES2018,
                jsx: ts.JsxEmit.React,
              },
              reportDiagnostics: true,
              fileName: "input.ts",
            });
            const diags = resultTS.diagnostics || [];
            if (diags.length) {
              const messages = diags.map((d) => {
                const fullMsg = typeof d.messageText === "string" ? d.messageText : ts.flattenDiagnosticMessageText(d.messageText, "\n");
                if (d.file && typeof d.start === "number") {
                  const pos = d.file.getLineAndCharacterOfPosition(d.start);
                  return `TS${d.code} (${pos.line + 1},${pos.character + 1}): ${fullMsg}`;
                }
                return `TS${d.code}: ${fullMsg}`;
              });
              caseLines.push("TypeScript 诊断（已阻止执行）：");
              messages.forEach((m) => caseLines.push(m));
              casePassed = false;
            } else {
              const js = resultTS.outputText;
              // eslint-disable-next-line no-new-func
              const fn = new Function(js);
              fn();
              casePassed = true;
            }
          }
        } else {
          caseLines.push("当前仅支持在浏览器中运行 JavaScript/TypeScript 示例。其它语言可编辑但不执行。");
          casePassed = null;
        }
      } catch (e) {
        errorText = `Error: ${String(e)}`;
        casePassed = false;
      } finally {
        console.log = (console as any)._origLog || console.log; // 防御：恢复 console
      }
      const end = performance.now();
      const timeMs = Math.round(end - start);
      const outputStr = caseLines.join("\n");
      // 期望判定：若填写了 expected 且未因诊断/错误失败，则按严格匹配
      const normalize = (s: string) => s.replace(/\r\n/g, "\n").trim();
      let finalPass = casePassed;
      if (c.expected && finalPass !== false) {
        finalPass = normalize(outputStr) === normalize(c.expected);
        if (!finalPass) {
          // 追加简单提示，保留详细输出与诊断
          caseLines.push("与期望输出不一致（使用严格匹配）。");
        }
      }
      updatedCases.push({ ...c, output: outputStr, error: errorText, timeMs, passed: finalPass ?? null });
    }

    const endAll = performance.now();
    const totalMs = Math.round(endAll - startAll);
    setResult({
      passed: updatedCases.every((c) => c.passed === true) ? true : updatedCases.some((c) => c.passed === false) ? false : null,
      timeMs: totalMs,
      cases: updatedCases,
    });
  };

  const activeCase = result.cases.find((c) => c.name === activeCaseKey);

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <Select value={lang} onChange={setLang} options={languageOptions} size="small" style={{ width: 160 }} />
        <Button size="small" type="primary" onClick={runCode}>运行</Button>
        <Button size="small" onClick={formatCode}>格式化</Button>
        <Button size="small" onClick={clearOutput}>清空输出</Button>
      </div>
      <div style={{ height: `calc(100% - ${outputHeight + splitterHeight}px)` }}>
        <Editor height="100%" theme={theme} language={lang} value={code} onChange={(v) => setCode(v || "")} onMount={onMount} options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, smoothScrolling: true }} />
      </div>
      <div style={{ height: splitterHeight, background: "#f3f4f6", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", cursor: "row-resize" }} onMouseDown={() => setDragging(true)} title="拖动调整编辑器/输出高度" />

      {/* 测试结果区域 */}
      <div className="border-t border-gray-200 bg-white" style={{ height: outputHeight, overflow: "hidden" }}>
         <div className="flex items-center justify-between p-2">
           <Segmented
             size="small"
             value={viewMode}
             onChange={(v) => setViewMode(v as "cases" | "results")}
             options={[
               { label: "测试用例", value: "cases" },
               { label: "测试结果", value: "results" },
             ]}
           />
           <div className="flex items-center gap-3 text-sm">
             {result.passed === true && <Tag color="green">通过</Tag>}
             {result.passed === false && <Tag color="red">失败</Tag>}
             {result.passed === null && <Tag color="default">待运行</Tag>}
             <span className="text-gray-500">执行用时: {result.timeMs ?? 0} ms</span>
           </div>
         </div>
        <div className="px-2">
          <Tabs
            type="editable-card"
            onEdit={onEditTabs as any}
            activeKey={activeCaseKey}
            onChange={setActiveCaseKey}
            items={(result.cases.length ? result.cases : [{ name: "Case 1", input: "", output: "", passed: null }]).map((c) => ({
              key: c.name,
              label: (
                <span>
                  {c.name}
                  {c.passed === true && <Tag color="green" style={{ marginLeft: 6 }}>通过</Tag>}
                  {c.passed === false && <Tag color="red" style={{ marginLeft: 6 }}>失败</Tag>}
                </span>
              ),
            }))}
          />
        </div>
        <div className="h-[calc(100%-120px)] overflow-auto px-2 pb-2">
          {viewMode === "cases" ? (
            // 仅显示输入
            <>
              <div className="text-xs text-gray-600 mb-1">输入</div>
               <Input.TextArea
                 value={activeCase?.input || ""}
                 onChange={(e) => updateActiveCaseInput(e.target.value)}
                 placeholder={'在此填写用例输入片段，例如:\nconst arr = [2,7,11,15];\nconst target = 9;'}
                 autoSize={{ minRows: 2, maxRows: 6 }}
                 className="font-mono"
               />
            </>
          ) : (
            // 仅显示测试结果
            <>
              <div className="flex items-center gap-3 text-sm">
                  {activeCase?.passed === true && <Tag color="green">通过</Tag>}
                  {activeCase?.passed === false && <Tag color="red">失败</Tag>}
                  {activeCase?.passed == null && <Tag>待运行</Tag>}
                  <span className="text-gray-500">执行用时: {activeCase?.timeMs ?? 0} ms</span>
                </div>
                {activeCase?.error ? (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap break-words select-none">
                    {activeCase.error}
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-gray-600 mt-3 mb-1">输入</div>
                    <Input.TextArea
                      value={activeCase?.input || ""}
                      disabled
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      className="font-mono select-none"
                    />
                    <div className="text-xs text-gray-600 mt-3 mb-1">期望输出</div>
                    <Input.TextArea
                      value={activeCase?.expected || ""}
                      disabled
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      className="font-mono select-none"
                    />
                    <div className="text-xs text-gray-600 mt-4 mb-1">输出</div>
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap break-words select-none">
                      {activeCase?.output || <span className="text-gray-400">无输出</span>}
                    </div>
                  </>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;