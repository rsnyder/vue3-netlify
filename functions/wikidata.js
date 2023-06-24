import {fetch, CookieJar} from 'node-fetch-cookies'
import { mwImage, commonsImageQualityAssessment } from './mw-utils'

const cookieJar = new CookieJar()

function wcqsSessionToken() {
  return cookieJar.cookies.get('commons-query.wikimedia.org')?.get('wcqsSession').value
}

async function initSession() {
  console.log('Initializing Wikimedia Commons Query Service session')
  await fetch(cookieJar, 'https://commons-query.wikimedia.org', {
    credentials: 'include',
    headers: { Cookie: `wcqsOauth=${process.env.WCQS_OAUTH_TOKEN};` }
  })
}

const SPARQL = `
  SELECT ?image ?item ?label ?createdby ?depicts ?description ?url ?mime ?width ?height ?dro ?quality ?rank WITH {
    SELECT * {
      SERVICE <https://query.wikidata.org/sparql> {
        ?item (wdt:P170 | wdt:P180) wd:{{qid}};
               rdfs:label ?label;
               schema:description ?description .
        FILTER (lang(?label) = "en")
        FILTER (lang(?description) = "en")
      }
    } 
  } AS %items WHERE {
    INCLUDE %items. 
    ?image (wdt:P170 | wdt:P180) ?item;
          schema:url ?url;
          (schema:encodingFormat | wdt:P1163 ) ?mime.
    FILTER(?mime IN ('image/jpeg', 'image/png')) .
    OPTIONAL { ?image p:P180 [ps:P180 ?depicts ; wikibase:rank ?rank] . }
    OPTIONAL { ?image p:P170 ?createdby . }
    OPTIONAL { ?image (schema:width | wdt:P2049) ?width . }
    OPTIONAL { ?image (schema:height | wdt:P2048) ?height . }
    OPTIONAL { ?image wdt:P6243 ?dro . }
    OPTIONAL { ?image wdt:P6731 ?quality . }
  }`

export async function handler(event) {

  if (!wcqsSessionToken()) await initSession()

  const qid = event.path.split('/').filter(pe => pe).pop()
  let query = SPARQL.replace(/{{qid}}/g, qid).trim()

  let resp = await fetch(cookieJar, `https://commons-query.wikimedia.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/sparql-results+json'}
  })
  .catch(err => console.log(err))
  if (!resp.ok) return { statusCode: resp.status, body: resp.statusText }

  resp = await resp.json()
  let data = {}
  resp.results.bindings.map(b => {

    let id = b.image.value.split('/').pop()
    let file = decodeURIComponent(b.url.value.split('/').pop())
    if (!data[id]) data[id] = {
      id,
      source: 'wd',
      thumbnail: mwImage(file, 300),
      width: parseInt(b.width.value),
      height: parseInt(b.height.value),
      aspect_ratio: Number((parseInt(b.width.value)/parseInt(b.height.value)).toFixed(4)),
      format: b.mime.value,
      file,
      depicts: {}
    }
    if (b.label?.value) data[id].title = b.label.value
    if (b.description?.value) data[id].description = b.description.value
    if (b.createdby) data[id].createdBy = true
    if (b.quality?.value) data[id].imageQualityAssessment = commonsImageQualityAssessment[b.quality.value.split('/').pop()]
    
    let depicted = b.depicts?.value.split('/').pop()
    if (depicted) {
      data[id].depicts[depicted] = { id: depicted }
      if (b.rank?.value.split('#').pop().replace('Rank', '') === 'Preferred') data[id].depicts[depicted].prominent = true
      if (b.dro?.value.split('/').pop() === depicted) data[id].depicts[depicted].dro = true
    }
    
  })

  return { statusCode: 200, body: JSON.stringify(Object.values(data))}
}