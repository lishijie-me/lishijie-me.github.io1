import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '../lib/posts';

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

    return (
        <article className="post">
            <h1>{post.title}</h1>
            {post.date && <p className="meta">{post.date}</p>}

            <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>

            <p>
                <Link to="/">← 返回首页</Link>
            </p>
        </article>
    );
}