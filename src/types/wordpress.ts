export interface WPCategory {
    id: number;
    slug: string;
    name: string;
    description: string;
}

export interface WPTag {
    id: number;
    slug: string;
    name: string;
}

export interface WPAuthor {
    name: string;
    slug: string;
    email: string;
}

export interface WPPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    status: string;
    postType: 'post' | 'page';
    postDateGmt: string;
    postDate: string;
    pubDate: string;
    creator: string;
    isSticky: boolean;
    categories: { name: string; slug: string }[];
}

export interface WPExportData {
    title: string;
    link: string;
    description: string;
    pubDate?: string;
    categories: WPCategory[];
    tags: WPTag[];
    authors: WPAuthor[];
    posts: WPPost[];
}
