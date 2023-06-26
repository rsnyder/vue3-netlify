const { Storage } = require('@google-cloud/storage')

const client_email = process.env.GCP_CLIENT_EMAIL
const private_key = process.env.GCP_PRIVATE_KEY.split('\\n').join('\n')

console.log(`client_email=${client_email}`)
console.log(`private_key=${private_key}`)

const BUCKET_NAME = 'juncture-search'

async function readFilefromCloudStorage(qid) {
  const storage = new Storage({projectId: 'visual-essays', credentials: { client_email, private_key } })
  const contents = await storage.bucket(BUCKET_NAME).file(`${qid}.json`).download()
  return JSON.parse(contents)
}

async function writeFileToCloudStorage(qid, contents) { 
  try {
    console.log('writing file', `${BUCKET_NAME}/${qid}.json`, contents)
    const storage = new Storage({projectId: 'visual-essays', credentials: { client_email, private_key } })
    await storage.bucket(BUCKET_NAME).file(`${qid}.json`).save(JSON.stringify(contents))
    console.log('writing file - success')
    return true
  } catch(e) {
    console.log('error writing file')
    console.log(e);
    return false
 }
}

export async function handler(event, context, callback) {

  try {
    const pathElems = event.path.split('/').filter(pe => pe)
    const qid = pathElems.pop()

    if (event.httpMethod === 'GET') {
      try {
        let data = await readFilefromCloudStorage(qid)
        return { statusCode: 200, body: JSON.stringify(data) }
      } catch(e) {
        return { statusCode: 404, body: e.toString() }
      }
    } else if (event.httpMethod === 'PUT') {
      return { statusCode: writeFileToCloudStorage(qid, JSON.parse(event.body)) ? 200 : 500 }
    } else {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }
  } catch (e) { 
    console.log(e)
    return { statusCode: 500, body: e.toString() }
  }
}