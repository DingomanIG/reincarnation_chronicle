/* ---------- 데이터 ---------- */
const NAME_POOL = {
  human:{ first:["카일","로한","엘사","마르코","이든","브란","셀린","도린"], last:["강","드보어","펠","하빈","코스타","윌로우"] },
  elf:{ first:["실바나","에라딘","루메아","탈리온","이센","페라윈"], last:["문베일","실버라이트","에벤타이드","윈드리프"] },
  dwarf:{ first:["도린","그림바르","우나","보르가","할디르","브룬힐"], last:["강철턱","불꽃수염","돌망치","깊은뿌리"] },
  orc:{ first:["구락","토그","라샤","크루그","자하","보르크"], last:["뼈부수기","붉은어금니","폭풍주먹","검은상처"] },
  beastkin:{ first:["루나","케이","아셰","비앙","울프","리엔"], last:["달발톱","서리귀","은빛꼬리","야생눈"] },
  goblin:{ first:["끽끽","스니크","모글","래트","픽스","자그"], last:["코찔찔이","쓰레기왕","잽싼발","곁눈질"] },
  ratkin:{ first:["칫칫","니블","스크래치","위스커","모르셀","꾸룩"], last:[] },
  halfdemon:{ first:["카인","리리스","벨","아자젤","네르","모라이"], last:[] },
  kobold:{ first:["클릭","스크릿","모크","다그","닙","라토"], last:[] },
  firbolg:{ first:["오슬로","브리아나","타룬","이보나","그웬돌","마훈"], last:["고요숲","이끼발","안개걸음","오래나무"] },
  gnome:{ first:["픽셀","토비아스","위즐","코고","넛시","페들"], last:["톱니바퀴","반짝손","작은망치","실험실"] },
  arachne:{ first:["실키","베놈","아라크","미스트웹","자매실","그림자실"], last:[] },
  halfelf:{ first:["아리엔","테오","실라스","엘로윈","다미안","리아나"], last:["두빛","경계인","섞인달","반그림자"] }
};
const NO_SURNAME_RACES = ["orc","goblin","ratkin","halfdemon","kobold","arachne"];
function genName(raceKey){
  const p = NAME_POOL[raceKey];
  if(NO_SURNAME_RACES.includes(raceKey)){
    return rand(p.first); // 성씨 없이 이름만
  }
  return `${rand(p.first)} ${rand(p.last)}`;
}
// 자식 이름: 이름은 새로 굴리되, 성(surname)은 부모 것을 그대로 물려받는다 (성씨 있는 종족만 해당)
function genChildName(raceKey, inheritedSurname){
  const p = NAME_POOL[raceKey];
  if(NO_SURNAME_RACES.includes(raceKey)){
    return rand(p.first);
  }
  const last = inheritedSurname || rand(p.last);
  return `${rand(p.first)} ${last}`;
}
// 이름 문자열에서 성(surname)만 뽑아낸다 ("이름 성" 형식, 성씨 없는 종족이면 null)
function extractSurname(fullName){
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[1] : null;
}

// 참고: 각 종족의 middleCount 필드는 업적카드 시스템 도입 이후 더 이상 쓰이지 않는다.
// (생애 중간 사건 개수는 이제 종족이 아니라 등급별 업적카드 장수로 결정됨 -> GRADE_CARD_COUNTS)
// 추후 다른 용도로 재사용할 수 있어 필드 자체는 삭제하지 않고 남겨둔다.
const RACES = [
  {
    key:"human", name:"인간", tag:"짧고 뜨겁게 타오르는 자들",
    icon:"◆", weight:18, lifespan:{avg:50, variance:20}, comingOfAge:[14,18], middleCount:3, childrenRange:[0,4],
    origins:["아렌 왕국","남부 자유도시 연합","변경 개척지","동부 교역국"],
    birthPlaces:["변방의 흙벽 마을","성벽 아래 빈민가","강가의 방앗간 마을","국경 근처 주둔지"],
    birthParents:["대장장이 아버지와 산파 어머니","이름 없는 용병","떠돌이 상인 부부","전쟁으로 남편을 잃은 홀어미"],
    jobs:["용병","민병대원","산적","상인","서기관","농부"],
    deaths:["열병으로", "전장의 창칼에", "빚쟁이의 칼에", "노환으로 잠자듯", "낯선 병에", "산적의 습격으로"],
    lines:[
      "전쟁이 터지자 손에 잡히는 대로 무기를 들었다.",
      "낯선 도시에서 이름을 숨기고 살았다.",
      "친구의 배신으로 모든 것을 잃었다.",
      "작은 밭 하나를 일구며 살았다."
    ]
  },
  {
    key:"elf", name:"엘프", tag:"숲의 시간으로 세상을 보는 자들",
    icon:"❖", weight:2, lifespan:{avg:800, variance:200}, comingOfAge:[25,40], middleCount:6, childrenRange:[0,2],
    origins:["은빛숲 일족","별지기 혈통","고목의 회랑"],
    birthPlaces:["천 년 된 숲 가장 깊은 나무 아래","달빛만 닿는 은빛 골짜기","인간의 발길이 닿지 않는 고목 마을"],
    birthParents:["숲의 수호자 일족","마지막 남은 별지기 혈통","오래전 잊힌 왕가의 후예"],
    jobs:["궁병 용병","숲의 민병","활잡이","별지기","고서 수집가","정령술사"],
    deaths:["숲과 함께 스러지며","오랜 슬픔 끝에 스스로","인간의 도끼에 쓰러진 숲을 지키다","시간의 무게에 짓눌려"],
    lines:[
      "인간의 짧은 삶을 동정하듯 지켜보았다.",
      "숲을 침범한 벌목꾼들과 오랜 싸움을 벌였다.",
      "사랑에 빠졌으나, 상대는 먼저 늙어 죽었다.",
      "홀로 별을 세는 습관이 생겼다."
    ]
  },
  {
    key:"dwarf", name:"드워프", tag:"돌과 불 속에서 정직한 자들",
    icon:"⛏", weight:12, lifespan:{avg:200, variance:40}, comingOfAge:[20,30], middleCount:5, childrenRange:[0,3],
    origins:["강철턱 씨족","깊은뿌리 산맥국","불꽃수염 동맹"],
    birthPlaces:["산맥 깊은 광산 마을","불꽃 대장간 골목","백 대에 걸친 굴착지"],
    birthParents:["대장장이 가문","광산 감독관 부부","이름난 세공사"],
    jobs:["산악 용병","갱도 민병","징집 전사","대장장이","광부","보석세공사"],
    deaths:["무너진 갱도에", "과로로 쓰러져", "대장간 불길 속에", "동료를 지키다가", "노환으로 조용히"],
    lines:[
      "첫 망치를 쥔 날, 손이 다 부르텄다.",
      "동료를 무너진 갱도에서 구해냈다.",
      "명작이라 불릴 물건을 만들었으나 팔지 않았다.",
      "술과 노래로 슬픔을 잊는 법을 배웠다."
    ]
  },
  {
    key:"orc", name:"오크", tag:"부족의 명예로 사는 자들",
    icon:"⚔", weight:22, lifespan:{avg:40, variance:15}, comingOfAge:[12,16], middleCount:2, childrenRange:[0,5],
    origins:["붉은협곡 부족","폭풍주먹 부족","검은상처 연맹"],
    birthPlaces:["황무지 전사 부족의 천막","부서진 옛 전장 근처 야영지","붉은 협곡 부족 마을"],
    birthParents:["부족장의 셋째 아이로","이름 없는 전사의 사생아로","전쟁에서 죽은 족장의 유복자로"],
    jobs:["부족 용병","징집 전사","약탈단원","부족 사냥꾼","무기 제작자","족장의 호위"],
    deaths:["결투 끝에 명예롭게","적의 매복에","부족 내분으로","마지막 전투에서","사냥 중 맹수에게"],
    lines:[
      "열 살에 처음 무기를 손에 쥐었다.",
      "부족의 명예를 걸고 결투에서 이겼다.",
      "패배한 적을 살려주어 부족의 비웃음을 샀다.",
      "그 결정이 훗날 부족을 구했다."
    ]
  },
  {
    key:"goblin", name:"고블린", tag:"수적으로 살아남는 자들",
    icon:"◈", weight:24, lifespan:{avg:25, variance:10}, comingOfAge:[5,8], middleCount:1, childrenRange:[0,8],
    origins:["쓰레기산 무리","하수도 소굴","폐광 굴 집단"],
    birthPlaces:["버려진 하수도 굴","쓰레기산 아래 은신처","폐광 깊숙한 굴 소굴"],
    birthParents:["누구인지도 모를 부모 밑에서","수십 형제자매 틈에서","고아로 무리에게 주워져"],
    jobs:["잡병 용병","도적떼 일원","해적선 잡부","땜장이","좀도둑","폐품 수집상"],
    deaths:["더 큰 놈에게 잡아먹혀","함정에 스스로 걸려","굶주림에","무리 싸움에 휘말려","도망치다 벼랑에서"],
    lines:[
      "형제 여럿을 눈앞에서 잃고도 살아남았다.",
      "남들이 버린 것에서 쓸모를 찾아냈다.",
      "몸집 큰 자들 틈에서 잔꾀로 버텼다.",
      "아무도 기억 못할 작은 친절을 베풀었다."
    ]
  },
  {
    key:"beastkin", name:"수인", tag:"본능과 이성 사이를 걷는 자들",
    icon:"✦", weight:13, lifespan:{avg:60, variance:20}, comingOfAge:[10,14], middleCount:3, childrenRange:[0,4],
    origins:["달빛 무리","경계땅 유랑단","초원 사냥터 부족"],
    birthPlaces:["달빛 아래 늑대 무리의 굴","인간 마을과 숲의 경계","이름 없는 초원의 무리터"],
    birthParents:["무리의 우두머리 밑에서","인간에게 거두어져","떠돌이 무리의 막내로"],
    jobs:["용병","국경 민병","산적 무리 일원","사냥꾼","약초꾼","떠돌이 안내인"],
    deaths:["무리를 지키다가","낯선 병에","보름달 아래 조용히","인간과의 충돌에서","늙은 몸으로 홀로"],
    lines:[
      "인간 마을 근처를 떠돌며 자랐다.",
      "누구에게도 완전히 속하지 못했다.",
      "위기의 순간, 낯선 이를 구하고 신뢰를 얻었다.",
      "작은 무리를 이루어 정착했다."
    ]
  },
  {
    key:"ratkin", name:"쥐인간", tag:"틈새에서 번성하는 자들",
    icon:"⁘", weight:20, lifespan:{avg:20, variance:8}, comingOfAge:[4,6], middleCount:1, childrenRange:[0,10],
    origins:["하수구 무리","곡물창고 소굴","도시 지하 굴"],
    birthPlaces:["곡물창고 지하","하수도 미로","버려진 마차 밑"],
    birthParents:["쥐 떼 속에서 정체 모를 부모 밑에","굶주린 어미 밑에서","무리에게 거두어져"],
    jobs:["하수구 용병","도적단 일원","해적선 밀항꾼","소매치기","정보상","암거래상"],
    deaths:["덫에 걸려","포식자에게 쫓기다가","전염병에","동족 다툼에","굶주림에"],
    lines:[
      "누구보다 빠르게 달아나는 법을 배웠다.",
      "좁은 틈 사이로 위기를 피했다.",
      "무리의 정보망을 장악했다.",
      "아무도 눈치채지 못하게 스며들었다."
    ]
  },
  {
    key:"halfdemon", name:"하프데몬", tag:"경계에 선 자들",
    icon:"❂", weight:3, lifespan:{avg:150, variance:50}, comingOfAge:[15,22], middleCount:4, childrenRange:[0,1],
    origins:["이름 없는 계약자","추방된 혈통","그림자 시장의 그늘"],
    birthPlaces:["인간과 마족이 스쳐간 뒷골목","봉인된 제단 근처","국경 밖 그림자 마을"],
    birthParents:["이름을 밝히지 않은 마족 아버지에게","인간 어머니와 정체불명의 존재 사이에서","계약의 대가로"],
    jobs:["계약 용병","경계 감시자","산적 두목","봉인술사","암시장 브로커","저주 해석가"],
    deaths:["봉인의 대가로","경계를 넘다가","오랜 저주 끝에","계약의 반동으로","인간도 마족도 아니란 이유로 배척받다"],
    lines:[
      "인간도 마족도 자신을 온전히 받아주지 않았다.",
      "힘을 억누르는 법을 스스로 익혔다.",
      "같은 처지의 이를 만나 처음으로 안도했다.",
      "자신의 존재를 증명하려 애썼다."
    ]
  },
  {
    key:"kobold", name:"코볼트", tag:"함정과 굴을 사랑하는 자들",
    icon:"▲", weight:16, lifespan:{avg:30, variance:10}, comingOfAge:[5,8], middleCount:2, childrenRange:[0,6],
    origins:["붉은굴 부족","광맥 아래 둥지","버려진 던전 개척지"],
    birthPlaces:["좁은 굴 둥지 속","버려진 광산 통로","돌무더기 밑 은신처"],
    birthParents:["둥지를 지키는 어미 밑에서","알 무더기 속 여럿과 함께","부족 전체가 함께 돌보아"],
    jobs:["함정 용병","굴 민병","도적 무리 일원","덫 제작자","광맥 탐지꾼","보물 관리인"],
    deaths:["자신이 만든 함정에","무너진 굴에","침입자와의 다툼에","독기 가득한 공기에","늙어 조용히"],
    lines:[
      "누구보다 정교한 함정을 놓는 법을 배웠다.",
      "좁은 굴 구석구석을 손바닥 보듯 꿰뚫었다.",
      "침입자를 골탕먹이는 데서 즐거움을 느꼈다.",
      "작은 몸집으로 몇 번이나 위기를 피했다."
    ]
  },
  {
    key:"firbolg", name:"펄보그", tag:"숲과 침묵을 지키는 거인족",
    icon:"☘", weight:6, lifespan:{avg:90, variance:20}, comingOfAge:[18,25], middleCount:4, childrenRange:[0,2],
    origins:["안개숲 수호단","고요한 골짜기 씨족","오래된 나무 아래 은둔지"],
    birthPlaces:["안개 자욱한 숲 깊은 곳","오래된 신단 옆 오두막","이끼 낀 거석 아래"],
    birthParents:["숲을 지키는 부모 밑에서","조용한 은둔자 가문에서","나무의 축복을 받은 부모에게"],
    jobs:["숲 민병","방랑 용병","국경 수비대","약초 치유사","고대 유적 관리인","조용한 사냥꾼"],
    deaths:["숲을 지키다가","고요히 나무 아래서","오래된 저주에","길잃은 이를 구하다가","늙어 자연으로 돌아가듯"],
    lines:[
      "말보다 침묵으로 마음을 전하는 법을 익혔다.",
      "다친 짐승을 그냥 지나치지 못했다.",
      "거대한 몸집 뒤에 온화한 마음을 숨겼다.",
      "숲이 위협받을 때만 목소리를 높였다."
    ]
  },
  {
    key:"gnome", name:"노움", tag:"호기심으로 세상을 뜯어보는 자들",
    icon:"⚙", weight:7, lifespan:{avg:300, variance:60}, comingOfAge:[25,45], middleCount:5, childrenRange:[0,3],
    origins:["톱니바퀴 공방 마을","지하 발명가 조합","이끼정원 은신처"],
    birthPlaces:["발명품 가득한 작업실","지하 공방 마을","버섯 정원 옆 오두막"],
    birthParents:["발명가 부모 밑에서","조합 소속 장인 가문에서","호기심 많은 학자 부모에게"],
    jobs:["기계병 용병","공방 민병대원","폭발물 징집병","발명가","환영술사","연금술사"],
    deaths:["실험 도중 폭발로","오랜 연구 끝에 조용히","기계 오작동에","호기심을 좇다가","노환으로"],
    lines:[
      "쉬지 않고 무언가를 분해하고 다시 조립했다.",
      "작은 발명품 하나로 마을을 놀라게 했다.",
      "위험한 실험을 몇 번이나 반복했다.",
      "환영과 진짜를 구분 못하게 만드는 재주가 있었다."
    ]
  },
  {
    key:"arachne", name:"아라크네", tag:"실을 짜 세상을 엮는 자들",
    icon:"❋", weight:3, lifespan:{avg:80, variance:25}, comingOfAge:[4,7], middleCount:3, childrenRange:[0,20],
    origins:["거미줄 회랑","숨겨진 협곡 둥지","버려진 탑의 그늘"],
    birthPlaces:["거미줄 뒤덮인 탑 꼭대기","협곡 깊은 둥지","오래된 신전의 그늘"],
    birthParents:["알집에서 수십 형제와 함께","고독한 어미의 마지막 알에서","이름 모를 자매들 틈에서"],
    jobs:["용병 자객","협곡 산적","그림자 암살자","실 짜는 장인","독 조제사","정보 수집가"],
    deaths:["자신의 거미줄에 얽혀","독에 중독되어","사냥꾼에게 쫓기다가","동족과의 다툼에","늙어 실을 놓으며"],
    lines:[
      "누구도 눈치채지 못하게 그림자에 숨는 법을 익혔다.",
      "정교한 거미줄로 함정을 완성했다.",
      "낯선 이를 유인해 정보를 캐냈다.",
      "고독을 두려워하지 않는 법을 배웠다."
    ]
  },
  {
    key:"halfelf", name:"하프엘프", tag:"두 세계 사이에서 태어난 자들",
    icon:"◇", weight:5, lifespan:{avg:150, variance:40}, comingOfAge:[16,20], middleCount:4, childrenRange:[0,3],
    origins:["국경 마을 혼혈 공동체","인간 왕국 변방 가문","숲과 도시 사이 정착지"],
    birthPlaces:["인간과 엘프가 함께 사는 변경 마을","숲과 도시 경계의 여관","혼혈을 받아준 작은 공동체"],
    birthParents:["인간 아버지와 엘프 어머니 사이에서","엘프 아버지와 인간 어머니 사이에서","서로 다른 두 세계의 부모 밑에서"],
    jobs:["용병 대장","국경 민병","해적 항해사","방랑 음유시인","외교 중개인","이야기 수집가"],
    deaths:["오랜 방랑 끝에","두 세계 모두에게 잊혀진 채","전장에서 명예롭게","조용한 여관에서 노환으로","경계를 넘다 사고로"],
    lines:[
      "어느 쪽에도 완전히 속하지 못한 채 자랐다.",
      "두 언어와 두 문화를 오가며 살았다.",
      "인간의 열정과 엘프의 인내를 동시에 지녔다.",
      "경계인이라는 이유로 오히려 많은 곳을 넘나들었다."
    ]
  }
];

// 종족 출현 가중치(weight)가 낮을수록 희귀 -> 등급으로 환산
const GRADE_ORDER = ["전설","고급","레어","일반"]; // 앞쪽일수록 희귀/상위
function raceGrade(race){
  if(race.weight <= 3) return "전설";
  if(race.weight <= 7) return "고급";
  if(race.weight <= 13) return "레어";
  return "일반";
}

// 등급별로 이번 생에서 뽑을 업적카드 장수
const GRADE_CARD_COUNTS = { "일반":1, "레어":2, "고급":3, "전설":4 };

// ACHIEVEMENT_CARDS(achievement-cards.js, 노션 동기화 결과)에서 count장을 중복 없이 랜덤으로 뽑는다
function rollAchievementCards(count){
  const pool = [...ACHIEVEMENT_CARDS];
  const drawn = [];
  for(let i=0; i<count && pool.length>0; i++){
    const idx = Math.floor(Math.random()*pool.length);
    drawn.push(pool.splice(idx,1)[0]);
  }
  return drawn;
}

function pickWeightedRace(){
  const total = RACES.reduce((s,r)=>s+r.weight,0);
  let roll = Math.random()*total;
  for(const r of RACES){
    if(roll < r.weight) return r;
    roll -= r.weight;
  }
  return RACES[0];
}

const GENDERS = ["남성","여성"];

// 고정된 성향 질문 2개(PERSONALITY_Q)는 폐기되었다.
// 이제 이번 생에 뽑힌 업적카드들의 카테고리(신)에 맞춰, personality-questions.js의
// PERSONALITY_QUESTIONS[신]에서 질문을 하나씩 골라 묻는 방식으로 대체됨 (beginQuestions() 참고).

const RANDOM_EVENTS = [
  "이름 모를 병에 걸렸으나 기적처럼 나았다.",
  "가뭄이 마을을 덮쳐 살던 곳을 떠나야 했다.",
  "대홍수로 터전을 잃고 낯선 땅으로 이주했다.",
  "흉작이 몇 해나 이어져 살길을 찾아 먼 곳으로 떠났다.",
  "전쟁이 터지며 원치 않게 전장에 휘말렸다.",
  "이웃 세력의 침공으로 고향이 불타 없어졌다.",
  "낯선 이민족이 밀려들어 살던 땅을 등져야 했다.",
  "역병이 마을을 휩쓸어 절반 넘는 이웃을 잃었다.",
  "밤사이 죽은 자들이 일어나 마을이 아수라장이 되었다.",
  "정체 모를 저주가 땅에 내려 사람들이 하나둘 떠났다.",
  "광신도 무리가 나타나 마을을 혼란에 빠뜨렸다.",
  "전투에서 세운 공으로 부대를 이끄는 자리에 올랐다.",
  "오랜 공적을 인정받아 기사 작위를 받았다.",
  "능력을 인정받아 지역 관료로 임명되었다.",
  "전공을 쌓아 장군의 자리에까지 올랐다.",
  "오랜 원수와 우연히 재회했다.",
  "잃어버렸던 물건을 엉뚱한 곳에서 되찾았다.",
  "축제의 밤, 평생 잊지 못할 춤을 추었다.",
  "낯선 땅에서 길을 잃고 헤맸다.",
  "누군가의 마지막 부탁을 들어주었다.",
  "홀로 국경을 넘었다.",
  "폭풍우 치던 밤, 낯선 이를 집에 들였다."
];

/* ---------- Supabase 연동 (세계관 아카이브) ---------- */
const SUPABASE_URL = "https://ngpgcacrwhillsxmsyla.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6-L9m0HRIsvtVSpjCAHkCA__GIG0DiF";

let supabaseClient = null;
try{
  if(window.supabase && typeof window.supabase.createClient === "function"){
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}catch(e){
  console.error("[archive] Supabase 클라이언트 초기화 실패", e);
}

// 새로 태어난 캐릭터를 아카이브 테이블에 저장하고, 생성된 행의 id를 돌려준다
// (다음 세대를 이어갈 때 그 id를 parent_id로 물려주기 위함)
async function archiveCharacter(record){
  if(!supabaseClient) throw new Error("Supabase 클라이언트를 사용할 수 없습니다.");
  const { data, error } = await supabaseClient.from("characters").insert(record).select("id").single();
  if(error) throw error;
  return data ? data.id : null;
}

// 가족도용: parent_id를 타고 올라가며 조상 체인을 가져온다 (가장 오래된 조상이 배열 맨 앞)
async function fetchAncestorChain(parentId){
  if(!supabaseClient || !parentId) return [];
  const chain = [];
  let currentId = parentId;
  let guard = 0;
  while(currentId && guard < 20){ // 혹시 모를 순환 참조 방지용 안전장치
    guard++;
    const { data, error } = await supabaseClient
      .from("characters")
      .select("id, name, race, grade, birth_year, death_year, parent_id")
      .eq("id", currentId)
      .maybeSingle();
    if(error || !data) break;
    chain.push(data);
    currentId = data.parent_id;
  }
  return chain.reverse();
}

// 세계관 통계용: 전체 캐릭터의 등급/종족/생애 구간만 조회
async function fetchWorldRecords(){
  if(!supabaseClient) throw new Error("Supabase 클라이언트를 사용할 수 없습니다.");
  const { data, error } = await supabaseClient
    .from("characters")
    .select("grade, race, birth_year, death_year");
  if(error) throw error;
  return data || [];
}

/* ---------- 상태 ---------- */
let state = {
  race:null, grade:null, stats:null, traits:[], name:null, gender:null,
  // 자식으로 이어가기 기능용 상태
  pendingChild:null,        // 이번 생 결과에서 넘겨줄 자식 정보 { race, origin, birthYear, parentId }
  inheritedBirthYear:null,  // 자식으로 이어갈 때 물려받는 출생년도
  isChildContinuation:false, // 지금 진행 중인 생이 "자식으로 이어가기"로 시작됐는지
  parentId:null,            // 지금 이 생 자신의 부모 캐릭터 행 id (가족도/DB parent_id용, 없으면 1세대)
  // 신-질문 시스템용 상태
  drawnCards:null,         // 이번 생에 뽑힌 업적카드들 [{category,point,text}, ...] (screenResult에서 소비)
  questionQueue:null       // drawnCards의 카테고리 순서대로 물어볼 질문들 [{q,opts}, ...]
};

const card = document.getElementById('card');
const foot = document.getElementById('foot');
const stageEl = document.getElementById('stage');
const layoutEl = document.getElementById('layout');
const sidePanelsEl = document.getElementById('sidePanels');

// 결과 화면이 아닌 다른 화면으로 이동할 때 세계관 통계 패널을 비운다
function resetSidePanels(){
  if(stageEl) stageEl.classList.remove('has-panels');
  if(layoutEl) layoutEl.classList.remove('split');
  if(sidePanelsEl) sidePanelsEl.innerHTML = '';
}

// 화면 전환 시 카드 내용을 위에서 아래로 슬라이드 다운시키며 교체한다
function setCardHTML(html){
  card.innerHTML = html;
  card.classList.remove('slide-down');
  void card.offsetWidth; // 강제 리플로우: 애니메이션 재시작
  card.classList.add('slide-down');
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const STAT_MAX = 18;
const STAT_MIN = 3;

// 낮은 값이 확 잘 나오도록 강하게 치우친 굴림 (지수를 키울수록 저구간에 쏠림)
function rollStats(){
  const roll = () => STAT_MIN + Math.floor(Math.pow(Math.random(), 2.6) * (STAT_MAX - STAT_MIN + 1));
  return { 힘:roll(), 지혜:roll(), 매력:roll() };
}

// 스탯별 5단계 태그 (최저/낮음/평범/높음/최고) - 위트있게
const STAT_TAGS = {
  힘:   ["젓가락도 못 드는 팔", "고양이한테도 밀림", "그럭저럭 쓸만한 팔뚝", "황소도 밀어붙임", "한 손으로 성문을 뜯음"],
  지혜: ["어제 한 말도 까먹음", "구구단이 아직도 헷갈림", "책은 읽는데 기억은 못함", "한 번 보면 잊지 않음", "현자들이 조언을 구하러 옴"],
  매력: ["코끼리가 밟고 지나간 얼굴", "정들면 봐줄만한 얼굴", "지나가다 한번쯤 돌아볼 얼굴", "거리의 이목을 끄는 얼굴", "보는 순간 숨이 멎는 얼굴"]
};
function statTag(statName, value){
  const tiers = STAT_TAGS[statName];
  if(value <= 5) return tiers[0];
  if(value <= 8) return tiers[1];
  if(value <= 12) return tiers[2];
  if(value <= 15) return tiers[3];
  return tiers[4];
}
function renderStatRow(stats){
  return `
    <div class="stat-row">
      ${Object.keys(stats).map(key => `
        <span>${key}<b>${stats[key]}/${STAT_MAX}</b><span class="stat-tag">${statTag(key, stats[key])}</span></span>
      `).join('')}
    </div>
  `;
}

function progressDots(step,total){
  let h = '<div class="progress">';
  for(let i=0;i<total;i++){
    h += `<div class="dot ${i<step?'done':''} ${i===step?'active':''}"></div>`;
  }
  return h + '</div>';
}

/* ---------- 화면: 0 시작 ---------- */
function screenStart(){
  resetSidePanels();
  setCardHTML(`
    <p class="step-title">주사위를 굴려 새로운 삶을 시작한다.<br>당신이 될 존재는, 굴려보기 전엔 아무도 모른다.</p>
    <div class="choice-grid">
      <button class="choice" onclick="screenRace()">
        <span class="name">🎲 환생하기</span>
        <span class="desc">종족 · 스탯 · 성향을 정하고 한 생을 산다</span>
      </button>
    </div>
  `);
  foot.textContent = "";
}

/* ---------- 화면: 1 종족 뽑기 ---------- */
function screenRace(){
  resetSidePanels();
  setCardHTML(progressDots(0,4) + `
    <p class="step-title">주사위가 종족을 정한다.</p>
    <div class="choice-grid">
      <button class="choice" onclick="rollRace()">
        <span class="name">🎲 종족 굴리기</span>
        <span class="desc">인간부터 아라크네까지, 13종족 중 하나</span>
      </button>
    </div>
  `);
}
function rollRace(){
  // 완전히 새로운 환생이므로, 혹시 남아있을 자식 이어가기 상태는 초기화한다
  state.inheritedBirthYear = null;
  state.isChildContinuation = false;
  state.parentId = null; // 새 가문의 1세대 (조상 없음)
  state.race = pickWeightedRace();
  state.grade = raceGrade(state.race);
  state.name = genName(state.race.key);
  state.gender = rand(GENDERS);
  state.origin = rand(state.race.origins);
  screenStats();
}

// 직전 생에서 자식을 두었을 때, 그 자식으로 이어서 플레이한다.
// 종족/출신은 그대로 물려받고(랜덤 재추첨 없음), 이름·스탯은 새로 굴린다.
// 종족 굴리기 화면은 건너뛰고, 성향 질문 화면도 건너뛴다.
function continueAsChild(){
  const pending = state.pendingChild;
  if(!pending) return;
  state.race = pending.race;
  state.grade = raceGrade(pending.race);
  state.name = genChildName(pending.race.key, pending.surname);
  state.gender = rand(GENDERS);
  state.origin = pending.origin;
  state.traits = [];
  state.inheritedBirthYear = pending.birthYear;
  state.isChildContinuation = true;
  state.parentId = pending.parentId || null;
  state.pendingChild = null;
  screenStats();
}

/* ---------- 화면: 2 스탯 ---------- */
function screenStats(){
  resetSidePanels();
  state.stats = rollStats();
  const nextDesc = state.isChildContinuation ? "성향 질문은 건너뛰고 바로 삶을 살아본다" : "이 삶의 성향을 정한다";
  setCardHTML(progressDots(1,4) + `
    <p class="step-title">${state.race.icon} <b style="color:var(--gold)">${state.name}</b><br><span style="font-size:13px;color:var(--ink-soft)">${state.gender} · ${state.race.name}(으)로 태어났다</span></p>
    ${renderStatRow(state.stats)}
    <div class="choice-grid">
      <button class="choice" onclick="beginQuestions()">
        <span class="name">다음 →</span>
        <span class="desc">${nextDesc}</span>
      </button>
    </div>
  `);
}

// 등급이 정해졌으니(state.grade), 그 등급만큼 업적카드를 먼저 뽑고, 뽑힌 카드들의
// 카테고리(신) 순서대로 물어볼 질문 큐를 만든다. 자식으로 이어가기 중이면 질문 없이 바로 결과로.
function beginQuestions(){
  const cardCount = GRADE_CARD_COUNTS[state.grade] || 1;
  state.drawnCards = rollAchievementCards(cardCount);
  state.traits = [];

  // 카드마다 그 카테고리(신)의 질문 풀에서 하나씩 랜덤으로 고른다.
  // 같은 신이 카드에 두 번 나오면 그 신 질문도 그대로 두 번 묻는다 (중복 방지 없음).
  state.questionQueue = state.drawnCards.map(c=>{
    const pool = (typeof PERSONALITY_QUESTIONS !== "undefined" && PERSONALITY_QUESTIONS[c.category]) || [];
    return pool.length ? rand(pool) : null; // 그 신의 질문이 아직 없으면 이 카드 자리는 질문 없이 스킵
  }).filter(q=>q);

  if(state.isChildContinuation){
    screenResult();
  } else {
    screenGodQuestion(0);
  }
}

/* ---------- 화면: 3 성향 질문 (업적카드 카테고리의 신들이 순서대로 질문) ---------- */
function screenGodQuestion(i){
  if(!state.questionQueue || i >= state.questionQueue.length){ screenResult(); return; }
  const q = state.questionQueue[i];
  setCardHTML(progressDots(2,4) + `
    <p class="step-title">${q.q}</p>
    <div class="choice-grid">
      ${q.opts.map((label,idx)=>`
        <button class="choice" onclick="answerGodQuestion(${i},${idx})">
          <span class="name">${label}</span>
        </button>
      `).join('')}
    </div>
  `);
}
function answerGodQuestion(qi, oi){
  // 선택한 답은 지금 당장은 생애 텍스트에 반영되지 않지만(추후 확장 대비) 기록은 해둔다.
  state.traits.push({ questionIndex:qi, optionIndex:oi });
  screenGodQuestion(qi+1);
}

/* ---------- 화면: 4 결과 ---------- */
function hasBatchim(str){
  const ch = str.trim().slice(-1);
  const code = ch.charCodeAt(0) - 0xAC00;
  if(code < 0 || code > 11171) return false;
  return (code % 28) !== 0;
}
function josaWaGwa(word){
  return hasBatchim(word) ? "과" : "와";
}

function genSpouseName(race, selfName){
  let name = genName(race.key);
  let tries = 0;
  while(name === selfName && tries < 10){
    name = genName(race.key);
    tries++;
  }
  return name;
}

// hasChildren: "자식으로 이어가기" 버튼을 보여줄지 판단하는 데 쓰인다
function genChildrenLine(race, selfName){
  const [min,max] = race.childrenRange;
  const n = min + Math.floor(Math.random()*(max-min+1));
  const married = Math.random() < 0.75; // 75% 확률로 혼인

  if(!married){
    return { text: rand(["끝내 혼인하지 않고 홀로 생을 지켰다.","평생 홀로 떠도는 삶을 택했다."]), hasChildren:false };
  }

  const spouse = genSpouseName(race, selfName);
  const j = josaWaGwa(spouse);

  if(n === 0){
    return { text: `${spouse}${j} 혼인했으나 자식은 두지 못했다.`, hasChildren:false };
  }
  if(n === 1){
    return { text: `${spouse}${j} 혼인해 슬하에 자식 하나를 두었다.`, hasChildren:true };
  }
  return { text: `${spouse}${j} 혼인해 슬하에 자식 ${n}명을 두었다.`, hasChildren:true };
}

// 생애 구조: 출생(0pt) -> 직업(0pt) -> 자녀/혼인줄(0pt) -> 업적카드 N장(등급별 장수) -> 사망(0pt)
// (기존 race.lines / traits / RANDOM_EVENTS 조합은 업적카드 시스템으로 대체되었다.
//  traits 자체는 성향 질문 화면 유지를 위해 계속 수집하지만, 생애 텍스트 생성에는 더 이상 쓰이지 않는다.)
// 반환값: { lines: [{text,point}...], hasChildren }
// (자녀 줄은 항상 인덱스 2에 고정되므로, ages[2]가 곧 "자식을 본 나이"가 된다 -> 자식으로 이어가기의 출생년도 계산에 사용)
function generateLifeLines(){
  const birthLine = { text: `${rand(state.race.birthPlaces)}에서, ${rand(state.race.birthParents)} 태어났다.`, point: 0 };
  const job = rand(state.race.jobs);
  const jobLine = { text: `${job}${hasBatchim(job) ? "으로" : "로"} 살아가기 시작했다.`, point: 0 };
  const childrenResult = genChildrenLine(state.race, state.name);
  const childrenLine = { text: childrenResult.text, point: 0 };
  const deathLine = { text: `${rand(state.race.deaths)} 죽음을 맞았다.`, point: 0 };

  // 업적카드는 이제 beginQuestions()에서 미리 뽑아 state.drawnCards에 담아둔다
  // (질문을 던질 신을 정하려면 결과 화면보다 먼저 카드를 알아야 하기 때문).
  const cardLines = (state.drawnCards || []).map(c=>({ text: c.text, point: c.point }));

  return {
    lines: [birthLine, jobLine, childrenLine, ...cardLines, deathLine],
    hasChildren: childrenResult.hasChildren
  };
}

// 이제 각 줄(lines)이 이미 point를 담고 있으므로, 그대로 추출만 한다.
function generateLifePoints(lines){
  return lines.map(l=>l.point);
}
function generateAges(count, race){
  // 종족 평균수명(lifespan)에 비례해 생애 전체 나이를 배분한다
  const { avg, variance } = race.lifespan;
  const deathAge = Math.max(5, Math.round(avg + (Math.random()*2-1)*variance));

  const [comeMin, comeMax] = race.comingOfAge;
  const jobAge = Math.max(1, Math.min(deathAge-1, comeMin + Math.floor(Math.random()*(comeMax-comeMin+1))));
  const ages = [0, jobAge]; // 출생, 직업 시작
  const middleCount = count - 3;
  const span = Math.max(1, deathAge - jobAge - 1);
  for(let i=1;i<=middleCount;i++){
    const t = i/(middleCount+1); // 0~1 사이 진행률
    const jitter = Math.round((Math.random()-0.5)*span*0.2);
    ages.push(Math.min(deathAge-1, jobAge + Math.round(span*t) + jitter));
  }
  ages.push(deathAge); // 사망
  return ages;
}

function screenResult(){
  const { lines, hasChildren } = generateLifeLines(); // lines: [{text, point}, ...]
  const ages = generateAges(lines.length, state.race);
  const points = generateLifePoints(lines);
  const totalPoints = points.reduce((a,b)=>a+b,0);
  // 자식으로 이어가기로 시작한 생이면 물려받은 출생년도를 쓰고, 아니면 새로 굴린다
  const birthYear = state.inheritedBirthYear != null
    ? state.inheritedBirthYear
    : 100 + Math.floor(Math.random()*900);
  const deathYear = birthYear + ages[ages.length-1];
  const grade = state.grade;

  // 이 생 자신의 부모 id (가계도 DB 저장용). 자식에게 물려줄 parentId는
  // 이 생이 실제로 저장된 뒤에야 알 수 있으므로 일단 null로 만들어두고,
  // archiveAndLoadWorldStats()에서 insert 성공 시 채워 넣는다.
  const myParentId = state.parentId;

  // 자녀 줄은 항상 인덱스 2 -> ages[2]가 "자식을 본 나이". 이 생의 출생년도 기준으로
  // 다음 세대(자식)의 출생년도를 계산해 이어가기 버튼에 실어 보낸다.
  if(hasChildren){
    state.pendingChild = {
      race: state.race,
      origin: state.origin,
      birthYear: birthYear + ages[2],
      parentId: null,
      surname: extractSurname(state.name)
    };
  } else {
    state.pendingChild = null;
  }
  // 이번 생을 만드는 데 쓴 상속/카드/질문 정보는 소비했으니 초기화 (다음 전개부터는 일반 흐름)
  state.inheritedBirthYear = null;
  state.isChildContinuation = false;
  state.drawnCards = null;
  state.questionQueue = null;

  setCardHTML(progressDots(3,4) + `
    <div class="portrait-slot">${state.race.icon}</div>
    <p class="race-name">${state.name}</p>
    <div class="grade-badge-wrap"><span class="grade-badge">${grade}</span></div>
    <p class="race-tag">${state.gender} · ${state.race.name} · ${state.origin}</p>
    <p style="text-align:center;font-size:11px;color:var(--ink-soft);margin:-14px 0 20px;font-style:italic;">${state.race.tag}</p>
    ${renderStatRow(state.stats)}
    <ul class="life-lines">
      ${lines.map((l,idx)=>`<li><span class="yr">${birthYear + ages[idx]}년<br>(${ages[idx]}세)</span><span>${l.text}</span><span class="pt">+${l.point}</span></li>`).join('')}
    </ul>
    <div class="total-points">
      <span>이번 생의 업적 포인트</span>
      <b>+${totalPoints}</b>
    </div>
    <div class="actions">
      <button class="btn" onclick="screenRace()">🎲 다시 환생</button>
      ${hasChildren ? `<button class="btn" onclick="continueAsChild()">👶 자식으로 이어가기</button>` : ''}
      <button class="btn ghost" onclick="screenStart()">처음으로</button>
    </div>
  `);
  foot.textContent = "업적 포인트는 누적되면 로어포인트로 전환됩니다 (프로토타입: 미저장)";

  const record = {
    name: state.name,
    gender: state.gender,
    race: state.race.name,
    origin: state.origin,
    grade: grade,
    visible_stats: state.stats,
    life_lines: lines,
    contribution_points: totalPoints,
    birth_year: birthYear,
    death_year: deathYear,
    parent_id: myParentId
  };

  renderSidePanelsLoading();
  archiveAndLoadWorldStats(record);
}

/* ---------- 세계관 통계 (타임라인 + 통계 패널) ---------- */
function renderSidePanelsLoading(){
  if(stageEl) stageEl.classList.add('has-panels');
  if(layoutEl) layoutEl.classList.add('split');
  if(sidePanelsEl){
    sidePanelsEl.innerHTML = `
      <div class="side-panel">
        <p class="loading-text">세계의 기록을 불러오는 중...</p>
      </div>
    `;
  }
}

function renderSidePanelsError(){
  if(sidePanelsEl){
    sidePanelsEl.innerHTML = `
      <div class="side-panel">
        <p class="loading-text">세계의 기록을 불러오지 못했습니다.<br>(네트워크 또는 서버 상태를 확인해주세요)</p>
      </div>
    `;
  }
}

async function archiveAndLoadWorldStats(record){
  try{
    const insertedId = await archiveCharacter(record);
    // 이번 생에 자식이 있었다면, 방금 저장된 이 생의 id를 자식의 parent_id로 물려준다
    if(state.pendingChild) state.pendingChild.parentId = insertedId;
  }catch(e){
    console.error("[archive] 캐릭터 저장 실패", e);
  }
  try{
    const [all, ancestorChain] = await Promise.all([
      fetchWorldRecords(),
      fetchAncestorChain(record.parent_id)
    ]);
    renderSidePanels(all, record, ancestorChain);
  }catch(e){
    console.error("[archive] 세계관 통계 조회 실패", e);
    renderSidePanelsError();
  }
}

// 생애 구간(birth_year~death_year)을 100년 단위 20개 버킷에 밀도로 집계
const TIMELINE_MAX_YEAR = 2000;
const TIMELINE_BUCKETS = 20;
function buildTimelineBuckets(records){
  const bucketSize = TIMELINE_MAX_YEAR / TIMELINE_BUCKETS;
  const counts = new Array(TIMELINE_BUCKETS).fill(0);
  records.forEach(r=>{
    if(r.birth_year == null || r.death_year == null) return;
    const start = Math.max(0, Math.min(TIMELINE_MAX_YEAR, r.birth_year));
    const end = Math.max(0, Math.min(TIMELINE_MAX_YEAR, r.death_year));
    if(end <= start) return;
    const startBucket = Math.floor(start / bucketSize);
    const endBucket = Math.min(TIMELINE_BUCKETS-1, Math.floor((end - 0.001) / bucketSize));
    for(let b=startBucket; b<=endBucket; b++){
      counts[b]++;
    }
  });
  return counts;
}

function renderTimelinePanel(all, record){
  const counts = buildTimelineBuckets(all);
  const maxCount = Math.max(1, ...counts);

  const bucketsHtml = counts.map(c=>{
    const alpha = (0.06 + (c / maxCount) * 0.55).toFixed(3);
    return `<div class="bucket" style="background:rgba(122,36,24,${alpha})" title="${c}명 생존"></div>`;
  }).join('');

  const myTopPct = (Math.max(0, Math.min(TIMELINE_MAX_YEAR, record.birth_year)) / TIMELINE_MAX_YEAR) * 100;
  const myEndPct = (Math.max(0, Math.min(TIMELINE_MAX_YEAR, record.death_year)) / TIMELINE_MAX_YEAR) * 100;
  const myHeightPct = Math.max(0.6, myEndPct - myTopPct);

  return `
    <div class="side-panel timeline-panel">
      <h3 class="panel-title">세계 연대기</h3>
      <div class="timeline-row">
        <div class="timeline-axis">
          <span style="top:0%">0</span>
          <span style="top:25%">500</span>
          <span style="top:50%">1000</span>
          <span style="top:75%">1500</span>
          <span style="top:100%">2000</span>
        </div>
        <div class="timeline-track">
          ${bucketsHtml}
          <div class="timeline-marker" style="top:${myTopPct}%;height:${myHeightPct}%" title="${record.name} (${record.birth_year}~${record.death_year})"></div>
        </div>
      </div>
      <p class="panel-caption">세상에 새겨진 모든 생애의 밀도(음영) 위에,<br>당신의 생애(금빛 강조)가 새겨졌다.</p>
    </div>
  `;
}

function renderStatsPanel(all, record){
  const total = all.length || 0;
  const safeTotal = total || 1;

  const gradeCounts = {};
  GRADE_ORDER.forEach(g => gradeCounts[g] = 0);
  all.forEach(r=>{
    if(gradeCounts[r.grade] === undefined) gradeCounts[r.grade] = 0;
    gradeCounts[r.grade]++;
  });
  const gradeRows = GRADE_ORDER.map(g=>{
    const pct = (gradeCounts[g] || 0) / safeTotal * 100;
    return `
      <div class="dist-row">
        <span class="dist-label">${g}</span>
        <div class="dist-bar"><div class="dist-fill" style="width:${pct}%"></div></div>
        <span class="dist-pct">${pct.toFixed(1)}%</span>
      </div>
    `;
  }).join('');

  // 아직 한 번도 나오지 않은 종족도 0%로 함께 보여준다
  const raceCounts = {};
  RACES.forEach(r=>{ raceCounts[r.name] = 0; });
  let unknownRaceCount = 0;
  all.forEach(r=>{
    if(r.race && raceCounts[r.race] !== undefined){
      raceCounts[r.race]++;
    } else {
      unknownRaceCount++;
    }
  });
  if(unknownRaceCount > 0) raceCounts["알 수 없음"] = unknownRaceCount;
  const raceSorted = Object.entries(raceCounts).sort((a,b)=>b[1]-a[1]);
  const raceRows = raceSorted.map(([name,c])=>{
    const pct = c / safeTotal * 100;
    return `
      <div class="dist-row">
        <span class="dist-label">${name}</span>
        <div class="dist-bar"><div class="dist-fill race" style="width:${pct}%"></div></div>
        <span class="dist-pct">${pct.toFixed(1)}%</span>
      </div>
    `;
  }).join('');

  // 등급별 누적 비율로 내 등급의 상위 % 계산 (전설이 가장 희귀 -> 상위)
  const myRank = GRADE_ORDER.indexOf(record.grade);
  const cumulativeCount = GRADE_ORDER.slice(0, myRank + 1).reduce((s,g)=> s + (gradeCounts[g] || 0), 0);
  const topPercent = cumulativeCount / safeTotal * 100;
  const topPercentLabel = topPercent < 1 ? topPercent.toFixed(2) : topPercent.toFixed(1);

  return `
    <div class="side-panel stats-panel">
      <h3 class="panel-title">세계관 통계</h3>
      <div class="stat-block">
        <span class="stat-block-label">지금까지 태어난 생명</span>
        <b class="stat-block-value">${total.toLocaleString()}<small>명</small></b>
      </div>
      <div class="dist-group">
        <p class="dist-title">등급 분포</p>
        ${gradeRows}
      </div>
      <div class="dist-group">
        <p class="dist-title">종족별 비율</p>
        ${raceRows}
      </div>
      <div class="my-rank">당신의 <b>${record.grade}</b> 등급은 전체 중 <b>상위 ${topPercentLabel}%</b></div>
    </div>
  `;
}

// 조상 체인(ancestorChain, 가장 오래된 조상이 앞) + 이번 생(record)을 세로 가계도로 렌더링.
// 부모가 없는(1세대) 생이면 보여줄 게 없으니 빈 문자열을 돌려준다.
function renderFamilyPanel(ancestorChain, record){
  if(!ancestorChain || ancestorChain.length === 0) return '';

  const nodes = [...ancestorChain, {
    name: record.name, race: record.race, grade: record.grade,
    birth_year: record.birth_year, death_year: record.death_year
  }];

  const rows = nodes.map((n, idx)=>{
    const isMe = idx === nodes.length - 1;
    const node = `
      <div class="family-node${isMe ? ' family-node-me' : ''}">
        <div class="family-node-name">${n.name}${isMe ? ' <span class="family-me-tag">나</span>' : ''}</div>
        <div class="family-node-meta">${n.race} · ${n.grade} · ${n.birth_year}~${n.death_year}년</div>
      </div>
    `;
    const connector = idx < nodes.length - 1 ? `<div class="family-connector">↓</div>` : '';
    return node + connector;
  }).join('');

  return `
    <div class="side-panel family-panel">
      <h3 class="panel-title">가족도</h3>
      <div class="family-tree">${rows}</div>
      <p class="panel-caption">대를 이어온 ${nodes.length}대의 혈통.</p>
    </div>
  `;
}

function renderSidePanels(all, record, ancestorChain){
  if(!sidePanelsEl) return;
  sidePanelsEl.innerHTML =
    renderFamilyPanel(ancestorChain, record) +
    renderTimelinePanel(all, record) +
    renderStatsPanel(all, record);
}

/* ---------- 초기 ---------- */
screenStart();
