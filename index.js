const Koa = require("koa");
const koaStatic = require("koa-static");
const { resolve } = require("path");
const router = require("./router");

const app = new Koa();
app.use(koaStatic(resolve(__dirname, "./public")));
app.use(router.routes(), router.allowedMethods());
app.listen(3000, function () {
    console.log("listening on port 3000, visiting http://localhost:3000");
});
