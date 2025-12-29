import { GhostExport, GhostPost, GhostTag, PostTagRelation, GhostUser, GhostRole, GhostRoleUser, GhostPostAuthor } from "../../types/ghost";

const treat = (html: string): string => {
    let processed = html.replace(/\r\n/g, "\n");
    processed = processed.replace(/\r/g, "\n");
    processed = processed.replace(/\[((source)?code)[^\]]*\]\n*([\s\S]*?)\n*\[\/\1\]/g, '<pre><code>$3</code></pre>');
    processed = processed.replace(/\[caption.+\](.+)\[\/caption\]/g, '$1');
    processed = processed.replace(/\[audio\s(.+)\]/g, reformatAudioShortcode);
    processed = processed.replace(/\[video\s(.+)\]/g, reformatVideoShortcode);
    return processed;
};

const treatHTML = (html: string): string => {
    let processed = treat(html);
    processed = processed.replace(/\n\n/g, '<p>');
    processed = processed.replace(/<pre>(.*?)<\/pre>/g, (match) => match.replace(/<p>/g, "\n\n"));
    processed = processed.replace(/<p><pre>/g, "<pre>");
    return processed;
};

const reformatAudioShortcode = (match: string): string => {
    const sources = (match.match(/["'](.+?)["']/g) || []).map((source) => `<source src=${source}>`).join('');
    return `<audio controls>${sources}</audio>`;
};

const reformatVideoShortcode = (match: string): string => {
    const sources = (match.match(/"(.+?)"/g) || []).map((source) => {
        const formatMatch = source.match(/['"](.*)\.([^.]*)['"]$/);
        const ext = formatMatch ? formatMatch[2] : 'mp4';
        return `<source src=${source} type="video/${ext}">`;
    }).join('');
    return `<video controls>${sources}</video>`;
};

const slugify = (title: string): string => {
    let slug = title.replace(/[:\/\?#\[\]@!$&'()*+,;=\\%<>\|\^~£"]/g, '')
        .replace(/(\s|\.)/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

    if (slug.endsWith('-')) {
        slug = slug.substring(0, slug.length - 1);
    }

    const reserved = /^(ghost|ghost\-admin|admin|wp\-admin|wp\-login|dashboard|logout|login|signin|signup|signout|register|archive|archives|category|categories|tag|tags|page|pages|post|posts|user|users|rss)$/g;
    if (reserved.test(slug)) {
        slug += '-post';
    }
    return slug;
};

const getElementText = (el: Element | Document, name: string): string => {
    const found = el.getElementsByTagName(name);
    return found.length > 0 ? (found[0].textContent || '') : '';
};

// Simple ID/UUID helper
const generateId = (id: string | number) => `ghost-${id}`;
const generateUuid = () => {
    try {
        return crypto.randomUUID();
    } catch {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};

export const convertWpToGhost = (xmlContent: string, ghostVersion: string = "6.0.0"): GhostExport => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlContent, "text/xml");
    const parseError = xml.querySelector("parsererror");
    if (parseError) {
        throw new Error("Invalid WordPress XML format");
    }

    const statusMap: Record<string, string> = {
        "publish": "published",
        "draft": "draft",
        "private": "private",
        "pending": "draft"
    };

    let exportDate = Date.now();
    const pubDateText = getElementText(xml, 'pubDate');
    if (pubDateText) {
        exportDate = new Date(pubDateText).getTime();
    }

    const tags: GhostTag[] = [];
    const termName2Tag: Record<string, string> = {};

    // Parse Categories definitions
    const wpCategories = xml.getElementsByTagName('wp:category');
    for (let i = 0; i < wpCategories.length; i++) {
        const cat = wpCategories[i];
        const nicename = getElementText(cat, 'wp:category_nicename');
        const name = getElementText(cat, 'wp:cat_name');
        if (nicename && !termName2Tag[nicename]) {
            const id = generateId(`tag-${tags.length + 1}`);
            tags.push({
                id,
                slug: nicename,
                name: name,
                description: getElementText(cat, 'wp:category_description') || ""
            });
            termName2Tag[nicename] = id;
        }
    }

    // Parse Tags definitions
    const wpTags = xml.getElementsByTagName('wp:tag');
    for (let i = 0; i < wpTags.length; i++) {
        const tag = wpTags[i];
        const nicename = getElementText(tag, 'wp:tag_slug');
        const name = getElementText(tag, 'wp:tag_name');
        if (nicename && !termName2Tag[nicename]) {
            const id = generateId(`tag-${tags.length + 1}`);
            tags.push({
                id,
                slug: nicename,
                name: name,
                description: ""
            });
            termName2Tag[nicename] = id;
        }
    }

    // Default Administrator User
    const defaultUserId = generateId("user-1");
    const users: GhostUser[] = [{
        id: defaultUserId,
        name: "Administrator",
        slug: "admin",
        email: "admin@example.com"
    }];

    const roles: GhostRole[] = [{
        id: generateId("role-1"),
        name: "Administrator",
        description: "Administrators have full access to the site"
    }];

    const roles_users: GhostRoleUser[] = [{
        role_id: roles[0].id,
        user_id: defaultUserId
    }];

    const author2User: Record<string, string> = {};
    const authors = xml.getElementsByTagName('wp:author');
    for (let i = 0; i < authors.length; i++) {
        const author = authors[i];
        const login = getElementText(author, 'wp:author_login');
        if (login) {
            author2User[login] = defaultUserId; // For now map all to default admin
        }
    }

    const posts: GhostPost[] = [];
    const posts_tags: PostTagRelation[] = [];
    const posts_authors: GhostPostAuthor[] = [];
    const slugs: Record<string, boolean> = {};

    const items = xml.getElementsByTagName('item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const postType = getElementText(item, 'wp:post_type');
        if (postType !== "post" && postType !== "page") continue;

        let dateStr = getElementText(item, 'wp:post_date_gmt');
        if (!dateStr || dateStr === "0000-00-00 00:00:00") {
            dateStr = getElementText(item, 'wp:post_date');
            if (!dateStr) {
                dateStr = '1970-01-01 00:00:00';
            }
        }

        const dateMatch = dateStr.match(/(\d{4})-(\d+)-(\d+) (\d+):(\d+):(\d+)/);
        let d: Date;
        if (dateMatch) {
            d = new Date(Date.UTC(
                parseInt(dateMatch[1]),
                parseInt(dateMatch[2]) - 1,
                parseInt(dateMatch[3]),
                parseInt(dateMatch[4]),
                parseInt(dateMatch[5]),
                parseInt(dateMatch[6])
            ));
        } else {
            d = new Date(dateStr);
        }

        let pubDate = d;
        const pubDateStr = getElementText(item, 'pubDate');
        if (pubDateStr && !pubDateStr.includes("-0001")) {
            pubDate = new Date(pubDateStr);
        }

        const content = getElementText(item, 'content:encoded') || "";
        const title = getElementText(item, 'title') || "Untitled post";
        let slug = getElementText(item, 'wp:post_name') || slugify(title);

        if (!slug) slug = slugify(title);

        if (slugs[slug]) {
            let n = 2;
            const baseSlug = slug.replace(/-\d*$/, '');
            while (slugs[`${baseSlug}-${n}`]) { n++; }
            slug = `${baseSlug}-${n}`;
        }
        slugs[slug] = true;

        const wpStatus = getElementText(item, 'wp:status') || "draft";
        const creator = getElementText(item, 'dc:creator') || "";
        const authorId = author2User[creator] || defaultUserId;

        const postId = getElementText(item, 'wp:post_id') || `post-${i}`;

        const post: GhostPost = {
            id: postId,
            uuid: generateUuid(),
            title,
            slug,
            markdown: treat(content),
            html: treatHTML(content),
            feature_image: null,
            featured: getElementText(item, 'wp:is_sticky') === "1" ? 1 : 0,
            page: postType === "page" ? 1 : 0,
            type: postType === "post" ? "post" : "page",
            status: statusMap[wpStatus] || "draft",
            visibility: "public",
            created_at: d.toISOString(),
            created_by: authorId,
            updated_at: d.toISOString(),
            updated_by: authorId,
            published_at: pubDate.toISOString(),
            published_by: authorId
        };

        const itemCategories = item.getElementsByTagName('category');
        for (let j = 0; j < itemCategories.length; j++) {
            const cat = itemCategories[j];
            const nicename = cat.getAttribute('nicename');
            if (nicename && termName2Tag[nicename]) {
                posts_tags.push({
                    tag_id: termName2Tag[nicename],
                    post_id: post.id
                });
            }
        }

        posts_authors.push({
            post_id: post.id,
            author_id: authorId
        });

        posts.push(post);
    }

    return {
        db: [{
            meta: {
                exported_on: exportDate,
                version: ghostVersion
            },
            data: {
                posts,
                tags,
                posts_tags,
                users,
                roles,
                roles_users,
                posts_authors
            }
        }]
    };
};
