import GithubSlugger from 'github-slugger';

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
        let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

        // 支持 tags: [react, vite]
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim().replace(/^["']|["']$/g, ''))
                .filter(Boolean);
        }
        data[key] = value;
    });

    return { data, content: match[2] };
}

function extractExcerpt(content, maxLen = 120) {
    const plain = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/[*_>~-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
}

export function extractToc(content) {
    const slugger = new GithubSlugger();
    const toc = [];
    let inCode = false;

    content.split(/\r?\n/).forEach((line) => {
        if (line.startsWith('```')) {
            inCode = !inCode;
            return;
        }
        if (inCode) return;

        const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
        if (m) {
            const text = m[2].replace(/[*_`]/g, '');
            toc.push({ level: m[1].length, text, id: slugger.slug(text) });
        }
    });

    return toc;
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
                description: data.description || extractExcerpt(content),
                cover: data.cover || '',
                tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
                content,
            };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug) {
    return getAllPosts().find((post) => post.slug === slug);
}