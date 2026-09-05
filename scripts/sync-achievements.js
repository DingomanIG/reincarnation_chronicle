/**
 * scripts/sync-achievements.js
 *
 * 노션 "업적카드 풀" 데이터베이스 -> achievement-cards.js 동기화 스크립트.
 * 노션이 편집용 원본이며, 이 스크립트가 만들어내는 achievement-cards.js를
 * 게임(game-logic.js)이 그대로 읽어 사용한다. (추후 Supabase로 이전 예정)
 *
 * 실행: node scripts/sync-achievements.js
 *       (또는 npm run sync:achievements)
 *
 * 필요한 환경변수(.env):
 *   NOTION_TOKEN                          - Notion Integration Secret (필수)
 *   NOTION_ACHIEVEMENTS_DATA_SOURCE_ID     - "업적카드 풀" 데이터소스 ID (선택)
 *                                            생략 시 제목("업적카드 풀")으로 자동 검색
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Client } = require("@notionhq/client");

const DATABASE_TITLE = "업적카드 풀";
const OUTPUT_PATH = path.join(__dirname, "..", "achievement-cards.js");

// 노션 속성 이름 (실제 DB의 컬럼명과 일치해야 함)
const PROP_CATEGORY = "카테고리"; // select
const PROP_POINT = "포인트"; // select (숫자 문자열)
// 텍스트(title) 속성은 이름이 다를 수 있어 타입(title)으로 자동 탐색한다.

function fail(message){
  console.error(`\n[sync-achievements] 오류: ${message}\n`);
  process.exit(1);
}

async function resolveDataSourceId(notion){
  const envId = process.env.NOTION_ACHIEVEMENTS_DATA_SOURCE_ID;
  if(envId && envId.trim()){
    return envId.trim();
  }

  console.log(`[sync-achievements] NOTION_ACHIEVEMENTS_DATA_SOURCE_ID가 없어 "${DATABASE_TITLE}" 제목으로 검색합니다...`);
  const res = await notion.search({
    query: DATABASE_TITLE,
    page_size: 20,
  });

  const candidates = res.results.filter(r=>{
    if(r.object === "data_source" || r.object === "database"){
      const titleProp = r.title || (r.properties && r.properties.title) || [];
      const plain = Array.isArray(titleProp)
        ? titleProp.map(t=>t.plain_text).join("")
        : "";
      return plain.includes(DATABASE_TITLE);
    }
    return false;
  });

  if(candidates.length === 0){
    fail(
      `"${DATABASE_TITLE}" 데이터베이스를 찾을 수 없습니다.\n` +
      `  1) Notion에서 해당 데이터베이스 페이지 우측 상단 "연결" 메뉴로 이 Integration을 연결했는지 확인하세요.\n` +
      `  2) 또는 .env에 NOTION_ACHIEVEMENTS_DATA_SOURCE_ID를 직접 지정하세요.`
    );
  }

  const found = candidates[0];
  if(found.object === "data_source"){
    return found.id;
  }

  // object === "database" 인 경우, 실제 조회는 그 아래 data_sources[0].id로 해야 함
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
  if(prop.type === "status") return prop.status ? prop.status.name : null;
  if(prop.type === "rich_text") return (prop.rich_text || []).map(t=>t.plain_text).join("").trim();
  if(prop.type === "number") return prop.number;
  return null;
}

function toPointNumber(raw){
  if(typeof raw === "number") return raw;
  const n = parseInt(String(raw).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
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

function buildOutputFile(cards){
  const lines = cards.map(c=>{
    return `  {category:"${escapeForJsString(c.category)}", point:${c.point}, text:"${escapeForJsString(c.text)}"},`;
  }).join("\n");

  return `// 이 파일은 scripts/sync-achievements.js 로 자동 생성됩니다.
// 직접 수정하지 말고 노션에서 수정 후 다시 동기화하세요.
const ACHIEVEMENT_CARDS = [
${lines}
];
`;
}

async function main(){
  const token = process.env.NOTION_TOKEN;
  if(!token){
    fail(
      "NOTION_TOKEN이 설정되어 있지 않습니다.\n" +
      "  1) https://www.notion.so/my-integrations 에서 Integration을 만들고 토큰을 발급받으세요.\n" +
      "  2) 프로젝트 루트에 .env 파일을 만들고 NOTION_TOKEN=발급받은토큰 을 넣으세요. (.env.example 참고)\n" +
      "  3) 노션에서 \"업적카드 풀\" 데이터베이스 우측 상단 \"연결\" 메뉴로 이 Integration을 연결하세요."
    );
  }

  const notion = new Client({ auth: token });

  const dataSourceId = await resolveDataSourceId(notion);
  console.log(`[sync-achievements] data source id: ${dataSourceId}`);

  const rawPages = await fetchAllPages(notion, dataSourceId);
  console.log(`[sync-achievements] 노션에서 ${rawPages.length}개 페이지를 조회했습니다.`);

  const cards = [];
  const skipped = [];
  let missingCategoryCount = 0;
  for(const page of rawPages){
    const text = extractTitlePlainText(page.properties);
    const category = extractSelectName(page.properties, PROP_CATEGORY);
    const rawPoint = extractSelectName(page.properties, PROP_POINT);

    // 텍스트/포인트는 게임 로직에서 실제로 쓰이므로 필수. 카테고리는 아직 표시/사용되지 않는
    // 메타데이터라, 비어있어도 카드 자체는 살리고 "미분류"로 채운다 (콘솔에는 경고를 남김).
    if(!text || rawPoint == null){
      skipped.push(page.id);
      continue;
    }
    if(category == null) missingCategoryCount++;

    cards.push({
      category: category != null ? String(category) : "미분류",
      point: toPointNumber(rawPoint),
      text,
    });
  }

  if(skipped.length > 0){
    console.warn(`[sync-achievements] 경고: 텍스트/포인트가 비어있어 건너뛴 페이지 ${skipped.length}개 (id: ${skipped.slice(0,5).join(", ")}${skipped.length>5 ? " 외" : ""})`);
  }
  if(missingCategoryCount > 0){
    console.warn(`[sync-achievements] 경고: 카테고리가 비어있어 "미분류"로 채운 카드 ${missingCategoryCount}개 (노션에서 채워 넣으면 다음 동기화 때 반영됩니다)`);
  }

  fs.writeFileSync(OUTPUT_PATH, buildOutputFile(cards), "utf8");
  console.log(`[sync-achievements] 완료: ${cards.length}장의 업적카드를 ${path.basename(OUTPUT_PATH)}에 저장했습니다.`);
}

main().catch(err=>{
  fail(err && err.body ? `${err.message}\n${JSON.stringify(err.body)}` : (err && err.message) || String(err));
});
