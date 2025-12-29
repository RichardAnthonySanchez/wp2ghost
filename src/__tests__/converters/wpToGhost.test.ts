import { describe, it, expect } from 'vitest';
import { convertWpToGhost } from '../../services/converters/wpToGhost';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.0/">
  <channel>
    <title>Test Blog</title>
    <pubDate>Wed, 17 Sep 2008 22:12:39 +0000</pubDate>
    <wp:wxr_version>1.0</wp:wxr_version>
    <wp:category><wp:term_id>1</wp:term_id><wp:category_nicename>test-cat</wp:category_nicename><wp:cat_name><![CDATA[Test Category]]></wp:cat_name></wp:category>
    <wp:tag><wp:term_id>10</wp:term_id><wp:tag_slug>test-tag</wp:tag_slug><wp:tag_name><![CDATA[Test Tag]]></wp:tag_name></wp:tag>
    <item>
      <title>Simple Post</title>
      <pubDate>Sun, 03 Aug 2008 00:52:26 +0000</pubDate>
      <dc:creator><![CDATA[admin]]></dc:creator>
      <category domain="category" nicename="test-cat"><![CDATA[Test Category]]></category>
      <category domain="tag" nicename="test-tag"><![CDATA[Test Tag]]></category>
      <content:encoded><![CDATA[Hello World! [video src="source.mp4"] [caption id="attachment_1"]Image[/caption]]]></content:encoded>
      <wp:post_id>4</wp:post_id>
      <wp:post_date>2008-08-02 19:52:26</wp:post_date>
      <wp:post_date_gmt>2008-08-03 00:52:26</wp:post_date_gmt>
      <wp:post_name>simple-post</wp:post_name>
      <wp:status>publish</wp:status>
      <wp:post_type>post</wp:post_type>
      <wp:is_sticky>0</wp:is_sticky>
    </item>
  </channel>
</rss>`;

describe('WP to Ghost Converter', () => {
  it('should parse basic post info', () => {
    const result = convertWpToGhost(sampleXml, "6.0.0");
    const post = result.db[0].data.posts[0];

    expect(post.title).toBe('Simple Post');
    expect(post.slug).toBe('simple-post');
    expect(post.status).toBe('published');
    expect(post.type).toBe('post');
  });

  it('should handle shortcodes', () => {
    const result = convertWpToGhost(sampleXml, "6.0.0");
    const post = result.db[0].data.posts[0];

    expect(post.html).toContain('<video controls><source src="source.mp4" type="video/mp4"></video>');
    expect(post.html).toContain('Image');
    expect(post.html).not.toContain('[caption');
  });

  it('should convert categories and tags', () => {
    const result = convertWpToGhost(sampleXml, "6.0.0");
    const { tags, posts_tags } = result.db[0].data;

    expect(tags).toHaveLength(2);
    expect(tags.find(t => t.slug === 'test-cat')).toBeDefined();
    expect(tags.find(t => t.slug === 'test-tag')).toBeDefined();
    expect(posts_tags).toHaveLength(2);
  });

  it('should handle dates correctly as ISO strings', () => {
    const result = convertWpToGhost(sampleXml, "6.0.0");
    const post = result.db[0].data.posts[0];

    // 2008-08-03 00:52:26 UTC 
    expect(post.created_at).toBe('2008-08-03T00:52:26.000Z');
    expect(post.published_at).toBe('2008-08-03T00:52:26.000Z');
  });

  it('should include necessary metadata sections', () => {
    const result = convertWpToGhost(sampleXml, "6.0.0");
    const data = result.db[0].data;

    expect(data.users).toBeDefined();
    expect(data.roles).toBeDefined();
    expect(data.posts_authors).toBeDefined();
    expect(data.posts_authors?.[0].post_id).toBe(data.posts[0].id);
  });
});
