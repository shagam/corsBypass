const fs = require("fs")

async function image (app) {

    console.log ('image')
    app.get("/download", async function (request, result) {

    console.log ('params=', request.params)
    const img = request.params.img
    // const image = await db.collection("../images")
    //     .findOne({
    //     name: name
    //     })
    if (true) {
        let defaultImage = await fs.readFileSync("./downloads/QQQ_call_options.jpg")
        defaultImage = Buffer.from(defaultImage, "base64")
        
        result.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Length": defaultImage.length
        })
        result.end(defaultImage)
        return
    }
    
      const imageContent = await fs.readFileSync(image.path)
    
      result.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Length": imageContent.length
      })
      result.end(imageContent)
      return
    })
}

  module.exports = {image}