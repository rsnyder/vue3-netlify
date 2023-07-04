import {fetch, CookieJar} from 'node-fetch-cookies'
import { mwImage, commonsImageQualityAssessment } from './mw-utils'
import { strToLicense } from '../src/lib/licenses'

const cookieJar = new CookieJar()

function wcqsSessionToken() {
  return cookieJar.cookies.get('commons-query.wikimedia.org')?.get('wcqsSession').value
}

async function initSession() {
  // console.log('Initializing Wikimedia Commons Query Service session')
  await fetch(cookieJar, 'https://commons-query.wikimedia.org', {
    credentials: 'include',
    headers: { Cookie: `wcqsOauth=${process.env.WCQS_OAUTH_TOKEN};` }
  })
}

const SPARQL = `
  SELECT DISTINCT ?image ?label ?description ?url ?license ?coords ?depicts ?rank ?dro ?quality ?width ?height ?mime WHERE { 
    ?image wdt:P180 wd:{{qid}}; 
           schema:url ?url .
    OPTIONAL { ?image rdfs:label ?label. }
    OPTIONAL { ?image schema:description ?description. }
    OPTIONAL { ?image wdt:P275 ?license . }
    OPTIONAL { ?image (wdt:P1259 | wdt:P625) ?coords . }
    OPTIONAL { ?image p:P180 [ps:P180 ?depicts; wikibase:rank ?rank] .}
    ?image (schema:encodingFormat | wdt:P1163) ?mime .
    FILTER(?mime IN ('image/jpeg', 'image/png')) .
    OPTIONAL { ?image (schema:width | wdt:P2049) ?width . }
    OPTIONAL { ?image (schema:height | wdt:P2048) ?height . }
    OPTIONAL { ?image wdt:P6243 ?dro . }
    OPTIONAL { ?image wdt:P6731 ?quality . }
  }
  LIMIT 2000`

export async function handler(event) {
  
  if (!wcqsSessionToken()) await initSession()

  const qid = event.path.split('/').filter(pe => pe).pop()
  let query = SPARQL.replace(/{{qid}}/g, qid).trim()
  // console.log(query)
  let resp = await fetch(cookieJar, `https://commons-query.wikimedia.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'Juncture Image Search'
    }
  })
  let statusCode = resp.status
  
  console.log(`/api/commons: qid=${qid} status=${statusCode}`)
  if (!resp.ok) return { statusCode: resp.status, body: resp.statusText }

  resp = await resp.json()
  let data = {}
  resp.results.bindings.map(b => {

    try {
      let id = b.image.value.split('/').pop()
      let file = decodeURIComponent(b.url.value.split('/').pop())
      if (!data[id]) data[id] = {
        id,
        detail_url: `https://commons.wikimedia.org/wiki/File:${file.replace(/ /g, '_').replace(/\?/g,'%3F')}`,
        source: 'wc',
        thumbnail: mwImage(file, 300),
        width: parseInt(b.width.value),
        height: parseInt(b.height.value),
        aspect_ratio: Number((parseInt(b.width.value)/parseInt(b.height.value)).toFixed(4)),
        format: b.mime.value,
        file,
        depicts: {},
        raw: b
      }

      let licenseStr = b.license?.value ||'PD'
      let license = strToLicense(licenseStr)
      data[id].license = license

      if (b.coords?.value) data[id].coords = b.coords.value.replace(/Point\(/, '').replace(/\)/, '').split(' ').map(c => Number(c).toFixed(4))
      if (b.label?.value) data[id].title = b.label.value
      if (b.description?.value) data[id].description = b.description.value
      if (b.quality?.value) data[id].imageQualityAssessment = commonsImageQualityAssessment[b.quality.value.split('/').pop()]

      let depicted = b.depicts?.value.split('/').pop()
      if (depicted) {
        data[id].depicts[depicted] = { id: depicted }
        if (b.rank?.value.split('#').pop().replace('Rank', '') === 'Preferred') data[id].depicts[depicted].prominent = true
        if (b.dro?.value.split('/').pop() === depicted) data[id].depicts[depicted].dro = true
      }
    } catch (e) {
      console.trace(e)
      console.log(b)
    }
  })

  return { statusCode: 200, body: JSON.stringify(Object.values(data))}
}