import express from 'express';
import axios from 'axios';

const router = express.Router();

const BLOGGER_FEED = 'https://growperty.blogspot.com/feeds/posts/default?alt=json&max-results=12';

router.get('/posts', async (req, res) => {
  try {
    const { data } = await axios.get(BLOGGER_FEED, { timeout: 8000 });
    const entries = data?.feed?.entry || [];

    const posts = entries.map(entry => {
      const link = entry.link?.find(l => l.rel === 'alternate')?.href || 'https://growperty.blogspot.com';
      const category = entry.category?.[0]?.term || 'General';
      const rawDate = entry.published?.$t;
      const date = rawDate
        ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

      let image = entry.media$thumbnail?.url?.replace(/s72-c/, 's800') || null;
      if (!image && entry.content?.$t) {
        const match = entry.content.$t.match(/<img[^>]+src="([^"]+)"/i);
        if (match) image = match[1];
      }

      const wordCount = entry.content?.$t?.replace(/<[^>]*>/g, '').split(/\s+/).length || 300;
      const readTime = `${Math.max(2, Math.ceil(wordCount / 200))} min read`;
      const description = entry.summary?.$t?.replace(/<[^>]*>/g, '').slice(0, 200) || '';

      return {
        id: link,
        title: entry.title?.$t || 'Untitled',
        description,
        image,
        category,
        date,
        readTime,
        link,
      };
    });

    res.json({ posts });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch blog posts', posts: [] });
  }
});

export default router;
