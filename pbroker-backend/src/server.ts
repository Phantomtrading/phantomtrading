import "dotenv/config";
import app from "./app.js";
import "./cron-job/arbitrageRoi.cron.js"
const PORT = process.env.PORT||4000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

