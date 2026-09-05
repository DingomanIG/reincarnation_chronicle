/**
 * scripts/sync-questions.js
 *
 * 노션 "성향질문" 데이터베이스 -> personality-questions.js 동기화 스크립트.
 * 신(카테고리)별로 여러 개의 질문을 담을 수 있는 "질문 풀" 구조.
 * 업적카드가 뽑히면, 그 카드의 카테고리(신)에 해당하는 질문을 이 풀에서 하나 골라 묻는다.
 *
 * 실행: node scripts/sync-questions.js
 *       (또는 npm run sync:questions)
 *
 * 필요한 환경변수(.env):
 *   NOTION_TOKEN                     - Notion Integration Secret (필수, sync-achievements.js와 공유)
 *   NOTION_QUESTIONS_DATA_SOURCE_ID  - "성향질문" 데이터소스 ID (선택, 생략 시 제목으로 자동 검색)
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Client } = require("@notionhq/client");

const DATABASE_TITLE = "성향질문";
const OUTPUT_PATH = path.join(__dirname, "..", "personality-questions.js");

const PROP_GOD = "신";           // select
const PROP_OPT1 = "선택지1";     // rich_text
const PROP_OPT2 = "선택지2";     // rich_text
const PROP_OPT3 = "선택지3";     // rich_text
// 질문 텍스트(title) 속성은 이름이 다를 수 있어 타입(title)으로 자동 탐색한다.

function fail(message){
  console.error(`\n[sync-questions] 오류: ${message}\n`);
  process.exit(1);
}

async function resolveDataSourceId(notion){
  const envId = process.env.NOTION_QUESTIONS_DATA_SOURCE_ID;
  if(envId && envId.trim()) return envId.trim();

  console.log(`[sync-questions] NOTION_QUESTIONS_DATA_SOURCE_ID가 없어 "${DATABASE_TITLE}" 제목으로 검색합니다...`);
  const res = await notion.search({ query: DATABASE_TITLE, page_size: 20 });

  const candidates = res.results.filter(r=>{
    if(r.object === "data_source" || r.object === "database"){
      const titleProp = r.title || (r.properties && r.properties.title) || [];
      const plain = Array.isArray(titleProp) ? titleProp.map(t=>t.plain_text).join("") : "";
      return plain.includes(DATABASE_TITLE);
    }
    return false;
  });

  if(candidates.length === 0){
    fail(
      `"${DATABASE_TITLE}" 데이터베이스를 찾을 수 없습니다.\n` +
      `  1) Notion에서 해당 데이터베이스를 이 Integration에 연결했는지 확인하세요.\n` +
      `  2) 또는 .env에 NOTION_QUESTIONS_DATA_SOURCE_ID를 직접 지정하세요.`
    );
  }

  const found = candidates[0];
  if(found.object === "data_source") return found.id;

  const db = await notion.databases.retrieve({ database_id: found.id });
  if(!db.data_sources || db.data_sources.length === 0){
    fail(`"${DATABASE_TITLE}" 데이터베이스에 data source가 없습니다.`);
  }
  return db.data_sources[0].id;
}

function extractTitlePlainText(properties){
  for(const key of Object.keys(properties)){
    const prop = properties[key];
    if(prop && prop.type === "title"){
      return (prop.title || []).map(t=>t.plain_text).join("").trim();
    }
  }
  return "";
}

function extractSelectName(properties, propName){
  const prop = properties[propName];
  if(!prop) return null;
  if(prop.type === "select") return prop.select ? prop.select.name : null;
  return null;
}

function extractRichText(properties, propName){
  const prop = properties[propName];
  if(!prop || prop.type !== "rich_text") return "";
  return (prop.rich_text || []).map(t=>t.plain_text).join("").trim();
}

async function fetchAllPages(notion, dataSourceId){
  const pages = [];
  let cursor = undefined;
  let hasMore = true;
  while(hasMore){
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor || undefined;
  }
  return pages;
}

function escapeForJsString(str){
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function buildOutputFile(byGod){
  const godKeys = Object.keys(byGod);
  const body = godKeys.map(god=>{
    const items = byGod[god].map(item=>{
      const optsStr = item.opts.map(o=>`"${escapeForJsString(o)}"`).join(", ");
      return `    { q:"${escapeForJsString(item.q)}", opts:[${optsStr}] },`;
    }).join("\n");
    return `  "${escapeForJsString(god)}": [\n${items}\n  ],`;
  }).join("\n");

  return `// 이 파일은 scripts/sync-questions.js 로 자동 생성됩니다.
// 직접 수정하지 말고 노션에서 수정 후 다시 동기화하세요.
// 구조: 신(카테고리) 이름 -> 그 신이 물어볼 수 있는 질문들의 풀(배열)
const PERSONALITY_QUESTIONS = {
${body}
};
`;
}

async function main(){
  const token = process.env.NOTION_TOKEN;
  if(!token){
    fail(
      "NOTION_TOKEN이 설정되어 있지 않습니다. .env를 확인하세요 (sync-achievements.js와 동일한 토큰 사용)."
    );
  }

  const notion = new Client({ auth: token });
  const dataSourceId = await resolveDataSourceId(notion);
  console.log(`[sync-questions] data source id: ${dataSourceId}`);

  const rawPages = await fetchAllPages(notion, dataSourceId);
  console.log(`[sync-questions] 노션에서 ${rawPages.length}개 페이지를 조회했습니다.`);

  const byGod = {};
  const skipped = [];
  for(const page of rawPages){
    const q = extractTitlePlainText(page.properties);
    const god = extractSelectName(page.properties, PROP_GOD);
    const opts = [
      extractRichText(page.properties, PROP_OPT1),
      extractRichText(page.properties, PROP_OPT2),
      extractRichText(page.properties, PROP_OPT3),
    ];

    if(!q || !god || opts.some(o=>!o)){
      skipped.push(page.id);
      continue;
    }

    if(!byGod[god]) byGod[god] = [];
    byGod[god].push({ q, opts });
  }

  if(skipped.length > 0){
    console.warn(`[sync-questions] 경고: 필수 항목(질문/신/선택지 3개)이 비어있어 건너뛴 페이지 ${skipped.length}개 (id: ${skipped.slice(0,5).join(", ")}${skipped.length>5 ? " 외" : ""})`);
  }

  const totalQuestions = Object.values(byGod).reduce((s,arr)=>s+arr.length, 0);
  fs.writeFileSync(OUTPUT_PATH, buildOutputFile(byGod), "utf8");
  console.log(`[sync-questions] 완료: ${Object.keys(byGod).length}개 신, 총 ${totalQuestions}개 질문을 ${path.basename(OUTPUT_PATH)}에 저장했습니다.`);
}

main().catch(err=>{
  fail(err && err.body ? `${err.message}\n${JSON.stringify(err.body)}` : (err && err.message) || String(err));
});
