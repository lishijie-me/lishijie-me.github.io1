import { Link } from 'react-router-dom';
import { getAllPosts } from '../lib/posts';

export default function Home() {
    const posts = getAllPosts();

    return (
        <div>
            {/*<h1>文章列表</h1>*/}

            {posts.length === 0 ? (
                <p>还没有文章，去 src/posts 新建 .md 文件吧。</p>
            ) : (
                <div className="post-list">
                    {posts.map((post) => (
                        <article key={post.slug} className="post-card">
                            {post.cover && (
                                <Link to={`/post/${post.slug}`} className="cover">
                                    <img src={post.cover} alt={post.title} loading="lazy" />
                                </Link>
                            )}

                            <div className="post-card-body">
                                <h2>
                                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                                </h2>

                                {post.date && <p className="meta">{post.date}</p>}
                                {post.description && <p className="excerpt">{post.description}</p>}

                                {post.tags.length > 0 && (
                                    <p className="tags">
                                        {post.tags.map((t) => (
                                            <span key={t} className="tag">#{t}</span>
                                        ))}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}