import watch from 'node-watch'
import rp from 'request-promise'
import fileUrl from 'file-url'
import fs from 'fs'
import sharp from 'sharp'
import jimp from 'jimp'

const watchFile = '../card-builder/card.html'
const watchFileUrl = fileUrl(watchFile)

const extensionServer = 'http://localhost'
const extensionServerPort = 9250
const extensionUrl = `${extensionServer}:${extensionServerPort}`

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
  tab = await callChromeApi(null, 'chrome.tabs.create', [{ url: watchFileUrl }])
}

watch(watchFile, { recursive: true }, async function() {
  if (!tab.id) {
    throw new Error('tab has not been initialized')
  }

  await callChromeApi(tab.id, 'chrome.tabs.reload', [tab.id, {}])
  await callChromeApi(tab.id, 'chrome.tabs.update', [tab.id, { active: true, highlighted: true }])
  const capture = await callChromeApi(tab.id, 'chrome.tabs.captureVisibleTab', [tab.windowId, { format: 'png' }])

  let boundingArray
  const cardHtml = fs.readFileSync('../card-builder/card.html', 'utf-8')
  if (cardHtml.startsWith('<!--')) {
    const sHtml = cardHtml.split(' -->')
    boundingArray = sHtml[0].replace('<!-- ', '').split(', ')
    for( const [index, bound] of boundingArray.entries()) {
      boundingArray[index] = Number(boundingArray[index])
    }
    console.log('WE HAVE FOUND THE BOUDNING ARRAAY!! WOOHOO')
    console.log(boundingArray)
  }

  const base64Buffer = decodeBase64Image(capture)
  console.log(base64Buffer)

  if (boundingArray) {
    const transparentPixelDecimal = parseInt('ff4bff00', 16)
    console.log(boundingArray)
    sharp(base64Buffer.data)
      .extract({ left: boundingArray[0], top: boundingArray[1], width: boundingArray[2], height: boundingArray[3] })
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
              if (pixelHex == 'ff4bffff') {
                jimpImg.setPixelColor(transparentPixelDecimal, x, y)
              }
              //console.log(jimpImg.getPixelColor(x, y).toString(16))
            }
          }
          jimpImg.write('./out.png')
        })
      })
      //.toFile(__dirname + '/out.png', function(err, info) {
      //  if(err) {
      //    console.log(err)
      //  }
      //  console.log('Successfully used sharp?')
      //})
  //} else {
  //  sharp(base64Buffer.data)
  //    .trim()
  //    .toFile(__dirname + '/out.png', function(err, info) {
  //      if(err) {
  //        console.log(err)
  //      }
  //      console.log('Successfully used sharp?')
  //    })
  //}
  }
})

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
