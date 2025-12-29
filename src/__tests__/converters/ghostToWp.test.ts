import { describe, it, expect } from 'vitest';
import { convertGhostToWp } from '../../services/converters/ghostToWp';
import { GhostExport } from '../../types/ghost';

const sampleGhostData: GhostExport = {
    db: [{
        meta: {
            exported_on: 1703865600000,
            version: "6.0.0"
        },
        data: {
            posts: [{
                id: "post-1",
                title: "Hello Ghost",
                slug: "hello-ghost",
                html: "<p>Content in HTML</p>",
                featured: 0,
                type: "post",
                status: "published",
                created_at: "2024-01-01T00:00:00.000Z",
                created_by: "user-1",
                updated_at: "2024-01-01T00:00:00.000Z",
                updated_by: "user-1",
                published_at: "2024-01-01T00:00:00.000Z",
                published_by: "user-1"
            }],
            tags: [{
                id: "tag-1",
                slug: "news",
                name: "News"
            }],
            posts_tags: [{
                post_id: "post-1",
                tag_id: "tag-1"
            }],
            users: [{
                id: "user-1",
                name: "Test Admin",
                slug: "test-admin",
                email: "test@example.com"
            }],
            posts_authors: [{
                post_id: "post-1",
                author_id: "user-1"
            }]
        }
    }]
};

describe('Ghost to WP Converter', () => {
    it('should generate valid WXR XML', () => {
        const xml = convertGhostToWp(sampleGhostData);

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain('<wp:wxr_version>1.2</wp:wxr_version>');
        expect(xml).toContain('<wp:author>');
        expect(xml).toContain('<wp:author_login><![CDATA[test-admin]]></wp:author_login>');
    });

    it('should include post data with CDATA', () => {
        const xml = convertGhostToWp(sampleGhostData);

        expect(xml).toContain('<title><![CDATA[Hello Ghost]]></title>');
        expect(xml).toContain('<wp:post_name><![CDATA[hello-ghost]]></wp:post_name>');
        expect(xml).toContain('<content:encoded><![CDATA[<p>Content in HTML</p>]]></content:encoded>');
        expect(xml).toContain('<wp:status><![CDATA[publish]]></wp:status>');
        expect(xml).toContain('<dc:creator><![CDATA[test-admin]]></dc:creator>');
    });

    it('should format dates correctly', () => {
        const xml = convertGhostToWp(sampleGhostData);
        // 2024-01-01T00:00:00.000Z -> 2024-01-01 00:00:00
        expect(xml).toContain('<wp:post_date><![CDATA[2024-01-01 00:00:00]]></wp:post_date>');
    });

    it('should include tags', () => {
        const xml = convertGhostToWp(sampleGhostData);

        expect(xml).toContain('<wp:tag_name><![CDATA[News]]></wp:tag_name>');
        expect(xml).toContain('<category domain="post_tag" nicename="news"><![CDATA[News]]></category>');
    });
});
