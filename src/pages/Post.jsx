import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { getPostBySlug, extractToc } from '../lib/posts';
import CodeBlock from '../components/CodeBlock';

export default function Post() {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <div>
                <h1>文章不存在</h1>
                <Link to="/">返回首页</Link>
            </div>
        );
    }

    const toc = extractToc(post.content);

    return (
        <div className="post-layout">
            <article className="post">
                <h1>{post.title}</h1>
                {post.date && <p className="meta">{post.date}</p>}

                {post.tags.length > 0 && (
                    <p className="tags">
                        {post.tags.map((t) => (
                            <span key={t} className="tag">#{t}</span>
                        ))}
                    </p>
                )}

                <div className="markdown-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeSlug, rehypeKatex, rehypeHighlight]}
                        components={{
                            pre: CodeBlock,
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <p className="back">
                    <Link to="/">← 返回首页</Link>
                </p>
            </article>

            {toc.length > 0 && (
                <aside className="toc">
                    <h3>目录</h3>
                    <ul>
                        {toc.map((item) => (
                            <li key={item.id} className={`toc-level-${item.level}`}>
                                <a
                                    href={`#${item.id}`}
                                    onClick={(e) => {
                                        // HashRouter 下用 JS 滚动，避免破坏路由
                                        e.preventDefault();
                                        document
                                            .getElementById(item.id)
                                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                >
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>
            )}
        </div>
    );
}