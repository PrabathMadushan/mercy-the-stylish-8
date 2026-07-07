import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT || 4100;

app.listen(PORT, () => {
  console.log(`Mercy the Stylish AI server listening on port ${PORT}`);
});
