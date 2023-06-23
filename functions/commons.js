import {fetch, CookieJar} from 'node-fetch-cookies'
import md5 from 'js-md5'

const cookieJar = new CookieJar()

const wcDepictsItemsSPARQL = `
SELECT DISTINCT ?image ?label ?description ?url ?createdby ?depicts ?rank ?dro ?quality ?width ?height ?mime WHERE { 
  ?image (wdt:P170 | wdt:P180) wd:{{qid}}; 
         schema:url ?url .
  OPTIONAL { ?image rdfs:label ?label. }
  OPTIONAL { ?image schema:description ?description. }
  OPTIONAL { ?image p:P170 ?createdby. }
  OPTIONAL { ?image p:P180 [ps:P180 ?depicts; wikibase:rank ?rank] .}
  ?image (schema:encodingFormat | wdt:P1163) ?mime .
  FILTER(?mime IN ('image/jpeg', 'image/png')) .
  OPTIONAL { ?image (schema:width | wdt:P2049) ?width . }
  OPTIONAL { ?image (schema:height | wdt:P2048) ?height . }
  OPTIONAL { ?image wdt:P6243 ?dro . }
  OPTIONAL { ?image wdt:P6731 ?quality . }
}`

const wdDepictsItemsSPARQL = `
SELECT ?image ?item ?label ?createdby ?depicts ?description ?url ?mime ?width ?height ?dro ?quality ?rank WITH {
  SELECT * {
    SERVICE <https://query.wikidata.org/sparql> {
      ?item (wdt:P170 | wdt:P180) wd:{{qid}};
                rdfs:label ?label;
                schema:description ?description.
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

commonsImageQualityAssessment = {
  'Q63348049': 'featured',
  'Q63348069': 'quality',
  'Q63348040': 'valued'
}

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

function mwImage(mwImg, width) {
  // Converts Wikimedia commons image URL to a thumbnail link
  mwImg = decodeURIComponent(mwImg).replace(/ /g,'_')
  const _md5 = md5(mwImg)
  const extension = mwImg.split('.').pop()
  let url = `https://upload.wikimedia.org/wikipedia/commons${width ? '/thumb' : ''}`
  url += `/${_md5.slice(0,1)}/${_md5.slice(0,2)}/${mwImg}`
  if (width) {
    url += `/${width}px-${mwImg}`
    if (extension === 'svg') {
      url += '.png'
    } else if (extension === 'tif' || extension === 'tiff') {
      url += '.jpg'
    }
  }
  return url
}

export async function handler(event, context, callback) {
  if (!wcqsSessionToken()) await initSession()

  const pathElems = event.path.split('/').filter(pe => pe)
  const qid = pathElems.pop()
  const prefix = pathElems.pop()

  let query = prefix === 'wd'
    ? wdDepictsItemsSPARQL.replace(/{{qid}}/g, qid).trim()
    : wcDepictsItemsSPARQL.replace(/{{qid}}/g, qid).trim()
  // console.log(query)
  let url = `https://commons-query.wikimedia.org/sparql?query=${encodeURIComponent(query)}`
  let resp = await fetch(cookieJar, url, {
    headers: { Accept: 'application/sparql-results+json'}
  })
  .catch(err => {
    console.log(err)
  })
  if (resp.ok) {
    resp = await resp.json()
    let data = {}
    resp.results.bindings.map(b => {
      let id = b.image.value.split('/').pop()
      let file = decodeURIComponent(b.url.value.split('/').pop())
      if (!data[id]) data[id] = {
        id,
        thumbnail: mwImage(file, 300),
        width: parseInt(b.width.value),
        height: parseInt(b.height.value),
        aspect_ratio: Number((parseInt(b.width.value)/parseInt(b.height.value)).toFixed(4)),
        format: b.mime.value,
        file,
        depicts: {}
      }
      if (b.label?.value) data[id].label = b.label.value
      if (b.description?.value) data[id].description = b.description.value
      let depicted = b.depicts?.value.split('/').pop()
      if (depicted) {
        data[id].depicts[depicted] = { id: depicted }
        if (b.rank?.value.split('#').pop().replace('Rank', '') === 'Preferred') data[id].depicts[depicted].prominent = true
        if (b.dro?.value.split('/').pop() === depicted) data[id].depicts[depicted].dro = true
      }
      if (b.createdby) data[id].createdBy = true

      if (b.quality?.value) data[id].imageQualityAssessment = commonsImageQualityAssessment[b.quality.value.split('/').pop()]
    })
    let values = Object.values(data).map(img => {
      img.score = 0
      img.depicts = Object.values(img.depicts)
      let depicted = img.depicts.find(d => d.id === qid)
      if (depicted?.dro) img.score += 5
      else if (depicted?.prominent) img.score += 2
      if (img.imageQualityAssessment === 'featured') img.score += 3
      else if (img.imageQualityAssessment === 'quality') img.score += 2
      else if (img.imageQualityAssessment === 'valued') img.score += 1
      return img
    })

    return { statusCode: 200, body: JSON.stringify(values)}
  } else {
    initSession()
  }
}