const modules = import.meta.glob('../posts/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
});

function parseFrontmatter(raw) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    if (!match) return { data: {}, content: raw };

    const data = {};
    match[1].split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf(':');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        data[key] = value;
    });

    return { data, content: match[2] };
}

function slugFromPath(path) {
    return path.split('/').pop().replace(/\.md$/, '');
}

export function getAllPosts() {
    return Object.entries(modules)
        .map(([path, raw]) => {
            const { data, content } = parseFrontmatter(raw);
            const slug = slugFromPath(path);
            return {
                slug,
                title: data.title || slug,
                date: data.date || '',
                content,
            };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug) {
    return getAllPosts().find((post) => post.slug === slug);
}