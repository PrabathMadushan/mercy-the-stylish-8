import "./style.css";
import { route, startRouter } from "./router";
import { store } from "./store";
import { HomePage } from "./pages/Home";
import { ProductPage } from "./pages/Product";
import { CartPage } from "./pages/Cart";
import { CheckoutPage } from "./pages/Checkout";
import { OrdersPage } from "./pages/Orders";
import { AccountPage } from "./pages/Account";
import { DashboardPage } from "./pages/Dashboard";

async function bootstrap() {
  await store.init();

  route("/", HomePage);
  route("/product/:id", ProductPage);
  route("/cart", CartPage);
  route("/checkout", CheckoutPage);
  route("/orders", OrdersPage);
  route("/account", AccountPage);
  route("/dashboard", DashboardPage);

  startRouter();
}

bootstrap();
