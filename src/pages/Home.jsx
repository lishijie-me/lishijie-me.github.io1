import { Link } from 'react-router-dom';
import { getAllPosts } from '../lib/posts';

export default function Home() {
    const posts = getAllPosts();

    return (
        <div>
            <h1>文章列表</h1>

            {posts.length === 0 ? (
                <p>还没有文章，去 src/posts 新建 .md 文件吧。</p>
            ) : (
                <ul className="post-list">
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <Link to={`/post/${post.slug}`}>{post.title}</Link>
                            {post.date && <span className="date">{post.date}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}