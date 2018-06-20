import watch from 'node-watch'
import rp from 'request-promise'
import fileUrl from 'file-url'
import fs from 'fs'
import sharp from 'sharp'
import jimp from 'jimp'
import config from 'config'

//const watchFile = '../card-builder/card.html'
//const watchFileUrl = fileUrl(watchFile)
const watcherConfig = config.watcher

const htmlFileUrl = fileUrl(watcherConfig.cardHtml)
const extensionUrl = `${watcherConfig.extensionServer}:${watcherConfig.extensionServerPort}`

console.log(extensionUrl)

let tab

async function callChromeApi(tabId, fn, args) {
  const reqBody = { tabId, fn, args }

  const options = {
    method: 'POST',
    uri: `${extensionUrl}/generic`,
    body: reqBody,
    json: true
  }

  return rp(options)
}

async function initialize() {
  console.log('Initializing tab')
  try {
    tab = await callChromeApi(null, 'chrome.tabs.create', [{ url: htmlFileUrl }])
    watchHtml()
  } catch (err) {
    console.log('Errored on connection')
    console.log(err)
    setTimeout(initialize, 750)
  }
}

function watchHtml() {
  watch(watcherConfig.cardDetail, { recursive: true }, async function() {
    if (!tab.id) {
      throw new Error('tab has not been initialized')
    }
    console.log('tabid :' + tab.id)

    await callChromeApi(tab.id, 'chrome.tabs.reload', [tab.id, {}])
    await callChromeApi(tab.id, 'chrome.tabs.update', [tab.id, { active: true, highlighted: true }])
    const capture = await callChromeApi(tab.id, 'chrome.tabs.captureVisibleTab', [tab.windowId, { format: 'png' }])

    const cardHtml = fs.readFileSync(watcherConfig.cardHtml, 'utf-8')
    const { left, top, width, height, name } = JSON.parse(fs.readFileSync(watcherConfig.cardDetail, 'utf-8'))

    const base64Buffer = decodeBase64Image(capture)
    console.log(base64Buffer)

    const transparentPixelDecimal = parseInt('ff4bff00', 16)
    sharp(base64Buffer.data)
    .extract({ left, top, width, height })
    .png()
    .toBuffer()
    .then( (data) => {
      jimp.read(data)
      .then( (jimpImg) => {
        console.log(jimpImg.bitmap.width)
        console.log(jimpImg.bitmap.height)
        for (let x = 0; x < jimpImg.bitmap.width; ++x) {
          for (let y = 0; y < jimpImg.bitmap.height; ++y) {
            const pixelHex = jimpImg.getPixelColor(x, y).toString(16)
            if (pixelHex == `${watcherConfig.transparentColor}ff`) {
              jimpImg.setPixelColor(transparentPixelDecimal, x, y)
            }
          }
        }
        jimpImg.write(`${watcherConfig.outputPath}/${name}.jpg`)
      })
    })
  })
}

function decodeBase64Image(dataString) {
  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    const response = {}

    if (matches.length !== 3) {
      return new Error('Invalid input string')
    }

    response.type = matches[1]
    response.data = new Buffer(matches[2], 'base64')

    return response
  } catch (err) {
    console.log(err)
    console.log(dataString)
  }
}

initialize()
