import { createClient } from '@supabase/supabase-js';
import { articles } from '../src/data/articles';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log(`Supabase에 ${articles.length}개 글을 입력합니다...`);

  const rows = articles.map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    excerpt: a.excerpt,
    content: a.content,
    date: a.date,
    image: a.image,
  }));

  const { error } = await supabase
    .from('articles')
    .upsert(rows, { onConflict: 'slug' });

  if (error) {
    console.error('실패:', error.message);
    process.exit(1);
  }

  console.log('완료!');
}

seed();
