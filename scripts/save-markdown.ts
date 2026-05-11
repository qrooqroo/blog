import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ARTICLE_ID = 71;

async function saveMarkdown() {
  const mdPath = join(process.cwd(), 'scripts', 'post71.md');
  const markdown = readFileSync(mdPath, 'utf-8');

  const { error } = await supabase
    .from('articles')
    .update({ markdown_content: markdown })
    .eq('id', ARTICLE_ID);

  if (error) {
    console.error('실패:', error.message);
    process.exit(1);
  }

  console.log(`article #${ARTICLE_ID} markdown_content 저장 완료 (${markdown.length} chars)`);
}

saveMarkdown();
