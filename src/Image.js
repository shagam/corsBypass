const fs = require("fs")

async function image (app) {

    app.get("/download", async function (request, result) {

    console.log ('Download image, params=', request.query)

      if (true) {
        let defaultImage = await fs.readFileSync("./downloads/" + request.query.img)
        defaultImage = Buffer.from(defaultImage, "base64")
        
        result.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Length": defaultImage.length
        })
        result.end(defaultImage)
        return
    }
    
    }
  )
}

  module.exports = {image}