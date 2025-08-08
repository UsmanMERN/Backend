import { port } from "./config.js"
import Logger from "./core/Logger.js"
import app from "./app.js"
import "dotenv/config"

const PORT = port ?? 8080


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  Logger.info(`Server is running on port ${PORT}`)
})
