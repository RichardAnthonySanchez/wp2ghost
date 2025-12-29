export interface GhostPost {
    id: string | number;
    uuid?: string;
    title: string;
    slug: string;
    markdown?: string;
    html: string;
    image?: string | null;
    feature_image?: string | null;
    featured: number | boolean;
    page?: number;
    type?: string;
    status: string;
    language?: string;
    meta_title?: string | null;
    meta_description?: string | null;
    author_id?: string | number;
    created_at: string | number;
    created_by: string | number;
    updated_at: string | number;
    updated_by: string | number;
    published_at: string | number;
    published_by: string | number;
    custom_excerpt?: string | null;
    visibility?: string;
}

export interface GhostTag {
    id: string | number;
    slug: string;
    name: string;
    description?: string;
}

export interface PostTagRelation {
    tag_id: string | number;
    post_id: string | number;
}

export interface GhostUser {
    id: string | number;
    name: string;
    slug: string;
    email: string;
    profile_image?: string | null;
}

export interface GhostRole {
    id: string | number;
    name: string;
    description: string;
}

export interface GhostRoleUser {
    role_id: string | number;
    user_id: string | number;
}

export interface GhostPostAuthor {
    post_id: string | number;
    author_id: string | number;
}

export interface GhostExport {
    db: {
        meta: {
            exported_on: number;
            version: string;
        };
        data: {
            posts: GhostPost[];
            tags: GhostTag[];
            posts_tags: PostTagRelation[];
            users?: GhostUser[];
            roles?: GhostRole[];
            roles_users?: GhostRoleUser[];
            posts_authors?: GhostPostAuthor[];
        };
    }[];
}
