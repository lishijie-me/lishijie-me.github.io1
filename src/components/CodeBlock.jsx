import { useRef, useState, useEffect } from 'react';

export default function CodeBlock({ children, ...props }) {
    const preRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // 挂载后把 code 里的每一行包成 .code-line，配合 CSS counter 显示行号
    useEffect(() => {
        const pre = preRef.current;
        if (!pre) return;

        const code = pre.querySelector('code');
        if (!code || code.dataset.lineNumbered === 'true') return;

        const lines = code.innerHTML.split('\n');
        code.innerHTML = lines
            .map((line) => `<span class="code-line">${line || '\u200B'}</span>`)
            .join('');
        code.dataset.lineNumbered = 'true';
    });

    const handleCopy = async () => {
        if (!preRef.current) return;
        // 去掉空行占位用的零宽空格，并清理末尾多余换行
        const text = preRef.current.innerText
            .replace(/\u200B/g, '')
            .replace(/\n+$/, '');

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
            } catch {}
            document.body.removeChild(ta);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="code-block">
            <button
                type="button"
                className="copy-btn"
                onClick={handleCopy}
                aria-label="复制代码"
            >
                {copied ? '已复制 ✓' : '复制'}
            </button>
            <pre ref={preRef} {...props}>
        {children}
      </pre>
        </div>
    );
}