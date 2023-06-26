const { Storage } = require('@google-cloud/storage')

const storage = new Storage({
  projectId: 'visual-essays',
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.split("\\n").join("\n")
  }
})

const BUCKET_NAME = 'juncture-search'

async function fileExists(qid) {
  return await storage.bucket(BUCKET_NAME).file(`${qid}.json`).exists()
}

async function readFilefromCloudStorage(qid) {
  const contents = await storage.bucket(BUCKET_NAME).file(`${qid}.json`).download()
  return JSON.parse(contents)
}

async function writeFileToCloudStorage(qid, contents) { 
  try {
    await storage.bucket(BUCKET_NAME).file(`${qid}.json`).save(JSON.stringify(contents))
  } catch(e) {
    console.log(e);
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
      console.log('PUT', event.body)
      writeFileToCloudStorage(qid, JSON.parse(event.body))
      let statusCode = 201 // created
      // let statusCode = 204 // no content
      return { statusCode }
    } else {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }
  } catch (e) { 
    console.log(e)
    return { statusCode: 500, body: e.toString() }
  }
}