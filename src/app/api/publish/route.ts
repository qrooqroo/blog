import { NextRequest, NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com';
const OWNER = 'qrooqroo';
const REPO  = 'blog';
const FILE  = 'src/data/articles.ts';

interface ArticlePayload {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN 환경변수가 설정되지 않았습니다.' }, { status: 500 });
  }

  const payload: ArticlePayload = await req.json();
  const { title, slug, category, excerpt, content, date } = payload;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: '제목, slug, 내용은 필수입니다.' }, { status: 400 });
  }

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // 현재 파일 가져오기
  const fileRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE}`, { headers });
  if (!fileRes.ok) {
    return NextResponse.json({ error: 'GitHub에서 파일을 가져오지 못했습니다.' }, { status: 500 });
  }
  const fileData = await fileRes.json();
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const sha = fileData.sha;

  // 마지막 ID 찾기
  const idMatches = [...currentContent.matchAll(/id:\s*(\d+)/g)];
  const maxId = idMatches.length > 0 ? Math.max(...idMatches.map(m => parseInt(m[1]))) : 0;
  const newId = maxId + 1;

  // slug 중복 확인
  if (currentContent.includes(`slug: '${slug}'`)) {
    return NextResponse.json({ error: `slug '${slug}'가 이미 존재합니다. 다른 제목을 사용해주세요.` }, { status: 400 });
  }

  // 새 기사 코드 생성
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  const newEntry = `  { id: ${newId}, title: \`${esc(title)}\`, slug: '${slug}', category: '${category}', excerpt: \`${esc(excerpt)}\`, content: \`${esc(content)}\`, date: '${date}' },`;

  // raw 배열 끝 "];" 직전에 삽입
  const insertPoint = currentContent.lastIndexOf('];');
  if (insertPoint === -1) {
    return NextResponse.json({ error: '파일 구조를 파악할 수 없습니다.' }, { status: 500 });
  }

  const newContent = currentContent.slice(0, insertPoint) + newEntry + '\n' + currentContent.slice(insertPoint);

  // GitHub에 커밋
  const updateRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `feat: 새 글 추가 - ${title}`,
      content: Buffer.from(newContent, 'utf-8').toString('base64'),
      sha,
    }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return NextResponse.json({ error: `GitHub 커밋 실패: ${err.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: newId, slug });
}
