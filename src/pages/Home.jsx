import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../lib/posts';

const PAGE_SIZE = 4; // 每页显示几篇，想改就改这个数

// 生成带省略号的页码数组，比如 [1, '...', 5, 6, 7, '...', 12]
function getPageNumbers(current, total) {
    const delta = 1; // 当前页左右各显示几个页码
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
        if (
            i === 1 ||
            i === total ||
            (i >= current - delta && i <= current + delta)
        ) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (last) {
            if (i - last === 2) {
                rangeWithDots.push(last + 1);
            } else if (i - last > 2) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        last = i;
    }

    return rangeWithDots;
}

export default function Home() {
    const posts = getAllPosts();
    const [searchParams, setSearchParams] = useSearchParams();

    // 从 URL 里读当前页码，比如 /#/?page=2
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

    const currentPage = Math.min(
        Math.max(1, isNaN(pageParam) ? 1 : pageParam),
        totalPages
    );

    // 当前页的文章
    const start = (currentPage - 1) * PAGE_SIZE;
    const currentPosts = posts.slice(start, start + PAGE_SIZE);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setSearchParams({ page: String(page) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 翻页时自动回到顶部
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [currentPage]);

    return (
        <div>
            <div className="home-header">
                <h1>文章列表</h1>
                <span className="post-count">共 {posts.length} 篇</span>
            </div>

            {posts.length === 0 ? (
                <p>还没有文章，去 src/posts 新建 .md 文件吧。</p>
            ) : (
                <>
                    <div className="post-list">
                        {currentPosts.map((post) => (
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
                                    {post.description && (
                                        <p className="excerpt">{post.description}</p>
                                    )}

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

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← 上一页
                            </button>

                            <div className="page-numbers">
                                {getPageNumbers(currentPage, totalPages).map((page, index) =>
                                        page === '...' ? (
                                            <span key={`dots-${index}`} className="page-dots">
                      …
                    </span>
                                        ) : (
                                            <button
                                                key={page}
                                                className={`page-num ${
                                                    page === currentPage ? 'active' : ''
                                                }`}
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </button>
                                        )
                                )}
                            </div>

                            <button
                                className="page-btn"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                下一页 →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}